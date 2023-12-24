import { IsNumber, IsString } from 'class-validator';

export class CommentCreateDto {
	@IsNumber()
	postId: number;

	@IsString()
	text: string;
}
