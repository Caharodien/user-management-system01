const jwt = require('jsonwebtoken'); // Correctly import jsonwebtoken
const { secret } = require('config.json'); // Load the secret key (assuming you have it in a config file)
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. Role.Admin, Role.User or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        async (req, res, next) => {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(403).send('Token is required');
            }

            // Strip 'Bearer ' prefix if it exists
            const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

            // Verify the token using jwt.verify
            jwt.verify(tokenWithoutBearer, secret, { algorithms: ['HS256'] }, (err, decoded) => {
                if (err) {
                    return res.status(401).send('Invalid or expired token');
                }
                req.user = decoded; // Attach the decoded user to the request
                next(); // Proceed to the next middleware or route handler
            });
        },

        // authorize based on user role
        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);

            if (!account || (roles.length && !roles.includes(account.role))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}
