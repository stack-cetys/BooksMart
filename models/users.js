const mongoose = require('mongoose');


const passportLocalMongoose = require('passport-local-mongoose')

const offerSchema = new mongoose.Schema({
  estado: {
      type: String,
      enum: ['nuevo', 'pendiente', 'aceptado', 'rechazado', 'anulado'],
      default: 'nuevo',
  },
  texto: String,
  enviador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
  },
  receptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
  },
  fechaCreacion: {
      type: Date,
      default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },

  contactos: [{
    tipo: {
      type: String, // Puede ser 'correo', 'telefono', 'red_social', etc.
      required: true,
    },
    valor: {
      type: String,
      required: true,
    },
  }],

  tiene_libros: [{
    nombre: String,
    autor: String,
    fecha_publicacion: String,
    clasificacion: [String], 
  }],

  quiere_libros: [{
    nombre: String,
    autor: String,
    fecha_publicacion: String,
    clasificacion: [String], 
  }],

  genero_tiene: [{
    type: String,
    enum: ['Ficción', 'No_Ficción', 'Misterio', 'Ciencia_Ficción', 'Fantasía', 'Romance', 'Aventura', 'Terror', 'Distopía', 'Histórico', 'Biografía', 'Poesía', 'Drama', 'Comedia', 'Ensayo', 'Suspenso', 'Ciencia', 'Autobiografía', 'Viajes', 'Otro'],
  }],

  ofertas: [{
    ofertaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
    },
    //Es receptor 1, es el que lo evia 0
    esReceptor: {
      type: Boolean,
      required: true,
    }
  }],
  
  notificaciones_ofertas: {
    type: Number,
    default: false,
  },

  resetP_token: {
    type: String,
    default: false
  },
  resetP_expire: {
    type: Date, 
    default: Date.now()
  }
});


// Plugin para facilitar login con passport
userSchema.plugin(passportLocalMongoose)

// Nuevo modelo para Offer
const Offer = mongoose.model('Offer', offerSchema);

// Nuevo modelo para User
const User = mongoose.model('User', userSchema);

module.exports = { User, Offer };