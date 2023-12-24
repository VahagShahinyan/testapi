import { IMiddleware } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import {
	AUTHENTICATION_TOKEN_IS_NOT_VALID,
	AUTHENTICATION_TOKEN_IS_REQUIRED,
	INVALID_AUTHENTICATION_TOKEN_FORMAT,
} from './auth.message';
import { StatusCodes } from 'http-status-codes';

export class AuthMiddleware implements IMiddleware {
	constructor(private secret: string) {}

	execute(req: Request, res: Response, next: NextFunction) {
		const token = req.headers.authorization;
		if (!token) {
			res.status(StatusCodes.UNAUTHORIZED).json({ message: AUTHENTICATION_TOKEN_IS_REQUIRED });
			return;
		}

		const tokenParts = token.split(' ');
		if (tokenParts.length !== 2) {
			res.status(StatusCodes.UNAUTHORIZED).json({ message: INVALID_AUTHENTICATION_TOKEN_FORMAT });
			return;
		}

		verify(tokenParts[1], this.secret, (err, payload) => {
			if (err) {
				res.status(StatusCodes.UNAUTHORIZED).json({ message: AUTHENTICATION_TOKEN_IS_NOT_VALID });
			} else if (payload) {
				req.user = payload;
				next();
			}
		});
	}
}
