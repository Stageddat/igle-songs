import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const pngsDir = path.join(process.cwd(), "data/pngs");

export async function GET() {
	const entries = await fs.readdir(pngsDir, { withFileTypes: true });
	const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
	return NextResponse.json(folders);
}
