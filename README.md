# 📋 Notice Board

A full-stack web application for managing institutional notices — built for schools, colleges, and organizations that need a clean, centralized place to post and manage announcements.

Supports full **CRUD operations** (Create, Read, Update, Delete) with server-side validation, priority-based sorting, and a fully responsive UI that works on mobile and desktop.

Live Demo → https://notice-board-gamma-six.vercel.app/

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript |
| ORM | Prisma 5 |
| Database | MySQL (TiDB Cloud) |
| Styling | Tailwind CSS 3 |
| Validation | Zod |
| Deployment | Vercel |

---

## ✨ Features

- **Create notices** with title, body, category, priority, publish date, and optional image
- **Read all notices** displayed as responsive cards on the main board
- **Edit notices** via a preloaded form inside a modal drawer
- **Delete notices** with a confirmation dialog to prevent accidental removal
- **Urgent-first sorting** — Urgent notices always appear at the top, sorted at the database level using Prisma `orderBy`
- **Server-side validation** — every API request is validated using Zod schemas before touching the database
- **Category badges** — color-coded tags for Exam, Event, and General notices
- **Animated Urgent badge** — pulsing red indicator for high-priority notices
- **Optional image support** — attach an image URL to any notice
- **Loading and error states** — spinner during data fetch, toast notifications for all actions
- **Fully responsive** — mobile-first layout using Tailwind CSS grid

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- A MySQL-compatible hosted database (TiDB Cloud, PlanetScale, or Railway)

### 1. Clone the repository
```bash
git clone https://github.com/ujjwalsrivastavaaa/notice-board.git
cd notice-board
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:
```env
DATABASE_URL="mysql://user:password@host:3306/noticeboard"
```

Replace with your actual database connection string from TiDB Cloud, PlanetScale, or Railway.

### 4. Push Prisma schema to database
```bash
npm run db:push
```

This creates the `notices` table and enums automatically — no manual SQL needed.

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Folder Structure

```
notice-board/
├── components/
│   ├── DeleteModal.tsx     # Confirmation dialog before delete
│   ├── EmptyState.tsx      # Shown when board has no notices
│   ├── Modal.tsx           # Reusable slide-in drawer
│   ├── NoticeCard.tsx      # Individual notice card with Edit/Delete
│   ├── NoticeForm.tsx      # Shared form for create and edit
│   └── Toast.tsx           # Auto-dismiss success/error notifications
├── lib/
│   ├── prisma.ts           # Prisma singleton client
│   ├── types.ts            # Shared TypeScript interfaces
│   └── validations.ts      # Zod schemas for server-side validation
├── pages/
│   ├── api/
│   │   └── notices/
│   │       ├── index.ts    # GET all + POST
│   │       └── [id].ts     # GET one + PUT + DELETE
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx           # Main notice board page (SSR)
├── prisma/
│   └── schema.prisma       # Notice model with Category and Priority enums
├── styles/
│   └── globals.css         # Tailwind directives + custom animations
├── .env.example
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notices` | Fetch all notices (Urgent first) |
| `POST` | `/api/notices` | Create a new notice |
| `PUT` | `/api/notices/:id` | Update an existing notice |
| `DELETE` | `/api/notices/:id` | Delete a notice by ID |

---

## 🔮 One Improvement With More Time

**Search and Filter functionality**

With more time, I would add the ability to filter notices by category (Exam, Event, General) and search by keyword. Currently all notices load at once which works fine for small boards, but in a real institutional setting with 100+ notices, users need to quickly find what they are looking for.

This would involve:
- A filter bar UI with category toggle buttons
- A search input with debounced querying
- Passing filter params to the Prisma query using `where` clauses

This matters because the core value of a notice board is **findability** — if users have to scroll through everything to find the exam schedule, the app loses its purpose.

---

## 🤖 AI Usage Disclosure

AI assistance (Claude by Anthropic) was used during the development of this project in the following ways:

- **Initial boilerplate generation** — the folder structure, Prisma schema, and API route patterns were scaffolded with AI assistance to speed up setup
- **Debugging** — AI helped diagnose issues like the Tailwind v4 vs v3 conflict and the `prisma.config.ts` build error on Vercel
- **UI component structure** — AI suggested the component breakdown (NoticeCard, Modal, Toast) which I then reviewed, modified, and integrated
- **Zod validation schemas** — AI helped write the initial validation logic which I verified against the Prisma schema

All generated code was read, understood, and tested by me. I made modifications where the generated output did not match the project requirements — for example, adjusting the sorting logic, fixing TypeScript types, and adapting the form to handle both create and edit states from a single component.

I used AI as a productivity tool, not a replacement for understanding the code.

---

## ☁️ Deployment

The app is deployed on **Vercel** and connects to a hosted MySQL database on **TiDB Cloud**.

Deployment is fully automated — every push to the `main` branch on GitHub triggers a new production deployment via Vercel's GitHub integration.

The production build runs:
```bash
prisma generate && next build
```

Environment variables are configured directly in the Vercel dashboard and are never exposed in the codebase.

---

## 📄 License

MIT
