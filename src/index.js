const express = require('express');
const app = express();
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
// const BasicStrategy = require('passport-http').BasicStrategy;


// const productos = require('./database');
const productosRouter = require('./recursos/productos/productos.routes');
const usuariosRouter = require('./recursos/usuarios/usuarios.routes');
const logger = require('./utils/logger');
// const auth = require('./libs/auth');
const authJWT = require('./libs/auth');
const config = require('./config');
const errorHandler = require('./libs/errorHandler');

// Authentication
// passport.use(new BasicStrategy(auth));
passport.use(authJWT);

app.use(passport.initialize());

// middlewares
app.use(express.json()); //que todos los request 
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}));

// Base de Datos
mongoose.connect('mongodb://localhost:27017/vendetuscorotos');
mongoose.connection.on('error', () => {
    logger.error('Falló la conexión a mongodb');
    process.exit(1);
})

// routes
app.use('/productos', productosRouter);
app.use('/usuarios', usuariosRouter);

app.use(errorHandler.procesarErroresDeBD);

if (config.ambiente === 'prod') {
    app.use(errorHandler.erroresEnProduccion)
} else {
    app.use(errorHandler.erroresEnDesarrollo)
}

// app.get('/', passport.authenticate('basic', { session: false}), (req, res) => {
app.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
    logger.info(req.user.username);
    console.log(req.user);
    res.send('API de anton')
});

app.listen(config.puerto, () => {
    logger.info('Escuchando en el puerto 3000');
});