import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Ledger } from "@/lib/models";
import type { LedgerData } from "@/lib/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await Ledger.findOne({ userId }).lean<LedgerData & { userId?: string }>();

    if (!doc) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error("GET /api/data failed:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { userId, data } = body as { userId?: string; data?: Partial<LedgerData> };

  if (!userId || !data) {
    return NextResponse.json({ error: "Missing userId or data" }, { status: 400 });
  }

  try {
    await connectDB();
    await Ledger.findOneAndUpdate({ userId }, { $set: data }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/data failed:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
