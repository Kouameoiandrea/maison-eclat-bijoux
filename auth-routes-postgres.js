// Authentication with PostgreSQL
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

let pool;

// Initialize PostgreSQL connection
function initDatabase(connectionString) {
    pool = new Pool({
        connectionString: connectionString || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Create users table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            fullname VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    pool.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
        }
    });

    return pool;
}

// Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate JWT token
function generateToken(user) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.sign(
        { id: user.id, email: user.email, fullname: user.fullname },
        secret,
        { expiresIn: '30d' }
    );
}

// Setup authentication routes
function setupAuthRoutes(app) {
    // Register endpoint
    app.post('/api/auth/register', async (req, res) => {
        try {
            const { fullname, email, phone, password } = req.body;

            // Validation
            if (!fullname || !email || !phone || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            // Check if email already exists
            const checkQuery = 'SELECT id FROM users WHERE email = $1';
            const checkResult = await pool.query(checkQuery, [email]);

            if (checkResult.rows.length > 0) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            // Hash password and create user
            const passwordHash = hashPassword(password);
            const insertQuery = 'INSERT INTO users (fullname, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, fullname, email, phone';
            
            const result = await pool.query(insertQuery, [fullname, email, phone, passwordHash]);
            const user = result.rows[0];
            const token = generateToken(user);

            res.json({
                token,
                user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Login endpoint
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user by email
            const query = 'SELECT id, fullname, email, phone, password_hash FROM users WHERE email = $1';
            const result = await pool.query(query, [email]);

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = result.rows[0];
            const passwordHash = hashPassword(password);

            if (user.password_hash !== passwordHash) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = generateToken(user);
            res.json({
                token,
                user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Logout endpoint (stateless, just returns success)
    app.post('/api/auth/logout', (req, res) => {
        res.json({ message: 'Logged out successfully' });
    });

    // Verify token endpoint
    app.get('/api/auth/me', (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            const decoded = jwt.verify(token, secret);
            res.json({ user: decoded });
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    });
}

module.exports = {
    initDatabase,
    setupAuthRoutes,
    hashPassword,
    generateToken
};
