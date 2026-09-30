import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    '0{"sid":"sim-socket-session","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}',
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
      },
    }
  );
}

export async function POST() {
  return new NextResponse("ok", { status: 200 });
}
