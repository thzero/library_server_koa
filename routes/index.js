import koaRouter from '@koa/router';

import BaseRoute from'@thzero/library_server/routes/index';

class KoaBaseRoute extends BaseRoute {
	_initializeRouter(app, config) {
		return new koaRouter({
			prefix: this._prefix
		});
	}

	_jsonResponse(ctx, json) {
		if (!ctx)
			throw Error('Invalid context for response.');
			
		ctx.type = 'application/json; charset=utf-8';
		ctx.body = json;
	}
}

export default KoaBaseRoute;
