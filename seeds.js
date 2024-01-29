if (process.env.nODE_ENV !== 'production') {
  require('dotenv').config()
}

const mongoose = require('mongoose');
const { User, Offer } = require('./models/users');

// Windows:
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1/BooksMart';
console.log(process.env.DB_URL.substring(0, 5))
// MAC:
//const dbUrl = process.env.DB_URL || 'mongodb://localhost/testdb';

mongoose.connect(dbUrl);

const usersData = [
  { email: 'alice@example.com', username: 'alice_library', password: 'password1' },
  { email: 'bob@example.com', username: 'bob_books', password: 'password2' },
  { email: 'charlie@example.com', username: 'charlie_readers', password: 'password3' },
  { email: 'david@example.com', username: 'david_bookstore', password: 'password4' },
  { email: 'emma@example.com', username: 'emma_bookshop', password: 'password5' },
];



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const booksData = [
  { 
    nombre: 'To Kill a Mockingbird',
    autor: 'Harper Lee',
    fecha_publicacion: '1960',
    clasificacion: ['Ficción'],
  },
  { 
    nombre: '1984',
    autor: 'George Orwell',
    fecha_publicacion: '1949',
    clasificacion: ['Distopía'],
  },
  { 
    nombre: 'The Great Gatsby',
    autor: 'F. Scott Fitzgerald',
    fecha_publicacion: '1925',
    clasificacion: ['Ficción'],
  },
  { 
    nombre: 'Pride and Prejudice',
    autor: 'Jane Austen',
    fecha_publicacion: '1813',
    clasificacion: ['Romance'],
  },
  { 
    nombre: 'The Catcher in the Rye',
    autor: 'J.D. Salinger',
    fecha_publicacion: '1951',
    clasificacion: ['Ficción'],
  },
  { 
    nombre: 'The Hobbit',
    autor: 'J.R.R. Tolkien',
    fecha_publicacion: '1937',
    clasificacion: ['Fantasía'],
  },
  { 
    nombre: 'The Lord of the Rings',
    autor: 'J.R.R. Tolkien',
    fecha_publicacion: '1954',
    clasificacion: ['Fantasía'],
  },
  { 
    nombre: 'Harry Potter and the Sorcerers Stone',
    autor: 'J.K. Rowling',
    fecha_publicacion: '1997',
    clasificacion: ['Fantasía'],
  },
  { 
    nombre: 'One Hundred Years of Solitude',
    autor: 'Gabriel García Márquez',
    fecha_publicacion: '1967',
    clasificacion: ['Realismo'],
  },
  { 
    nombre: 'The Chronicles of Narnia',
    autor: 'C.S. Lewis',
    fecha_publicacion: '1950',
    clasificacion: ['Fantasía'],
  },
  { 
    nombre: 'Brave New World',
    autor: 'Aldous Huxley',
    fecha_publicacion: '1932',
    clasificacion: ['Distopía'],
  },
  { 
    nombre: 'The Da Vinci Code',
    autor: 'Dan Brown',
    fecha_publicacion: '2003',
    clasificacion: ['Misterio'],
  },
  { 
    nombre: 'The Hitchhikers Guide to the Galaxy',
    autor: 'Douglas Adams',
    fecha_publicacion: '1979',
    clasificacion: ['Ciencia-Ficción'],
  },
  { 
    nombre: 'The Shining',
    autor: 'Stephen King',
    fecha_publicacion: '1977',
    clasificacion: ['Terror'],
  },
  { 
    nombre: 'The Alchemist',
    autor: 'Paulo Coelho',
    fecha_publicacion: '1988',
    clasificacion: ['Ficción'],
  },
  { 
    nombre: 'The Girl with the Dragon Tattoo',
    autor: 'Stieg Larsson',
    fecha_publicacion: '2005',
    clasificacion: ['Misterio'],
  },
  { 
    nombre: 'The Hunger Games',
    autor: 'Suzanne Collins',
    fecha_publicacion: '2008',
    clasificacion: ['Distopía'],
  },
  { 
    nombre: 'The Fault in Our Stars',
    autor: 'John Green',
    fecha_publicacion: '2012',
    clasificacion: ['Romance'],
  },
  { 
    nombre: 'The Road',
    autor: 'Cormac McCarthy',
    fecha_publicacion: '2006',
    clasificacion: ['Ficción'],
  },
  { 
    nombre: 'Book of Randomness',
    autor: 'Anonymous Author',
    fecha_publicacion: '2023',
    clasificacion: ['Otro'],
  },
];

const generosPopulares = [
  'Ficción',
  'No-Ficción',
  'Misterio',
  'Ciencia-Ficción',
  'Fantasía',
  'Romance',
  'Aventura',
  'Terror',
  'Distopía',
  'Histórico',
  'Biografía',
  'Poesía',
  'Drama',
  'Comedia',
  'Ensayo',
  'Suspenso',
  'Ciencia',
  'Autobiografía',
  'Viajes',
  'Otro',
];



async function seedDatabase() {
  try {
    // Eliminar usuarios existentes con las mismas credenciales
    for (const userData of usersData) {
      await User.findOneAndDelete({ username: userData.username });
    }

    // Registrar nuevos usuarios y asignar géneros aleatorios
    for (const userData of usersData) {
      const { email, username, password } = userData;
      const user = new User({ email, username });

      // Asignar entre 1 y 10 géneros aleatorios
      const numGenres = getRandomInt(1, 10);
      for (let i = 0; i < numGenres; i++) {
        const randomGenre = generosPopulares[getRandomInt(0, generosPopulares.length - 1)];
        user.genero_tiene.push(randomGenre);
      }

      // Asignar entre 1 y 10 libros aleatorios (opcional, según tu lógica)
      const numBooks1 = getRandomInt(1, 10);
      for (let i = 0; i < numBooks1; i++) {
        const randomBook = booksData[getRandomInt(0, booksData.length - 1)];
        user.tiene_libros.push(randomBook);
      }
      const numBooks2 = getRandomInt(1, 10);
      for (let i = 0; i < numBooks2; i++) {
        const randomBook = booksData[getRandomInt(0, booksData.length - 1)];
        user.quiere_libros.push(randomBook);
      }

      const registeredUser = await User.register(user, password);
      console.log(`Usuario registrado: ${registeredUser.username}`);

      await user.contactos.push({tipo: 'Correo electrónico', valor: email})
      await user.save()
    }
  } catch (error) {
    console.error('Error al sembrar la base de datos:', error);
  } finally {
    // Cierra la conexión después de completar la operación
    mongoose.connection.close();
  }
}


seedDatabase();
