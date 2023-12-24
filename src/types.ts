export const TYPES = {
	Application: Symbol.for('Application'),
	ILogger: Symbol.for('ILogger'),
	UserController: Symbol.for('UserController'),
	UserService: Symbol.for('UserService'),
	ExeptionFilter: Symbol.for('ExeptionFilter'),
	ConfigService: Symbol.for('ConfigService'),
	PrismaService: Symbol.for('PrismaService'),
	UsersRepository: Symbol.for('UsersRepository'),

	PostController: Symbol.for('PostController'),
	PostService: Symbol.for('PostService'),
	PostRepository: Symbol.for('PostRepository'),

	CommentController: Symbol.for('CommentController'),
	CommentService: Symbol.for('CommentService'),
	CommentRepository: Symbol.for('CommentRepository'),
};
