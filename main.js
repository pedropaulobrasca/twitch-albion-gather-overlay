const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');

// Configuração do armazenamento local
const store = new Store({
  schema: {
    twitchUsername: {
      type: 'string',
      default: ''
    },
    twitchOAuthToken: {
      type: 'string',
      default: ''
    },
    port: {
      type: 'number',
      default: 3001
    },
    activities: {
      type: 'object',
      default: {}
    },
    autoStart: {
      type: 'boolean',
      default: false
    }
  }
});

// Variáveis globais
let mainWindow;
let tray = null;
let serverProcess = null;
let serverRunning = false;

// Função para criar a janela principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // Usar um ícone padrão do Electron se não encontrar o ícone personalizado
    icon: fs.existsSync(path.join(__dirname, 'public', 'icons', 'app-icon.png'))
      ? path.join(__dirname, 'public', 'icons', 'app-icon.png')
      : undefined
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
  
  // Eventos da janela
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

// Iniciar servidor como processo separado
function startServer() {
  if (serverRunning) return;
  
  // Criar arquivo .env temporário com as configurações salvas
  const envData = `
PORT=${store.get('port')}
TWITCH_USERNAME=${store.get('twitchUsername')}
TWITCH_OAUTH_TOKEN=${store.get('twitchOAuthToken')}
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
CORS_ORIGIN=http://localhost:5174
`;
  
  fs.writeFileSync(path.join(__dirname, '.env'), envData);
  
  // Garantir que o arquivo config.json esteja atualizado
  fs.writeFileSync(
    path.join(__dirname, 'config.json'),
    JSON.stringify({ activities: store.get('activities') }, null, 2)
  );
  
  // Iniciar o servidor
  serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`Servidor: ${data}`);
    // Enviar logs para a interface
    if (mainWindow) {
      mainWindow.webContents.send('server-log', data.toString());
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`Erro do servidor: ${data}`);
    // Enviar erros para a interface
    if (mainWindow) {
      mainWindow.webContents.send('server-error', data.toString());
    }
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Servidor finalizado com código ${code}`);
    serverRunning = false;
    if (mainWindow) {
      mainWindow.webContents.send('server-status', false);
    }
  });
  
  serverRunning = true;
  if (mainWindow) {
    mainWindow.webContents.send('server-status', true);
  }
}

// Parar o servidor
function stopServer() {
  if (!serverRunning || !serverProcess) return;
  
  serverProcess.kill();
  serverProcess = null;
  serverRunning = false;
  
  if (mainWindow) {
    mainWindow.webContents.send('server-status', false);
  }
}

// Criar ícone na bandeja do sistema
function createTray() {
  // Verificar se o ícone existe, caso contrário, não criar o tray
  const iconPath = path.join(__dirname, 'public', 'icons', 'app-icon.png');
  if (!fs.existsSync(iconPath)) {
    console.log('Ícone do tray não encontrado. Algumas funcionalidades estarão limitadas.');
    return;
  }

  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Painel', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createMainWindow();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Iniciar Servidor', 
      click: () => startServer(),
      enabled: !serverRunning
    },
    { 
      label: 'Parar Servidor', 
      click: () => stopServer(),
      enabled: serverRunning
    },
    { type: 'separator' },
    { 
      label: 'Sair', 
      click: () => {
        stopServer();
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Albion Overlay');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    } else {
      createMainWindow();
    }
  });
}

// Inicialização do app
app.on('ready', () => {
  // Criar diretório app se não existir
  if (!fs.existsSync(path.join(__dirname, 'app'))) {
    fs.mkdirSync(path.join(__dirname, 'app'));
  }
  
  // Iniciar migração se for a primeira execução
  if (!store.has('activities') || Object.keys(store.get('activities')).length === 0) {
    try {
      const configData = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
      store.set('activities', configData.activities);
    } catch (err) {
      console.error('Erro ao migrar configurações:', err);
    }
  }
  
  createMainWindow();
  createTray();
  
  // Iniciar servidor automaticamente se configurado
  if (store.get('autoStart')) {
    startServer();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Limpar recursos ao sair
app.on('quit', () => {
  stopServer();
});

// Comunicação IPC com a interface
ipcMain.on('start-server', () => {
  startServer();
});

ipcMain.on('stop-server', () => {
  stopServer();
});

ipcMain.on('save-settings', (event, settings) => {
  // Salvar configurações
  store.set('twitchUsername', settings.twitchUsername);
  store.set('twitchOAuthToken', settings.twitchOAuthToken);
  store.set('port', settings.port);
  store.set('autoStart', settings.autoStart);
  
  // Notificar interface
  event.reply('settings-saved', true);
});

ipcMain.on('save-activities', (event, activities) => {
  // Garantir que todas as atividades tenham um itemCode
  Object.entries(activities).forEach(([key, activity]) => {
    if (!activity.itemCode) {
      // Códigos padrão caso esteja faltando
      const defaultCodes = {
        'mining': 'T8_2H_TOOL_PICK',
        'fishing': 'T8_2H_TOOL_FISHINGROD',
        'woodcutting': 'T8_2H_TOOL_AXE',
        'skinning': 'T8_2H_TOOL_KNIFE',
        'herbalism': 'T8_2H_TOOL_SICKLE',
        'quarrying': 'T8_2H_TOOL_HAMMER'
      };
      
      activity.itemCode = defaultCodes[key] || `T8_2H_TOOL_${key.toUpperCase()}`;
    }
  });
  
  // Salvar atividades
  store.set('activities', activities);
  
  // Atualizar arquivo config.json
  fs.writeFileSync(
    path.join(__dirname, 'config.json'),
    JSON.stringify({ activities }, null, 2)
  );
  
  // Notificar interface
  event.reply('activities-saved', true);
});

ipcMain.on('get-settings', (event) => {
  // Enviar configurações para a interface
  event.reply('settings-data', {
    twitchUsername: store.get('twitchUsername'),
    twitchOAuthToken: store.get('twitchOAuthToken'),
    port: store.get('port'),
    activities: store.get('activities')
  });
});

ipcMain.on('get-server-status', (event) => {
  event.reply('server-status', serverRunning);
});

ipcMain.on('open-overlay', (event) => {
  const port = store.get('port');
  const url = `http://localhost:${port}/overlay`;
  
  require('electron').shell.openExternal(url);
}); 