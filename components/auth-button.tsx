import Link from "next/link";
import { Button } from "./ui/button";
import { getServerSessionClaims } from "@/lib/auth/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const claims = await getServerSessionClaims();

  return claims ? (
    <div className="flex items-center gap-4">
      Hey, {claims.username}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}
