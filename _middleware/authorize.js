const jwt = require('express-jwt');
const { secret } = require('/config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string or an array of roles like [Role.User,Role.Admin] or [User,Admin]
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // Authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // Authorize based on user role
        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);

            if (!account) {
                // Account did not exists
                return res.status(401).json({ message: 'Validated Email First' });
            }

            if (!account || (roles.length && !roles.includes(account.role))) {
                // role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }


            // Authentication and authorization successful
            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}
