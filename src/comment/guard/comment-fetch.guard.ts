import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMiddleware } from '../../common/middleware.interface';
import { PostService } from '../../post/post.service';
import { POST_ID_REQUIRED, POST_NOT_FOUND } from '../../post/post.message';
import { COMMENT_FETCHING_ACCESS } from '../comment.message';
export class CommentFetchGuard implements IMiddleware {
	constructor(private postService: PostService) {}
	async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.query.postId) {
			res.status(StatusCodes.BAD_REQUEST).send({ message: POST_ID_REQUIRED });
			return;
		}
		const postId = +req.query.postId;

		const getPost = await this.postService.getPostById(postId);
		if (!getPost) {
			res.status(StatusCodes.NOT_FOUND).send({ message: POST_NOT_FOUND });
			return;
		}

		const groupId = getPost.group_id;

		if (req.user && req.user.groupIds.includes(groupId)) {
			return next();
		}
		res.status(StatusCodes.UNAUTHORIZED).send({ message: COMMENT_FETCHING_ACCESS });
	}
}
