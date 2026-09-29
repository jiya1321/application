import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
    name: "",
    email: "",
    mobile: "",
    confirmPassword: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, isLoggedIn, redirectAfterLogin, buyNowProduct } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrMobile.trim()) {
      newErrors.emailOrMobile = "Email or mobile number is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Invalid mobile number (10 digits starting with 6-9)";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    const success = await login(formData.emailOrMobile, formData.password);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back to Krishna Electronics!",
      });
      onClose();
      
      // Redirect after login
      if (redirectAfterLogin) {
        setLocation(redirectAfterLogin);
      } else if (buyNowProduct) {
        setLocation("/checkout");
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email/mobile or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsLoading(true);
    const success = await signup(formData.name, formData.email, formData.mobile, formData.password);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Account Created",
        description: "Welcome to Krishna Electronics!",
      });
      onClose();
      
      // Redirect after signup
      if (redirectAfterLogin) {
        setLocation(redirectAfterLogin);
      } else if (buyNowProduct) {
        setLocation("/checkout");
      }
    } else {
      toast({
        title: "Signup Failed",
        description: "Email or mobile number already registered. Please try logging in.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset link sent to your email (demo)",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLogin ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="emailOrMobile">Email or Mobile Number</Label>
              <Input
                id="emailOrMobile"
                value={formData.emailOrMobile}
                onChange={(e) => setFormData({ ...formData, emailOrMobile: e.target.value })}
                placeholder="Enter email or mobile"
                className={errors.emailOrMobile ? "border-red-500" : ""}
              />
              {errors.emailOrMobile && <p className="text-red-500 text-sm mt-1">{errors.emailOrMobile}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                />
                <Label htmlFor="remember" className="cursor-pointer text-sm">Remember me</Label>
              </div>
              <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={handleForgotPassword}>
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">New to Krishna Electronics? </span>
              <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setIsLogin(false)}>
                Create your account
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={errors.mobile ? "border-red-500" : ""}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <Label htmlFor="newPassword">Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setIsLogin(true)}>
                Sign in
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
