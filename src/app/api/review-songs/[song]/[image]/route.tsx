import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(
	req: Request,
	contextPromise: Promise<{ params: { song: string; image: string } }>
) {
	const { params } = await contextPromise;
	const { song, image } = await params;

	const imagePath = path.join(process.cwd(), "data/pngs", song, image);

	try {
		const imageData = await fs.readFile(imagePath);
		return new NextResponse(imageData, {
			headers: {
				"Content-Type": "image/png",
			},
		});
	} catch (err) {
		return NextResponse.json({ error: "Image not found" }, { status: 404 });
	}
}