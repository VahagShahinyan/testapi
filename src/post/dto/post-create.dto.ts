import { IsNumber, IsString } from 'class-validator';

export class PostCreateDto {
	@IsNumber()
	groupId: number;

	@IsString()
	text: string;
}
