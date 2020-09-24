const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const blacklist = require('../../redis/manipula-blacklist');

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

async function verificaTokenNaBlacklist(token) {
    const tokenNaBlacklist = await blacklist.contemToken(token);
    if(tokenNaBlacklist) {
        throw new jwt.JsonWebTokenError('Token inválido por logout!');
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

// o passport-http-bearer vai ser utilizado para implementar a estratégia de autenticação utilizando tokens
// e no passport, essa estratégia se chama bearer.
passport.use(
    new BearerStrategy(
        async (token, done) => {
            // aqui nessa função de estratégia, precisaremos verificar se o token é válido e recuperar o payload a partir dele,
            // consequentemente, recuperando o usuário.

            try {
                await verificaTokenNaBlacklist(token);
                const payload = jwt.verify(token, process.env.CHAVE_JWT);
                const usuario = await Usuario.buscaPorId(payload.id);
                done(null, usuario, { token: token });
            } catch(erro) {
                done(erro);
            }
        }
    )
);

/*
OBS: para mandar um token para o servidor, basta colocar o token gerado com o prefixo 'Bearer ' no Header de 'Authorization' da requisição.
*/