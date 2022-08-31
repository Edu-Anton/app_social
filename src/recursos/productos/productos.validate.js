const Joi = require('joi');

const productos = require('../../database').productos;
const log = require('./../../utils/logger');

const schema = Joi.object().keys({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase()
})

const validarProducto = (req, res, next) => {
    const resultado = schema.validate(req.body, { abortEarly: false, convert: false});
    console.log(resultado.error);
    if (resultado.error === undefined) {
        next();
    } else {
        const erroresDeValidacion = resultado.error.details.reduce((acumulador, error) => {
            return acumulador + `[${error.message}]\n`
        }, '');
        log.warn('El siguiente producto no pasó la validación: ', req.body, erroresDeValidacion);
        res.status(400).send(`El producto en el body debe especificar título, precio, moneda. 
            Errores en tu request: 
            ${erroresDeValidacion}`
        );
    }
    // const resultado = Joi.validate(req.body, blueprintProducto);
    // console.log('resultado)
}

module.exports = validarProducto;