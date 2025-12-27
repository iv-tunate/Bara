"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline" | "danger" | "secondary";
  fullWidth?: boolean;
}

export default function LoadingButton({
  children,
  loading = false,
  variant = "primary",
  fullWidth = false,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-6 py-2 font-semibold rounded-md transition focus:outline-none";

  const variantStyles = {
    primary:
      "bg-[#810306] text-white hover:bg-[#6d0205] disabled:bg-[#F5F5F5] disabled:text-[#858990]",
    outline:
      "border-2 border-[#810306] text-[#810306] hover:bg-[#810306] hover:text-white disabled:border-gray-300 disabled:text-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 disabled:text-gray-100",
    secondary:
      "bg-[#F59E0B] text-white hover:bg-[#D97706] disabled:bg-gray-200 disabled:text-gray-400",
  };

  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l3 3-3 3v-4a8 8 0 01-8-8z"
          ></path>
        </svg>
      )}
      {loading ? "Processing..." : children}
    </button>
  );
}
