const http = require('http');
const fs = require('fs');
const path = require('path');

const boundary = 'TestBoundary123456';
const filePath = path.join(__dirname, '..', 'public', 'images', 'hero', 'emplyee.jpg');

if (!fs.existsSync(filePath)) {
    console.log('Test file not found:', filePath);
    process.exit(1);
}

const fileData = fs.readFileSync(filePath);
console.log('Test file size:', (fileData.length / 1024).toFixed(1), 'KB');

// Build multipart form data
const parts = [];
parts.push(`--${boundary}\r\n`);
parts.push('Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n');
parts.push('Content-Type: image/jpeg\r\n');
parts.push('\r\n');
const header = Buffer.from(parts.join(''));

const folderPart = Buffer.from(
    `\r\n--${boundary}\r\n` +
    'Content-Disposition: form-data; name="folder"\r\n' +
    '\r\n' +
    'hero\r\n' +
    `--${boundary}--\r\n`
);

const body = Buffer.concat([header, fileData, folderPart]);
console.log('Total request body size:', (body.length / 1024).toFixed(1), 'KB');

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/upload',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);

        if (res.statusCode === 200) {
            console.log('\n✅ Upload API is working correctly!');
        } else {
            console.log('\n❌ Upload API FAILED with status:', res.statusCode);
        }
    });
});

req.on('error', (e) => {
    console.log('Connection error:', e.message);
    console.log('Make sure the dev server is running on port 3000');
});

req.write(body);
req.end();
