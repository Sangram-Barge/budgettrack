export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: number;
  category: string;
  amount: number;
  month: string;
}

export interface SummaryData {
  actual: { category: string; total: number }[];
  expected: { category: string; total: number }[];
}
