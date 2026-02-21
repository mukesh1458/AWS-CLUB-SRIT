const express = require('express');
const { supabase, supabaseAdmin } = require('../supabaseClient');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new student
 */
router.post('/register', async (req, res) => {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Please provide email, password, and full name.' });
    }

    try {
        // Sign up user with Supabase Auth
        // The handle_new_user trigger in our SQL script will automatically capture the metadata
        // and insert a row into the 'profiles' table with the role 'student'.
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: full_name,
                    role: 'student'
                }
            }
        });

        if (error) throw error;

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: full_name
            },
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Login a user (Student, Team Member, or Super Admin)
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log(`✅ Auth successful for ${data.user.id}. Fetching profile...`);

        // Fetch user profile to get their specific role via the Admin bypass client 
        // (so we don't have to worry about RLS during login flow)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id);

        console.log(`Profile search result:`, profile);

        if (profileError) throw profileError;

        if (!profile || profile.length === 0) {
            throw new Error(`Profile not found for user ID: ${data.user.id}`);
        }

        const userProfile = profile[0];

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: userProfile.full_name,
                role: userProfile.role
            },
            token: data.session.access_token, // JWT Token for the frontend to include in subsequent requests
            refresh_token: data.session.refresh_token
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;
