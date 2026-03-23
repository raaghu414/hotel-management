const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return { users: [], rooms: [], reservations: [], menu: [], orders: [], events: [], reviews: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing data:", err);
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') filePath = './index.html';

    // API Routes
    if (parsedUrl.pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        const data = readData();

        if (parsedUrl.pathname === '/api/rooms' && req.method === 'GET') {
            res.end(JSON.stringify(data.rooms));
            return;
        }

        if (parsedUrl.pathname === '/api/menu' && req.method === 'GET') {
            res.end(JSON.stringify(data.menu));
            return;
        }

        if (parsedUrl.pathname === '/api/reservations' && req.method === 'GET') {
            res.end(JSON.stringify(data.reservations));
            return;
        }

        if (parsedUrl.pathname === '/api/reservations' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const newReservation = JSON.parse(body);
                newReservation.id = 'res' + Date.now();
                
                // Update room status
                const roomIndex = data.rooms.findIndex(r => r.id === newReservation.roomId);
                if (roomIndex !== -1) {
                    data.rooms[roomIndex].status = 'Occupied';
                }

                data.reservations.push(newReservation);
                writeData(data);
                res.end(JSON.stringify({ success: true, reservation: newReservation }));
            });
            return;
        }

        if (parsedUrl.pathname === '/api/login' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const { username, password } = JSON.parse(body);
                const user = data.users.find(u => u.username === username && u.password === password);
                if (user) {
                    res.end(JSON.stringify({ success: true, user: { name: user.name, role: user.role } }));
                } else {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
                }
            });
            return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ message: "API route not found" }));
        return;
    }

    // Static File Serving
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('File not found');
            } else {
                res.statusCode = 500;
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
