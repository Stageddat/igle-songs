import getReviewSongs from "@/modules/fileManager/getReviewSongs";

export async function GET() {
  return new Response(JSON.stringify(await getReviewSongs()));
}
