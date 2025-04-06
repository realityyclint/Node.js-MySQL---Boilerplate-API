const { expressjwt: jwt } = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string or an array of strings
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req, res, next) => {
            try {
                // Make sure req.user exists
                if (!req.user || !req.user.id) {
                    return res.status(401).json({ message: 'Invalid or missing token' });
                }

                // Look up account
                const account = await db.Account.findByPk(req.user.id);

                // Check if account exists and role is allowed
                if (!account || (roles.length && !roles.includes(account.role))) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                // Attach additional info to req.user
                req.user.role = account.role;
                const refreshTokens = await account.getRefreshTokens();
                req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);

                next();
            } catch (err) {
                console.error('Authorize middleware error:', err);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    ];
}
req.user.id