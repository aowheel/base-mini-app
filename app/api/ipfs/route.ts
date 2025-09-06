import { type NextRequest, NextResponse } from "next/server";
import pinata from "@/utils/pinata";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const data = await pinata.upload.public.json(body);
		return NextResponse.json(data, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to upload data" },
			{ status: 500 },
		);
	}
}
