# Projeto de Automação Residencial (sem nome ainda)

## Visão geral

Ferramenta própria de automação residencial, focada em simplicidade, UX moderna e controle 100% local. Desenvolvida inicialmente para uso pessoal, sem pretensão imediata de virar produto, mas com arquitetura que permite essa evolução no futuro.

A filosofia central é: **dispositivos smart não deveriam depender de servidores de terceiros para funcionar**. Quando você aperta um botão pra ligar a luz, o comando não deveria viajar até um servidor na China e voltar — deveria acontecer localmente, instantaneamente.

## Motivações

### Por que não usar Home Assistant

O Home Assistant é poderoso e consolidado, mas tem limitações significativas de UX e modelo mental que tornam o uso diário frustrante:

- **Conceitos demais expostos ao usuário final**: entidades, devices, integrações, helpers, automações, cenas, scripts, blueprints, áreas, dashboards — cada um com suas próprias regras e interfaces diferentes.
- **Ausência de hierarquia real de dispositivos**: scripts e entidades ficam soltos no overview. Não é possível agrupar comandos logicamente sob um "dispositivo virtual" (ex: Ar Condicionado com temperatura, modo, velocidade embaixo dele).
- **Automações exigem múltiplos passos e navegação entre telas** mesmo para operações simples como "desligar luz em 45 segundos com possibilidade de cancelamento".
- **Dashboard automático tem limites claros** de customização; o manual exige edição de YAML.
- **Apps (add-ons) não disponíveis na instalação Container**, exigindo alternativas para cada funcionalidade.
- **Interface feita por engenheiros para engenheiros**: cada tela é densa, termos técnicos expostos, pouca consideração com fluxos comuns.

### Por que não usar Smart Life (Tuya)

- Dependência total de cloud — comandos viajam até servidores externos.
- Dados de uso da casa enviados para servidores de terceiros sem transparência.
- Dispositivos param de funcionar se a internet cair.
- Sem controle sobre evolução da plataforma, preços, políticas.

### O gap de mercado

Existe uma lacuna real: entre a UX impecável do Smart Life (que depende de cloud) e o controle total do Home Assistant (que exige trabalho significativo de configuração), não há opção popular. Esse é literalmente um gap de produto.

O público-alvo implícito seria: usuários tecnicamente capazes que valorizam privacidade e controle local, mas não querem virar sysadmin do próprio apartamento.

### Motivação pessoal

- Já tenho o ecossistema físico montado e funcionando (Home Assistant + Zigbee2MQTT + Mosquitto + dispositivos Zigbee).
- Tenho stack própria de desenvolvimento (VeloJS) que se beneficiaria de mais um caso de uso real.
- Tenho PodCubo rodando como infraestrutura — um projeto verticalmente integrado.
- Gosto genuinamente do processo de construir minhas próprias ferramentas.
- O projeto é despretensioso: não precisa virar produto, pode ser lifestyle coding.

## Escopo inicial (MVP)

### O que está dentro

- Integração exclusivamente via **Zigbee2MQTT** (protocolo único no início).
- Conexão com broker **Mosquitto** existente (mesmo que o HA usa atualmente).
- Interface web responsiva (desktop + mobile).
- Listagem de dispositivos com estado em tempo real.
- Controle básico: ligar, desligar, ajustar estado de dispositivos.
- Organização hierárquica de dispositivos por áreas/cômodos.
- Conceito de "dispositivo virtual" para agrupar entidades relacionadas (ex: Ar Condicionado Sala englobando os múltiplos scripts de IR).
- Automações simples baseadas em eventos (gatilho → ação).
- Timer de ação com cancelamento (equivalente ao caso "desligar luz em 45s").
- Histórico de eventos (feed de o que aconteceu em cada dispositivo).
- Rodar em paralelo com o HA existente — ambos consumindo o mesmo Mosquitto sem interferência, permitindo desenvolvimento incremental sem quebrar a casa.

### O que fica para depois

- Suporte a outros protocolos (Wi-Fi direto via Tasmota/ESPHome, Matter, etc.).
- Adapters para dispositivos que não falam MQTT nativamente (ex: aquecedor Rheem WiFi).
- Controle por voz / integração com LLMs.
- Dashboard de energia e analytics.
- Controles externos (app nativo, integração com automações de celular).
- Cenas complexas com lógica condicional.
- Suporte multi-usuário com permissões.
- Integração com câmeras / NVR.
- Versão self-hosted distribuível pra outros usuários.

