const usuariosControlador = require('./usuarios-controlador');
const passport = require('passport');

module.exports = app => {
  app
    .route('/usuario/login')
    .post(
      // esse método da autenticação irá executar nossa estratégia de login, definida no estrategias-autenticacao.js
      passport.authenticate('local', { session: false }),
      usuariosControlador.login
    );
  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app
    .route('/usuario/:id')
    .delete(
      // esse método da autenticação irá executar nossa estratégia de tokens, definida no estrategias-autenticacao.js
      passport.authenticate('bearer', { session: false }),
      usuariosControlador.deleta
    );
};
