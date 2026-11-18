import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = getMysqlPool();
    await pool.query("SELECT 1");

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    // Detail koneksi hanya dicatat di server; jangan kirim credential/error
    // internal database ke response HTTP.
    console.error("MySQL health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
      },
      { status: 503 }
    );
  }
}
