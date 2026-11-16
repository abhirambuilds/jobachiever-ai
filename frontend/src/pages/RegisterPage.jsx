import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { registerSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/services/authService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      toast.success(response.message || 'Account created successfully!');
      setIsSuccess(true);
      setCreatedEmail(data.email);
      setTimeout(() => {
        navigate('/login', { state: { email: data.email } });
      }, 2200);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Create Your Master Career Account"
      subtitle="Establish your master profile graph, configure your career tracks, and empower your job search."
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/80 bg-card/85 shadow-2xl backdrop-blur-xl">
          {isSuccess ? (
            <CardContent className="p-8 text-center space-y-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow-sm"
              >
                <CheckCircle2 className="h-9 w-9 text-emerald-400" />
              </motion.div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Account Created Successfully!
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Your Master Career Profile workspace has been provisioned in PostgreSQL. Redirecting to sign in with <span className="font-semibold text-foreground">{createdEmail}</span>...
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="ai"
                  size="lg"
                  onClick={() => navigate('/login', { state: { email: createdEmail } })}
                  className="w-full gap-2 font-semibold shadow-glow-sm"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1.5 pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Get Started
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Sign up to build your truthful, AI-powered Career Operating System.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* Full Name */}
                  <Input
                    label="Full Name"
                    placeholder="e.g. Abhiram Reddy"
                    leftIcon={User}
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />

                  {/* Email Address */}
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    leftIcon={Mail}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
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
                    {passwordValue && <PasswordStrengthMeter password={passwordValue} />}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
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
                  </div>

                  {/* Terms & Privacy Checkbox */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        {...register('acceptTerms')}
                      />
                      <span>
                        I acknowledge the{' '}
                        <span className="text-foreground underline underline-offset-2">
                          Terms of Service
                        </span>{' '}
                        and understand the platform&apos;s Zero-Fabrication guarantee.
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.acceptTerms.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="ai"
                    size="lg"
                    isLoading={isLoading}
                    loadingText="Creating Master Profile..."
                    className="w-full gap-2 font-semibold shadow-glow-sm"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground justify-center">
                <span>Already have an account? </span>
                <Link to="/login" className="ml-1 text-primary hover:underline font-semibold">
                  Sign In
                </Link>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
