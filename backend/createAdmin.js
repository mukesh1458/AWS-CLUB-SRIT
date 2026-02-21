const { supabaseAdmin } = require('./supabaseClient');

async function createSuperAdmin() {
    const email = 'admin@srit.edu'; // Change as needed
    const password = 'SuperSecurePassword123!';
    const fullName = 'SRIT Core Admin';

    console.log(`Creating Super Admin account for ${email}...`);

    try {
        // 1. Create the user in auth.users using the admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
                full_name: fullName,
                role: 'super_admin'
            }
        });

        if (authError) {
            console.error('Error creating user in auth:', authError.message);
            return;
        }

        console.log('✅ Auth user created successfully:', authData.user.id);

        // Note: The database trigger (handle_new_user) we created in SQL 
        // will automatically insert the profile with the 'super_admin' role 
        // because we passed it in user_metadata!

        console.log('🎉 Super Admin creation complete! You can now log in.');

    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

createSuperAdmin();
