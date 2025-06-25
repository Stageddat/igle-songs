import fs from "node:fs/promises";
import path from "node:path";

const pngsDir = path.join(process.cwd(), "/data/pngs");

export default async function getReviewSongs() {
  const files = await fs.readdir(pngsDir);

  console.log(files);
  return files;
}
