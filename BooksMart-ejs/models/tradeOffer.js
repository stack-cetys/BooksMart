const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  nombre: String,
  autor: String,
  fecha_publicacion: String
  //estaría bien agregar una imagen de ser posible
});

const ofertaSchema = new mongoose.Schema({
  usuario: String,
  tiene_libros: [libroSchema],  // Un arreglo de objetos de libros
  quiere_libros: [libroSchema], // Un arreglo de objetos de libros
  metodo_intercambio: String //wdym con método de intercambio
});

const Offer = mongoose.model('Offer', ofertaSchema);

module.exports = Offer;
