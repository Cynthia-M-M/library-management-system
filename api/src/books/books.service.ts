import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindBooksQuery {
  genreId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    // Verify genre exists
    const genre = await this.prisma.genre.findUnique({
      where: { id: dto.genreId },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${dto.genreId} does not exist`);
    }

    // Check unique ISBN
    const existingIsbn = await this.prisma.book.findUnique({
      where: { isbn: dto.isbn },
    });
    if (existingIsbn) {
      throw new ConflictException(`Book with ISBN '${dto.isbn}' already exists`);
    }

    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        isbn: dto.isbn,
        totalCopies: dto.totalCopies,
        availableCopies:
          dto.availableCopies !== undefined ? dto.availableCopies : dto.totalCopies,
        genreId: dto.genreId,
      },
      include: {
        genre: true,
      },
    });
  }

  async findAll(query: FindBooksQuery = {}) {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (query.genreId) {
      where.genreId = Number(query.genreId);
    }

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { author: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, books] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          genre: true,
          reviews: true,
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
        reviews: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);

    if (dto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: dto.genreId },
      });
      if (!genre) {
        throw new NotFoundException(`Genre with ID ${dto.genreId} does not exist`);
      }
    }

    if (dto.isbn) {
      const conflictIsbn = await this.prisma.book.findFirst({
        where: { isbn: dto.isbn, NOT: { id } },
      });
      if (conflictIsbn) {
        throw new ConflictException(`Book with ISBN '${dto.isbn}' already exists`);
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: dto,
      include: {
        genre: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
