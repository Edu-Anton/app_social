const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');
const passport = require('passport');

const log = require('./../../utils/logger');
const { ProductoNoExiste, UsuarioNoEsDueño } = require('./productos.error')
const procesarErrores = require('../../libs/errorHandler').procesarErrores;
const productoController = require('./productos.controller'); 
const validarProducto = require('./productos.validate');

const productosRouter = express.Router();

const jwtAuthenticate = passport.authenticate('jwt', { session: false}) // como si fuera un middleware

// Middleware
function validarId(req, res, next) {
    let id = req.params.id
    //regex
    if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
        res.status(400).send(`El id [${id}] suministrado en el URL no es válido`)
        return
    }
    next()
}

productosRouter.get('/', procesarErrores((req, res) => {
    return productoController.obtenerProductos()
        .then(productos => {
            res.json(productos);
        })
        // .catch(err => {
        //     res.status(500).send('Error al leer los productos de la base de datos.');
        // })
}))

productosRouter.get('/:id', validarId, procesarErrores((req, res) => {
    const { id } = req.params;
    return productoController.obtenerProducto(id) 
        .then(producto => {
            if (!producto) { //Manejo de error de que no existe el producto
                res.sendStatus(404).send(`Producto con id [${id}] no existe.`)
                throw new ProductoNoExiste(`Producto con id [${id}] no existe.`)
            } // else {
                res.json(producto);
            // }
        })
        .catch(err => {
            log.error(`Excepción ocurrió al tratar de obtener producto con id [${id}]`, err)
            res.status(500).send(`Error ocurrió obteniendo producto con id [${id}]`)
        })
}));

productosRouter.post('/', [jwtAuthenticate, validarProducto], procesarErrores((req, res) => {
    
    const owner = req.user.username
    // console.log({...req.body, owner});
    return productoController.crearProducto(req.body, owner)
        .then(producto => {
            log.info('Producto agregado a la colección producto.', producto.toObject());
            res.status(201).json(producto)
        })
        // .catch(err => {
        //     log.error('Producto no puedo ser creado', err);
        //     res.status(500).send('Error ocurrió al tratar de crear el producto.');
        // })
}));

productosRouter.put('/:id', [jwtAuthenticate, validarProducto], procesarErrores(async (req, res) => {
    
    let {id} = req.params
    let requestUsuario = req.user.username
    let productoAReeemplazar

    // try {
        productoAReeemplazar = await productoController.obtenerProducto(id)
    // } catch (error) {
    //     log.warn(`Excepción ocurrió al procesar modificación del producto con id [${id}]`, error)
    //     res.status(500).send(`Error ocurrió modificando producto con id [${id}]`)
    //     return
    // }    
    
    if (!productoAReeemplazar) {
        throw new ProductoNoExiste(`El producto con id [${id}] no existe.`)
        // return
    }

    if (productoAReeemplazar.dueño !== requestUsuario) {
        log.warn(`Usuario [${requestUsuario}] no es dueño del producto con id [${id}]. Dueño real es [${productoAReeemplazar.dueño}]. Request no será procesado.`)
        throw new UsuarioNoEsDueño(`No eres dueño del producto con id [${id}]. Sólo puedes modificar productos creados por tí`);
        // return
    }

    productoController.reemplazarProducto(id, req.body, requestUsuario)
        .then(producto => {
            res.json(producto)
            log.info(`Producto con id [${id}] reemplazado con nuevo producto`, producto.toObject()) //toObject función para obtener las propiedades
        })
        // .catch(err => {
        //     log.error(`Excepción al tratar de reemplazar producto con id [${id}]`, err)
        //     res.status(500).send(`Error ocurrió reemplazando producto con id [${id}]`)
        // })
}))

productosRouter.delete('/:id', [jwtAuthenticate, validarId], procesarErrores(async(req, res) => {
    const { id } = req.params;
    let productoABorrar

    // try {
        productoABorrar = await productoController.obtenerProducto(id)
    // } catch (error) {
    //     log.error(`Excepción ocurrió al procesar el borrado de producto con id [${id}]`, err)
    //     res.status(500).send(`Error ocurrió borrando producto con id [${id}]`)
    //     return
    // }

    if ( !productoABorrar ) {
        log.info(`el producto con id ${id} no existe. Nada que borrar`);
        throw new ProductoNoExiste(`el producto con id ${id} no existe. Nada que borrar`);
        // return
    }

    let usuarioAutenticado = req.user.username
    if (productoABorrar.dueño !== usuarioAutenticado){
        log.info(`Usuario ${usuarioAutenticado} no es dueño de producto con id [${id}]. Dueño real es ${productoABorrar.dueño}. Request no será procesado.`)
        throw new UsuarioNoEsDueño(`No eres dueño del producto con id [${id}]. Sólo puedes borrar productos creados por tí.`)
        // return
    }

    // try {
        let productoBorrado = await productoController.borrarProducto(id)
        log.info(`Producto con id [${id}] fue borrado.`)
        res.json(productoBorrado);
    // } catch (error) {
    //     res.status(500).send(`Error ocurrió borrando producto con id [${id}]`)   
    // }
}));

module.exports = productosRouter;