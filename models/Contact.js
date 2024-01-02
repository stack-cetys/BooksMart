//Este esquema nos proporcionará los medios por los que se puede contactar a un usuario
//si se quiere hacer un intercambio con ellos
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  info: String, //puede ser celular, correo, red social
  descripcion: String//dice qué es ese contacto (de los de arriba)
});

const contacto = mongoose.model("contacto", contactSchema);
module.exports = contacto;