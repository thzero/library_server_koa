import koaBody from 'koa-body';

import LibraryConstants from '@thzero/library_server/constants';

import Utility from '@thzero/library_common/utility';

import BaseRoute from './index';

import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';

class BaseUsersRoute extends BaseRoute {
	constructor(prefix, version) {
		super(prefix ? prefix : '/users');

		// this._serviceUsers = null;
	}

	async init(injector, app, config) {
		const router = await super.init(injector, app, config);
		router.serviceUsers = injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
		// this._serviceUsers = injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
	}

	get id() {
		return 'users';
	}

	_initializeRoutes(router) {
		this._initializeRoutesGamerById(router);
		this._initializeRoutesGamerByTag(router);
		this._initializeRoutesRefreshSettings(router);
		this._initializeRoutesUpdate(router);
		this._initializeRoutesUpdateSettings(router);
	}

	_initializeRoutesGamerById(router) {
		return router.get('/gamerId/:gamerId',
			authentication(false),
			// authorization('user'),
			koaBody({
				text: false,
			}),
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
				// const response = (await service.fetchByGamerId(ctx.correlationId, ctx.params.gamerId)).check(ctx);
				const response = (await ctx.router.serviceUsers.fetchByGamerId(ctx.correlationId, ctx.params.gamerId)).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}

	_initializeRoutesGamerByTag(router) {
		return router.get('/gamerTag/:gamerTag',
			authentication(false),
			// authorization('user'),
			koaBody({
				text: false,
			}),
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
				// const response = (await service.fetchByGamerTag(ctx.correlationId, ctx.params.gamerTag)).check(ctx);
				const response = (await ctx.router.serviceUsers.fetchByGamerTag(ctx.correlationId, ctx.params.gamerTag)).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}

	_initializeRoutesRefreshSettings(router) {
		return router.post('/refresh/settings',
			authentication(true),
			authorization('user'),
			koaBody({
				text: false,
			}),
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
				// const response = (await service.refreshSettings(ctx.correlationId, ctx.request.body)).check(ctx);
				const response = (await ctx.router.serviceUsers.refreshSettings(ctx.correlationId, ctx.request.body)).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}

	_initializeRoutesUpdate(router) {
		return router.post('/update',
			authentication(true),
			authorization('user'),
			koaBody({
				text: false,
			}),
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
				// const response = (await service.update(ctx.correlationId, ctx.request.body)).check(ctx);
				const response = (await ctx.router.serviceUsers.update(ctx.correlationId, ctx.request.body)).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}

	_initializeRoutesUpdateSettings(router) {
		return router.post('/update/settings',
			authentication(true),
			authorization('user'),
			koaBody({
				text: false,
			}),
			// eslint-disable-next-line
			async (ctx, next) => {
				// const service = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_USERS);
				// const response = (await service.updateSettings(ctx.correlationId, ctx.request.body)).check(ctx);
				const response = (await ctx.router.serviceUsers.updateSettings(ctx.correlationId, ctx.request.body)).check(ctx);
				this._jsonResponse(ctx, Utility.stringify(response));
			}
		);
	}
}

export default BaseUsersRoute;
