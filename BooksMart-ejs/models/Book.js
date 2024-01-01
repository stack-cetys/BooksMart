const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  nombre: String,
  autor: String,
  fecha_publicacion: String, 
  descripcion: String //aquí que vaya la condición del libro
  //estaría bien agregar una imagen de ser posible
});

const Book = mongoose.model('Book', libroSchema);
module.exports = Book;