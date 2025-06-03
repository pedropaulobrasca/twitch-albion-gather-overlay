# Overlay Interativo para Twitch - Albion Online

Este projeto consiste em um overlay interativo para streams de Albion Online na Twitch. O overlay permite que os espectadores interajam com a gameplay do streamer através de doações de bits, bloqueando temporariamente atividades de coleta (mineração, pesca, corte de madeira, etc).

## Funcionalidades

- Exibição de ícones para as diferentes atividades de coleta do Albion Online
- Interação via bits da Twitch (os espectadores podem bloquear atividades fazendo doações)
- Temporizadores visuais mostrando quanto tempo resta para cada bloqueio
- Comando `!bloqueios` no chat para verificar quais atividades estão bloqueadas
- Efeitos sonoros quando uma atividade é bloqueada
- Mostrar o nome do doador e quantidade de bits doados
- Painel administrativo com autenticação via Twitch
- Sistema de assinaturas e planos

## Como Usar

### Instalação

1. Clone o repositório:
```
git clone https://github.com/seurepo/twitch-albion-gather-overlay.git
cd twitch-albion-gather-overlay
```

2. Instale as dependências:
```
npm install
```

3. Configure o arquivo `.env` com suas credenciais (copie de `env.example`):
```
cp env.example .env
```

4. Edite o arquivo `.env` com:
   - Seu nome de usuário da Twitch
   - Token OAuth (obtenha em https://twitchapps.com/tmi/)
   - Credenciais do aplicativo Twitch (Client ID e Client Secret)
   - Chaves do Stripe para pagamentos

### Usando com Docker (Recomendado)

O projeto inclui um arquivo Docker Compose para facilitar a configuração do MongoDB:

1. Instale o [Docker](https://www.docker.com/get-started) e o [Docker Compose](https://docs.docker.com/compose/install/)

2. Inicie o ambiente de desenvolvimento:
   
   **Linux/macOS:**
   ```
   chmod +x dev.sh
   ./dev.sh
   ```
   
   **Windows (PowerShell):**
   ```
   .\dev.ps1
   ```

Isso iniciará o MongoDB, MongoDB Express (interface administrativa) e o servidor da aplicação.

- MongoDB estará disponível em: `mongodb://localhost:27017`
- MongoDB Express (interface web): `http://localhost:8081`
- Aplicação: `http://localhost:3001`

### Instalação Manual (sem Docker)

Se preferir não usar Docker, você precisará:

1. Instalar o [MongoDB](https://www.mongodb.com/try/download/community) localmente
2. Iniciar o servidor MongoDB
3. Ajustar a URL de conexão no arquivo `.env`
4. Iniciar o servidor:

```
npm start
```

## Configuração no OBS

1. No OBS, adicione uma nova "Fonte de Navegador"
2. Coloque a URL do overlay (padrão: `http://localhost:3001/overlay/{seu_id_twitch}`)
3. Marque a opção "Fundo transparente"
4. Ajuste a largura para aproximadamente 200px e a altura para 600px

## Personalização de Atividades

As atividades, valores de bits e duração de bloqueio podem ser configuradas no painel administrativo ou editando o arquivo `config.json`.

### Exemplo de configuração:

```json
{
  "activities": {
    "mining": {
      "label": "Mineração",
      "bits": 100,
      "durationMinutes": 5,
      "icon": "mining.png"
    },
    "fishing": {
      "label": "Pesca",
      "bits": 150,
      "durationMinutes": 7,
      "icon": "fishing.png"
    }
  }
}
```

## Testes

Para testar sem usar bits reais, acesse:

- Listar atividades: `http://localhost:3001/teste/listar`
- Simular doação: `http://localhost:3001/teste/bits/mining/100`
- Ou use o botão "Testar" no painel administrativo

## Requisitos

- Node.js v14+
- NPM ou Yarn
- MongoDB (ou Docker + Docker Compose)

## Licença

Este projeto está licenciado sob a licença MIT. 