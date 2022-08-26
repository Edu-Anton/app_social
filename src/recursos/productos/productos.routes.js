const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');

const productos = require('../../database').productos;
const productosRouter = express.Router();



productosRouter.get('/', (req, res) => {
    res.json(productos);
})

productosRouter.post('/', (req, res) => {
    const newProduct = req.body;
    if (!newProduct.moneda || !newProduct.precio || !newProduct.titulo) {
        // Bad Request
        res.status(400).send('Tu producto debe especificar un título, precio y moneda');
        return;
    }
    newProduct.id = uuidv4(); 
    productos.push(newProduct);
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

productosRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const replacementProduct = req.body;

    if (!replacementProduct.moneda || !replacementProduct.precio || !replacementProduct.titulo) {
        // Bad Request
        res.status(400).send('Tu producto debe especificar un título, precio y moneda');
        return;
    }

    const index = _.findIndex(productos, producto => producto.id == id);

    if (index !== -1) {
        replacementProduct.id = id;
        productos[index] = replacementProduct;
        res.status(200).json(replacementProduct);
    } else {
        res.status(404).send(`el producto con id ${req.params.id} no existe`);
    }
})

productosRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = _.findIndex(productos, producto => producto.id == id);
    if ( index === -1 ) {
        res.status(404).send(`el producto con id ${req.params.id} no existe`)
        return
    }
    const deletedProduct = productos.splice(index, 1); 
    res.json(deletedProduct);
});

module.exports = productosRouter;