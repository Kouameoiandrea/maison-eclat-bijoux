const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

loadEnvFile();

const settings = {
    host: cleanMailEnvValue(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    user: cleanMailEnvValue(process.env.SMTP_USER),
    pass: normalizeSmtpPassword(cleanMailEnvValue(process.env.SMTP_PASS)),
    to: cleanMailEnvValue(process.env.MAIL_TO) || cleanMailEnvValue(process.env.SMTP_USER),
    from: buildMailFrom(cleanMailEnvValue(process.env.MAIL_FROM), cleanMailEnvValue(process.env.SMTP_USER))
};

main().catch((error) => {
    console.error('Echec du test email:');
    console.error(formatEmailError(error));
    process.exit(1);
});

async function main() {
    validateSettings();

    const transporter = nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth: {
            user: settings.user,
            pass: settings.pass
        }
    });

    await transporter.verify();

    const info = await transporter.sendMail({
        from: settings.from,
        to: settings.to,
        subject: 'Test email - Maison Eclat Bijoux',
        text: [
            'Bonjour,',
            '',
            'Ceci est un email de test envoye depuis le serveur Maison Eclat Bijoux.',
            'Si vous le recevez, la configuration SMTP fonctionne.'
        ].join('\n')
    });

    console.log(`Email de test envoye vers ${settings.to}.`);
    console.log(`Message ID: ${info.messageId}`);
}

function validateSettings() {
    const required = ['host', 'user', 'pass', 'to', 'from'];
    const missing = required.filter((key) => !settings[key]);

    if (missing.length) {
        throw new Error([
            `Configuration email incomplete: ${missing.join(', ')}.`,
            'Dans .env, remplacez au minimum SMTP_USER et SMTP_PASS par de vraies valeurs SMTP.',
            'Avec Gmail, SMTP_PASS doit etre un mot de passe d application Google.',
            'Avec Brevo, SMTP_PASS doit etre la cle SMTP Brevo.'
        ].join(' '));
    }

    const values = [settings.user, settings.pass, settings.to, settings.from];
    if (values.some(isExampleValue)) {
        throw new Error('Le fichier .env contient encore des valeurs exemple. Remplacez SMTP_USER, SMTP_PASS, MAIL_FROM et MAIL_TO.');
    }
}

function isExampleValue(value) {
    return /votre-|your-|example|mot-de-passe-app/i.test(String(value || ''));
}

function cleanMailEnvValue(value) {
    const text = String(value || '').trim();
    return isExampleValue(text) ? '' : text;
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

function formatEmailError(error) {
    const message = String(error && error.message ? error.message : error);
    const code = String(error && error.code ? error.code : '');
    const response = String(error && error.response ? error.response : '');

    if (code === 'EAUTH' || /invalid login|535|authentication/i.test(`${message} ${response}`)) {
        return [
            'Gmail refuse la connexion SMTP: identifiants invalides.',
            'Verifiez ces points:',
            '- SMTP_USER doit etre votre adresse Gmail complete.',
            '- SMTP_PASS doit etre un mot de passe d application Google, pas votre mot de passe Gmail normal.',
            '- La validation en deux etapes doit etre activee sur le compte Google.',
            '- MAIL_FROM doit utiliser la meme adresse que SMTP_USER, sauf alias Gmail configure.',
            'Si Gmail bloque encore, utilisez Brevo avec SMTP_HOST=smtp-relay.brevo.com et une cle SMTP Brevo.',
            `Detail SMTP: ${message}`
        ].join('\n');
    }

    return message;
}

function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');

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
