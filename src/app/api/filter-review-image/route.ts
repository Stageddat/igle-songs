import { uploadSlides } from "@/modules/fileManager/uploadSlides";
import { validateAdminPassword } from "@/middleware/auth";

export async function POST(req: Request) {
  try {
    const authResult = validateAdminPassword(req);

    if (!authResult.isValid) {
      return new Response(
        JSON.stringify({
          message: authResult.error || "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    console.error("error en el handler:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
