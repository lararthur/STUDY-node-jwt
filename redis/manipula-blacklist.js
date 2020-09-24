const blacklist = require('./blacklist');

// a API do Redis é assincrona, ou seja, os métodos - set, exists - são assíncronos.
// PORÉM, eles funcionam com callback functions ao invés de primoses.
// EX.: blacklist.set(meyKey, 'myValue', function(err) => {});
// por isso, utlilizaremos um método nativo do Node, que fica no módulo util, chamado promisify() para utilizar promises ao inves de callback
const { promisify } = require('util');
const existsAsyn = promisify(blacklist.exists).bind(blacklist);
const setAsync = promisify(blacklist.set).bind(blacklist);

const jwt = require('jsonwebtoken');
// a ideia original era guardar o próprio token nas keys do redis
// porém, caso um dia mude o tamanho do token devido à configuração do payload,
// deixarems de seguir um padrão de tamanho para as chaves do redis.
// por isso encriptaremos o token para um Hash que será guardado como a chave :)
const { createHash } = require('crypto');

function geraTokenHash(token) {
    return createHash('sha256').update(token).digest('hex');
}

module.exports = {
    adiciona: async token => {
        // vamos precisar pegar a propriedade exp (timestamp de expiração que colocamos no payload quando geramos o token),
        // que fica no payload do token para passar como tempo de expiração da blacklist.
        const dataExpiracao = jwt.decode(token).exp;

        // o redis armazena em memoria da seguinte maneira:
        // chave -> valor
        // onde o valor é acessado através da chave.
        // não precisaremos passar nada para o valor, já que o token (na verdade, o hash dele) será a propria referencia,
        // portanto, o hash do token é guardado na chave.
        const tokenHash = geraTokenHash(token);
        await setAsync(tokenHash, '');
        // dataExpiracao como segundo argumento do expireat
        blacklist.expireat(tokenHash, dataExpiracao);
    },
    contemToken: async token => {
        const tokenHash = geraTokenHash(token);
        const resultado = await existsAsyn(tokenHash);
        // existsAsyn retorna 1 para caso exista a chave, e 0 para caso não exista :)
        return resultado === 1;
    },

}