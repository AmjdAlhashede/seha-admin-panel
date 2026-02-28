const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: '*', // Allow all origins for public inquiries
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
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

// Portal Handlers (Migrated)
const addLeave = require('./_lib/handlers/add-leave');
const inquiryLeave = require('./_lib/handlers/inquiry-leave');
const searchSickLeave = require('./_lib/handlers/search-sick-leave');
const GetByServiceCode = require('./_lib/handlers/GetByServiceCode');
const getByCodeAndId = require('./_lib/handlers/get-sick-leave-by-code-and-id');

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

// API Routes for Portal (Centralized)
app.post('/api/add-leave', safeInvoke(addLeave));

// Dummy Auth handler to stop 404 logs for stray frontend calls
app.get('/api/Account/GetJWTUserToken', (req, res) => res.status(200).json({ ErrorCode: 0, Data: { Token: "ignore" } }));
app.post('/api/Account/Logout', (req, res) => res.status(200).json({ success: true }));

// New Independent Prefix for Public Portal (Decoupled)
app.get('/verify/report', unifiedInquiry);
app.get('/verify/sick-leave', unifiedInquiry);
app.get('/verify/sick-leave-details', unifiedInquiry);
app.get('/verify/covid-recovery-report', unifiedInquiry);
app.get('/verify/preentry-medical-report', unifiedInquiry);
app.get('/verify/amanat-health-certificate-inquiry', unifiedInquiry);
app.get('/verify/healthy-marriage-certificate', unifiedInquiry);
app.get('/verify/ayenati-details', unifiedInquiry);
app.get('/verify/driving-licenses-medical-report-inquiry', unifiedInquiry);
app.get('/verify/search-sick-leave', safeInvoke(searchSickLeave));
app.get('/verify/GetByServiceCode', safeInvoke(GetByServiceCode));
app.get('/verify/get-sick-leave-by-code-and-id', safeInvoke(getByCodeAndId));

// Mock PDF routes (points to same handler for now to at least return some data if called)
app.get('/api/pdf/*', (req, res) => {
    res.status(200).json({ message: 'PDF Generation simulated', status: 'ok' });
});

app.get('/api/search-sick-leave', safeInvoke(searchSickLeave));
app.post('/api/search-sick-leave', safeInvoke(searchSickLeave));
app.get('/api/GetByServiceCode', safeInvoke(GetByServiceCode));
app.post('/api/GetByServiceCode', safeInvoke(GetByServiceCode));
app.get('/api/get-sick-leave-by-code-and-id', safeInvoke(getByCodeAndId));
app.post('/api/get-sick-leave-by-code-and-id', safeInvoke(getByCodeAndId));

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

