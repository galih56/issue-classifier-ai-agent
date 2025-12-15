
import { cn } from "@/lib/utils"
import type { JSX } from "solid-js"

function Input({ name, placeholder, class: className, type, required, autoFocus, ...props }: JSX.InputHTMLAttributes<HTMLInputElement> & {
  name?: string,
  placeholder?: string,
  type?: string,
  required?: boolean | undefined,
  autoFocus?: boolean | undefined
}) {
  return (
    <input
      name={name}
      required={required}
      placeholder={placeholder}
      aria-placeholder={placeholder}
      aria-required={required}
      type={type}
      data-slot="input"
      class={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      autofocus={autoFocus}
      {...props}
    />
  )
}

export { Input }
