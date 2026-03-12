"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

const ITEMS_PER_PAGE = 6;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create">("list");
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [readNote, setReadNote] = useState<Note | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from("notes").select("*", { count: 'exact' });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (data) {
        setNotes(data);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editorRef.current?.innerHTML || "";

    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      // Update existing note
      const { error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", editingId);

      if (!error) {
        setNotes(notes.map((n) => (n.id === editingId ? { ...n, title, content } : n)));
        resetEditor();
        showToast("Nota berjaya dikemaskini.");
      }
    } else {
      // Create new note
      const { data } = await supabase
        .from("notes")
        .insert([{ title, content }])
        .select();

      if (data) {
        // Go back to page 1 to see the new note
        if (currentPage !== 1) setCurrentPage(1);
        else fetchNotes(); // Refetch to see the new note
        resetEditor();
        showToast("Nota berjaya disimpan.");
      }
    }
  };

  const resetEditor = () => {
    setView("list");
    setTitle("");
    setEditingId(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      fetchNotes(); // Refetch notes for the current page
      showToast("Nota telah dipadam.");
    }
    setDeleteConfirmationId(null);
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setEditingId(note.id);
    setView("create");
    // We use setTimeout to ensure the editor div is rendered before setting content
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.content;
    }, 0);
  };

  const formatDoc = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleShare = (note: Note) => {
    const textContent = note.content.replace(/<[^>]*>/g, '\n'); // Simple strip tags
    const text = `*${note.title}*\n\n${textContent}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="min-h-full bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600">Nota Kuliyah</h1>
            <p className="text-gray-500">Catat dan simpan ilmu yang dipelajari.</p>
          </div>
          {view === "list" && (
            <button
              onClick={() => { setView("create"); setEditingId(null); setTitle(""); }}
              className="rounded-full bg-emerald-600 px-6 py-2 font-bold text-white transition-all hover:bg-emerald-700 hover:scale-105 shadow-md shadow-emerald-100"
            >
              + Baru
            </button>
          )}
        </header>

        {view === "create" ? (
          <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100">
            <input
              type="text"
              placeholder="Tajuk Kuliyah"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xl font-bold text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white transition-colors"
            />

            {/* Rich Text Toolbar */}
            <div className="flex gap-2 border-b border-gray-200 bg-gray-50 p-2 rounded-t-lg text-gray-600">
              <button type="button" onClick={() => formatDoc('bold')} className="p-2 hover:bg-gray-200 rounded font-bold" title="Bold">B</button>
              <button type="button" onClick={() => formatDoc('italic')} className="p-2 hover:bg-gray-200 rounded italic" title="Italic">I</button>
              <button type="button" onClick={() => formatDoc('underline')} className="p-2 hover:bg-gray-200 rounded underline" title="Underline">U</button>
              <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
              <button type="button" onClick={() => formatDoc('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded" title="Numbered List">1.</button>
              <button type="button" onClick={() => formatDoc('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="Bullet List">•</button>
            </div>

            {/* Rich Text Editor Area */}
            <div
              ref={editorRef}
              className="min-h-[300px] w-full resize-none rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 p-4 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white overflow-y-auto transition-colors prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              contentEditable
              suppressContentEditableWarning
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white hover:bg-emerald-700 transition-transform active:scale-95 shadow-lg shadow-emerald-100"
              >
                {editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={resetEditor}
                className="rounded-full border border-gray-200 px-8 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-transform active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="w-full">
              <input
                type="text"
                placeholder="Cari tajuk nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white p-4 pl-6 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {loading ? (
                <p className="text-gray-500 col-span-full text-center">Loading notes...</p>
              ) : notes.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                  {searchTerm ? (
                    <p>Tiada nota dijumpai untuk carian "{searchTerm}".</p>
                  ) : (
                    <p>Belum ada nota. Mulakan catatan sekarang!</p>
                  )}
                </div>
              ) : (
                notes.map((note) => (
                  <div 
                    key={note.id} 
                    onClick={() => setReadNote(note)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg shadow-sm cursor-pointer"
                  >
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{note.title}</h3>
                    {/* Render HTML Content safely */}
                    <div 
                      className="text-gray-600 line-clamp-4 prose max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(note)}
                        className="p-2 rounded-full text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        title="Share to WhatsApp"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === note.id ? null : note.id)}
                          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                        </button>

                        {activeMenuId === note.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom-right">
                            <button onClick={() => { setReadNote(note); setActiveMenuId(null); }} className="px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                              Display
                            </button>
                            <button onClick={() => { handleEdit(note); setActiveMenuId(null); }} className="px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                              Edit
                            </button>
                            <button onClick={() => { setDeleteConfirmationId(note.id); setActiveMenuId(null); }} className="px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 col-span-full">
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm">
            {toastMessage}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmationId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-gray-900">Padam Nota?</h3>
              <p className="text-gray-500">Tindakan ini tidak boleh dikembalikan.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteConfirmationId)} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600">
                  Padam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Read Note Modal */}
        {readNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 pr-8">{readNote.title}</h2>
                <button onClick={() => setReadNote(null)} className="p-1 text-gray-400 hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div 
                className="overflow-y-auto pr-2 text-gray-700 prose max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: readNote.content }}
              />
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                {new Date(readNote.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
