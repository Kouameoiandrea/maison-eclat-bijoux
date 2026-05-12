const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { createDatabase } = require('./database.js');
const { initUsersTable, setupAuthRoutes } = require('./auth-routes.js');

loadEnvFile();

const app = express();
const PORT = Number(process.env.PORT) || 3006;
const MAX_PORT_ATTEMPTS = 10;
const CATALOG_VERSION = '2026-05-07-bijoux-prix-aeres-v24';
const PRODUCT_PRICE_DISCOUNT_RATE = 0.25;
const BUSINESS_PHONE = '+225 01 02 85 61 23';

const mailSettings = {
    host: cleanMailEnvValue(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    user: cleanMailEnvValue(process.env.SMTP_USER),
    pass: normalizeSmtpPassword(cleanMailEnvValue(process.env.SMTP_PASS)),
    to: cleanMailEnvValue(process.env.MAIL_TO) || cleanMailEnvValue(process.env.SMTP_USER),
    from: buildMailFrom(cleanMailEnvValue(process.env.MAIL_FROM), cleanMailEnvValue(process.env.SMTP_USER))
};

const mailTransporter = createMailTransporter();

// Configuration de la base de donnees
const db = createDatabase();

// Initialize authentication
initUsersTable(db);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const chainCategories = [
    'Chaines',
    'Colliers',
    'Bracelets',
    'Bagues',
    'Boucles',
    'Coffrets',
    'Montres',
    'Pendentifs',
    'Plaque or',
    'Argent 925'
];

const generatedProductImages = new Map();

function imageKey(query, seed) {
    const slug = String(query)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 72) || 'produit';

    return `${seed}-${slug}`;
}

