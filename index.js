//const express = require('express');
//const http = require('http');
//const socketio = require('socket.io');
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const port = process.env.PORT || 80;
const app = express(); 
const server = http.createServer(app);
const io = new Server(server);

console.log("NODE_ENV: " + process.env.NODE_ENV);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log("S'ha connectat algú");
  socket.on('chat message', (msg) => {
    console.log("algú ha enviat: " + msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log("S'ha desconnectat");
  });
});


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
