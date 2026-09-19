import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/common/Logo";

const Register = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-6">
        <Logo size="lg" />
      </div>
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Public Registration Disabled</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Self-service user registration is disabled on this Point of Sale system.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-left">
            <p className="font-semibold mb-1">Looking for account access?</p>
            <p>Cashiers and staff accounts must be created by an Administrator from the Cashier Management dashboard.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/login">Go to Cashier Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/login">Go to Admin Portal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;