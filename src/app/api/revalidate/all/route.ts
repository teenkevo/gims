import { revalidatePath } from "next/cache";

export async function GET() {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
    revalidatePath("/", "layout");
    return Response.json({ message: "Layout revalidated" });
  }
  return Response.json({
    message: "This route is configured to only revalidate the layout in development and production",
  });
}
