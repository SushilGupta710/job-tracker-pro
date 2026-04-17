const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.set('etag', false);
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: '*', // During development, this is easiest
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Job Tracker API',
        version: '1.0.0',
        description: 'Backend API for the Job Tracker application',
    },
    servers: [
        {
        url: 'https://smart-job-tracker-api-w44d.onrender.com/',
        description: 'Production server (Render)'
      },
        {
            url: 'http://localhost:3000',
            description: 'Local development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            AuthResponse: {
                type: 'object',
                properties: {
                    user: { type: 'object' },
                    session: { type: 'object' },
                },
            },
            Job: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    job_title: { type: 'string' },
                    job_company_name: { type: 'string' },
                    job_location: { type: 'string' },
                    job_url: { type: 'string' },
                    job_salary: { type: 'string' },
                    job_description: { type: 'string' },
                    status_id: { type: 'integer' },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        '/api/auth/signup': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                    first_name: { type: 'string' },
                                    last_name: { type: 'string' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'User created',
                    },
                    400: {
                        description: 'Bad request',
                    },
                },
            },
        },
        '/api/auth/signin': {
            post: {
                tags: ['Auth'],
                summary: 'Sign in a user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Authentication successful',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                },
            },
        },
        '/api/user': {
            get: {
                tags: ['User'],
                summary: 'Get current user profile',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'User profile returned' },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/jobs/statuses': {
            get: {
                tags: ['Jobs'],
                summary: 'List all job statuses',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Statuses returned' },
                },
            },
        },
        '/api/jobs': {
            get: {
                tags: ['Jobs'],
                summary: 'Get all jobs for current user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Jobs returned' },
                },
            },
        },
        '/api/jobs/create': {
            post: {
                tags: ['Jobs'],
                summary: 'Create a new job',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Job',
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Job created' },
                },
            },
        },
        '/api/jobs/update/{jobId}': {
            put: {
                tags: ['Jobs'],
                summary: 'Update a job',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'jobId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { type: 'object' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Job updated' },
                },
            },
        },
        '/api/jobs/{jobId}': {
            delete: {
                tags: ['Jobs'],
                summary: 'Delete a job',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'jobId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Job deleted' },
                },
            },
        },
        '/api/jobs/status/{jobId}': {
            patch: {
                tags: ['Jobs'],
                summary: 'Update only job status',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'jobId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status_id: { type: 'integer' },
                                },
                                required: ['status_id'],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Status updated' },
                },
            },
        },
        '/api/jobs/timeline/{jobId}': {
            get: {
                tags: ['Jobs'],
                summary: 'Get job timeline',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'jobId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Timeline returned' },
                },
            },
        },
        '/api/jobs/search': {
            get: {
                tags: ['Jobs'],
                summary: 'Search user jobs',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'query',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Search results returned' },
                },
            },
        },
        '/api/jobs/export': {
            get: {
                tags: ['Jobs'],
                summary: 'Export jobs',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Export data returned' },
                },
            },
        },
        '/api/jobs/bulk-import': {
            post: {
                tags: ['Jobs'],
                summary: 'Bulk import jobs',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    jobs: {
                                        type: 'array',
                                        items: { type: 'object' },
                                    },
                                },
                                required: ['jobs'],
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Jobs imported' },
                },
            },
        },
        '/api/auth/google': {
            get: {
                tags: ['Auth'],
                summary: 'Sign in with Google OAuth',
                responses: {
                    200: { description: 'OAuth URL returned' },
                },
            },
        },
    },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 1. JWT VERIFICATION MIDDLEWARE ---
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = user; // Add user info to request
    next();
};

// --- 2. AUTH APIS ---

app.post('/api/auth/signup', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name }
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'User created!', user: data.user });
});

app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: error.message });

    res.status(200).json({
        user: {
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata.first_name,
            last_name: data.user.user_metadata.last_name,
        },
        session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
        },
    });
});

// --- 3. USER APIS (PROTECTED) ---

app.get('/api/user', authenticateToken, async (req, res) => {
    res.json({
        first_name: req.user.user_metadata.first_name,
        last_name: req.user.user_metadata.last_name,
        email: req.user.email
    });
});

app.put('/api/user/update', authenticateToken, async (req, res) => {
    const { first_name, last_name } = req.body;
    const { data, error } = await supabase.auth.admin.updateUserById(req.user.id, {
        user_metadata: { first_name, last_name }
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'User updated successfully' });
});

// --- 4. JOB STATUS APIS ---

app.get('/api/jobs/statuses', authenticateToken, async (req, res) => {
    const { data, error } = await supabase.from('job_status').select('*');
    if (error) return res.status(400).json({ error: error.message });
    // Map 'Saved' to 'Saved/New' for UI compatibility
    const mapped = data.map(status => ({
        ...status,
        status_name: status.status_name === 'Saved' ? 'Saved/New' : status.status_name
    }));
    res.json(mapped);
});

// --- 5. JOB MANAGEMENT APIS ---

// Get all jobs for a specific user
app.get('/api/jobs', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('user_job_data')
        .select(`*, job_status(status_name), job_source(source_name)`)
        .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    // Map 'Saved' to 'Saved/New' in the response
    const mapped = data.map(job => ({
        ...job,
        job_status: {
            ...job.job_status,
            status_name: job.job_status?.status_name === 'Saved' ? 'Saved/New' : job.job_status?.status_name
        }
    }));
    res.json(mapped);
});

