import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client directly for database access
const getDirectSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase environment variables. Please check your configuration."
    );
    throw new Error(
      "Supabase configuration is missing. Contact your administrator."
    );
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Safely access Supabase - return null if not configured
const getSafeSupabaseClient = () => {
  try {
    return getDirectSupabaseClient();
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    // Check if Supabase is properly configured before proceeding
    const supabase = getSafeSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database configuration error. Contact your administrator." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const { id, script_adherence } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Call score ID is required" },
        { status: 400 }
      );
    }

    if (script_adherence === undefined || script_adherence === null) {
      return NextResponse.json(
        { error: "Script adherence value is required" },
        { status: 400 }
      );
    }

    // Create a numeric value
    const numericValue = Number(script_adherence);
    if (isNaN(numericValue)) {
      return NextResponse.json(
        { error: "Invalid script adherence value" },
        { status: 400 }
      );
    }

    console.log(
      `Directly updating call score ${id} with closing_score=${numericValue}`
    );

    // Update the record using direct SQL
    const { data, error } = await supabase
      .from("call_scores")
      .update({
        closing_score: numericValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Direct SQL update failed:", error);
      return NextResponse.json(
        { error: "Failed to update call score", details: error.message },
        { status: 500 }
      );
    }

    console.log("Successfully updated call score:", data);

    // Return the updated record
    return NextResponse.json({
      ...data,
      script_adherence: numericValue,
    });
  } catch (error: any) {
    console.error("Error updating call score:", error);
    return NextResponse.json(
      { error: "Failed to update call score", details: error.message },
      { status: 500 }
    );
  }
}
