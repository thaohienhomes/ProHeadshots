"use client";
import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";

interface InputProps {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}

const EmailInput: React.FC<InputProps> = ({ label, name, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="text-md" htmlFor={name}>
        {label}
      </label>
      <input
        className="rounded-md px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 w-full mt-1"
        type="email"
        name={name}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

const PasswordInput: React.FC<InputProps> = ({ label, name, placeholder }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="mb-4">
      <label className="text-md" htmlFor={name}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          className="rounded-md px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 w-full pr-10"
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

type AuthButtonProps = ComponentProps<"button"> & {
  pendingText?: string;
};

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  pendingText,
  className = "",
  ...props
}) => {
  const { pending, action } = useFormStatus();
  const isPending = pending && action === props.formAction;

  const defaultClasses =
    "rounded-md px-4 py-2 text-white mb-2 transition-colors";
  const defaultColors = "bg-mainBlack hover:bg-opacity-80";

  const buttonClasses = className
    ? `${defaultClasses} ${className}`
    : `${defaultClasses} ${defaultColors}`;

  return (
    <button
      {...props}
      className={buttonClasses}
      type="submit"
      disabled={pending}
    >
      {isPending ? pendingText : children}
    </button>
  );
};

export { EmailInput, PasswordInput, AuthButton };
