const express = require('express');
const app = express();
const morgan = require('morgan');
const _ = require('underscore');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;


const productos = require('./database');
const productosRouter = require('./recursos/productos/productos.routes');
const usuariosRouter = require('./recursos/usuarios/usuarios.routes');
const logger = require('./utils/logger');
// const auth = require('./libs/auth');
const authJWT = require('./libs/auth');
const config = require('./config');

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

// routes
app.use('/productos', productosRouter);
app.use('/usuarios', usuariosRouter);

// app.get('/', passport.authenticate('basic', { session: false}), (req, res) => {
app.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
    logger.info(req.user.username);
    console.log(req.user);
    res.send('API de anton')
});

app.listen(config.jwt.puerto, () => {
    logger.info('Escuchando en el puerto 3000');
});