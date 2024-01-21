if (process.env.nODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

//login
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('express-flash');
const session = require('express-session');
const initializePassport = require('./passport-config');
initializePassport(passport);


const mongoose = require('mongoose');

//models
const { User, Offer } = require('./models/users');


// Middleware
const { isLoggedIn } = require('./middleware.js')
// isLoggedIn es lo mismo que checkAuthenticated

// Mongo connection

// To store session information within Mongo
const MongoDBStore = require('connect-mongo')(session)
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

// MongoDBStore setup
const store = new MongoDBStore({
    // URL of DB where it is stored
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log("Session store error", e)
})

const sessionConfig = {
    store,
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

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')

    // Verificar notificaciones recibidas 
    res.locals.hasNotifications = req.user && req.user.notificaciones_ofertas > 0;

    next();
})

// Generos permitidos

const generosPopulares = [
    'Ficción',
    'No Ficción',
    'Misterio',
    'Ciencia Ficción',
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
    'Suspense',
    'Ciencia',
    'Autobiografía',
    'Viajes',
    'Otro', //ELIMINARLO o agregarlo al input de los estantes (prefiero eliminarlo)
];


//--------HOMEPAGE--------------
app.get('/home', checkNotAuthenticated, (req, res) => {
    res.redirect('/')
})

register_message = 'nan'; //necessary to manage register error
app.get('/', (req, res) => {
    res.render('home', { err: register_message })
    register_message = 'nan';
})

//-----FAQ page-----
app.get('/faq', (req, res) => {
    res.render('faq', { message: 'none' })
})


//----Logs in-----
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/' }), async (req, res) => {
    res.redirect('/library')
})