function productPhoto(query, seed) {
    const normalizedQuery = query.toLowerCase();
    const kindMap = [
        ['watch', ['watch', 'montre']],
        ['necklace', ['necklace', 'collier', 'chaine', 'chaines']],
        ['pendant', ['pendant', 'pendentif', 'medaillon']],
        ['bracelet', ['bracelet', 'gourmette', 'jonc']],
        ['earrings', ['earrings', 'boucles', 'creoles']],
        ['ring', ['ring', 'bague', 'alliance', 'chevaliere']],
        ['gift', ['gift', 'coffret', 'cadeau']],
        ['sunglasses', ['sunglasses', 'lunettes']],
        ['handbag', ['handbag', 'sac femme']],
        ['perfume', ['perfume', 'parfum']],
        ['wallet', ['wallet', 'portefeuille']],
        ['belt', ['belt', 'ceinture']],
        ['scarf', ['scarf', 'foulard']],
        ['makeup', ['makeup', 'maquillage']],
        ['skincare', ['skincare', 'soins']],
        ['deodorant', ['deodorant']],
        ['keychain', ['keychain', 'porte-cles']],
        ['mirror', ['mirror', 'miroir']],
        ['cap', ['cap', 'casquette']],
        ['hair', ['hair', 'cheveux', 'serre-tete']],
        ['beard', ['beard', 'barbe']],
        ['bag', ['bag', 'sac']]
    ];
    const kind = (kindMap.find((entry) => entry[1].some((keyword) => normalizedQuery.includes(keyword))) || ['product'])[0];
    const palettes = [
        ['#f7f8f8', '#ffffff', '#111827', '#d6a43c'],
        ['#f3f4f6', '#ffffff', '#7c2d12', '#f2c94c'],
        ['#f8fafc', '#ffffff', '#0f766e', '#94a3b8'],
        ['#fff7ed', '#ffffff', '#7f1d1d', '#f59e0b'],
        ['#fdf2f8', '#ffffff', '#831843', '#f9a8d4']
    ];
    const palette = palettes[seed % palettes.length];
    const label = query
        .replace(/\b(product|fashion|men|women|mens)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 28) || 'article';
    const icon = productIcon(kind, palette);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
            <!-- v2-product-image -->
            <rect width="900" height="900" rx="36" fill="${palette[0]}"/>
            <rect x="60" y="60" width="780" height="780" rx="30" fill="${palette[1]}" stroke="#d1d5db" stroke-width="10"/>
            <g transform="translate(450 420) scale(1.32) translate(-450 -420)">
                ${icon}
            </g>
            <text x="450" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="${palette[2]}">${escapeSvg(label)}</text>
        </svg>
    `;

    const key = imageKey(query, seed);
    generatedProductImages.set(key, svg);
    return `/api/product-image/${key}.svg`;
}

function productIcon(kind, palette) {
    const dark = palette[2];
    const gold = palette[3];
    const light = '#f9fafb';
    const iconMap = {
        necklace: `<circle cx="450" cy="355" r="155" fill="none" stroke="${gold}" stroke-width="34"/><circle cx="450" cy="355" r="92" fill="none" stroke="${dark}" stroke-width="16"/><path d="M450 507l46 78-46 78-46-78 46-78Z" fill="${gold}" stroke="${dark}" stroke-width="10"/>`,
        pendant: `<path d="M450 160v190" stroke="${gold}" stroke-width="28" stroke-linecap="round"/><circle cx="450" cy="435" r="118" fill="${light}" stroke="${dark}" stroke-width="18"/><path d="M450 340v190M355 435h190" stroke="${gold}" stroke-width="24" stroke-linecap="round"/>`,
        bracelet: `<ellipse cx="450" cy="405" rx="190" ry="118" fill="none" stroke="${gold}" stroke-width="42"/><ellipse cx="450" cy="405" rx="112" ry="62" fill="none" stroke="${dark}" stroke-width="18"/>`,
        earrings: `<circle cx="360" cy="378" r="88" fill="none" stroke="${gold}" stroke-width="28"/><circle cx="540" cy="378" r="88" fill="none" stroke="${gold}" stroke-width="28"/><circle cx="360" cy="290" r="22" fill="${dark}"/><circle cx="540" cy="290" r="22" fill="${dark}"/>`,
        watch: `<rect x="368" y="180" width="164" height="450" rx="58" fill="${dark}"/><circle cx="450" cy="405" r="118" fill="${light}" stroke="${gold}" stroke-width="22"/><path d="M450 330v82l62 42" stroke="${dark}" stroke-width="18" stroke-linecap="round"/>`,
        ring: `<circle cx="450" cy="420" r="145" fill="none" stroke="${gold}" stroke-width="42"/><path d="M405 270l45-70 45 70-45 44-45-44Z" fill="${light}" stroke="${dark}" stroke-width="14"/>`,
        handbag: `<path d="M250 360h400l42 250H208l42-250Z" fill="${gold}" stroke="${dark}" stroke-width="18"/><path d="M350 360c0-85 200-85 200 0" fill="none" stroke="${dark}" stroke-width="24" stroke-linecap="round"/>`,
        bag: `<path d="M260 305h380l52 305H208l52-305Z" fill="${gold}" stroke="${dark}" stroke-width="18"/><path d="M360 305c0-76 180-76 180 0" fill="none" stroke="${dark}" stroke-width="22" stroke-linecap="round"/>`,
        wallet: `<rect x="230" y="330" width="440" height="230" rx="28" fill="${gold}" stroke="${dark}" stroke-width="18"/><path d="M230 400h440" stroke="${dark}" stroke-width="16"/><circle cx="585" cy="480" r="18" fill="${dark}"/>`,
        belt: `<path d="M190 390h420v90H190z" fill="${dark}"/><rect x="595" y="355" width="130" height="160" rx="18" fill="none" stroke="${gold}" stroke-width="28"/>`,
        sunglasses: `<path d="M170 380c72-34 180-34 238 0l-28 126c-72 36-168 24-210-30V380Zm322 0c58-34 166-34 238 0v96c-42 54-138 66-210 30l-28-126Z" fill="${dark}"/><path d="M408 398c26-18 58-18 84 0" stroke="${gold}" stroke-width="18" stroke-linecap="round"/>`,
        cap: `<path d="M250 430c40-132 360-132 400 0v90H250v-90Z" fill="${gold}" stroke="${dark}" stroke-width="18"/><path d="M560 500h185c22 0 30 30 10 42-64 38-130 48-205 22" fill="${dark}"/>`,
        scarf: `<path d="M320 210c85 55 175 55 260 0v310c-85 52-175 52-260 0V210Z" fill="${gold}" stroke="${dark}" stroke-width="16"/><path d="M365 250v320M450 235v350M535 250v320" stroke="${light}" stroke-width="10"/>`,
        hair: `<path d="M300 420c0-86 300-86 300 0 0 95-300 95-300 0Z" fill="none" stroke="${gold}" stroke-width="38"/><circle cx="450" cy="420" r="42" fill="${dark}"/>`,
        keychain: `<circle cx="390" cy="330" r="82" fill="none" stroke="${gold}" stroke-width="30"/><path d="M450 390l145 145m-45-10 52-52m-12 108 52-52" stroke="${dark}" stroke-width="28" stroke-linecap="round"/>`,
        perfume: `<rect x="340" y="310" width="220" height="280" rx="28" fill="${gold}" stroke="${dark}" stroke-width="18"/><rect x="395" y="235" width="110" height="80" rx="12" fill="${dark}"/><rect x="375" y="415" width="150" height="88" rx="12" fill="${light}"/>`,
        deodorant: `<rect x="345" y="250" width="210" height="360" rx="42" fill="${gold}" stroke="${dark}" stroke-width="18"/><rect x="375" y="200" width="150" height="70" rx="18" fill="${dark}"/><path d="M380 430h140" stroke="${light}" stroke-width="18" stroke-linecap="round"/>`,
        skincare: `<rect x="285" y="360" width="150" height="230" rx="24" fill="${gold}" stroke="${dark}" stroke-width="16"/><rect x="480" y="285" width="140" height="305" rx="24" fill="${light}" stroke="${dark}" stroke-width="16"/><path d="M522 245h56v48h-56z" fill="${gold}"/>`,
        makeup: `<rect x="250" y="430" width="340" height="90" rx="30" fill="${gold}" stroke="${dark}" stroke-width="16"/><path d="M570 410l92-92 54 54-92 92Z" fill="${dark}"/><circle cx="360" cy="360" r="78" fill="${light}" stroke="${gold}" stroke-width="18"/>`,
        mirror: `<circle cx="450" cy="355" r="135" fill="${light}" stroke="${dark}" stroke-width="18"/><path d="M450 490v135" stroke="${gold}" stroke-width="34" stroke-linecap="round"/><path d="M370 625h160" stroke="${dark}" stroke-width="26" stroke-linecap="round"/>`,
        beard: `<rect x="330" y="300" width="240" height="290" rx="38" fill="${gold}" stroke="${dark}" stroke-width="18"/><path d="M395 235h110v78H395z" fill="${dark}"/><path d="M390 430c35 60 85 60 120 0" stroke="${light}" stroke-width="20" stroke-linecap="round"/>`,
        gift: `<rect x="250" y="350" width="400" height="260" rx="18" fill="${gold}" stroke="${dark}" stroke-width="18"/><path d="M450 350v260M250 430h400" stroke="${light}" stroke-width="22"/><path d="M450 350c-95-8-110-100-30-100 38 0 55 44 30 100Zm0 0c95-8 110-100 30-100-38 0-55 44-30 100Z" fill="${gold}" stroke="${dark}" stroke-width="16"/>`
    };

    return iconMap[kind] || iconMap.gift;
}

function escapeSvg(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');

    if (!fs.existsSync(envPath)) {
        return;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
            return;
        }

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

function createMailTransporter() {
    const missingConfig = !mailSettings.host || !mailSettings.user || !mailSettings.pass || !mailSettings.to || !mailSettings.from;
    const usesExampleConfig = [
        mailSettings.user,
        mailSettings.pass,
        mailSettings.to,
        mailSettings.from
    ].some(isExampleMailValue);

    if (missingConfig || usesExampleConfig) {
        console.warn('Email non configure. Renseignez de vraies valeurs SMTP dans .env.');
        return null;
    }

    return nodemailer.createTransport({
        host: mailSettings.host,
        port: mailSettings.port,
        secure: mailSettings.secure,
        auth: {
            user: mailSettings.user,
            pass: mailSettings.pass
        }
    });
}

function isExampleMailValue(value) {
    return /votre-|your-|example|mot-de-passe-app/i.test(String(value || ''));
}

function cleanMailEnvValue(value) {
    const text = String(value || '').trim();
    return isExampleMailValue(text) ? '' : text;
}

function normalizeSmtpPassword(value) {
    return String(value || '').replace(/\s+/g, '');
}

function buildMailFrom(value, fallbackEmail) {
    if (value) {
        return value;
    }

    return fallbackEmail ? `Maison Eclat Bijoux <${fallbackEmail}>` : '';
}

function requireText(value, fieldName, maxLength = 1000) {
    const text = String(value || '').trim();

    if (!text) {
        const error = new Error(`${fieldName} est obligatoire.`);
        error.statusCode = 400;
        throw error;
    }

    return text.slice(0, maxLength);
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

async function sendBusinessEmail({ subject, text, html, replyTo }) {
    if (!mailTransporter) {
        await saveBusinessEmail({ subject, text, html, replyTo, status: 'enregistre' });
        return { sent: false, saved: true };
    }

    try {
        await mailTransporter.sendMail({
            from: mailSettings.from,
            to: mailSettings.to,
            replyTo,
            subject,
            text,
            html
        });

        await saveBusinessEmail({ subject, text, html, replyTo, status: 'envoye' });
        return { sent: true, saved: true };
    } catch (error) {
        console.warn(`Email non envoye: ${formatMailErrorForLog(error)}`);
        await saveBusinessEmail({ subject, text, html, replyTo, status: 'email_echec' });
        return { sent: false, saved: true, error: formatMailErrorForLog(error) };
    }
}

function saveBusinessEmail({ subject, text, html, replyTo, status }) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO messages_recus (subject, reply_to, content_text, content_html, status, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
            [subject, replyTo || '', text || '', html || '', status || 'enregistre'],
            (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            }
        );
    });
}

function formatMailErrorForLog(error) {
    const code = error && error.code ? `${error.code}: ` : '';
    const message = error && error.message ? error.message : String(error || 'Erreur inconnue');
    return `${code}${message}`.replace(/\s+/g, ' ').trim();
}

function saveOrder({ customerName, customerPhone, customerEmail, customerAddress, items, total }) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN IMMEDIATE TRANSACTION');
            db.run(
                `INSERT INTO commandes (customer_name, customer_phone, customer_email, customer_address, total, status, created_at)
                 VALUES (?, ?, ?, ?, ?, 'nouvelle', datetime('now', 'localtime'))`,
                [customerName, customerPhone, customerEmail || '', customerAddress || '', total],
                function onOrderInserted(error) {
                    if (error) {
                        rollbackOrder(reject, error);
                        return;
                    }

                    const orderId = this.lastID;
                    const itemStmt = db.prepare(
                        `INSERT INTO commande_articles (commande_id, product_id, product_name, unit_price, quantity, subtotal)
                         VALUES (?, ?, ?, ?, ?, ?)`
                    );
                    let failed = false;

                    items.forEach((item) => {
                        if (failed) return;

                        itemStmt.run(
                            orderId,
                            item.id || null,
                            item.nom,
                            item.prix,
                            item.quantity,
                            item.prix * item.quantity,
                            (itemError) => {
                                if (itemError && !failed) {
                                    failed = true;
                                }
                            }
                        );
                    });

                    itemStmt.finalize((finalizeError) => {
                        if (failed || finalizeError) {
                            rollbackOrder(reject, finalizeError || new Error("Impossible d'enregistrer les articles de la commande."));
                            return;
                        }

                        db.run('COMMIT', (commitError) => {
                            if (commitError) {
                                rollbackOrder(reject, commitError);
                                return;
                            }

                            resolve(orderId);
                        });
                    });
                }
            );
        });
    });
}

function rollbackOrder(reject, error) {
    db.run('ROLLBACK', () => reject(error));
}

function parseMoneyValue(value) {
    const digits = String(value || '').replace(/[^\d]/g, '');
    return Number(digits) || 0;
}

function getLegacyMessageField(text, label) {
    const match = String(text || '').match(new RegExp(`^${label}:\\s*(.+)$`, 'im'));
    return match ? match[1].trim() : '';
}

function parseLegacyOrderMessage(message) {
    const text = String(message.content_text || '');

    if (!/^Nouvelle commande/i.test(message.subject || '') || !text.includes('Produits:')) {
        return null;
    }

    const items = [...text.matchAll(/^- (.+?) x (\d+):\s*(.+)$/gmi)].map((match) => {
        const quantity = Math.max(1, Number(match[2]) || 1);
        const subtotal = parseMoneyValue(match[3]);

        return {
            nom: match[1].trim(),
            quantity,
            prix: quantity > 0 ? Math.round(subtotal / quantity) : subtotal,
            subtotal
        };
    });

    if (items.length === 0) {
        return null;
    }

    const total = parseMoneyValue(getLegacyMessageField(text, 'Total')) ||
        items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
        originalOrderId: Number(getLegacyMessageField(text, 'Commande').replace('#', '')) || null,
        customerName: getLegacyMessageField(text, 'Nom') || 'Client non renseigne',
        customerPhone: getLegacyMessageField(text, 'Telephone') || 'Non renseigne',
        customerEmail: getLegacyMessageField(text, 'Email'),
        customerAddress: getLegacyMessageField(text, 'Adresse'),
        total,
        createdAt: message.created_at,
        items
    };
}

function importLegacyOrderMessage(message) {
    const order = parseLegacyOrderMessage(message);

    if (!order) {
        return;
    }

    db.get('SELECT id FROM commandes WHERE legacy_message_id = ?', [message.id], (existingErr, existingOrder) => {
        if (existingErr) {
            console.error("Erreur de verification d'une ancienne commande:", existingErr.message);
            return;
        }

        if (existingOrder) {
            return;
        }

        const insertLegacyOrder = () => {
        db.run(
            `INSERT INTO commandes (customer_name, customer_phone, customer_email, customer_address, total, status, created_at, legacy_message_id)
             VALUES (?, ?, ?, ?, ?, 'nouvelle', ?, ?)`,
            [
                order.customerName,
                order.customerPhone,
                order.customerEmail,
                order.customerAddress,
                order.total,
                order.createdAt,
                message.id
            ],
            function onLegacyOrderInserted(insertErr) {
                if (insertErr) {
                    console.error("Erreur d'import d'une ancienne commande:", insertErr.message);
                    return;
                }

                const orderId = this.lastID;
                const itemStmt = db.prepare(
                    `INSERT INTO commande_articles (commande_id, product_id, product_name, unit_price, quantity, subtotal)
                     VALUES (?, ?, ?, ?, ?, ?)`
                );

                order.items.forEach((item) => {
                    itemStmt.run(orderId, null, item.nom, item.prix, item.quantity, item.subtotal);
                });

                itemStmt.finalize((finalizeErr) => {
                    if (finalizeErr) {
                        console.error("Erreur d'import des articles d'une ancienne commande:", finalizeErr.message);
                    }
                });
            }
        );
        };

        if (order.originalOrderId) {
            db.get('SELECT id FROM commandes WHERE id = ?', [order.originalOrderId], (originalErr, originalOrder) => {
                if (originalErr) {
                    console.error("Erreur de verification du numero de commande:", originalErr.message);
                    return;
                }

                if (originalOrder) {
                    return;
                }

                insertLegacyOrder();
            });
            return;
        }

        insertLegacyOrder();
    });
}

function migrateLegacyOrderMessages() {
    db.all(
        `SELECT * FROM messages_recus
         WHERE subject LIKE 'Nouvelle commande%'
         ORDER BY id`,
        [],
        (err, messages) => {
            if (err) {
                console.error('Erreur de lecture des anciennes commandes:', err.message);
                return;
            }

            messages.forEach(importLegacyOrderMessage);
        }
    );
}

function reduceProductPrice(product) {
    const discountedPrice = Math.round((Number(product[2]) * (1 - PRODUCT_PRICE_DISCOUNT_RATE)) / 500) * 500;
    return [
        product[0],
        product[1],
        Math.max(5000, discountedPrice),
        product[3],
        product[4],
        product[5]
    ];
}

const productImages = {
    // COLLIERS - Vraies photos de bijoux locales
    necklaceGold: '/images/necklace-gold.jpg',
    necklaceSilver: '/images/necklace-silver.jpg',
    necklaceClose: '/images/necklace-close.jpg',
    necklaceBox: '/images/necklace-gold.jpg',
    
    // PENDANTIFS - Vraies photos de pendentifs locales
    pendantCross: '/images/pendant-cross.jpg',
    pendantHeart: '/images/pendant-cross.jpg',
    
    // BRACELETS - Vraies photos de bracelets locales
    braceletCuban: '/images/bracelet-cuban.jpg',
    braceletBeads: '/images/bracelet-cuban.jpg',
    braceletTennis: '/images/bracelet-tennis.jpg',
    
    // MONTRES - Vraies photos de montres locales
    watchClassic: '/images/watch-classic.jpg',
    watchGold: '/images/watch-luxe.jpg',
    watchSport: '/images/watch-sport.jpg',
    watchChrono: '/images/watch-classic.jpg',
    watchSmart: '/images/watch-sport.jpg',
    
    // BAGUES - Vraies photos de bagues locales
    ringSteel: '/images/ring-steel.jpg',
    ringBlack: '/images/ring-steel.jpg',
    ringGold: '/images/ring-steel.jpg',
    
    // BOUCLES D'OREILLES - Vraies photos de boucles locales
    earringsHoop: '/images/earrings-hoop.jpg',
    earringsPearl: '/images/earrings-hoop.jpg',
    
    // ACCESSOIRES - Vraies photos d'accessoires de mode
    ceinture: 'https://images.pexels.com/photos/668298/pexels-photo-668298.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    portefeuille: 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    sac: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    
    // LUNETTES - Vraies photos de lunettes
    lunettes: 'https://images.pexels.com/photos/259279/pexels-photo-259279.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    lunettesOversize: 'https://images.pexels.com/photos/707857/pexels-photo-707857.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    lunettesCarrees: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    
    // CASQUETTES - Vraies photos de casquettes
    casquetteNoire: 'https://images.pexels.com/photos/998541/pexels-photo-998541.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    casquetteBeige: 'https://images.pexels.com/photos/998542/pexels-photo-998542.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    casquetteRouge: 'https://images.pexels.com/photos/998543/pexels-photo-998543.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    
    // ACCESSOIRES CHEVEUX - Photos d'accessoires bijoux
    foulard: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    serreTete: 'https://images.pexels.com/photos/3707282/pexels-photo-3707282.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    pincesCheveux: 'https://images.pexels.com/photos/3248619/pexels-photo-3248619.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    chouchous: 'https://images.pexels.com/photos/3707284/pexels-photo-3707284.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    
    // MAQUILLAGE - Photos d'accessoires beauté
    trousseMaquillage: 'https://images.pexels.com/photos/903464/pexels-photo-903464.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    porteCles: 'https://images.pexels.com/photos/1126727/pexels-photo-1126727.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    braceletCuir: 'https://images.pexels.com/photos/3428498/pexels-photo-3428498.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    
    // PARFUMS - Photos d'accessoires luxe
    parfumHomme: 'https://images.pexels.com/photos/1126729/pexels-photo-1126729.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    parfumFemme: 'https://images.pexels.com/photos/1126730/pexels-photo-1126730.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    brumeCorporelle: 'https://images.pexels.com/photos/1126731/pexels-photo-1126731.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    deodorant: 'https://images.pexels.com/photos/1126732/pexels-photo-1126732.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    
    // SOINS BEAUTÉ - Photos de soins accessoires
    kitSoinsVisage: 'https://images.pexels.com/photos/1126733/pexels-photo-1126733.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    kitBarbe: 'https://images.pexels.com/photos/1126734/pexels-photo-1126734.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    setPinceaux: 'https://images.pexels.com/photos/1126735/pexels-photo-1126735.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    miroirLED: 'https://images.pexels.com/photos/1126736/pexels-photo-1126736.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    giftMen: '/images/necklace-gold.jpg',
    giftWomen: '/images/necklace-silver.jpg',
    handbagBlack: 'https://images.pexels.com/photos/1457801/pexels-photo-1457801.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    handbagBeige: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    handbagRed: 'https://images.pexels.com/photos/3428498/pexels-photo-3428498.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    clutchGold: 'https://images.pexels.com/photos/3570179/pexels-photo-3570179.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    tote: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    scarf: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    hairband: 'https://images.pexels.com/photos/3707282/pexels-photo-3707282.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    hairClip: 'https://images.pexels.com/photos/3248619/pexels-photo-3248619.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    scrunchies: 'https://images.pexels.com/photos/3707284/pexels-photo-3707284.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    makeupBag: 'https://images.pexels.com/photos/903464/pexels-photo-903464.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    walletWomen: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    cardHolder: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    beltBlack: 'https://images.pexels.com/photos/668298/pexels-photo-668298.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    beltBrown: 'https://images.pexels.com/photos/668298/pexels-photo-668298.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    beltWomen: 'https://images.pexels.com/photos/3428498/pexels-photo-3428498.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    sunglassesAviator: 'https://images.pexels.com/photos/259279/pexels-photo-259279.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    sunglassesOversize: 'https://images.pexels.com/photos/707857/pexels-photo-707857.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    sunglassesSquare: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    capBlack: 'https://images.pexels.com/photos/998541/pexels-photo-998541.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    capBeige: 'https://images.pexels.com/photos/998542/pexels-photo-998542.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    capRed: 'https://images.pexels.com/photos/998543/pexels-photo-998543.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    waistBag: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    crossbodyMen: 'https://images.pexels.com/photos/3428498/pexels-photo-3428498.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    braceletLeather: 'https://images.pexels.com/photos/3428498/pexels-photo-3428498.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    keychain: 'https://images.pexels.com/photos/1126727/pexels-photo-1126727.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    perfumeMen: 'https://images.pexels.com/photos/1126729/pexels-photo-1126729.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    perfumeWomen: 'https://images.pexels.com/photos/1126730/pexels-photo-1126730.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    bodyMist: 'https://images.pexels.com/photos/1126731/pexels-photo-1126731.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    skincare: 'https://images.pexels.com/photos/1126733/pexels-photo-1126733.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    beardKit: 'https://images.pexels.com/photos/1126734/pexels-photo-1126734.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    makeupBrushes: 'https://images.pexels.com/photos/1126735/pexels-photo-1126735.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    ledMirror: 'https://images.pexels.com/photos/1126736/pexels-photo-1126736.jpeg?auto=compress&cs=tinysrgb&w=900&q=80',
    walletMen: 'https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=900&q=80'
};

const categoryImagePools = {
    necklaces: [productImages.necklaceGold, productImages.necklaceSilver, productImages.necklaceClose, productImages.necklaceBox],
    pendants: [productImages.pendantHeart, productImages.pendantCross, productImages.necklaceClose],
    bracelets: [productImages.braceletCuban, productImages.braceletBeads, productImages.braceletTennis],
    watches: [productImages.watchClassic, productImages.watchGold, productImages.watchSport, productImages.watchChrono, productImages.watchSmart],
    rings: [productImages.ringSteel, productImages.ringBlack, productImages.ringGold],
    earrings: [productImages.earringsHoop, productImages.earringsPearl],
    giftSets: [productImages.pendantHeart, productImages.ringGold, productImages.braceletCuban, productImages.necklaceBox]
};

function pexelsImage(photoId) {
    return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=900`;
}

