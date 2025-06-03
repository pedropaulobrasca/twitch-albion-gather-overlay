const passport = require('passport');
const TwitchStrategy = require('passport-twitch-new').Strategy;
const User = require('../models/user');
require('dotenv').config();

// Configuração do Passport
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Estratégia de autenticação Twitch
passport.use(new TwitchStrategy({
  clientID: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  callbackURL: process.env.TWITCH_CALLBACK_URL,
  scope: 'user:read:email'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verificar se o usuário já existe
    let user = await User.findOne({ twitchId: profile.id });
    
    if (user) {
      // Atualizar token de acesso
      user.twitchAccessToken = accessToken;
      user.twitchRefreshToken = refreshToken;
      await user.save();
      return done(null, user);
    }
    
    // Criar novo usuário
    user = new User({
      twitchId: profile.id,
      username: profile.login,
      displayName: profile.display_name,
      email: profile.email,
      profileImage: profile.profile_image_url,
      twitchAccessToken: accessToken,
      twitchRefreshToken: refreshToken,
      isAdmin: false,
      // Todos novos usuários começam com plano gratuito
      subscription: {
        plan: 'free',
        status: 'active',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias de teste
      }
    });
    
    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport; 