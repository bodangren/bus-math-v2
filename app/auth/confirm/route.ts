import { redirect } from "next/navigation";

export async function GET() {
  redirect("/auth/login?message=Email confirmation is not used in this system");
}
