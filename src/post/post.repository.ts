import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { PrismaService } from '../database/prisma.service';
import { IPostData } from './post.interface';
@injectable()
export class PostRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async createPost(requestData: IPostData) {
		return this.prismaService.client.posts.create({
			data: {
				group_id: requestData.groupId,
				text: requestData.text,
				created_by: requestData.createdBy,
			},
		});
	}

	async getAllPosts(groupId: number) {
		return this.prismaService.client.$queryRaw`
			SELECT
				posts.id,
				posts.text,
				posts.group_id ,
				posts.created_by ,
				posts.created_at,
				posts.updated_at ,
				COUNT(comments.id) AS "commentsCount"
			FROM
				posts
			LEFT JOIN
				comments ON posts.id = comments.post_id
			WHERE
				posts.group_id = ${groupId}
			GROUP BY
				posts.id
			ORDER BY
				posts.id DESC
`;
	}

	async getPostById(id: number) {
		return this.prismaService.client.posts.findFirst({
			where: {
				id,
			},
		});
	}
}
