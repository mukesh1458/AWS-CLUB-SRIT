const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');

const router = express.Router();

// ──────────────────────────────────────────
// GET /api/public/events
// Fetch all events for public viewing
// ──────────────────────────────────────────
router.get('/events', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('is_deleted', false)
            .order('date', { ascending: true });

        if (error) throw error;
        res.status(200).json({ events: data });
    } catch (err) {
        console.error('Public events error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// GET /api/public/resources
// Fetch all resources for public viewing
// ──────────────────────────────────────────
router.get('/resources', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ resources: data });
    } catch (err) {
        console.error('Public resources error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// GET /api/public/stats
// Quick stats for the homepage
// ──────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const { count, error } = await supabaseAdmin
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false);

        if (error) throw error;
        res.status(200).json({ totalEvents: count || 0 });
    } catch (err) {
        console.error('Public stats error:', err);
        res.status(500).json({ error: err.message, totalEvents: 0 });
    }
});

module.exports = router;
