const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const NodeCache = require('node-cache');

const router = express.Router();

// Initialize cache with 5 minutes standard TTL
const publicCache = new NodeCache({ stdTTL: 300 });

// ──────────────────────────────────────────
// GET /api/public/events
// Fetch all events for public viewing
// ──────────────────────────────────────────
router.get('/events', async (req, res) => {
    try {
        const cacheKey = 'public_events';
        const cached = publicCache.get(cacheKey);
        if (cached) return res.status(200).json({ events: cached });

        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        publicCache.set(cacheKey, data);
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
        const cacheKey = 'public_resources';
        const cached = publicCache.get(cacheKey);
        if (cached) return res.status(200).json({ resources: cached });

        const { data, error } = await supabaseAdmin
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        publicCache.set(cacheKey, data);
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
        const cacheKey = 'public_stats';
        const cached = publicCache.get(cacheKey);
        if (cached !== undefined) return res.status(200).json({ totalEvents: cached });

        const { count, error } = await supabaseAdmin
            .from('events')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        const total = count || 0;
        publicCache.set(cacheKey, total);
        res.status(200).json({ totalEvents: total });
    } catch (err) {
        console.error('Public stats error:', err);
        res.status(500).json({ error: err.message, totalEvents: 0 });
    }
});

module.exports = router;
