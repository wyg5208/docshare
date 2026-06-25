"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { FileText, Loader2, AlertTriangle } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    // Check for inactive/expired status from middleware redirect
    if (searchParams.get("inactive") === "true") {
      setAccountMessage(
        "Your account has been deactivated. Please contact the administrator to reactivate your account."
      );
    } else if (searchParams.get("expired") === "true") {
      setAccountMessage(
        "Your account access period has expired. Please contact the administrator to extend your access."
      );
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAccountMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast("error", error.message);
      setLoading(false);
      return;
    }

    // Email verification gate - send unverified users to /verify-email
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && user.email_confirmed_at === null) {
      toast("info", "Please verify your email to continue.");
      router.push("/verify-email");
      return;
    }

    // Check user active status and validity period
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active, valid_from, valid_until")
        .eq("id", user.id)
        .single();

      if (profile) {
        // Check if manually disabled
        if (!profile.is_active) {
          await supabase.auth.signOut();
          setAccountMessage(
            "Your account has been deactivated. Please contact the administrator to reactivate your account."
          );
          setLoading(false);
          return;
        }

        // Check validity period
        const now = new Date();
        const validFrom = profile.valid_from ? new Date(profile.valid_from) : null;
        const validUntil = profile.valid_until ? new Date(profile.valid_until) : null;

        if ((validFrom && now < validFrom) || (validUntil && now > validUntil)) {
          await supabase.auth.signOut();
          setAccountMessage(
            "Your account access period has expired. Please contact the administrator to extend your access."
          );
          setLoading(false);
          return;
        }
      }
    }

    // Log the login
    await supabase.from("access_logs").insert({
      user_id: user!.id,
      action: "login",
      metadata: { method: "email" },
    });

    toast("success", "Welcome back!");
    const redirect = searchParams.get("redirect");
    router.push(redirect || "/");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {accountMessage && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{accountMessage}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
