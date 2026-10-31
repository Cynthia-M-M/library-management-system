import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateGenreDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must consist of lowercase letters, numbers, and hyphens',
  })
  slug?: string;
}
