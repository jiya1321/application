import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Shield } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const adminSession = sessionStorage.getItem("krishna-admin-session");
    if (adminSession === "authenticated") {
      setLocation("/admin/inventory");
    }
  }, [setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Get admin password from environment variable or use default for demo
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

    if (password === adminPassword) {
      // Store admin session
      sessionStorage.setItem("krishna-admin-session", "authenticated");
      sessionStorage.setItem("krishna-admin-timestamp", Date.now().toString());
      setLocation("/admin/inventory");
    } else {
      setError("Invalid admin password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Krishna Electronics Admin</CardTitle>
          <CardDescription>Enter admin password to access inventory management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Demo password: {import.meta.env.VITE_ADMIN_PASSWORD || "admin123"}</p>
            <p className="mt-1">Set VITE_ADMIN_PASSWORD environment variable to change</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
