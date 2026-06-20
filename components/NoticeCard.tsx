import { useState } from "react";
import { format } from "date-fns";
import type { Notice } from "@/lib/types";
import DeleteModal from "./DeleteModal";

interface NoticeCardProps {
  notice: Notice;
  onEdit: (notice: Notice) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Exam: "bg-blue-100 text-blue-700 border border-blue-200",
  Event: "bg-purple-100 text-purple-700 border border-purple-200",
  General: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function NoticeCard({ notice, onEdit, onDelete }: NoticeCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isUrgent = notice.priority === "Urgent";

  const formattedDate = (() => {
    try { return format(new Date(notice.publishDate), "dd MMM yyyy"); }
    catch { return notice.publishDate; }
  })();

  return (
    <>
      <article
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col
          transition-shadow duration-200 hover:shadow-md
          ${isUrgent
            ? "border-l-4 border-l-red-500 border-t-red-100 border-r-red-100 border-b-red-100"
            : "border-gray-100"
          }`}
      >
        {notice.imageUrl && (
          <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
            <img
              src={notice.imageUrl}
              alt={notice.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Urgent
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[notice.category]}`}>
              {notice.category}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
            {notice.title}
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
            {notice.body}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(notice)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </article>

      <DeleteModal
        isOpen={showDeleteModal}
        noticeTitle={notice.title}
        onConfirm={() => { setShowDeleteModal(false); onDelete(notice.id); }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}