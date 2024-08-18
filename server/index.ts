import express, { Request, Response } from 'express';
import * as cors from 'cors';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const messages: string[] = [];
const MAX_MESSAGES = 9;

const wss = new WebSocket.Server({ noServer: true });

app.post('/messages', (req: Request, res: Response) => {
    const { message } = req.body;
    if (typeof message !== 'string') {
        return res.status(400).send('Message content is required');
    }

    if (messages.length >= MAX_MESSAGES) {
        const removedMessage = messages.shift(); // Remove the oldest message
        if (removedMessage) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'remove', message: removedMessage }));
                }
            });
        }
    }

    messages.push(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'add', message }));
        }
    });

    res.status(201).send('Message created');
});

app.get('/messages', (req: Request, res: Response) => {
    res.json(messages);
});

const server = http.createServer(app);

server.listen(8080, () => console.log('Server is running on port 8080'));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
