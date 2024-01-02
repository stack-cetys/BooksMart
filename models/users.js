const mongoose = require('mongoose');
const Book = require('./Book');
const Contact = require('./Contact'); 

const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
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

// Plugin para facilitar login con passport
UserSchema.plugin(passportLocalMongoose)

//cambiar a User en el futuro
module.exports = mongoose.model('User', UserSchema)