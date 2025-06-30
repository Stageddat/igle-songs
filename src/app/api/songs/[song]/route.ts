import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: Request,
  context: { params: Promise<{ song: string }> }
) {
  try {
    const { song } = await context.params;
    const songName = decodeURIComponent(song);
    const filePath = path.join(process.cwd(), "data", "songs.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    const songData = data.songs?.[songName];

    if (!songData) {
      return new NextResponse("song not found", { status: 404 });
    }

    const links = songData.links || [];

    return NextResponse.json(links);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("failed to get song:", error.message);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
    console.error("failed to get song:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
