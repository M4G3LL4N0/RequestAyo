import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const fullName = body.fullName ? String(body.fullName).trim() : null;
    const homeCity = body.homeCity ? String(body.homeCity).trim() : null;
    const budgetSensitivity = Number(body.budgetSensitivity ?? 50);
    const speedSensitivity = Number(body.speedSensitivity ?? 50);
    const trustSensitivity = Number(body.trustSensitivity ?? 75);
    const convenienceSensitivity = Number(body.convenienceSensitivity ?? 60);

    const supabase = createServerSupabaseClient();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      const { error } = await supabase.from("user_profiles").insert({
        email,
        full_name: fullName,
        home_city: homeCity,
        budget_sensitivity: budgetSensitivity,
        speed_sensitivity: speedSensitivity,
        trust_sensitivity: trustSensitivity,
        convenience_sensitivity: convenienceSensitivity,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, created: true });
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        home_city: homeCity,
        budget_sensitivity: budgetSensitivity,
        speed_sensitivity: speedSensitivity,
        trust_sensitivity: trustSensitivity,
        convenience_sensitivity: convenienceSensitivity,
      })
      .eq("id", profile.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, created: false });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
