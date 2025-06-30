import fs from "node:fs/promises";
import path from "node:path";
import { r2 } from "@/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export async function uploadSlides(songName: string, slides: string[]) {
  const songsDbPath = path.join(process.cwd(), "data", "songs.json");
  const songsDbContent = await fs.readFile(songsDbPath, "utf-8");
  const songsDb = JSON.parse(songsDbContent);
  const pngsDir = path.join(process.cwd(), "/data/pngs");
  const songDir = path.join(pngsDir, songName);
  const files = await fs.readdir(songDir);
  const pngFiles = files.filter((file) => file.endsWith(".png"));

  // poner orden canciones repetidas
  let finalSongName = songName;
  let counter = 2;

  // verificar si ya existe cancion
  while (songsDb.songs && songsDb.songs[finalSongName]) {
    finalSongName = `${songName}-${counter}`;
    counter++;
  }

  // limpiar archivos no usados
  for (const file of pngFiles) {
    if (!slides.includes(file)) {
      const filePath = path.join(songDir, file);
      await fs.unlink(filePath);
    }
  }

  // renombrar archivos en orden
  for (let i = 0; i < slides.length; i++) {
    const originalName = slides[i];
    const oldPath = path.join(songDir, originalName);
    const newName = `${finalSongName}-${i}.png`; // usar finalSongName con sufijo para evitar conflictos
    const newPath = path.join(songDir, newName);

    try {
      await fs.rename(oldPath, newPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(
          `failed to rename ${oldPath} to ${newPath}:`,
          err.message
        );
      } else {
        console.error(`failed to rename ${oldPath} to ${newPath}:`, err);
      }
    }
  }

  const uploadSlides = await fs.readdir(songDir);
  console.log(uploadSlides);

  const uploadedLinks: string[] = [];

  // subir archivos a r2
  for (const file of uploadSlides) {
    const filePath = path.join(songDir, file);
    const fileContent = await fs.readFile(filePath);

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: file,
        Body: fileContent,
        ContentType: "image/png",
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${encodeURIComponent(
      file
    )}`;
    uploadedLinks.push(publicUrl);
  }

  console.log(uploadedLinks);

  const nowDate = new Date().toISOString();

  const updatedSongs = {
    ...songsDb.songs,
    [finalSongName]: {
      links: uploadedLinks,
      uploadDate: nowDate,
    },
  };

  const newSongDb = {
    ...songsDb,
    updateDate: nowDate,
    songs: updatedSongs,
  };

  await fs.writeFile(
    path.join(process.cwd(), "data", "songs.json"),
    JSON.stringify(newSongDb, null, 2),
    "utf-8"
  );

  // borrar carpeta temporal
  await fs.rm(songDir, { recursive: true, force: true });

  return {
    songName: finalSongName,
    slides: uploadSlides,
    links: uploadedLinks,
  };
}
