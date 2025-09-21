import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(
  req: Request,
  context: { params: Promise<{ song: string; image: string }> }
) {
  const { song, image } = await context.params;

  const imagePath = path.join(process.cwd(), "data/pngs", song, image);

  try {
    const imageData = await fs.readFile(imagePath);
    return new NextResponse(new Uint8Array(imageData), {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (err) {
    console.error("error fetching image:", err);
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
