import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "provider" | "patient";

export type Profile = {
  id: string;
  role: AppRole;
  full_name: string | null;
  phone: string | null;
};

export type UserActorIds = {
  providerId: string | null;
  patientId: string | null;
};

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/sign-in");
  }

  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone")
    .eq("id", userId)
    .maybeSingle();

  return data;
}

export async function requireProfile() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return { user, profile };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const auth = await requireProfile();

  if (!allowedRoles.includes(auth.profile.role)) {
    redirect("/app?error=Access%20denied");
  }

  return auth;
}

export async function getUserActorIds(userId: string): Promise<UserActorIds> {
  const supabase = await createClient();

  const [{ data: provider }, { data: patient }] = await Promise.all([
    supabase.from("providers").select("id").eq("user_id", userId).maybeSingle(),
    supabase.from("patients").select("id").eq("user_id", userId).maybeSingle(),
  ]);

  return {
    providerId: provider?.id ?? null,
    patientId: patient?.id ?? null,
  };
}
