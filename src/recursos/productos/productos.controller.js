const Producto = require('./productos.model');

function obtenerProductos() {
    return Producto.find({});
}

function obtenerProducto(id) {
    return Producto.findById(id)
}

function crearProducto(producto, dueño) {
    return new Producto({
        ...producto,
        dueño
    }).save()
}

function borrarProducto(id) {
    return Producto.findByIdAndRemove(id)
}

function reemplazarProducto(id, producto, username) {
    return Producto.findOneAndUpdate({ _id:id }, {
        ...producto,
        dueño: username
    }, {
        new: true // con esta opción le decimos a moongose que retorne el elemento modificado.
    }) 
}

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    borrarProducto,
    reemplazarProducto
}