function unsplashImage(photoId) {
    return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&fm=jpg&q=80&w=900`;
}

const polishedJewelryPhotoSets = {
    necklaces: [
        '/images/necklace-gold.jpg',
        '/images/necklace-silver.jpg',
        '/images/necklace-close.jpg',
        pexelsImage(11936873),
        pexelsImage(12753204),
        pexelsImage(12145316),
        pexelsImage(13292955),
        pexelsImage(8003839),
        pexelsImage(20858950),
        pexelsImage(34544785),
        pexelsImage(12194381),
        pexelsImage(5386593),
        pexelsImage(5820156),
        pexelsImage(9772653),
        pexelsImage(31427027),
        pexelsImage(8768622),
        pexelsImage(8768590)
    ],
    bracelets: [
        '/images/bracelet-cuban.jpg',
        '/images/bracelet-tennis.jpg',
        pexelsImage(11006287),
        pexelsImage(11121558),
        pexelsImage(11352700),
        pexelsImage(25283503),
        pexelsImage(15408171),
        pexelsImage(14666594),
        pexelsImage(11178582),
        pexelsImage(13278394),
        pexelsImage(12194305),
        pexelsImage(12194303),
        pexelsImage(12194298),
        pexelsImage(12194339),
        pexelsImage(12168880),
        pexelsImage(8281564),
        pexelsImage(12124617),
        pexelsImage(12194237),
        pexelsImage(14509641),
        pexelsImage(12194337)
    ],
    rings: [
        '/images/ring-steel.jpg',
        pexelsImage(15871502),
        pexelsImage(2472394),
        pexelsImage(15467658),
        pexelsImage(30639801),
        pexelsImage(17069421),
        pexelsImage(8433597),
        pexelsImage(12290109),
        pexelsImage(14509641),
        pexelsImage(12194237),
        pexelsImage(12194337)
    ],
    earrings: [
        '/images/earrings-hoop.jpg',
        pexelsImage(9392417),
        pexelsImage(10457846),
        pexelsImage(15799266),
        pexelsImage(16038197),
        pexelsImage(15684102),
        pexelsImage(17528104),
        pexelsImage(15799272),
        pexelsImage(13595746),
        pexelsImage(12290109),
        pexelsImage(12194337)
    ],
    watches: [
        '/images/watch-classic.jpg',
        '/images/watch-luxe.jpg',
        '/images/watch-sport.jpg',
        pexelsImage(9381693),
        pexelsImage(25929228),
        pexelsImage(17107834),
        pexelsImage(6804453),
        pexelsImage(4863139),
        pexelsImage(15107948),
        pexelsImage(17772377),
        pexelsImage(19895429),
        pexelsImage(7263465),
        pexelsImage(10819699),
        pexelsImage(17572540),
        pexelsImage(14618648)
    ],
    giftSets: [
        '/images/gift-box.jpg',
        pexelsImage(11936873),
        pexelsImage(12145316),
        pexelsImage(15467658),
        pexelsImage(25283503),
        pexelsImage(15684102)
    ]
};

function photoSetNameForProduct(product) {
    const name = product[0].toLowerCase();
    const category = product[4];

    if (category === 'Montres' || name.includes('montre')) return 'watches';
    if (category === 'Bagues' || name.includes('bague') || name.includes('alliance')) return 'rings';
    if (category === 'Boucles' || name.includes('boucles') || name.includes('creoles')) return 'earrings';
    if (category === 'Bracelets' || name.includes('bracelet')) return 'bracelets';
    if (category === 'Coffrets' || name.includes('coffret')) return 'giftSets';
    return 'necklaces';
}

function assignDistinctJewelryPhotos(products) {
    const counters = Object.fromEntries(Object.keys(polishedJewelryPhotoSets).map((key) => [key, 0]));

    return products.map((product) => {
        const setName = photoSetNameForProduct(product);
        const photos = polishedJewelryPhotoSets[setName] || polishedJewelryPhotoSets.necklaces;
        const image = photos[counters[setName] % photos.length];
        counters[setName] += 1;

        return [
            product[0],
            product[1],
            product[2],
            image,
            product[4],
            product[5]
        ];
    });
}

const jewelryPhotoSets = {
    necklaces: [
        productImages.necklaceGold,
        productImages.necklaceSilver,
        productImages.necklaceClose,
        productImages.necklaceBox,
        productImages.pendantHeart
    ],
    pendants: [
        productImages.pendantHeart,
        productImages.pendantCross,
        productImages.necklaceClose,
        productImages.necklaceGold
    ],
    bracelets: [
        productImages.braceletCuban,
        productImages.braceletBeads,
        productImages.braceletTennis
    ],
    watches: [
        productImages.watchClassic,
        productImages.watchGold,
        productImages.watchSport,
        productImages.watchChrono,
        productImages.watchSmart
    ],
    rings: [
        productImages.ringSteel,
        productImages.ringBlack,
        productImages.ringGold
    ],
    earrings: [
        productImages.earringsHoop,
        productImages.earringsPearl
    ],
    giftSets: [
        productImages.giftMen,
        productImages.giftWomen,
        productImages.necklaceBox,
        productImages.braceletCuban,
        productImages.ringGold
    ]
};

const localPhotoSets = {
    necklaces: [
        '/images/necklace-gold.jpg',
        '/images/necklace-silver.jpg',
        '/images/necklace-close.jpg'
    ],
    pendants: [
        '/images/pendant-cross.jpg',
        '/images/necklace-close.jpg',
        '/images/necklace-gold.jpg'
    ],
    bracelets: [
        '/images/bracelet-cuban.jpg',
        '/images/bracelet-tennis.jpg',
        '/images/necklace-close.jpg'
    ],
    watches: [
        '/images/watch-classic.jpg',
        '/images/watch-sport.jpg',
        '/images/watch-luxe.jpg'
    ],
    rings: [
        '/images/ring-steel.jpg',
        '/images/necklace-silver.jpg',
        '/images/bracelet-tennis.jpg'
    ],
    earrings: [
        '/images/earrings-hoop.jpg',
        '/images/necklace-silver.jpg',
        '/images/pendant-cross.jpg'
    ],
    giftSets: [
        '/images/gift-box.jpg',
        '/images/watch-classic.jpg',
        '/images/necklace-gold.jpg'
    ]
};

function getLocalImageForProduct(productName, category) {
    const name = productName.toLowerCase();
    
    // MAPPING PRÉCIS PAR MOTS-CLÉS - COLLIERS/CHAINES
    if (name.includes('figaro') || name.includes('chaine figaro')) {
        return productImages.necklaceGold;
    }
    if (name.includes('cubaine') && (name.includes('chaine') || name.includes('chaîne'))) {
        return productImages.necklaceSilver;
    }
    if (name.includes('serpent') || name.includes('maille serpent')) {
        return productImages.necklaceClose;
    }
    if (name.includes('venitienne') || name.includes('vénitienne')) {
        return productImages.necklaceBox;
    }
    if (name.includes('gourmette') && name.includes('chaine')) {
        return productImages.necklaceGold;
    }
    if (name.includes('rope') || name.includes('torsade')) {
        return productImages.necklaceClose;
    }
    if (name.includes('coeur') && (name.includes('chaine') || name.includes('collier'))) {
        return productImages.pendantHeart;
    }
    
    // MAPPING PRÉCIS - PENDENTIFS
    if (name.includes('croix') || name.includes('pendentif croix')) {
        return productImages.pendantCross;
    }
    if (name.includes('coeur') && name.includes('pendentif')) {
        return productImages.pendantHeart;
    }
    if (name.includes('medaillon') || name.includes('lettre')) {
        return productImages.necklaceBox;
    }
    
    // MAPPING PRÉCIS - BRACELETS
    if (name.includes('cuban') || name.includes('cubaine') && name.includes('bracelet')) {
        return productImages.braceletCuban;
    }
    if (name.includes('perles') || name.includes('beads')) {
        return productImages.braceletBeads;
    }
    if (name.includes('tennis') || name.includes('brillant')) {
        return productImages.braceletTennis;
    }
    if (name.includes('cuir') && name.includes('bracelet')) {
        return productImages.braceletCuban;
    }
    
    // MAPPING PRÉCIS - MONTRES
    if (name.includes('classique') || name.includes('noir') && name.includes('montre')) {
        return productImages.watchClassic;
    }
    if (name.includes('doree') || name.includes('or') && name.includes('montre')) {
        return productImages.watchGold;
    }
    if (name.includes('sport') || name.includes('urbaine')) {
        return productImages.watchSport;
    }
    if (name.includes('chrono') || name.includes('chronographe')) {
        return productImages.watchChrono;
    }
    if (name.includes('connect') || name.includes('smart')) {
        return productImages.watchSmart;
    }
    if (name.includes('rose gold') || name.includes('rose')) {
        return productImages.watchGold;
    }
    
    if (name.includes('dore') || name.includes('or') && name.includes('bague')) {
        return '/images/ring-steel.jpg';
    }
    if (name.includes('chevaliere') || name.includes('alliance')) {
        return '/images/ring-steel.jpg';
    }
    
    // MAPPING PRÉCIS - BOUCLES D'OREILLES
    if (name.includes('creoles') || name.includes('hoop')) {
        return '/images/earrings-hoop.jpg';
    }
    if (name.includes('perles') && name.includes('boucles')) {
        return '/images/earrings-hoop.jpg';
    }
    
    // MAPPING PRÉCIS - ACCESSOIRES SPÉCIFIQUES
    if (name.includes('lunettes') || name.includes('aviateur')) {
        return productImages.lunettes;
    }
    if (name.includes('oversize') && name.includes('lunettes')) {
        return productImages.lunettesOversize;
    }
    if (name.includes('carrees') && name.includes('lunettes')) {
        return productImages.lunettesCarrees;
    }
    if (name.includes('casquette')) {
        if (name.includes('noire')) return productImages.casquetteNoire;
        if (name.includes('beige')) return productImages.casquetteBeige;
        if (name.includes('rouge')) return productImages.casquetteRouge;
        return productImages.casquetteNoire;
    }
    if (name.includes('ceinture')) {
        return productImages.ceinture;
    }
    if (name.includes('portefeuille')) {
        return productImages.portefeuille;
    }
    if (name.includes('sac')) {
        return productImages.sac;
    }
    if (name.includes('foulard') || name.includes('scarf')) {
        return productImages.foulard;
    }
    if (name.includes('serre-tete') || name.includes('hair')) {
        return productImages.serreTete;
    }
    if (name.includes('parfum')) {
        if (name.includes('homme')) return productImages.parfumHomme;
        if (name.includes('femme')) return productImages.parfumFemme;
        return productImages.parfumHomme;
    }
    if (name.includes('deodorant')) {
        return productImages.deodorant;
    }
    if (name.includes('soins') || name.includes('kit')) {
        if (name.includes('barbe')) return productImages.kitBarbe;
        if (name.includes('visage')) return productImages.kitSoinsVisage;
        return productImages.kitSoinsVisage;
    }
    if (name.includes('pinceaux') || name.includes('maquillage')) {
        return productImages.setPinceaux;
    }
    if (name.includes('miroir') || name.includes('led')) {
        return productImages.miroirLED;
    }
    if (name.includes('trousse') || name.includes('maquillage')) {
        return productImages.trousseMaquillage;
    }
    if (name.includes('porte-cles') || name.includes('keychain')) {
        return productImages.porteCles;
    }
    if (name.includes('coffret') || name.includes('cadeau')) {
        return productImages.giftMen;
    }
    
    // MAPPING PAR CATÉGORIE PRÉCIS
    if (category === 'Montres') {
        const watches = ['/images/watch-classic.jpg', '/images/watch-luxe.jpg', '/images/watch-sport.jpg'];
        return watches[Math.floor(Math.random() * watches.length)];
    }
    if (category === 'Bracelets') {
        const bracelets = ['/images/bracelet-cuban.jpg', '/images/bracelet-tennis.jpg'];
        return bracelets[Math.floor(Math.random() * bracelets.length)];
    }
    if (category === 'Chaines' || category === 'Colliers') {
        const necklaces = ['/images/necklace-gold.jpg', '/images/necklace-silver.jpg', '/images/necklace-close.jpg', '/images/necklace-gold.jpg'];
        return necklaces[Math.floor(Math.random() * necklaces.length)];
    }
    if (category === 'Boucles') {
        const earrings = ['/images/earrings-hoop.jpg'];
        return earrings[Math.floor(Math.random() * earrings.length)];
    }
    if (category === 'Bagues') {
        const rings = ['/images/ring-steel.jpg'];
        return rings[Math.floor(Math.random() * rings.length)];
    }
    if (category === 'Pendentifs') {
        const pendants = ['/images/pendant-cross.jpg', '/images/necklace-close.jpg'];
        return pendants[Math.floor(Math.random() * pendants.length)];
    }
    if (category === 'Coffrets') {
        const gifts = ['/images/gift-box.jpg'];
        return gifts[Math.floor(Math.random() * gifts.length)];
    }
    if (category === 'Lunettes') {
        const sunglasses = [productImages.lunettes, productImages.lunettesOversize, productImages.lunettesCarrees];
        return sunglasses[Math.floor(Math.random() * sunglasses.length)];
    }
    if (category === 'Casquettes') {
        const caps = [productImages.casquetteNoire, productImages.casquetteBeige, productImages.casquetteRouge];
        return caps[Math.floor(Math.random() * caps.length)];
    }
    if (category === 'Parfums') {
        const perfumes = [productImages.parfumHomme, productImages.parfumFemme];
        return perfumes[Math.floor(Math.random() * perfumes.length)];
    }
    
    // Utiliser les images locales garanties comme bijoux
    const localImages = {
        'Montres': ['/images/watch-classic.jpg', '/images/watch-luxe.jpg', '/images/watch-sport.jpg'],
        'Bracelets': ['/images/bracelet-cuban.jpg', '/images/bracelet-tennis.jpg'],
        'Chaines': ['/images/necklace-gold.jpg', '/images/necklace-silver.jpg', '/images/necklace-close.jpg'],
        'Colliers': ['/images/necklace-gold.jpg', '/images/necklace-silver.jpg', '/images/necklace-close.jpg'],
        'Boucles': ['/images/earrings-hoop.jpg'],
        'Bagues': ['/images/ring-steel.jpg'],
        'Pendentifs': ['/images/pendant-cross.jpg'],
        'Coffrets': ['/images/gift-box.jpg']
    };
    
    const categoryImages = localImages[category];
    if (categoryImages) {
        return categoryImages[Math.floor(Math.random() * categoryImages.length)];
    }
    
    return '/images/necklace-gold.jpg'; // Image par défaut garantie bijou
}

function getCatalogImage(product, setName, index) {
    const name = product[0].toLowerCase();
    
    // Utiliser les images locales en priorité
    const localImage = getLocalImageForProduct(product[0], product[4]);
    if (localImage) {
        return localImage;
    }

    if (name.includes('coeur')) {
        return productImages.pendantHeart;
    }
    if (name.includes('figaro')) {
        return productImages.necklaceGold;
    }
    if (name.includes('chevaliere') || name.includes('chevalière')) {
        return productImages.ringBlack;
    }

    const pool = categoryImagePools[setName] || categoryImagePools.necklaces;
    return pool[index % pool.length];
}

function spreadJewelryPhotos(products) {
    const counters = {
        necklaces: 0,
        pendants: 0,
        bracelets: 0,
        watches: 0,
        rings: 0,
        earrings: 0,
        giftSets: 0
    };

    // Shuffle each photo set
    Object.keys(jewelryPhotoSets).forEach(key => {
        jewelryPhotoSets[key] = jewelryPhotoSets[key].sort(() => Math.random() - 0.5);
    });

    return products.map((product) => {
        if (product[3]) {
            return product;
        }

        const category = product[4];
        const name = product[0].toLowerCase();
        let setName = 'necklaces';

        if (category === 'Montres' || name.includes('montre')) {
            setName = 'watches';
        } else if (category === 'Bagues' || name.includes('bague') || name.includes('alliance') || name.includes('chevaliere')) {
            setName = 'rings';
        } else if (category === 'Boucles' || name.includes('boucles') || name.includes('creoles')) {
            setName = 'earrings';
        } else if (category === 'Coffrets' || name.includes('coffret') || name.includes('cadeau')) {
            setName = 'giftSets';
        } else if (category === 'Bracelets' || name.includes('bracelet')) {
            setName = 'bracelets';
        } else if (category === 'Pendentifs' || name.includes('pendentif') || name.includes('medaillon')) {
            setName = 'pendants';
        } else if (category.includes('Sacs') || name.includes('sac')) {
            setName = 'giftSets';
        } else if (category.includes('Portefeuilles') || name.includes('portefeuille')) {
            setName = 'giftSets';
        } else if (category.includes('Ceintures') || name.includes('ceinture')) {
            setName = 'giftSets';
        } else if (category.includes('Lunettes') || name.includes('lunettes')) {
            setName = 'giftSets';
        } else if (category.includes('Casquettes') || name.includes('casquette')) {
            setName = 'giftSets';
        } else if (category.includes('Accessoires')) {
            setName = 'giftSets';
        }

        const image = getCatalogImage(product, setName, counters[setName]);
        counters[setName] += 1;

        return [
            product[0],
            product[1],
            product[2],
            image,
            product[4],
            product[5]
        ];
    });
}

function uniqueProductsByName(products) {
    const seen = new Set();

    return products.filter((product) => {
        const key = product[0].toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function uniqueProductsByImage(products) {
    const seen = new Set();

    return products.filter((product) => {
        const image = product[3];
        if (seen.has(image)) {
            return false;
        }
        seen.add(image);
        return true;
    });
}

function interleaveProductsByCategory(products) {
    const groups = new Map();

    products.forEach((product) => {
        const category = product[4];
        if (!groups.has(category)) {
            groups.set(category, []);
        }
        groups.get(category).push(product);
    });

    const categoryOrder = [
        'Mode femme',
        'Accessoires femme',
        'Sacs femme',
        'Mode garcon',
        'Accessoires garcon',
        'Montres',
        'Bagues',
        'Bracelets',
        'Chaines',
        'Colliers',
        'Pendentifs',
        'Boucles',
        'Coffrets',
        'Plaque or',
        'Argent 925'
    ];
    const orderedGroups = categoryOrder
        .filter((category) => groups.has(category))
        .map((category) => groups.get(category));
    const interleaved = [];
    const largestGroupSize = Math.max(...orderedGroups.map((group) => group.length));

    for (let index = 0; index < largestGroupSize; index += 1) {
        orderedGroups.forEach((group) => {
            if (group[index]) {
                interleaved.push(group[index]);
            }
        });
    }

    return interleaved;
}
const chainProducts = [
    [
        'Chaine Figaro doree',
        'Maillons Figaro en acier inoxydable plaque or, finition brillante, longueur 55 cm.',
        25000,
        productImages.necklaceGold,
        'Plaque or',
        18
    ],
    [
        'Chaine Cubaine argent',
        'Chaine cubaine large en argent 925, style premium pour tenue habillee.',
        58000,
        productImages.necklaceSilver,
        'Argent 925',
        10
    ],
    [
        'Chaine Maille serpent',
        'Maille serpent fine et souple en acier inoxydable, ideale pour porter seule.',
        18000,
        productImages.necklaceClose,
        'Chaines',
        24
    ],
    [
        'Chaine Venitienne',
        'Chaine venitienne solide avec lignes nettes, parfaite avec un pendentif.',
        22000,
        productImages.necklaceBox,
        'Chaines',
        16
    ],
    [
        'Chaine Gourmette doree',
        'Chaine gourmette plaque or, maillons visibles et look affirme.',
        35000,
        productImages.necklaceGold,
        'Plaque or',
        12
    ],
    [
        'Chaine avec pendentif croix',
        'Chaine fine en acier inoxydable avec pendentif croix poli.',
        15000,
        productImages.pendantCross,
        'Pendentifs',
        30
    ],
    [
        'Chaine gourmette homme',
        'Gourmette epaisse en acier inoxydable, fermoir securise, longueur 60 cm.',
        28000,
        productImages.braceletCuban,
        'Bracelets',
        15
    ],
    [
        'Chaine coeur argentee',
        'Chaine argent 925 avec pendentif coeur discret, livree en boite cadeau.',
        32000,
        productImages.pendantHeart,
        'Pendentifs',
        20
    ],
    [
        'Montre Classique noire',
        'Montre homme avec bracelet cuir noir, cadran minimal et boitier acier.',
        45000,
        productImages.watchClassic,
        'Montres',
        14
    ],
    [
        'Montre Doree premium',
        'Montre doree elegante avec bracelet metallique, parfaite pour sorties et cadeaux.',
        65000,
        productImages.watchGold,
        'Montres',
        9
    ],
    [
        'Montre Sport urbaine',
        'Montre sport confortable, style moderne, resistante pour usage quotidien.',
        38000,
        productImages.watchSport,
        'Montres',
        17
    ],
    [
        'Bracelet perles noires',
        'Bracelet en perles noires avec details acier, facile a porter avec une chaine.',
        12000,
        productImages.braceletBeads,
        'Bracelets',
        25
    ],
    [
        'Bague acier signee',
        'Bague acier inoxydable polie, design simple et solide.',
        14000,
        productImages.ringSteel,
        'Bagues',
        19
    ],
    [
        'Bague chevaliere noire',
        'Chevaliere noire en acier inoxydable, style fort pour homme.',
        18000,
        productImages.ringBlack,
        'Bagues',
        13
    ],
    [
        'Bague alliance doree',
        'Bague doree simple, finition brillante, disponible en plusieurs tailles.',
        16000,
        productImages.ringGold,
        'Bagues',
        22
    ],
    [
        'Bracelet maille cubaine',
        'Bracelet maille cubaine plaque or, assorti aux chaines dorees.',
        24000,
        productImages.braceletCuban,
        'Bracelets',
        18
    ],
    [
        'Bracelet tennis brillant',
        'Bracelet type tennis avec pierres brillantes, look chic pour soiree.',
        42000,
        productImages.braceletTennis,
        'Bracelets',
        8
    ],
    [
        'Montre Chrono argent',
        'Montre chronographe couleur argent avec cadran detaille et bracelet acier.',
        72000,
        productImages.watchChrono,
        'Montres',
        7
    ],
    [
        'Montre Femme rose gold',
        'Montre fine rose gold, elegante et legere pour un usage quotidien.',
        52000,
        productImages.watchGold,
        'Montres',
        11
    ],
    [
        'Montre connectee noire',
        'Montre connectee style moderne avec bracelet silicone noir.',
        85000,
        productImages.watchSmart,
        'Montres',
        6
    ],
    [
        'Pendentif lettre A',
        'Pendentif initiale A plaque or, leger et facile a offrir.',
        10000,
        productImages.pendantHeart,
        'Pendentifs',
        28
    ],
    [
        'Pendentif medaillon rond',
        'Medaillon rond argente avec finition polie, compatible chaines fines.',
        17000,
        productImages.necklaceBox,
        'Pendentifs',
        15
    ],
    [
        'Boucles creoles dorees',
        'Creoles dorees taille moyenne, legeres et brillantes.',
        13000,
        productImages.earringsHoop,
        'Boucles',
        20
    ],
    [
        'Boucles perles blanches',
        'Boucles avec perles blanches, style doux pour ceremonie et sortie.',
        15000,
        productImages.earringsPearl,
        'Boucles',
        16
    ],
    [
        'Coffret cadeau homme',
        'Coffret avec chaine, bracelet et bague acier, pret a offrir.',
        69000,
        productImages.giftMen,
        'Coffrets',
        9
    ],
    [
        'Coffret cadeau femme',
        'Coffret avec chaine coeur, boucles et bracelet fin, emballage cadeau inclus.',
        62000,
        productImages.necklaceBox,
        'Coffrets',
        10
    ],
    [
        'Chaine Rope doree',
        'Chaine rope plaque or avec effet torsade, style populaire et resistant.',
        30000,
        productImages.necklaceClose,
        'Plaque or',
        14
    ],
    [
        'Chaine argent fine',
        'Chaine fine argent 925 pour pendentif, finition discrete et elegante.',
        26000,
        productImages.necklaceSilver,
        'Argent 925',
        18
    ],
    [
        'Sac a main beige',
        'Sac beige souple avec poignees solides, parfait pour sorties et travail.',
        32000,
        productImages.handbagBeige,
        'Sacs femme',
        13
    ],
    [
        'Sac epaule rouge',
        'Sac rouge effet cuir avec chaine doree et fermeture aimantee.',
        35000,
        productImages.handbagRed,
        'Sacs femme',
        9
    ],
    [
        'Pochette doree soiree',
        'Pochette brillante pour ceremonie, format telephone, carte et rouge a levres.',
        22000,
        productImages.clutchGold,
        'Sacs femme',
        16
    ],
    [
        'Tote bag ville',
        'Grand tote bag resistant pour courses, ordinateur et affaires du quotidien.',
        15000,
        productImages.tote,
        'Sacs femme',
        24
    ],
    [
        'Sac banane noir',
        'Sac banane compact pour telephone, portefeuille et cles, style urbain.',
        18000,
        productImages.waistBag,
        'Accessoires garcon',
        21
    ],
    [
        'Sac crossbody garcon',
        'Petit sac travers pratique avec plusieurs poches et sangle ajustable.',
        24000,
        productImages.crossbodyMen,
        'Accessoires garcon',
        14
    ],
    [
        'Portefeuille cuir homme',
        'Portefeuille noir avec compartiments cartes, billets et piece identite.',
        16000,
        productImages.walletMen,
        'Portefeuilles',
        28
    ],
    [
        'Portefeuille femme elegant',
        'Portefeuille long avec fermeture zip et rangement cartes.',
        19000,
        productImages.walletWomen,
        'Accessoires femme',
        17
    ],
    [
        'Porte-cartes minimaliste',
        'Porte-cartes fin pour poche ou sac, design simple et solide.',
        9000,
        productImages.cardHolder,
        'Portefeuilles',
        35
    ],
    [
        'Ceinture cuir noire',
        'Ceinture noire avec boucle metal, facile a porter au quotidien.',
        14000,
        productImages.beltBlack,
        'Ceintures',
        26
    ],
    [
        'Ceinture cuir marron',
        'Ceinture marron classique pour pantalon jean ou tenue habillee.',
        15000,
        productImages.beltBrown,
        'Ceintures',
        20
    ],
    [
        'Ceinture fine femme',
        'Ceinture fine pour robe ou pantalon taille haute, boucle doree discrete.',
        12000,
        productImages.beltWomen,
        'Accessoires femme',
        19
    ],
    [
        'Lunettes aviateur',
        'Lunettes style aviateur avec verres teintes et monture legere.',
        18000,
        productImages.lunettes,
        'Lunettes',
        22
    ],
    [
        'Lunettes oversize femme',
        'Grandes lunettes tendance pour proteger du soleil avec style.',
        21000,
        productImages.lunettesOversize,
        'Accessoires femme',
        15
    ],
    [
        'Lunettes carrees garcon',
        'Lunettes carrees modernes avec monture noire, look propre et simple.',
        17000,
        productImages.lunettesCarrees,
        'Accessoires garcon',
        18
    ],
    [
        'Casquette noire',
        'Casquette noire ajustable avec visiere courbee, facile a assortir.',
        10000,
        productImages.casquetteNoire,
        'Casquettes',
        31
    ],
    [
        'Casquette beige',
        'Casquette beige casual avec fermeture reglable a l arriere.',
        10000,
        productImages.casquetteBeige,
        'Casquettes',
        27
    ],
    [
        'Casquette rouge sport',
        'Casquette rouge dynamique pour tenue streetwear ou sportive.',
        11000,
        productImages.casquetteRouge,
        'Accessoires garcon',
        23
    ],
    [
        'Foulard satin imprime',
        'Foulard satin doux pour cheveux, cou ou anse de sac.',
        9000,
        productImages.foulard,
        'Accessoires femme',
        30
    ],
    [
        'Serre-tete perles',
        'Serre-tete avec details perles, ideal pour coiffure chic rapide.',
        8000,
        productImages.serreTete,
        'Accessoires femme',
        25
    ],
    [
        'Pinces cheveux dorees',
        'Lot de pinces cheveux dorees pour coiffure simple et soignee.',
        7000,
        productImages.pincesCheveux,
        'Accessoires femme',
        34
    ],
    [
        'Chouchous satin lot de 4',
        'Chouchous satin doux qui marquent moins les cheveux.',
        6000,
        productImages.chouchous,
        'Accessoires femme',
        40
    ],
    [
        'Trousse maquillage rose',
        'Trousse pratique pour maquillage, bijoux et petits accessoires.',
        12000,
        productImages.trousseMaquillage,
        'Accessoires femme',
        21
    ],
    [
        'Porte-cles metal',
        'Porte-cles solide avec anneau metal, pratique pour maison et moto.',
        5000,
        productImages.porteCles,
        'Accessoires garcon',
        45
    ],
    [
        'Bracelet cuir garcon',
        'Bracelet cuir noir avec fermoir metal, style simple et masculin.',
        9000,
        productImages.braceletCuir,
        'Accessoires garcon',
        32
    ],
    [
        'Parfum homme intense',
        'Parfum homme avec notes boisees, format facile a offrir.',
        26000,
        productImages.parfumHomme,
        'Parfums',
        12
    ],
    [
        'Parfum femme floral',
        'Parfum femme doux et floral pour journee ou sortie.',
        28000,
        productImages.parfumFemme,
        'Parfums',
        14
    ],
    [
        'Brume corporelle vanille',
        'Brume parfumee legere pour sac ou routine quotidienne.',
        12000,
        productImages.brumeCorporelle,
        'Accessoires femme',
        33
    ],
    [
        'Deodorant spray sport',
        'Deodorant spray frais pour usage quotidien et activite.',
        5000,
        productImages.deodorant,
        'Accessoires garcon',
        38
    ],
    [
        'Kit soins visage',
        'Kit soins visage avec essentiels pour routine simple.',
        24000,
        productImages.kitSoinsVisage,
        'Accessoires femme',
        11
    ],
    [
        'Kit barbe garcon',
        'Kit barbe avec peigne, huile et accessoires de soin.',
        20000,
        productImages.kitBarbe,
        'Accessoires garcon',
        13
    ],
    [
        'Set pinceaux maquillage',
        'Set de pinceaux pour maquillage propre, livre avec pochette.',
        16000,
        productImages.setPinceaux,
        'Accessoires femme',
        20
    ],
    [
        'Miroir LED poche',
        'Petit miroir LED rechargeable pour sac a main ou voyage.',
        18000,
        productImages.miroirLED,
        'Accessoires femme',
        18
    ]
];

const necklaceNames = [
    ['Collier Figaro dore', 'Collier maille Figaro plaque or, finition brillante et longueur 55 cm.', 25000, productImages.necklaceGold, 'Plaque or', 18],
    ['Collier cubain argent', 'Collier cubain large en argent 925, style premium et mailles visibles.', 58000, productImages.necklaceSilver, 'Argent 925', 10],
    ['Collier maille serpent', 'Collier souple maille serpent en acier inoxydable, discret et elegant.', 18000, productImages.necklaceClose, 'Chaines', 24],
    ['Collier venitien', 'Collier venitien avec lignes nettes, parfait seul ou avec pendentif.', 22000, productImages.necklaceBox, 'Chaines', 16],
    ['Collier plaqué or gourmette', 'Collier plaque or a maille gourmette, look affirme et brillant.', 35000, productImages.necklaceGold, 'Plaque or', 12],
    ['Collier pendentif croix', 'Collier fin avec pendentif croix poli, facile a porter chaque jour.', 15000, productImages.pendantCross, 'Pendentifs', 30],
    ['Collier coeur argente', 'Collier argent 925 avec pendentif coeur, livre en boite cadeau.', 32000, productImages.pendantHeart, 'Pendentifs', 20],
    ['Collier rope dore', 'Collier rope plaque or avec effet torsade, resistant et lumineux.', 30000, productImages.necklaceClose, 'Plaque or', 14],
    ['Collier argent fin', 'Collier fin argent 925 pour pendentif, finition discrete et propre.', 26000, productImages.necklaceSilver, 'Argent 925', 18],
    ['Collier medaillon rond', 'Collier avec medaillon rond argente, finition polie.', 17000, productImages.necklaceBox, 'Pendentifs', 15],
    ['Collier gourmette dore', 'Collier maille gourmette plaque or, fermoir securise.', 28000, productImages.necklaceGold, 'Plaque or', 15],
    ['Collier initiale A', 'Collier avec pendentif lettre A plaque or, leger et facile a offrir.', 10000, productImages.pendantHeart, 'Pendentifs', 28],
    ['Collier maille corde argent', 'Collier argent style corde, brillance douce et mailles serrees.', 29000, productImages.necklaceSilver, 'Argent 925', 17],
    ['Collier chaine fine doree', 'Collier fin plaque or pour un style simple et elegant.', 14000, productImages.necklaceGold, 'Plaque or', 34],
    ['Collier pendentif pierre', 'Collier avec pendentif pierre claire, style chic pour sortie.', 24000, productImages.pendantHeart, 'Pendentifs', 19],
    ['Collier tennis brillant', 'Collier type tennis avec pierres brillantes, ideal pour ceremonie.', 62000, productImages.necklaceBox, 'Colliers', 8],
    ['Collier double rang', 'Collier double rang dore avec chaines fines superposees.', 27000, productImages.necklaceGold, 'Plaque or', 21],
    ['Collier perles blanches', 'Collier perles blanches avec fermoir metal, style doux et propre.', 30000, productImages.necklaceBox, 'Colliers', 13],
    ['Collier ras de cou', 'Collier ras de cou fin, discret et facile a assortir.', 12000, productImages.necklaceClose, 'Chaines', 40],
    ['Collier maille forcat', 'Collier maille forcat solide pour usage quotidien.', 20000, productImages.necklaceSilver, 'Argent 925', 22],
    ['Collier pendentif lune', 'Collier avec pendentif lune dore, leger et feminin.', 16000, productImages.pendantHeart, 'Pendentifs', 27],
    ['Collier plaque nom', 'Collier plaque personnalisable, finition doree brillante.', 33000, productImages.necklaceGold, 'Plaque or', 11],
    ['Collier acier premium', 'Collier acier inoxydable avec mailles solides et fermoir resistant.', 23000, productImages.necklaceClose, 'Chaines', 25],
    ['Collier maille ovale', 'Collier maille ovale doree, style moderne et visible.', 31000, productImages.necklaceGold, 'Plaque or', 16],
    ['Collier pendentif etoile', 'Collier fin avec pendentif etoile poli, parfait pour cadeau.', 15000, productImages.pendantCross, 'Pendentifs', 31],
    ['Collier argent classique', 'Collier argent classique, propre, brillant et intemporel.', 34000, productImages.necklaceSilver, 'Argent 925', 14],
    ['Collier chaine epaisse', 'Collier chaine epaisse plaque or pour un look remarque.', 45000, productImages.necklaceGold, 'Plaque or', 9],
    ['Collier chaine plate', 'Collier chaine plate brillante, confortable sur le cou.', 26000, productImages.necklaceClose, 'Chaines', 18],
    ['Collier pendentif coeur dore', 'Collier coeur dore avec finition brillante et chaine fine.', 19000, productImages.pendantHeart, 'Pendentifs', 24],
    ['Collier maille box', 'Collier maille box argente, ideal avec pendentif.', 21000, productImages.necklaceSilver, 'Argent 925', 20],
    ['Collier choker dore', 'Collier choker plaque or, style mode et minimal.', 13000, productImages.necklaceGold, 'Colliers', 29],
    ['Collier pendentif rond dore', 'Collier pendentif rond plaque or avec surface polie.', 22000, productImages.necklaceBox, 'Pendentifs', 18],
    ['Collier chaine torsadee', 'Collier torsade doree avec effet relief elegant.', 36000, productImages.necklaceClose, 'Plaque or', 12],
    ['Collier argent pendentif', 'Collier argent avec pendentif simple, facile a offrir.', 28000, productImages.necklaceSilver, 'Argent 925', 15],
    ['Collier maille marine', 'Collier maille marine doree, mailles solides et finition premium.', 39000, productImages.necklaceGold, 'Plaque or', 10],
    ['Collier fin ceremonial', 'Collier fin brillant pour ceremonies et sorties habillees.', 25000, productImages.necklaceBox, 'Colliers', 17],
    ['Collier pendentif aile', 'Collier avec pendentif aile, leger et symbolique.', 18000, productImages.pendantCross, 'Pendentifs', 23],
    ['Collier argent serpent', 'Collier argent maille serpent, souple et tres brillant.', 30000, productImages.necklaceSilver, 'Argent 925', 13],
    ['Collier dore quotidien', 'Collier plaque or simple pour porter tous les jours.', 17000, productImages.necklaceGold, 'Plaque or', 33],
    ['Collier chaine rectangle', 'Collier a maillons rectangles, style moderne et net.', 29000, productImages.necklaceClose, 'Chaines', 16],
    ['Collier pendentif cercle', 'Collier avec pendentif cercle minimaliste, finition doree.', 16000, productImages.pendantHeart, 'Pendentifs', 26],
    ['Collier luxe argent', 'Collier argent 925 avec finition premium et boite cadeau.', 52000, productImages.necklaceSilver, 'Argent 925', 7],
    ['Collier luxe dore', 'Collier plaque or haut de gamme avec brillance forte.', 54000, productImages.necklaceGold, 'Plaque or', 6],
    ['Collier cadeau femme', 'Collier fin avec pendentif coeur, pret a offrir.', 23000, productImages.pendantHeart, 'Pendentifs', 20],
    ['Collier cadeau homme', 'Collier chaine doree sobre, longueur confortable.', 26000, productImages.necklaceGold, 'Chaines', 19]
];

const braceletNames = [
    ['Bracelet gourmette homme', 'Bracelet gourmette epaisse en acier inoxydable avec fermoir securise.', 28000, productImages.braceletCuban, 'Bracelets', 15],
    ['Bracelet perles noires', 'Bracelet en perles noires avec details acier, facile a porter avec une chaine.', 12000, productImages.braceletBeads, 'Bracelets', 25],
    ['Bracelet maille cubaine', 'Bracelet maille cubaine plaque or, assorti aux chaines dorees.', 24000, productImages.braceletCuban, 'Bracelets', 18],
    ['Bracelet tennis brillant', 'Bracelet type tennis avec pierres brillantes, look chic pour soiree.', 42000, productImages.braceletTennis, 'Bracelets', 8],
    ['Bracelet fin dore', 'Bracelet fin plaque or, discret et elegant pour tous les jours.', 14000, productImages.braceletCuban, 'Plaque or', 22],
    ['Bracelet argent classique', 'Bracelet argent 925 avec finition polie et fermoir solide.', 26000, productImages.braceletTennis, 'Argent 925', 14],
    ['Bracelet corde acier', 'Bracelet corde acier inoxydable, style simple et resistant.', 16000, productImages.braceletBeads, 'Bracelets', 19],
    ['Bracelet jonc dore', 'Bracelet jonc plaque or avec lignes propres et brillance douce.', 21000, productImages.braceletCuban, 'Plaque or', 17],
    ['Bracelet perles dorees', 'Bracelet perles dorees leger, parfait avec un collier fin.', 15000, productImages.braceletBeads, 'Bracelets', 26],
    ['Bracelet luxe tennis', 'Bracelet tennis premium avec pierres brillantes pour ceremonie.', 52000, productImages.braceletTennis, 'Bracelets', 7],
    ['Bracelet chaine plate', 'Bracelet chaine plate doree, moderne et confortable.', 19000, productImages.braceletCuban, 'Plaque or', 20],
    ['Bracelet argent fin', 'Bracelet fin argent 925, facile a porter seul ou en duo.', 22000, productImages.braceletTennis, 'Argent 925', 16],
    ['Bracelet couple dore', 'Bracelet dore assorti, modele cadeau pour couple ou ami proche.', 30000, productImages.braceletCuban, 'Plaque or', 12],
    ['Bracelet maillons ovales', 'Bracelet a maillons ovales avec finition brillante.', 23000, productImages.braceletCuban, 'Bracelets', 18],
    ['Bracelet minimal argent', 'Bracelet argent minimal, propre et discret.', 18000, productImages.braceletTennis, 'Argent 925', 24]
];

const extraJewelryProducts = [
    ['Boucles goutte dorees', 'Boucles pendantes forme goutte, finition doree brillante.', 18000, productImages.earringsHoop, 'Boucles', 14],
    ['Boucles zircon argent', 'Boucles argent 925 avec zircon brillant, style discret et chic.', 22000, productImages.earringsPearl, 'Boucles', 12],
    ['Boucles coeur rose gold', 'Boucles coeur rose gold, legeres pour tous les jours.', 16000, productImages.earringsHoop, 'Boucles', 18],
    ['Boucles pendantes perlees', 'Boucles pendantes avec perles claires, parfaites pour ceremonie.', 24000, productImages.earringsPearl, 'Boucles', 9],
    ['Boucles mini creoles argent', 'Mini creoles argentees, confortables et faciles a porter.', 14000, productImages.earringsHoop, 'Boucles', 23],
    ['Boucles pierre blanche', 'Boucles avec pierre blanche sertie, rendu lumineux et feminin.', 20000, productImages.earringsPearl, 'Boucles', 15],

    ['Bague solitaire brillant', 'Bague solitaire avec pierre claire, finition polie.', 26000, productImages.ringSteel, 'Bagues', 11],
    ['Bague fine rose gold', 'Bague fine rose gold, elegante et facile a associer.', 15000, productImages.ringGold, 'Bagues', 20],
    ['Bague double rang doree', 'Bague double rang plaque or avec lignes modernes.', 21000, productImages.ringGold, 'Bagues', 13],
    ['Bague pierre noire', 'Bague acier avec pierre noire, style sobre et fort.', 19000, productImages.ringBlack, 'Bagues', 10],
    ['Bague ajustable argent', 'Bague ajustable argentee, finition propre et confortable.', 17000, productImages.ringSteel, 'Bagues', 18],
    ['Bague alliance zircon', 'Alliance fine avec zircon discret, brillante sans etre trop chargee.', 23000, productImages.ringGold, 'Bagues', 12],

    ['Montre acier bleue', 'Montre acier avec cadran bleu, style propre pour sortie et travail.', 56000, productImages.watchClassic, 'Montres', 8],
    ['Montre cuir marron', 'Montre avec bracelet cuir marron et cadran simple.', 43000, productImages.watchClassic, 'Montres', 16],
    ['Montre noire premium', 'Montre noire elegante avec finition metallique moderne.', 60000, productImages.watchSport, 'Montres', 10],
    ['Montre bijou femme', 'Montre femme fine avec bracelet brillant et cadran clair.', 48000, productImages.watchGold, 'Montres', 13],
    ['Montre acier cadran blanc', 'Montre acier cadran blanc, classique et facile a offrir.', 52000, productImages.watchChrono, 'Montres', 9],
    ['Montre dorure elegante', 'Montre doree avec bracelet metallique et finition habillee.', 70000, productImages.watchGold, 'Montres', 7],

    ['Coffret bijoux argent', 'Coffret avec collier argent, bracelet fin et boucles assorties.', 74000, productImages.giftWomen, 'Coffrets', 7],
    ['Coffret plaque or complet', 'Coffret plaque or avec chaine, pendentif et bracelet assorti.', 82000, productImages.giftWomen, 'Coffrets', 6],
    ['Coffret montre bracelet', 'Coffret cadeau avec montre et bracelet assorti.', 88000, productImages.giftMen, 'Coffrets', 5],
    ['Coffret bague boucles', 'Coffret feminin avec bague et boucles brillantes.', 54000, productImages.giftWomen, 'Coffrets', 11],
    ['Coffret couple dore', 'Coffret cadeau couple avec bijoux dores assortis.', 76000, productImages.giftMen, 'Coffrets', 8],
    ['Coffret ceremonie femme', 'Coffret ceremonie avec collier, boucles et bracelet brillant.', 92000, productImages.giftWomen, 'Coffrets', 4],

    ['Collier coeur perle', 'Collier coeur avec perle claire, style doux et lumineux.', 24000, productImages.pendantHeart, 'Colliers', 17],
    ['Collier chaine bille', 'Collier chaine bille argente, discret et moderne.', 18000, productImages.necklaceSilver, 'Colliers', 22],
    ['Collier dorure fine', 'Collier plaque or fin, elegant pour usage quotidien.', 21000, productImages.necklaceGold, 'Colliers', 20],
    ['Collier pendentif soleil', 'Collier avec pendentif soleil dore, leger et brillant.', 19000, productImages.pendantCross, 'Colliers', 18],

    ['Montre maille milanaise', 'Montre bracelet maille milanaise, cadran clair et finition chic.', 64000, productImages.watchGold, 'Montres', 9],
    ['Montre business argent', 'Montre argent elegante pour bureau, ceremonie et sortie habillee.', 59000, productImages.watchClassic, 'Montres', 12],
    ['Montre cadran noir luxe', 'Montre cadran noir avec bracelet metal, style premium et moderne.', 75000, productImages.watchSport, 'Montres', 7],
    ['Montre doree bijou', 'Montre doree fine avec bracelet brillant, ideale comme cadeau.', 68000, productImages.watchGold, 'Montres', 8],
    ['Montre chronographe bleue', 'Montre chronographe avec cadran bleu et bracelet acier poli.', 79000, productImages.watchChrono, 'Montres', 6],

    ['Bracelet maille serpent argent', 'Bracelet argent maille serpent, souple, brillant et discret.', 24000, productImages.braceletTennis, 'Bracelets', 14],
    ['Bracelet manchette doree', 'Bracelet manchette doree avec rendu luxe pour soiree.', 36000, productImages.braceletCuban, 'Plaque or', 10],
    ['Bracelet charms coeur', 'Bracelet charms avec pendentif coeur, feminin et facile a offrir.', 22000, productImages.braceletCuban, 'Bracelets', 16],
    ['Bracelet zircon argent', 'Bracelet argent avec petits zircons brillants, style ceremonie.', 38000, productImages.braceletTennis, 'Argent 925', 8],
    ['Bracelet double chaine', 'Bracelet double chaine plaque or, moderne et lumineux.', 26000, productImages.braceletCuban, 'Plaque or', 13],

    ['Bague cocktail doree', 'Bague doree decorative avec pierre centrale lumineuse.', 27000, productImages.ringGold, 'Bagues', 9],
    ['Bague ruban argent', 'Bague argent style ruban, finition polie et confortable.', 21000, productImages.ringSteel, 'Argent 925', 15],
    ['Bague trio minimaliste', 'Lot de trois bagues fines, rendu elegant et tendance.', 25000, productImages.ringGold, 'Bagues', 11],

    ['Boucles cercle zircon', 'Boucles cercle avec zircons brillants, legeres et elegantes.', 23000, productImages.earringsHoop, 'Boucles', 13],
    ['Boucles pendantes luxe', 'Boucles pendantes brillantes pour ceremonie et sortie chic.', 28000, productImages.earringsPearl, 'Boucles', 8]
];

const catalogProducts = uniqueProductsByImage(
    assignDistinctJewelryPhotos(uniqueProductsByName(
        interleaveProductsByCategory([
            ...necklaceNames,
            ...braceletNames,
            ...extraJewelryProducts
        ])
    ))
).map(reduceProductPrice);

// Création des tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS produits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        description TEXT,
        prix REAL NOT NULL,
        image TEXT,
        categorie TEXT,
        stock INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages_recus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        reply_to TEXT,
        content_text TEXT,
        content_html TEXT,
        status TEXT NOT NULL DEFAULT 'enregistre',
        created_at TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS commandes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        customer_address TEXT,
        total REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'nouvelle',
        created_at TEXT NOT NULL,
        legacy_message_id INTEGER
    )`);

    db.run(`ALTER TABLE commandes ADD COLUMN legacy_message_id INTEGER`, [], (err) => {
        if (err && !String(err.message || '').includes('duplicate column name')) {
            console.error("Erreur d'ajout de la colonne legacy_message_id:", err.message);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS commande_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commande_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (commande_id) REFERENCES commandes(id)
    )`, [], () => {
        migrateLegacyOrderMessages();
    });

    db.get(
        `SELECT
            COUNT(*) as count,
            SUM(CASE WHEN image LIKE '%loremflickr.com%' OR image LIKE 'https://source.unsplash.com/%' THEN 1 ELSE 0 END) as randomImages,
            SUM(CASE WHEN image LIKE 'https://images.pexels.com/%' THEN 1 ELSE 0 END) as pexelsImages,
            SUM(CASE WHEN image LIKE 'data:image/svg%' THEN 1 ELSE 0 END) as generatedImages,
            SUM(CASE WHEN image NOT LIKE '/images/%' AND image NOT LIKE 'https://images.pexels.com/%' AND image NOT LIKE 'https://images.unsplash.com/%' THEN 1 ELSE 0 END) as invalidImages,
            COUNT(DISTINCT image) as uniqueImages
        FROM produits`,
        [], 
        (err, row) => {
            if (err) {
                console.error('Erreur lors de la verification du catalogue:', err.message);
                return;
            }

            const needsCatalogRefresh =
                row.count !== catalogProducts.length ||
                Number(row.randomImages) > 0 ||
                Number(row.invalidImages) > 0 ||
                Number(row.uniqueImages) < 35;

            db.get('SELECT value FROM app_settings WHERE key = ?', ['catalog_version'], (versionErr, versionRow) => {
                if (versionErr) {
                    console.error('Erreur lors de la verification de version du catalogue:', versionErr.message);
                    return;
                }

                if (needsCatalogRefresh || !versionRow || versionRow.value !== CATALOG_VERSION) {
                    seedChainCatalog();
                }
            });
        }
    );
});

function seedChainCatalog() {
    db.serialize(() => {
        db.run('BEGIN IMMEDIATE TRANSACTION');
        db.run('DELETE FROM produits');
        db.run('DELETE FROM categories');

        const categoryStmt = db.prepare('INSERT OR IGNORE INTO categories (nom) VALUES (?)');
        chainCategories.forEach((category) => categoryStmt.run(category));
        categoryStmt.finalize();

        const productStmt = db.prepare('INSERT INTO produits (nom, description, prix, image, categorie, stock) VALUES (?, ?, ?, ?, ?, ?)');
        catalogProducts.forEach((product) => productStmt.run(product));
        productStmt.finalize(() => {
            db.run(
                'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
                ['catalog_version', CATALOG_VERSION],
                () => db.run('COMMIT')
            );
        });
    });
}

// Routes API
// Setup authentication routes first
setupAuthRoutes(app, db);

app.get('/api/product-image/:key.svg', (req, res) => {
    const svg = generatedProductImages.get(req.params.key);

    if (!svg) {
        res.status(404).type('text/plain').send('Image introuvable');
        return;
    }

    res.type('image/svg+xml').send(svg);
});

// Proxy pour les images Pexels
app.get('/proxy/image', (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).send('URL manquante');
    }

    const parsedUrl = url.parse(imageUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };

    const proxyReq = client.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('Erreur proxy:', err);
        res.status(500).send('Erreur de proxy');
    });

    proxyReq.end();
});

app.get('/api/produits', (req, res) => {
    const sql = "SELECT * FROM produits ORDER BY id";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erreur API produits:', err.message);
            res.json(catalogProducts.map(productFromCatalogEntry));
            return;
        }
        
        res.json(rows);
    });
});

app.get('/api/diagnostic', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM produits', [], (err, row) => {
        res.json({
            ok: !err,
            database: db.kind || 'sqlite',
            hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
            netlify: Boolean(process.env.NETLIFY),
            productsCount: row && row.count !== undefined ? Number(row.count) : null,
            error: err ? err.message : null
        });
    });
});

app.get('/api/produits/:categorie', (req, res) => {
    const categorie = req.params.categorie;
    const sql = "SELECT * FROM produits WHERE categorie = ? ORDER BY id";
    db.all(sql, [categorie], (err, rows) => {
        if (err) {
            console.error('Erreur API produits categorie:', err.message);
            res.json(catalogProducts
                .filter((product) => product[4] === categorie)
                .map(productFromCatalogEntry));
            return;
        }
        
        res.json(rows);
    });
});

app.get('/api/categories', (req, res) => {
    const sql = "SELECT DISTINCT categorie FROM produits ORDER BY categorie";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erreur API categories:', err.message);
            res.json(chainCategories);
            return;
        }
        res.json(rows.map(row => row.categorie));
    });
});

function productFromCatalogEntry(product, index) {
    return {
        id: index + 1,
        nom: product[0],
        description: product[1],
        prix: product[2],
        image: product[3],
        categorie: product[4],
        stock: product[5]
    };
}

app.post('/api/contact', async (req, res) => {
    try {
        const nom = requireText(req.body.nom, 'Le nom', 120);
        const email = requireText(req.body.email, "L'email", 160);
        const message = requireText(req.body.message, 'Le message', 3000);
        const subject = `Nouveau message contact - ${nom}`;
        const contactText = [
            'Nouveau message depuis la boutique.',
            '',
            `Nom: ${nom}`,
            `Email: ${email}`,
            '',
            'Message:',
            message
        ].join('\n');

        const delivery = await sendBusinessEmail({
            subject,
            replyTo: email,
            text: contactText,
            html: `
                <h2>Nouveau message depuis le formulaire de contact</h2>
                <p><strong>Nom:</strong> ${escapeHtml(nom)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            `
        });

        res.json({
            ok: true,
            message: delivery.sent
                ? 'Message envoye par email.'
                : `Email non envoye. Verifiez la configuration Gmail SMTP dans le fichier .env.`
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message || "Impossible d'envoyer le message." });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const customerName = requireText(req.body.customerName, 'Le nom', 120);
        const customerPhone = requireText(req.body.customerPhone, 'Le telephone', 60);
        const customerEmail = String(req.body.customerEmail || '').trim().slice(0, 160);
        const customerAddress = String(req.body.customerAddress || '').trim().slice(0, 220);
        const items = Array.isArray(req.body.items) ? req.body.items : [];

        if (items.length === 0) {
            return res.status(400).json({ error: 'Le panier est vide.' });
        }

        const cleanItems = items.map((item) => ({
            id: Number(item.id) || null,
            nom: requireText(item.nom, 'Le produit', 160),
            quantity: Math.max(1, Number(item.quantity) || 1),
            prix: Math.max(0, Number(item.prix) || 0)
        }));
        const total = cleanItems.reduce((sum, item) => sum + item.prix * item.quantity, 0);
        const itemLines = cleanItems.map((item) => `- ${item.nom} x ${item.quantity}: ${formatMoney(item.prix * item.quantity)}`);
        const itemRows = cleanItems.map((item) => `
            <tr>
                <td>${escapeHtml(item.nom)}</td>
                <td>${item.quantity}</td>
                <td>${formatMoney(item.prix)}</td>
                <td>${formatMoney(item.prix * item.quantity)}</td>
            </tr>
        `).join('');

        const orderId = await saveOrder({
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            items: cleanItems,
            total
        });
        const orderText = [
            `Nouvelle commande #${orderId} depuis la boutique.`,
            '',
            `Nom: ${customerName}`,
            `Telephone: ${customerPhone}`,
            customerEmail ? `Email: ${customerEmail}` : '',
            customerAddress ? `Adresse: ${customerAddress}` : '',
            '',
            'Produits:',
            ...itemLines,
            '',
            `Total: ${formatMoney(total)}`
        ].filter(Boolean).join('\n');

        const delivery = await sendBusinessEmail({
            subject: `Nouvelle commande #${orderId} - ${customerName}`,
            replyTo: customerEmail || undefined,
            text: orderText,
            html: `
                <h2>Nouvelle commande depuis la boutique</h2>
                <p><strong>Commande:</strong> #${orderId}</p>
                <p><strong>Nom:</strong> ${escapeHtml(customerName)}</p>
                <p><strong>Telephone:</strong> ${escapeHtml(customerPhone)}</p>
                ${customerEmail ? `<p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>` : ''}
                ${customerAddress ? `<p><strong>Adresse:</strong> ${escapeHtml(customerAddress)}</p>` : ''}
                <table border="1" cellpadding="8" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Quantite</th>
                            <th>Prix</th>
                            <th>Sous-total</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <p><strong>Total:</strong> ${formatMoney(total)}</p>
            `
        });

        res.json({
            ok: true,
            orderId,
            message: delivery.sent
                ? 'Commande envoyee par email.'
                : `Email non envoye. Verifiez la configuration Gmail SMTP dans le fichier .env.`
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message || "Impossible d'envoyer la commande." });
    }
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/orders');
});

