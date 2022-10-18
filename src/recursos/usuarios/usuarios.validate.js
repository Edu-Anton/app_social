const Joi = require('joi');

// const usuarios = require('../../database').usuarios;
const log = require('./../../utils/logger');

const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
})

const validarUsuario = (req, res, next) => {
    const resultado = schema.validate(req.body, { abortEarly: false, convert: false })
    if (resultado.error  ===  undefined){
        next();
    } else {
        // Bad request
        resultado.error.details.map(error => error.message);
        console.log(req.body);
        log.info('Producto falló la validación', resultado.error.details.map(error => error.message));
        res.status(400).send('Información del usuario no cumple con los requisitos. El nombre del usuario debe ser alfanumérico y tener entre 3 y 30 carácteres. La constraseña debe tener entre 6 y 200 carácteres. Asegúrate que el email sea válido.')
    }
}

const loginSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
})

const validarPedidoDeLogin = (req, res, next) => {
    const resultado = loginSchema.validate(req.body, {abortEarly:false, convert: false})
    if (resultado.error === undefined) {
        next();
    }   else {
        res.status(400).send('Login falló. Debes especificar el username y contraseña del usuario. Ambos deben ser strings.')
    }
}

module.exports = {
    validarUsuario,
    validarPedidoDeLogin
}