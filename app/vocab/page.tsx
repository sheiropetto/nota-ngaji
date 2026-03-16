"use client";

import { useState, useEffect } from "react";
// FIXED: Using a relative path to avoid the "@/" alias error
import { supabase } from "../../lib/supabase";

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
  const [toastMessage, setToastMessage] = useState("");
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

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

    const entry = { arabic: arabic.trim(), meaning: meaning.trim() };

    if (editingId) {
      const { error } = await supabase
        .from('vocab')
        .update(entry)
        .eq('id', editingId);

      if (!error) {
        setVocabList(vocabList.map((item) => (item.id === editingId ? { ...item, ...entry } : item)));
        resetForm();
        showToast("Perkataan dikemaskini.");
      }
    } else {
      const { data } = await supabase
        .from('vocab')
        .insert([entry])
        .select();

      if (data) {
        setVocabList([data[0], ...vocabList]);
        resetForm();
        showToast("Perkataan ditambah.");
      }
    }
  };

  const resetForm = () => {
    setArabic("");
    setMeaning("");
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('vocab').delete().eq('id', id);
    if (!error) {
      setVocabList(vocabList.filter((item) => item.id !== id));
      showToast("Perkataan dipadam.");
    }
    setDeleteConfirmationId(null);
  };

  const handleEdit = (item: VocabItem) => {
    setArabic(item.arabic);
    setMeaning(item.meaning);
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredVocab = vocabList.filter((item) =>
    item.arabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen p-4 pb-20 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C9A7] to-[#059669]">Kosa Kata</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Bina kamus istilah Arab anda sendiri.</p>
        </header>

        <form onSubmit={handleSave} className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-6 shadow-xl dark:shadow-none space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Perkataan Arab
            </label>
            <input
              type="text"
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 p-4 text-right text-2xl font-bold focus:ring-2 focus:ring-[#00C9A7] outline-none"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Maksud
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Maksud..."
              className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 p-4 font-medium focus:ring-2 focus:ring-[#00C9A7] outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-gradient-to-r from-[#00C9A7] to-[#059669] py-4 font-bold text-white shadow-lg active:opacity-90 active:scale-95 transition-all"
            >
              {editingId ? "Kemaskini" : "Tambah"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 rounded-full bg-gray-100 dark:bg-gray-700 font-bold text-gray-500 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="w-full">
          <input
            type="text"
            placeholder="Cari perkataan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 px-6 shadow-sm dark:shadow-none focus:ring-2 focus:ring-[#00C9A7] outline-none dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-10 italic">Memuatkan kamus...</div>
          ) : filteredVocab.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-gray-400 dark:text-gray-500">
              Tiada perkataan dijumpai.
            </div>
          ) : (
            filteredVocab.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 active:bg-gray-50 dark:active:bg-gray-800 transition-colors shadow-sm dark:shadow-none"
              >
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-[#059669] mb-1" dir="rtl">
                    {item.arabic}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{item.meaning}</p>
                </div>
                <div className="flex gap-1">
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }} className="p-3 text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-700 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                    </button>
                    {activeMenuId === item.id && (
                      <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700 z-10 overflow-hidden py-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); setActiveMenuId(null); }} className="w-full px-4 py-3 text-left text-sm active:bg-[#00C9A7]/10 dark:active:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">Sunting</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(item.id); setActiveMenuId(null); }} className="w-full px-4 py-3 text-left text-sm active:bg-red-50 dark:active:bg-gray-700 text-red-600 dark:text-red-400 transition-colors">Padam</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl text-sm animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl dark:shadow-none space-y-4 border dark:border-gray-700">
            <h3 className="text-xl font-bold dark:text-white">Padam Perkataan?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Tindakan ini akan membuang perkataan ini selamanya.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-4 font-bold text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-full transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmationId)} className="flex-1 rounded-full bg-red-500 py-4 font-bold text-white shadow-lg shadow-red-100">Padam</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}