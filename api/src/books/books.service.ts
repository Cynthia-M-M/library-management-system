import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(genreId?: number) {
    if (genreId) {
      return this.prisma.book.findMany({
        where: { genreId },
        include: {
          genre: true,
          reviews: true,
        },
      });
    }

    return this.prisma.book.findMany({
      include: {
        genre: true,
        reviews: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
        reviews: true,
      },
    });
  }
}
