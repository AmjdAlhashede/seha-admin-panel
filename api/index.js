const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the parent directory
// In Vercel, files in the root are accessible relative to /api/index.js
app.use(express.static(path.join(__dirname, '..')));

// Import handlers statically for Vercel bundling
const adminLogin = require('./_lib/handlers/admin-login');
const getLeaves = require('./_lib/handlers/get-leaves');
const updateStatus = require('./_lib/handlers/update-status');
const deleteLeave = require('./_lib/handlers/delete-leave');
const addLeaveDirect = require('./_lib/handlers/add-leave-direct');
const seedData = require('./_lib/handlers/seed-data');

// Error-safe handler wrapper
const safeInvoke = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// API Routes for Admin Panel
app.post('/api/admin-login', safeInvoke(adminLogin));
app.get('/api/get-leaves', safeInvoke(getLeaves));
app.patch('/api/update-status', safeInvoke(updateStatus));
app.delete('/api/delete-leave', safeInvoke(deleteLeave));
app.post('/api/add-leave-direct', safeInvoke(addLeaveDirect));
app.post('/api/seed-data', safeInvoke(seedData));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

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

