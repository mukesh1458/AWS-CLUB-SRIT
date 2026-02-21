const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');

const router = express.Router();

// Middleware to ensure the student is actually approved
const requireApproval = async (req, res, next) => {
    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_approved')
            .eq('id', req.user.id)
            .single();

        if (!profile || !profile.is_approved) {
            return res.status(403).json({ error: 'You must be approved by an Admin to access this.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Failed to verify approval status.' });
    }
};

// ──────────────────────────────────────────
// GET /api/student/events
// List upcoming events and user's registration status
// ──────────────────────────────────────────
router.get('/events', requireApproval, async (req, res) => {
    try {
        // Fetch all events
        const { data: events, error: eventsErr } = await supabaseAdmin
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (eventsErr) throw eventsErr;

        // Fetch user's registrations
        const { data: registrations, error: regErr } = await supabaseAdmin
            .from('event_registrations')
            .select('event_id')
            .eq('student_id', req.user.id);

        if (regErr) throw regErr;

        const registeredEventIds = new Set(registrations.map(r => r.event_id));

        // Attach boolean `isRegistered` to each event
        const enrichedEvents = events.map(e => ({
            ...e,
            isRegistered: registeredEventIds.has(e.id)
        }));

        res.status(200).json({ events: enrichedEvents });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// POST /api/student/events/:id/register
// Register for an event
// ──────────────────────────────────────────
router.post('/events/:id/register', requireApproval, async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('event_registrations')
            .insert([{
                event_id: req.params.id,
                student_id: req.user.id
            }]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ error: 'You are already registered for this event.' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Successfully registered for the event!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// GET /api/student/resources
// List all learning resources
// ──────────────────────────────────────────
router.get('/resources', requireApproval, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ resources: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
