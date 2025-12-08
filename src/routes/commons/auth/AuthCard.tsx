import { type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const AuthCard = ({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) => {
  return (
    <Card className={cn("w-full max-w-md shadow-none border border-[#E7E5E4]", className)}>
      <CardHeader >
        <CardTitle className="text-center text-lg font-semibold">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pb-6">{children}</CardContent>
      {footer && (
        <CardFooter className="flex-col gap-3 border-t pt-6">{footer}</CardFooter>
      )}
    </Card>
  );
};

export default AuthCard;
