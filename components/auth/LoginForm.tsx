"use client";

import { useState } from "react";
import OtpInput from "./OtpInput";

interface LoginFormProps {
  onLogin?: (phone: string, otp: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    
    setIsLoading(true);
    // TODO: Integrate with backend to send OTP
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOtp(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpComplete = async (otp: string) => {
    setIsLoading(true);
    // TODO: Integrate with backend to verify OTP
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin?.(phone, otp);
    } catch (error) {
      console.error("Failed to verify OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showOtp ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || phone.length < 10}
            className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition duration-200"
          >
            {isLoading ? "Sending OTP..." : "Get OTP"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the OTP sent to {phone}
            </p>
            <button
              onClick={() => setShowOtp(false)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Change number
            </button>
          </div>
          <OtpInput onComplete={handleOtpComplete} />
          {isLoading && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Verifying OTP...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
