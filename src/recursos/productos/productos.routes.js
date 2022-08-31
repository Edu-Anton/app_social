const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');


const productos = require('../../database').productos;
const validarProducto = require('./productos.validate');
const log = require('./../../utils/logger');
const productosRouter = express.Router();



productosRouter.get('/', (req, res) => {
    res.json(productos);
})

productosRouter.post('/', validarProducto, (req, res) => {
    const newProduct = req.body;
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

productosRouter.put('/:id', validarProducto, (req, res) => {
    const { id } = req.params;
    const replacementProduct = req.body;

    const index = _.findIndex(productos, producto => producto.id == id);

    if (index !== -1) {
        replacementProduct.id = id;
        productos[index] = replacementProduct;
        log.info(`Producto con id [${id}] reemplazado con nuevo producto`, replacementProduct);
        res.status(200).json(replacementProduct);
    } else {
        res.status(404).send(`el producto con id ${req.params.id} no existe`);
    }
})

productosRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = _.findIndex(productos, producto => producto.id == id);
    if ( index === -1 ) {
        log.warn(`el producto con id ${req.params.id} no existe. Nada que borrar`);
        res.status(404).send(`el producto con id ${req.params.id} no existe. Nada que borrar`);
        return
    }
    const deletedProduct = productos.splice(index, 1); 
    res.json(deletedProduct);
});

module.exports = productosRouter;