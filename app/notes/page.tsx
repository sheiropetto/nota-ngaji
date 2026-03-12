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
        alert("Nota berjaya dikemaskini.");
      }
    } else {
      // Create new note
      const { data } = await supabase
        .from("notes")
        .insert([{ title, content }])
        .select();

      if (data) {
        setNotes([data[0], ...notes]);
        resetEditor();
        alert("Nota berjaya disimpan.");
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
    if (!confirm("Adakah anda pasti mahu memadam nota ini?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes(notes.filter((note) => note.id !== id));
      alert("Nota telah dipadam.");
    }
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="min-h-full bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto max-w-4xl space-y-8">
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
              + New Note
            </button>
          )}
        </header>

        {view === "create" ? (
          <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100">
            <input
              type="text"
              placeholder="Tajuk Kuliyah (e.g. Tafsir Surah Al-Fatihah)"
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
              className="min-h-[300px] w-full resize-none rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 p-4 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white overflow-y-auto transition-colors"
              contentEditable
              suppressContentEditableWarning
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white hover:bg-emerald-700 transition-transform active:scale-95 shadow-lg shadow-emerald-100"
              >
                {editingId ? "Update Note" : "Save Note"}
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
                placeholder="Cari nota mengikut tajuk..."
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
                  {totalCount > 0 && searchTerm ? (
                    <p>Tiada nota dijumpai untuk carian "{searchTerm}".</p>
                  ) : (
                    <p>Belum ada nota. Mulakan catatan sekarang!</p>
                  )}
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg shadow-sm">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{note.title}</h3>
                    {/* Render HTML Content safely */}
                    <div 
                      className="text-gray-600 line-clamp-4 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-sm text-emerald-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-sm text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
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
      </div>
    </main>
  );
}
