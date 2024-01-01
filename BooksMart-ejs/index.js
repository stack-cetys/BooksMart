if (process.env.nODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

//login
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const initializePassport = require('./passport-config');
initializePassport(passport);


const mongoose = require('mongoose');

//models
const Offer = require('./models/tradeOffer');
const users = require('./models/users');
const Book = require('./models/Book');
const Contact = require('./models/Contact');


/*mongoose.connect('mongodb://127.0.0.1:27017/tradeOffers', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("connected")

    } )
    .catch(() => {
        console.log('Error')
    })*/


mongoose.connect("mongodb://localhost/testdb")
    .then(() => {
        console.log("Database connected!")

    })
    .catch(() => {
        console.log('Error connecting database!')
    })

app.set('view engine', 'ejs');
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());

//--------HOMEPAGE--------------
app.get('/home', checkNotAuthenticated, (req, res) => {
    res.render('home.ejs', { message: 'none' })
})

//-----------LIBRARY PAGE------------------    
app.get('/library', checkAuthenticated, async (req, res) => {
    const usuario = await req.user
    const q_libros = usuario.quiere_libros
    const t_libros = usuario.tiene_libros
    const notifications = []

    //----- For notifications -------
    // Notifications are checked very time the page is loaded

    //We get all users and their info
    const all_users = await users.find()

    //Iterate through users 
    for (const i in all_users) {
        if (all_users[i].id != usuario.id) {
            let books_user_wants = []
            let books_user_has = []
            const alt_q_libros = all_users[i].quiere_libros
            const alt_t_libros = all_users[i].tiene_libros

            for (const j in q_libros) {
                for (const k in alt_t_libros){
                    if (q_libros[j].nombre == alt_t_libros[k].nombre & q_libros[j].autor == alt_t_libros[k].autor) {
                        books_user_wants.push(alt_t_libros[k])
                    }
                }
            }

            for (const j in alt_q_libros) {
                for (const k in t_libros) {
                    if (alt_q_libros[j].nombre == t_libros[k].nombre & alt_q_libros[j].autor == t_libros[k].autor) {
                        books_user_has.push(t_libros[k])
                    }
                }
            }

            if (books_user_has.length != 0 & books_user_wants.length != 0) {
                console.log("Match with", all_users[i].name, "!")
                
                const noti = {
                    alt_user_id: all_users[i].id,
                    alt_user_name: all_users[i].name,
                    books_to_give: books_user_has,
                    books_to_recieve: books_user_wants
                }

                notifications.push(noti)
            }
        }
    }

    console.log(notifications)

    res.render('library.ejs', { q_libros, t_libros, notifications })
})

//------------Upload a new book------------
app.post('/newBooks', checkAuthenticated, async (req, res) => {

    const usuario = await req.user;
    const libros_quiero = req.body.confirmedBooksQuiero; // Array of books user wants
    const libros_tengo = req.body.confirmedBooksTengo; // Array of books user has

    for (const i in libros_tengo) {
        const book = libros_tengo[i]

        const new_book = {
            nombre: book.nombre.replace("'", "^"),
            autor: book.autor.replace("'", "^"),
            fecha_publicacion: book.fecha_publicacion.replace("'", "^"),
            descripcion: ""
        }

        console.log(new_book)

        await usuario.tiene_libros.push(new_book)
        await usuario.save()
    }

    for (const i in libros_quiero) {
        const book = libros_quiero[i]

        const new_book = {
            nombre: book.nombre.replace("'", "^"),
            autor: book.autor.replace("'", "^"),
            fecha_publicacion: book.fecha_publicacion.replace("'", "^"),
            descripcion: ""
        }
        console.log(new_book)

        await usuario.quiere_libros.push(new_book)
        await usuario.save()
    }

    res.redirect('/libray');
})

//----------Delete book(s)---------
app.post('/delete', checkAuthenticated, async (req, res) => {

    const usuario = await req.user;
    const shelf = req.body.shelf
    const books = req.body.delete_shelf

    for (let i in books) {
        const book = books[i]

        try {
            if (shelf == 'quiero') {
                await users.updateOne({ _id: usuario._id }, { $pull: { quiere_libros: { _id: book.book_id } } })
            } else {
                await users.updateOne({ _id: usuario._id }, { $pull: { tiene_libros: { _id: book.book_id } } })
            }
            console.log("Deleted")
        } catch (error) {
            console.log(error);
        }
    }

    res.redirect('/library');
})

//--------Update book-------
app.post('/updateBook', checkAuthenticated, async (req, res) => {
    const usuario = await req.user
    const input_title = req.body.input_title.replace("'", "^")
    const input_autor = req.body.input_autor.replace("'", "^")
    const input_year = req.body.input_year.replace("'", "^")
    const shelf = req.body.shelf
    const book_id = req.body.book_id

    if (shelf == 'quiero') {
        const updateFields = {
            $set: {
                "quiere_libros.$[i].nombre": input_title,
                "quiere_libros.$[i].autor": input_autor,
                "quiere_libros.$[i].fecha_publicacion": input_year
            }
        }

        const options = {
            arrayFilters: [
                {
                    "i._id": book_id
                }
            ]
        }

        await users.updateOne({ _id: usuario._id }, updateFields, options)

    } else {
        const updateFields = {
            $set: {
                "tiene_libros.$[i].nombre": input_title,
                "tiene_libros.$[i].autor": input_autor,
                "tiene_libros.$[i].fecha_publicacion": input_year
            }
        }

        const options = {
            arrayFilters: [
                {
                    "i._id": book_id
                }
            ]
        }

        await users.updateOne({ _id: usuario._id }, updateFields, options);
    }

    res.redirect('/library')
})

//---------Update configuration--------------
app.post('/updateConfiguration', checkAuthenticated, async (req, res) => {
    const usuario = await req.user
    const input_name = ''
    const input_email = ''
    const input_password = ''


    const updateFields = {
        $set: {
            name: input_name,
            email: input_email,
            password: input_password
        }
    }

    await users.updateOne({ _id: usuario._id }, updateFields)



    res.redirect('/library')
})

//----Logs in-----
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/library',
    failureRedirect: '/home',
    failureFlash: true
}))

//----Registers a new user-----
app.post('/register', checkNotAuthenticated, async (req, res) => {

    //Can't create a new user with an already used email
    const user = await users.find({ email: req.body.email })

    if (user[0] != null) {

        const data = {
            message: 'Ya hay una cuenta con este correo'
        }

        return res.render('index.ejs', data)
    }

    //If there isn't any user with that email, then it creates the user
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const new_user = await users.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        res.redirect('/home')

    } catch { //if an error occurs while creating the user
        res.redirect('/home') //redirected to register page
    }
})


//----------Logs out a user-------------
app.delete('/logout', (req, res) => {
    req.logOut(function (e) {
        if (e) {
            return next(e)
        }
        res.redirect('/home')
    })

})

//----------AUTHENTICATION MIDDLEWARE (protects data from non users)--------------
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    //if user isn't logged in and trys to reach a logged in page
    res.redirect('/home') //redirected to login
}

function checkNotAuthenticated(req, res, next) {
    //if user is already logged in and trys to reach an un-logged-in page
    if (req.isAuthenticated()) {
        return res.redirect('/library') //redirected to library
    }

    next()
}

//-------------Matchmaking system--------
async function matchmake() {

    //We get all users and their info
    const all_users = await users.find()
    //console.log(all_users)
    for (const i in all_users) {
        console.log(all_users[i]._id)
        console.log(all_users[i].id)
    }
}

//matchmake()



//LOCALHOST:3000/home
app.listen(3000, () => {
    console.log('App running!')
})