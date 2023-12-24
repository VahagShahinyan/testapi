import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../common/base.controller';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import 'reflect-metadata';
import { PostService } from './post.service';
import { ValidateMiddleware } from '../common/validate.middleware';
import { PostCreateDto } from './dto/post-create.dto';
import { StatusCodes } from 'http-status-codes';
import { PostCreateGuard } from './guard/post-create.guard';
import { PostFetchGuard } from './guard/post-fetch.guard';
import { IPostData } from './post.interface';

@injectable()
export class PostController extends BaseController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.PostService) private postService: PostService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/post',
				method: 'post',
				func: this.createPost,
				middlewares: [new ValidateMiddleware(PostCreateDto), new PostCreateGuard()],
			},
			{
				path: '/post',
				method: 'get',
				func: this.getAllPost,
				middlewares: [new PostFetchGuard()],
			},
		]);
	}

	async createPost(req: Request, res: Response): Promise<void> {
		try {
			const requestData: IPostData = {
				...req.body,
				createdBy: req.user.id,
			};

			const newPost = await this.postService.createPost(requestData);
			res.status(StatusCodes.CREATED).json(newPost);
		} catch (error) {
			this.loggerService.error(error);
			res.status(StatusCodes.FORBIDDEN).json({ message: 'Can not create post' });
		}
	}

	async getAllPost(req: Request, res: Response) {
		try {
			const groupId = +req.query.groupId!;
			const allPost = await this.postService.getAllPosts(groupId);
			res.status(StatusCodes.OK).json(allPost);
		} catch (error) {
			this.loggerService.error(error);
			res.status(StatusCodes.NOT_FOUND).json({ message: 'Not found posts' });
		}
	}
}
