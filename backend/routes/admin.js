const express = require('express');
const cloudinary = require('cloudinary').v2;
const { supabaseAdmin } = require('../supabaseClient');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Removed direct team member creation for Phase 5.
// Team admins now register normally and are approved/assigned manually.

// ──────────────────────────────────────────
// GET /api/admin/pending-users
// List all users awaiting approval (students)
// ──────────────────────────────────────────
router.get('/pending-users', async (req, res) => {
    // Both super_admin and team_member can see pending users
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ users: data });
    } catch (err) {
        console.error('Pending users error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// POST /api/admin/approve-user/:id
// Approve a specific pending user
// ──────────────────────────────────────────
router.post('/approve-user/:id', async (req, res) => {
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ is_approved: true })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'User approved successfully', user: data[0] });
    } catch (err) {
        console.error('Approve user error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// DELETE /api/admin/reject-user/:id
// Reject (delete) a pending user
// ──────────────────────────────────────────
router.delete('/reject-user/:id', async (req, res) => {
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.params;

    try {
        // Step 1: Delete all related records first (to avoid FK constraint errors)
        await supabaseAdmin.from('event_registrations').delete().eq('user_id', id);

        // Step 2: Delete the profile row
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', id);

        if (profileError) throw profileError;

        // Step 3: Delete from Supabase Auth (non-blocking if it fails)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) console.warn('Auth delete warning (non-fatal):', authError.message);

        res.status(200).json({ message: 'User rejected and removed successfully' });
    } catch (err) {
        console.error('Reject user error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// GET /api/admin/stats
// Returns live counts for the Super Admin dashboard
// ──────────────────────────────────────────
router.get('/stats', async (req, res) => {
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    try {
        const [studentsRes, eventsRes, resourcesRes] = await Promise.all([
            supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('is_approved', true),
            supabaseAdmin.from('events').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('resources').select('id', { count: 'exact', head: true }),
        ]);

        res.status(200).json({
            totalStudents: studentsRes.count || 0,
            totalEvents: eventsRes.count || 0,
            totalResources: resourcesRes.count || 0,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: err.message });
    }
});


// ──────────────────────────────────────────
// POST /api/admin/cloudinary-signature
// Returns a signed upload signature so the
// frontend can upload directly to Cloudinary
// ──────────────────────────────────────────
router.post('/cloudinary-signature', async (req, res) => {
    // Only team members can upload profile pictures
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'aws-club-srit/avatars';

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET
    );

    res.json({
        signature,
        timestamp,
        folder,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
    });
});

// ──────────────────────────────────────────
// PATCH /api/admin/update-avatar
// Saves the Cloudinary URL to the user profile
// ──────────────────────────────────────────
router.patch('/update-avatar', async (req, res) => {
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { avatar_url } = req.body;
    if (!avatar_url) return res.status(400).json({ error: 'avatar_url is required.' });

    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ avatar_url })
            .eq('id', req.user.id)
            .select();

        if (error) throw error;
        res.json({ message: 'Avatar updated!', profile: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// DELETE /api/admin/resources/:id
// Deletes a resource from the database
// ──────────────────────────────────────────
router.delete('/resources/:id', async (req, res) => {
    // Only super_admin and team_member can delete resources
    if (!['super_admin', 'team_member'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }

    const { id } = req.params;

    try {
        const { error } = await supabaseAdmin
            .from('resources')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Delete resource error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
