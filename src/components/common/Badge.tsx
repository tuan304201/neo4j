import React from 'react';
import { twMerge } from 'tailwind-merge';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
        secondary: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300",
        success: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300",
        warning: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300",
        error: "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300",
        outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant, 
  size, 
  ...props 
}) => {
  return (
    <div
      className={twMerge(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
};

export default Badge;