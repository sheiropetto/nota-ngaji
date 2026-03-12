"use client";

import { useState, useEffect } from "react";
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
  const [content, setContent] = useState("");

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
    if (!title.trim() || !content.trim()) return;

    const { data, error } = await supabase
      .from("notes")
      .insert([{ title, content }])
      .select();

    if (data) {
      setNotes([data[0], ...notes]);
      setView("list");
      setTitle("");
      setContent("");
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes(notes.filter((note) => note.id !== id));
    }
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
              onClick={() => setView("create")}
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
            <textarea
              placeholder="Tulis nota anda di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-64 w-full resize-none rounded-lg border border-neutral-700 bg-neutral-950 p-4 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-500"
              >
                Save Note
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
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
                    <p className="whitespace-pre-wrap text-neutral-400 line-clamp-4">{note.content}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                    <span className="text-xs text-neutral-600">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-sm text-red-500 opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                    >
                      Delete
                    </button>
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
