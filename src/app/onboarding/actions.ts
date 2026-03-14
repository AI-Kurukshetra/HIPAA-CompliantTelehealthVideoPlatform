"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const role = String(formData.get("role") ?? "") as "provider" | "patient";
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const specialty = String(formData.get("specialty") ?? "").trim() || null;
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim() || null;

  if (!fullName || !["provider", "patient"].includes(role)) {
    redirect("/onboarding?error=Invalid%20role%20or%20name");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role,
      full_name: fullName,
      phone,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    redirect(`/onboarding?error=${encodeURIComponent(profileError.message)}`);
  }

  if (role === "provider") {
    const { error: providerError } = await supabase.from("providers").upsert(
      {
        user_id: user.id,
        specialty,
      },
      { onConflict: "user_id" },
    );

    if (providerError) {
      redirect(`/onboarding?error=${encodeURIComponent(providerError.message)}`);
    }
  } else {
    const { error: patientError } = await supabase.from("patients").upsert(
      {
        user_id: user.id,
        date_of_birth: dateOfBirth,
      },
      { onConflict: "user_id" },
    );

    if (patientError) {
      redirect(`/onboarding?error=${encodeURIComponent(patientError.message)}`);
    }
  }

  redirect("/app");
}

