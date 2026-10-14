import { NextResponse, type NextRequest } from "next/server";
import { cabecalhosCors, temAllowlist } from "@/lib/origem";

export const config = { matcher: "/api/:path*" };

export function proxy(request: NextRequest) {
  if (request.method !== "OPTIONS") return NextResponse.next();

  if (!temAllowlist()) return new NextResponse(null, { status: 204 });

  return new NextResponse(null, { status: 204, headers: cabecalhosCors(request) });
}
