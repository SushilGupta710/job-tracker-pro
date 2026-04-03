const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin (Using Service Role for Backend Power)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. Health Check Route (Test if Supabase is reachable)
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ status: 'Online', message: 'Connected to Supabase Mumbai!' });
  } catch (err) {
    res.status(500).json({ status: 'Error', error: err.message });
  }
});

// 2. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // We use admin.createUser to bypass email confirmation for quick testing
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name }
  });

  if (error) return res.status(400).json({ error: error.message });
  
  res.status(201).json({
    message: 'User created successfully!',
    user: data.user
  });
});

// --- SIGNIN / LOGIN API ---
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  // 1. Call Supabase Auth to verify credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. Handle errors (Invalid email or wrong password)
  if (error) {
    return res.status(401).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }

  // 3. Return the Session and User data
  // data.session contains the 'access_token' (JWT) needed for future requests
  res.status(200).json({
    message: 'Login successful!',
    user: data.user,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in
    }
  });
});

// --- 1. Send OTP to Email ---
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true } // Auto-sign up if they don't exist
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'OTP sent to your email!' });
});

// --- 2. Verify OTP ---
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, token } = req.body;
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) return res.status(401).json({ error: error.message });
  res.status(200).json({ session: data.session, user: data.user });
});

// --- 3. Google Login URL Generator ---
app.get('/api/auth/google', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:4200/dashboard', // Where Angular is running
    }
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ url: data.url }); // Send the Google login link to Angular
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    // This is where the user goes after clicking the email link
    redirectTo: 'http://localhost:4200/update-password', 
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: 'Password reset link sent!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));