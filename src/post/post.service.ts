import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { PostRepository } from './post.repository';
import { IPostData } from './post.interface';

@injectable()
export class PostService {
	constructor(@inject(TYPES.PostRepository) private postRepository: PostRepository) {}
	async createPost(requestData: IPostData) {
		const createdPost = await this.postRepository.createPost(requestData);
		Object.assign(createdPost, { commentsCount: 0 });
		return createdPost;
	}

	async getAllPosts(groupId: number) {
		return this.postRepository.getAllPosts(groupId);
	}

	async getPostById(id: number) {
		return this.postRepository.getPostById(id);
	}
}
