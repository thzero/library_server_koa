import LibraryConstants from '@thzero/library_server/constants';
import LibraryCommonServiceConstants from '@thzero/library_common_service/constants';

import injector from '@thzero/library_common/utility/injector';

const separator = ': ';

function getAuthToken(context) {
	if (!context)
		return null;

	const logger = injector.getService(LibraryCommonServiceConstants.InjectorKeys.SERVICE_LOGGER);
	const token = context.get(LibraryConstants.Headers.AuthKeys.AUTH);
	logger.debug('middleware', 'getAuthToken', 'token', token, context.correlationId);
	if (!String.isNullOrEmpty(token)) {
		const split = token.split(LibraryConstants.Headers.AuthKeys.AUTH_BEARER + separator);
		logger.debug('middleware', 'getAuthToken', 'split', split, context.correlationId);
		logger.debug('middleware', 'getAuthToken', 'split.length', split.length, context.correlationId);
		if (split.length > 1)
			return split[1];
	}

	logger.debug('middleware', 'getAuthToken', 'fail', null, context.correlationId);
	return null;
}

const authentication = (required) => {
	return async (ctx, next) => {
		const logger = injector.getService(LibraryCommonServiceConstants.InjectorKeys.SERVICE_LOGGER);

		const token = getAuthToken(ctx);
		logger.debug('middleware', 'authentication', 'token', token, ctx.correlationId);
		logger.debug('middleware', 'authentication', 'required', required, ctx.correlationId);
		const valid = ((required && !String.isNullOrEmpty(token)) || !required);
		logger.debug('middleware', 'authentication', 'valid1', (required && !String.isNullOrEmpty(token)), request.correlationId);
		if (required && !String.isNullOrEmpty(token)) {
			const service = injector.getService(LibraryConstants.InjectorKeys.SERVICE_AUTH);
			const results = await service.verifyToken(ctx.correlationId, token);
			logger.debug('middleware', 'authentication', 'results', results, ctx.correlationId);
			if (!results || !results.success) {
				logger.warn('middleware', 'authentication', 'Unauthenticated... invalid token', null, ctx.correlationId);
				ctx.throw(401);
				return;
			}

			ctx.state.token = token;
			ctx.state.user = results.user;
			ctx.state.claims = results.claims;

			await next();
			return;
		}
		logger.debug('middleware', 'authentication', 'valid2', !required, request.correlationId);
		if (!required) {
			await next();
			return;
		}

		(async () => {
			const usageMetrics = {
				url: ctx.request.path,
				correlationId: ctx.correlationId,
				href: ctx.request.href,
				headers: ctx.request.headers,
				host: ctx.request.host,
				hostname: ctx.request.hostname,
				querystring: ctx.request.querystring,
				type: ctx.request.type,
				token: ctx.request.token
			};
			const serviceUsageMetrics = injector.getService(LibraryConstants.InjectorKeys.SERVICE_USAGE_METRIC);
			await serviceUsageMetrics.register(usageMetrics).catch((err) => {
				const logger = injector.getService(LibraryCommonServiceConstants.InjectorKeys.SERVICE_LOGGER);
				logger.error('middleware', 'authentication', err, null, ctx.correlationId);
			});
		})();

		logger.warn('middleware', 'authentication', 'Unauthorized... authentication unknown', null, ctx.correlationId);
		ctx.throw(401);
	}
}

export default authentication;
