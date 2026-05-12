function createDatabase() {
    if (!process.env.DATABASE_URL) {
        const sqlite3 = require('sqlite3').verbose();
        console.log('Base de donnees: SQLite local (ecommerce.db)');
        return new sqlite3.Database('./ecommerce.db');
    }

    const { Pool } = require('pg');
    console.log('Base de donnees: PostgreSQL (DATABASE_URL)');
    return new PostgresCompatDatabase(process.env.DATABASE_URL, Pool);
}

class PostgresCompatDatabase {
    constructor(connectionString, Pool) {
        this.pool = new Pool({
            connectionString,
            ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
        });
        this.queue = Promise.resolve();
        this.transactionClient = null;
    }

    serialize(callback) {
        callback();
    }

    run(sql, params, callback) {
        const normalized = normalizeArgs(params, callback);
        const task = async () => {
            const query = toPostgresQuery(sql, normalized.params);

            try {
                const result = await this.query(query.sql, query.params);
                const lastID = result.rows && result.rows[0] ? result.rows[0].id : undefined;
                normalized.callback.call({ lastID }, null);
            } catch (error) {
                normalized.callback(normalizeError(error));
            }
        };

        this.queue = this.queue.then(task, task);
        return this;
    }

    get(sql, params, callback) {
        const normalized = normalizeArgs(params, callback);
        const task = async () => {
            const query = toPostgresQuery(sql, normalized.params);

            try {
                const result = await this.query(query.sql, query.params);
                normalized.callback(null, normalizeRow(result.rows[0]));
            } catch (error) {
                normalized.callback(normalizeError(error));
            }
        };

        this.queue = this.queue.then(task, task);
        return this;
    }

    all(sql, params, callback) {
        const normalized = normalizeArgs(params, callback);
        const task = async () => {
            const query = toPostgresQuery(sql, normalized.params);

            try {
                const result = await this.query(query.sql, query.params);
                normalized.callback(null, result.rows.map(normalizeRow));
            } catch (error) {
                normalized.callback(normalizeError(error));
            }
        };

        this.queue = this.queue.then(task, task);
        return this;
    }

    prepare(sql) {
        return new PostgresCompatStatement(this, sql);
    }

    async query(sql, params) {
        const command = String(sql).trim().toUpperCase();

        if (command === 'BEGIN') {
            this.transactionClient = await this.pool.connect();
            return this.transactionClient.query(sql, params);
        }

        if (command === 'COMMIT' || command === 'ROLLBACK') {
            const client = this.transactionClient;
            this.transactionClient = null;

            if (!client) {
                return this.pool.query(sql, params);
            }

            try {
                return await client.query(sql, params);
            } finally {
                client.release();
            }
        }

        const client = this.transactionClient || this.pool;
        return client.query(sql, params);
    }
}

class PostgresCompatStatement {
    constructor(db, sql) {
        this.db = db;
        this.sql = sql;
    }

    run(...args) {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : undefined;
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;

        this.db.run(this.sql, params, callback);
        return this;
    }

    finalize(callback) {
        if (typeof callback === 'function') {
            this.db.queue = this.db.queue.then(() => callback(null), () => callback(null));
        }
    }
}

function normalizeArgs(params, callback) {
    if (typeof params === 'function') {
        return { params: [], callback: params };
    }

    return {
        params: Array.isArray(params) ? params : [],
        callback: typeof callback === 'function' ? callback : () => {}
    };
}

function toPostgresQuery(sql, params) {
    let query = String(sql)
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
        .replace(/DATETIME/gi, 'TIMESTAMP')
        .replace(/datetime\('now',\s*'localtime'\)/gi, 'CURRENT_TIMESTAMP')
        .replace(/BEGIN IMMEDIATE TRANSACTION/gi, 'BEGIN')
        .replace(/INSERT OR IGNORE INTO categories \(nom\) VALUES \(\?\)/gi, 'INSERT INTO categories (nom) VALUES (?) ON CONFLICT (nom) DO NOTHING');

    if (/^\s*INSERT\s+INTO\s+(?!app_settings\b)/i.test(query) && !/\bRETURNING\b/i.test(query)) {
        query = `${query} RETURNING id`;
    }

    let index = 0;
    query = query.replace(/\?/g, () => `$${++index}`);

    return { sql: query, params };
}

function normalizeRow(row) {
    if (!row) {
        return row;
    }

    return {
        ...row,
        count: numberValue(row.count),
        randomImages: numberValue(row.randomimages),
        pexelsImages: numberValue(row.pexelsimages),
        generatedImages: numberValue(row.generatedimages),
        invalidImages: numberValue(row.invalidimages),
        uniqueImages: numberValue(row.uniqueimages)
    };
}

function numberValue(value) {
    if (value === undefined || value === null) {
        return value;
    }

    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
}

function normalizeError(error) {
    if (error && error.code === '42701') {
        error.message = 'duplicate column name';
    }

    return error;
}

module.exports = { createDatabase };
