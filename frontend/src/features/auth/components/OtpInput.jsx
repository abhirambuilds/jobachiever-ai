import { useRef } from 'react';

export function OtpInput({ value = '', onChange, disabled = false, hasError = false }) {
  const inputRefs = useRef([]);

  // Convert current 6-char string into array of 6 chars
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (index, e) => {
    const char = e.target.value.slice(-1); // grab the latest typed character
    if (!/^\d*$/.test(char)) return; // numbers only

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextValue = newDigits.join('').slice(0, 6);
    onChange(nextValue);

    // Auto-focus next input if a digit was entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{1,6}$/.test(pastedData)) {
      const fullValue = pastedData.slice(0, 6);
      onChange(fullValue);
      const targetIndex = Math.min(fullValue.length, 5);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          aria-label={`Verification code digit ${idx + 1}`}
          className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl text-center font-mono text-xl font-bold transition-all duration-150 outline-none ${
            hasError
              ? 'border-2 border-destructive bg-destructive/5 text-destructive focus:ring-2 focus:ring-destructive/30'
              : digit
              ? 'border-2 border-primary bg-primary/5 text-foreground shadow-sm'
              : 'border border-border/80 bg-background/60 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
