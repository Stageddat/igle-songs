import fs from "node:fs/promises";
import path from "node:path";
import { r2 } from "@/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import songsDb from "../../../data/songs.json";

dotenv.config();

export async function uploadSlides(songName: string, slides: string[]) {
  const pngsDir = path.join(process.cwd(), "/data/pngs");
  const songDir = path.join(pngsDir, songName);

  const files = await fs.readdir(songDir);
  const pngFiles = files.filter((file) => file.endsWith(".png"));

  for (const file of pngFiles) {
    if (!slides.includes(file)) {
      const filePath = path.join(songDir, file);
      await fs.unlink(filePath);
    }
  }

  for (let i = 0; i < slides.length; i++) {
    const originalName = slides[i];
    const oldPath = path.join(songDir, originalName);
    const newName = `${songName}-${i}.png`;
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

  const newSong = {
    [songName]: {
      links: uploadedLinks,
    },
  };

  console.log(newSong);

  const newSongDb = {
    ...songsDb,
    updateDate: nowDate,
    songsList: [...songsDb.songsList, newSong],
  };

  await fs.writeFile(
    path.join(process.cwd(), "data", "songs.json"),
    JSON.stringify(newSongDb, null, 2),
    "utf-8"
  );

  // borrar carpeta
  await fs.rm(songDir, { recursive: true, force: true });

  return uploadSlides;
}
