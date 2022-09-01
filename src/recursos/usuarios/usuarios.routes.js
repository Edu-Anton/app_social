const express = require('express');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const config = require('../../config');
const log = require('./../../utils/logger');
const usuarios = require('../../database').usuarios;
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin;
const validarUsuario = require('./usuarios.validate').validarUsuario;

const usuariosRouter = express.Router();

usuariosRouter.get('/', (req, res) => {
    res.json(usuarios);
})

usuariosRouter.post('/', validarUsuario, (req, res) => {
    const newUser = req.body;
    const indice = _.findIndex(usuarios, usuario => {
        return usuario.username === newUser.username || usuario.email === newUser.email
    })

    if (indice !== -1) {
        log.info('Email o username ya existen en la base de datos');
        res.status(409).send('El email o username ya están asociados a una cuenta.');
        return
    }

    bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
        if (err) {
            log.error('Error ocurrió al tratar de obtener el hash de una contaseña.', err);
            res.status(500).send('Ocurrió un error procesando creación del usuario.');
            return
        }
        usuarios.push({
            username: newUser.username,
            email: newUser.email,
            password: hashedPassword,
            id: uuidv4()
        })
        res.status(201).send('Usuario creado exitósamente.');
    })
})

usuariosRouter.post('/login', validarPedidoDeLogin,(req, res) => {
    const usuarioNoAutenticado = req.body;
    const index = _.findIndex(usuarios, usuario => usuario.username === usuarioNoAutenticado.username);

    if (index === -1) {
        log.info(`Usuario ${usuarioNoAutenticado.username} no existe. No pudo ser autenticado.`);
        res.status(400).send('Credenciales incorrectas. El usuario no existe.');
        return
    }
    console.log(usuarios[index].username);
    console.log(usuarios[index].password);

    const hashedPassword = usuarios[index].password
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err, iguales) => {
        if (iguales) {
            log.info(`Usuario ${usuarioNoAutenticado.username} completó autenticación.`)
            // generar y enviar token
            const token = jwt.sign({ id: usuarios[index].id }, config.jwt.secreto, { expiresIn: 86400 })
            log.info(`Usuario ${usuarioNoAutenticado.username} completó autenticación exitosamente.`)
            res.status(200).json({ token })
        } else {
            log.info(`Usuario ${usuarioNoAutenticado.username} no completó autenticación. Contraseña incorrecta.`);
            log.warn(err);
            res.status(400).send('Credenciales incorrectas. Asegúrate que el username y contraseña sean correctas.');
        }
    })

})

module.exports = usuariosRouter;