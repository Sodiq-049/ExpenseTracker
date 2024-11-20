const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON } = require('./utils');

const EXPENSES_FILE = path.join(__dirname, 'data', 'expenses.json');

const getAllExpenses = (res) => {
  readJSON(EXPENSES_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }
  });
};

const getExpenseById = (id, res) => {
  readJSON(EXPENSES_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    } else {
      const expense = data.find(exp => exp.id === id);
      if (expense) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Expense not found' }));
      }
    }
  });
};

const addExpense = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const newExpense = JSON.parse(body);
    newExpense.id = Math.random().toString(36).substring(2, 9); // Generate a random ID

    readJSON(EXPENSES_FILE, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server Error' }));
      } else {
        data.push(newExpense);
        writeJSON(EXPENSES_FILE, data, err => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Server Error' }));
          } else {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newExpense));
          }
        });
      }
    });
  });
};

const updateExpense = (req, id, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const updatedExpense = JSON.parse(body);
    
    readJSON(EXPENSES_FILE, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server Error' }));
      } else {
        const index = data.findIndex(exp => exp.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updatedExpense };
          writeJSON(EXPENSES_FILE, data, err => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Server Error' }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data[index]));
            }
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Expense not found' }));
        }
      }
    });
  });
};

const deleteExpense = (id, res) => {
  readJSON(EXPENSES_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    } else {
      const updatedData = data.filter(exp => exp.id !== id);
      if (updatedData.length === data.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Expense not found' }));
      } else {
        writeJSON(EXPENSES_FILE, updatedData, err => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Server Error' }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Expense deleted successfully' }));
          }
        });
      }
    }
  });
};

module.exports = { getAllExpenses, getExpenseById, addExpense, updateExpense, deleteExpense };
