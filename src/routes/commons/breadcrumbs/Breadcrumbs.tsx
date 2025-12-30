import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbItemType = {
  label: string;
  path?: string;
};

const Breadcrumbs = ({ items }: { items: BreadcrumbItemType[] }) => {
  if (!items || items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isSecondLast = index === items.length - 2;
          const shouldEllipsize =
            items.length > 3 && index > 0 && !isLast && !isSecondLast;

          if (shouldEllipsize) {
            if (index === 1) {
              return (
                <BreadcrumbItem key="ellipsis">
                  <BreadcrumbEllipsis />
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              );
            }
            return null;
          }

          return (
            <BreadcrumbItem key={item.path || index}>
              {isLast ? (
                <BreadcrumbPage className="truncate max-w-[200px]">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={item.path || "#"}>{item.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
