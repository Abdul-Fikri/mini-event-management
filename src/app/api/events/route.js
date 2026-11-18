import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/auth";
import { getMysqlPool } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Endpoint ini hanya boleh diakses oleh user yang sudah login.
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pool = getMysqlPool();
    const [events] = await pool.execute(
      `SELECT id, name, description, event_date, location, created_at, updated_at
       FROM events
       ORDER BY event_date ASC, id ASC`
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch events from MySQL:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data event." },
      { status: 500 }
    );
  }
}
