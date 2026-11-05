ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS created_by_user_id uuid
REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_item ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.sales, public.sale_item
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT ON TABLE public.sales TO authenticated;
GRANT INSERT ON TABLE public.sale_item TO authenticated;

DO $$
DECLARE
  sequence_name text;
BEGIN
  sequence_name := pg_get_serial_sequence('public.sales', 'id');
  IF sequence_name IS NOT NULL THEN
    EXECUTE format(
      'GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated',
      sequence_name
    );
  END IF;

  sequence_name := pg_get_serial_sequence('public.sale_item', 'id');
  IF sequence_name IS NOT NULL THEN
    EXECUTE format(
      'GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated',
      sequence_name
    );
  END IF;
END;
$$;

DROP POLICY IF EXISTS sales_select_own ON public.sales;
CREATE POLICY sales_select_own
ON public.sales
FOR SELECT
TO authenticated
USING (created_by_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sales_insert_own ON public.sales;
CREATE POLICY sales_insert_own
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (created_by_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sales_select_own_guard ON public.sales;
CREATE POLICY sales_select_own_guard
ON public.sales
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (created_by_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sales_insert_own_guard ON public.sales;
CREATE POLICY sales_insert_own_guard
ON public.sales
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (created_by_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sale_item_insert_own_sale ON public.sale_item;
CREATE POLICY sale_item_insert_own_sale
ON public.sale_item
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sales AS sale
    WHERE sale.id = sales_id
      AND sale.created_by_user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS sale_item_insert_own_sale_guard ON public.sale_item;
CREATE POLICY sale_item_insert_own_sale_guard
ON public.sale_item
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sales AS sale
    WHERE sale.id = sales_id
      AND sale.created_by_user_id = (SELECT auth.uid())
  )
);

CREATE OR REPLACE FUNCTION public.record_sale(
  p_recorded_by text,
  p_items jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  sale_item jsonb;
  item_product_id integer;
  item_quantity numeric;
  item_subtotal numeric;
  sale_total numeric := 0;
  new_sale_id bigint;
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to record a sale.'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(pg_catalog.btrim(p_recorded_by), '') IS NULL THEN
    RAISE EXCEPTION 'Recorded by is required.'
      USING ERRCODE = '22023';
  END IF;

  IF p_items IS NULL OR pg_catalog.jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Sale items must be provided as an array.'
      USING ERRCODE = '22023';
  END IF;

  IF pg_catalog.jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one sale item is required.'
      USING ERRCODE = '22023';
  END IF;

  FOR sale_item IN
    SELECT value FROM pg_catalog.jsonb_array_elements(p_items) AS items(value)
  LOOP
    IF pg_catalog.jsonb_typeof(sale_item) IS DISTINCT FROM 'object'
      OR pg_catalog.jsonb_typeof(sale_item -> 'product_id') IS DISTINCT FROM 'number'
      OR pg_catalog.jsonb_typeof(sale_item -> 'quantity') IS DISTINCT FROM 'number'
      OR pg_catalog.jsonb_typeof(sale_item -> 'subtotal') IS DISTINCT FROM 'number'
    THEN
      RAISE EXCEPTION 'Each sale item must include numeric product_id, quantity, and subtotal values.'
        USING ERRCODE = '22023';
    END IF;

    item_product_id := (sale_item ->> 'product_id')::integer;
    item_quantity := (sale_item ->> 'quantity')::numeric;
    item_subtotal := (sale_item ->> 'subtotal')::numeric;

    IF item_product_id <= 0 OR item_quantity <= 0 OR item_subtotal <= 0 THEN
      RAISE EXCEPTION 'Sale item product, quantity, and subtotal values must be positive.'
        USING ERRCODE = '22023';
    END IF;

    sale_total := sale_total + item_subtotal;
  END LOOP;

  INSERT INTO public.sales (recorded_by, total_amount, created_by_user_id)
  VALUES (pg_catalog.btrim(p_recorded_by), sale_total, current_user_id)
  RETURNING id INTO new_sale_id;

  FOR sale_item IN
    SELECT value FROM pg_catalog.jsonb_array_elements(p_items) AS items(value)
  LOOP
    INSERT INTO public.sale_item (sales_id, product_id, quantity, subtotal)
    VALUES (
      new_sale_id,
      (sale_item ->> 'product_id')::integer,
      (sale_item ->> 'quantity')::numeric,
      (sale_item ->> 'subtotal')::numeric
    );
  END LOOP;

  RETURN new_sale_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_sale(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_sale(text, jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';