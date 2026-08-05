import "server-only";

import { createClient } from "../supabase/server";

export async function requirePushAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("AUTH_REQUIRED");
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) throw new Error("ADMIN_REQUIRED");
  return { userId: user.id };
}
