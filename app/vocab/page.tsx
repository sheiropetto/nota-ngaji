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
    <main className="min-h-screen bg-gray-50 p-4 pb-20 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-emerald-600">Personal Vocab</h1>
          <p className="text-gray-500 text-sm">Bina kamus istilah Arab anda sendiri.</p>
        </header>

        <form onSubmit={handleSave} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Arabic Word
            </label>
            <input
              type="text"
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full rounded-2xl border-none bg-gray-50 p-4 text-right text-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Meaning
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Maksud..."
              className="w-full rounded-2xl border-none bg-gray-50 p-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-emerald-600 py-4 font-bold text-white shadow-lg active:bg-emerald-700 active:scale-95 transition-all"
            >
              {editingId ? "Kemaskini" : "Tambah"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 rounded-full bg-gray-100 font-bold text-gray-500 active:bg-gray-200"
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
            className="w-full rounded-full border border-gray-200 p-4 px-6 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 py-10 italic">Memuatkan kamus...</div>
          ) : filteredVocab.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
              Tiada perkataan dijumpai.
            </div>
          ) : (
            filteredVocab.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 active:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-emerald-600 mb-1" dir="rtl">
                    {item.arabic}
                  </h3>
                  <p className="text-gray-600 font-medium">{item.meaning}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-3 text-gray-300 active:text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteConfirmationId(item.id)} className="p-3 text-gray-300 active:text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold">Padam Perkataan?</h3>
            <p className="text-gray-500 text-sm">Tindakan ini akan membuang perkataan ini selamanya.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-4 font-bold text-gray-500 rounded-full">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmationId)} className="flex-1 rounded-full bg-red-500 py-4 font-bold text-white shadow-lg shadow-red-100">Padam</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}