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
      <label className="text-sm font-medium text-white" htmlFor={name}>
        {label}
      </label>
      <input
        className="rounded-lg px-4 py-3 bg-navy-700/50 backdrop-blur-sm border border-cyan-400/20 text-white w-full mt-2 placeholder-navy-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
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
      <label className="text-sm font-medium text-white" htmlFor={name}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          className="rounded-lg px-4 py-3 bg-navy-700/50 backdrop-blur-sm border border-cyan-400/20 text-white w-full pr-12 placeholder-navy-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-cyan-400 transition-colors duration-300"
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
    "rounded-lg px-6 py-3 text-white mb-4 font-medium transition-all duration-300 w-full";
  const defaultColors = "bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

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
      {isPending ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {pendingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export { EmailInput, PasswordInput, AuthButton };
