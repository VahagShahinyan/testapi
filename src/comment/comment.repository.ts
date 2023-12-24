import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { PrismaService } from '../database/prisma.service';
import { ICommentData } from './comment.interface';
@injectable()
export class CommentRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async createComment(commentData: ICommentData) {
		return this.prismaService.client.comments.create({
			data: {
				post_id: commentData.postId,
				text: commentData.text,
				created_by: commentData.createdBy,
			},
		});
	}

	async getAllComment(postId: number) {
		return this.prismaService.client.comments.findMany({
			where: {
				post_id: postId,
			},
			orderBy: {
				id: 'desc',
			},
		});
	}
}