### O que explicitamente NÃO entra no escopo

- Compatibilidade universal com "todos os dispositivos do mundo". Foco em funcionar bem no que há em casa.
- Marketplace de integrações estilo HACS. Tudo vai ser código.
- Configuração via YAML como interface principal. Tudo via UI ou código (TypeScript), nunca via arquivos de configuração declarativos expostos ao usuário.

## Arquitetura proposta

### Visão geral

```
Dispositivos Zigbee ←[rádio]→ Dongle Sonoff Zigbee 3.0
                                      ↓ USB
                              Zigbee2MQTT (container)
                                      ↓ TCP/IP
                              Mosquitto (container)
                                      ↓ TCP/IP (MQTT)
                       ┌──────────────┴──────────────┐
                       ↓                             ↓
              Home Assistant                   Aplicação nova
              (rodando em paralelo            (Node.js + MongoDB)
               durante desenvolvimento)               ↓
                                           WebSocket/SSE
                                                  ↓
                                              Frontend
                                           (VeloJS/Preact)
```

### Componentes

#### Backend (aplicação única, Node.js + TypeScript)

Dentro da mesma aplicação, organizada em módulos:

- **MQTT client**: conecta no Mosquitto, assina `zigbee2mqtt/#`, recebe eventos e publica comandos.
- **Event handlers**: internamente reagem a eventos MQTT e disparam ações (persistir no Mongo, notificar frontend, executar automações).
- **Persistência (MongoDB)**: estado atual dos dispositivos + histórico de eventos + configurações (áreas, dispositivos virtuais, automações criadas pelo usuário).
- **API HTTP/WebSocket/SSE**: serve a UI, aceita comandos, empurra atualizações em tempo real.
- **Automation engine**: executa regras definidas pelo usuário (gatilho → condição → ação).

Não é necessário um serviço ingestor separado. Como o Mosquitto já atua como buffer resiliente (retained messages), a aplicação pode cair e recuperar estado ao reconectar. Toda lógica embarcada em um único processo mantém deployment simples.

#### Frontend (VeloJS)

- SSR com Preact.
- vanilla-extract para estilos.
- Comunicação em tempo real via WebSocket ou SSE.
- Design mobile-first, já que o uso principal é pelo celular.
- Foco na UX de controle rápido (abrir app, um toque, ação feita).

#### Infraestrutura (já existente)

- **PodCubo** no Mac Mini gerenciando todos os containers via Quadlets.
- **Mosquitto** já rodando.
- **Zigbee2MQTT** já rodando e com dispositivos pareados.
- **Cloudflare Tunnel** já configurado para acesso externo (pode ser reaproveitado).
- **MongoDB** pode ser um novo container gerenciado pelo PodCubo.

### Por que MQTT com broker (Mosquitto) e não WebSocket direto no Z2M

Considerado e avaliado. A opção de falar direto com a API WebSocket do Z2M é possível, mas:

- A API WebSocket do Z2M é projetada para a interface web dele, não é contrato público estável.
- MQTT é barramento desacoplado — múltiplos consumidores podem participar sem saber uns dos outros (permite rodar em paralelo com HA, adicionar serviços futuros sem refatoração).
- Retained messages do MQTT dão resiliência natural: se a aplicação cair, ao reconectar ela recebe imediatamente o último estado de cada dispositivo.
- Mosquitto é maduro, leve, quase zero custo operacional.

Arquitetura orientada a eventos com broker é padrão bem estabelecido para esse tipo de aplicação.

### Por que MongoDB

- Stack familiar (já uso no PodCubo e em outros projetos).
- Schema flexível permite evoluir o modelo de dados sem migrations complicadas.
- Document model casa bem com a natureza dos dados (um dispositivo tem propriedades variáveis dependendo do tipo).
- Change Streams nativos do MongoDB permitem notificar o frontend em tempo real diretamente das mudanças no banco (sem pub/sub adicional).
- Agregações poderosas para relatórios/dashboards futuros.

## Modelo de dados (esboço inicial)

Collections principais:

- **devices**: dispositivos descobertos via Z2M. Estado atual, metadados, área atribuída, dispositivo virtual pai (opcional).
- **virtual_devices**: agrupamentos lógicos criados pelo usuário (ex: "Ar Condicionado Sala" contendo vários scripts de IR como ações).
- **areas**: cômodos da casa.
- **events**: histórico append-only de todos os eventos recebidos via MQTT. Serve como time series.
- **automations**: regras criadas pelo usuário.
- **ir_codes**: códigos IR aprendidos do Moes UFO-R11, organizados por dispositivo e ação.

