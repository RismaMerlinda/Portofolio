const http = require('http');

const data = JSON.stringify({
    name: "Test User From Script",
    email: "testscript@example.com",
    message: "This is a test message to verify the API is working and saving to Atlas."
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/contact',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE:', body);
        if (res.statusCode === 201) {
            console.log("✅ SUCCESS! Message sent to backend. Check MongoDB Compass!");
        } else {
            console.log("❌ FAILED! Backend returned an error.");
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ CONNECTION ERROR: Is the server running? Details: ${e.message}`);
});

req.write(data);
req.end();
console.log("Sending request...");
