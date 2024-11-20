const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON } = require('./utils');

const USERS_FILE = path.join(__dirname, 'data', 'users.json'); // Path to users' data file

// Function to get all users
const getAllUsers = (res) => {
  readJSON(USERS_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }
  });
};

// Function to get a user by ID
const getUserById = (id, res) => {
  readJSON(USERS_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    } else {
      const user = data.find(u => u.id === id);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      }
    }
  });
};

// Function to add a new user
const addUser = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const newUser = JSON.parse(body);
    newUser.id = Math.random().toString(36).substring(2, 9); // Generate random ID for the user

    readJSON(USERS_FILE, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server Error' }));
      } else {
        data.push(newUser);
        writeJSON(USERS_FILE, data, err => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Server Error' }));
          } else {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
          }
        });
      }
    });
  });
};

// Function to update a user's information
const updateUser = (req, id, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const updatedUser = JSON.parse(body);

    readJSON(USERS_FILE, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server Error' }));
      } else {
        const index = data.findIndex(u => u.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updatedUser };
          writeJSON(USERS_FILE, data, err => {
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
          res.end(JSON.stringify({ message: 'User not found' }));
        }
      }
    });
  });
};

// Function to delete a user by ID
const deleteUser = (id, res) => {
  readJSON(USERS_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server Error' }));
    } else {
      const updatedData = data.filter(u => u.id !== id);
      if (updatedData.length === data.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      } else {
        writeJSON(USERS_FILE, updatedData, err => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Server Error' }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User deleted successfully' }));
          }
        });
      }
    }
  });
};

module.exports = { getAllUsers, getUserById, addUser, updateUser, deleteUser };
