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
  spinnerClassName = "border-white/60 border-t-white",
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
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
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
