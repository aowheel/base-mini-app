import { type NextRequest, NextResponse } from "next/server";
import pinata from "@/utils/pinata";

export async function GET(
	_: NextRequest,
	ctx: RouteContext<"/api/ipfs/[cid]">,
) {
	const { cid } = await ctx.params;
	try {
		const { data } = await pinata.gateways.public.get(cid);
		return NextResponse.json(data, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch data" },
			{ status: 500 },
		);
	}
}
