import LibraryConstants from '@thzero/library_server/constants';

import Utility from '@thzero/library_common/utility';

import BaseRoute from './index';

class VersionRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');

		// this._serviceVersion = null;
	}

	async init(injector, app, config) {
		const router = await super.init(injector, app, config);
		router.serviceVersion = injector.getService(LibraryConstants.InjectorKeys.SERVICE_VERSION);
		// this._serviceVersion = injector.getService(LibraryConstants.InjectorKeys.SERVICE_VERSION);
	}

	get id() {
		return 'version';
	}

	_initializeRoutes(router) {
		router.get('/version',
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_VERSION);
				// const response = (await service.version(ctx.correlationId)).check(ctx);
				const response = (await ctx.router.serviceVersion.version(ctx.correlationId)).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}

	get _version() {
		return 'v1';
	}
}

export default VersionRoute;
