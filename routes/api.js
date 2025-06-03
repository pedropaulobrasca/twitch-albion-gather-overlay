const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware para verificar se o overlay pertence ao usuário
const verifyOverlayAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ twitchId: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (!user.hasActiveSubscription()) {
      return res.status(403).json({ error: 'Assinatura inativa ou expirada' });
    }
    
    req.overlayUser = user;
    next();
  } catch (err) {
    console.error('Erro ao verificar acesso ao overlay:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Rota para obter configuração do overlay
router.get('/api/overlay/:userId/config', verifyOverlayAccess, (req, res) => {
  // Retornar configuração personalizada do usuário ou configuração padrão
  const activities = req.overlayUser.config.activities || {};
  
  res.json({
    activities,
    twitchUsername: req.overlayUser.username
  });
});

// Rota para obter estado atual dos bloqueios (compartilhada entre usuários)
router.get('/api/overlay/:userId/status', verifyOverlayAccess, (req, res) => {
  // Esta rota deverá ser atualizada para buscar o estado atual dos bloqueios
  // Para este exemplo, estamos retornando um objeto vazio
  res.json({
    blockedActivities: {},
  });
});

module.exports = router; 