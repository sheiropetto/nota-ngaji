"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create">("list");
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setNotes(data);
    setLoading(false);
  };

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
      setNotes(notes.filter((note) => note.id !== id));
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

  return (
    <main className="min-h-[calc(100vh-64px)] bg-neutral-950 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500">Nota Kuliyah</h1>
            <p className="text-neutral-400">Catat dan simpan ilmu yang dipelajari.</p>
          </div>
          {view === "list" && (
            <button
              onClick={() => { setView("create"); setEditingId(null); setTitle(""); }}
              className="rounded-full bg-emerald-600 px-6 py-2 font-bold text-white transition-all hover:bg-emerald-500 hover:scale-105"
            >
              + New Note
            </button>
          )}
        </header>

        {view === "create" ? (
          <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <input
              type="text"
              placeholder="Tajuk Kuliyah (e.g. Tafsir Surah Al-Fatihah)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-4 text-xl font-bold text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
            />

            {/* Rich Text Toolbar */}
            <div className="flex gap-2 border-b border-neutral-800 bg-neutral-800/50 p-2 rounded-t-lg">
              <button type="button" onClick={() => formatDoc('bold')} className="p-2 hover:bg-neutral-700 rounded font-bold" title="Bold">B</button>
              <button type="button" onClick={() => formatDoc('italic')} className="p-2 hover:bg-neutral-700 rounded italic" title="Italic">I</button>
              <button type="button" onClick={() => formatDoc('underline')} className="p-2 hover:bg-neutral-700 rounded underline" title="Underline">U</button>
              <div className="w-px h-6 bg-neutral-700 mx-1 self-center"></div>
              <button type="button" onClick={() => formatDoc('insertOrderedList')} className="p-2 hover:bg-neutral-700 rounded" title="Numbered List">1.</button>
              <button type="button" onClick={() => formatDoc('insertUnorderedList')} className="p-2 hover:bg-neutral-700 rounded" title="Bullet List">•</button>
            </div>

            {/* Rich Text Editor Area */}
            <div
              ref={editorRef}
              className="min-h-[300px] w-full resize-none rounded-b-lg border border-t-0 border-neutral-700 bg-neutral-950 p-4 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none overflow-y-auto"
              contentEditable
              suppressContentEditableWarning
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-500"
              >
                {editingId ? "Update Note" : "Save Note"}
              </button>
              <button
                type="button"
                onClick={resetEditor}
                className="rounded-lg border border-neutral-700 px-6 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <p className="text-neutral-500">Loading notes...</p>
            ) : notes.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-neutral-800 p-12 text-center text-neutral-500">
                Belum ada nota. Mulakan catatan sekarang!
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="group relative flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-emerald-500/50">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-white">{note.title}</h3>
                    {/* Render HTML Content safely */}
                    <div 
                      className="text-neutral-400 line-clamp-4 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                    <span className="text-xs text-neutral-600">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-sm text-emerald-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
