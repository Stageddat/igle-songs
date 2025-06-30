import { promises as fs } from "fs";
import path from "path";

// esta mierda no furula bro

export async function POST(req: Request) {
  return new Response(JSON.stringify({ error: "not implemented" }));

  try {
    const filePath = path.resolve(process.cwd(), "data/songs.json");

    const data = await fs.readFile(filePath, "utf-8");
    const songs = JSON.parse(data) as Record<string, any>;

    const sortedKeys = Object.keys(songs).sort((a, b) =>
      a.localeCompare(b, "zh")
    );

    const sortedSongs: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedSongs[key] = songs[key];
    }

    return new Response(JSON.stringify(sortedSongs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("error in /order.list", error);
    return new Response(
      JSON.stringify({ error: "failed to read songs.json" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
