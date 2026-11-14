import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { resetPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/services/authService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        token: 'simulated-token',
        newPassword: data.password,
      });
      setIsSuccess(true);
      toast.success(response.message || 'Password successfully updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Set a New Secure Password"
      subtitle="Update your master account credentials to maintain data isolation and access security."
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-2">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Reset Password
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Choose a strong, unique password to protect your career milestones and documents.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* New Password */}
                <div className="space-y-1.5">
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      leftIcon={Lock}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={passwordValue} />
                </div>

                {/* Confirm New Password */}
                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    leftIcon={Lock}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="ai"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Updating Password..."
                  className="w-full gap-2 font-semibold shadow-glow-sm"
                >
                  <span>Update Password</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Password Reset Complete</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your password has been successfully updated. You can now authenticate with your
                    new credentials.
                  </p>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-full gap-2 font-semibold"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground justify-center">
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
