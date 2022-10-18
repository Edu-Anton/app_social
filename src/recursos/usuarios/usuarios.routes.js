const express = require('express');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const config = require('../../config');
const { DatosDeUsuarioYaEnUso, CredencialesIncorrectas } = require('./usuario.error')
const log = require('./../../utils/logger');
const procesarErrores = require('../../libs/errorHandler').procesarErrores;
const usuarioController = require('./usuarios.controller');
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin;
const validarUsuario = require('./usuarios.validate').validarUsuario;

const usuariosRouter = express.Router();

// middlewares
function transformarBodyALowercase(req, res, next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

usuariosRouter.get('/', procesarErrores((req, res) => {
    return usuarioController.obtenerUsuarios()
        .then(usuarios => {
            res.json(usuarios)
        })
        // .catch(error => {
        //     log.error('Error al obtener todos los usuarios', error)
        //     res.sendStatus(500)
        // })
}));

usuariosRouter.post('/', [validarUsuario, transformarBodyALowercase], procesarErrores((req, res) => {
    const newUser = req.body;

    return usuarioController.usuarioExiste(newUser.username, newUser.email)
        .then(usuarioExiste => {
            if (usuarioExiste) {
                log.warn(`Email [${newUser.email}] o username [${newUser.username}] ya existen en la base de datos.`);
                // res.status(409).send('El email o usuario ya están asociados a una cuenta.')
                // return
                throw new DatosDeUsuarioYaEnUso();
            }

            // bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
            //     if (err) {
            //         log.error('Error ocurrió al tratar de obtener el hash de una contaseña.', err);
            //         res.status(500).send('Ocurrió un error procesando creación del usuario.');
            //         return
            //     } 
            return bcrypt.hash(newUser.password, 10);
        })
        .then((hash) => {
            return usuarioController.crearUsuario(newUser, hash)
                .then(newUser => {
                    res.status(201).send('Usuario creado exitósamente.');
                })
                // .catch(err => {
                //     log.error("Error ocurrió al tratar de crear nuevo usuario", err)
                //     res.status(500).send('Error ocurrió al tratar de crear nuevo usuario')
                // })
        })
                
            // })
        // })
        // .catch(error => {
        //     log.error(`Error ocurrió al tratar de verificar si usuario [${newUser.username}] con email [${newUser.email}] ya existe.`)
        //     res.status(500).send("Error ocurrió al tratar de crear nuevo usuario.")
        // })
}));

usuariosRouter.post('/login', [validarPedidoDeLogin, transformarBodyALowercase], procesarErrores(async(req, res) => {
    const usuarioNoAutenticado = req.body;

    // try {
        usuarioRegistrado = await usuarioController.obtenerUsuario({
            username: usuarioNoAutenticado.username
        })
    // } catch (error) {
    //     log.error(`Error ocurrió al tratar de determinar si el usuario [${usuarioNoAutenticado.username}] ya existe, err`)
    //     res.status(500).send('Error ocurrió durante el proceso de login.')
    //     return
    // }

    if (!usuarioRegistrado) {
        log.info(`Usuario [${usuarioNoAutenticado.username}] no existe. No pudo ser autenticado.`)
        // res.status(400).send('Credenciales incorrectas. Asegúrate que el usuario y contraseña sean correctos.')
        // return
        throw new CredencialesIncorrectas();
    }

    let contraseñaCorrecta
    // try {
        contraseñaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password, usuarioRegistrado.password)
    // } catch (err) {
    //     log.error(`Error ocurrió al tratar de verificar si la contraseña es correcta`, err)
    //     res.status(500).send('Error ocurrió durante el proceso de login.')
    //     return
    // }

    if (contraseñaCorrecta) {
        // generar y enviar token
        const token = jwt.sign({ id: usuarioRegistrado.id }, config.jwt.secreto, { expiresIn: 86400 })
        log.info(`Usuario ${usuarioNoAutenticado.username} completó autenticación exitosamente.`)
        res.status(200).json({ token })
    } else {
        log.info(`Usuario ${usuarioNoAutenticado.username} no completó autenticación. Contraseña incorrecta.`);
        log.warn(err);
        // res.status(400).send('Credenciales incorrectas. Asegúrate que el username y contraseña sean correctas.');
        throw new CredencialesIncorrectas();
    }
}));

module.exports = usuariosRouter;