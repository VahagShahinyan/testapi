import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMiddleware } from '../../common/middleware.interface';
import { PostService } from '../../post/post.service';
import { POST_CREATE_ACCESS, POST_NOT_FOUND } from '../../post/post.message';
export class CommentCreateGuard implements IMiddleware {
	constructor(private postService: PostService) {}
	async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		const postId = +req.body.postId;

		const getPost = await this.postService.getPostById(postId);

		if (!getPost) {
			res.status(StatusCodes.NOT_FOUND).send({ message: POST_NOT_FOUND });
			return;
		}

		const groupId = +getPost.group_id;

		if (req.user && req.user.groupIds.includes(groupId)) {
			return next();
		}
		res.status(StatusCodes.UNAUTHORIZED).send({ message: POST_CREATE_ACCESS });
	}
}
