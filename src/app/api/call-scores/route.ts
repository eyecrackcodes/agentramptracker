import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client directly for backup access
const getDirectSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or key');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received call score data:', body);
    
    const { 
      agent_id, 
      call_date, 
      call_type,
      script_adherence,
      notes 
    } = body;

    if (!agent_id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    if (!call_date) {
      return NextResponse.json(
        { error: "Call date is required" },
        { status: 400 }
      );
    }

    // Create data object with the correct database field names
    const now = new Date().toISOString();
    // Make sure script_adherence is a number
    let numericScriptAdherence = 0;
    if (script_adherence !== undefined && script_adherence !== null) {
      if (typeof script_adherence === 'string') {
        numericScriptAdherence = parseInt(script_adherence, 10);
      } else if (typeof script_adherence === 'number') {
        numericScriptAdherence = script_adherence;
      }
    }
        
    console.log('Script adherence value:', {
      raw: script_adherence,
      numeric: numericScriptAdherence,
      types: {
        raw: typeof script_adherence,
        numeric: typeof numericScriptAdherence
      }
    });
    
    // Log the final value being used for closing_score
    console.log('About to save to database with closing_score =', numericScriptAdherence);
    
    // Enable Supabase debug mode to see raw SQL queries
    const supabase = getDirectSupabaseClient();
    
    // Add more logging
    console.log('Will attempt insertion with closing_score =', numericScriptAdherence);
    
    const createData = {
      agent_id,
      date: new Date(call_date),
      call_type: call_type || 'final_expense',
      notes: notes || null,
      // Add manager_id which is required by the database
      manager_id: body.manager_id || 'db22d3d4-f970-45e3-ae5d-9ce20f236255', // Default manager ID if not provided
      // Map script_adherence to closing_score (and set other scores to 0)
      closing_score: numericScriptAdherence,
      opening_score: 0,
      discovery_score: 0,
      solution_score: 0,
      // Add timestamps
      created_at: now,
      updated_at: now
    };

    let callScore;
    
    try {
      // Try using Prisma adapter
      console.log('Trying to create call score using Prisma adapter with data:', createData);
      
      // Add direct database query to check values
      const supabase = getDirectSupabaseClient();
      const { data: dbValues, error: dbError } = await supabase
        .from('call_scores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      console.log('Current database values (top 5 records):', dbValues);
      if (dbError) console.error('Error fetching existing records:', dbError);
      
      callScore = await prisma.callScore.create({
        data: createData,
        select: {
          id: true,
          agent_id: true,
          date: true,
          call_type: true,
          closing_score: true,
          notes: true
        }
      });

      // Transform to include script_adherence for the frontend
      const transformedCallScore = {
        ...callScore,
        script_adherence: Math.round(callScore.closing_score || 0)
      };
      
      console.log('Created and transformed call score:', {
        id: transformedCallScore.id,
        closing_score: callScore.closing_score,
        script_adherence: transformedCallScore.script_adherence
      });
      
      callScore = transformedCallScore;
    } catch (adapterError) {
      // If Prisma adapter fails, try direct Supabase insert with minimal fields
      console.error('Prisma adapter failed:', adapterError);
      console.log('Trying direct Supabase insertion');
      
      // Get direct client
      const supabase = getDirectSupabaseClient();
      
      // Use direct Supabase client
      const { data, error } = await supabase
        .from('call_scores')
        .insert({
          agent_id,
          date: new Date(call_date).toISOString(),
          call_type: call_type || 'final_expense',
          notes: notes || null,
          manager_id: body.manager_id || 'db22d3d4-f970-45e3-ae5d-9ce20f236255', // Default manager ID
          closing_score: numericScriptAdherence,
          opening_score: 0,
          discovery_score: 0,
          solution_score: 0,
          created_at: now,
          updated_at: now
        })
        .select('id, agent_id, date, call_type, closing_score, notes')
        .single();
        
      if (error) {
        console.error('Direct Supabase insert failed:', error);
        throw error;
      }
      
      // Create a response with both actual data and client-side expected data
      const transformedData = {
        ...data,
        script_adherence: Math.round(data.closing_score || 0)
      };
      
      console.log('Created call score via Supabase fallback:', {
        id: transformedData.id,
        closing_score: data.closing_score,
        script_adherence: transformedData.script_adherence
      });
      
      callScore = transformedData;
    }

    console.log('Created call score:', callScore);
    
    // Verify the score was saved correctly by fetching it back
    try {
      const supabase = getDirectSupabaseClient();
      const { data: verifyData, error: verifyError } = await supabase
        .from('call_scores')
        .select('*')
        .eq('id', callScore.id)
        .single();
        
      if (verifyError) {
        console.error('Error verifying call score:', verifyError);
      } else {
        console.log('Verification of saved call score:', {
          id: verifyData.id,
          closing_score: verifyData.closing_score,
          script_adherence: callScore.script_adherence,
          submitted_value: numericScriptAdherence,
          match: verifyData.closing_score === numericScriptAdherence ? 'YES' : 'NO'
        });
        
        // If there's a mismatch, try updating it directly
        if (verifyData.closing_score !== numericScriptAdherence) {
          console.warn('Score mismatch detected - attempting direct update');
          const { data: fixData, error: fixError } = await supabase
            .from('call_scores')
            .update({ closing_score: numericScriptAdherence })
            .eq('id', callScore.id)
            .select('closing_score')
            .single();
            
          if (fixError) {
            console.error('Failed to fix score mismatch:', fixError);
          } else {
            console.log('Fixed score mismatch:', fixData);
            // Update the response with the fixed value
            callScore.script_adherence = numericScriptAdherence;
          }
        }
      }
    } catch (verifyErr) {
      console.error('Exception during verification:', verifyErr);
    }
    
    return NextResponse.json(callScore);
  } catch (error: any) {
    console.error("Error creating call score:", {
      error: error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error.code === '22P02') {
      return NextResponse.json(
        { error: "Invalid UUID format for agent ID" },
        { status: 400 }
      );
    }
    
    if (error.code === '23503') {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    if (error.code === '23502') {
      return NextResponse.json(
        { error: "Missing required field", details: error.message },
        { status: 400 }
      );
    }

    if (error.code === 'PGRST204') {
      return NextResponse.json(
        { error: "Database schema mismatch", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create call score", 
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    let callScores;
    
    try {
      // First try using Prisma adapter
      console.log('Trying to fetch call scores using Prisma adapter');
      
      // Direct SQL debug for diagnosing value storage issues
      const supabase = getDirectSupabaseClient();
      const { data: rawDbData, error: dbQueryError } = await supabase
        .from('call_scores')
        .select('*')
        .eq('agent_id', agentId)
        .order('date', { ascending: false });
        
      console.log('Direct database query for agent call scores:', rawDbData);
      if (dbQueryError) console.error('Error in direct db query:', dbQueryError);
      
      callScores = await prisma.callScore.findMany({
        where: {
          agent_id: agentId,
        },
        orderBy: {
          date: "desc",
        },
        select: {
          id: true,
          agent_id: true,
          manager_id: true,
          date: true,
          call_type: true,
          closing_score: true,
          notes: true
        }
      });
    } catch (adapterError) {
      // If Prisma adapter fails, try direct Supabase connection
      console.error('Prisma adapter failed for GET call-scores:', adapterError);
      console.log('Trying direct Supabase fetch');
      
      // Get direct client
      const supabase = getDirectSupabaseClient();
      
      // Use direct Supabase client for fetching
      const { data, error } = await supabase
        .from('call_scores')
        .select('id, agent_id, manager_id, date, call_type, closing_score, notes')
        .eq('agent_id', agentId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Direct Supabase fetch failed:', error);
        throw error;
      }
      
      callScores = data || [];
    }

    // Transform the results to include script_adherence for the frontend
    const transformedScores = callScores.map((score: any) => {
      console.log('Raw score from database:', JSON.stringify(score, null, 2));
      
      // Make sure we're getting a number
      let numericClosingScore = 0;
      
      if (score.closing_score !== undefined && score.closing_score !== null) {
        console.log(`Found closing_score: ${score.closing_score} (${typeof score.closing_score})`);
        numericClosingScore = typeof score.closing_score === 'number' 
          ? score.closing_score 
          : typeof score.closing_score === 'string'
            ? parseFloat(score.closing_score)
            : 0;
      } else {
        console.warn(`No closing_score found for score ${score.id}`);
      }
          
      console.log(`Numeric closing score: ${numericClosingScore} (${typeof numericClosingScore})`);
      
      const scriptAdherence = Math.round(numericClosingScore || 0);
      console.log(`Calculated script_adherence: ${scriptAdherence}`);
      
      const transformed = {
        ...score,
        script_adherence: scriptAdherence
      };
      
      console.log('Full transformed score object:', JSON.stringify(transformed, null, 2));
      
      return transformed;
    });

    console.log('Final transformedScores array before sending to client:', 
      transformedScores.map((s: any) => ({
        id: s.id, 
        script_adherence: s.script_adherence,
        closing_score: s.closing_score
      }))
    );
    
    // Make one final check to ensure script_adherence is set properly
    const finalScores = transformedScores.map((score: any) => {
      if (score.script_adherence === undefined || score.script_adherence === null) {
        console.warn(`Fixing missing script_adherence for score ${score.id}`);
        return {
          ...score,
          script_adherence: Math.round(score.closing_score || 0)
        };
      }
      return score;
    });
    
    return NextResponse.json(finalScores);
  } catch (error) {
    console.error("Error fetching call scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch call scores" },
      { status: 500 }
    );
  }
} 