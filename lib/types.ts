export type Category = "Exam" | "Event" | "General";
export type Priority = "Normal" | "Urgent";

export interface Notice {
  id: number;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  publishDate: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFormData {
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  publishDate: string;
  imageUrl: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  issues?: ValidationIssue[];
}