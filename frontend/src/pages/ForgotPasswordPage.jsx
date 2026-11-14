import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { forgotPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/services/authService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success(response.message);
    } catch (err) {
      toast.error(err.message || 'Unable to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Account Recovery & Access Protection"
      subtitle="Safeguard your master profile with encrypted, single-use password recovery protocols."
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Enter the email associated with your master profile to generate recovery instructions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="name@example.com"
                  leftIcon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  variant="ai"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Preparing Recovery Link..."
                  className="w-full gap-2 font-semibold shadow-glow-sm"
                >
                  <span>Request Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Recovery Request Prepared</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If an account exists for <span className="font-semibold text-foreground">{submittedEmail}</span>,
                    recovery instructions have been formatted.
                  </p>
                </div>

                {/* Milestone 4 simulation hint */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Badge variant="ai" className="text-[9px] px-1.5 py-0">
                      Dev Simulation
                    </Badge>
                    <span>Frontend Navigation Preview</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Live email dispatch will be handled by the Spring Boot backend in Milestone 5.
                    You can test the next step in the flow directly below:
                  </p>
                  <Link to="/reset-password">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-1">
                      <span>Simulate Clicking Reset Link</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
