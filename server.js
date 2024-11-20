const http = require('http');
const fs = require('fs');
const url = require('url');
const { v4: uuidv4 } = require('uuid'); // to generate unique ids for each expense

// Reading the existing expenses from the JSON file
const readExpenses = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('expenses.json', 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // If file does not exist, resolve with an empty array
                    resolve([]);
                } else {
                    reject(err);
                }
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
};

// Saving the updated expenses to the JSON file
const writeExpenses = (expenses) => {
    return new Promise((resolve, reject) => {
        fs.writeFile('expenses.json', JSON.stringify(expenses, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Create server
const server = http.createServer(async (req, res) => {
    const { method, url: requestUrl } = req;
    const parsedUrl = url.parse(requestUrl, true);

    // Allow CORS for testing in Postman
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // GET - Retrieve all expenses
        if (method === 'GET' && parsedUrl.pathname === '/api/expenses') {
            const expenses = await readExpenses();
            res.writeHead(200);
            res.end(JSON.stringify(expenses));

        // POST - Create a new expense
        } else if (method === 'POST' && parsedUrl.pathname === '/api/expenses') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                console.log('Received body:', body); // Log the received body

                if (!body) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'No data received' }));
                    return;
                }

                try {
                    const newExpense = JSON.parse(body);
                    newExpense.id = uuidv4(); // Generate a unique ID
                    const expenses = await readExpenses();
                    expenses.push(newExpense);
                    await writeExpenses(expenses);

                    res.writeHead(201);
                    res.end(JSON.stringify(newExpense));
                } catch (err) {
                    console.error('Error parsing JSON:', err); // Log the error
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                }
            });

        // PUT - Update an existing expense
        } else if (method === 'PUT' && parsedUrl.pathname.startsWith('/api/expenses/')) {
            const id = parsedUrl.pathname.split('/')[3];
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                console.log('Received body:', body); // Log the received body

                if (!body) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'No data received' }));
                    return;
                }

                try {
                    const updatedExpenseData = JSON.parse(body);
                    const expenses = await readExpenses();
                    const expenseIndex = expenses.findIndex(exp => exp.id === id);

                    if (expenseIndex === -1) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Expense not found' }));
                    } else {
                        expenses[expenseIndex] = { ...expenses[expenseIndex], ...updatedExpenseData };
                        await writeExpenses(expenses);

                        res.writeHead(200);
                        res.end(JSON.stringify(expenses[expenseIndex]));
                    }
                } catch (err) {
                    console.error('Error parsing JSON:', err); // Log the error
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                }
            });

        // DELETE - Delete an expense
        } else if (method === 'DELETE' && parsedUrl.pathname.startsWith('/api/expenses/')) {
            const id = parsedUrl.pathname.split('/')[3];
            const expenses = await readExpenses();
            const filteredExpenses = expenses.filter(exp => exp.id !== id);

            if (expenses.length === filteredExpenses.length) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Expense not found' }));
            } else {
                await writeExpenses(filteredExpenses);
                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Expense deleted' }));
            }

        // If the endpoint is not found
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }

    } catch (err) {
        console.error('Server error:', err); // Log the server error
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Server error' }));
    }
});

// Server is running on port 5000
server.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});