import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthShell, authInputClassName } from "@/components/auth/auth-shell";

function LoginRoute() {
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      recoveryMode
        ? "Password recovery is not connected yet. Please contact your farm administrator."
        : "Sign-in is not connected yet. Please contact your farm administrator.",
    );
  }

  return (
    <AuthShell
      title={recoveryMode ? "Reset your password" : "Welcome back"}
      description={
        recoveryMode
          ? "Enter the phone number or email address associated with your account."
          : "Sign in to continue to your harvest dashboard."
      }
      footer={
        recoveryMode ? (
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setRecoveryMode(false);
              setNotice("");
            }}
          >
            Back to sign in
          </button>
        ) : (
          <>
            New to E &amp; B Farm?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </>
        )
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-medium" htmlFor="login-identifier">
          Phone number or email address
          <input
            id="login-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            placeholder="you@example.com or (555) 123-4567"
            className={authInputClassName}
          />
        </label>

        {!recoveryMode && (
          <label className="block text-sm font-medium" htmlFor="login-password">
            Password
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={authInputClassName}
            />
          </label>
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
          className="h-12 w-full rounded-lg text-base font-semibold"
        >
          {recoveryMode ? "Send reset instructions" : "Sign in"}
        </Button>
      </form>

      {!recoveryMode && (
        <div className="mt-5 border-t border-border pt-4 text-center">
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setRecoveryMode(true);
              setNotice("");
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
