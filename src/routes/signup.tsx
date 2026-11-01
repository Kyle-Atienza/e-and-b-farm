import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthShell, authInputClassName } from "@/components/auth/auth-shell";

function SignupRoute() {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "Account creation is not connected yet. Please contact your farm administrator.",
    );
  }

  return (
    <AuthShell
      title="Create your account"
      description="Set up your farm account to start tracking harvests."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium" htmlFor="signup-name">
          Name
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your full name"
            className={authInputClassName}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="signup-phone">
          Phone number
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder="(555) 123-4567"
            className={authInputClassName}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="signup-password">
          Password
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            className={authInputClassName}
          />
        </label>

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
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

export default SignupRoute;
