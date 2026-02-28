const express = require('express');
const cors = require('cors');
const addLeaveDirect = require('./_lib/handlers/add-leave-direct');
const getLeaves = require('./_lib/handlers/get-leaves');
const updateStatus = require('./_lib/handlers/update-status');
const deleteLeave = require('./_lib/handlers/delete-leave');
const adminLogin = require('./_lib/handlers/admin-login');
const seedData = require('./_lib/handlers/seed-data');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes for Admin Panel
app.post('/api/admin-login', async (req, res) => {
    await adminLogin(req, res);
});

app.get('/api/get-leaves', async (req, res) => {
    await getLeaves(req, res);
});

app.patch('/api/update-status', async (req, res) => {
    await updateStatus(req, res);
});

app.delete('/api/delete-leave', async (req, res) => {
    await deleteLeave(req, res);
});

app.post('/api/add-leave-direct', async (req, res) => {
    await addLeaveDirect(req, res);
});

app.post('/api/seed-data', async (req, res) => {
    await seedData(req, res);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all for API 404
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// Export for Vercel
module.exports = app;

