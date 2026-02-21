const { supabase, supabaseAdmin } = require('../supabaseClient');

/**
 * Middleware to verify Supabase JWT token and check authentication.
 */
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        // Attach user info to request
        req.user = user;

        // Fetch role from profiles to attach to request
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id);

        if (!profileError && profile && profile.length > 0) {
            req.user.role = profile[0].role;
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};

/**
 * High-Order Middleware to restrict access to specific roles.
 * Usage: router.get('/protected', requireAuth, requireRole(['super_admin', 'team_member']), (req, res) => {...});
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Forbidden: Role not assigned' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

module.exports = { requireAuth, requireRole };
