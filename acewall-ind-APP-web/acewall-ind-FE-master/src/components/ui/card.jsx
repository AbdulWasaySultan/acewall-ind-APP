import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card"
      className={cn(
        " text-gray-900 flex flex-col gap-4 rounded-xl border border-gray-200 py-6 shadow-md transition-transform transform hover:shadow-lg", className
      )}
      {...props} />)
  );
}



function CardHeader({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props} />)
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-title"
      className={cn("text-xl font-bold text-gray-900 ", className)}
      {...props} />)
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />)
  );
}

function CardContent({
  className,
  ...props
}) {
  return (<div data-slot="card-content" className={cn("px-6", className)} {...props} />);
}

function CardFooter({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props} />)
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
