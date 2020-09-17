const usuariosControlador = require('./usuarios-controlador');
const passport = require('passport');

module.exports = app => {
  app
    .route('/usuario/login')
    .post(
      // esse método da autenticação irá executar nossa estratégia definida no commit anterior
      passport.authenticate('local', { session: false }),
      usuariosControlador.login
    );
  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app.route('/usuario/:id').delete(usuariosControlador.deleta);
};
