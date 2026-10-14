"use client"

import React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  spinnerPosition?: "left" | "right"
  children?: React.ReactNode
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      loading = false,
      children,
      className = "",
      type = "button",
      disabled = false,
      spinnerPosition = "left",
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        size={size}
        disabled={loading || disabled}
        className={cn("cursor-pointer gap-2", className)}
        {...props}
      >
        {loading && spinnerPosition === "left" && (
          <Spinner className="h-4 w-4" />
        )}
        {children}
        {loading && spinnerPosition === "right" && (
          <Spinner className="h-4 w-4" />
        )}
      </Button>
    )
  }
)

CustomButton.displayName = "CustomButton"

export default CustomButton
export { CustomButton }
