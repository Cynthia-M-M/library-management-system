import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  author?: string;

  @IsOptional()
  @IsString({ message: 'ISBN must be a string' })
  isbn?: string;

  @IsOptional()
  @IsInt({ message: 'Total copies must be an integer' })
  @Min(1, { message: 'Total copies must be at least 1' })
  totalCopies?: number;

  @IsOptional()
  @IsInt({ message: 'Available copies must be an integer' })
  @Min(0, { message: 'Available copies cannot be negative' })
  availableCopies?: number;

  @IsOptional()
  @IsInt({ message: 'Genre ID must be an integer' })
  @Min(1, { message: 'Genre ID must be a positive integer' })
  genreId?: number;
}
