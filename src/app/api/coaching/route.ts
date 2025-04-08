import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coaching
// Get all coaching sessions, with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const managerId = searchParams.get("managerId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Build where clause based on filters
    const whereClause: any = {};
    
    if (agentId) {
      whereClause.agent_id = agentId;
    }
    
    if (managerId) {
      whereClause.managerId = managerId;
    }
    
    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) {
        whereClause.date.gte = new Date(fromDate);
      }
      if (toDate) {
        whereClause.date.lte = new Date(toDate);
      }
    }

    console.log("Fetching coaching sessions with where clause:", whereClause);

    const sessions = await prisma.coachingSession.findMany({
      where: whereClause,
      include: {
        agent: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log("Retrieved coaching sessions:", JSON.stringify(sessions, null, 2));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching coaching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaching sessions" },
      { status: 500 }
    );
  }
}

// POST /api/coaching
// Create a new coaching session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API received request body:', JSON.stringify(body, null, 2));
    
    const { agent_id, manager_id, date, session_type, type, notes, action_items, next_steps } = body;

    if (!agent_id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    if (!manager_id) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    // Ensure date is a valid date
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Use both field name variants
    const now = new Date();
    const createData = {
      agent_id,
      manager_id,
      session_type: session_type || type || 'one_on_one',
      type: session_type || type || 'one_on_one',
      date: sessionDate,
      notes,
      action_items: action_items || null,
      next_steps: next_steps || action_items || null,
      created_at: now,
      updated_at: now // Direct Date object
    };

    console.log('API creating coaching session with data:', JSON.stringify(createData, null, 2));

    try {
      const session = await prisma.coachingSession.create({
        data: createData,
        include: {
          agent: true,
        },
      });

      console.log('API created session successfully:', JSON.stringify(session, null, 2));
      return NextResponse.json(session);
    } catch (innerError: any) {
      console.error("Inner error in creating coaching session:", {
        error: innerError,
        message: innerError.message,
        code: innerError.code,
        stack: innerError.stack
      });
      throw innerError;
    }
  } catch (error: any) {
    console.error("Error creating coaching session:", {
      error: error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle specific database errors
    if (error.code === '22P02') {
      return NextResponse.json(
        { error: "Invalid UUID format for agent ID or manager ID" },
        { status: 400 }
      );
    }
    
    if (error.code === '23503') {
      return NextResponse.json(
        { error: "Agent or manager not found" },
        { status: 404 }
      );
    }

    if (error.code === '23502') {
      return NextResponse.json(
        { error: "Missing required field", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create coaching session", 
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

// PUT /api/coaching
// Update an existing coaching session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    const session = await prisma.coachingSession.update({
      where: {
        id: body.id,
      },
      data: {
        session_type: body.session_type || body.type || 'one_on_one',
        type: body.session_type || body.type || 'one_on_one',
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes,
        action_items: body.action_items || null,
        next_steps: body.next_steps || body.action_items || null
      },
      include: {
        agent: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating coaching session:", error);
    return NextResponse.json(
      { error: "Failed to update coaching session" },
      { status: 500 }
    );
  }
}

// DELETE /api/coaching
// Delete a coaching session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    await prisma.coachingSession.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Coaching session deleted successfully" });
  } catch (error) {
    console.error("Error deleting coaching session:", error);
    return NextResponse.json(
      { error: "Failed to delete coaching session" },
      { status: 500 }
    );
  }
} 