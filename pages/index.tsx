import { useState, useCallback } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import prisma from "@/lib/prisma";
import type { Notice } from "@/lib/types";
import NoticeCard from "@/components/NoticeCard";
import NoticeForm from "@/components/NoticeForm";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";

interface HomeProps {
  initialNotices: Notice[];
}

export default function Home({ initialNotices }: HomeProps) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const refreshNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      setNotices(data.notices);
    } catch {
      showToast("Failed to refresh notices", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddClick = () => { setEditingNotice(null); setIsModalOpen(true); };
  const handleEditClick = (notice: Notice) => { setEditingNotice(notice); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingNotice(null); };

  const handleFormSuccess = async () => {
    const wasEditing = !!editingNotice;
    handleModalClose();
    showToast(wasEditing ? "Notice updated!" : "Notice published!", "success");
    await refreshNotices();
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Notice deleted", "success");
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch {
      showToast("Failed to delete notice", "error");
    }
  };

  const urgentCount = notices.filter((n) => n.priority === "Urgent").length;

  return (
    <>
      <Head>
        <title>Notice Board</title>
        <meta name="description" content="School and institutional notice board" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-none">Notice Board</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {notices.length} notice{notices.length !== 1 ? "s" : ""}
                  {urgentCount > 0 && (
                    <span className="ml-1.5 text-red-500 font-medium">· {urgentCount} urgent</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Notice</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && notices.length === 0 && <EmptyState onAdd={handleAddClick} />}

          {!isLoading && notices.length > 0 && (
            <>
              {urgentCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-widest">
                    Urgent Notices
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {notices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingNotice ? "Edit Notice" : "New Notice"}
        onClose={handleModalClose}
      >
        <NoticeForm
          initialData={editingNotice}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
    });
    return { props: { initialNotices: JSON.parse(JSON.stringify(notices)) } };
  } catch {
    return { props: { initialNotices: [] } };
  }
};