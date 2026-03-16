"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  label: string;
};

const ITEMS_PER_PAGE = 6;
const LABELS = ['Semua', 'Akhlak', 'Feqah', 'Tauhid', 'Al-Quran & Hadis', 'Tafsir', 'Umum', 'Lain-lain'];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "read">("list");
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState<string>('Umum');
  const [filterLabel, setFilterLabel] = useState<string>('Semua');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [readNote, setReadNote] = useState<Note | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    let query = supabase.from("notes").select("*", { count: 'exact' });
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    if (filterLabel !== 'Semua') query = query.eq('label', filterLabel);
    const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (data) { setNotes(data); setTotalCount(count || 0); }
    setLoading(false);
  }, [currentPage, searchTerm, filterLabel]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editorRef.current?.innerHTML || "";
    if (!title.trim() || !content.trim()) return;
    const noteData = { title, content, label };
    if (editingId) {
      const { error } = await supabase.from("notes").update(noteData).eq("id", editingId);
      if (!error) { showToast("Nota dikemaskini."); resetEditor(); fetchNotes(); }
    } else {
      const { data } = await supabase.from("notes").insert([noteData]).select();
      if (data) { showToast("Nota disimpan."); resetEditor(); setCurrentPage(1); fetchNotes(); }
    }
  };

  const resetEditor = () => {
    setView("list");
    setTitle("");
    setLabel("Umum");
    setEditingId(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) { fetchNotes(); showToast("Nota dipadam."); }
    setDeleteConfirmationId(null);
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setLabel(note.label || 'Umum');
    setEditingId(note.id);
    setView("create");
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = note.content; }, 0);
  };

  const formatDoc = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleShare = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const textContent = note.content.replace(/<[^>]*>/g, '\n');
    const text = `*${note.title}*\n\n${textContent}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen p-4 pb-24 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-3xl space-y-6">
        {view === "read" && readNote ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="flex items-center justify-between border-b pb-4">
              <button onClick={() => setView("list")} className="text-[#059669] font-bold active:opacity-50">← Kembali</button>
              <span className="px-3 py-1 bg-[#059669]/10 text-[#059669] text-xs rounded-full font-bold uppercase tracking-wider">{readNote.label}</span>
            </header>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
              <h1 className="text-2xl font-bold mb-4 dark:text-white">{readNote.title}</h1>
              <article className="prose prose-emerald dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: readNote.content }} />
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C9A7] to-[#059669]">Nota Kuliyah</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Simpan ilmu, raih keberkatan.</p>
              </div>
              {view === "list" && (
                <button onClick={() => { setView("create"); setEditingId(null); setTitle(""); }} className="rounded-full bg-gradient-to-r from-[#00C9A7] to-[#059669] px-6 py-2.5 font-bold text-white shadow-lg active:scale-95 transition-transform">+ Baru</button>
              )}
            </header>

            {view === "create" ? (
              <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 shadow-xl dark:shadow-none">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {LABELS.filter(l => l !== 'Semua').map(l => (
                    <button key={l} type="button" onClick={() => setLabel(l)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${label === l ? 'bg-gradient-to-r from-[#00C9A7] to-[#059669] text-white border-transparent' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>{l}</button>
                  ))}
                </div>
                <input type="text" placeholder="Tajuk..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 p-4 text-xl font-bold focus:ring-2 focus:ring-[#00C9A7] outline-none" />
                <div className="flex items-center gap-2 border-y border-gray-100 dark:border-gray-800 py-3 text-gray-600 dark:text-gray-300">
                  <button type="button" onClick={() => formatDoc('bold')} className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-600">B</button>
                  <button type="button" onClick={() => formatDoc('italic')} className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl italic flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-600">I</button>
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                  <button type="button" onClick={() => formatDoc('insertUnorderedList')} className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  </button>
                  <button type="button" onClick={() => formatDoc('insertOrderedList')} className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
                  </button>
                </div>
                <div ref={editorRef} className="min-h-[300px] p-2 focus:outline-none prose dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 dark:text-gray-100" contentEditable suppressContentEditableWarning />
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-[#00C9A7] to-[#059669] text-white py-4 rounded-full font-bold active:opacity-90">{editingId ? "Kemaskini" : "Simpan"}</button>
                  <button type="button" onClick={resetEditor} className="px-6 py-4 text-gray-500 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-full transition-colors">Batal</button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <input type="text" placeholder="Cari nota..." className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 px-6 shadow-sm dark:shadow-none focus:ring-2 focus:ring-[#00C9A7] outline-none dark:text-white dark:placeholder-gray-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {LABELS.map(l => (
                      <button key={l} onClick={() => setFilterLabel(l)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${filterLabel === l ? 'bg-gradient-to-r from-[#00C9A7] to-[#059669] border-transparent text-white shadow-md dark:shadow-none' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-400'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 italic">Memuatkan...</div>
                  ) : notes.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-gray-400 dark:text-gray-500">Tiada nota dijumpai.</div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} onClick={() => { setReadNote(note); setView("read"); }} className="group relative flex flex-col justify-between rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-6 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer shadow-sm dark:shadow-none">
                        <div>
                          <span className="text-[10px] font-bold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-2 py-0.5 rounded mb-2 inline-block">{note.label || 'Umum'}</span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{note.title}</h3>
                          <div className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: note.content }} />
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-4">
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{new Date(note.created_at).toLocaleDateString('ms-MY')}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => handleShare(e, note)} className="p-3 text-gray-400 active:text-[#00C9A7]">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                            </button>
                            <div className="relative">
                              <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === note.id ? null : note.id); }} className="p-3 text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-700 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                              </button>
                              {activeMenuId === note.id && (
                                <div className="absolute right-0 bottom-full mb-2 w-32 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700 z-10 overflow-hidden py-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleEdit(note); setActiveMenuId(null); }} className="w-full px-4 py-3 text-left text-sm active:bg-[#00C9A7]/10 dark:active:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">Sunting</button>
                                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(note.id); setActiveMenuId(null); }} className="w-full px-4 py-3 text-left text-sm active:bg-red-50 dark:active:bg-gray-700 text-red-600 dark:text-red-400 transition-colors">Padam</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {totalPages > 1 && view === "list" && (
              <div className="flex items-center justify-center gap-4 mt-12 py-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="rounded-full border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm disabled:opacity-30 active:bg-white dark:active:bg-gray-800 transition-colors">Sebelum</button>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="rounded-full border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm disabled:opacity-30 active:bg-white dark:active:bg-gray-800 transition-colors">Seterusnya</button>
              </div>
            )}
          </>
        )}
      </div>

      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl dark:shadow-none border dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2 dark:text-white">Padam Nota?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Nota ini akan dipadam selamanya.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-4 text-gray-500 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-full transition-colors">Batal</button>
              <button onClick={() => { if (deleteConfirmationId) handleDelete(deleteConfirmationId); }} className="flex-1 bg-red-500 text-white py-4 rounded-full font-bold active:bg-red-600 shadow-lg shadow-red-100">Padam</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toastMessage}
        </div>
      )}
    </main>
  );
}