import Link from "next/link";

import { UpdatePasswordForm } from "@/components/update-password-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

export default async function SettingsPage() {
  const claims = await getServerSessionClaims();

  if (!claims) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1>Account Settings</h1>
            </CardTitle>
            <CardDescription>Sign in to access your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in to manage your account, review your role, and update your password.
            </p>
            <Link
              href="/auth/login?redirect=%2Fsettings"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const account = await fetchInternalQuery(internal.auth.getAccountSettingsContext, {
    profileId: claims.sub as Id<"profiles">,
  });

  if (!account) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1>Account Settings</h1>
            </CardTitle>
            <CardDescription>Account details are temporarily unavailable.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1>Account Settings</h1>
            </CardTitle>
            <CardDescription>
              Review your account details and keep your login secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Display name</p>
              <p className="text-lg font-semibold text-foreground">{account.displayName}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="mt-1 font-mono text-foreground">{account.username}</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {account.role}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="mt-1 text-foreground">{account.organizationName}</p>
            </div>
          </CardContent>
        </Card>

        <UpdatePasswordForm
          username={account.username}
          role={account.role}
          organizationName={account.organizationName}
        />
      </div>
    </div>
  );
}
