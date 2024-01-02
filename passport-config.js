const LocalStrategy = require('passport-local')
const users = require('./models/users');


function initialize(passport) {
    // const authenticateUser = async (email, password, done) => {
        
    //     const user = await users.find({ email:email})
        
    //     if (user[0] == null) {
    //         return done(null, false, { message: 'Usuario inexistente' })
    //     }

    //     try {
    //         if (await bcrypt.compare(password, user[0].password)) {
    //             return done(null, user[0])
    //         } else {
    //             return done(null, false, { message: 'Contraseña incorrecta' })
    //         }
    //     } catch (e) {
    //         return done(e)
    //     }

    // }

    // passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser)) 
    // passport.serializeUser((user, done) => done(null, user._id))
    // passport.deserializeUser((id, done) => {
    //     return done(null, users.findById(id))
    // })
}

module.exports = initialize