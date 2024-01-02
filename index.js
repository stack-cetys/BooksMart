if (process.env.nODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

//login
const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('express-flash');
const session = require('express-session');
const initializePassport = require('./passport-config');
initializePassport(passport);


const mongoose = require('mongoose');

//models
const Offer = require('./models/tradeOffer');
const User = require('./models/users');
const Book = require('./models/Book');
const Contact = require('./models/Contact');


// Middleware
const {isLoggedIn} =require('./middleware.js')
// isLoggedIn es lo mismo que checkAuthenticated

// Mongo connection

// Windows:
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1/BooksMart';
// MAC:
//const dbUrl = process.env.DB_URL || 'mongodb://localhost/testdb';

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Engine setup

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }))


// Configuracion de sesion y flash

const secret = process.env.SECRET || 'secret123';

const sessionConfig = {
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        //Secure:true no va a funcionar en localhost
        //secure: true
    }

}

app.use(session(sessionConfig))
app.use(flash())

//Configuracion de Passport para manejar la sesion del usuario

app.use(passport.initialize());
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(express.json());

// Variables locales

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})


//--------HOMEPAGE--------------
app.get('/home', checkNotAuthenticated, (req, res) => {
    res.redirect('/')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login', { message: 'none' })
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register', { message: 'none' })
})

app.get('/faq', (req, res) => {
    res.render('faq', { message: 'none' })
})


//----Logs in-----
app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), async (req, res) => {
    res.redirect('/')
})

//----Register new user-----
app.post('/register', async (req,res) => {
    console.log(req.body);

    try{
        const {email, username, password} = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user,password)
        console.log(registeredUser);

        // We login a user after they register

        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/')
        })

    } catch (e){
        res.send(e)
    }

})
//----------Logout------------
app.get('/logout', (req, res) => {
    req.logOut(function (e) {
        if (e) {
            console.log(e)
            return next(e)
        }
        res.redirect('/home')
    })

})

//-----------LIBRARY PAGE------------------    
app.get('/library',isLoggedIn, checkAuthenticated, async (req, res) => {
    const usuario = await req.user
    const q_libros = usuario.quiere_libros
    const t_libros = usuario.tiene_libros
    const notifications = []

    //----- For notifications -------
    // Notifications are checked very time the page is loaded

    //We get all users and their info
    const all_users = await User.find()

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

    res.render('library', { q_libros, t_libros, notifications })
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
                await User.updateOne({ _id: usuario._id }, { $pull: { quiere_libros: { _id: book.book_id } } })
            } else {
                await User.updateOne({ _id: usuario._id }, { $pull: { tiene_libros: { _id: book.book_id } } })
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

        await User.updateOne({ _id: usuario._id }, updateFields, options)

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

        await User.updateOne({ _id: usuario._id }, updateFields, options);
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

    await User.updateOne({ _id: usuario._id }, updateFields)



    res.redirect('/library')
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
    const all_users = await User.find()
    //console.log(all_users)
    for (const i in all_users) {
        console.log(all_users[i]._id)
        console.log(all_users[i].id)
    }
}

//matchmake()

app.get('/', (req,res) => {
    res.render('home')
})

app.all('*', (req, res, next) =>{
    res.send('Page not found')
})

//LOCALHOST:3000/home
app.listen(3000, () => {
    console.log('App running!')
})