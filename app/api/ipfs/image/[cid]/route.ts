import { type NextRequest, NextResponse } from "next/server";
import pinata from "@/utils/pinata";

export async function GET(
	_: NextRequest,
	ctx: RouteContext<"/api/ipfs/image/[cid]">,
) {
	const { cid } = await ctx.params;
	try {
		const { data } = await pinata.gateways.public.get(cid);
		if (data instanceof Blob) {
			const arrayBuffer = await data.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			return new NextResponse(buffer, { status: 200 });
		}
		return new NextResponse(Buffer.alloc(0), { status: 404 });
	} catch {
		return new NextResponse(Buffer.alloc(0), { status: 500 });
	}
}
