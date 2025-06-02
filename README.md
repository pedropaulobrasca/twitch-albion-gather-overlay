# Overlay Interativo para Twitch - Albion Online

Este projeto consiste em um overlay interativo para streams de Albion Online na Twitch. O overlay permite que os espectadores interajam com a gameplay do streamer através de doações de bits, bloqueando temporariamente atividades de coleta (mineração, pesca, corte de madeira, etc).

## Novidade: Aplicativo Desktop!

Agora disponível como um aplicativo desktop fácil de usar! Não é mais necessário configurar manualmente ou usar linha de comando.

### Características do Aplicativo:
- Interface gráfica amigável
- Configuração simplificada
- Painel de controle com logs
- Gerenciamento visual das atividades
- Testes sem uso de bits reais
- Integração com OBS Studio

### Download

Faça o download da versão mais recente na [página de releases](https://github.com/seurepo/twitch-albion-gather-overlay/releases).

## Funcionalidades

- Exibição de ícones para as diferentes atividades de coleta do Albion Online
- Interação via bits da Twitch (os espectadores podem bloquear atividades fazendo doações)
- Temporizadores visuais mostrando quanto tempo resta para cada bloqueio
- Comando `!bloqueios` no chat para verificar quais atividades estão bloqueadas
- Efeitos sonoros quando uma atividade é bloqueada
- Mostrar o nome do doador e quantidade de bits doados

## Como Usar o Aplicativo

1. Baixe e instale o aplicativo da [página de releases](https://github.com/seurepo/twitch-albion-gather-overlay/releases)
2. Abra o aplicativo
3. Na aba **Configurações**, adicione:
   - Seu nome de usuário da Twitch
   - Token OAuth (obtenha em https://twitchapps.com/tmi/)
4. Na aba **Atividades**, configure os valores de bits e duração de bloqueio para cada atividade
5. Na aba **Dashboard**, clique em "Iniciar Servidor"
6. Copie a URL do overlay e adicione como "Fonte de Navegador" no OBS Studio

### Configuração no OBS

1. No OBS, adicione uma nova "Fonte de Navegador"
2. Coloque a URL do overlay (padrão: `http://localhost:3001/overlay`)
3. Marque a opção "Fundo transparente"
4. Ajuste a largura para aproximadamente 200px e a altura para 600px

## Para Desenvolvedores

### Requisitos

- Node.js v14+
- NPM ou Yarn
- Electron (para o aplicativo desktop)

### Instalação para Desenvolvimento

1. Clone o repositório:
```
git clone https://github.com/seurepo/twitch-albion-gather-overlay.git
cd twitch-albion-gather-overlay
```

2. Instale as dependências:
```
npm install
```

3. Execute o aplicativo em modo de desenvolvimento:
```
npm start
```

### Construir o Aplicativo

Para construir o aplicativo para distribuição:

```
npm run build
```

Os arquivos executáveis serão gerados na pasta `dist`.

## Licença

Este projeto está licenciado sob a licença MIT. 