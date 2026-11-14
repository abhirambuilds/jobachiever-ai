import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { OtpInput } from '@/features/auth/components/OtpInput';
import { authService } from '@/services/authService';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email passed via state from registration, or fallback
  const email = location.state?.email || 'user@example.com';

  const maskEmail = (str) => {
    const parts = str.split('@');
    if (parts.length !== 2) return str;
    const name = parts[0];
    const domain = parts[1];
    const maskedName =
      name.length <= 2
        ? name + '***'
        : name.slice(0, 1) + '***' + name.slice(-1);
    return `${maskedName}@${domain}`;
  };

  const [otp, setOtp] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6) {
      setHasError(true);
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setHasError(false);
    setErrorMessage('');
    setIsVerifying(true);

    try {
      const response = await authService.verifyOtp({ email, otp });
      toast.success(response.message || 'Email successfully verified!');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setHasError(true);
      setErrorMessage(err.message || 'Invalid verification code. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      const response = await authService.resendOtp(email);
      toast.success(response.message);
      setCountdown(60);
      setOtp('');
      setHasError(false);
      setErrorMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      headline="Confirm Your Account Ownership"
      subtitle="Strict human verification ensures your career graph is authentically linked to your verified credentials."
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <MailCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              We have prepared a 6-digit confirmation code for{' '}
              <span className="font-semibold text-foreground">{maskEmail(email)}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Development Simulation Notice */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <Badge variant="ai" className="text-[9px] px-1.5 py-0">
                  Dev Simulation
                </Badge>
                <span>Milestone 4 Testing Guidance</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Enter any 6 digits (e.g. <span className="font-mono text-foreground font-semibold">123456</span>) to verify.
                Enter <span className="font-mono text-foreground font-semibold">000000</span> to test invalid OTP error handling.
              </p>
            </div>

            {/* OTP Input Component */}
            <div className="space-y-2">
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (hasError) {
                    setHasError(false);
                    setErrorMessage('');
                  }
                }}
                disabled={isVerifying}
                hasError={hasError}
              />

              {hasError && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-in fade-in-50 duration-150">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Submit Verification Button */}
            <Button
              type="button"
              variant="ai"
              size="lg"
              onClick={handleVerify}
              isLoading={isVerifying}
              loadingText="Verifying Code..."
              className="w-full gap-2 font-semibold shadow-glow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Verify & Continue</span>
            </Button>

            {/* Resend Code Section */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Change email or re-register</span>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