app.post('/api/jobs/create', authenticateToken, async (req, res) => {
    const job = req.body;
    
    // Mapping your frontend keys to the correct Database column names
    const payload = {
        user_id: req.user.id,
        job_title: job.title,
        job_company_name: job.company,
        job_location: job.location,
        job_url: job.url, // Fixed: was 'url'
        job_salary: job.salary, // Fixed: was 'salary'
        job_description: job.description,
        status_id: job.status_id || 1,
        job_image_url: job.job_image_url || null, // Fixed: was 'logo'
        source_id: job.source_id || 1, // Use provided source_id or default to Manual
    };

    // 1. Insert the Job
    const { data, error } = await supabase
        .from('user_job_data')
        .insert(payload)
        .select(`*, job_status(status_name), job_source(source_name)`)
        .single(); // Returns the object directly instead of an array

    if (error) return res.status(400).json({ error: error.message });

    // 2. Create the first Timeline Entry (Initial Status)
    await supabase.from('job_status_history').insert({
        job_id: data.id,
        user_id: req.user.id,
        status_id: data.status_id
    });

    res.status(201).json(data);
});

// Update Job + Add Timeline entry if status changed
app.put('/api/jobs/update/:jobId', authenticateToken, async (req, res) => {
    const { status_id, ...otherData } = req.body;
    const jobId = req.params.jobId;

    // 1. Get current job to check if status is actually changing
    const { data: currentJob } = await supabase.from('user_job_data').select('status_id').eq('id', jobId).single();

    // 2. Update the main table
    const updatePayload = { 
        ...otherData, 
        status_id, 
        job_modified_date: new Date().toISOString() 
    };
    
    const { error: updateError } = await supabase.from('user_job_data').update(updatePayload).eq('id', jobId);
    if (updateError) return res.status(400).json({ error: updateError.message });

    // 3. If status changed, log to timeline
    if (currentJob && currentJob.status_id !== status_id) {
        await supabase.from('job_status_history').insert({
            job_id: jobId,
            user_id: req.user.id,
            status_id: status_id
        });
    }

    res.json({ message: 'Job updated successfully' });
});

app.delete('/api/jobs/:jobId', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('user_job_data').delete().eq('id', req.params.jobId);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Job deleted' });
});

// Partial Update: Only Status
app.patch('/api/jobs/status/:jobId', authenticateToken, async (req, res) => {
    const { status_id } = req.body;
    const jobId = req.params.jobId;

    const { error } = await supabase.from('user_job_data').update({ 
        status_id, 
        job_modified_date: new Date().toISOString() 
    }).eq('id', jobId);

    if (error) return res.status(400).json({ error: error.message });

    // Add to timeline
    await supabase.from('job_status_history').insert({
        job_id: jobId,
        user_id: req.user.id,
        status_id: status_id
    });

    res.json({ message: 'Status updated and timeline recorded' });
});

// Get Timeline
app.get('/api/jobs/timeline/:jobId', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('job_status_history')
        .select(`*, job_status(status_name)`)
        .eq('job_id', req.params.jobId)
        .order('status_change_date', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// --- 6. SEARCH & EXPORT ---

app.get('/api/jobs/search', authenticateToken, async (req, res) => {
    const { query } = req.query; // example: ?query=Google

    const { data, error } = await supabase
        .from('user_job_data')
        .select('*')
        .eq('user_id', req.user.id)
        .or(`job_title.ilike.%${query}%,job_company_name.ilike.%${query}%,job_location.ilike.%${query}%`);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Download/Get all data for CSV conversion in Angular
app.get('/api/jobs/export', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('user_job_data')
        .select('*')
        .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// --- 7. BULK IMPORT ---
app.post('/api/jobs/bulk-import', authenticateToken, async (req, res) => {
    const { jobs } = req.body; 

    if (!jobs || !Array.isArray(jobs)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
    }

    // 1. Prepare the data with correct column names
    const sanitizedJobs = jobs.map(job => ({
        user_id: req.user.id,
        source_id: job.source_id || 1, 
        job_title: job.title,
        job_company_name: job.company,
        job_url: job.url,
        job_salary: job.salary,
        job_location: job.location,
        job_description: job.description,
        status_id: job.status_id || 1,
        job_image_url: job.job_image_url || null,
        job_applieddate: job.job_applieddate || new Date().toISOString()
    }));

    // 2. Insert into main table and SELECT the new IDs back
    const { data: newJobs, error: jobError } = await supabase
        .from('user_job_data')
        .insert(sanitizedJobs)
        .select('id, status_id'); // We need these to build the timeline

    if (jobError) return res.status(400).json({ error: jobError.message });

    // 3. Create timeline entries for ALL imported jobs
    const timelineEntries = newJobs.map(job => ({
        job_id: job.id,
        user_id: req.user.id,
        status_id: job.status_id,
        status_change_date: new Date().toISOString()
    }));

    const { error: timelineError } = await supabase
        .from('job_status_history')
        .insert(timelineEntries);

    if (timelineError) {
        console.error("Timeline Bulk Error:", timelineError);
        // We don't return error here because jobs are already created, 
        // but it's good to log it.
    }

    res.status(201).json({ 
        message: `${newJobs.length} jobs and timeline records imported successfully` 
    });
});

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

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
const port = process.env.PORT || 3000; 
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});