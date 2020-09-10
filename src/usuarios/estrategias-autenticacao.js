const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');

const bcrypt = require('bcrypt');

function verificaUsuario(usuario) {
    if(!usuario) {
        throw new InvalidArgumentError('Não existe usuário com esse e-mail');
    }
}

async function verificaSenha(senha, senhaHash) {
    const senhaValida = await bcrypt.compare(senha, senhaHash);
    if(!senhaValida) {
        throw new InvalidArgumentError('E-mail ou senha inválidos');
    }
}

// o passport + passport-local é utilizado como um middleware que define a estratégia de login.
// Sendo assim, iremos utilizá-lo no arquivo app.js
passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha',
        session: false
    }, async (email, senha, done) => {
        try {
            const usuario = await Usuario.buscaPorEmail(email);
            verificaUsuario(usuario);
            await verificaSenha(senha, usuario.senhaHash);

            // em uma função done(), o primeiro argumento é o erro (nesse caso, senhum erro)
            // o segundo argumento é o próprio usuário, que será devolvido na função de callback do authenticate()
            done(null, usuario);
        } catch(erro) {
            done(erro);
        }
    })
);