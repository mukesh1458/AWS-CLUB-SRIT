const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');

const router = express.Router();

// ──────────────────────────────────────────
// POST /api/team/events
// Create a new event
// ──────────────────────────────────────────
router.post('/events', async (req, res) => {
    const { title, description, date, location } = req.body;

    if (!title || !description || !date || !location) {
        return res.status(400).json({ error: 'Please provide all event details.' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .insert([{
                title,
                description,
                date,
                location,
                created_by: req.user.id
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Event created successfully', event: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// POST /api/team/resources
// Upload a new resource
// ──────────────────────────────────────────
router.post('/resources', async (req, res) => {
    const { title, description, file_url } = req.body;

    if (!title || !description || !file_url) {
        return res.status(400).json({ error: 'Please provide title, description, and file_url.' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('resources')
            .insert([{
                title,
                description,
                file_url,
                uploaded_by: req.user.id
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Resource uploaded successfully', resource: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────
// DELETE /api/team/events/:id
// Delete an event
// ──────────────────────────────────────────
router.delete('/events/:id', async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('events')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
