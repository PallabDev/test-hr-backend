import { Client } from 'whatsapp-web.js';
import qrcode from "qrcode-terminal"
const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.on('message', message => {
    console.log(`Received message: ${message.body}`);
});

client.initialize();

export { client };