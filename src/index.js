const express = require('express');
const app = express();
const morgan = require('morgan');
const _ = require('underscore');
const productos = require('./database');

const productosRouter = require('./recursos/productos/productos.routes');
const logger = require('./utils/logger');

// middlewares
app.use(express.json()); //que todos los request 
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}));

// routes
app.use('/productos', productosRouter);

app.listen(3000, () => {
    logger.info('Escuchando en el puerto 3000');
});