app.post('/admin/orders/:id/status', (req, res) => {
    const orderId = Number(req.params.id);
    const allowedStatuses = ['nouvelle', 'en traitement', 'livree', 'annulee'];
    const status = String(req.body.status || '').trim().toLowerCase();

    if (!orderId || !allowedStatuses.includes(status)) {
        res.status(400).type('text/plain').send('Statut de commande invalide.');
        return;
    }

    db.run('UPDATE commandes SET status = ? WHERE id = ?', [status, orderId], (err) => {
        if (err) {
            res.status(500).type('text/plain').send(err.message);
            return;
        }

        res.redirect('/admin/orders');
    });
});

app.post('/admin/orders/:id/delete', (req, res) => {
    const orderId = Number(req.params.id);

    if (!orderId) {
        res.status(400).type('text/plain').send('Commande invalide.');
        return;
    }

    db.serialize(() => {
        db.run('BEGIN IMMEDIATE TRANSACTION');
        db.run('DELETE FROM commande_articles WHERE commande_id = ?', [orderId], (articlesErr) => {
            if (articlesErr) {
                rollbackOrder((error) => res.status(500).type('text/plain').send(error.message), articlesErr);
                return;
            }

            db.run('DELETE FROM commandes WHERE id = ?', [orderId], (orderErr) => {
                if (orderErr) {
                    rollbackOrder((error) => res.status(500).type('text/plain').send(error.message), orderErr);
                    return;
                }

                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        rollbackOrder((error) => res.status(500).type('text/plain').send(error.message), commitErr);
                        return;
                    }

                    res.redirect('/admin/orders');
                });
            });
        });
    });
});

