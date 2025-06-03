// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Middleware para verificar se o usuário tem assinatura ativa
const hasActiveSubscription = (req, res, next) => {
  if (req.isAuthenticated() && req.user.hasActiveSubscription()) {
    return next();
  }
  res.redirect('/subscription');
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).render('error', { 
    message: 'Acesso negado. Você não tem permissão para acessar esta página.' 
  });
};

module.exports = {
  isAuthenticated,
  hasActiveSubscription,
  isAdmin
}; 