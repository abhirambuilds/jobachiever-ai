import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { loginSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/services/authService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeCount, setShakeCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: location.state?.email || '',
      password: '',
      rememberMe: false,
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email, { shouldValidate: true });
    }
  }, [location.state?.email, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthStatus('idle');
    setErrorMessage('');

    try {
      const response = await authService.login(data);
      setAuthStatus('success');
      toast.success(response.message || 'Login successful!');
      // Brief pause to allow the user to view the success verification animation
      const needsOnboarding = typeof localStorage !== 'undefined' && localStorage.getItem('jobachiever_needs_onboarding') === 'true';
      setTimeout(() => {
        if (needsOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }, 700);
    } catch (err) {
      setAuthStatus('error');
      setShakeCount((prev) => prev + 1);
      const msg = err.message || 'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Welcome Back to Your Career Hub"
      subtitle="Access your verified credentials, active applications, and tailored resume studio."
    >
      <motion.div
        key={shakeCount}
        initial={{ opacity: 0, y: 15 }}
        animate={
          authStatus === 'error'
            ? { x: [-12, 12, -8, 8, -4, 4, 0], opacity: 1, y: 0 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.4 }}
      >
        <Card
          className={`border bg-card/85 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            authStatus === 'success'
              ? 'border-emerald-500/60 shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : authStatus === 'error'
              ? 'border-destructive/60 shadow-destructive/10'
              : 'border-border/80'
          }`}
        >
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Enter your credentials to manage your career pipeline.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Visual Feedback Alerts */}
            {authStatus === 'error' && errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {authStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Credentials verified! Preparing your career workspace...</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email */}
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
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                    {...register('rememberMe')}
                  />
                  <span>Remember me for 30 days</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant={authStatus === 'success' ? 'success' : 'ai'}
                size="lg"
                isLoading={isLoading}
                loadingText="Verifying Credentials..."
                className="w-full gap-2 font-semibold shadow-glow-sm"
              >
                {authStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Verified! Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground justify-center">
            <span>Don&apos;t have an account? </span>
            <Link to="/register" className="ml-1 text-primary hover:underline font-semibold">
              Create Account
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
