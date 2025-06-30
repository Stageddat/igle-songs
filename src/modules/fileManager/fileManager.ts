import fs from "node:fs/promises";
import path from "node:path";
import checkDir from "./checkDir";
import { convertPptxToPdf } from "./pptxToPdf";
import { filterSongNames, filterSongs } from "./filterSongs";
import { convertPdfToPng } from "./PdfToPng";
import { isDiskAlmostFull } from "./checkDiskUsage";

const pptxsDir = path.join(process.cwd(), "/data/pptxs");
const pdfsDir = path.join(process.cwd(), "/data/pdfs");
const pngsDir = path.join(process.cwd(), "/data/pngs");

export async function processFiles() {
  await checkDir();
  console.log("processing files...");

  // procesar todos los pptx disponibles
  const pptxFiles = await fs.readdir(pptxsDir);

  for (const file of pptxFiles) {
    if (await isDiskAlmostFull()) {
      console.warn("espace almost full. waiting...");
      return;
    }

    const song = filterSongs(file);
    if (!song) {
      console.log(`eliminando archivo no canción: ${file}`);
      await fs.unlink(path.join(pptxsDir, file));
      continue;
    }

    const pptxPath = path.join(pptxsDir, file);
    const baseName = path.parse(pptxPath).name;
    const pdfFile = path.join(pdfsDir, `${baseName}.pdf`);

    // convertir pptx a pdf
    await convertPptxToPdf(pptxPath, pdfsDir);

    // eliminar pptx inmediatamente
    try {
      await fs.unlink(pptxPath);
    } catch (error: unknown) {
      console.error(`failed to delete ${pptxPath}:`, error);
    }
  }

  // procesar todos los pdfs disponibles
  const pdfFiles = await fs.readdir(pdfsDir);

  for (const file of pdfFiles) {
    if (await isDiskAlmostFull()) {
      console.warn("espace almost full. waiting...");
      return;
    }

    const pdfFile = path.join(pdfsDir, file);
    const baseName = path.parse(pdfFile).name;

    const songNames = filterSongNames(baseName);
    console.log(songNames);
    if (!songNames) {
      console.error(`failed to get song names: ${baseName}`);
      continue;
    }

    const tempPngDir = path.join(pngsDir, "temp");
    const pngImages = await convertPdfToPng(pdfFile, tempPngDir);

    if (pngImages.length === 0) {
      console.error(`failed to convert pdf to png: ${baseName}`);
      continue;
    }

    for (const songName of songNames) {
      const songDir = path.join(pngsDir, songName);

      try {
        await fs.mkdir(songDir, { recursive: true });
      } catch (error: unknown) {
        console.error(`failed to create dir ${songDir}:`, error);
        continue;
      }

      let existingFiles: string[] = [];
      try {
        existingFiles = await fs.readdir(songDir);
      } catch {
        existingFiles = [];
      }

      const slideNumbers = existingFiles
        .filter((file) => file.startsWith("slide-") && file.endsWith(".png"))
        .map((file) => {
          const match = file.match(/slide-(\d+)\.png$/);
          return match ? parseInt(match[1]) : -1;
        })
        .filter((num) => num >= 0);

      const nextSlideNumber =
        slideNumbers.length > 0 ? Math.max(...slideNumbers) + 1 : 0;

      for (let i = 0; i < pngImages.length; i++) {
        const sourcePng = pngImages[i];
        const slideNumber = nextSlideNumber + i;
        const destPng = path.join(songDir, `slide-${slideNumber}.png`);

        try {
          await fs.copyFile(sourcePng, destPng);
          console.log(
            `copied: ${path.basename(
              sourcePng
            )} -> ${songName}/slide-${slideNumber}.png`
          );
        } catch (error: unknown) {
          console.error(`failed to copy ${sourcePng} to ${destPng}:`, error);
        }
      }
    }

    // limpiar dir temp
    try {
      for (const pngImage of pngImages) {
        await fs.unlink(pngImage);
      }
      await fs.rmdir(tempPngDir);
    } catch (error: unknown) {
      console.error(`failed to clean temp dir:`, error);
    }

    // eliminar pdf inmediatamente
    try {
      await fs.unlink(pdfFile);
    } catch (error: unknown) {
      console.error(`failed to delete ${pdfFile}:`, error);
    }
  }
}
