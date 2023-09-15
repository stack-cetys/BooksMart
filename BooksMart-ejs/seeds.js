const mongoose = require('mongoose');
const Offer = require('./models/tradeOffer');

// mongoose.connect('mongodb://127.0.0.1:27017/tradeOffers', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch(() => {
//     console.log('Error connecting to MongoDB');
//   });

const tradeOffers = [
  {
    usuario: 'Alice123',
    tiene_libros: [
      {
        nombre: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        fecha_publicacion: '1967'
      },
      {
        nombre: 'Harry Potter y la piedra filosofal',
        autor: 'J.K. Rowling',
        fecha_publicacion: '1997'
      }
    ],
    quiere_libros: [
      {
        nombre: '1984',
        autor: 'George Orwell',
        fecha_publicacion: '1949'
      }
    ],
    metodo_intercambio: '1'
  },
  {
    usuario: 'BobWriter',
    tiene_libros: [
      {
        nombre: 'El código Da Vinci',
        autor: 'Dan Brown',
        fecha_publicacion: '2003'
      },
      {
        nombre: 'La sombra del viento',
        autor: 'Carlos Ruiz Zafón',
        fecha_publicacion: '2001'
      }
    ],
    quiere_libros: [
      {
        nombre: 'Los juegos del hambre',
        autor: 'Suzanne Collins',
        fecha_publicacion: '2008'
      }
    ],
    metodo_intercambio: '1'
  },
  {
    usuario: 'ElenaReads',
    tiene_libros: [
      {
        nombre: 'To Kill a Mockingbird',
        autor: 'Harper Lee',
        fecha_publicacion: '1960'
      },
      {
        nombre: 'Pride and Prejudice',
        autor: 'Jane Austen',
        fecha_publicacion: '1813'
      }
    ],
    quiere_libros: [
      {
        nombre: 'The Catcher in the Rye',
        autor: 'J.D. Salinger',
        fecha_publicacion: '1951'
      }
    ],
    metodo_intercambio: 'Presencial'
  },
  {
    usuario: 'JohnBookworm',
    tiene_libros: [
      {
        nombre: 'The Great Gatsby',
        autor: 'F. Scott Fitzgerald',
        fecha_publicacion: '1925'
      },
      {
        nombre: 'Moby-Dick',
        autor: 'Herman Melville',
        fecha_publicacion: '1851'
      }
    ],
    quiere_libros: [
      {
        nombre: 'Lord of the Rings',
        autor: 'J.R.R. Tolkien',
        fecha_publicacion: '1954'
      }
    ],
    metodo_intercambio: 'Envío por correo'
  },
  {
    usuario: 'GraceReader',
    tiene_libros: [
      {
        nombre: 'The Hobbit',
        autor: 'J.R.R. Tolkien',
        fecha_publicacion: '1937'
      },
      {
        nombre: 'Brave New World',
        autor: 'Aldous Huxley',
        fecha_publicacion: '1932'
      }
    ],
    quiere_libros: [
      {
        nombre: 'The Hunger Games',
        autor: 'Suzanne Collins',
        fecha_publicacion: '2008'
      }
    ],
    metodo_intercambio: '1'
  },
  {
    usuario: 'AlexBooklover',
    tiene_libros: [
      {
        nombre: 'The Alchemist',
        autor: 'Paulo Coelho',
        fecha_publicacion: '1988'
      },
      {
        nombre: 'The Da Vinci Code',
        autor: 'Dan Brown',
        fecha_publicacion: '2003'
      }
    ],
    quiere_libros: [
      {
        nombre: 'Dune',
        autor: 'Frank Herbert',
        fecha_publicacion: '1965'
      }
    ],
    metodo_intercambio: 'Presencial'
  },
  // Puedes agregar más ofertas aquí con nombres de libros y usuarios realistas
];

mongoose.connect('mongodb://127.0.0.1:27017/tradeOffers', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Elimina todos los elementos de la colección Offer
    return Offer.deleteMany({});
  })
  .then(() => {
    console.log("Eliminados todos los elementos de la colección Offer");

    // Inserta los nuevos elementos en la colección Offer
    return Offer.insertMany(tradeOffers);
  })
  .then((result) => {
    console.log("Seeds insertados correctamente");
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Error al insertar seeds:", error);
  });

// Offer.insertMany(tradeOffers)
//   .then((result) => {
//     console.log(tradeOffers)
//     console.log("Seeds insertados correctamente");
//     mongoose.connection.close();
//   })
//   .catch((error) => {
//     console.error("Error al insertar seeds:", error);
//   });
