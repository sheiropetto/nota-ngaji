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
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabic.trim() || !meaning.trim()) return;

    if (editingId) {
      const { error } = await supabase
        .from('vocab')
        .update({ arabic: arabic.trim(), meaning: meaning.trim() })
        .eq('id', editingId);

      if (!error) {
        setVocabList(vocabList.map((item) => (item.id === editingId ? { ...item, arabic: arabic.trim(), meaning: meaning.trim() } : item)));
        resetForm();
        alert("Perkataan berjaya dikemaskini.");
      }
    } else {
      const { data, error } = await supabase
        .from('vocab')
        .insert([{ arabic: arabic.trim(), meaning: meaning.trim() }])
        .select();

      if (data) {
        setVocabList([data[0], ...vocabList]);
        resetForm();
        alert("Perkataan berjaya ditambah.");
      }
    }
  };

  const resetForm = () => {
    setArabic("");
    setMeaning("");
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Padam perkataan ini?")) return;
    const { error } = await supabase
      .from('vocab')
      .delete()
      .eq('id', id);

    if (!error) {
      setVocabList(vocabList.filter((item) => item.id !== id));
      alert("Perkataan telah dipadam.");
    }
  };

  const handleEdit = (item: VocabItem) => {
    setArabic(item.arabic);
    setMeaning(item.meaning);
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredVocab = vocabList.filter((item) =>
    item.arabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-8 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-emerald-600">Personal Vocab</h1>
          <p className="text-gray-500">Build your own dictionary of Arabic terms.</p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500">
              Arabic Word (Perkataan Arab)
            </label>
            <input
              type="text"
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-right text-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white transition-colors"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500">
              Meaning (Maksud)
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. Patience / Kesabaran"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-full bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-100"
            >
              {editingId ? "Update" : "Add to List"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-full border border-gray-200 py-3 font-bold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Cari perkataan (Arab atau Maksud)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white p-4 pl-6 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Saved Words</h2>
          
          {loading ? (
            <div className="text-center text-gray-500 py-10 animate-pulse">
              Loading dictionary...
            </div>
          ) : filteredVocab.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-500">
              {vocabList.length > 0 && searchTerm ? (
                <p>Tiada perkataan dijumpai untuk carian "{searchTerm}".</p>
              ) : (
                <p>No words saved yet.</p>
              )}
            </div>
          ) : (
            filteredVocab.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div>
                  <h3 className="mb-1 text-3xl text-emerald-600" dir="rtl">
                    {item.arabic}
                  </h3>
                  <p className="text-gray-600 font-medium">{item.meaning}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-emerald-50 hover:text-emerald-600 group-hover:opacity-100"
                    title="Edit word"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    title="Delete word"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
