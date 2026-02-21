const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { supabase } = require('./supabaseClient');

const authRoutes = require('./routes/auth');
const { requireAuth, requireRole } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AWS Club SRIT Backend is running!' });
});

// Test Supabase Connection Route
app.get('/api/test-db', async (req, res) => {
    try {
        res.status(200).json({ status: 'ok', message: 'Supabase URL configured.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Use Auth Routes
app.use('/api/auth', authRoutes);

// ==========================================
// PROTECTED API ROUTE EXAMPLES 🛡️
// ==========================================

// 1. Super Admin Only Route (e.g., Dashboard Analytics, Invite Team)
app.get('/api/admin/dashboard', requireAuth, requireRole(['super_admin']), (req, res) => {
    res.json({ message: "Welcome Super Admin! Here are the core metrics.", user: req.user });
});

// 2. Team Member & Super Admin Route (e.g., Manage Events)
app.post('/api/team/events', requireAuth, requireRole(['super_admin', 'team_member']), (req, res) => {
    res.json({ message: "Event created successfully! Only Team and Admins can do this.", user: req.user });
});

// 3. Any Authenticated Student/User Route (e.g., Student Profile)
app.get('/api/student/profile', requireAuth, (req, res) => {
    res.json({ message: "Welcome Student! Here is your profile data.", user: req.user });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
