const _ = require('underscore');
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');

const log = require('./../utils/logger');
const config = require('../config');
const usuarioController = require('../recursos/usuarios/usuarios.controller')

const jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken() // El token se busca en el objeto de header del req
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    usuarioController.obtenerUsuario({id: jwtPayload.id})
        .then(usuario => {
            if (!usuario) {
                log.info(`JWT token no es válido. Usuario con id ${jwtPayload.id} no existe.`)
                next(null, false)
                return
            }
            log.info(`Usuario ${usuario.username} suministro de token valido. Autenticación completada.`);
            next(null, {
                username: usuario.username,
                id: usuario.id
            })
        })
        .catch(err => {
            log.error("Error ocurrió al tratar de validar un token.", err)
            next(err)
        })
})