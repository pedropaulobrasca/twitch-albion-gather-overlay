const express = require('express');
const passport = require('passport');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Rota para a página de login
router.get('/login', (req, res) => {
  res.render('login', { 
    user: req.user,
    error: req.flash('error')
  });
});

// Rota para iniciar autenticação Twitch
router.get('/auth/twitch', passport.authenticate('twitch'));

// Callback após autenticação Twitch
router.get('/auth/twitch/callback', 
  passport.authenticate('twitch', { 
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    // Redireciona para o dashboard após o login bem-sucedido
    res.redirect('/dashboard');
  }
);

// Rota para logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Rota para perfil do usuário
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { 
    user: req.user,
    active: 'profile'
  });
});

module.exports = router; 