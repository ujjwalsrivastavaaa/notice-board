import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { NoticeUpdateSchema } from "@/lib/validations";
import { ZodError } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = parseInt(req.query.id as string, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid notice ID" });
  }

  if (req.method === "GET") {
    return handleGet(id, res);
  } else if (req.method === "PUT" || req.method === "PATCH") {
    return handleUpdate(id, req, res);
  } else if (req.method === "DELETE") {
    return handleDelete(id, res);
  } else {
    res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(id: number, res: NextApiResponse) {
  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    return res.status(200).json({ notice });
  } catch (error) {
    console.error("[GET /api/notices/:id]", error);
    return res.status(500).json({ error: "Failed to fetch notice" });
  }
}

async function handleUpdate(
  id: number,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Notice not found" });
    }

    const validated = NoticeUpdateSchema.parse(req.body);

    const notice = await prisma.notice.update({
      where: { id },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.body !== undefined && { body: validated.body }),
        ...(validated.category !== undefined && { category: validated.category }),
        ...(validated.priority !== undefined && { priority: validated.priority }),
        ...(validated.publishDate !== undefined && { publishDate: validated.publishDate }),
        ...(validated.imageUrl !== undefined && {
          imageUrl: validated.imageUrl || null,
        }),
      },
    });
    return res.status(200).json({ notice });
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
    console.error("[PUT /api/notices/:id]", error);
    return res.status(500).json({ error: "Failed to update notice" });
  }
}

async function handleDelete(id: number, res: NextApiResponse) {
  try {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Notice not found" });
    }
    await prisma.notice.delete({ where: { id } });
    return res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/notices/:id]", error);
    return res.status(500).json({ error: "Failed to delete notice" });
  }
}