"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

export default function OtpInput({ length = 6, onComplete }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusNextInput = (index: number) => {
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrevInput = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace") {
      if (!otp[index]) {
        focusPrevInput(index);
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take the last character in case of multiple characters
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value) {
      focusNextInput(index);
    }

    // Check if OTP is complete
    if (newOtp.every(v => v) && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((value, index) => {
      if (index < length) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or first empty input
    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    if (newOtp.every(v => v) && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(e, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={el => {
            if (inputRefs.current) {
              inputRefs.current[index] = el;
            }
          }}
          className="w-12 h-12 text-center text-xl font-semibold border rounded-lg 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white
                   transition-all duration-200"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
