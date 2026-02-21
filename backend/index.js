const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { supabase } = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

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
        // Simple query to verify Supabase is accessible (like getting a count from a common table)
        // Since we don't have tables yet, even an empty call or checking auth settings works.
        res.status(200).json({ status: 'ok', message: 'Supabase URL configured.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
