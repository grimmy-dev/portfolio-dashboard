import { cn } from "@/lib/utils";
import React from "react";

type MaxWidthWrapperProps = {
  className?: string;
  children: React.ReactNode;
};

const MaxWidthWrapper = ({ children, className }: MaxWidthWrapperProps) => {
  return (
    <div className={cn("max-w-screen-3xl mx-auto px-4 md:px-24 w-full", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
