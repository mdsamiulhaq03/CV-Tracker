import { NextRequest, NextResponse } from "next/server";

// No authentication — all routes are public
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: [] };
