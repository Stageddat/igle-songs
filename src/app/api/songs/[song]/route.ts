import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: Request,
  { params }: { params: { song: string } }
) {
  try {
    const { song } = await params;
    const songName = decodeURIComponent(song);
    const filePath = path.join(process.cwd(), "data", "songs.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    const songEntry = data.songsList.find(
      (item: any) => Object.keys(item)[0] === songName
    );

    if (!songEntry) {
      return new NextResponse("song not found", { status: 404 });
    }

    const songData = songEntry[songName];
    const links = songData.links || [];

    return NextResponse.json(links);
  } catch (error) {
    console.error("failed to get song", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
