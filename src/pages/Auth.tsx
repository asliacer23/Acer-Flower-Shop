import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { signIn, signUp, user, isLoading } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loading, setLoading] = useState(false);

  // -------- Handle "verified=true" after email confirmation --------
  useEffect(() => {
    if (params.get("verified") === "true") {
      toast({
        title: "Email verified!",
        description: "You can now log in to your account.",
      });
    }
  }, []);

  // -------- REDIRECT IF USER IS ALREADY LOGGED IN --------
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/profile');
    }
  }, [user, isLoading, navigate]);

  // ------------------ LOGIN ------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn(loginEmail, loginPassword);

    if (!res.success) {
      toast({
        title: "Login failed",
        description: res.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Welcome back!" });
    }

    setLoading(false);
  };

  // ------------------ SIGNUP ------------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signUp(signupEmail, signupPassword, signupName);

    if (!res.success) {
      toast({
        title: "Signup failed",
        description: res.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification email sent!",
        description: "Check your inbox to confirm your account.",
      });

      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
    }

    setLoading(false);
  };

  return (
    <PageWrapper>
      <div className="container py-16 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flower2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Petal Swift</span>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ------------------ LOGIN TAB ------------------ */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to continue shopping</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Tip: Use email with "admin" for admin access
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------ SIGNUP TAB ------------------ */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join us to start ordering beautiful flowers
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
