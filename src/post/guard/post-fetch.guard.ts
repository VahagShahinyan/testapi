import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMiddleware } from '../../common/middleware.interface';
import { GROUP_ID_REQUIRED, POST_FETCH_ACCESS } from '../post.message';
export class PostFetchGuard implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		if (!req.query.groupId) {
			res.status(StatusCodes.BAD_REQUEST).send({ message: GROUP_ID_REQUIRED });
			return;
		}
		const groupId = +req.query.groupId;

		if (req.user && req.user.groupIds.includes(groupId)) {
			return next();
		}
		res.status(StatusCodes.UNAUTHORIZED).send({ message: POST_FETCH_ACCESS });
	}
}
