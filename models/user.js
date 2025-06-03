const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'canceled'],
    default: 'active'
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias por padrão
  }
});

const userSchema = new mongoose.Schema({
  twitchId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  displayName: {
    type: String
  },
  email: {
    type: String
  },
  profileImage: {
    type: String
  },
  twitchAccessToken: {
    type: String
  },
  twitchRefreshToken: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  // Configuração personalizada do usuário
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Verificar se a assinatura está ativa
userSchema.methods.hasActiveSubscription = function() {
  return (
    this.subscription.status === 'active' && 
    new Date(this.subscription.validUntil) > new Date()
  );
};

// Método para verificar se o usuário tem acesso premium
userSchema.methods.hasPremiumAccess = function() {
  return (
    this.isAdmin || 
    (this.hasActiveSubscription() && 
     (this.subscription.plan === 'premium' || this.subscription.plan === 'basic'))
  );
};

module.exports = mongoose.model('User', userSchema); 