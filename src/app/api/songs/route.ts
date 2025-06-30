import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "songs.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const raw = JSON.parse(fileContent);

    const songs = raw.songs ? Object.keys(raw.songs) : [];

    return NextResponse.json(songs);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("error reading songs.json:", error.message);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
    console.error("error reading songs.json:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
