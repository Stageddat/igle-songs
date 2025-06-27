import { uploadSlides } from "@/modules/fileManager/uploadSlides";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { song, slides } = body;

    if (!song || !Array.isArray(slides)) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await uploadSlides(song, slides);

    return new Response(
      JSON.stringify({
        message: "data received",
        songName: song,
        slides: slides,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en el handler:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
