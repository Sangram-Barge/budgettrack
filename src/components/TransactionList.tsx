import React from 'react';
import { Trash2, ShoppingBag, Utensils, Home, Zap, Car, Film, Heart, MoreHorizontal } from 'lucide-react';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  Rent: Home,
  Utilities: Zap,
  Transport: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Health: Heart,
  Other: MoreHorizontal
};

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transactions yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Start adding your daily expenses to see them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {transactions.map((t) => {
          const Icon = CATEGORY_ICONS[t.category] || MoreHorizontal;
          return (
            <div key={t.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t.description || t.category}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{t.category}</span>
                    <span>•</span>
                    <span>{format(parseISO(t.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
