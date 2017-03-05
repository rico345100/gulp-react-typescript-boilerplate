"use strict";
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/build'));
app.get('/', (req, res) => res.sendFile(__dirname + '/build/html/index.html'));

app.get('/api', (req, res) => res.json({ message: 'helloworld' }));

app.listen(3000, () => console.log('Express Server listen at port 3000...'));