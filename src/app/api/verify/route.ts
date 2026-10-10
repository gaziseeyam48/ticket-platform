import { NextRequest, NextResponse } from "next/server";
import { verifyEntrancePass } from "@/app/actions/ticket.actions";
import { getVerifierSession, verifyVerifierSessionToken } from "@/lib/services/verifier-session.service";
import { createServerDbClient } from "@/lib/db/server";

export async function POST(request: NextRequest) {
  try {
    let verifierId: string | undefined;
    let authorizedEventId: string | undefined;

    // 1. Check for cookie-based verifier session
    const cookieSession = await getVerifierSession();
    if (cookieSession) {
      verifierId = cookieSession.verifier_id;
      authorizedEventId = cookieSession.event_id;
    } else {
      // 2. Check for Authorization: Bearer <token>
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.replace("Bearer ", "").trim();
        try {
          const payload = verifyVerifierSessionToken(rawToken);
          verifierId = payload.verifier_id;
          authorizedEventId = payload.event_id;
        } catch {
          // Not a verifier token; continue to Supabase auth
        }
      }

      // 3. Check for organizer Supabase session
      if (!verifierId) {
        const supabase = await createServerDbClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            {
              success: false,
              status: "UNAUTHORIZED",
              message: "Authentication required to operate verification station.",
            },
            { status: 401 }
          );
        }
        verifierId = user.id;
      }
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const rawToken = body?.token;
    const requestedEventId = body?.event_id;

    if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message: "A pass token or ticket URL is required.",
        },
        { status: 400 }
      );
    }

    // 3. Enforce scope if caller is a delegated verifier
    if (authorizedEventId && requestedEventId && requestedEventId !== authorizedEventId) {
      return NextResponse.json(
        {
          success: false,
          status: "WRONG_EVENT",
          message: "You are not authorized to verify passes for this event.",
        },
        { status: 403 }
      );
    }

    const effectiveEventId = authorizedEventId || requestedEventId;

    // 4. Perform atomic entrance check-in
    const result = await verifyEntrancePass(rawToken.trim(), effectiveEventId, verifierId);

    // 5. Map semantic HTTP status code based on check-in state
    let httpStatus = 200;
    if (result.status === "ALREADY_CHECKED_IN") httpStatus = 409;
    else if (result.status === "INVALID") httpStatus = 404;
    else if (result.status === "WRONG_EVENT") httpStatus = 400;
    else if (result.status === "REVOKED" || result.status === "EVENT_NOT_LIVE") httpStatus = 403;

    return NextResponse.json(result, { status: httpStatus });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: "INTERNAL_ERROR",
        message: err.message || "Failed to process ticket verification.",
      },
      { status: 500 }
    );
  }
}
