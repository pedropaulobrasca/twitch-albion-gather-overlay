const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { isAuthenticated, hasActiveSubscription } = require('../middleware/auth');
const User = require('../models/user');

// Middleware para verificar acesso ao painel
const dashboardAccess = [isAuthenticated, hasActiveSubscription];

// Rota para o dashboard
router.get('/dashboard', dashboardAccess, (req, res) => {
  res.render('dashboard', { 
    user: req.user,
    active: 'dashboard'
  });
});

// Rota para configurações
router.get('/settings', dashboardAccess, async (req, res) => {
  try {
    // Carregar configuração do usuário ou usar a padrão
    let userConfig = req.user.config;
    
    if (!userConfig.activities || Object.keys(userConfig.activities).length === 0) {
      // Carregar configuração padrão
      const configData = JSON.parse(
        await fs.readFile(path.join(__dirname, '..', 'config.json'), 'utf8')
      );
      userConfig.activities = configData.activities;
    }
    
    res.render('settings', { 
      user: req.user,
      config: userConfig,
      active: 'settings'
    });
  } catch (err) {
    console.error('Erro ao carregar configurações:', err);
    res.status(500).render('error', { message: 'Erro ao carregar configurações' });
  }
});

// Salvar configurações
router.post('/settings', dashboardAccess, async (req, res) => {
  try {
    const { activities } = req.body;
    
    // Atualizar configuração do usuário
    req.user.config.activities = activities;
    await req.user.save();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
    res.status(500).json({ success: false, error: 'Erro ao salvar configurações' });
  }
});

// Rota para obter URL do overlay
router.get('/overlay-url', dashboardAccess, (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const overlayUrl = `${baseUrl}/overlay/${req.user.twitchId}`;
  
  res.render('overlay-url', { 
    user: req.user,
    overlayUrl,
    active: 'overlay'
  });
});

// Rota para página de assinatura
router.get('/subscription', isAuthenticated, (req, res) => {
  res.render('subscription', { 
    user: req.user,
    stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    active: 'subscription'
  });
});

module.exports = router; 