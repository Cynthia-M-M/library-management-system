import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  author: string;

  @IsString({ message: 'ISBN must be a string' })
  @IsNotEmpty({ message: 'ISBN is required' })
  isbn: string;

  @IsInt({ message: 'Total copies must be an integer' })
  @Min(1, { message: 'Total copies must be at least 1' })
  totalCopies: number;

  @IsInt({ message: 'Genre ID must be an integer' })
  @Min(1, { message: 'Genre ID must be a positive integer' })
  genreId: number;

  @IsOptional()
  @IsInt({ message: 'Available copies must be an integer' })
  @Min(0, { message: 'Available copies cannot be negative' })
  availableCopies?: number;
}
