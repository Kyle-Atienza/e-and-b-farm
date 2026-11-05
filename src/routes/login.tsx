import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthShell, authInputClassName } from "@/components/auth/auth-shell";

type LoginMode = "sign-in" | "request-reset" | "update-password";

function getInitialMode(): LoginMode {
  return new URLSearchParams(window.location.search).get("mode") ===
    "update-password"
    ? "update-password"
    : "sign-in";
}

function LoginRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>(getInitialMode);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    void import("@/lib/supabase/client").then(({ supabase }) => {
      if (!isMounted) return;
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setMode("update-password");
          setNotice("");
          setErrorMessage("");
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const { supabase } = await import("@/lib/supabase/client");

      if (mode === "sign-in") {
        const identifier = String(formData.get("identifier") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const credentials = identifier.includes("@")
          ? { email: identifier, password }
          : { phone: identifier, password };
        const { error } = await supabase.auth.signInWithPassword(credentials);

        if (error) throw error;
        await navigate({ to: "/" });
        return;
      }

      if (mode === "request-reset") {
        const email = String(formData.get("email") ?? "").trim();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?mode=update-password`,
        });

        if (error) throw error;
        setNotice(
          "If an account exists for that email, password reset instructions will be sent.",
        );
        return;
      }

      const password = String(formData.get("password") ?? "");
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setMode("sign-in");
      setNotice("Your password has been updated. You can now sign in.");
      await navigate({ to: "/login", replace: true });
    } catch (error) {
      console.error("Authentication request failed:", error);
      setErrorMessage(
        mode === "sign-in"
          ? "Unable to sign in. Check your credentials and try again."
          : mode === "request-reset"
            ? "Unable to send password reset instructions. Please try again."
            : "Unable to update your password. The reset link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignIn = mode === "sign-in";
  const isPasswordResetRequest = mode === "request-reset";
  const isPasswordUpdate = mode === "update-password";

  return (
    <AuthShell
      title={
        isSignIn
          ? "Welcome back"
          : isPasswordResetRequest
            ? "Reset your password"
            : "Choose a new password"
      }
      description={
        isSignIn
          ? "Sign in to continue to your harvest dashboard."
          : isPasswordResetRequest
            ? "Enter the email address associated with your account."
            : "Enter a new password for your account."
      }
      footer={
        isSignIn ? (
          <>
            New to E &amp; B Farm?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </>
        ) : (
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode("sign-in");
              setNotice("");
              setErrorMessage("");
            }}
          >
            Back to sign in
          </button>
        )
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        {isSignIn && (
          <label
            className="block text-sm font-medium mb-4"
            htmlFor="login-identifier"
          >
            Email or phone number
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              placeholder="you@example.com or +639..."
              className={authInputClassName}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Enter phone numbers in international format, such as +639...
            </span>
          </label>
        )}

        {isPasswordResetRequest && (
          <label
            className="block text-sm font-medium mb-4"
            htmlFor="recovery-email"
          >
            Email address
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={authInputClassName}
            />
          </label>
        )}

        {(isSignIn || isPasswordUpdate) && (
          <label
            className="block text-sm font-medium mb-4"
            htmlFor="login-password"
          >
            {isPasswordUpdate ? "New password" : "Password"}
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete={
                isPasswordUpdate ? "new-password" : "current-password"
              }
              minLength={8}
              required
              className={authInputClassName}
            />
          </label>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="rounded-lg bg-secondary px-3.5 py-3 text-sm text-secondary-foreground"
          >
            {notice}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg text-base font-semibold"
        >
          {isSubmitting
            ? "Please wait..."
            : isSignIn
              ? "Sign in"
              : isPasswordResetRequest
                ? "Send reset instructions"
                : "Update password"}
        </Button>
      </form>

      {isSignIn && (
        <div className="mt-5 border-t border-border pt-4 text-center">
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode("request-reset");
              setNotice("");
              setErrorMessage("");
            }}
          >
            Forgot password?
          </button>
        </div>
      )}
    </AuthShell>
  );
}

export default LoginRoute;
