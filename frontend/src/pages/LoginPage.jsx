import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full border-border/80 bg-card/70 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-glow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <Badge variant="ai" className="mx-auto text-[10px]">
            Milestone Preview
          </Badge>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Sign In to JobAchiever AI
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Authentication with Spring Boot JWT, BCrypt hashing, and multi-user isolation will be
            implemented in a subsequent milestone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Architectural Guarantee</span>
            </div>
            <p>
              Spring Boot is the primary backend and authoritative source of truth for user
              identity, credentials, and tenant data.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link to="/" className="w-full">
            <Button variant="default" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Landing Page</span>
            </Button>
          </Link>
          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create Account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
