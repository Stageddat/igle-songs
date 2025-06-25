import fs from "node:fs/promises";
import path from "node:path";
import checkDir from "./checkDir";
import { convertPptxToPdf } from "./pptxToPdf";
import { filterSongNames, filterSongs } from "./filterSongs";
import { convertPdfToPng } from "./PdfToPng";

const pptxsDir = path.join(process.cwd(), "/data/pptxs");
const pdfsDir = path.join(process.cwd(), "/data/pdfs");
const pngsDir = path.join(process.cwd(), "/data/pngs");

export async function processFiles() {
  await checkDir();
  console.log("procesando archivos...");

  // comprobar nombres pptx
  const songs: string[] = [];
  const files = await fs.readdir(pptxsDir);

  for (const file of files) {
    const song = filterSongs(file);
    if (!song) continue;
    songs.push(song[0], song[1]);
  }
  console.log(songs);

  // leer pptx
  const pptxFiles: string[] = files.map((file) => path.join(pptxsDir, file));

  // eliminar pptx q no son canciones
  for (const pptxFile of pptxFiles) {
    const fileName = path.basename(pptxFile);
    const isSong = songs.some((songName) => fileName.includes(songName));
    if (!isSong) {
      console.log(`Eliminando archivo no canción: ${fileName}`);
      await fs.unlink(pptxFile);
    }
  }

  // leer pptx filtrados
  const filteredPptxFiles = await fs.readdir(pptxsDir);
  const pptxPaths = filteredPptxFiles.map((file) => path.join(pptxsDir, file));

  // convertir pptx a pdf
  const pdfFiles: string[] = [];
  for (const pptxFile of pptxPaths) {
    const baseName = path.parse(pptxFile).name;
    const pdfFile = path.join(pdfsDir, `${baseName}.pdf`);
    pdfFiles.push(pdfFile);
    await convertPptxToPdf(pptxFile, pdfsDir);
  }

  // borrar pptx
  for (const pptxFile of pptxPaths) {
    try {
      await fs.unlink(pptxFile);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`failed to delete ${pptxFile}:`, error.message);
      } else {
        console.error(`failed to delete ${pptxFile}:`, error);
      }
    }
  }

  // convertir pdf a png y organizar por canciones
  for (const pdfFile of pdfFiles) {
    const baseName = path.parse(pdfFile).name;

    // conseguir nombres otra vez
    const songNames = filterSongNames(baseName);
    console.log(songNames);
    if (!songNames) {
      console.error(`failed to get song names: ${baseName}`);
      continue;
    }

    // transformar pdf a png in temp dir
    const tempPngDir = path.join(pngsDir, "temp");
    const pngImages = await convertPdfToPng(pdfFile, tempPngDir);

    if (pngImages.length === 0) {
      console.error(`failed to convert pdf to png: ${baseName}`);
      continue;
    }

    // copiar imagen a las dos carpetas
    for (const songName of songNames) {
      const songDir = path.join(pngsDir, songName);

      // crear dir si no existe
      try {
        await fs.mkdir(songDir, { recursive: true });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`failed to create dir ${songDir}:`, error.message);
        } else {
          console.error(`failed to create dir ${songDir}:`, error);
        }
        continue;
      }

      // obtener ultimo slide
      let existingFiles: string[] = [];
      try {
        existingFiles = await fs.readdir(songDir);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`failed to read dir ${songDir}:`, error.message);
        } else {
          console.error(`failed to read dir ${songDir}:`, error);
        }
        // dir no existe o vacío
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

      // copiar cada imagen
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
          if (error instanceof Error) {
            console.error(
              `failed to copy ${sourcePng} to ${destPng}:`,
              error.message
            );
          } else {
            console.error(`failed to copy ${sourcePng} to ${destPng}:`, error);
          }
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
      if (error instanceof Error) {
        console.error(`failed to clean temp dir:`, error.message);
      } else {
        console.error(`failed to clean temp dir:`, error);
      }
    }
  }

  // borrar pdf
  for (const pdfFile of pdfFiles) {
    try {
      await fs.unlink(pdfFile);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`failed to delete ${pdfFile}:`, error.message);
      } else {
        console.error(`failed to delete ${pdfFile}:`, error);
      }
    }
  }
}
