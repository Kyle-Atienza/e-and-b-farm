import { Fragment } from "react";
import { Link, useMatches } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs() {
  const matches = useMatches();

  const breadcrumbs = matches.flatMap((match) => {
    const label = match.staticData.breadcrumb;
    return label ? [{ match, label }] : [];
  });

  if (!breadcrumbs.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="text-background text-lg">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs
          .filter((crumb) => crumb.label !== "Home")
          .map(({ match, label }, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Fragment key={match.id}>
                <BreadcrumbSeparator className="text-background" />

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-background text-lg">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={
                        <Link to={match.pathname} params={match.params} />
                      }
                    >
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {/* {!isLast && <BreadcrumbSeparator />} */}
              </Fragment>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
