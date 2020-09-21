const passport = require('passport');

module.exports = {
    local: (req, res, next) => {
        passport.authenticate(
            'local',
            { session: false },
            // essa função callback recebe os mesmos argumentos da função done() chamada na autenticação,
            // já que é uma função que irá sobrescrever todas as ações do passport.authenticate
            (erro, usuario, info) => {

                // aqui pode ter sido erro no try catch da função callback do LocalStrategy.
                if(erro && erro.name === 'InvalidArgumentError') {
                    // 401 significa que as credenciais não foram válidas (? verificar!)
                    return res.status(401).json({ erro: erro.message });
                }
                
                // aqui é um erro que não prevemos / não estamos tratando / não previmos. retornar 'genérico' erro 500 :(
                if(erro) {
                    return res.status(500).json({ erro: erro.message })
                }

                // aqui é uma situação específica do passport,
                // em que a requisição mandada pelo cliente está mal formatada, impossibilitando do callback do LocalStrategy ler email e senha.
                // dessa forma, a estratégia de autenticação nem é iniciada.
                // quando isso acontece, ele vai chamar essa função aqui, mas passando o erro como null e usuario como false (como se chamasse o done com erro total)
                if(!usuario) {
                    return res.status(401).json();
                }

                // aqui deu tudo certo :)
                req.user = usuario;
                return next();
            }
        )(req, res, next);
    },

    bearer: (req, res, next) => {
        passport.authenticate(
            'bearer',
            { session: false },
            (erro, usuario, info) => {

                // segundo a documentação do JWT, os possíveis erros são gerados no jwt.verify(),
                // que vão disparar em casos de tokens mal-formatados ou assinaturas inválidas.
                // esses erros retornam aqui através de "JsonWebTokenError".
                if(erro && erro.name === 'JsonWebTokenError') {
                    return res.status(401).json({ erro: erro.message });
                }

                // aqui é um erro que não prevemos / não estamos tratando / não previmos. retornar 'genérico' erro 500 :(
                if(erro) {
                    return res.status(500).json({ erro: erro.message })
                }

                if(!usuario) {
                    return res.status(401).json();
                }

                // aqui deu tudo certo :)
                req.user = usuario;
                return next();
            },
        )(req, res, next)
    }
};