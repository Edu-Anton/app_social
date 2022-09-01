const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');
const passport = require('passport');

const productos = require('../../database').productos;
const validarProducto = require('./productos.validate');
const log = require('./../../utils/logger');
const productosRouter = express.Router();

const jwtAuthenticate = passport.authenticate('jwt', { session: false}) // como si fuera un middleware

productosRouter.get('/', (req, res) => {
    res.json(productos);
})

productosRouter.post('/', [jwtAuthenticate, validarProducto], (req, res) => {
    const newProduct = {
        ...req.body,
        id: uuidv4(),
        dueño: req.user.username
    };
    // if (!newProduct.moneda || !newProduct.precio || !newProduct.titulo) {
    //     // Bad Request
    //     res.status(400).send('Tu producto debe especificar un título, precio y moneda');
    //     return;
    // }
    newProduct.id = uuidv4(); 
    productos.push(newProduct);
    log.info("Producto agregado a la colección de productos", newProduct);
    res.status(201).json(newProduct);
});


productosRouter.get('/:id', (req, res) => {
    for (let producto of productos) {
        if (producto.id == req.params.id) { // ver el tema de doble igualdad y triple igualdad
            res.json(producto)
            return
        }
    }
    res.status(404).send(`el producto con id ${req.params.id} no existe`);
})

productosRouter.put('/:id', [jwtAuthenticate, validarProducto], (req, res) => {
    // const { id } = req.params;
    const replacementProduct = {
        ...req.body,
        id: req.params.id,
        dueño: req.user.username
    };

    const index = _.findIndex(productos, producto => producto.id == replacementProduct.id);

    if (index !== -1) {
        // replacementProduct.id = id;

        if (productos[index].dueño !== replacementProduct.dueño){
            log.info(`Usuario ${req.user.username} no es dueño de producto con id ${replacementProduct.id}.`)
            res.status(401).send(`No eres dueño del producto con id ${replacementProduct.id}. Sólo puedes modificar productos creados por tí`);
            return
        }

        productos[index] = replacementProduct;
        log.info(`Producto con id [${replacementProduct.id}] reemplazado con nuevo producto`, replacementProduct);
        res.status(200).json(replacementProduct);
    } else {
        res.status(404).send(`el producto con id ${replacementProduct.id} no existe`);
    }
})

productosRouter.delete('/:id', jwtAuthenticate, (req, res) => {
    const { id } = req.params;
    const index = _.findIndex(productos, producto => producto.id == id);
    if ( index === -1 ) {
        log.warn(`el producto con id ${req.params.id} no existe. Nada que borrar`);
        res.status(404).send(`el producto con id ${req.params.id} no existe. Nada que borrar`);
        return
    }

    if (productos[index].dueño !== req.user.dueño){
        log.info(`Usuario ${req.user.username} no es dueño de producto con id ${productos[index].id}.`)
        res.status(401).send(`No eres dueño del producto con id ${productos[index].id}. Sólo puedes borrar productos creados por tí`)
        return
    }

    log.info(`Producto con id [${req.params.id}] fue borrado.`)
    const deletedProduct = productos.splice(index, 1); 
    res.json(deletedProduct);
});

module.exports = productosRouter;