# Overlay Interativo para Twitch - Albion Online

Este projeto consiste em um overlay interativo para streams de Albion Online na Twitch. O overlay permite que os espectadores interajam com a gameplay do streamer através de doações de bits, bloqueando temporariamente atividades de coleta (mineração, pesca, corte de madeira, etc).

## Estrutura do Projeto

- `backend/`: Servidor Node.js que se conecta à API da Twitch e gerencia os bloqueios, além de servir o overlay HTML

## Funcionalidades

- Exibição de ícones para as diferentes atividades de coleta do Albion Online
- Interação via bits da Twitch (os espectadores podem bloquear atividades fazendo doações)
- Temporizadores visuais mostrando quanto tempo resta para cada bloqueio
- Comando `!bloqueios` no chat para verificar quais atividades estão bloqueadas
- Efeitos sonoros quando uma atividade é bloqueada
- Mostrar o nome do doador e quantidade de bits doados

## Requisitos

- Node.js v14+
- NPM ou Yarn
- Conta na Twitch com permissões de desenvolvedor
- OBS Studio ou software similar para streaming

## Configuração

### Backend

1. Entre na pasta do backend:
```
cd backend
```

2. Instale as dependências:
```
npm install
```

3. Crie um arquivo `.env` baseado no `.env.example` e preencha:
```
PORT=3001
TWITCH_USERNAME=seu_canal
TWITCH_OAUTH_TOKEN=oauth:seu_token_oauth
TWITCH_CLIENT_ID=seu_client_id
TWITCH_CLIENT_SECRET=seu_client_secret
CORS_ORIGIN=http://localhost:5174
```

Para obter o token OAuth da Twitch, visite: https://twitchapps.com/tmi/

4. Configure as atividades e valores no arquivo `config.json`:
```json
{
  "activities": {
    "mining": {
      "bits": 10,
      "durationMinutes": 5,
      "icon": "pickaxe.png",
      "label": "Mineração"
    }
    // Outras atividades...
  }
}
```

5. Inicie o servidor:
```
npm run dev
```

## Teste

Para testar o overlay sem usar bits reais, você pode usar os endpoints de teste:

- **Listar atividades:** http://localhost:3001/teste/listar
- **Bloquear mineração:** http://localhost:3001/teste/bits/mining/50
- **Bloquear pesca:** http://localhost:3001/teste/bits/fishing/50

Você pode editar o arquivo `client.http` na pasta backend para testar diferentes combinações.

## Uso com OBS

### Overlay HTML

1. Adicione uma "Fonte de navegador" no OBS
2. Configure a URL para `http://localhost:3001/overlay`
3. Ative a opção "Fundo transparente" nas propriedades da fonte
4. Defina a largura para aproximadamente 200px e altura para 600px
5. Recomendado marcar a opção "Atualizar navegador quando a cena se torna ativa"

## Personalização

- Adicione seus próprios ícones na pasta `backend/public/icons/`
- Modifique os valores de bits e duração dos bloqueios no arquivo `backend/config.json`
- Personalize os estilos visuais editando o arquivo `backend/public/overlay.html`

## Hospedagem

- **Backend**: Pode ser hospedado em serviços como Railway, Render, Heroku ou em um VPS

## Licença

Este projeto está licenciado sob a licença MIT. 