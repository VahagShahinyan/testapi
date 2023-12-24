import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { ConfigService } from './config/config.service';
import { IConfigService } from './config/config.service.interface';
import { PrismaService } from './database/prisma.service';
import { ExeptionFilter } from './errors/exeption.filter';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';
import { TYPES } from './types';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { PostRepository } from './post/post.repository';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentRepository } from './comment/comment.repository';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind(TYPES.PostController).to(PostController);
	bind(TYPES.PostService).to(PostService).inSingletonScope();
	bind(TYPES.PostRepository).to(PostRepository).inSingletonScope();
	bind(TYPES.CommentController).to(CommentController);
	bind(TYPES.CommentService).to(CommentService).inSingletonScope();
	bind(TYPES.CommentRepository).to(CommentRepository).inSingletonScope();
	bind<App>(TYPES.Application).to(App);
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();
	return { appContainer, app };
}

export const boot = bootstrap();
