const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/auth');
const connectDB = require('./config/db');
const flash = require('connect-flash');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Inicializar o app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Conectar ao banco de dados
connectDB();

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI 
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
  }
}));

// Configurar Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Carregar configuração
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

// Estado dos bloqueios (será transferido para o banco de dados posteriormente)
const blockedActivities = {};

// Cliente Twitch
const twitchClient = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [process.env.TWITCH_USERNAME]
});

// Conectar ao chat da Twitch
twitchClient.connect().catch(console.error);

// Ouvir eventos de bits
twitchClient.on('cheer', (channel, userstate, message) => {
  const bits = parseInt(userstate.bits, 10);
  const username = userstate.username;
  
  console.log(`${username} doou ${bits} bits!`);
  
  // Verificar qual atividade pode ser bloqueada
  for (const [activity, activityConfig] of Object.entries(config.activities)) {
    if (bits >= activityConfig.bits) {
      blockActivity(activity, username, bits);
      break; // Bloqueia apenas uma atividade por doação
    }
  }
});

// Ouvir comandos do chat
twitchClient.on('message', (channel, userstate, message, self) => {
  if (self) return;
  
  if (message === '!bloqueios') {
    const activeBlocks = Object.entries(blockedActivities)
      .filter(([_, data]) => data.active)
      .map(([activity, data]) => {
        const timeLeft = Math.ceil((data.endTime - Date.now()) / 60000);
        return `${config.activities[activity].label}: ${timeLeft} minutos restantes (bloqueado por ${data.blockedBy})`;
      });
    
    if (activeBlocks.length > 0) {
      twitchClient.say(channel, `Bloqueios ativos: ${activeBlocks.join(' | ')}`);
    } else {
      twitchClient.say(channel, 'Não há bloqueios ativos no momento!');
    }
  }
});

// Função para bloquear atividade
function blockActivity(activity, username, bits) {
  const durationMinutes = config.activities[activity].durationMinutes;
  const endTime = Date.now() + (durationMinutes * 60 * 1000);
  
  blockedActivities[activity] = {
    active: true,
    endTime,
    blockedBy: username,
    bits
  };
  
  // Emitir evento para o overlay
  io.emit('blockActivity', {
    activity,
    blockedBy: username,
    bits,
    endTime,
    durationMinutes
  });
  
  // Configurar temporizador para desbloquear
  setTimeout(() => {
    if (blockedActivities[activity]) {
      blockedActivities[activity].active = false;
      io.emit('unblockActivity', { activity });
    }
  }, durationMinutes * 60 * 1000);
  
  console.log(`Atividade "${activity}" bloqueada por ${durationMinutes} minutos devido a doação de ${bits} bits de ${username}`);
}

// Adicionar rotas
app.use(authRoutes);
app.use(adminRoutes);
app.use(apiRoutes);

// Rota para a página inicial
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Rota para o overlay (com usuário específico)
app.get('/overlay/:userId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
});

// Manter rota original de overlay para compatibilidade
app.get('/overlay', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
});

// Rotas de teste para simular eventos de bits
app.get('/teste/bits/:atividade/:bits', (req, res) => {
  const activity = req.params.atividade;
  const bits = parseInt(req.params.bits, 10);
  const username = 'TesteUsuário';
  
  if (!config.activities[activity]) {
    return res.status(404).json({ 
      error: 'Atividade não encontrada',
      atividades_disponíveis: Object.keys(config.activities)
    });
  }
  
  blockActivity(activity, username, bits);
  twitchClient.say(process.env.TWITCH_USERNAME, `Atividade ${activity} bloqueada por ${username} com ${bits} bits por ${config.activities[activity].durationMinutes} minutos`);
  res.json({ 
    success: true, 
    message: `Atividade ${activity} bloqueada por ${username} com ${bits} bits por ${config.activities[activity].durationMinutes} minutos`
  });
});

app.get('/teste/listar', (req, res) => {
  res.json({
    atividades: config.activities,
    bloqueios_ativos: Object.entries(blockedActivities)
      .filter(([_, data]) => data.active)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {})
  });
});

// Rota para obter estado atual
app.get('/api/status', (req, res) => {
  res.json({
    blockedActivities,
    config: config.activities
  });
});

// Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');
  
  // Enviar estado atual para o cliente que acabou de se conectar
  socket.emit('initialState', {
    blockedActivities,
    config: config.activities
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Overlay disponível em http://localhost:${PORT}/overlay`);
  console.log(`Painel administrativo em http://localhost:${PORT}/dashboard`);
}); 