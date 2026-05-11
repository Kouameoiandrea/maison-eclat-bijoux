const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Load environment variables
function loadEnvFile() {
    if (fs.existsSync('.env')) {
        const env = fs.readFileSync('.env', 'utf8');
        env.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key] = value.trim();
            }
        });
    }
}

loadEnvFile();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;

// Selectionner le module d'authentification approprié
let setupAuthRoutes;
let initUsersTable;

if (DATABASE_URL) {
    // PostgreSQL en production (Render)
    console.log('🟡 Using PostgreSQL database');
    const { initDatabase, setupAuthRoutes: setupPostgresRoutes } = require('./auth-routes-postgres');
    initDatabase(DATABASE_URL);
    setupAuthRoutes = setupPostgresRoutes;
} else {
    // SQLite en développement local
    console.log('🟡 Using SQLite database');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./ecommerce.db');
    
    const authModule = require('./auth-routes');
    initUsersTable = authModule.initUsersTable;
    setupAuthRoutes = (app) => authModule.setupAuthRoutes(app, db);
    
    initUsersTable(db);
}

// Mail configuration
const mailSettings = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    to: process.env.MAIL_TO || process.env.SMTP_USER,
    from: process.env.MAIL_FROM || process.env.SMTP_USER
};

function createMailTransporter() {
    if (!mailSettings.user || !mailSettings.pass) {
        console.warn('⚠️ Email not configured - emails will not be sent');
        return null;
    }
    return nodemailer.createTransport(mailSettings);
}

const mailTransporter = createMailTransporter();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Setup authentication routes
setupAuthRoutes(app);

// Products endpoint
app.get('/api/products', (req, res) => {
    res.json({
        products: [
            {
                id: 1,
                name: 'Collier Femme',
                price: 45000,
                image: 'https://images.pexels.com/photos/2789668/pexels-photo-2789668.jpeg',
                category: 'Colliers'
            }
        ]
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', environment: NODE_ENV, port: PORT });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🔒 Database: ${DATABASE_URL ? 'PostgreSQL (Production)' : 'SQLite (Local)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
