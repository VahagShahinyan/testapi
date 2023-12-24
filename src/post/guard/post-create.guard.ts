import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMiddleware } from '../../common/middleware.interface';
import { GROUP_ID_REQUIRED, POST_CREATE_ACCESS } from '../post.message';
export class PostCreateGuard implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		if (!req.body.groupId) {
			res.status(StatusCodes.BAD_REQUEST).send({ message: GROUP_ID_REQUIRED });
			return;
		}
		const groupId = +req.body.groupId;

		if (req.user && req.user.groupIds.includes(groupId)) {
			return next();
		}
		res.status(StatusCodes.UNAUTHORIZED).send({ message: POST_CREATE_ACCESS });
	}
}
