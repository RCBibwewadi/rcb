import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = ({ label, className = "", ...props }: TextareaProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-3 border border-rose-tan-light rounded-lg 
          focus:ring-2 focus:ring-rose-tan focus:border-transparent resize-none
          ${className}`}
      />
    </div>
  );
};