//----Register new user-----
app.post('/register', async (req, res) => {

    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        console.log(registeredUser);

        // We login a user after they register

        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/')
        })

    } catch (e) {
        res.render('home', { err: e });
        register_message = 'error';
        console.log(e)
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

// Ver todos los usuarios

app.get('/index', async (req, res) => {

    //pagination logic
    const page = req.query.p || 0
    const users_per_page = 3 //change to 10 or 20 before final upload to github

    const users = await User.find().skip(page * users_per_page).limit(users_per_page)
    const end = (await User.find()).length

    //keep filters through pagination
    const f = req.query.f || '[]';
    const filtros = JSON.parse(f)

    //render
    return res.render('index', { users, generosPopulares, page, users_per_page, end, filtros })



})

// Funcion para verificar si ya hemos mandado una oferta a este usuario

async function verificarOfertaExistente(idUsuarioActual, idOtroUsuario) {
    // Obtener todas las ofertas en las que el usuario actual está involucrado
    const ofertasUsuarioActual = await Offer.find({
        $or: [
            { enviador: idUsuarioActual },
            { receptor: idUsuarioActual }
        ]
    });

    // Verificar si existe alguna oferta con el otro usuario
    for (const oferta of ofertasUsuarioActual) {
        if (oferta.enviador.equals(idOtroUsuario) || oferta.receptor.equals(idOtroUsuario)) {
            return { existe: true, esReceptor: oferta.receptor.equals(idUsuarioActual) };
        }
    }

    return { existe: false };
}

// Ver detalles de usuario
app.get('/index/:username', async (req, res) => {
    try {
        const currentUser = req.user;
        const otherUser = await User.findOne({ username: req.params.username });

        if (!otherUser) {
            req.flash('error', 'No se puede encontrar ese usuario :(');
            return res.redirect('/index');
        }

        // Verifica si ya existe una oferta enviada o recibida
        const { existe, esReceptor } = await verificarOfertaExistente(currentUser._id, otherUser._id);

        return res.render('details', { user: currentUser, otherUser, ofertaExistente: existe, esReceptor });
        
    } catch (error) {
        console.error('Error al buscar el usuario:', error);
        req.flash('error', 'Hubo un error al buscar el usuario.');
        return res.redirect('/index');
    }
});

// mandar oferta a un usuario

app.post('/index/:username/offers', async (req, res) => {
    try {
        // Paso 1: Tomar la información del usuario [A] usando la sesión
        const usuarioA = req.user;

        // Paso 2: Tomar la información del otro usuario [B] con el id de la página
        const usernameB = req.params.username;
        const usuarioB = await User.findOne({ username: usernameB });

        if (!usuarioB) {
            return res.status(404).send('Usuario no encontrado');
        }


        // Paso 3: Verificar si ya existe una oferta entre ambos usuarios
        const ofertaExistente = await Offer.findOne({
            $or: [
                { enviador: usuarioA._id, receptor: usuarioB._id },
                { enviador: usuarioB._id, receptor: usuarioA._id }
            ]
        });

        if (ofertaExistente) {
            // Ya existe una oferta entre ambos
            return res.status(400).send('Ya se ha enviado una oferta a este usuario');
        }


        // Paso 4: Crear nueva oferta
        const nuevaOferta = new Offer({
            estado: 'nuevo',
            texto: req.body.texto,
            enviador: usuarioA._id,
            receptor: usuarioB._id,
        });


        // Paso 5: Guardar la oferta en la base de datos
        await nuevaOferta.save();


        // Paso 6: Agregar nueva tupla a Oferta recibida [B]
        const ofertaRecibidaB = {
            ofertaId: nuevaOferta._id,
            esReceptor: true,
        };


        usuarioB.ofertas.push(ofertaRecibidaB);


        usuarioB.notificaciones_ofertas += 1; // Aumentar notificaciones_ofertas del receptor
        await usuarioB.save();


        // Paso 7: Agregar nueva tupla a Oferta enviada [A]
        const ofertaEnviadaA = {
            ofertaId: nuevaOferta._id,
            esReceptor: false,
        };


        usuarioA.ofertas.push(ofertaEnviadaA);

        await usuarioA.save();


        console.log('Oferta enviada correctamente');
        return res.redirect(`/index/${usernameB}`);

    } catch (error) {
        console.error('Error al procesar la oferta:', error);
        res.status(500).send('Error interno del servidor');
    }
});



// ver ofertas
app.get('/index/:username/offers', checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate({
                path: 'ofertas.ofertaId',
                model: 'Offer',
                populate: [
                    { path: 'enviador', model: 'User' },
                    { path: 'receptor', model: 'User' }
                ]
            });

        if (!user) {
            req.flash('error', 'No se puede encontrar ese usuario :(');
            return res.redirect('/index');
        }

        const uniqueOffers = Array.from(new Set(user.ofertas.map(offer => offer.ofertaId._id)))
            .map(id => user.ofertas.find(offer => offer.ofertaId._id === id));

        return res.render('offers', { user, uniqueOffers });
        // res.send(user)
        // console.log(uniqueOffers)
    } catch (error) {
        console.error('Error al buscar ofertas del usuario:', error);
        req.flash('error', 'Hubo un error al buscar las ofertas del usuario.');
        return res.redirect('/index');
    }
});

// ver oferta especifica 
app.get('/index/:username/offers/:idOffer', checkAuthenticated, async (req, res) => {
    try {
        const currentUser = req.user;

        // Encuentra la oferta específica dentro de ofertas_recibidas
        const offer = await Offer.findById(req.params.idOffer)
            .populate('enviador')
            .populate('receptor');

        if (!offer) {
            req.flash('error', 'No se puede encontrar esa oferta :(');
            return res.redirect('/index');
        }

        const isReceptor = offer.receptor.username === currentUser.username;

        // Verificar si el estado de la oferta es 'nuevo'
        if (offer.estado === 'nuevo' && isReceptor) {
            // Actualizar el estado a 'pendiente'
            offer.estado = 'pendiente';
            await offer.save();

            // Reducir notificaciones_ofertas del usuario receptor solo si no es ya 0
            if (currentUser.notificaciones_ofertas > 0) {
                currentUser.notificaciones_ofertas -= 1;
                await currentUser.save();
            }
        }

        return res.render('offerDetails', { user: currentUser, offer, isReceptor });
    } catch (error) {
        console.error('Error al buscar la oferta:', error);
        req.flash('error', 'Hubo un error al buscar la oferta.');
        return res.redirect('/index');
    }
});

