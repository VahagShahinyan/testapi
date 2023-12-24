import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { generateToken } from './helper/generate-token';
import { AUTHENTICATION_TOKEN_IS_REQUIRED } from '../src/common/auth.message';
import { POST_CREATE_ACCESS, POST_FETCH_ACCESS } from '../src/post/post.message';
import { isArray } from 'class-validator';

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

describe('Posts e2e', () => {
	describe("When attempting to create a post with correct parameters", ()=>{
		it('should be success ', async () => {

			const token = generateToken({
				groupIds:[1,2],
				id: 3
			})

			const requestData = {
				groupId: 1,
				text: 'text from test'
			}
			const res = await request(application.app)
				.post('/post')
				.send(requestData)
			.set('Authorization', `Bearer ${token}`);
			expect(res.statusCode).toBe(StatusCodes.CREATED);
			expect(res.body.id).toBeDefined()
			expect(res.body.group_id).toBe(requestData.groupId)
			expect(res.body.created_by).toBeDefined()
			expect(res.body.text).toBe(requestData.text)
			expect(res.body.commentsCount).toBe(0)
			expect(res.body.created_at).toBeDefined()
			expect(res.body.updated_at).toBeDefined()
		});
	})

	describe("When attempting to create a post and the JWT token is missing", ()=>{
		it("should be error", async ()=>{

			const requestData = {
				groupId: 1,
				text: 'text for post'
			}
			const res = await request(application.app)
				.post('/post')
				.send(requestData)



			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
			expect(res.body.message).toBe(AUTHENTICATION_TOKEN_IS_REQUIRED)
		})
	})

	describe("When attempting to create a post, and the user does not have the necessary access to create it in that group", ()=>{
		it("should be error", async ()=>{
			const token = generateToken({
				groupIds:[1,2],
				id: 3
			})
			const requestData = {
				groupId: 3,
				text: 'text from test'
			}
			const res = await request(application.app)
				.post('/post')
				.send(requestData)
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
			expect(res.body.message).toBe(POST_CREATE_ACCESS)
		})
	})

	describe("When attempting to create a post and required parameters are missing", ()=>{
		it("should be error", async ()=>{
			const token = generateToken({
				groupIds:[1,2],
				id: 3
			})
			const requestData = {
				groupId: 1,
			}
			const res = await request(application.app)
				.post('/post')
				.send(requestData)
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY)

		})
	})


	describe("Retrieve all posts by groupId when the user has access", ()=>{
		it("should be success", async ()=>{

			const payload = {
				groupIds:[1,2],
				id: 3
			}
			const token = generateToken(payload)

			const requestData = {
				groupId: 2,
				text: 'text from test'
			}

			await application.prismaService.client.posts.create({
				data:{
					group_id:requestData.groupId,
					text:requestData.text,
					created_by: payload.id
				}
			})

			const res = await request(application.app)
				.get('/post')
				.send(requestData)
				.query({
					groupId: requestData.groupId
				})
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.OK)
			expect(isArray(res.body)).toBeTruthy()

			expect(res.body[0].id).toBeDefined()
			expect(res.body[0].group_id).toBe(requestData.groupId)
			expect(res.body[0].created_by).toBeDefined()
			expect(res.body[0].text).toBe(requestData.text)
			expect(res.body[0].commentsCount).toBeDefined()
			expect(res.body[0].created_at).toBeDefined()
			expect(res.body[0].updated_at).toBeDefined()


		})
	})

	describe("Retrieve all posts by groupId when the user does not have access", ()=>{
		it("should be error", async ()=>{

			const payload = {
				groupIds:[1,2],
				id: 3
			}
			const token = generateToken(payload)

			const requestData = {
				groupId: 3,
				text: 'text from test'
			}

			await application.prismaService.client.posts.create({
				data:{
					group_id:requestData.groupId,
					text:requestData.text,
					created_by: payload.id
				}
			})

			const res = await request(application.app)
				.get('/post')
				.send(requestData)
				.query({
					groupId: requestData.groupId
				})
				.set('Authorization', `Bearer ${token}`);

			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
			expect(res.body.message).toBe(POST_FETCH_ACCESS)
		})
	})

});

afterAll(() => {
	application.close();
});


