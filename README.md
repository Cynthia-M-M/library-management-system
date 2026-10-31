# Library Management System

A full-stack library management system with book catalog search, genre categorization, user roles, and patron reviews. Built with **NestJS**, **Prisma ORM**, and **PostgreSQL**.

---

## Schema Decisions

**Why Books Reference Genres via Foreign Keys (Instead of Embedding)**
PostgreSQL is a relational database. Unlike a NoSQL document store (like MongoDB) where we might embed genre strings or nested objects directly inside a Book document, relational databases rely on **foreign keys (`genreId`)** linking the `Book` table to a separate `Genre` table.

- **Normalization**: If a genre's title, description, or slug updates, it is modified in a single row in the `Genre` table, and all referencing books instantly reflect the change without data anomalies.
- **Referential Integrity**: PostgreSQL foreign keys guarantee that no book can reference a non-existent genre (`ON DELETE RESTRICT` or cascade guarantees).
- **Indexing & Filtering Efficiency**: Indexing an integer foreign key (`genreId`) is substantially faster and uses far less memory than indexing repetitive strings.

**Reflections on Prisma vs. Document Databases (Stretch)**
Modeling with Prisma and PostgreSQL feels significantly more structured and rigid upfront compared to document-based stores. In a document store, you can freely push varying schemas into collections without migrations. 

However, this upfront schema rigor pays immense dividends in a production TypeScript application:
1. **Single Source of Truth**: The `schema.prisma` file defines the database tables, the relations, and the generated TypeScript types simultaneously.
2. **Compile-Time Safety**: When you query `prisma.book.findMany({ include: { genre: true } })`, TypeScript statically infers the exact returned payload shape with complete IDE autocompletion. Drift between the database and application code is virtually eliminated.
3. **Safe Iterations via Migrations**: `npx prisma migrate dev` creates declarative, version-controlled SQL migration files that make schema evolution reproducible across all team members and deployment pipelines.

---

## 📁 Repository Structure

```
library-management-system/
├── api/
│   ├── nest-cli.json             # NestJS CLI configuration
│   ├── tsconfig.json             # TypeScript compiler settings
│   ├── package.json              # API dependencies and scripts
│   ├── .env.example              # PostgreSQL connection string template
│   ├── prisma/
│   │   ├── schema.prisma         # Models: User, Role, Genre, Book, Review (Stretch)
│   │   └── seed.ts               # Seed script (4 genres, 15 books, user & review)
│   └── src/
│       ├── main.ts               # Application entrypoint (bootstraps Nest on port 3000)
│       ├── app.module.ts         # Root module coordinating PrismaModule & BooksModule
│       ├── prisma/
│       │   ├── prisma.service.ts # Injectable PrismaClient wrapper with OnModuleInit
│       │   └── prisma.module.ts  # @Global() module exporting PrismaService
│       └── books/
│           ├── books.module.ts   # Books feature module
│           ├── books.controller.ts # Route handlers (GET /books, GET /books/:id)
│           └── books.service.ts  # Business logic & Prisma queries
└── README.md                     # Documentation, schema reflections, and guide
```

---

## 🚀 Setup & Execution Guide

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside the `api` folder:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL database connection string (from Neon, Supabase, or local Postgres):
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. Run Prisma Migrations
Generate the Prisma Client and migrate your database tables (`User`, `Genre`, `Book`, `Review`):
```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database
Populate your database with 4 genres, 15 books across those genres, and a sample review:
```bash
npx prisma db seed
```

### 5. Start the NestJS API
```bash
npm run start:dev
```
The server will start on `http://localhost:3000`.

---

## 🔌 API Endpoints

| Method | Endpoint | Query / Param | Description |
|---|---|---|---|
| `GET` | `/books` | `?genreId=2` (optional) | Returns all books (or books filtered by genre), including genre & reviews |
| `GET` | `/books/:id` | `id` (e.g. `/books/1`) | Returns details for a specific book by ID |

---

## 🔍 Database Inspection
To open Prisma Studio and visually inspect your database tables and relations:
```bash
npx prisma studio
```
