const express = require('express');
const app = express();
const _ = require('underscore');
const productos = require('./database');

const productosRouter = require('./recursos/productos/productos.routes');

// middlewares
app.use(express.json()); //que todos los request 

// routes
app.use('/productos', productosRouter);

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});