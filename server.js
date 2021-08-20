const express = require('express');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const passport = require('passport');
const bCrypt = require('bCrypt');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models');
const dotenv = require('dotenv');
const { fork } = require('child_process');

dotenv.config();

const FACEBOOK_CLIENT_ID = process.argv[3] || '542559090213831'
const FACEBOOK_CLIENT_SECRET = process.argv[4] || '3f1cfb58db463bf5e0994f445cd8b0dd'
//const instacncia = new productos();
// creo una app de tipo express
const app = express();
const handlebars = require("express-handlebars")
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// inicializamos passport
app.use(passport.initialize());
app.use(passport.session());

app.engine('hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'));
let userProfile
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false
}));

// configuramos passport para usar facebook
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'emails'],
  scope: ['email']
}, function (accessToken, refreshToken, profile, done) {
  userProfile = profile;
  return done(null, userProfile);
}));

// inicializamos passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Bienvenido al ejemplo de passport con facebook');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook',
  {
      successRedirect: '/datos',
      failureRedirect: '/faillogin'
  }
));

app.get('/faillogin', (req, res) => {
  res.status(401).send({ error: 'no se pudo autenticar con facebook' })
});

/*app.get('/datos', (req, res) => {
  if (req.isAuthenticated()) {
      res.render('list', { nombre: userProfile._json.name, email: userProfile._json.email, foto: userProfile._json.picture.data.url});
  } else {
      res.status(401).send('debe autenticarse primero');
  }
});*/
app.get('/datos', (req, res) => {
  console.log(`port: ${PORT} -> Fyh: ${Date.now()}`)
  res.send(`Servidor express <span style="color:blueviolet;">(Nginx)</span> en ${PORT} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
})

app.get('/info', (req, res) => {
    let resp= {}
    resp ={
      'version de node ' : process.version,
      'sistema operativo': process.platform,
      'uso de la memoria': process.memoryUsage(),
      'id del proceso': process.pid,
      'path de ejecucion': process.execPath,
      'arumentos de entrada': process.argv,
      'carpeta corriente': process.cwd()

    }
    res.send(resp)

});
app.get('/randoms', (req, res) => {
  console.log(process.argv)
  const computo = fork('./serverHijo.js');
  computo.send(req.query.cant || 10000000);
  computo.on('message', sum => {
    res.end(`El array de numeros es  ${JSON.stringify(sum)}`);
});
});
app.get('/logout', (req, res) => {
  req.logout();
  res.send({logout: 'ok'})
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const PORT = process.argv[2]  || 8080;

app.listen(PORT, () => {
  console.log(`Servidor express escuchando en http://localhost:${PORT}`)
});
