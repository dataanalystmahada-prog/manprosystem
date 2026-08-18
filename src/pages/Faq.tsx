import React, { useState } from 'react';
import { useFaqs, FaqItem } from '../context/FaqContext';
import { useSettings } from '../context/SettingsContext';
import { Plus, Edit2, Trash2, X, Save, Search, ChevronDown } from 'lucide-react';

export function Faq() {
  const { faqs, addFaq, updateFaq, deleteFaq } = useFaqs();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FaqItem>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Omit<FaqItem, 'id'>>({
    product: 'ALL Produk',
    subProduct: 'ALL Sub Produk',
    question: '',
    answer: ''
  });

  const productsOptions = ['ALL Produk', ...settings.products];
  const subProductsOptions = ['ALL Sub Produk', ...settings.subProducts];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.subProduct.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveAdd = () => {
    if (!addForm.question?.trim() || !addForm.answer?.trim()) return;
    addFaq(addForm);
    setIsAdding(false);
    setAddForm({ product: 'ALL Produk', subProduct: 'ALL Sub Produk', question: '', answer: '' });
  };

  const handleSaveEdit = () => {
    if (!editForm.question?.trim() || !editForm.answer?.trim() || !editingId) return;
    updateFaq({ ...editForm, id: editingId } as FaqItem);
    setEditingId(null);
  };

  const startEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setEditForm({ ...faq });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">FAQ Management</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage frequently asked questions by product and sub-product.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {isAdding && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
              <h3 className="text-sm font-bold text-blue-900">Add New FAQ</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Produk</label>
                <div className="relative">
                  <select
                    value={addForm.product}
                    onChange={e => setAddForm(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] appearance-none focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  >
                    {productsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sub Produk</label>
                <div className="relative">
                  <select
                    value={addForm.subProduct}
                    onChange={e => setAddForm(prev => ({ ...prev, subProduct: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] appearance-none focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  >
                    {subProductsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pertanyaan</label>
                <input
                  type="text"
                  value={addForm.question}
                  onChange={e => setAddForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. Berapa lama garansi produk ini?"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jawaban</label>
                <textarea
                  value={addForm.answer}
                  onChange={e => setAddForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Tuliskan jawaban yang detail..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] resize-y"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAdd}
                disabled={!addForm.question?.trim() || !addForm.answer?.trim()}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Sub Produk</th>
                <th className="px-4 py-3 w-1/3">Pertanyaan</th>
                <th className="px-4 py-3">Jawaban</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaqs.map(faq => (
                <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                  {editingId === faq.id ? (
                    <>
                      <td className="px-4 py-3 align-top">
                        <select
                          value={editForm.product}
                          onChange={e => setEditForm(prev => ({ ...prev, product: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[13px]"
                        >
                          {productsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <select
                          value={editForm.subProduct}
                          onChange={e => setEditForm(prev => ({ ...prev, subProduct: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[13px]"
                        >
                          {subProductsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <textarea
                          value={editForm.question}
                          onChange={e => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[13px] min-h-[60px]"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <textarea
                          value={editForm.answer}
                          onChange={e => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-[13px] min-h-[60px]"
                        />
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 align-top font-medium text-slate-700">{faq.product}</td>
                      <td className="px-4 py-3 align-top font-medium text-slate-700">{faq.subProduct}</td>
                      <td className="px-4 py-3 align-top font-medium text-slate-900">{faq.question}</td>
                      <td className="px-4 py-3 align-top text-slate-600 whitespace-pre-wrap">{faq.answer}</td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button onClick={() => startEdit(faq)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Delete this FAQ?')) deleteFaq(faq.id);
                            }} 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredFaqs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No FAQs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
