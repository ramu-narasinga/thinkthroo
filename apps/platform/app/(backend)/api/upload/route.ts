import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

export async function POST(req: Request) {
  // 1. Verify authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Check for Vercel Blob token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      { status: 401 }
    );
  }

  // 3. Extract file data from request
  const file = req.body || "";
  const filename = req.headers.get("x-vercel-filename") || "file.txt";
  const contentType = req.headers.get("content-type") || "text/plain";
  const fileType = `.${contentType.split("/")[1]}`;

  // 4. Construct final filename
  const finalName = filename.includes(fileType) 
    ? filename 
    : `${filename}${fileType}`;

  // 5. Upload to Vercel Blob with user-specific path
  const blob = await put(`${user.id}/${finalName}`, file, {
    contentType,
    access: "public",
  });

  return NextResponse.json(blob);
}
