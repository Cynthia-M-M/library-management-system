# Library Management System

A full-stack library management system with book catalog search, genre categorization, user roles, patron reviews, and secure JWT authentication. Built with **NestJS**, **Prisma ORM**, and **PostgreSQL**.

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
│   ├── .env.example              # PostgreSQL & JWT environment variable template
│   ├── prisma/
│   │   ├── schema.prisma         # Models: User, Role, Genre, Book, Review (Stretch)
│   │   └── seed.ts               # Seed script (4 genres, 15 books, librarian & patron accounts)
│   └── src/
│       ├── main.ts               # Entrypoint (CORS & ValidationPipe with whitelist: true)
│       ├── app.module.ts         # Root module (Throttler, Prisma, Auth, Genres, Books, Users)
│       ├── prisma/
│       │   ├── prisma.service.ts # Injectable PrismaClient wrapper with OnModuleInit
│       │   └── prisma.module.ts  # @Global() module exporting PrismaService
│       ├── auth/
│       │   ├── auth.controller.ts # POST /auth/register, POST /auth/login (rate-limited)
│       │   ├── auth.service.ts    # Bcrypt password hashing & JWT token issuance
│       │   ├── auth.module.ts     # Configures Passport & JwtModule
│       │   ├── jwt.strategy.ts    # Passport JWT strategy verifying Bearer tokens
│       │   ├── jwt-auth.guard.ts  # JwtAuthGuard extending AuthGuard('jwt')
│       │   ├── roles.decorator.ts # @Roles() metadata decorator
│       │   ├── roles.guard.ts     # RolesGuard checking req.user.role via Reflector
│       │   └── dto/               # RegisterDto and LoginDto with class-validator
│       ├── genres/
│       │   ├── genres.controller.ts # Full CRUD: GET public, POST/PATCH/DELETE librarian-guarded
│       │   ├── genres.service.ts    # CRUD operations with relational integrity checks
│       │   ├── genres.module.ts     # Module declaration
│       │   └── dto/                 # CreateGenreDto and UpdateGenreDto
│       ├── books/
│       │   ├── books.controller.ts  # GET query-filtered & paginated; POST/PATCH/DELETE guarded
│       │   ├── books.service.ts     # Multi-field search, genre filtering & skip/take pagination
│       │   ├── books.module.ts      # Module declaration
│       │   └── dto/                 # CreateBookDto and UpdateBookDto with validation
│       └── users/
│           ├── users.controller.ts  # GET /users/profile using @Req() (Stretch Goal)
│           ├── users.service.ts     # User profile and review retrieval
│           └── users.module.ts      # Module declaration
├── docs/
│   └── postman_collection.json   # Full Postman Collection testing all Week 2 endpoints
└── README.md                     # Documentation, schema reflections, and setup guide
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
Update `DATABASE_URL` with your PostgreSQL database connection string and configure `JWT_SECRET`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="library-super-secret-jwt-key"
PORT=3000
```

### 3. Run Prisma Migrations
Generate the Prisma Client and migrate your database tables (`User`, `Genre`, `Book`, `Review`):
```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database
Populate your database with 4 genres, 15 books across those genres, and pre-configured accounts:
```bash
npx prisma db seed
```
- **Librarian Account:** `librarian@library.com` / `password123` (`role: LIBRARIAN`)
- **Patron Account:** `patron@example.com` / `password123` (`role: PATRON`)

### 5. Start the NestJS API
```bash
npm run start:dev
```
The server will start on `http://localhost:3000`.

---

## 🔌 API Endpoints Summary

### Authentication (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Registers a new user (`email`, `password`, optional `role`) |
| `POST` | `/auth/login` | Public (Throttled) | Validates credentials and returns JWT `accessToken` |

### Genres (`/genres`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/genres` | Public | Returns all genres with book count |
| `GET` | `/genres/:id` | Public | Returns genre details and its books |
| `POST` | `/genres` | **Librarian** | Creates a new genre with validated slug |
| `PATCH` | `/genres/:id` | **Librarian** | Updates an existing genre |
| `DELETE` | `/genres/:id` | **Librarian** | Deletes a genre (if no books attached) |

### Books (`/books`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/books` | Public | Search (`?search=Hobbit`), filter (`?genreId=1`), paginate (`?page=1&limit=10`) |
| `GET` | `/books/:id` | Public | Returns book details with genre and reviews |
| `POST` | `/books` | **Librarian** | Creates a new book (DTO validated) |
| `PATCH` | `/books/:id` | **Librarian** | Updates book fields (DTO validated) |
| `DELETE` | `/books/:id` | **Librarian** | Deletes a book |

### Users Profile (`/users`) — Stretch Goal
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/profile` | **Authenticated** | Returns authenticated user's profile and reviews via `@Req()` |

---

## 🧪 Postman Collection
The complete test suite collection is located at [`docs/postman_collection.json`](file:///c:/Users/user/Documents/Full%20Stack%20Engineering/library-management-system/docs/postman_collection.json). Import it into Postman to run tests against all endpoints with automated Bearer token capture.
