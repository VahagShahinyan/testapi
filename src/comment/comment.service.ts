import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { CommentRepository } from './comment.repository';
import { ICommentData } from './comment.interface';
@injectable()
export class CommentService {
	constructor(@inject(TYPES.CommentRepository) private commentRepository: CommentRepository) {}

	async createComment(commentData: ICommentData) {
		return this.commentRepository.createComment(commentData);
	}

	async getAllComment(postId: number) {
		return this.commentRepository.getAllComment(postId);
	}
}
