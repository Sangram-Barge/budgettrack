# BudgetTrack

A simple budget tracking application built with React, Express, and SQLite.

## Features
- Daily transaction entry (Income/Expense).
- Dynamic category management.
- Monthly budget setting.
- Financial month tracking (25th to 24th).
- Expected vs. Actual charts.
- Dark/Light theme support.

## Running with Docker

1. Make sure you have Docker and Docker Compose installed.
2. Clone the repository.
3. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
   This will create a `data` directory in your project root to persist the SQLite database.
4. Access the application at `http://localhost:3000`.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Start production server:
   ```bash
   npm start
   ```
