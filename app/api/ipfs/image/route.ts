import { type NextRequest, NextResponse } from "next/server";
import pinata from "@/utils/pinata";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		const upload = await pinata.upload.public.file(file);
		return NextResponse.json(upload.cid, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
