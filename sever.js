const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    // Handle GET request
    if (url === '/shopping-list' && method === 'GET') {
        const shoppingList = readShoppingList();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(shoppingList));

    // Handle POST request
    } else if (url === '/shopping-list' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
        req.on('end', () => {
            const newItem = JSON.parse(body);
            if (!newItem.name || !newItem.quantity || newItem.quantity <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid item data' }));
            }
            const shoppingList = readShoppingList();
            shoppingList.push(newItem);
            writeShoppingList(shoppingList);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newItem));
        });

    // Handle PUT/PATCH request
    } else if (url.startsWith('/shopping-list/') && (method === 'PUT' || method === 'PATCH')) {
        const id = url.split('/')[2]; // Extract ID from the URL
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedItem = JSON.parse(body);
            const shoppingList = readShoppingList();
            const index = shoppingList.findIndex(item => item.id === id);
            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Item not found' }));
            }
            if (updatedItem.name) shoppingList[index].name = updatedItem.name;
            if (updatedItem.quantity && updatedItem.quantity > 0) shoppingList[index].quantity = updatedItem.quantity;
            writeShoppingList(shoppingList);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(shoppingList[index]));
        });

    // Handle DELETE request
    } else if (url.startsWith('/shopping-list/') && method === 'DELETE') {
        const id = url.split('/')[2]; // Extract ID from the URL
        const shoppingList = readShoppingList();
        const index = shoppingList.findIndex(item => item.id === id);
        if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Item not found' }));
        }
        shoppingList.splice(index, 1);
        writeShoppingList(shoppingList);
        res.writeHead(204);
        res.end();

    // Handle invalid routes
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
