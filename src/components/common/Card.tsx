import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  className,
  title,
  description,
  footer,
  headerAction,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        "rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-card hover:shadow-card-hover transition-shadow",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="flex flex-col space-y-1.5 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {headerAction && <div>{headerAction}</div>}
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {footer && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;