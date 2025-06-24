import { NextResponse } from "next/server";
import { processFiles } from "@/modules/fileManager/fileManager";

let isProcessing = false;

export async function GET() {
  if (isProcessing) {
    return NextResponse.json({ message: "Processing already in progress" });
  }

  isProcessing = true;

  // Lanzar el proceso en segundo plano sin esperar a que termine
  processFiles()
    .catch(console.error)
    .finally(() => {
      isProcessing = false;
    });

  // Retornar respuesta inmediata
  return NextResponse.json({ message: "Processing started" });
}
