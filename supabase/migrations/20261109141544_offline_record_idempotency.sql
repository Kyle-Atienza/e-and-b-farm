ALTER TABLE public.harvest_records
  ADD COLUMN IF NOT EXISTS client_request_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS harvest_records_client_request_id_key
  ON public.harvest_records (client_request_id);

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS client_request_id uuid,
  ADD COLUMN IF NOT EXISTS client_request_hash text,
  ADD CONSTRAINT sales_user_client_request_key
    UNIQUE (created_by_user_id, client_request_id);

DROP FUNCTION IF EXISTS public.record_sale(text, jsonb);

CREATE OR REPLACE FUNCTION public.record_sale(
  p_recorded_by text,
  p_items jsonb,
  p_client_request_id uuid DEFAULT NULL
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
  existing_request_hash text;
  request_hash text;
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

  IF p_client_request_id IS NOT NULL THEN
    request_hash := pg_catalog.md5(
      pg_catalog.btrim(p_recorded_by) || E'\n' || p_items::text
    );
  END IF;

  INSERT INTO public.sales (
    recorded_by,
    total_amount,
    created_by_user_id,
    client_request_id,
    client_request_hash
  )
  VALUES (
    pg_catalog.btrim(p_recorded_by),
    sale_total,
    current_user_id,
    p_client_request_id,
    request_hash
  )
  ON CONFLICT (created_by_user_id, client_request_id) DO NOTHING
  RETURNING id INTO new_sale_id;

  IF new_sale_id IS NULL THEN
    SELECT id, client_request_hash
    INTO new_sale_id, existing_request_hash
    FROM public.sales
    WHERE created_by_user_id = current_user_id
      AND client_request_id = p_client_request_id;

    IF existing_request_hash IS DISTINCT FROM request_hash THEN
      RAISE EXCEPTION 'A request ID cannot be reused with different sale details.'
        USING ERRCODE = '22023';
    END IF;

    RETURN new_sale_id;
  END IF;

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

REVOKE ALL ON FUNCTION public.record_sale(text, jsonb, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_sale(text, jsonb, uuid)
  TO authenticated;

NOTIFY pgrst, 'reload schema';