# Library Management System

A full-stack library management system with book catalog search, genre categorization, user roles, and patron reviews. Built with NestJS, Prisma, and PostgreSQL.

## Schema Decisions

**Why Books Reference Genres via Foreign Keys (Instead of Embedding)**
PostgreSQL is a relational database. Unlike a NoSQL document store (like MongoDB) where we might embed genre strings or objects directly inside a Book document, we use a foreign key (`genreId`) to link the Book table to a separate Genre table. This ensures data normalization—if a genre's name or slug needs to change, we only update it in one place (the Genre table), and all associated books instantly reflect that change. 

**Reflections on Prisma vs. Document Databases (Stretch)**
Modeling with Prisma feels significantly more rigid upfront compared to a document database. In a document store, you can seamlessly push varying data shapes into a collection on the fly. With Prisma and PostgreSQL, the structure (types, constraints, relationships) must be strictly defined in `schema.prisma` and applied via migrations before the code can run. However, this upfront friction pays off immediately in the codebase: Prisma generates a fully-typed TypeScript client based on this exact schema, meaning the compiler instantly catches invalid queries or data types before the app even runs.

## Project Structure

```
library-management-system/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma schema definitions (User, Role, Genre, Book, Review)
│   │   └── seed.ts               # Database seeder (4 genres, 15 books)
│   ├── src/
│   │   └── prisma/
│   │       └── prisma.service.ts # PrismaClient NestJS injectable service
│   ├── .env.example              # Environment variables placeholder template
│   └── package.json              # API dependencies and seed config
└── README.md                     # Project documentation and schema reflections
```

## Setup & Running Migrations

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` inside the `api` folder and add your PostgreSQL connection string:
   ```bash
   cd api
   cp .env.example .env
   ```

2. **Apply Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed the Database**:
   ```bash
   npx prisma db seed
   ```
