"use client";

import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
      />
    </div>
  );
}
