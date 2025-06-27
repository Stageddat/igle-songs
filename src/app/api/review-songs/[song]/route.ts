import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(
	req: Request,
	contextPromise: Promise<{ params: { song: string } }>
) {
	const { params } = await contextPromise;
	const { song } = await params;

	const folderPath = path.join(process.cwd(), "data/pngs", song);
	try {
		const files = await fs.readdir(folderPath);
		const pngs = files.filter((f) => f.endsWith(".png"));
		return NextResponse.json(pngs);
	} catch (err) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
}
