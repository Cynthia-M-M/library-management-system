import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateGenreDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug cannot be empty' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must consist of lowercase letters, numbers, and hyphens',
  })
  slug: string;
}
