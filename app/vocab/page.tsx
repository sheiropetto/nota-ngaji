"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type VocabItem = {
  id: number;
  arabic: string;
  meaning: string;
};

export default function VocabPage() {
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [arabic, setArabic] = useState("");
  const [meaning, setMeaning] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data on load
  useEffect(() => {
    const fetchVocab = async () => {
      const { data, error } = await supabase
        .from('vocab')
        .select('*')
        .order('id', { ascending: false });
      
      if (data) setVocabList(data);
      setLoading(false);
    };

    fetchVocab();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabic.trim() || !meaning.trim()) return;

    const { data, error } = await supabase
      .from('vocab')
      .insert([{ arabic: arabic.trim(), meaning: meaning.trim() }])
      .select();

    if (data) {
      setVocabList([data[0], ...vocabList]);
      setArabic("");
      setMeaning("");
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('vocab')
      .delete()
      .eq('id', id);

    if (!error) {
      setVocabList(vocabList.filter((item) => item.id !== id));
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-neutral-950 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-emerald-500">Personal Vocab</h1>
          <p className="text-neutral-400">Build your own dictionary of Arabic terms.</p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleAdd} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-400">
              Arabic Word (Perkataan Arab)
            </label>
            <input
              type="text"
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-right text-xl text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-400">
              Meaning (Maksud)
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. Patience / Kesabaran"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-500 active:scale-95"
          >
            Add to List
          </button>
        </form>

        {/* List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Saved Words</h2>
          
          {loading ? (
            <div className="text-center text-neutral-500 py-10 animate-pulse">
              Loading dictionary...
            </div>
          ) : vocabList.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 text-neutral-500">
              <p>No words saved yet.</p>
            </div>
          ) : (
            vocabList.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-emerald-500/50"
              >
                <div>
                  <h3 className="mb-1 text-3xl font-serif text-emerald-400" dir="rtl">
                    {item.arabic}
                  </h3>
                  <p className="text-neutral-300 font-medium">{item.meaning}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-neutral-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                  title="Delete word"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
