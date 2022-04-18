import LibraryConstants from '@thzero/library_server/constants';

import Utility from '@thzero/library_common/utility';

import BaseRoute from './index';

import authentication from '../middleware/authentication';

class BaseNewsRoute extends BaseRoute {
	constructor(prefix, version) {
		super(prefix ? prefix : '/news');

		// this._serviceNews = null;
	}

	async init(injector, config) {
		const router = await super.init(injector, app, config);
		router.serviceNews = injector.getService(LibraryConstants.InjectorKeys.SERVICE_NEWS);
		// this._serviceNews = injector.getService(LibraryConstants.InjectorKeys.SERVICE_NEWS);
	}

	get id() {
		return 'news';
	}

	_initializeRoutes(router) {
		router.get('/latest/:date',
			authentication(false),
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_NEWS);
				// const response = (await service.latest(ctx.correlationId, ctx.state.user, parseInt(ctx.params.date))).check(ctx);
				const response = (await ctx.router.serviceNews.latest(ctx.correlationId, ctx.state.user, parseInt(ctx.params.date))).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}
}

export default BaseNewsRoute;
