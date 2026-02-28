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

// Error-safe handler wrapper
const safeHandler = (handlerPath) => async (req, res) => {
    try {
        const handler = require(handlerPath);
        await handler(req, res);
    } catch (error) {
        console.error(`Error in handler ${handlerPath}:`, error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// API Routes for Admin Panel - Lazy Loaded
app.post('/api/admin-login', safeHandler('./_lib/handlers/admin-login'));
app.get('/api/get-leaves', safeHandler('./_lib/handlers/get-leaves'));
app.patch('/api/update-status', safeHandler('./_lib/handlers/update-status'));
app.delete('/api/delete-leave', safeHandler('./_lib/handlers/delete-leave'));
app.post('/api/add-leave-direct', safeHandler('./_lib/handlers/add-leave-direct'));
app.post('/api/seed-data', safeHandler('./_lib/handlers/seed-data'));

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

