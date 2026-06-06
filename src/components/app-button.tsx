import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        danger:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        md: "h-9 px-4 text-sm [&_svg]:size-4",
        lg: "h-11 px-6 text-base [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
    (
        {
            className,
            variant,
            size,
            isLoading = false,
            loadingText,
            leftIcon,
            rightIcon,
            disabled,
            children,
            type = "button",
            ...props
        },
        ref,
    ) =>{
        return(
            <button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            className={cn(buttonVariants({variant, size}), className)}
            {...props}
            >
                {isLoading ? (
                    <>
                    <Loader2 className="animate-spin" aria-hidden="true"></Loader2>
                    <span>{loadingText ?? children}</span>
                    </>
                ): (
                    <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                    </>
                )}
            </button>
        );
    },
);

AppButton.displayName = "AppButton";

export {buttonVariants};