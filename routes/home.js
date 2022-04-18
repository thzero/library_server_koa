import BaseRoute from './index';

class HomeRoute extends BaseRoute {
	constructor(prefix) {
		super(prefix ? prefix : '');
	}

	get id() {
		return 'home';
	}

	_initializeRoutes(router) {
		// eslint-disable-next-line
		router.get('/', (ctx, next) => {
			ctx.status = 404;
		});
	}

	get _ignoreApi() {
		return true;
	}

	get _version() {
		return '';
	}
}

export default HomeRoute;
