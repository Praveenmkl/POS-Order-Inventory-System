import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Logo from "@/components/common/Logo";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login(email, password);
      const userRole = res.user?.role ? String(res.user.role).toUpperCase() : "";

      // Enforce Admin role
      if (userRole !== "ADMIN") {
        logout();
        setError("Access Denied: Admin privileges required. Cashiers must use the standard login screen.");
        return;
      }
      navigate("/admin/dashboard");
    } catch (err) {
      const backendError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.details;
      setError(
        backendError
          ? `${backendError}${err.response?.data?.details && err.response?.data?.error ? `: ${err.response.data.details}` : ""}`
          : "Failed to authenticate as Admin. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-6 flex flex-col items-center">
        <Logo size="lg" />
        <div className="mt-3 flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-semibold text-foreground border border-black/10 dark:border-white/10">
          <ShieldCheck className="h-4 w-4 text-black dark:text-white" />
          <span>Admin Portal</span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg border bg-card text-card-foreground">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Authentication</CardTitle>
          <CardDescription>
            Authorized management personnel only
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@pos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access Admin Portal"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
            Looking for Cashier Terminal?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground underline hover:text-primary"
            >
              Cashier Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