app.post('/admin/messages/:id/status', (req, res) => {
    const messageId = Number(req.params.id);
    const allowedStatuses = ['enregistre', 'lu', 'traite', 'archive'];
    const status = String(req.body.status || '').trim().toLowerCase();

    if (!messageId || !allowedStatuses.includes(status)) {
        res.status(400).type('text/plain').send('Statut de message invalide.');
        return;
    }

    db.run('UPDATE messages_recus SET status = ? WHERE id = ?', [status, messageId], (err) => {
        if (err) {
            res.status(500).type('text/plain').send(err.message);
            return;
        }

        res.redirect('/admin/orders#messages');
    });
});

app.post('/admin/messages/:id/delete', (req, res) => {
    const messageId = Number(req.params.id);

    if (!messageId) {
        res.status(400).type('text/plain').send('Message invalide.');
        return;
    }

    db.run('DELETE FROM messages_recus WHERE id = ?', [messageId], (err) => {
        if (err) {
            res.status(500).type('text/plain').send(err.message);
            return;
        }

        res.redirect('/admin/orders#messages');
    });
});

app.get('/admin/orders', (req, res) => {
    db.all('SELECT * FROM commandes ORDER BY id DESC LIMIT 100', [], (err, orders) => {
        if (err) {
            res.status(500).type('text/plain').send(err.message);
            return;
        }

        db.all('SELECT * FROM messages_recus ORDER BY id DESC LIMIT 100', [], (messagesErr, messages) => {
            if (messagesErr) {
                res.status(500).type('text/plain').send(messagesErr.message);
                return;
            }

        const renderPage = (articlesByOrder) => {
            const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
            const allArticles = orders.flatMap((order) => {
                const articles = articlesByOrder.get(order.id) || [];
                return articles.map((article) => ({ order, article }));
            });
            const totalProducts = allArticles.reduce((sum, entry) => sum + Number(entry.article.quantity || 0), 0);
            const unreadMessages = messages.filter((message) => message.status !== 'lu' && message.status !== 'traite' && message.status !== 'archive').length;
            const statusBadge = (status) => {
                const statusClass = String(status || 'nouvelle')
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                return `<span class="status-badge status-${statusClass}">${escapeHtml(status)}</span>`;
            };
            const productRows = allArticles.map(({ order, article }) => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${escapeHtml(order.created_at)}</td>
                    <td>${escapeHtml(order.customer_name)}</td>
                    <td>${escapeHtml(order.customer_phone)}</td>
                    <td>${order.customer_email ? escapeHtml(order.customer_email) : 'Non renseigne'}</td>
                    <td>${order.customer_address ? escapeHtml(order.customer_address) : 'Non renseignee'}</td>
                    <td>${escapeHtml(article.product_name)}</td>
                    <td>${article.quantity}</td>
                    <td>${formatMoney(article.unit_price)}</td>
                    <td>${formatMoney(article.subtotal)}</td>
                    <td>${statusBadge(order.status)}</td>
                </tr>
            `).join('');
            const orderStatusOptions = (status) => ['nouvelle', 'en traitement', 'livree', 'annulee'].map((option) => `
                <option value="${option}" ${status === option ? 'selected' : ''}>${option}</option>
            `).join('');
            const messageStatusOptions = (status) => ['enregistre', 'lu', 'traite', 'archive'].map((option) => `
                <option value="${option}" ${status === option ? 'selected' : ''}>${option}</option>
            `).join('');
            const orderRows = orders.map((order) => {
                const articles = articlesByOrder.get(order.id) || [];
                const articleRows = articles.map((article) => `
                    <tr>
                        <td>${escapeHtml(article.product_name)}</td>
                        <td>${article.quantity}</td>
                        <td>${formatMoney(article.unit_price)}</td>
                        <td>${formatMoney(article.subtotal)}</td>
                    </tr>
                `).join('');

                return `
                    <article class="order-card">
                        <div class="order-head">
                            <div>
                                <p class="label">Commande #${order.id}</p>
                                <h2>${escapeHtml(order.customer_name)}</h2>
                            </div>
                            <div class="order-meta">
                                <strong>${formatMoney(order.total)}</strong>
                                <span>${statusBadge(order.status)} ${escapeHtml(order.created_at)}</span>
                            </div>
                        </div>
                        <div class="customer-grid">
                            <p><span>Telephone</span>${escapeHtml(order.customer_phone)}</p>
                            <p><span>Email</span>${order.customer_email ? escapeHtml(order.customer_email) : 'Non renseigne'}</p>
                            <p><span>Adresse</span>${order.customer_address ? escapeHtml(order.customer_address) : 'Non renseignee'}</p>
                        </div>
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produit commande</th>
                                        <th>Quantite</th>
                                        <th>Prix unitaire</th>
                                        <th>Sous-total</th>
                                    </tr>
                                </thead>
                                <tbody>${articleRows}</tbody>
                            </table>
                        </div>
                        <div class="admin-actions">
                            <form method="post" action="/admin/orders/${order.id}/status">
                                <label>
                                    <span>Statut</span>
                                    <select name="status">${orderStatusOptions(order.status)}</select>
                                </label>
                                <button type="submit">Modifier</button>
                            </form>
                            <form method="post" action="/admin/orders/${order.id}/delete" onsubmit="return confirm('Supprimer cette commande ?');">
                                <button class="danger" type="submit">Supprimer</button>
                            </form>
                        </div>
                    </article>
                `;
            }).join('');
            const messageRows = messages.map((message) => `
                <article class="message-card">
                    <div class="message-head">
                        <div>
                            <p class="label">Message #${message.id}</p>
                            <h2>${escapeHtml(message.subject)}</h2>
                        </div>
                        <span>${statusBadge(message.status)} ${escapeHtml(message.created_at)}</span>
                    </div>
                    ${message.reply_to ? `<p><strong>Repondre a:</strong> ${escapeHtml(message.reply_to)}</p>` : ''}
                    <pre>${escapeHtml(message.content_text)}</pre>
                    <div class="admin-actions">
                        <form method="post" action="/admin/messages/${message.id}/status">
                            <label>
                                <span>Statut</span>
                                <select name="status">${messageStatusOptions(message.status)}</select>
                            </label>
                            <button type="submit">Modifier</button>
                        </form>
                        <form method="post" action="/admin/messages/${message.id}/delete" onsubmit="return confirm('Supprimer ce message ?');">
                            <button class="danger" type="submit">Supprimer</button>
                        </form>
                    </div>
                </article>
            `).join('');

            res.type('html').send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de bord commandes - Maison Eclat Bijoux</title>
    <style>
        :root {
            --ink: #172026;
            --muted: #64748b;
            --line: #dbe3ef;
            --soft: #f3f6fb;
            --panel: #ffffff;
            --green: #0f766e;
            --gold: #b7791f;
            --red: #b91c1c;
            --shadow: 0 14px 34px rgba(15, 23, 42, 0.10);
        }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: linear-gradient(180deg, #eef4f8 0, #f8fafc 320px, #f5f7fb 100%);
            color: var(--ink);
            font-family: Arial, sans-serif;
        }
        main { width: min(1220px, calc(100% - 32px)); margin: 0 auto; padding: 26px 0 42px; }
        header {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            align-items: center;
            margin-bottom: 18px;
            padding: 22px;
            border: 1px solid rgba(15, 118, 110, 0.18);
            border-radius: 8px;
            background: #122127;
            color: #fff;
            box-shadow: var(--shadow);
        }
        h1 { margin: 0 0 6px; font-size: clamp(25px, 3vw, 36px); letter-spacing: 0; }
        h2 { margin: 0; font-size: 20px; }
        .summary { margin: 0; color: #cbd5e1; }
        .nav { display: flex; gap: 10px; flex-wrap: wrap; }
        .nav a {
            min-height: 38px;
            display: inline-flex;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, 0.28);
            border-radius: 6px;
            padding: 0 13px;
            color: #fff;
            text-decoration: none;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.08);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(5, minmax(150px, 1fr));
            gap: 12px;
            margin-bottom: 18px;
        }
        .stat {
            position: relative;
            overflow: hidden;
            min-height: 112px;
            padding: 16px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--panel);
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
        }
        .stat::before {
            content: "";
            position: absolute;
            inset: 0 auto 0 0;
            width: 5px;
            background: var(--green);
        }
        .stat:nth-child(3)::before { background: var(--gold); }
        .stat:nth-child(5)::before { background: var(--red); }
        .stat span { display: block; color: var(--muted); font-size: 13px; margin-bottom: 12px; }
        .stat strong { display: block; font-size: clamp(24px, 2.4vw, 32px); line-height: 1; }
        .dashboard-table,
        .order-card,
        .message-card,
        .empty {
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--panel);
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07);
        }
        .dashboard-table { margin-bottom: 22px; padding: 18px; }
        .dashboard-table h2 { margin-bottom: 14px; font-size: 22px; }
        .order-card, .message-card { margin-bottom: 16px; padding: 18px; }
        .order-head, .message-head {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            align-items: start;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 14px;
        }
        .label {
            margin: 0 0 5px;
            color: var(--green);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0;
            text-transform: uppercase;
        }
        .order-meta { text-align: right; display: grid; gap: 8px; justify-items: end; }
        .order-meta strong { font-size: 20px; color: #111827; }
        .order-meta span,
        .message-head > span,
        .customer-grid span { color: var(--muted); font-size: 13px; }
        .customer-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin: 14px 0;
        }
        .customer-grid p {
            min-height: 66px;
            margin: 0;
            display: grid;
            gap: 5px;
            align-content: center;
            overflow-wrap: anywhere;
            border: 1px solid #e8eef6;
            border-radius: 7px;
            padding: 11px;
            background: #f8fafc;
        }
        .admin-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .admin-actions form { display: flex; align-items: end; gap: 8px; flex-wrap: wrap; }
        .admin-actions label { display: grid; gap: 5px; color: var(--muted); font-size: 13px; }
        select, button {
            min-height: 38px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 11px;
            font: inherit;
            background: #fff;
        }
        button {
            color: #fff;
            border-color: var(--green);
            background: var(--green);
            font-weight: 800;
            cursor: pointer;
        }
        button.danger { border-color: var(--red); background: var(--red); }
        pre {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            line-height: 1.55;
            margin: 14px 0 0;
            border: 1px solid #e8eef6;
            border-radius: 7px;
            padding: 13px;
            background: #f8fafc;
        }
        .table-wrap { overflow-x: auto; border: 1px solid #e8eef6; border-radius: 8px; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 820px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        th {
            background: #eff6f6;
            color: #334155;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0;
        }
        tbody tr:nth-child(even) td { background: #fbfdff; }
        tbody tr:hover td { background: #f4f9f8; }
        tr:last-child td { border-bottom: 0; }
        .status-badge {
            display: inline-flex;
            align-items: center;
            min-height: 24px;
            border-radius: 999px;
            padding: 3px 9px;
            color: #075985;
            background: #e0f2fe;
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
        }
        .status-nouvelle, .status-enregistre { color: #92400e; background: #fef3c7; }
        .status-en-traitement, .status-lu { color: #075985; background: #e0f2fe; }
        .status-livree, .status-traite { color: #166534; background: #dcfce7; }
        .status-annulee, .status-archive { color: #991b1b; background: #fee2e2; }
        .section-title {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: end;
            margin: 28px 0 12px;
        }
        .section-title h2 { font-size: 24px; }
        .section-title span { color: var(--muted); font-weight: 700; }
        .empty { padding: 18px; color: var(--muted); }
        @media (max-width: 760px) {
            header, .order-head, .message-head, .section-title { display: grid; }
            .order-meta { text-align: left; }
            .order-meta { justify-items: start; }
            .customer-grid { grid-template-columns: 1fr; }
            .stats { grid-template-columns: 1fr; }
            main { width: min(100% - 20px, 1220px); padding-top: 14px; }
            header { padding: 18px; }
            .dashboard-table, .order-card, .message-card { padding: 14px; }
        }
    </style>
</head>
<body>
    <main>
        <header>
            <div>
                <h1>Tableau de bord commandes</h1>
                <p class="summary">${orders.length} commande(s) enregistree(s)</p>
            </div>
            <nav class="nav">
                <a href="/">Boutique</a>
                <a href="#messages">Messages</a>
            </nav>
        </header>
        <section class="stats" aria-label="Resume des commandes">
            <div class="stat"><span>Commandes stockees</span><strong>${orders.length}</strong></div>
            <div class="stat"><span>Produits commandes</span><strong>${totalProducts}</strong></div>
            <div class="stat"><span>Montant total</span><strong>${formatMoney(totalRevenue)}</strong></div>
            <div class="stat"><span>Messages recus</span><strong>${messages.length}</strong></div>
            <div class="stat"><span>Messages a traiter</span><strong>${unreadMessages}</strong></div>
        </section>
        <section class="dashboard-table">
            <h2>Produits commandes et coordonnees clients</h2>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Commande</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Telephone</th>
                            <th>Email</th>
                            <th>Adresse</th>
                            <th>Produit</th>
                            <th>Quantite</th>
                            <th>Prix</th>
                            <th>Sous-total</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>${productRows || '<tr><td colspan="11">Aucun produit commande pour le moment.</td></tr>'}</tbody>
                </table>
            </div>
        </section>
        <div class="section-title">
            <h2>Commandes a gerer</h2>
            <span>${orders.length} commande(s)</span>
        </div>
        ${orderRows || '<p class="empty">Aucune commande pour le moment.</p>'}
        <section id="messages">
            <div class="section-title">
                <h2>Messages recus</h2>
                <span>${messages.length} message(s)</span>
            </div>
            ${messageRows || '<p class="empty">Aucun message pour le moment.</p>'}
        </section>
    </main>
</body>
</html>`);
        };

        if (orders.length === 0) {
            renderPage(new Map());
            return;
        }

        const placeholders = orders.map(() => '?').join(',');
        const orderIds = orders.map((order) => order.id);

        db.all(
            `SELECT * FROM commande_articles WHERE commande_id IN (${placeholders}) ORDER BY id`,
            orderIds,
            (articlesErr, articles) => {
                if (articlesErr) {
                    res.status(500).type('text/plain').send(articlesErr.message);
                    return;
                }

                const articlesByOrder = new Map();
                articles.forEach((article) => {
                    if (!articlesByOrder.has(article.commande_id)) {
                        articlesByOrder.set(article.commande_id, []);
                    }
                    articlesByOrder.get(article.commande_id).push(article);
                });

                renderPage(articlesByOrder);
            }
        );
        });
    });
});

