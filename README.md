# Form Builder

A Form Builder system built with React Router V7 (Remix), tRPC, Prisma, and PostgreSQL.

## Tech Stack

- **Framework:** React Router V7 (Remix)
- **Language:** TypeScript
- **API:** tRPC
- **Validation:** Zod
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** Session-based (cookie)
- **UI:** Tailwind CSS v4
- **Linting:** ESLint + Prettier
- **Package Manager:** Yarn
- **Bundler:** Vite

## Prerequisites

- Node.js 20+
- Yarn
- Docker & Docker Compose (for PostgreSQL)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd remix-js-test-task
yarn install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Set up environment

```bash
cp .env.example .env
```

Default values should work out of the box with the Docker Compose setup.

### 4. Run database migrations and seed

```bash
yarn db:generate
yarn db:migrate
yarn db:seed
```

This creates the database schema and seeds an admin user:
- **Email:** `admin@formbuilder.com`
- **Password:** `admin123`

### 5. Start dev server

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── ConfirmModal.tsx     # Submission confirmation modal
│   ├── FieldRenderer.tsx    # Renders form field by type
│   ├── FieldSettingsSidebar.tsx # Field options editor
│   ├── FormEditor.tsx       # Form create/edit editor
│   └── FormPreview.tsx      # Live form preview
├── lib/
│   ├── trpc.ts              # tRPC client
│   └── validation.ts        # Zod schemas
├── routes/
│   ├── home.tsx             # Public: list of published forms
│   ├── forms.$id.tsx        # Public: fill out a form
│   ├── login.tsx            # Auth: admin login
│   ├── admin.layout.tsx     # Admin: layout with navigation
│   ├── admin._index.tsx     # Admin: forms list (CRUD)
│   ├── admin.forms.new.tsx  # Admin: create form
│   ├── admin.forms.$id.edit.tsx # Admin: edit form
│   └── api.trpc.$.tsx       # tRPC API handler
├── server/
│   ├── auth.server.ts       # Session authentication
│   ├── caller.ts            # Server-side tRPC caller
│   ├── db.ts                # Prisma client singleton
│   ├── trpc.ts              # tRPC initialization
│   └── routers/
│       ├── _app.ts          # Root router
│       ├── auth.ts          # Auth procedures
│       ├── form.ts          # Form CRUD procedures
│       └── submission.ts    # Submission procedures
├── root.tsx
├── routes.ts
└── app.css
```

## Features

### Admin Panel (protected by login)

- **Form CRUD** — Create, edit, delete, publish/unpublish forms
- **Form Editor** — Live preview with click-to-edit field settings sidebar
- **Field Types:**
  - **text** — options: label, placeholder, required, minLength, maxLength
  - **number** — options: label, placeholder, required, min, max, step
  - **textarea** — options: label, placeholder, required, minLength, maxLength, rows
- **Reorder fields** with up/down buttons

### Public Area

- **Home page** — Lists all published forms
- **Form filling** — Dynamic validation (Zod), confirmation modal before submission

## Database Choice: PostgreSQL

PostgreSQL was chosen because:

1. **Relational data model** — User → Form → Field, Form → Submission — natural foreign key relationships
2. **Data integrity** — Foreign keys, cascading deletes, ACID transactions
3. **JSONB for flexibility** — Field-specific options (minLength, max, rows) stored as JSONB while keeping relational structure
4. **Transactions** — Atomic form + fields save operations

MongoDB is less suited here as the data is inherently relational, and its advantages (horizontal scaling, schema-less) aren't needed for a CRUD form builder.

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn typecheck` | Type checking |
| `yarn db:generate` | Generate Prisma client |
| `yarn db:migrate` | Run database migrations |
| `yarn db:seed` | Seed admin user |
| `yarn db:studio` | Open Prisma Studio |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint issues |
| `yarn format` | Format with Prettier |