// Ruta para aceptar la oferta
app.post('/index/accept/:idOffer', async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.idOffer).populate('receptor');

        if (!offer) {
            return res.status(404).send('Oferta no encontrada');
        }

        // Verificar que el usuario actual es el receptor de la oferta
        if (offer.receptor.username !== req.user.username) {
            return res.status(403).send('No tienes permiso para realizar esta acción');
        }

        // Actualizar el estado de la oferta
        await Offer.findByIdAndUpdate(req.params.idOffer, { estado: 'aceptado' }, { new: true });

        // Redirigir al usuario al listado de ofertas
        res.redirect(`/index/${offer.receptor.username}/offers`);
    } catch (error) {
        console.error('Error al aceptar la oferta:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para rechazar la oferta
app.post('/index/reject/:idOffer', async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.idOffer).populate('receptor');

        if (!offer) {
            return res.status(404).send('Oferta no encontrada');
        }

        // Verificar que el usuario actual es el receptor de la oferta
        if (offer.receptor.username !== req.user.username) {
            return res.status(403).send('No tienes permiso para realizar esta acción');
        }

        // Actualizar el estado de la oferta
        await Offer.findByIdAndUpdate(req.params.idOffer, { estado: 'rechazado' }, { new: true });

        // Redirigir al usuario al listado de ofertas
        res.redirect(`/index/${offer.receptor.username}/offers`);
    } catch (error) {
        console.error('Error al rechazar la oferta:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Actualizar el texto de una oferta
app.put('/index/:username/offers/:idOffer', async (req, res) => {
    try {
        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.idOffer,
            { texto: req.body.texto },
            { new: true }
        );

        res.redirect(`/index/${req.user.username}/offers`);
    } catch (error) {
        console.error('Error al actualizar la oferta:', error);
        res.status(500).send('Error interno del servidor');
    }
});

//-----------LIBRARY PAGE------------------    
app.get('/library', isLoggedIn, checkAuthenticated, async (req, res) => {
    const usuario = await req.user
    const q_libros = usuario.quiere_libros
    const t_libros = usuario.tiene_libros

    res.render('library', { q_libros, t_libros })
})

//------------Upload a new book------------
app.post('/newBooks', checkAuthenticated, async (req, res) => {

    const usuario = await req.user;
    const generos_tiene = usuario.genero_tiene;
    const libros_quiero = req.body.confirmedBooksQuiero; // Array of books user wants
    const libros_tengo = req.body.confirmedBooksTengo; // Array of books user has
    const libros_quiero_genre = req.body.confirmedBooksQuiero_genre;
    const libros_tengo_genre = req.body.confirmedBooksTengo_genre;


    for (const i in libros_tengo) {
        const book = libros_tengo[i]

        const new_book = {
            nombre: book.nombre.replace("'", "^"),
            autor: book.autor.replace("'", "^"),
            fecha_publicacion: book.fecha_publicacion.replace("'", "^"),
            clasificacion: libros_tengo_genre[i]
        }

        if (generos_tiene.length < 20) { //para que solo actualice si aún no tiene todos los géneros

            libros_tengo_genre[i].forEach(async genero => {

                if (!generos_tiene.includes(genero)) {

                    await usuario.genero_tiene.push(genero)
                }
            })
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
            clasificacion: libros_quiero_genre[i]
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
    const generos_tiene = usuario.genero_tiene;
    const shelf = req.body.shelf
    const books = req.body.delete_shelf

    for (let i in books) {
        const book = books[i]

        try {
            if (shelf == 'quiero') {
                await User.updateOne({ _id: usuario._id }, { $pull: { quiere_libros: { _id: book.book_id } } })
            } else {

                let book_genre = []
                let other_genres = []

                usuario.tiene_libros.forEach(libro => {
                    if (libro.id == book.book_id) {

                        book_genre = libro.clasificacion

                    } else {

                        libro.clasificacion.forEach(genre => {
                            if (!other_genres.includes(genre)) {
                                other_genres.push(genre)
                            }
                        })
                    }
                })

                for (let i = 0; i < book_genre.length; i++) { //for must be this way cause of the splice
                    if (other_genres.includes(book_genre[i])) {
                        book_genre.splice(i, 1)
                        i = i - 1 //the splice shifts the elements -1 index
                    }
                }

                for (let i = 0; i < generos_tiene.length; i++) {
                    if (book_genre.includes(generos_tiene[i])) {
                        await usuario.genero_tiene.splice(i, 1)
                        i = i - 1 //the splice shifts the elements -1 index
                    }
                }

                await usuario.save()

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

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    res.send('Page not found')
})

//LOCALHOST:3000/home
app.listen(4000, () => {
    console.log('App running!')
})