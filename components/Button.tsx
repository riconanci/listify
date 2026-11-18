"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { forwardRef, ButtonHTMLAttributes } from "react";

type Variant = "filled" | "tinted" | "plain" | "gray" | "destructive";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

type LinkButtonProps = BaseProps & {
  href: string;
  external?: boolean;
};

const variantClasses: Record<Variant, string> = {
  filled:
    "bg-primary text-white active:bg-primary-dark disabled:bg-slate-700 disabled:text-slate-400",
  tinted:
    "bg-primary/15 text-primary active:bg-primary/25 disabled:bg-slate-800 disabled:text-slate-500",
  plain:
    "bg-transparent text-primary active:bg-primary/10 disabled:text-slate-500",
  gray: "bg-slate-700/60 text-white active:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-500",
  destructive:
    "bg-status-danger text-white active:bg-red-600 disabled:bg-slate-700 disabled:text-slate-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[14px] rounded-full gap-1.5",
  md: "h-11 px-5 text-[15px] rounded-full gap-2",
  lg: "h-13 px-6 text-[17px] rounded-full gap-2",
};

function getClasses({
  variant = "filled",
  size = "md",
  fullWidth,
  className,
}: Pick<BaseProps, "variant" | "size" | "fullWidth" | "className">) {
  return clsx(
    "inline-flex items-center justify-center font-semibold transition-all ios-press disabled:opacity-50 disabled:active:transform-none disabled:active:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "filled",
    size = "md",
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={getClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
});

export function LinkButton({
  variant = "filled",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  href,
  external,
  children,
  className,
}: LinkButtonProps) {
  const classes = getClasses({ variant, size, fullWidth, className });

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  );
}

export default Button;
