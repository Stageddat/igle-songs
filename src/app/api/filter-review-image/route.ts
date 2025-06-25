export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { song, slides } = body;

    console.log("📩 Recibido en backend:");
    console.log("🎵 Canción:", song);
    console.log("🖼️ Slides:", slides);

    if (!song || !Array.isArray(slides)) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Datos recibidos correctamente" }),
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
