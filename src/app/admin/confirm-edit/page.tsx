import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConfirmEditForm from "./ConfirmEditForm";

export default async function ConfirmEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const email = user.email;

  if (!email) {
    redirect("/admin");
  }

  return <ConfirmEditForm email={email} />;
}