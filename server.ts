import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("budget.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    UNIQUE(name, type)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    month TEXT NOT NULL,
    UNIQUE(category, month)
  );
`);

// Seed default categories if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCat = db.prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
  const defaults = [
    { name: 'Salary', type: 'income' },
    { name: 'Freelance', type: 'income' },
    { name: 'Gift', type: 'income' },
    { name: 'Other', type: 'income' },
    { name: 'Food', type: 'expense' },
    { name: 'Rent', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Shopping', type: 'expense' },
    { name: 'Health', type: 'expense' },
    { name: 'Other', type: 'expense' }
  ];
  defaults.forEach(cat => insertCat.run(cat.name, cat.type));
}

// Financial month helper (25th to 24th)
function getFinancialMonthRange(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number);
  // Month is 1-indexed in string, 0-indexed in Date
  const startDate = new Date(year, month - 2, 25);
  const endDate = new Date(year, month - 1, 24);
  
  // Format as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return { start: formatDate(startDate), end: formatDate(endDate) };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Categories
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name, type } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
      const info = stmt.run(name, type);
      res.json({ id: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Category already exists" });
    }
  });

  app.delete("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Transactions
  app.get("/api/transactions", (req, res) => {
    const { month } = req.query;
    let query = "SELECT * FROM transactions ORDER BY date DESC";
    const params: any[] = [];

    if (month) {
      const { start, end } = getFinancialMonthRange(month as string);
      query = "SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC";
      params.push(start, end);
    }

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const { amount, category, description, date, type } = req.body;
    const stmt = db.prepare(
      "INSERT INTO transactions (amount, category, description, date, type) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(amount, category, description, date, type);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/transactions/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Budgets (Expected Transactions)
  app.get("/api/budgets", (req, res) => {
    const { month } = req.query;
    let query = "SELECT * FROM budgets";
    const params: any[] = [];

    if (month) {
      query = "SELECT * FROM budgets WHERE month = ?";
      params.push(month);
    }

    const budgets = db.prepare(query).all(...params);
    res.json(budgets);
  });

  app.post("/api/budgets", (req, res) => {
    const { category, amount, month } = req.body;
    const stmt = db.prepare(
      "INSERT INTO budgets (category, amount, month) VALUES (?, ?, ?) ON CONFLICT(category, month) DO UPDATE SET amount = excluded.amount"
    );
    const info = stmt.run(category, amount, month);
    res.json({ id: info.lastInsertRowid });
  });

  // Summary
  app.get("/api/summary", (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    const { start, end } = getFinancialMonthRange(month as string);

    const actual = db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE date >= ? AND date <= ? AND type = 'expense'
      GROUP BY category
    `).all(start, end);

    const expected = db.prepare(`
      SELECT category, amount as total 
      FROM budgets 
      WHERE month = ?
    `).all(month);

    res.json({ actual, expected });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
