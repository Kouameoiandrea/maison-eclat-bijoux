// Authentication endpoints for Node.js/Express server
// Add this to your server.js file

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Initialize users table
function initUsersTable(db) {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        }
    });
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

// Authentication routes
function setupAuthRoutes(app, db) {
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
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (row) {
                    return res.status(409).json({ error: 'Email already registered' });
                }

                // Hash password and create user
                const passwordHash = hashPassword(password);
                db.run(
                    'INSERT INTO users (fullname, email, phone, password_hash) VALUES (?, ?, ?, ?)',
                    [fullname, email, phone, passwordHash],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to create user' });
                        }

                        const user = { id: this.lastID, fullname, email, phone };
                        const token = generateToken(user);

                        res.json({
                            token,
                            user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone }
                        });
                    }
                );
            });
        } catch (error) {
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
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Verify password
                const passwordHash = hashPassword(password);
                if (user.password_hash !== passwordHash) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Generate token
                const token = generateToken(user);

                res.json({
                    token,
                    user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone }
                });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Verify token endpoint
    app.get('/api/auth/verify', (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            const decoded = jwt.verify(token, secret);

            res.json({ valid: true, user: decoded });
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    });
}

module.exports = { initUsersTable, setupAuthRoutes, generateToken, hashPassword };
