import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    const existingName = await this.prisma.genre.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException(`Genre with name '${dto.name}' already exists`);
    }

    const existingSlug = await this.prisma.genre.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Genre with slug '${dto.slug}' already exists`);
    }

    return this.prisma.genre.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });
  }

  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id);

    if (dto.name) {
      const conflictName = await this.prisma.genre.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflictName) {
        throw new ConflictException(`Genre with name '${dto.name}' already exists`);
      }
    }

    if (dto.slug) {
      const conflictSlug = await this.prisma.genre.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (conflictSlug) {
        throw new ConflictException(`Genre with slug '${dto.slug}' already exists`);
      }
    }

    return this.prisma.genre.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const genre = await this.findOne(id);

    const bookCount = await this.prisma.book.count({
      where: { genreId: id },
    });

    if (bookCount > 0) {
      throw new ConflictException(
        `Cannot delete genre '${genre.name}' because it has ${bookCount} associated book(s)`,
      );
    }

    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
