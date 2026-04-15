import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-stretch w-full rounded-xl border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all overflow-hidden",
      className
    )}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "inline-start" | "inline-end"
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center px-3 text-gray-400 text-sm shrink-0 select-none",
        align === "inline-end" && "border-l border-gray-100 bg-gray-50/60 text-gray-500 font-medium text-xs",
        align === "inline-start" && "border-r border-gray-100 bg-gray-50/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400",
      className
    )}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

export { InputGroup, InputGroupAddon, InputGroupInput }
