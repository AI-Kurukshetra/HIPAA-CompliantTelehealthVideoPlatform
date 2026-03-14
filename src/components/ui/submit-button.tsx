"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  idleText: string;
  pendingText?: string;
  spinnerClassName?: string;
};

export function SubmitButton({
  idleText,
  pendingText = "Processing...",
  spinnerClassName = "border-white/40 border-t-white",
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {pending ? (
        <>
          <span className={`h-4 w-4 animate-spin rounded-full border-2 ${spinnerClassName}`} />
          {pendingText}
        </>
      ) : (
        idleText
      )}
    </button>
  );
}
