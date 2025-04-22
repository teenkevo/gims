import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const files = formData.getAll("files") as File[];

    // Upload each file to Sanity
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        // Get file details
        const fileType = file.type;
        const fileName = file.name;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Sanity
        const result = await writeClient.assets.upload("file", buffer, {
          filename: fileName,
          contentType: fileType,
        });

        return {
          fileId: result._id,
          url: result.url,
          fileName: result.originalFilename,
          key: result._key,
        };
      })
    );

    // Return the uploaded files details and document ID
    return NextResponse.json({
      success: true,
      files: uploadResults,
    });
  } catch (error) {
    console.error("Error uploading files to Sanity:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
