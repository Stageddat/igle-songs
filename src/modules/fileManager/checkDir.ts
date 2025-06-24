import fs from "fs/promises";
import path from "path";

const pptxsDir = path.join(process.cwd(), "/data/pptxs");
const pdfsDir = path.join(process.cwd(), "/data/pdfs");
const pngsDir = path.join(process.cwd(), "/data/pngs");

export default async function checkDir() {
  try {
    await fs.mkdir(pptxsDir, { recursive: true });
    await fs.mkdir(pdfsDir, { recursive: true });
    await fs.mkdir(pngsDir, { recursive: true });
  } catch (error) {
    console.error(error);
  }
}
