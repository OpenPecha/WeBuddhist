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
    <Card className={cn("w-full max-w-md shadow-none border-3 border-[#EAEAEB]", className)}>
      <CardHeader >
        <CardTitle className="text-center text-xl font-semibold">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center text-base">
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
