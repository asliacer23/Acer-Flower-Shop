import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flower2, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TermsModal } from '@/components/TermsModal';

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

  // UI States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [activeTab, setActiveTab] = useState("login");
  const [shake, setShake] = useState(false);

  // Terms Modal States
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  // Password Strength
  function checkStrength(pass: string) {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 0) return "";
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    if (score === 4) return "Strong";
  }

  useEffect(() => {
    setPasswordStrength(checkStrength(signupPassword));
  }, [signupPassword]);

  // After email verification
  useEffect(() => {
    if (params.get("verified") === "true") {
      toast({
        title: "Email verified!",
        description: "You can now log in.",
      });
    }
  }, []);

  // If logged in, redirect
  useEffect(() => {
    if (!isLoading && user) navigate("/profile");
  }, [user, isLoading]);

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn(loginEmail, loginPassword);

    if (!res.success) {
      setShake(true); // start shake
      setTimeout(() => setShake(false), 600); // remove shake

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

  // SIGNUP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!signupEmail || !signupPassword || !signupName) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Show terms modal before signup
    setPendingSignupData({
      email: signupEmail,
      password: signupPassword,
      name: signupName,
    });
    setShowTermsModal(true);
  };

  // Handle terms acceptance
  const handleTermsAccepted = async () => {
    if (!pendingSignupData) return;

    setLoading(true);
    setShowTermsModal(false);

    const res = await signUp(
      pendingSignupData.email,
      pendingSignupData.password,
      pendingSignupData.name
    );

    if (!res.success) {
      toast({
        title: "Signup failed",
        description: res.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification email sent!",
        description: "Check your inbox.",
      });

      // Auto-switch to Login tab
      setActiveTab("login");
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setPendingSignupData(null);
    }

    setLoading(false);
  };

  // Handle terms rejection
  const handleTermsRejected = () => {
    setShowTermsModal(false);
    setPendingSignupData(null);
    toast({
      title: "You must accept the terms to sign up",
      variant: "destructive",
    });
  };

  return (
    <PageWrapper>
      <div className="container py-16 max-w-md mx-auto">
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flower2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Flowerist</span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <Card className={shake ? "shake" : ""}>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to continue shopping</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">

                  {/* EMAIL */}
                  <div className="relative">
                    <Label className="floating-label">Email</Label>
                    <Input
                      type="email"
                      className="peer"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="relative">
                    <Label className="floating-label">Password</Label>

                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      className={`peer transition-all ${
                        showLoginPassword ? "border-primary shadow-md" : ""
                      }`}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />

                    {/* Eye toggle */}
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <Button disabled={loading} className="w-full">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Tip: Use email with "admin" for admin access
                  </p>

                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join us to start ordering flowers</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">

                  {/* NAME */}
                  <div className="relative">
                    <Label className="floating-label">Full Name</Label>
                    <Input
                      className="peer"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="relative">
                    <Label className="floating-label">Email</Label>
                    <Input
                      type="email"
                      className="peer"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="relative">
                    <Label className="floating-label">Password</Label>

                    <Input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`peer transition-all ${
                        showSignupPassword ? "border-primary shadow-md" : ""
                      }`}
                    />

                    {/* Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                    >
                      {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {/* Tooltip Icon */}
                    <div className="group absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer">
                      <Info size={18} className="text-muted-foreground" />

                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-popover text-popover-foreground p-3 rounded shadow-xl w-48 text-xs">
                        <p className="mb-1">Password must include:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>8+ characters</li>
                          <li>1 uppercase letter</li>
                          <li>1 number</li>
                          <li>1 special character</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Strength Meter */}
                  {signupPassword.length > 0 && (
                    <p
                      className={`text-sm font-medium ${
                        passwordStrength === "Weak" && "text-red-500"
                      } ${
                        passwordStrength === "Fair" && "text-yellow-500"
                      } ${
                        passwordStrength === "Good" && "text-blue-500"
                      } ${
                        passwordStrength === "Strong" && "text-green-500"
                      }`}
                    >
                      Strength: {passwordStrength}
                    </p>
                  )}

                  <Button disabled={loading} className="w-full">
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Terms Modal */}
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={handleTermsAccepted}
        onReject={handleTermsRejected}
      />
    </PageWrapper>
  );
}