app.get('/admin/messages', (req, res) => {
    db.all('SELECT * FROM messages_recus ORDER BY id DESC LIMIT 100', [], (err, rows) => {
        if (err) {
            res.status(500).type('text/plain').send(err.message);
            return;
        }

        const messages = rows.map((message) => `
            <article class="message">
                <div class="message-head">
                    <h2>${escapeHtml(message.subject)}</h2>
                    <span>${escapeHtml(message.status)} - ${escapeHtml(message.created_at)}</span>
                </div>
                ${message.reply_to ? `<p><strong>Repondre a:</strong> ${escapeHtml(message.reply_to)}</p>` : ''}
                <pre>${escapeHtml(message.content_text)}</pre>
            </article>
        `).join('');

        res.type('html').send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages recus - Maison Eclat Bijoux</title>
    <style>
        body { margin: 0; background: #f7fafc; color: #2d3748; font-family: Arial, sans-serif; }
        main { width: min(980px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0; }
        header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 18px; }
        h1 { margin: 0; font-size: 30px; }
        nav a { color: #0f766e; text-decoration: none; font-weight: 700; }
        .message { margin-bottom: 16px; padding: 18px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-shadow: 0 2px 8px rgba(30, 58, 95, 0.12); }
        .message-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        h2 { margin: 0; font-size: 18px; }
        span { color: #718096; font-size: 13px; }
        pre { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
        .empty { padding: 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; }
    </style>
</head>
<body>
    <main>
        <header>
            <h1>Messages et commandes recus</h1>
            <nav><a href="/admin/orders">Tableau commandes</a></nav>
        </header>
        ${messages || '<p class="empty">Aucun message pour le moment.</p>'}
    </main>
</body>
</html>`);
    });
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
function startServer(port, attemptsLeft = MAX_PORT_ATTEMPTS) {
    const server = app.listen(port, () => {
        console.log(`Serveur e-commerce demarre sur http://localhost:${port}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && attemptsLeft > 1) {
            const nextPort = port + 1;
            console.log(`Le port ${port} est deja utilise. Nouvel essai sur le port ${nextPort}...`);
            startServer(nextPort, attemptsLeft - 1);
            return;
        }

        console.error('Impossible de demarrer le serveur:', error.message);
        process.exit(1);
    });
}

if (require.main === module) {
    startServer(PORT);
}

module.exports = app;
