const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),

        async (req, res, next) => {
            try {
                console.log('Decoded req.user:', req.user);

                if (!req.user || !req.user.id) {
                    return res.status(401).json({ message: 'Invalid or missing token' });
                }

                const account = await db.Account.findByPk(req.user.id);
                console.log('req.user.id:', req.user.id);
                console.log('Account:', account);

                if (!account) {
                    return res.status(404).json({ message: 'Account not found' });
                }

                if (roles.length && !roles.includes(account.role)) {
                    return res.status(403).json({ message: 'Forbidden: Insufficient role' });
                }

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