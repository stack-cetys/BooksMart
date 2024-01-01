const mongoose = require('mongoose');
const Book = require('./Book');
const Contact = require('./Contact'); 

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
  contacto: [Contact.schema], //de alguna manera verificar que no pueda hacer intercambios
                        //si no ha rellenado este campo
  tiene_libros: [{
    nombre: String,
    autor: String,
    fecha_publicacion: String, 
    descripcion: String //aquí que vaya la condición del libro
    //estaría bien agregar una imagen de ser posible
  }],  // Un arreglo de objetos de libros
  
  quiere_libros:[{
    nombre: String,
    autor: String,
    fecha_publicacion: String, 
    //estaría bien agregar una imagen de ser posible
  }], // Un arreglo de objetos de libros
});

//Se supone que puedes crear funciones personalizadas para los modelos
//este de abajo es un ejemplo aunque aún no la utilice
usersSchema.statics.findByEmail = function (name) {
  return this.find({ name: new RegExp(name, "i")})
}

const users = mongoose.model("users", usersSchema);
module.exports = users;