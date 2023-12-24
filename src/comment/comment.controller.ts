import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../common/base.controller';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import 'reflect-metadata';
import { ValidateMiddleware } from '../common/validate.middleware';
import { StatusCodes } from 'http-status-codes';
import { CommentService } from './comment.service';
import { CommentCreateDto } from './dto/comment-create.dto';
import { CommentCreateGuard } from './guard/comment-create.guard';
import { PostService } from '../post/post.service';
import { CommentFetchGuard } from './guard/comment-fetch.guard';
import { ICommentData } from './comment.interface';
@injectable()
export class CommentController extends BaseController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.CommentService) private commentService: CommentService,
		@inject(TYPES.PostService) private postService: PostService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/comment',
				method: 'post',
				func: this.createComment,
				middlewares: [
					new ValidateMiddleware(CommentCreateDto),
					new CommentCreateGuard(this.postService),
				],
			},
			{
				path: '/comment',
				method: 'get',
				func: this.getAllComments,
				middlewares: [new CommentFetchGuard(this.postService)],
			},
		]);
	}

	async createComment(req: Request, res: Response): Promise<void> {
		try {
			const commentData: ICommentData = {
				...req.body,
				createdBy: req.user.id,
			};

			const newPost = await this.commentService.createComment(commentData);
			res.status(StatusCodes.CREATED).json(newPost);
		} catch (error) {
			this.loggerService.error(error);
			res.status(StatusCodes.FORBIDDEN).json({ message: 'Can not create comment' });
		}
	}

	async getAllComments(req: Request, res: Response): Promise<void> {
		try {
			const postId = +req.query.postId!;
			const comments = await this.commentService.getAllComment(postId);
			res.status(StatusCodes.OK).json(comments);
		} catch (error) {
			this.loggerService.error(error);
			res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found comments' });
		}
	}
}
