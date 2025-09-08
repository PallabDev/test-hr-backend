import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import path from 'path';
import fs from 'fs';
import qrcode from 'qrcode';
import { fileURLToPath } from 'url';

// Convert the module URL to a file path to get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // This navigates up one level from 'src'

const client = new Client({
    authStrategy: new LocalAuth({
        // This path is now relative to the project root
        dataPath: path.join(projectRoot, 'sessions')
    }),
    restartOnAuthFail: false,
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qrCode) => {
    console.log('QR code received. Please scan the QR code to authenticate.');

    // Define the path to save the QR code image, relative to the project root
    const qrDir = path.join(projectRoot, 'public', 'temp', 'qr');
    const qrPath = path.join(qrDir, 'qr.png');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate and save the QR code as a PNG file
    qrcode.toFile(qrPath, qrCode, (err) => {
        if (err) {
            console.error('Failed to generate QR code image:', err);
        } else {
            console.log(`QR code image saved to: ${qrPath}`);
        }
    });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    // Optional: Clean up the QR code image after a successful connection
    const qrPath = path.join(projectRoot, 'public', 'temp', 'qr', 'qr.png');
    if (fs.existsSync(qrPath)) {
        fs.unlink(qrPath, (err) => {
            if (err) console.error("Failed to delete QR code image:", err);
            else console.log('QR code image deleted.');
        });
    }
});

client.on('authenticated', (session) => {
    console.log('Authenticated successfully!');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected', reason);
});

client.initialize();

export { client };