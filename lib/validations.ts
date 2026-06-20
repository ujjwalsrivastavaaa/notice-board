import { z } from "zod";

export const NoticeSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be under 255 characters")
    .trim(),

  body: z
    .string()
    .min(10, "Body must be at least 10 characters")
    .max(5000, "Body must be under 5000 characters")
    .trim(),

 category: z
  .enum(["Exam", "Event", "General"])
  .refine((val) => ["Exam", "Event", "General"].includes(val), {
    message: "Category must be Exam, Event, or General",
  }),

priority: z
  .enum(["Normal", "Urgent"])
  .refine((val) => ["Normal", "Urgent"].includes(val), {
    message: "Priority must be Normal or Urgent",
  }),

  publishDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val)),

  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .max(500, "Image URL is too long")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const NoticeUpdateSchema = NoticeSchema.partial();

export type NoticeInput = z.input<typeof NoticeSchema>;
export type NoticeUpdateInput = z.input<typeof NoticeUpdateSchema>;