import { Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '../schemas/authSchemas';

export function PasswordStrengthMeter({ password = '' }) {
  const { requirements, score, label, color } = evaluatePasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2.5 pt-1 animate-in fade-in-50 duration-200">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Password Strength</span>
          <span className="font-semibold text-foreground">{label}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
          <div
            className={`h-full rounded-full transition-colors duration-300 ${
              score >= 1 ? color : 'bg-muted'
            }`}
          />
          <div
            className={`h-full rounded-full transition-colors duration-300 ${
              score >= 2 ? color : 'bg-muted'
            }`}
          />
          <div
            className={`h-full rounded-full transition-colors duration-300 ${
              score >= 3 ? color : 'bg-muted'
            }`}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center gap-1.5 transition-colors ${
              req.met ? 'text-emerald-500 font-medium' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="h-3 w-3 shrink-0 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
