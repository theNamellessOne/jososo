import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { relativeResumeDirPath } from "@/app/(features)/dashboard/service/dirconsts";

type Slug = { params: { name: string } };

export async function GET(_: NextRequest, { params }: Slug) {
  const name = params.name;

  const inputFile = path.join(
    process.cwd(),
    relativeResumeDirPath + `/${name}`,
  );

  if (!fs.existsSync(inputFile)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(inputFile);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
