const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const jwt = require('jsonwebtoken');

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };
  
  // para utilizar uma senha secreta mais confiável, podemos utilizar um proprio modulo do node chamado 'crypto'
  // basta digitar no terminal:
  // node -e "console.log(require('crypto').randomBytes(256).toString('base64'))"

  // mas esta nova senha estamos guardando no arquivo .env, sendo que aqui utilizamos o 'process' fornecido pelo dotenv.
  const token = jwt.sign(payload, process.env.CHAVE_JWT);
  return token;
}

module.exports = {
  adiciona: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email
      });

      await usuario.adicionaSenha(senha);

      await usuario.adiciona();

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  login: (req,res) => {
    /* o req.user passado para a nossa função de criar o token foi disponibilizado aqui após
    o passport.authenticate() - aquele chamado lá na rota - foi finalizado.
    É o mesmo usuário devolvido na nossa estratégia local. */
    const token = criaTokenJWT(req.user);
    // de posse do token, podemos mandar ele de volta para o cliente.
    // porém, não é recomendável mandá-lo no body da resposta
    // sendo assim, o melhor é mandar no cabeçalho de authorization:
    res.set('Authorization', token);
    // uma observação sobre o status 204:
    // normalmente quando mandado, significa que, não só a resposta é uma página em branco,
    // mas, também, que os cabeçalhos podem ser úteis. (aqui, estamos mandando o token no cabeçalho)
    res.status(204).send();
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  deleta: async (req, res) => {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
