import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "songs.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const raw = JSON.parse(fileContent);

    const songs = raw.songsList.map((item: any) => Object.keys(item)[0]);

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error reading songs.json", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
