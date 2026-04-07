import React, { useState } from 'react';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, type: 'income' | 'expense') => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export default function CategoryManager({ categories, onAdd, onDelete, onClose }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim(), newType);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Manage Categories
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => setNewType('expense')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                  newType === 'expense' ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setNewType('income')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                  newType === 'income' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Income
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Income Categories</h3>
              <div className="grid grid-cols-1 gap-2">
                {categories.filter(c => c.type === 'income').map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-900 dark:text-white font-medium">{cat.name}</span>
                    <button onClick={() => onDelete(cat.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expense Categories</h3>
              <div className="grid grid-cols-1 gap-2">
                {categories.filter(c => c.type === 'expense').map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-900 dark:text-white font-medium">{cat.name}</span>
                    <button onClick={() => onDelete(cat.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
