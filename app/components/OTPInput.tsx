"use client";
import { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  className = ""
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    let val = element.value.replace(/\D/g, ''); // Only digits
    let otpArray = value.split('').slice(0, length);
    let nextIndex = index;

    console.log('Input value:', element.value, 'Filtered:', val, 'Index:', index);

    if (!val) {
      // If input is cleared
      otpArray[index] = '';
      onChange(otpArray.join(''));
      console.log('OTP after clear:', otpArray);
      return;
    }

    // Distribute all digits, even if typed (not just pasted)
    for (let i = 0; i < val.length && nextIndex < length; i++) {
      otpArray[nextIndex] = val[i];
      nextIndex++;
    }
    onChange(otpArray.join(''));
    console.log('OTP after input:', otpArray);

    // Move focus to the next empty input or last
    if (nextIndex < length) {
      inputRefs.current[nextIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      let otpArray = value.split('').slice(0, length);
      if (otpArray[index]) {
        // If current input has value, clear it
        otpArray[index] = '';
        onChange(otpArray.join(''));
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    const pastedArray = pastedData.split('').slice(0, length);
    onChange(pastedArray.join(''));
    // Focus the last filled input
    if (pastedArray.length > 0) {
      inputRefs.current[Math.min(pastedArray.length, length) - 1]?.focus();
    }
  };

  const otp = value.split('').slice(0, length);
  while (otp.length < length) otp.push('');

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          type="text"
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-2xl font-semibold border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 bg-blue-50 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: digit ? 'linear-gradient(135deg, #2434B3 0%, #1a2a8a 100%)' : '#EBF4FF',
            color: digit ? 'white' : '#1F2937',
            borderColor: digit ? '#2434B3' : '#BFDBFE'
          }}
        />
      ))}
    </div>
  );
} 