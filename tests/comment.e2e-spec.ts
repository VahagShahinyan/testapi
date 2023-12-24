import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { generateToken } from './helper/generate-token';
import { AUTHENTICATION_TOKEN_IS_REQUIRED } from '../src/common/auth.message';
import { POST_CREATE_ACCESS, POST_ID_REQUIRED, POST_NOT_FOUND } from '../src/post/post.message';
import { isArray } from 'class-validator';
import { COMMENT_FETCHING_ACCESS } from '../src/comment/comment.message';
let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

afterAll(async ()=>{
	await application.prismaService.client.comments.deleteMany({});
	await application.prismaService.client.posts.deleteMany({});

})
beforeEach(async ()=>{
	await application.prismaService.client.comments.deleteMany({});
	await application.prismaService.client.posts.deleteMany({});
})
describe('Comment e2e', () => {

	describe("When attempting to create a comment with the correct parameters.", ()=>{
		it('should be success', async () => {
			const payload ={
				groupIds:[1,2],
				id: 3
			}

			const token = generateToken(payload)

			const postData = {
				groupId: 2,
				text: 'text for comment'
			}

			const createdPost = await application.prismaService.client.posts.create({
				data:{
					group_id:postData.groupId,
					text:postData.text,
					created_by: payload.id
				}
			})

			const requestData = {
				postId: createdPost.id,
				text:"comment text 2"
			}

			const res = await request(application.app)
				.post('/comment')
				.send(requestData)
			  .set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.CREATED);
			expect(res.body.id).toBeDefined()
			expect(res.body.post_id).toBe(requestData.postId)
			expect(res.body.text).toBe(requestData.text)
			expect(res.body.created_by).toBeDefined()
			expect(res.body.created_at).toBeDefined()
			expect(res.body.updated_at).toBeDefined()
		});
	})


	describe("When attempting to create a comment and the JWT token is missing.", ()=>{
		it("should be error", async ()=>{
			const postData = {
				groupId: 2,
				text: 'text from test'
			}

			const createdPost = await application.prismaService.client.posts.create({
				data:{
					group_id:postData.groupId,
					text:postData.text,
					created_by: 1
				}
			})

			const requestData = {
				postId: createdPost.id,
				text:"comment text 2"
			}

			const res = await request(application.app)
				.post('/comment')
				.send(requestData)

			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.message).toBe(AUTHENTICATION_TOKEN_IS_REQUIRED);
		})
	})

	describe("When attempting to create a comment and the user does not have access to that post", ()=>{
		it("should be error", async ()=>{
			const payload ={
				groupIds:[1,2],
				id: 3
			}

			const token = generateToken(payload)

			const postData = {
				groupId: 3,
				text: 'text for post'
			}

			const createdPost = await application.prismaService.client.posts.create({
				data:{
					group_id:postData.groupId,
					text:postData.text,
					created_by: payload.id
				}
			})

			const requestData = {
				postId: createdPost.id,
				text:"comment text 2"
			}

			const res = await request(application.app)
				.post('/comment')
				.send(requestData)
				.set('Authorization', `Bearer ${token}`);


			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.message).toBe(POST_CREATE_ACCESS);
		})
	})
	describe("When attempting to create a comment on a non-existing post", ()=>{
		it("should be error", async ()=>{
			const payload ={
				groupIds:[1,2],
				id: 3
			}

			const token = generateToken(payload)

			const requestData = {
				postId: 1,
				text:"comment text 2"
			}

			const res = await request(application.app)
				.post('/comment')
				.send(requestData)
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
			expect(res.body.message).toBe(POST_NOT_FOUND);
		})
	})

	describe("When attempting to retrieve all comments by postId, and the user has access", ()=>{
		it("should be success", async ()=>{
			const payload ={
				groupIds:[1,2],
				id: 3
			}

			const token = generateToken(payload)

			const postData = {
				groupId: 2,
				text: 'text for post'
			}

			const createdPost = await application.prismaService.client.posts.create({
				data:{
					group_id:postData.groupId,
					text:postData.text,
					created_by: payload.id
				}
			})

	const commentData = {
		post_id: createdPost.id,
		text: "comment text",
		created_by: payload.id
	}
	 await application.prismaService.client.comments.create({
				data:commentData
			})

			const res = await request(application.app)
				.get('/comment')
				.query({
					postId: createdPost.id
				})
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.OK);


			expect(isArray(res.body)).toBeTruthy()
				expect(res.body[0].id).toBeDefined()
			  expect(res.body[0].post_id).toBe(createdPost.id)
				expect(res.body[0].text).toBe(commentData.text)
				expect(res.body[0].created_by).toBe(payload.id)
				expect(res.body[0].created_at).toBeDefined()
				expect(res.body[0].updated_at).toBeDefined()

		})
	})

	describe("When attempting to retrieve all comments by postId, and the user does not have access", ()=>{
		it("should be error", async ()=>{
			const payload ={
				groupIds:[1,2],
				id: 3
			}

			const token = generateToken(payload)

			const postData = {
				groupId: 3,
				text: 'text from test'
			}

			const createdPost = await application.prismaService.client.posts.create({
				data:{
					group_id:postData.groupId,
					text:postData.text,
					created_by: payload.id
				}
			})

			const commentData = {
				post_id: createdPost.id,
				text: "comment text",
				created_by: payload.id
			}
			await application.prismaService.client.comments.create({
				data:commentData
			})

			const res = await request(application.app)
				.get('/comment')
				.query({
					postId: createdPost.id
				})
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.message).toBe(COMMENT_FETCHING_ACCESS);

		})
	})


	describe("When attempting to retrieve all comments, and the postId is missing", ()=>{
		it("should be error", async ()=>{
			const payload ={
				groupIds:[1,2],
				id: 3
			}

			const token = generateToken(payload)

			const postData = {
				groupId: 2,
				text: 'text from test'
			}

			const createdPost = await application.prismaService.client.posts.create({
				data:{
					group_id:postData.groupId,
					text:postData.text,
					created_by: payload.id
				}
			})

			const commentData = {
				post_id: createdPost.id,
				text: "comment text",
				created_by: payload.id
			}
			await application.prismaService.client.comments.create({
				data:commentData
			})

			const res = await request(application.app)
				.get('/comment')
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.message).toBe(POST_ID_REQUIRED);

		})
	})

});

afterAll(() => {
	application.close();
});
