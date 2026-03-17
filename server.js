const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: '66ms-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }
}));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

let pastes = []; // {id, content, created}
const PASSWORD = '66ms';

app.get('/', (req, res) => {
    req.session.loggedIn ? res.redirect('/dashboard') : res.render('login');
});

app.post('/login', (req, res) => {
    if (req.body.password === PASSWORD) {
        req.session.loggedIn = true;
        res.redirect('/dashboard');
    } else {
        res.send('Contraseña incorrecta <a href="/">Volver</a>');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    res.render('dashboard', { pastes });
});

app.post('/create', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const content = req.body.content.trim();
    if (!content) return res.send('No hay contenido');

    const id = crypto.randomBytes(4).toString('hex');
    pastes.unshift({ id, content, created: new Date() });
    res.redirect(`/paste/${id}`);
});

app.get('/paste/:id', (req, res) => {
    const paste = pastes.find(p => p.id === req.params.id);
    if (!paste) return res.status(404).send('Paste no encontrado');

    const host = `\( {req.protocol}:// \){req.get('host')}`;
    res.render('paste', { paste, host });
});

app.get('/raw/:id', (req, res) => {
    const paste = pastes.find(p => p.id === req.params.id);
    if (!paste) return res.status(404).send('Not found');
    res.set('Content-Type', 'text/plain');
    res.send(paste.content);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`🚀 Pastefy corriendo en puerto ${PORT}`);
});
