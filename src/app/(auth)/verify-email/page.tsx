"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { FileText, Loader2, MailCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // Load current session user; auto-redirect if already verified.
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (user?.email_confirmed_at) {
        router.replace("/");
        return;
      }
      setEmail(user?.email ?? null);
      setLoadingUser(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  // Cooldown countdown timer.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setResending(false);
    if (error) {
      toast("error", error.message);
      return;
    }
    toast("success", "Verification email sent. Check your inbox.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    const { data, error } = await supabase.auth.refreshSession();
    setChecking(false);
    if (error) {
      toast("error", error.message);
      return;
    }
    if (data.user?.email_confirmed_at) {
      toast("success", "Email verified! Redirecting...");
      router.replace("/");
    } else {
      toast("info", "Still pending. Please click the link in your email.");
    }
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
        <div className="flex justify-center mb-2">
          <MailCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          {loadingUser
            ? "Loading..."
            : email
              ? `We sent a verification link to ${email}. Click it to activate your account.`
              : "You're not signed in. Please register or sign in first."}
        </CardDescription>
      </CardHeader>

      {!loadingUser && email && (
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Didn&apos;t receive the email? Check your spam folder, or click below to resend.
          </p>
        </CardContent>
      )}

      <CardFooter className="flex flex-col gap-3">
        {!loadingUser && email && (
          <>
            <Button
              type="button"
              className="w-full"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
            >
              {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!resending && <RefreshCw className="mr-2 h-4 w-4" />}
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : resending
                  ? "Sending..."
                  : "Resend verification email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCheckVerified}
              disabled={checking}
            >
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              I&apos;ve already verified
            </Button>
          </>
        )}

        {!loadingUser && !email && (
          <Link
            href="/register"
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Go to register
          </Link>
        )}

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
