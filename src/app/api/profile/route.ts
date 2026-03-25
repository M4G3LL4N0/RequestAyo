import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for validating profile data
const ProfileSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(100).optional(),
  homeCity: z.string().min(1).max(100).optional(),
  budgetSensitivity: z.number().min(0).max(100).default(50),
  speedSensitivity: z.number().min(0).max(100).default(50),
  trustSensitivity: z.number().min(0).max(100).default(75),
  convenienceSensitivity: z.number().min(0).max(100).default(60),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = ProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: result.error.issues },
        { status: 400 }
      );
    }

    const {
      email,
      fullName,
      homeCity,
      budgetSensitivity,
      speedSensitivity,
      trustSensitivity,
      convenienceSensitivity,
    } = result.data;

    const supabase = createServerSupabaseClient();

    // Check if profile exists
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    const profileData = {
      email,
      full_name: fullName,
      home_city: homeCity,
      budget_sensitivity: budgetSensitivity,
      speed_sensitivity: speedSensitivity,
      trust_sensitivity: trustSensitivity,
      convenience_sensitivity: convenienceSensitivity,
    };

    let operationResult;
    if (!profile) {
      // Create new profile
      operationResult = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select()
        .single();
    } else {
      // Update existing profile
      operationResult = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("id", profile.id)
        .select()
        .single();
    }

    if (operationResult.error) {
      return NextResponse.json(
        { error: operationResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      created: !profile,
      profile: operationResult.data,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
