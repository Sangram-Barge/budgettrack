import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SummaryData, Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, IndianRupee, AlertCircle } from 'lucide-react';

interface DashboardProps {
  summary: SummaryData;
  month: string;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">₹{entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ summary, month, onAddTransaction }: DashboardProps) {
  const hasSalary = useMemo(() => {
    // This is a bit tricky because summary.actual only has expenses.
    // I'll need to check if any income transaction exists for the month.
    // But since I don't have all transactions here, I'll just assume it's needed if not in summary.
    // Actually, I'll just add a "Quick Actions" section.
    return false; // Placeholder
  }, [summary]);

  const chartData = useMemo(() => {
    const categories = Array.from(new Set([
      ...summary.actual.map(a => a.category),
      ...summary.expected.map(e => e.category)
    ]));

    return categories.map(cat => {
      const actual = summary.actual.find(a => a.category === cat)?.total || 0;
      const expected = summary.expected.find(e => e.category === cat)?.total || 0;
      return {
        category: cat,
        actual,
        expected,
        diff: expected - actual
      };
    });
  }, [summary]);

  const totals = useMemo(() => {
    const totalActual = summary.actual.reduce((sum, a) => sum + a.total, 0);
    const totalExpected = summary.expected.reduce((sum, e) => sum + e.total, 0);
    return { actual: totalActual, expected: totalExpected };
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <IndianRupee className="w-5 h-5" />
            <span className="font-medium">Total Expected</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totals.expected.toFixed(2)}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="font-medium">Total Actual</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totals.actual.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Remaining Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{(totals.expected - totals.actual).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Expected vs Actual by Category</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'var(--chart-cursor)' }} 
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px' }}
                formatter={(value) => <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">{value}</span>}
              />
              <Bar dataKey="expected" name="Expected" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Quick Actions</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add your monthly salary or manage categories.</p>
          </div>
        </div>
        <button 
          onClick={() => onAddTransaction({
            amount: 0,
            category: 'Salary',
            description: 'Monthly Salary',
            date: new Date().toISOString().split('T')[0],
            type: 'income'
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Add Salary
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Report Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Expected</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actual</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Difference</th>
                <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.category} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{item.category}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{item.expected.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{item.actual.toFixed(2)}</td>
                  <td className={`py-3 px-4 font-medium ${item.diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{Math.abs(item.diff).toFixed(2)} {item.diff >= 0 ? 'Under' : 'Over'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.diff >= 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {item.diff >= 0 ? 'On Track' : 'Over Budget'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
