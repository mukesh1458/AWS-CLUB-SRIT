const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { supabase } = require('./supabaseClient');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
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

const teamRoutes = require('./routes/team');
const studentRoutes = require('./routes/student');
const publicRoutes = require('./routes/public');

// Public Data Routes (viewing events, resources without logging in)
app.use('/api/public', publicRoutes);

// Use Auth Routes
app.use('/api/auth', authRoutes);

// Admin Management Routes (Shared by Super Admin & Team Admin for approvals)
app.use('/api/admin', requireAuth, requireRole(['super_admin', 'team_member']), adminRoutes);

// Team Admin Routes (Creating Events/Resources)
app.use('/api/team', requireAuth, requireRole(['super_admin', 'team_member']), teamRoutes);

// Student Routes (Viewing events/resources, registering)
// Note: Internal logic in studentRoutes checks if `is_approved === true`
app.use('/api/student', requireAuth, requireRole(['student', 'team_member', 'super_admin']), studentRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
