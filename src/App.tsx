import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Target, 
  LayoutDashboard, 
  Receipt, 
  ChevronLeft, 
  ChevronRight,
  Wallet,
  Menu,
  X,
  Sun,
  Moon,
  Tag
} from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import BudgetForm from './components/BudgetForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager';
import { Transaction, Budget, SummaryData, Category } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ actual: [], expected: [] });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const monthStr = format(currentMonth, 'yyyy-MM');

  const fetchData = useCallback(async () => {
    try {
      const [txRes, budgetRes, summaryRes, catRes] = await Promise.all([
        fetch(`/api/transactions?month=${monthStr}`),
        fetch(`/api/budgets?month=${monthStr}`),
        fetch(`/api/summary?month=${monthStr}`),
        fetch('/api/categories')
      ]);

      const [txData, budgetData, summaryData, catData] = await Promise.all([
        txRes.json(),
        budgetRes.json(),
        summaryRes.json(),
        catRes.json()
      ]);

      setTransactions(txData);
      setBudgets(budgetData);
      setSummary(summaryData);
      setCategories(catData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [monthStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (data: Omit<Transaction, 'id'>) => {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchData();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const handleAddBudget = async (data: Omit<Budget, 'id'>) => {
    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchData();
    } catch (error) {
      console.error('Failed to set budget:', error);
    }
  };

  const handleAddCategory = async (name: string, type: 'income' | 'expense') => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });
      fetchData();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">BudgetTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            {isSidebarOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">BudgetTrack</span>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'dashboard' 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'transactions' 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <Receipt className="w-5 h-5" />
            Transactions
          </button>
          <button
            onClick={() => { setShowCategoryManager(true); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Tag className="w-5 h-5" />
            Categories
          </button>
        </nav>

        <div className="absolute bottom-8 left-4 right-4 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Transaction
          </button>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            Set Budget
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-8 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[150px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Live Sync Enabled
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <Dashboard summary={summary} month={monthStr} onAddTransaction={handleAddTransaction} />
        ) : (
          <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
        )}
      </main>

      {/* Modals */}
      {showTransactionForm && (
        <TransactionForm 
          onAdd={handleAddTransaction} 
          onClose={() => setShowTransactionForm(false)} 
          categories={categories}
        />
      )}
      {showBudgetForm && (
        <BudgetForm 
          onAdd={handleAddBudget} 
          onClose={() => setShowBudgetForm(false)} 
          month={monthStr}
          categories={categories}
        />
      )}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}
