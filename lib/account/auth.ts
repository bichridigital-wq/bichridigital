import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { AccountError } from "./errors";

function createTokenValidationClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new AccountError(500, "internal_error", "Service indisponible.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function requireAuthenticatedUser(
  request: Request,
  client: Pick<SupabaseClient, "auth"> = createTokenValidationClient(),
): Promise<User> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) throw new AccountError(401, "unauthorized", "Authentification requise.");
  const { data: { user }, error } = await client.auth.getUser(match[1]);
  if (error || !user) throw new AccountError(401, "unauthorized", "Authentification requise.");
  return user;
}
