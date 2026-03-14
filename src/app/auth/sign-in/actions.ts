"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getAppBaseUrl(host: string, protocol: string) {
  const origin = `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || origin;
}

function validateCredentials(email: string, password: string) {
  if (!email) {
    return "Email is required";
  }

  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    redirect(`/auth/sign-in?tab=signin&error=${encodeURIComponent(validationError)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/auth/sign-in?tab=signin&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    redirect(`/auth/sign-in?tab=signup&error=${encodeURIComponent(validationError)}`);
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const appBaseUrl = getAppBaseUrl(host, protocol).replace(/\/+$/, "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appBaseUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    redirect(`/auth/sign-in?tab=signup&error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/onboarding");
  }

  redirect(
    "/auth/sign-in?tab=signin&notice=Account%20created.%20If%20email%20verification%20is%20enabled,%20please%20verify%20then%20sign%20in.",
  );
}
