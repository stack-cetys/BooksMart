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
const initializePassport = require('./passport-config')
initializePassport(passport)


const mongoose = require('mongoose');

const Offer = require('./models/tradeOffer');
const users = require('./models/users');


mongoose.connect('mongodb://127.0.0.1:27017/tradeOffers', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("connected")

    } )
    .catch(() => {
        console.log('Error')
    })


    /*mongoose.connect("mongodb://localhost/testdb")
    .then(() => {
        console.log("connected")
    
    } )
    .catch(() => {
        console.log('Error')
    })*/


//app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, '/public')));

app.set('view-engine', 'ejs')
//app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.get('/home' , checkAuthenticated, async (req,res) => {

    res.render('logged-index.ejs', await req.user)
})

app.get('/' , checkNotAuthenticated, (req,res) => {
    res.render('index.ejs')
})

app.get('/faq', checkNotAuthenticated, async (req,res) => {

    console.log('questions!');
    res.render('faq.ejs')
})
    
app.get('/trades', checkAuthenticated, async (req,res) => {
const offers = await Offer.find({});
    res.render('trades.ejs', {offers})
})

app.get('/trades/new', checkAuthenticated, async (req,res) => {    
    res.render('new.ejs')
})

app.post('/trades', async (req,res)=>{
const usuario = await req.user.name;
  const metodo_intercambio = req.body.metodo_intercambio;
  const lista_quiero = req.body.quiere_libros; // Array of books user wants
  const lista_tengo = req.body.tiene_libros; // Array of books user has

  // Now you can access the book data in lista_quiero and lista_tengo
  console.log('Usuario:', usuario);
  console.log('Metodo de Intercambio:', metodo_intercambio);
  console.log('Libros que Quiere:', lista_quiero);
  console.log('Libros que Tiene:', lista_tengo);

    const newOffer = new Offer(req.body);
    await newOffer.save();
res.redirect('trades.ejs');
})


app.listen(3000, ()=>{
    console.log('hello')
})


//------------LOGIN----------
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))

//------------REGISTER--------
app.get('/register', checkNotAuthenticated, (req, res) => {
    const data = {
        message: null
    }
    res.render('register.ejs', data)
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
    
    const user = await users.find({ email:req.body.email})

    if (user[0] != null) {
        
        const data = {
            message: 'Ya hay una cuenta con este correo'
        }

        return res.render('register.ejs', data)
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const new_user = await users.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        res.redirect('/login')

    } catch {
        res.redirect('/register')
        }
})


//LOGOUT //SI OCURRE ALGÚN ERROR HAY QUE CHECAR ESTA PARTE
//PUEDE QUE ESTÉ MAL
app.delete('/logout', (req, res) => {
    req.logOut(function(e) {
        if(e) {
            return next(e)
        }
        res.redirect('/login')
    })
    
})

//middleware for authentication, protects data from non users
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }

    //if user isn't logged in and trys to reach a logged in page
    res.redirect('/login')
}

//For when you are already logged in, so yo won't go to the login/register page, only to the main page
function checkNotAuthenticated(req, res, next) {
    //if user is already logged in and trys to reach a not logged in page
    if (req.isAuthenticated()) {
        return res.redirect('/home')
    }

    next()
}
