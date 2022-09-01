const _ = require('underscore');
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');

const usuarios = require('./../database').usuarios;
const log = require('./../utils/logger');
const config = require('../config');

const jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken() // El token se busca en el objeto de header del req
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    const index = _.findIndex(usuarios, usuario => usuario.id === jwtPayload.id);

    if (index === -1) {
        log.info(`JWT token no es válido. Usuario con id ${jwtPayload.id} no existe`);
        next(null, false);
    } else {
        log.info(`Usuario ${usuarios[index].username} suministro de token valido. Autenticación completada.`);
        next(null, {
            username: usuarios[index].username,
            id: usuarios[index].id
        })
    }
})

// module.exports = (username, password, done) => {

    // const index = _.findIndex(usuarios, usuario => usuario.username === username)

    // if (index === -1) {
    //     log.info(`Usuario ${username} no existe. No pudo ser autenticado.`);
    //     done(null, false);
    //     return
    // }
    // const hashedPassword = usuarios[index].password
    // bcrypt.compare(password, hashedPassword, (err, iguales) => {
    //     if (iguales) {
    //         log.info(`Usuario ${username} completó autenticación.`)
    //         done(null, true);
    //     } else {
    //         log.info(`Usuario ${username} no completó autenticación. Contraseña incorrecta.`);
    //         done(null, false);
    //     }
    // })

    // if (username.valueOf() === 'anton' && passport.valueOf() === 'pro') {
    //     return done(null, true);
    // } else {
    //     return done(null, false); // null para indicar errores
    // }
// }