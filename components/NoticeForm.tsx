import { useState, useEffect, FormEvent } from "react";
import type { Notice, NoticeFormData, ValidationIssue } from "@/lib/types";
import { format } from "date-fns";

interface NoticeFormProps {
  initialData?: Notice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_FORM: NoticeFormData = {
  title: "",
  body: "",
  category: "General",
  priority: "Normal",
  publishDate: format(new Date(), "yyyy-MM-dd"),
  imageUrl: "",
};

export default function NoticeForm({ initialData, onSuccess, onCancel }: NoticeFormProps) {
  const [formData, setFormData] = useState<NoticeFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        body: initialData.body,
        category: initialData.category,
        priority: initialData.priority,
        publishDate: format(new Date(initialData.publishDate), "yyyy-MM-dd"),
        imageUrl: initialData.imageUrl ?? "",
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
    setErrors({});
    setGlobalError("");
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGlobalError("");

    const localErrors: Record<string, string> = {};
    if (!formData.title.trim()) localErrors.title = "Title is required";
    if (!formData.body.trim()) localErrors.body = "Body is required";
    if (!formData.publishDate) localErrors.publishDate = "Date is required";
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEditing ? `/api/notices/${initialData!.id}` : "/api/notices";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.issues) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of data.issues as ValidationIssue[]) {
            fieldErrors[issue.field] = issue.message;
          }
          setErrors(fieldErrors);
        } else {
          setGlobalError(data.error ?? "Something went wrong");
        }
        return;
      }
      onSuccess();
    } catch {
      setGlobalError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {globalError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {globalError}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title" name="title" type="text"
          value={formData.title} onChange={handleChange}
          placeholder="Enter notice title…" maxLength={255}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-gray-900
            placeholder-gray-400 outline-none transition-colors
            focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            ${errors.title ? "border-red-400 bg-red-50" : "border-gray-200"}`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1.5">
          Body <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body" name="body"
          value={formData.body} onChange={handleChange}
          placeholder="Write the notice content…" rows={5} maxLength={5000}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-gray-900
            placeholder-gray-400 outline-none resize-y transition-colors
            focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            ${errors.body ? "border-red-400 bg-red-50" : "border-gray-200"}`}
        />
        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
            Category
          </label>
          <select
            id="category" name="category"
            value={formData.category} onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
              text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="General">General</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1.5">
            Priority
          </label>
          <select
            id="priority" name="priority"
            value={formData.priority} onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
              text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Publish Date */}
      <div>
        <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1.5">
          Publish Date <span className="text-red-500">*</span>
        </label>
        <input
          id="publishDate" name="publishDate" type="date"
          value={formData.publishDate} onChange={handleChange}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-gray-900
            outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            ${errors.publishDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
        />
        {errors.publishDate && <p className="mt-1 text-xs text-red-600">{errors.publishDate}</p>}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1.5">
          Image URL <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="imageUrl" name="imageUrl" type="url"
          value={formData.imageUrl} onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-gray-900
            placeholder-gray-400 outline-none transition-colors
            focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
            ${errors.imageUrl ? "border-red-400 bg-red-50" : "border-gray-200"}`}
        />
        {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={onCancel} disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100
            hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600
            hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60
            flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {isEditing ? "Saving…" : "Publishing…"}
            </>
          ) : isEditing ? "Save Changes" : "Publish Notice"}
        </button>
      </div>
    </form>
  );
}