## Casos de uso que motivam funcionalidades

### Caso 1: Desligar luz com delay cancelável

No HA, exigiu criar Timer helper + automação + atribuir área, três passos em interfaces diferentes. Na ferramenta própria, deveria ser: **abrir o switch → bater num botão "desligar em X segundos" → contador visível → tocar de novo cancela**. Tudo na mesma modal do dispositivo.

### Caso 2: Controle remoto IR de ar condicionado

No HA, cada combinação de temperatura/modo/velocidade vira um script separado e solto no overview. Centenas de combinações = centenas de scripts. Na ferramenta própria, deveria existir um **dispositivo virtual "Ar Condicionado"** que internamente referencia os códigos IR aprendidos, expondo uma UI de termostato com temperatura, modo e velocidade. A complexidade fica no modelo de dados, não na UI.

### Caso 3: Organização visual

Overview automático do HA não permite agrupar "Luzes da Sala" ou "Ar Condicionado Sala" como cards hierárquicos. Tudo fica plano. Na ferramenta própria, **áreas contêm dispositivos que podem ser físicos ou virtuais**, e virtuais agrupam múltiplas entidades sob uma identidade única.

### Caso 4: Histórico e insights

No HA, histórico existe mas está em outra tela. Na ferramenta própria, **cada dispositivo tem seu próprio feed de eventos** acessível pela própria modal do dispositivo, como timeline. Base para futuras features de analytics.

## Princípios de UX

- **Um toque deve resolver a ação mais comum** de cada dispositivo. Tudo além disso é expansão.
- **Nenhum conceito técnico exposto ao usuário** (entidade, integração, trigger, etc.). Abstrair tudo em "dispositivo", "automação", "ação".
- **Mobile-first sempre**. A maioria das interações é pelo celular.
- **Tempo real visível**: estado dos dispositivos muda na tela no momento em que muda no mundo real.
- **Sem configuração via arquivos**. Tudo pela UI, exceto "power user features" que podem ser código TypeScript.
- **Defaults inteligentes**. Se eu parear um interruptor, ele já aparece no lugar certo, com ícone adequado, funcionando.

## Stack técnica

- **Backend**: Node.js 20+, TypeScript, VeloJS (Hono + Preact SSR).
- **Frontend**: Preact, @preact/signals, vanilla-extract.
- **Banco**: MongoDB 8.
- **Mensageria**: MQTT via Mosquitto.
- **Real-time**: WebSocket ou SSE (decidir durante implementação).
- **Containerização**: Podman + Quadlets, gerenciado pelo PodCubo.
- **Ambiente de dev**: Fedora Kinoite, VS Code com Remote-SSH quando necessário.

## Abordagem de desenvolvimento

- **Despretensioso**: sem prazos, sem pressão, sem plano de virar produto.
- **Incremental**: começar com o mínimo funcional e adicionar conforme necessidade real do dia a dia.
- **Paralelo ao HA**: não remover o HA até a nova ferramenta cobrir os casos de uso reais. Os dois coexistem no Mosquitto sem interferência.
- **Coletar pain points agora**: enquanto ainda sou "usuário novo" do HA, anotar tudo que incomoda. Essa visão se perde depois de meses de uso.

## Próximos passos

1. **Análise profunda com Claude Code** antes de começar a codar (este documento é o ponto de partida).
2. Definir o modelo de dados em mais detalhe.
3. Prototipar o cliente MQTT + persistência no Mongo como primeiro sprint.
4. Prototipar uma UI mínima que liste dispositivos e estado em tempo real.
5. Iterar a partir daí, guiado pela dor real.

## Riscos e consciência honesta

- **Tempo**: tenho PodCubo em produção, plataforma de people analytics em desenvolvimento, casa nova. Esse projeto é hobby e deve permanecer hobby, pelo menos inicialmente.
- **Escopo creep**: fácil querer reimplementar tudo que o HA tem. Disciplina pra manter o escopo do "meu caso real" é fundamental.
- **HA é robusto**: não subestimar o quanto ele resolve por baixo dos panos. Aceitar que minha ferramenta inicialmente será muito mais limitada e tudo bem.
- **Reconciliação de estado**: quando a aplicação cair e voltar, como garantir que o banco reflete o mundo real? MQTT retained messages ajudam mas não resolvem 100%. Planejar pra isso desde o começo.