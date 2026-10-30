import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data to avoid unique constraint errors during re-seeding
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Create 4 Genres
  const fantasy = await prisma.genre.create({ data: { name: 'Fantasy', slug: 'fantasy' } });
  const sciFi = await prisma.genre.create({ data: { name: 'Science Fiction', slug: 'science-fiction' } });
  const mystery = await prisma.genre.create({ data: { name: 'Mystery', slug: 'mystery' } });
  const nonFiction = await prisma.genre.create({ data: { name: 'Non-Fiction', slug: 'non-fiction' } });

  // Create 15 Books distributed across the genres
  await prisma.book.createMany({
    data: [
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', genreId: fantasy.id },
      { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', genreId: fantasy.id },
      { title: 'Mistborn', author: 'Brandon Sanderson', isbn: '9780765350381', genreId: fantasy.id },
      { title: 'The Way of Kings', author: 'Brandon Sanderson', isbn: '9780765365279', genreId: fantasy.id },
      
      { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', genreId: sciFi.id },
      { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', genreId: sciFi.id },
      { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', genreId: sciFi.id },
      { title: 'Snow Crash', author: 'Neal Stephenson', isbn: '9780553380958', genreId: sciFi.id },
      
      { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '9780062073488', genreId: mystery.id },
      { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', isbn: '9780451528018', genreId: mystery.id },
      { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', genreId: mystery.id },
      { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307949486', genreId: mystery.id },
      
      { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', genreId: nonFiction.id },
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', genreId: nonFiction.id },
      { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', genreId: nonFiction.id },
    ],
  });

  console.log('Database seeded successfully with 4 genres and 15 books!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
