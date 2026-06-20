import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { NoticeSchema } from "@/lib/validations";
import { ZodError } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return handleGet(req, res);
  } else if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { priority: "desc" },
        { publishDate: "desc" },
      ],
    });
    return res.status(200).json({ notices });
  } catch (error) {
    console.error("[GET /api/notices]", error);
    return res.status(500).json({ error: "Failed to fetch notices" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validated = NoticeSchema.parse(req.body);
    const notice = await prisma.notice.create({
      data: {
        title: validated.title,
        body: validated.body,
        category: validated.category,
        priority: validated.priority,
        publishDate: validated.publishDate,
        imageUrl: validated.imageUrl || null,
      },
    });
    return res.status(201).json({ notice });
  } catch (error) {
  if (error instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed",
      issues: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  console.error("[POST /api/notices]", error);
  return res.status(500).json({ error: "Failed to create notice" });
}
}