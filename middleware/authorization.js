import LibraryConstants from '@thzero/library_server/constants';
import LibraryCommonServiceConstants from '@thzero/library_common_service/constants';

import injector from '@thzero/library_common/utility/injector';

// require('../utility/string.cjs');
String.isNullOrEmpty = function(value) {
	//return !(typeof value === 'string' && value.length > 0)
	return !value;
}

String.isString = function(value) {
	return (typeof value === "string" || value instanceof String);
}

String.trim = function(value) {
	if (!value || !String.isString(value))
		return value;
	return value.trim();
}

const logicalAnd = 'and';
const logicalOr = 'or';

const authorizationCheckClaims = async (ctx, success, logical, security, logger) => {
	if (!ctx)
		return false;
	if (!(ctx.state.claims && Array.isArray(ctx.state.claims)))
		return false;

	let result;
	let roleAct;
	let roleObj;
	let roleParts;
	for (const claim of ctx.state.claims) {
		logger.debug('middleware', 'authorization', 'authorization.claim', claim, ctx.correlationId);

		for (const role of ctx.state.roles) {
			logger.debug('middleware', 'authorization', 'role', role, ctx.correlationId);

			roleParts = role.split('.');
			if (roleParts && roleParts.length < 1)
				success = false;

			roleObj = roleParts[0];
			roleAct = roleParts.length >= 2 ? roleParts[1] : null

			result = await security.validate(claim, null, roleObj, roleAct);
			logger.debug('middleware', 'authorization', 'result', result, ctx.correlationId);
			if (logical === logicalOr)
				success = success || result;
			else
				success = success && result;
		}
	}

	return success;
}

const authorizationCheckRoles = async (ctx, success, logical, security, logger) => {
	if (!ctx)
		return false;

	logger.debug('middleware', 'authorizationCheckRoles', 'user', ctx.state.user, ctx.correlationId);
	if (!(ctx.state.user && ctx.state.user.roles && Array.isArray(ctx.state.user.roles)))
		return false;

	logger.debug('middleware', 'authorizationCheckRoles', 'logical', logical, ctx.correlationId);

	let result;
	let roleAct;
	let roleObj;
	let roleParts;
	for (const userRole of ctx.state.user.roles) {
		logger.debug('middleware', 'authorizationCheckRoles', 'userRole', userRole, ctx.correlationId);

		for (const role of ctx.state.roles) {
			logger.debug('middleware', 'authorizationCheckRoles', 'role', role, ctx.correlationId);

			roleParts = role.split('.');
			if (roleParts && roleParts.length < 1)
				success = false;

			roleObj = roleParts[0];
			roleAct = roleParts.length >= 2 ? roleParts[1] : null

			result = await security.validate(userRole, null, roleObj, roleAct);
			logger.debug('middleware', 'authorizationCheckRoles', 'result', result, ctx.correlationId);
			if (logical === logicalOr) {
				if (result)
					return result;

				success = false;
			}
			else
				success = success && result;
		}
	}

	return success;
}

const initalizeRoles = (ctx, roles, logger) => {
	if (Array.isArray(roles)) {
		// logger.debug('middleware', 'initalizeRoles', 'roles1a', roles);
		ctx.state.roles = roles;
	}
	else if ((typeof(roles) === 'string') || (roles instanceof String)) {
		// logger.debug('middleware', 'initalizeRoles', 'roles1b', roles);
		ctx.state.roles = roles.split(',');
		ctx.state.roles.map(item => item ? item.trim() : item);
	}
}

const authorization = (roles, logical) => {
	if (String.isNullOrEmpty(logical) || (logical !== logicalAnd) || (logical !== logicalOr))
		logical = logicalOr;

	return async (ctx, next) => {
		const config = injector.getService(LibraryCommonServiceConstants.InjectorKeys.SERVICE_CONFIG);
		const logger = injector.getService(LibraryCommonServiceConstants.InjectorKeys.SERVICE_LOGGER);
		const security = injector.getService(LibraryConstants.InjectorKeys.SERVICE_SECURITY);

		// logger.debug('token', ctx.state.token);
		logger.debug('middleware', 'authorization', 'user', ctx.state.user, ctx.correlationId);
		logger.debug('middleware', 'authorization', 'claims', ctx.state.claims, ctx.correlationId);
		logger.debug('middleware', 'authorization', 'roles1', roles, ctx.correlationId);
		ctx.state.roles = [];
		if (roles) {
			// logger.debug('authorization.roles1', roles);
			// logger.debug('authorization.roles1', (typeof roles));
			// logger.debug('authorization.roles1', Array.isArray(roles));
			// logger.debug('authorization.roles1', ((typeof(roles) === 'string') || (roles instanceof String)));
			// if (Array.isArray(roles)) {
			// 	// logger.debug('authorization.roles1a', roles);
			// 	ctx.state.roles = roles;
			// }
			// else if ((typeof(roles) === 'string') || (roles instanceof String)) {
			// 	// logger.debug('authorization.roles1b', roles);
			// 	ctx.state.roles = roles.split(',');
			// 	ctx.state.roles.map(item => item ? item.trim() : item);
			// }
			initalizeRoles(ctx, roles, logger);
		}
		logger.debug('middleware', 'authorization', 'roles2', ctx.state.roles, ctx.correlationId);

		let success = false; //(logical === logicalOr ? false : true);
		if (ctx.state.roles && Array.isArray(ctx.state.roles) && (ctx.state.roles.length > 0)) {
			const auth = config.get('auth');
			if (auth) {
				logger.debug('middleware', 'authorization', 'auth.claims', auth.claims, ctx.correlationId);
				logger.debug('middleware', 'authorization', 'auth.claims.check', auth.claims.check, ctx.correlationId);
			}
			if (auth && auth.claims && auth.claims.check)
				success = await authorizationCheckClaims(ctx, (logical === logicalOr ? false : true), logical, security, logger);

			if (!success)
				success = await authorizationCheckRoles(ctx, (logical === logicalOr ? false : true), logical, security, logger);
		}

		logger.debug('middleware', 'authorization', 'success', null, ctx.state.success, ctx.correlationId);
		if (success) {
			await next();
			return;
		}

		(async () => {
			const serviceUsageMetrics = injector.getService(LibraryConstants.InjectorKeys.SERVICE_USAGE_METRIC);
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
			await serviceUsageMetrics.register(usageMetrics).catch((err) => {
				const logger = injector.getService(LibraryCommonServiceConstants.InjectorKeys.SERVICE_LOGGER);
				logger.error(null, err);
			});
		})();

		logger.warn('middleware', 'authorization', 'Unauthorized... authorization unknown', null, ctx.correlationId);
		ctx.throw(401);
	}
}

export default authorization;
