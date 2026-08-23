import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(PROJECT_ROOT, "..");
const ATLAS_ROOT = path.join(WORKSPACE_ROOT, "habbo_spatial_atlas_v1");
const LOCAL_INPUT = path.join(PROJECT_ROOT, "source-input");
const EXTERNAL_GRAPH_PATH = path.join(ATLAS_ROOT, "HABBO_PUBLIC_SPACES_SPATIAL_GRAPH_V1_2026-08-23.json");
const EXTERNAL_MANIFEST_PATH = path.join(WORKSPACE_ROOT, "MANIFEST - Habbo Espaços Públicos - Imagens Originais.csv");
const EXTERNAL_ASSETS = path.join(ATLAS_ROOT, "spatial-atlas-v1", "assets");
const GRAPH_PATH = path.join(LOCAL_INPUT, "HABBO_PUBLIC_SPACES_SPATIAL_GRAPH_V1_2026-08-23.json");
const V3_DELTA_PATH = path.join(LOCAL_INPUT, "HABBO_V3_CONTENT_DELTA_2026-08-23.json");
const MANIFEST_PATH = path.join(LOCAL_INPUT, "MANIFEST - Habbo Espaços Públicos - Imagens Originais.csv");
const SOURCE_ASSETS = path.join(LOCAL_INPUT, "assets");
const DIST = path.join(PROJECT_ROOT, "dist");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const BASE_PATH = String(process.env.BASE_PATH || "").replace(/\/+$/, "");
const ASSET_VERSION = String(process.env.ASSET_VERSION || "20260823-v2-effects-hotfix").replace(/[^a-zA-Z0-9._~-]/g, "");

function stageSourceInputs() {
  ensure(LOCAL_INPUT);
  if (!fs.existsSync(GRAPH_PATH)) fs.copyFileSync(EXTERNAL_GRAPH_PATH, GRAPH_PATH);
  if (!fs.existsSync(MANIFEST_PATH)) fs.copyFileSync(EXTERNAL_MANIFEST_PATH, MANIFEST_PATH);
  if (!fs.existsSync(SOURCE_ASSETS)) fs.cpSync(EXTERNAL_ASSETS, SOURCE_ASSETS, { recursive: true });
}

stageSourceInputs();
const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
const v3Delta = JSON.parse(fs.readFileSync(V3_DELTA_PATH, "utf8"));

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows.map((values) => Object.fromEntries(headers.map((header, i) => [header, values[i] || ""])));
}

const manifestRows = parseCsv(fs.readFileSync(MANIFEST_PATH, "utf8"));
const manifestByName = Object.fromEntries(manifestRows.map((row) => [row.canonical_space_name, row]));
const nodeById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
const districtByNode = {};
for (const district of graph.editorial_districts) {
  for (const id of district.nodes) districtByNode[id] = district.id;
}

const socialLabels = {
  orientation: "orientação",
  "first-arrival": "primeira chegada",
  chat: "conversa",
  waiting: "espera",
  "meeting-new-users": "conhecer pessoas",
  hangout: "encontro",
  meeting: "encontro",
  "social-display": "presença social",
  "quiet-sociality": "sociabilidade quieta",
  "subcultural-gathering": "reunião de subcultura",
  transit: "trânsito",
  exploration: "exploração",
  "chance-encounters": "encontros acidentais",
  queueing: "filas",
  spectatorship: "assistir",
  events: "eventos",
  seating: "assentos",
  "waiting-for-shows": "esperar apresentações",
  watching: "assistir",
  sitting: "sentar",
  swimming: "nadar",
  flirting: "flertar",
  "game-adjacent-play": "brincadeira próxima do jogo",
  viewing: "observar a vista",
  "quiet-hangout": "encontro tranquilo",
  competition: "competição",
  "skill-play": "jogo de habilidade",
  dating: "paquera",
  roleplay: "roleplay",
  "community-information": "informação comunitária",
  sessions: "sessões",
  "HC-hangout": "encontro HC",
  dancing: "dançar",
  nightlife: "vida noturna",
  food: "comida",
  "fan-site-adjacent-memory": "memória ligada a fan-sites",
  "casual-hangout": "encontro casual",
  "reading-roleplay": "roleplay de leitura",
  "quiet-chat": "conversa quieta",
  afk: "AFK",
  discovery: "descoberta",
  "themed-hangout": "encontro temático",
  "sports-fandom": "torcida esportiva",
  "group-display": "presença de grupo",
  "avatar-styling": "estilo do avatar",
  "game-queue": "fila de jogo",
  rest: "descanso",
  "archive-memory": "memória de arquivo"
};

const statusText = {
  documented: { pt: "documentado", en: "documented" },
  probable: { pt: "provável", en: "probable" },
  unknown: { pt: "em aberto", en: "open" },
  documented_historical: { pt: "documentado", en: "documented" },
  probable_historical: { pt: "provável", en: "probable" },
  testimony: { pt: "testemunho", en: "testimony" },
  editorial_relation: { pt: "editorial", en: "editorial" },
  unknown: { pt: "em aberto", en: "open" }
};

const relationText = {
  room_sequence: { pt: "sequência de salas", en: "room sequence" },
  doorway: { pt: "porta / passagem", en: "doorway / passage" },
  same_complex: { pt: "mesmo complexo", en: "same complex" },
  version_relation: { pt: "relação de variante", en: "version relation" },
  successor_predecessor: { pt: "linhagem / sucessão", en: "lineage / succession" },
  functional_relation: { pt: "relação funcional", en: "functional relation" },
  thematic_relation: { pt: "relação temática", en: "thematic relation" },
  editorial_path: { pt: "caminho editorial", en: "editorial path" }
};

const districtCopy = {
  arrival_and_lobby: {
    pt: { label: "Chegada / Lobbies", note: "o arquivo organiza estes lugares juntos" },
    en: { label: "Arrival / Lobby", note: "the archive organizes these places together" }
  },
  nightlife: {
    pt: { label: "Noite / Clubes", note: "agrupamento temático do arquivo" },
    en: { label: "Nightlife / Clubs", note: "thematic grouping made by the archive" }
  },
  leisure_outdoors: {
    pt: { label: "Lazer / Exterior", note: "agrupamento temático do arquivo" },
    en: { label: "Leisure / Outdoors", note: "thematic grouping made by the archive" }
  },
  culture_and_spectacle: {
    pt: { label: "Cultura / Espetáculo", note: "agrupamento temático do arquivo" },
    en: { label: "Culture / Spectacle", note: "thematic grouping made by the archive" }
  },
  food_and_cafes: {
    pt: { label: "Comida / Cafés", note: "agrupamento temático do arquivo" },
    en: { label: "Food / Cafes", note: "thematic grouping made by the archive" }
  },
  games_and_services: {
    pt: { label: "Jogos / Serviços", note: "agrupamento temático do arquivo" },
    en: { label: "Games / Services", note: "thematic grouping made by the archive" }
  }
};

// These coordinates describe the composition of the public experience only.
// They are deliberately named editorial/display coordinates: they are not a
// reconstruction of a historical floor plan or a claim of physical adjacency.
const editorialMap = {
  welcome_lounge: { x: 9, y: 18, scale: 1.03, layer: 3, cluster: "arrival" },
  main_lobby: { x: 25, y: 12, scale: 0.92, layer: 2, cluster: "arrival" },
  median_lobby: { x: 40, y: 21, scale: 0.7, layer: 2, cluster: "arrival" },
  skylight_lobby: { x: 54, y: 10, scale: 0.72, layer: 1, cluster: "arrival" },
  basement_lobby: { x: 17, y: 40, scale: 0.76, layer: 1, cluster: "arrival" },
  hallways: { x: 34, y: 35, scale: 1.02, layer: 4, cluster: "arrival" },
  dusty_lounge: { x: 8, y: 65, scale: 0.72, layer: 1, cluster: "arrival" },
  theatredrome: { x: 68, y: 22, scale: 1.06, layer: 3, cluster: "culture" },
  cinema: { x: 84, y: 16, scale: 0.9, layer: 2, cluster: "culture" },
  library: { x: 77, y: 38, scale: 0.74, layer: 1, cluster: "culture" },
  lido: { x: 52, y: 51, scale: 1.2, layer: 5, cluster: "water" },
  rooftop: { x: 64, y: 62, scale: 0.91, layer: 2, cluster: "water" },
  rooftop_rumble: { x: 84, y: 56, scale: 1.0, layer: 3, cluster: "night" },
  picnic_area: { x: 36, y: 66, scale: 0.86, layer: 2, cluster: "water" },
  infobus_park: { x: 11, y: 80, scale: 0.76, layer: 1, cluster: "water" },
  imperial_park: { x: 23, y: 77, scale: 0.83, layer: 2, cluster: "water" },
  club_massiva: { x: 77, y: 73, scale: 1.16, layer: 4, cluster: "night" },
  club_mammoth: { x: 92, y: 71, scale: 1.0, layer: 3, cluster: "night" },
  club_orient: { x: 68, y: 82, scale: 0.96, layer: 2, cluster: "night" },
  cafe_gold: { x: 52, y: 82, scale: 1.06, layer: 4, cluster: "food" },
  ice_cafe: { x: 65, y: 36, scale: 0.72, layer: 1, cluster: "food" },
  hotel_kitchen: { x: 40, y: 85, scale: 0.76, layer: 1, cluster: "food" },
  palazzo_pizza: { x: 29, y: 91, scale: 0.72, layer: 1, cluster: "food" },
  space_cafe: { x: 84, y: 89, scale: 0.77, layer: 2, cluster: "food" },
  stadium: { x: 6, y: 51, scale: 0.74, layer: 1, cluster: "service" },
  beauty_salon: { x: 93, y: 36, scale: 0.76, layer: 1, cluster: "service" },
  snowstorm_lobby: { x: 93, y: 9, scale: 0.84, layer: 2, cluster: "service" }
};

// A second, independent composition for the evidence graph. This is also a
// display layout, never a hotel map. Keeping it separate prevents accidental
// reuse of the portal composition as a historical topology claim.
const topologyMap = {
  welcome_lounge: [100, 110],
  main_lobby: [250, 180],
  median_lobby: [395, 235],
  skylight_lobby: [535, 165],
  basement_lobby: [480, 315],
  hallways: [310, 350],
  theatredrome: [720, 150],
  cinema: [850, 215],
  lido: [540, 455],
  rooftop: [720, 420],
  rooftop_rumble: [875, 510],
  picnic_area: [350, 510],
  infobus_park: [100, 575],
  imperial_park: [235, 500],
  club_massiva: [690, 585],
  club_mammoth: [850, 625],
  club_orient: [530, 625],
  cafe_gold: [470, 600],
  ice_cafe: [620, 300],
  library: [780, 330],
  hotel_kitchen: [320, 640],
  palazzo_pizza: [180, 660],
  space_cafe: [710, 690],
  stadium: [50, 420],
  beauty_salon: [930, 370],
  snowstorm_lobby: [930, 90],
  dusty_lounge: [170, 330]
};

function C(arrivalPt, arrivalEn, spatialPt, spatialEn, factsPt, factsEn) {
  return {
    arrival: { pt: arrivalPt, en: arrivalEn },
    spatial: { pt: spatialPt, en: spatialEn },
    facts: { pt: factsPt, en: factsEn }
  };
}

const copy = {
  welcome_lounge: C(
    "Você chega por um lugar feito para orientar, esperar e reconhecer os primeiros rostos.",
    "You arrive in a room made for orientation, waiting, and recognizing the first faces.",
    "A Recepção tem identidade de chegada, mas suas saídas históricas seguintes continuam sem prova suficiente.",
    "Welcome Lounge has a strong arrival identity, but its onward historical exits remain unproven.",
    ["A lista brasileira preserva a função de Recepção.", "A centralidade física é uma hipótese, não um fato."],
    ["The Brazilian roster preserves the reception function.", "Physical centrality is a hypothesis, not a fact."]
  ),
  main_lobby: C(
    "Um saguão amplo de espera e encontro, com o apelido local Saguão Yahoo! guardado como alias.",
    "A broad lobby for waiting and meeting, with the local Yahoo Lobby nickname kept as an alias.",
    "O nome local não cria uma segunda sala. A relação com os demais lobbies permanece em aberto.",
    "The local name does not create a second room. Its relation to other lobbies remains open.",
    ["O alias local não foi promovido a nó separado.", "Nenhuma porta específica foi confirmada."],
    ["The local alias is not promoted to a separate node.", "No specific doorway has been confirmed."]
  ),
  median_lobby: C(
    "O Saguão do Meio pertence à memória dos lobbies intermediários: lugar de passagem, espera e conversa.",
    "Median Lobby belongs to the memory of intermediate lobbies: a place for passing through, waiting, and talking.",
    "A família de lobbies é documentada; sua planta BR exata não é.",
    "The lobby family is documented; its exact BR layout is not.",
    ["A cronologia registra a adição do Median em 2001.", "A adjacência com Main Lobby permanece desconhecida."],
    ["The timeline records Median's addition in 2001.", "Its adjacency to Main Lobby remains unknown."]
  ),
  skylight_lobby: C(
    "Um saguão superior em nome e atmosfera, guardado aqui como identidade de lugar, não como coordenada literal.",
    "An upper lobby in name and atmosphere, preserved as a place identity rather than a literal coordinate.",
    "“Superior” descreve a sala no arquivo, mas não autoriza reconstruir um prédio vertical.",
    "“Upper” describes the room in the archive, but does not authorize rebuilding a vertical hotel.",
    ["A sala aparece na cronologia clássica.", "Sua conexão física com os outros lobbies não foi resolvida."],
    ["The room appears in the classic timeline.", "Its physical connection to other lobbies remains unresolved."]
  ),
  basement_lobby: C(
    "O Saguão Subterrâneo funciona como nome, clima e memória de encontro mais lateral.",
    "Basement Lobby works as a name, mood, and memory of a more lateral kind of gathering place.",
    "“Subterrâneo” é preservado como identidade histórica; não como prova de níveis conectados.",
    "“Basement” is preserved as historical identity, not proof of connected levels.",
    ["A cronologia registra a sala em 2001.", "A família de lobbies não tem planta BR confirmada."],
    ["The timeline records the room in 2001.", "The lobby family has no confirmed BR plan."]
  ),
  hallways: C(
    "Aqui o deslocamento é o conteúdo: corredores, espera e encontros que acontecem porque alguém está indo a algum lugar.",
    "Here movement is the content: corridors, waiting, and encounters that happen because someone is going somewhere.",
    "Hallways é uma família de corredores, não uma planta única. As variantes ficam relacionadas sem serem achatadas.",
    "Hallways is a corridor family, not one single plan. Variants remain related without being flattened.",
    ["A listagem preserva Hallway 1/2/3 e Hallway II.", "O grafo usa a imagem como síntese visual, não fusão ontológica."],
    ["Listings preserve Hallway 1/2/3 and Hallway II.", "The graph uses the image as a visual synthesis, not an ontological merge."]
  ),
  theatredrome: C(
    "Um teatro para esperar apresentações, escolher um assento e existir junto enquanto algo acontece.",
    "A theatre for waiting for shows, choosing a seat, and being together while something happens.",
    "Teatro e Cinema compartilham função cultural, não uma porta comprovada.",
    "Theatre and Cinema share a cultural function, not a proven doorway.",
    ["A identidade BR Teatro é preservada.", "Old Treat aparece como linhagem/homenagem posterior, não continuidade física."],
    ["The BR identity Teatro is preserved.", "Old Treat appears as later lineage/homage, not physical continuity."]
  ),
  cinema: C(
    "O Cinema é um lugar de assistir, sentar e transformar a espera em experiência coletiva.",
    "Cinema is a place to watch, sit, and turn waiting into a collective experience.",
    "A existência do Cinema é forte no arquivo BR; sua conexão com o Teatro permanece aberta.",
    "Cinema's existence is strong in the BR archive; its connection to Theatre remains open.",
    ["A retrospectiva brasileira inclui o Cinema entre os espaços históricos.", "A função compartilhada não prova adjacência."],
    ["The Brazilian retrospective includes Cinema among historical spaces.", "Shared function does not prove adjacency."]
  ),
  lido: C(
    "A Piscina é destino: água, fila, conversa, flerte e a vontade simples de entrar.",
    "The Pool is a destination: water, queues, conversation, flirting, and the simple wish to enter.",
    "O Lido é o complexo interno mais forte do corpus: deck, piscina e mergulho aparecem como relações prováveis.",
    "Lido is the strongest internal complex in the corpus: deck, pool, and diving appear as probable relations.",
    ["A cronologia registra o Lido em 2001.", "O arquivo histórico preserva três salas relacionadas."],
    ["The timeline records Lido in 2001.", "The historical archive preserves three related rooms."]
  ),
  rooftop: C(
    "A Cobertura oferece vista e pausa: um destino alto na imaginação, mesmo quando a topologia real fica em silêncio.",
    "Rooftop offers a view and a pause: a high destination in imagination, even when real topology stays silent.",
    "A retrospectiva confirma a identidade BR; a posição literal no hotel continua editorial.",
    "The retrospective confirms the BR identity; its literal position in the hotel remains editorial.",
    ["Cobertura aparece na memória histórica brasileira.", "Não foi ligada fisicamente à Piscina."],
    ["Cobertura appears in Brazilian historical memory.", "It was not physically linked to the Pool."]
  ),
  rooftop_rumble: C(
    "Wobble Squabble é fila, habilidade e plateia: o jogo começa antes da partida.",
    "Wobble Squabble is queue, skill, and spectatorship: the game begins before the match.",
    "O nome Rooftop Rumble é preservado em relação ao Wobble Squabble; o telhado não vira geografia automática.",
    "Rooftop Rumble is preserved in relation to Wobble Squabble; the rooftop does not become automatic geography.",
    ["A lista brasileira preserva a variante MisterApe.", "O grupo de salas é modelado sem duplicar a imagem canônica."],
    ["The Brazilian roster preserves the MisterApe variant.", "The room group is modeled without duplicating the canonical image."]
  ),
  picnic_area: C(
    "O Piquenique é um lugar de encontro sem pressa, paquera, roleplay e conversa ao ar livre.",
    "Picnic is an unhurried meeting place for flirting, roleplay, and outdoor conversation.",
    "O distrito exterior é uma organização do arquivo, não um bairro histórico.",
    "The outdoor district is an archive organization, not a historical neighborhood.",
    ["A retrospectiva brasileira identifica o Piquenique.", "Nenhuma vizinhança física foi afirmada."],
    ["The Brazilian retrospective identifies Picnic.", "No physical neighborhood has been asserted."]
  ),
  infobus_park: C(
    "O Parque do Infobus combina espera e encontro com uma função comunitária: sessões, informação e presença.",
    "Infobus Park combines waiting and meeting with a community function: sessions, information, and presence.",
    "O parque e o veículo são relacionados, mas não foram colapsados em uma única imagem.",
    "The park and vehicle are related, but were not collapsed into one image.",
    ["A ajuda oficial BR confirma o Infobus como espaço de sessões.", "A relação com outros parques é editorial."],
    ["Official BR help confirms Infobus as a session-based space.", "Its relation to other parks is editorial."]
  ),
  imperial_park: C(
    "O Parque Imperial é caminhada, pausa e descoberta por um caminho que o arquivo ainda não consegue desenhar inteiro.",
    "Imperial Park is walking, pausing, and discovering a path the archive cannot yet draw in full.",
    "O arquivo registra duas salas e um caminho; a segunda sala permanece auxiliar.",
    "The archive records two rooms and a path; the second room remains auxiliary.",
    ["A referência oficial BR ancora a identidade Parque Imperial.", "O caminho é provável, não uma planta completa."],
    ["Official BR material anchors the Imperial Park identity.", "The path is probable, not a complete plan."]
  ),
  club_massiva: C(
    "No Clube Massiva, a sala é uma pista: dança, noite, exibição e a promessa de descer mais um nível.",
    "At Club Massiva, the room is a dance floor: nightlife, display, and the promise of going one level further.",
    "A linhagem Club Slinky Helsinki → Club Massiva é documentada; o piso inferior é provável.",
    "The Club Slinky Helsinki → Club Massiva lineage is documented; the lower floor is probable.",
    ["A cronologia registra a mudança de nome em 2001.", "A reconstrução técnica sustenta uma sala inferior, não uma prova BR de porta."],
    ["The timeline records the name change in 2001.", "Technical reconstruction supports a lower room, not BR doorway proof."]
  ),
  club_mammoth: C(
    "O Clube Mamute é destino de encontro HC: uma sala reconhecível antes mesmo da explicação do arquivo.",
    "Club Mammoth is an HC gathering destination: a recognizable room before the archive explains it.",
    "A categoria de clube aproxima os espaços editorialmente; não prova um corredor entre eles.",
    "The club category groups spaces editorially; it does not prove a corridor between them.",
    ["O roster brasileiro preserva o Clube Mammoth.", "Nenhuma conexão física com outros clubes foi promovida."],
    ["The Brazilian roster preserves Club Mammoth.", "No physical connection to other clubs was promoted."]
  ),
  club_orient: C(
    "O Clube Oriente guarda o lado mais performático da sociabilidade: dançar, conversar e ser visto.",
    "Club Orient holds the performative side of social life: dancing, talking, and being seen.",
    "A fonte oficial BR confirma a identidade local; a topologia interna permanece não resolvida.",
    "Official BR material confirms the local identity; internal topology remains unresolved.",
    ["A referência oficial e o roster brasileiro convergem.", "O vínculo com outros clubes é apenas editorial."],
    ["Official material and the Brazilian roster converge.", "Its link to other clubs is editorial only."]
  ),
  cafe_gold: C(
    "O Café Dourado é um lugar de conversa e memória, onde o nome carrega tanto o espaço quanto a comunidade em volta dele.",
    "Cafe Gold is a place of conversation and memory, where the name carries both the room and the community around it.",
    "A entidade pública e a memória de fan-site permanecem relacionadas, sem serem confundidas.",
    "The public room and fan-site memory remain related without being confused.",
    ["A referência oficial BR confirma o espaço.", "A associação a fan-sites é memória adjacente, não identidade única."],
    ["Official BR material confirms the space.", "The fan-site association is adjacent memory, not one identity."]
  ),
  ice_cafe: C(
    "O Café Iced oferece uma pausa casual: comida, conversa e espera sem a solenidade de um grande destino.",
    "Ice Cafe offers a casual pause: food, conversation, and waiting without the ceremony of a grand destination.",
    "O nome local é estável; nenhuma porta para outros cafés foi afirmada.",
    "The local name is stable; no doorway to other cafes has been asserted.",
    ["A referência oficial BR preserva o nome Café Iced.", "A relação com outros cafés é temática."],
    ["Official BR material preserves the Café Iced name.", "Its relation to other cafes is thematic."]
  ),
  library: C(
    "A Biblioteca é uma sala de silêncio relativo: conversa baixa, AFK, leitura inventada e descoberta.",
    "Library is a room of relative quiet: low conversation, AFK time, invented reading, and discovery.",
    "A função social é uma leitura de sala sustentada por nome, bot e memória; não uma licença para inventar conexões.",
    "The social function is a room reading supported by name, bot, and memory; it is not a license to invent connections.",
    ["A lista brasileira e a referência oficial preservam a Biblioteca.", "Sua relação com Teatro/Cinema é cultural, não física."],
    ["The Brazilian list and official reference preserve Library.", "Its relation to Theatre/Cinema is cultural, not physical."]
  ),
  hotel_kitchen: C(
    "Na Cozinha, comida e roleplay fazem do serviço uma cena social.",
    "In the Kitchen, food and roleplay turn service into a social scene.",
    "A função de comida é forte; a passagem para cafés não está documentada.",
    "The food function is strong; a passage to cafes is not documented.",
    ["A retrospectiva brasileira inclui a Cozinha.", "A cronologia antiga registra Hotel Kitchen entre as salas clássicas."],
    ["The Brazilian retrospective includes the Kitchen.", "The old timeline records Hotel Kitchen among classic rooms."]
  ),
  palazzo_pizza: C(
    "A Pizzaria é encontro com objeto concreto: pedir, sentar, conversar e performar uma noite comum.",
    "The Pizzeria is a meeting with a concrete object: ordering, sitting, talking, and performing an ordinary night.",
    "O nome BR e a linhagem internacional são relacionados, mas não tratados como identidade global única.",
    "The BR name and international lineage are related, but not treated as one global identity.",
    ["A retrospectiva brasileira preserva a Pizzaria Bobbaschio's.", "A conexão com outros espaços de comida é editorial."],
    ["The Brazilian retrospective preserves Bobbaschio's Pizzeria.", "The link to other food spaces is editorial."]
  ),
  space_cafe: C(
    "A Via Láctea é um café temático: um pequeno desvio cósmico dentro da rotina social.",
    "Space Cafe is a themed cafe: a small cosmic detour inside ordinary social life.",
    "O alias Via Láctea é ancorado por referência oficial BR; a vizinhança temática é editorial.",
    "The Via Lactea alias is anchored by official BR material; thematic proximity is editorial.",
    ["A referência oficial BR preserva Via Láctea / Space Cafe.", "Nenhuma passagem entre cafés foi afirmada."],
    ["Official BR material preserves Via Lactea / Space Cafe.", "No passage between cafes has been asserted."]
  ),
  stadium: C(
    "O Estádio transforma presença de grupo em evento: torcida, competição e exibição.",
    "The Stadium turns group presence into an event: fandom, competition, and display.",
    "A função esportiva é documentada no roster; a ligação com lobbies de jogos permanece aberta.",
    "The sports function is documented in the roster; its link to game lobbies remains open.",
    ["A lista brasileira preserva o Estádio.", "A categoria de jogo não define sua posição no hotel."],
    ["The Brazilian roster preserves Stadium.", "The game category does not define its position in the hotel."]
  ),
  beauty_salon: C(
    "O Salão de Beleza é serviço e palco: ajustar o avatar também é aparecer para os outros.",
    "Beauty Salon is service and stage: adjusting an avatar is also appearing for others.",
    "O arquivo registra duas salas, mas a segunda permanece sem nome e sem imagem canônica.",
    "The archive records two rooms, but the second remains unnamed and without a canonical image.",
    ["A lista brasileira preserva a função de salão.", "A segunda sala é auxiliar, não uma nova imagem canônica."],
    ["The Brazilian list preserves the salon function.", "The second room is auxiliary, not a new canonical image."]
  ),
  snowstorm_lobby: C(
    "A Cabine de Neve é o lugar da fila antes do jogo: expectativa, competição e plateia.",
    "Snowstorm Lobby is the queue before the game: anticipation, competition, and spectatorship.",
    "A retrospectiva BR confirma a presença da cabine/saguão no recorte de 2014.",
    "The BR retrospective confirms the cabin/lobby in its 2014 snapshot.",
    ["O lobby é mantido como espaço de jogo, não como todo o SnowStorm.", "Sua relação com o Estádio permanece aberta."],
    ["The lobby is kept as a game space, not the whole SnowStorm.", "Its relation to Stadium remains open."]
  ),
  dusty_lounge: C(
    "O Sótão é um recuo: descanso, conversa quieta e a sensação de que o arquivo também guarda lugares menores.",
    "Dusty Lounge is a retreat: rest, quiet conversation, and the sense that the archive also keeps smaller places.",
    "O alias Sótão é local; “Dusty Lounge” permanece como nome internacional de referência.",
    "Sótão is the local alias; “Dusty Lounge” remains the international reference name.",
    ["O roster brasileiro preserva a identidade local.", "A função de descanso é uma leitura social da sala."],
    ["The Brazilian roster preserves the local identity.", "The resting function is a social reading of the room."]
  )
};

function esc(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function ensure(dir) { fs.mkdirSync(dir, { recursive: true }); }
function write(file, content) { ensure(path.dirname(file)); fs.writeFileSync(file, content); }
function copyFile(from, to) { ensure(path.dirname(to)); fs.copyFileSync(from, to); }

function sitePath(pathname) {
  const normalized = String(pathname).startsWith("/") ? String(pathname) : "/" + String(pathname);
  return BASE_PATH + normalized;
}

function versionedAssetPath(pathname) {
  const parsed = path.posix.parse(String(pathname));
  return sitePath(`${parsed.dir}/${parsed.name}-${ASSET_VERSION}${parsed.ext}`);
}

function pageUrl(locale, id) {
  return sitePath(locale === "pt-br" ? "/pt-br/lugar/" + id + "/" : "/en/place/" + id + "/");
}
function homeUrl(locale) { return sitePath(locale === "pt-br" ? "/pt-br/" : "/en/"); }
function topologyUrl(locale) { return sitePath(locale === "pt-br" ? "/pt-br/topologia/" : "/en/topology/"); }
function methodUrl(locale) { return sitePath(locale === "pt-br" ? "/pt-br/metodo/" : "/en/method/"); }
function slug(value) { return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// The landing surface is an editorial sequence, not an alphabetic catalog or
// a claim about historical adjacency. It moves from arrival to water, night,
// culture, outdoors, service, and finally the quieter lobby/archive rooms.
const presentationOrder = [
  "welcome_lounge", "main_lobby", "lido", "hallways", "rooftop", "rooftop_cafe", "rooftop_rumble",
  "chromide_club", "club_massiva", "club_mammoth", "club_orient", "habburgers", "net_cafe", "cafe_gold",
  "space_cafe", "cinema", "battle_ball_lounge", "theatredrome", "infobus_park", "imperial_park",
  "floating_garden", "zen_garden", "picnic_area", "stadium", "beauty_salon", "ice_cafe", "library",
  "hotel_kitchen", "palazzo_pizza", "snowstorm_lobby", "basement_lobby", "median_lobby", "skylight_lobby",
  "dusty_lounge"
];
const presentationOrderMap = Object.fromEntries(presentationOrder.map((id, index) => [id, index + 1]));

function normalizedPlace(node) {
  const manifest = manifestByName[node.canonical_name_en] || {};
  const localized = copy[node.id] || C("Um destino preservado pelo arquivo.", "A destination preserved by the archive.", node.notes, node.notes, [node.notes], [node.notes]);
  const presentationFilename = node.image_filename.replace(/\.[^.]+$/, "__presentation.png");
  const primaryVariant = {
    id: `${node.id}_primary`,
    labelPt: "Sala principal",
    labelEn: "Main room",
    kind: "primary",
    filename: node.image_filename,
    presentationFilename,
    width: Number(String(manifest.original_dimensions || "").split("x")[0]) || null,
    height: Number(String(manifest.original_dimensions || "").split("x")[1]) || null,
    format: manifest.file_format || null,
    temporalStatus: node.temporal_status,
    rightsStatus: node.rights_status,
    provenanceId: "manifest:" + node.id,
    sourcePageUrl: manifest.source_page_url || null,
    directImageUrl: manifest.direct_image_url || null,
    notes: "Primary image preserved by the V1 manifest."
  };
  return {
    id: node.id,
    slug: node.id,
    canonicalNamePtBr: node.canonical_name_pt,
    canonicalNameEn: node.canonical_name_en,
    aliases: node.aliases,
    category: node.room_category,
    editorialDistrict: districtByNode[node.id] || null,
    editorialMapPosition: editorialMap[node.id] || { x: 50, y: 50, scale: 1, layer: 1, cluster: "arrival" },
    presentationOrder: presentationOrderMap[node.id] || 999,
    visualCluster: editorialMap[node.id]?.cluster || "arrival",
    topologyDisplayPosition: topologyMap[node.id] || [500, 330],
    hotelLocale: [node.hotel_locale],
    technicalEra: [node.technical_era],
    visualEra: [node.visual_era],
    communityEra: node.historical_introduction_year === "undated" ? [] : [node.historical_introduction_year],
    image: {
      filename: node.image_filename,
      width: Number(String(manifest.original_dimensions || "").split("x")[0]) || null,
      height: Number(String(manifest.original_dimensions || "").split("x")[1]) || null,
      format: manifest.file_format || null,
      temporalStatus: node.temporal_status,
      rightsStatus: node.rights_status,
      provenanceId: "manifest:" + node.id,
      presentationFilename
    },
    groupId: node.id,
    variants: [primaryVariant],
    grouped: false,
    arrivalText: localized.arrival,
    socialUses: node.social_function,
    socialUsesPtBr: node.social_function.map((item) => socialLabels[item] || item),
    socialUsesEn: node.social_function,
    spatialNotes: localized.spatial,
    shortFacts: localized.facts,
    topologyStatus: node.historical_topology_status,
    landmarkStrength: node.landmark_strength,
    versionLineage: node.spatial_lineage.version_lineage,
    relatedArchiveItems: node.evidence_sources,
    sourceManifestRow: node.source_manifest_row,
    accessEvidence: node.access.br_evidence,
    notes: node.notes,
    complexStructure: node.complex_structure,
    sourcePageUrl: manifest.source_page_url || null,
    directImageUrl: manifest.direct_image_url || null
  };
}

function normalizedV3Place(item) {
  const variants = item.variants.map((variant) => ({ ...variant }));
  const primary = variants[0];
  return {
    id: item.id,
    slug: item.id,
    canonicalNamePtBr: item.canonicalNamePtBr,
    canonicalNameEn: item.canonicalNameEn,
    aliases: item.aliases || [],
    category: item.category,
    editorialDistrict: item.district || null,
    editorialMapPosition: editorialMap[item.id] || { x: 50, y: 50, scale: 1, layer: 1, cluster: item.visualCluster || "arrival" },
    presentationOrder: presentationOrderMap[item.id] || item.presentationOrder || 999,
    visualCluster: item.visualCluster || "arrival",
    topologyDisplayPosition: topologyMap[item.id] || [500, 330],
    hotelLocale: item.hotelLocale || ["brpt"],
    technicalEra: item.technicalEra || [],
    visualEra: item.visualEra || [],
    communityEra: item.communityEra || [],
    image: { ...primary },
    groupId: item.groupId || item.id,
    variants,
    grouped: variants.length > 1,
    arrivalText: item.arrivalText,
    socialUses: item.socialUses || [],
    socialUsesPtBr: (item.socialUses || []).map((value) => socialLabels[value] || value),
    socialUsesEn: item.socialUses || [],
    spatialNotes: item.spatialNotes,
    shortFacts: item.facts,
    topologyStatus: item.topologyStatus || "probable",
    landmarkStrength: item.landmarkStrength || "medium",
    versionLineage: item.versionLineage || [],
    relatedArchiveItems: item.relatedArchiveItems || [],
    sourceManifestRow: item.sourceManifestRow || item.id,
    accessEvidence: item.accessEvidence || "secondary_public_room_archive",
    notes: item.notes || "",
    complexStructure: item.complexStructure || { roomCount: variants.length, knownSubrooms: [], evidenceStatus: "probable_historical", note: "" },
    sourcePageUrl: item.sourcePageUrl || null,
    directImageUrl: item.directImageUrl || null
  };
}

const places = graph.nodes.map(normalizedPlace);
for (const item of v3Delta.accepted || []) places.push(normalizedV3Place(item));
for (const addition of v3Delta.variantAdditions || []) {
  const group = places.find((place) => place.groupId === addition.groupId || place.id === addition.groupId);
  if (!group || !addition.variant) continue;
  group.variants = [...(group.variants || [group.image]), { ...addition.variant }];
  group.grouped = group.variants.length > 1;
}
const presentationPlaces = [...places].sort((a, b) => a.presentationOrder - b.presentationOrder);
const placeById = Object.fromEntries(places.map((place) => [place.id, place]));
const auxiliaryById = Object.fromEntries(graph.auxiliary_nodes.map((item) => [item.id, item]));
const edges = graph.edges.map((edge) => ({
  id: edge.edge_id,
  from: edge.from,
  to: edge.to,
  relationType: edge.relation_type,
  evidenceStatus: edge.relation_status,
  directionality: edge.directionality,
  eraScope: edge.era ? [edge.era] : [],
  localeScope: edge.hotel_locale ? [edge.hotel_locale] : [],
  evidenceRefs: edge.evidence_sources,
  label: edge.label || "",
  notes: edge.notes || ""
}));
const districts = graph.editorial_districts.map((district) => ({
  id: district.id,
  labelPtBr: districtCopy[district.id]?.pt.label || district.label_pt,
  labelEn: districtCopy[district.id]?.en.label || district.label_en,
  notePtBr: districtCopy[district.id]?.pt.note || district.note,
  noteEn: districtCopy[district.id]?.en.note || district.note,
  status: district.status,
  nodes: district.nodes
}));
const provenance = Object.fromEntries(places.flatMap((place) => (place.variants || [place.image]).map((variant) => [variant.provenanceId, {
  id: variant.provenanceId,
  placeId: place.id,
  groupId: place.groupId || place.id,
  variantId: variant.id,
  manifestRow: place.sourceManifestRow,
  sourcePageUrl: variant.sourcePageUrl || place.sourcePageUrl,
  directImageUrl: variant.directImageUrl || place.directImageUrl,
  archiveManifestUrl: BASE_PATH ? sitePath("/PUBLICATION_MANIFEST.md") : "https://drive.google.com/file/d/1rixJo098kyTjgfVAosBrQpAv6AdbDUas/view?usp=drivesdk",
  scopeUrl: BASE_PATH ? "https://habboxwiki.com/Category:Public_Rooms" : "https://drive.google.com/file/d/1pLjpkN5VNYkdORhfdQqsbUcqzzI6xMfs/view?usp=drivesdk",
  temporalStatus: variant.temporalStatus,
  rightsStatus: variant.rightsStatus,
  presentationFilename: variant.presentationFilename || null
}])));

function statusClass(status) {
  return {
    documented: "documented",
    probable: "probable",
    unknown: "unknown",
    documented_historical: "documented",
    probable_historical: "probable",
    testimony: "testimony",
    editorial_relation: "editorial"
  }[status] || "unknown";
}
function labelStatus(status, locale) {
  const item = statusText[status] || statusText.unknown;
  return locale === "pt-br" ? item.pt : item.en;
}
function labelRelation(type, locale) {
  const item = relationText[type] || { pt: type, en: type };
  return locale === "pt-br" ? item.pt : item.en;
}
function endpointName(id, locale) {
  if (placeById[id]) return locale === "pt-br" ? placeById[id].canonicalNamePtBr : placeById[id].canonicalNameEn;
  return auxiliaryById[id]?.label || id;
}
function relatedEdges(placeId) { return edges.filter((edge) => edge.from === placeId || edge.to === placeId); }
function topologicalEdges(placeId) { return relatedEdges(placeId).filter((edge) => edge.evidenceStatus !== "editorial_relation"); }
function editorialPeers(placeId) {
  const district = districtByNode[placeId];
  if (!district) return [];
  return graph.editorial_districts.find((item) => item.id === district)?.nodes.filter((id) => id !== placeId && placeById[id]).slice(0, 3).map((id) => placeById[id]) || [];
}
function linkFor(locale, id) { return pageUrl(locale, id); }
function localizedName(place, locale) { return locale === "pt-br" ? place.canonicalNamePtBr : place.canonicalNameEn; }
function alternateLocalePath(locale, kind, id) {
  const other = locale === "pt-br" ? "en" : "pt-br";
  if (kind === "home") return homeUrl(other);
  if (kind === "topology") return topologyUrl(other);
  if (kind === "method") return methodUrl(other);
  return pageUrl(other, id);
}

function header(locale, active, alternate) {
  const isPt = locale === "pt-br";
  const home = homeUrl(locale);
  return [
    "<header class='site-header'><a class='identity' href='", home, "' aria-label='", isPt ? "Voltar ao mapa" : "Back to map", "'><span class='identity-mark' aria-hidden='true'></span><span class='identity-name'>Blog Nostalgia</span><span class='identity-sub'>/ Habbo places</span></a>",
    "<div class='header-actions'><nav class='subnav' aria-label='", isPt ? "Navegação principal" : "Primary navigation", "'><a href='", home, "'>", isPt ? "mapa" : "map", "</a><a href='", topologyUrl(locale), "'>", isPt ? "topologia" : "topology", "</a><a href='", methodUrl(locale), "'>", isPt ? "método" : "method", "</a></nav>",
    "<nav class='language-switch' aria-label='", isPt ? "Idioma" : "Language", "'><a href='", isPt ? home : alternate, "' aria-current='", active === "home" && isPt ? "page" : "false", "'>PT-BR</a><span aria-hidden='true'>|</span><a href='", isPt ? alternate : home, "' aria-current='", active === "home" && !isPt ? "page" : "false", "'>", isPt ? "EN" : "EN", "</a></nav></div></header>"
  ].join("");
}

function footer(locale) {
  const isPt = locale === "pt-br";
  return [
    "<footer class='site-footer'><span class='internal-stamp'>Public Prototype V0 · independent archive · noindex</span>",
    "<p>", isPt ? "Protótipo público de arquivo independente. As imagens seguem o estado public_reference_only e são exibidas sob a leitura delimitada da política de Fan Sites; isso não é uma licença irrevogável." : "Public prototype of an independent archive. Images remain public_reference_only and are displayed under a bounded reading of the Fansite Policy; this is not an irrevocable licence.", "</p>",
    "<p class='rights-disclaimer'>This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. This fan site may use the trademarks and other intellectual property of Habbo, which is permitted under Habbo Fan Site Policy.</p>",
    "<p class='rights-disclaimer'>", isPt ? "Este fan site não é afiliado, endossado, patrocinado nem especificamente aprovado pela Sulake Oy ou suas afiliadas. O uso de marcas e propriedade intelectual do Habbo segue a política de Fan Sites." : "This is an unofficial, non-affiliated historical archive.", "</p>",
    "<p><a class='text-link' href='", methodUrl(locale), "'>", isPt ? "Como este mapa sabe o que sabe" : "How this map knows what it knows", "</a></p></footer>"
  ].join("");
}

function layout(locale, active, alternate, title, body, pageType) {
  const isPt = locale === "pt-br";
  return [
    "<!doctype html><html lang='", isPt ? "pt-BR" : "en", "'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><meta name='robots' content='noindex,nofollow,noarchive'><meta name='description' content='", esc(isPt ? "Protótipo público de arquivo espacial independente sobre lugares públicos clássicos do Habbo BR." : "Public prototype of an independent spatial archive of classic Habbo BR public places."), "'><title>", esc(title), "</title><link rel='stylesheet' href='", versionedAssetPath("/assets/site.css"), "'></head><body data-page='", pageType, "'><div class='site-shell'>",
    header(locale, active, alternate), body, footer(locale), "</div><script src='", versionedAssetPath("/assets/site.js"), "' defer></script></body></html>"
  ].join("");
}

function statusTag(status, locale) {
  return "<span class='status status--" + statusClass(status) + "'>" + esc(labelStatus(status, locale)) + "</span>";
}

function placeNodeMarkup(place, locale) {
  const name = localizedName(place, locale);
  const otherName = locale === "pt-br" ? place.canonicalNameEn : place.canonicalNamePtBr;
  const district = districtCopy[place.editorialDistrict]?.[locale === "pt-br" ? "pt" : "en"].label || "";
  const search = [place.canonicalNamePtBr, place.canonicalNameEn, ...place.aliases, district].join(" ").toLocaleLowerCase();
  return "<a class='place-node" + (place.landmarkStrength === "high" ? " place-node--landmark" : "") + "' data-place-node data-place-search='" + esc(search) + "' href='" + linkFor(locale, place.id) + "'><img src='" + sitePath("/assets/archive-reference/assets/" + place.image.filename) + "' alt='" + esc(name) + "' loading='lazy'><span class='place-node-body'><span class='place-node-name'>" + esc(name) + "</span><span class='place-node-en'>" + esc(otherName) + "</span><span class='place-node-status'>" + esc(labelStatus(place.topologyStatus, locale)) + "</span></span></a>";
}

function renderHome(locale) {
  const isPt = locale === "pt-br";
  const intro = isPt ? "Um mapa editorial de lugares lembrados. Entre por uma imagem; leia a história depois." : "An editorial map of remembered places. Enter through an image; read the history afterwards.";
  const openLabel = isPt ? "abrir todos os distritos" : "open all districts";
  const closeLabel = isPt ? "fechar todos os distritos" : "close all districts";
  const districtMarkup = districts.map((district, index) => {
    const d = districtCopy[district.id]?.[isPt ? "pt" : "en"];
    const nodes = district.nodes.map((id) => placeById[id]).filter(Boolean).map((place) => placeNodeMarkup(place, locale)).join("");
    return "<details class='district-island' data-district " + (index === 0 ? "open" : "") + "><summary class='district-summary'><span><span class='district-kicker'>editorial grouping</span><h2>" + esc(d.label) + "</h2><p>" + esc(d.note) + "</p></span></summary><div class='place-cluster'>" + nodes + "</div></details>";
  }).join("");
  const body = [
    "<main><section class='page-intro' aria-labelledby='home-title'><div><p class='eyebrow'>", isPt ? "Habbo · arquivo espacial BR" : "Habbo · BR spatial archive", "</p><h1 id='home-title'>", isPt ? "Onde você quer entrar?" : "Where do you want to enter?", "</h1></div><div><p>", esc(intro), "</p><p class='quiet-note'>", isPt ? "27 lugares · seis agrupamentos editoriais · nenhuma geografia inventada." : "27 places · six editorial groupings · no invented geography.", "</p></div></section>",
    "<section class='map-field' aria-labelledby='map-title'><div class='map-field-header'><strong id='map-title'>", isPt ? "Atlas de lugares" : "Place atlas", "</strong><span>", isPt ? "o arquivo organiza; a história distingue" : "the archive organizes; history distinguishes", "</span></div>",
    "<div class='map-field-footer'><label for='place-search' class='quiet-note'>", isPt ? "procurar lugar ou alias" : "search place or alias", "</label><input id='place-search' data-place-search type='search' placeholder='", isPt ? "Piscina, Hallways..." : "Pool, Hallways...", "' aria-label='", isPt ? "Procurar lugar ou alias" : "Search place or alias", "'><button class='button button--quiet' type='button' data-open-all-districts data-open-label='", esc(openLabel), "' data-close-label='", esc(closeLabel), "'>", esc(openLabel), "</button></div><div class='district-grid'>", districtMarkup, "</div></section>",
    "<section class='homepage-footer'><span>", isPt ? "B é a superfície. C acontece entre as portas. A mostra o que sabemos." : "B is the surface. C happens between doors. A shows what we know.", "</span><a class='text-link' href='", topologyUrl(locale), "'>", isPt ? "abrir camada de evidência →" : "open evidence layer →", "</a></section></main>"
  ].join("");
  return layout(locale, "home", alternateLocalePath(locale, "home"), isPt ? "Habbo — Lugares" : "Habbo — Places", body, "home");
}

function edgeMarkup(edge, locale) {
  const from = endpointName(edge.from, locale);
  const to = endpointName(edge.to, locale);
  const note = edge.notes || (locale === "pt-br" ? "Relação sem nota adicional." : "No additional relation note.");
  return "<li class='edge-card' data-edge-status='" + esc(edge.evidenceStatus) + "' data-status='" + esc(edge.evidenceStatus) + "'><div class='edge-route'><span>" + esc(from) + "</span><span class='arrow' aria-hidden='true'>→</span><span>" + esc(to) + "</span></div><div class='edge-meta'>" + statusTag(edge.evidenceStatus, locale) + "<span class='meta-chip'>" + esc(labelRelation(edge.relationType, locale)) + "</span></div><p class='edge-note'>" + esc(note) + "</p></li>";
}

function renderPlace(place, locale) {
  const isPt = locale === "pt-br";
  const otherName = isPt ? place.canonicalNameEn : place.canonicalNamePtBr;
  const localized = copy[place.id] || { arrival: place.arrivalText, spatial: place.spatialNotes, facts: place.shortFacts };
  const localizedCopy = { arrival: localized.arrival[isPt ? "pt" : "en"], spatial: localized.spatial[isPt ? "pt" : "en"], facts: localized.facts[isPt ? "pt" : "en"] };
  const localizedUses = isPt ? place.socialUsesPtBr : place.socialUsesEn;
  const edgesForPlace = topologicalEdges(place.id);
  const peers = editorialPeers(place.id);
  const facts = localizedCopy.facts.map((fact) => "<li>" + esc(fact) + "</li>").join("");
  const social = localizedUses.map((item) => "<li>" + esc(item) + "</li>").join("");
  const topology = edgesForPlace.length ? edgesForPlace.map((edge) => edgeMarkup(edge, locale)).join("") : "<li class='quiet-note'>" + (isPt ? "Nenhuma relação de porta foi promovida para este lugar." : "No doorway relation has been promoted for this place.") + "</li>";
  const editorial = peers.map((item) => "<a class='button button--quiet' href='" + linkFor(locale, item.id) + "'>" + esc(localizedName(item, locale)) + "</a>").join("");
  const manifest = manifestByName[place.canonicalNameEn] || {};
  const drawerOpen = isPt ? "abrir proveniência" : "open provenance";
  const drawerClose = isPt ? "fechar proveniência" : "close provenance";
  const body = [
    "<main class='place-page'><section class='place-heading'><div class='place-heading-copy'><p class='arrival-label'>", isPt ? "você está aqui · espaço público · brpt" : "you are here · public space · brpt", "</p><h1>", esc(localizedName(place, locale)), "</h1><p class='english-name'>", esc(otherName), "</p></div><div class='header-actions'>", statusTag(place.topologyStatus, locale), "<a class='button button--quiet' href='", homeUrl(locale), "'>← ", isPt ? "voltar ao mapa" : "back to map", "</a></div></section>",
    "<section class='place-hero'><figure class='place-image-frame'><img src='", sitePath("/assets/archive-reference/assets/" + place.image.filename), "' alt='", esc(localizedName(place, locale)), "'><figcaption class='image-caption'><span>", esc(manifest.original_dimensions || ""), " · ", esc(manifest.file_format || ""), "</span><span>", esc(place.image.rightsStatus), "</span></figcaption></figure>",
    "<aside class='place-sidebar'><h2>", isPt ? "Você chegou" : "You are here", "</h2><p>", esc(localizedCopy.arrival), "</p><div class='facts'><div class='fact'><span class='fact-label'>", isPt ? "distrito" : "district", "</span><span class='fact-value'>", esc(districtCopy[place.editorialDistrict]?.[isPt ? "pt" : "en"].label || ""), "</span></div><div class='fact'><span class='fact-label'>", isPt ? "era visual" : "visual era", "</span><span class='fact-value'>", esc(place.visualEra.join(", ")), "</span></div><div class='fact'><span class='fact-label'>locale</span><span class='fact-value'>", esc(place.hotelLocale.join(", ")), "</span></div><div class='fact'><span class='fact-label'>landmark</span><span class='fact-value'>", esc(place.landmarkStrength), "</span></div></div>",
    "<div class='drawer' data-drawer data-open='false'><button class='drawer-button' type='button' data-drawer-toggle='#provenance' data-open-label='", esc(drawerOpen), "' data-close-label='", esc(drawerClose), "' aria-expanded='false' aria-controls='provenance'>", esc(drawerOpen), "</button><div class='drawer-content' id='provenance'><dl><dt>", isPt ? "fonte" : "source", "</dt><dd><a class='text-link' href='", esc(place.sourcePageUrl || "#"), "' rel='noreferrer'>", esc(place.sourcePageUrl || "not recovered"), "</a></dd><dt>", isPt ? "imagem direta" : "direct image", "</dt><dd><a class='text-link' href='", esc(place.directImageUrl || "#"), "' rel='noreferrer'>", esc(place.directImageUrl || "not recovered"), "</a></dd><dt>temporal</dt><dd>", esc(place.image.temporalStatus), "</dd><dt>", isPt ? "direitos" : "rights", "</dt><dd>", esc(place.image.rightsStatus), "</dd><dt>", isPt ? "manifesto" : "manifest", "</dt><dd><a class='text-link' href='", sitePath("/PUBLICATION_MANIFEST.md"), "'>", isPt ? "ver manifesto de publicação" : "view publication manifest", "</a></dd></dl></div></div></aside></section>",
    "<section class='place-sections'><article class='content-panel'><h2>", isPt ? "Vida no lugar" : "Life here", "</h2><ul class='social-list'>", social, "</ul><h2 style='margin-top:1.4rem'>", isPt ? "Contexto curto" : "Short context", "</h2><ul>", facts, "</ul></article><article class='content-panel'><h2>", isPt ? "Anatomia espacial" : "Spatial anatomy", "</h2><p>", esc(localizedCopy.spatial), "</p><ul class='edge-list'>", topology, "</ul></article><article class='content-panel content-panel--wide'><h2>", isPt ? "Continue explorando" : "Continue exploring", "</h2><p class='quiet-note'>", isPt ? "Caminhos editoriais ajudam a circular; não fingem portas históricas." : "Editorial paths help you move; they do not pretend to be historical doors.", "</p><div class='header-actions'>", editorial || "<span class='quiet-note'>" + (isPt ? "Nenhum vizinho editorial." : "No editorial neighbor.") + "</span>", "</div></article></section></main>"
  ].join("");
  return layout(locale, "place", alternateLocalePath(locale, "place", place.id), localizedName(place, locale) + " — Habbo", body, "place");
}

function renderTopology(locale) {
  const isPt = locale === "pt-br";
  const counts = ["documented_historical", "probable_historical", "testimony", "editorial_relation", "unknown"].map((status) => [status, edges.filter((edge) => edge.evidenceStatus === status).length]);
  const filters = [["all", isPt ? "todas" : "all"], ...counts.map(([status]) => [status, labelStatus(status, locale)])].map(([key, label], index) => "<button class='filter-button' type='button' data-topology-filter='" + key + "' data-active='" + (index === 0 ? "true" : "false") + "'>" + esc(label) + "</button>").join("");
  const edgeList = edges.map((edge) => edgeMarkup(edge, locale)).join("");
  const body = [
    "<main><section class='topology-intro'><p class='eyebrow'>", isPt ? "camada A · evidência" : "layer A · evidence", "</p><h1>", isPt ? "O que sabemos sobre as portas?" : "What do we know about the doors?", "</h1><p>", isPt ? "Esta camada não é a entrada emocional do arquivo. Ela separa relações documentadas, prováveis, testemunhais, editoriais e ainda abertas. Unknown é uma pergunta em suspenso, não um vazio histórico." : "This is not the archive's emotional entry point. It separates documented, probable, testimonial, editorial, and still-open relations. Unknown is a question held open, not historical emptiness.", "</p></section><section class='evidence-rail' aria-label='", isPt ? "Contagens por estado" : "Counts by status", "'>", counts.map(([status, count]) => "<div class='evidence-count'><strong>" + count + "</strong><span>" + esc(labelStatus(status, locale)) + "</span></div>").join(""), "</section><section class='content-panel'><div class='topology-controls'>", filters, "</div><ol class='topology-list'>", edgeList, "</ol></section></main>"
  ].join("");
  return layout(locale, "topology", alternateLocalePath(locale, "topology"), isPt ? "Topologia histórica — Habbo" : "Historical topology — Habbo", body, "topology");
}

function renderMethod(locale) {
  const isPt = locale === "pt-br";
  const body = [
    "<main class='method-body'><p class='eyebrow'>", isPt ? "camada de confiança" : "trust layer", "</p><h1>", isPt ? "Como este mapa sabe o que sabe" : "How this map knows what it knows", "</h1><p>", isPt ? "O projeto é um arquivo independente de pesquisa. A superfície é espacial porque lugares são a unidade de memória; a metodologia fica disponível sem ocupar a porta de entrada." : "This is an independent research archive. The surface is spatial because places are the unit of memory; the method remains available without occupying the doorway.", "</p><div class='method-grid'>",
    "<article class='method-card'><h2>", isPt ? "Original e referência" : "Original and reference", "</h2><p>", isPt ? "As imagens vêm do corpus preservado e são mantidas em cópia interna com proveniência. A posse arquivística não equivale a licença de republicação." : "Images come from the preserved corpus and are kept as internal copies with provenance. Archival possession is not republication clearance.", "</p></article>",
    "<article class='method-card'><h2>", isPt ? "Cinco estados" : "Five states", "</h2><ul><li>", isPt ? "documentado histórico" : "documented historical", "</li><li>", isPt ? "provável histórico" : "probable historical", "</li><li>", isPt ? "testemunho" : "testimony", "</li><li>", isPt ? "relação editorial" : "editorial relation", "</li><li>", isPt ? "desconhecido / em aberto" : "unknown / open", "</li></ul></article>",
    "<article class='method-card'><h2>", isPt ? "Por que não há um mapa perfeito" : "Why there is no perfect map", "</h2><p>", isPt ? "Salas variavam por hotel, época e cliente. Agrupamento no arquivo pode ajudar a navegar sem ser uma afirmação de vizinhança histórica." : "Rooms varied by hotel, era, and client. Archive grouping can help navigation without becoming a claim of historical proximity.", "</p></article>",
    "<article class='method-card'><h2>", isPt ? "Publicação delimitada" : "Bounded publication", "</h2><p>", isPt ? "Este é um protótipo público sem indexação, não oficial e não comercial. Os assets permanecem public_reference_only; a exibição segue uma leitura delimitada da política de Fan Sites, sujeita a revogação ou remoção." : "This is a public, unindexed, unofficial, non-commercial prototype. Assets remain public_reference_only; display follows a bounded reading of the Fansite Policy and remains subject to revocation or removal.", "</p></article>",
    "<article class='method-card'><h2>", isPt ? "Proveniência" : "Provenance", "</h2><p>", isPt ? "Cada lugar expõe fonte, imagem direta, manifesto, status temporal e direitos em uma camada secundária." : "Each place exposes source, direct image, manifest, temporal status, and rights in a secondary layer.", "</p></article>",
    "<article class='method-card'><h2>", isPt ? "Próximo olhar" : "Next look", "</h2><p>", isPt ? "A Alpha deve ser julgada pelo desejo de entrar em um lugar, não pela quantidade de módulos que consegue exibir." : "The Alpha should be judged by the desire to enter a place, not by how many modules it can display.", "</p></article>",
    "</div></main>"
  ].join("");
  return layout(locale, "method", alternateLocalePath(locale, "method"), isPt ? "Método — Habbo" : "Method — Habbo", body, "method");
}

/* ------------------------------------------------------------------------
 * Public V1 surface
 * ------------------------------------------------------------------------
 * The V0 functions above are retained in this source file as calibration
 * history. The declarations below are the active generator surface. V1 keeps
 * the research objects intact while changing the visitor's first gesture from
 * cataloguing to entering.
 */

function imagePath(place, variant = place.image) {
  return sitePath("/assets/archive-reference/assets/" + (variant.presentationFilename || variant.filename));
}

function relationStatusLabel(status, locale) {
  return labelStatus(status, locale);
}

function displayCurrentUrl(locale, active, id) {
  if (active === "home") return homeUrl(locale);
  if (active === "topology") return topologyUrl(locale);
  if (active === "method") return methodUrl(locale);
  if (active === "place") return pageUrl(locale, id);
  return sitePath("/internal/calibration/");
}

function v1Header(locale, active, current, alternate, id) {
  const isPt = locale === "pt-br";
  const labels = isPt
    ? { map: "mapa", topology: "relações", method: "método", search: "buscar um lugar", lang: "Idioma" }
    : { map: "map", topology: "relations", method: "method", search: "find a place", lang: "Language" };
  const nav = [
    `<a class="header-link${active === "home" ? " is-current" : ""}" href="${homeUrl(locale)}" aria-current="${active === "home" ? "page" : "false"}">${labels.map}</a>`,
    `<a class="header-link${active === "topology" ? " is-current" : ""}" href="${topologyUrl(locale)}" aria-current="${active === "topology" ? "page" : "false"}">${labels.topology}</a>`,
    `<a class="header-link${active === "method" ? " is-current" : ""}" href="${methodUrl(locale)}" aria-current="${active === "method" ? "page" : "false"}">${labels.method}</a>`
  ].join("");
  const langButtons = [
    { lang: "pt-br", href: isPt ? current : alternate, src: sitePath("/assets/flag-br.svg"), alt: "Português do Brasil", active: isPt },
    { lang: "en", href: isPt ? alternate : current, src: sitePath("/assets/flag-us.svg"), alt: "English, United States", active: !isPt }
  ].map((item) => `<a class="lang-button${item.active ? " is-active" : ""}" data-lang="${item.lang}" href="${item.href}" aria-label="${item.alt}" title="${item.alt}" aria-current="${item.active ? "page" : "false"}"><img src="${item.src}" alt="" aria-hidden="true" width="24" height="16" /></a>`).join("");
  return `<header class="site-header"><a class="identity" href="${homeUrl(locale)}" aria-label="${isPt ? "Voltar ao mapa de lugares" : "Back to the place map"}"><span class="identity-pip" aria-hidden="true"></span><span class="identity-copy"><strong>Habbo · lugares</strong><small>${isPt ? "arquivo independente" : "independent archive"}</small></span></a><div class="header-actions"><nav class="header-nav" aria-label="${isPt ? "Navegação" : "Navigation"}">${nav}</nav>${active === "home" ? `<button class="header-search" type="button" data-open-search aria-label="${labels.search}" title="${labels.search}"><span aria-hidden="true">⌕</span><span class="header-search-label">${labels.search}</span></button>` : ""}<nav class="lang-toggle" aria-label="${labels.lang}">${langButtons}</nav></div></header>`;
}

function v1Footer(locale) {
  const isPt = locale === "pt-br";
  return `<footer class="site-footer"><div class="footer-inner"><p class="footer-stamp"><span class="footer-pip" aria-hidden="true"></span>${isPt ? "arquivo independente · protótipo público · noindex" : "independent archive · public prototype · noindex"}</p><p class="rights-disclaimer">This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. This fan site may use the trademarks and other intellectual property of Habbo, which is permitted under Habbo Fan Site Policy.</p><p class="footer-note">${isPt ? "A memória fica na superfície; a evidência está disponível quando você quiser abrir." : "Memory stays on the surface; evidence is available when you choose to open it."} <a href="${methodUrl(locale)}">${isPt ? "ver método" : "read the method"}</a></p></div></footer>`;
}

function v1Layout(locale, active, current, alternate, title, body, pageType, id = "") {
  const isPt = locale === "pt-br";
  const description = isPt
    ? "Protótipo público de um arquivo espacial independente sobre lugares públicos clássicos do Habbo BR."
    : "Public prototype of an independent spatial archive of classic Habbo BR public places.";
  return `<!doctype html><html lang="${isPt ? "pt-BR" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#101520"><title>${esc(title)}</title><link rel="stylesheet" href="${versionedAssetPath("/assets/site.css")}"></head><body data-page="${pageType}" data-locale="${locale}" data-root-entry="${current === sitePath("/") ? "true" : "false"}"><div class="site-shell">${v1Header(locale, active, current, alternate, id)}${body}${v1Footer(locale)}</div><script src="${versionedAssetPath("/assets/site.js")}" defer></script></body></html>`;
}

function v1PlaceNodeMarkup(place, locale) {
  const isPt = locale === "pt-br";
  const name = localizedName(place, locale);
  const otherName = isPt ? place.canonicalNameEn : place.canonicalNamePtBr;
  const pos = place.editorialMapPosition;
  const search = [place.canonicalNamePtBr, place.canonicalNameEn, ...place.aliases].join(" ").toLocaleLowerCase();
  const width = place.image.width || 480;
  const height = place.image.height || 320;
  const landmark = place.landmarkStrength === "high" ? " room-node--landmark" : "";
  const enterLabel = isPt ? `Entrar em ${name}` : `Enter ${name}`;
  return `<a class="room-node${landmark}" data-room-node data-room-search="${esc(search)}" href="${linkFor(locale, place.id)}" aria-label="${esc(enterLabel)}" style="--x:${pos.x}%;--y:${pos.y}%;--node-scale:${pos.scale};--node-layer:${pos.layer};"><span class="room-node-image"><img src="${imagePath(place)}" alt="${esc(name)}" loading="lazy" decoding="async" width="${width}" height="${height}"></span><span class="room-node-caption"><strong>${esc(name)}</strong>${otherName && otherName !== name ? `<small>${esc(otherName)}</small>` : ""}<span class="room-node-enter" aria-hidden="true">${isPt ? "entrar" : "enter"} →</span></span></a>`;
}

function accessiblePlaceList(locale) {
  const isPt = locale === "pt-br";
  return places.map((place) => `<li><a href="${linkFor(locale, place.id)}"><span>${esc(localizedName(place, locale))}</span><small>${esc(isPt ? place.canonicalNameEn : place.canonicalNamePtBr)}</small></a></li>`).join("");
}

function renderHomeV1(locale) {
  const isPt = locale === "pt-br";
  const whispers = [
    { x: 17, y: 27, text: isPt ? "chegada" : "arrival" },
    { x: 63, y: 28, text: isPt ? "memória" : "memory" },
    { x: 21, y: 72, text: isPt ? "ao ar livre" : "outdoors" },
    { x: 76, y: 70, text: isPt ? "noite" : "night" }
  ].map((item) => `<span class="world-whisper" style="--whisper-x:${item.x}%;--whisper-y:${item.y}%">${item.text}</span>`).join("");
  const roomNodes = places.map((place) => v1PlaceNodeMarkup(place, locale)).join("");
  const traces = `<svg class="world-traces" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M8 18 C18 9 27 17 39 20 S59 12 67 22" /><path d="M17 40 C27 34 35 38 51 51 S67 61 84 56" /><path d="M10 80 C26 75 31 85 52 82 S70 82 92 71" /></svg>`;
  const searchTitle = isPt ? "Procurar um lugar" : "Find a place";
  const searchPlaceholder = isPt ? "Piscina, Hallways, Café..." : "Pool, Hallways, Cafe...";
  const body = `<main class="home-page"><section class="portal-intro" aria-labelledby="home-title"><p class="eyebrow">Habbo · ${isPt ? "lugares lembrados" : "remembered places"}</p><h1 id="home-title">${isPt ? "Onde você quer entrar?" : "Where do you want to enter?"}</h1><p class="portal-invitation">${isPt ? "Um campo de lugares públicos clássicos. Escolha uma imagem; a história espera logo depois." : "A field of classic public places. Choose an image; the story waits just beyond it."}</p></section><section class="spatial-world" id="world" data-spatial-map aria-labelledby="world-title"><div class="world-heading"><span id="world-title">${isPt ? "27 lugares" : "27 places"}</span><span>${isPt ? "disposição editorial · conexões históricas têm camada própria" : "editorial arrangement · historical connections have their own layer"}</span></div><div class="world-canvas">${traces}${whispers}${roomNodes}<p class="world-instruction">${isPt ? "arraste · role · entre" : "drag · scroll · enter"}</p></div></section><section class="home-tools" aria-label="${isPt ? "Ferramentas do arquivo" : "Archive tools"}"><button class="tool-link" type="button" data-open-search><span aria-hidden="true">⌕</span>${isPt ? "buscar um lugar" : "find a place"}</button><details class="place-index"><summary>${isPt ? "ver lista de lugares" : "view place list"}</summary><div class="place-index-content"><p>${isPt ? "Alternativa textual para percorrer os 27 destinos." : "A text alternative for moving through all 27 destinations."}</p><ul>${accessiblePlaceList(locale)}</ul></div></details><a class="tool-link" href="${topologyUrl(locale)}">${isPt ? "abrir relações" : "open relations"} <span aria-hidden="true">↗</span></a></section><dialog class="search-dialog" data-search-dialog aria-labelledby="search-title"><form method="dialog" class="search-dialog-form"><div class="search-dialog-heading"><h2 id="search-title">${searchTitle}</h2><button class="dialog-close" value="cancel" aria-label="${isPt ? "Fechar busca" : "Close search"}">×</button></div><label for="place-search">${isPt ? "nome ou alias" : "name or alias"}</label><input id="place-search" data-place-search type="search" placeholder="${searchPlaceholder}" autocomplete="off"><ul data-search-results>${accessiblePlaceList(locale)}</ul></form></dialog></main>`;
  return v1Layout(locale, "home", homeUrl(locale), alternateLocalePath(locale, "home"), isPt ? "Habbo — Lugares" : "Habbo — Places", body, "home");
}

/* ------------------------------------------------------------------------
 * Public V2 surface — Cinematic Dock Portal
 * ------------------------------------------------------------------------
 * The old V1 map remains in this file as product history. V2 changes the
 * doorway itself: discovery is a focused image sequence, inspection is a
 * lightbox, and documentation remains one deliberate step away.
 */

function v2Header(locale, current, alternate) {
  const isPt = locale === "pt-br";
  const labels = isPt
    ? { lang: "Idioma", identity: "Voltar à apresentação" }
    : { lang: "Language", identity: "Back to the presentation" };
  const langButtons = [
    { lang: "pt-br", href: isPt ? current : alternate, src: sitePath("/assets/flag-br.svg"), alt: "Português do Brasil", active: isPt },
    { lang: "en", href: isPt ? alternate : current, src: sitePath("/assets/flag-us.svg"), alt: "English, United States", active: !isPt }
  ].map((item) => `<a class="lang-button${item.active ? " is-active" : ""}" data-lang="${item.lang}" data-home-locale="${item.lang}" href="${item.href}" aria-label="${item.alt}" title="${item.alt}" aria-current="${item.active ? "page" : "false"}"><img src="${item.src}" alt="" aria-hidden="true" width="24" height="16" /></a>`).join("");
  return `<header class="site-header v2-header"><a class="identity" href="${homeUrl(locale)}" aria-label="${labels.identity}"><span class="identity-pip" aria-hidden="true"></span><span class="identity-copy"><strong>Habbo</strong></span></a><nav class="lang-toggle" aria-label="${labels.lang}">${langButtons}</nav></header>`;
}

function v2Footer() {
  return `<footer class="site-footer site-footer--v2"><div class="footer-inner"><p class="rights-disclaimer">This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. This fan site may use the trademarks and other intellectual property of Habbo, which is permitted under Habbo Fan Site Policy.</p></div></footer>`;
}

function v2Layout(locale, current, alternate, title, body) {
  const isPt = locale === "pt-br";
  return `<!doctype html><html lang="${isPt ? "pt-BR" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#090d15"><title>${esc(title)}</title><link rel="stylesheet" href="${versionedAssetPath("/assets/site.css")}"></head><body data-page="home" data-locale="${locale}" data-root-entry="${current === sitePath("/") ? "true" : "false"}"><div class="site-shell">${v2Header(locale, current, alternate)}${body}${v2Footer()}</div><script src="${versionedAssetPath("/assets/site.js")}" defer></script></body></html>`;
}

function v2RoomMarkup(place, locale, index) {
  const isPt = locale === "pt-br";
  const name = localizedName(place, locale);
  const otherName = isPt ? place.canonicalNameEn : place.canonicalNamePtBr;
  const variants = place.variants || [place.image];
  const primary = variants[0];
  const width = primary.width || 720;
  const height = primary.height || 480;
  const groupNote = variants.length > 1 ? (isPt ? `, ${variants.length} mapas disponíveis` : `, ${variants.length} maps available`) : "";
  const label = isPt ? `Abrir ${name}${groupNote}` : `Open ${name}${groupNote}`;
  const variantData = variants.map((variant) => ({
    id: variant.id,
    labelPt: variant.labelPt || "Mapa",
    labelEn: variant.labelEn || "Map",
    kind: variant.kind || "primary",
    src: imagePath(place, variant),
    rawSrc: sitePath("/assets/archive-reference/assets/" + variant.filename),
    width: variant.width || 720,
    height: variant.height || 480
  }));
  const stack = variants.length > 1 ? `<span class="dock-group-stack" aria-hidden="true"><i></i><i></i><b>${String(variants.length).padStart(2, "0")}</b></span>` : "";
  return `<li class="dock-slide${variants.length > 1 ? " dock-slide--grouped" : ""}" data-dock-slide data-room-id="${esc(place.id)}" data-room-index="${index}" data-room-name="${esc(name)}" data-room-alias="${esc(otherName && otherName !== name ? otherName : "")}" data-room-detail="${linkFor(locale, place.id)}" data-room-variant-count="${variants.length}" data-room-variants="${esc(JSON.stringify(variantData))}" data-room-search="${esc([place.canonicalNamePtBr, place.canonicalNameEn, ...place.aliases].join(" ").toLocaleLowerCase())}"><button class="dock-room" type="button" data-room-open data-room-id="${esc(place.id)}" data-room-index="${index}" aria-label="${esc(label)}"><span class="dock-media"><img src="${imagePath(place, primary)}" alt="${esc(name)}" loading="${index < 5 ? "eager" : "lazy"}" decoding="async" draggable="false" width="${width}" height="${height}">${stack}</span><span class="sr-only">${esc(name)}${otherName && otherName !== name ? ` — ${esc(otherName)}` : ""}</span></button></li>`;
}

function v2LightboxLanguageMarkup(locale) {
  const isPt = locale === "pt-br";
  const items = [
    { lang: "pt-br", href: homeUrl("pt-br"), src: sitePath("/assets/flag-br.svg"), alt: "Português do Brasil", active: isPt },
    { lang: "en", href: homeUrl("en"), src: sitePath("/assets/flag-us.svg"), alt: "English, United States", active: !isPt }
  ];
  return `<nav class="lightbox-lang-toggle" data-lightbox-lang aria-label="${isPt ? "Idioma" : "Language"}">${items.map((item) => `<a class="lang-button${item.active ? " is-active" : ""}" data-lang="${item.lang}" data-home-locale="${item.lang}" href="${item.href}" aria-label="${item.alt}" title="${item.alt}" aria-current="${item.active ? "page" : "false"}"><img src="${item.src}" alt="" aria-hidden="true" width="24" height="16" /></a>`).join("")}</nav>`;
}

function renderHomeV2(locale) {
  const isPt = locale === "pt-br";
  const first = presentationPlaces[0];
  const total = presentationPlaces.length;
  const firstVariant = (first.variants || [first.image])[0];
  const firstName = localizedName(first, locale);
  const firstOther = isPt ? first.canonicalNameEn : first.canonicalNamePtBr;
  const slides = presentationPlaces.map((place, index) => v2RoomMarkup(place, locale, index)).join("");
  const lightbox = `<dialog class="room-lightbox" data-lightbox aria-labelledby="lightbox-title"><div class="lightbox-shell">${v2LightboxLanguageMarkup(locale)}<button class="lightbox-close" type="button" data-lightbox-close aria-label="${isPt ? "Fechar espaço" : "Close room"}">×</button><button class="lightbox-arrow lightbox-arrow--prev" type="button" data-lightbox-prev aria-label="${isPt ? "Espaço anterior" : "Previous room"}"><span aria-hidden="true">←</span></button><figure class="lightbox-figure"><img data-lightbox-image src="${imagePath(first, firstVariant)}" alt="${esc(firstName)}" width="${firstVariant.width || 720}" height="${firstVariant.height || 480}"><figcaption><p class="eyebrow" data-lightbox-index>01 / ${String(total).padStart(2, "0")}</p><h2 id="lightbox-title" data-lightbox-title>${esc(firstName)}</h2><p class="lightbox-alias" data-lightbox-alias>${firstOther && firstOther !== firstName ? esc(firstOther) : ""}</p><p class="lightbox-variant-label" data-lightbox-variant-label></p></figcaption></figure><button class="lightbox-arrow lightbox-arrow--next" type="button" data-lightbox-next aria-label="${isPt ? "Próximo espaço" : "Next room"}"><span aria-hidden="true">→</span></button><aside class="lightbox-variants" data-lightbox-variants aria-label="${isPt ? "Mapas deste lugar" : "Maps for this place"}"></aside><a class="lightbox-detail" data-lightbox-detail href="${linkFor(locale, first.id)}">${isPt ? "Abrir página" : "Open page"}<span aria-hidden="true">↗</span></a></div></dialog>`;
  const body = `<main class="home-page home-page--v2"><h1 id="home-title" class="sr-only">${isPt ? "Lugares públicos clássicos do Habbo" : "Classic Habbo public places"}</h1><section class="cinematic-dock" data-cinematic-dock data-dock-effect="zoom" data-autoplay-ms="5800" data-total="${total}" aria-labelledby="home-title"><div class="dock-viewport" data-dock-viewport tabindex="0" role="region" aria-roledescription="carousel" aria-label="${isPt ? "Apresentação de lugares públicos clássicos" : "Presentation of classic public places"}"><ol class="dock-track" data-dock-track>${slides}</ol></div><div class="dock-caption" aria-live="polite"><p class="dock-caption-index" data-active-index>01 / ${String(total).padStart(2, "0")}</p><h2 data-active-name>${esc(firstName)}</h2><p data-active-alias>${firstOther && firstOther !== firstName ? esc(firstOther) : ""}</p></div><div class="dock-controls" aria-label="${isPt ? "Controles da apresentação" : "Presentation controls"}"><button type="button" class="dock-control dock-control--arrow" data-dock-prev aria-label="${isPt ? "Lugar anterior" : "Previous place"}">←</button><button type="button" class="dock-control dock-control--play" data-dock-play aria-pressed="false"><span class="dock-play-icon" aria-hidden="true">Ⅱ</span><span data-dock-play-label>${isPt ? "pausar" : "pause"}</span></button><button type="button" class="dock-control dock-control--arrow" data-dock-next aria-label="${isPt ? "Próximo lugar" : "Next place"}">→</button></div><p class="sr-only" role="status" data-dock-status>${isPt ? `Lugar 1 de ${total}: ${firstName}` : `Place 1 of ${total}: ${firstName}`}</p></section>${lightbox}</main>`;
  return v2Layout(locale, homeUrl(locale), alternateLocalePath(locale, "home"), isPt ? "Habbo — lugares públicos" : "Habbo — public places", body);
}

function v1EdgeDestination(edge, placeId) {
  return edge.from === placeId ? edge.to : edge.from;
}

function v1PlaceExits(place, locale) {
  const seen = new Set();
  const exits = [];
  for (const edge of topologicalEdges(place.id)) {
    const destinationId = v1EdgeDestination(edge, place.id);
    if (!placeById[destinationId] || seen.has(destinationId)) continue;
    seen.add(destinationId);
    exits.push({ place: placeById[destinationId], status: edge.evidenceStatus, relation: edge.relationType });
  }
  for (const peer of editorialPeers(place.id)) {
    if (seen.has(peer.id) || exits.length >= 4) continue;
    seen.add(peer.id);
    exits.push({ place: peer, status: "editorial_relation", relation: "editorial_path" });
  }
  return exits.slice(0, 4);
}

function v1ExitMarkup(exit, locale) {
  const isPt = locale === "pt-br";
  const name = localizedName(exit.place, locale);
  const statusTextValue = relationStatusLabel(exit.status, locale);
  const kind = exit.status === "editorial_relation" ? (isPt ? "sugestão do arquivo" : "archive suggestion") : "";
  return `<a class="exit-path exit-path--${statusClass(exit.status)}" data-exit-status="${esc(exit.status)}" href="${linkFor(locale, exit.place.id)}" aria-label="${esc(`${name} — ${statusTextValue}`)}"><span class="exit-thumb"><img src="${imagePath(exit.place)}" alt="" loading="lazy" decoding="async" width="120" height="76"></span><span class="exit-copy"><strong>${esc(name)}</strong>${kind ? `<small>${esc(kind)}</small>` : ""}</span><span class="exit-arrow" aria-hidden="true">↗</span></a>`;
}

function v1ArchiveDrawer(place, locale, manifest) {
  const isPt = locale === "pt-br";
  const variants = place.variants || [place.image];
  const dimensions = manifest.original_dimensions || `${place.image.width || "—"}x${place.image.height || "—"}`;
  const format = manifest.file_format || place.image.format || "—";
  return `<details class="archive-drawer" id="archive" data-archive-drawer><summary>${isPt ? "abrir camada de arquivo" : "open archive layer"}</summary><div class="archive-drawer-body"><p class="archive-intro">${isPt ? "Proveniência, estado temporal e direitos ficam aqui para não competir com a chegada ao lugar." : "Provenance, temporal status, and rights live here so they do not compete with arriving at the place."}</p><dl><dt>${isPt ? "fonte" : "source"}</dt><dd>${place.sourcePageUrl ? `<a href="${esc(place.sourcePageUrl)}" rel="noreferrer">${esc(place.sourcePageUrl)}</a>` : (isPt ? "não recuperada" : "not recovered")}</dd><dt>${isPt ? "imagem direta" : "direct image"}</dt><dd>${place.directImageUrl ? `<a href="${esc(place.directImageUrl)}" rel="noreferrer">${esc(place.directImageUrl)}</a>` : (isPt ? "não recuperada" : "not recovered")}</dd><dt>${isPt ? "mapas agrupados" : "grouped maps"}</dt><dd>${variants.length}</dd><dt>${isPt ? "estado temporal" : "temporal status"}</dt><dd>${esc(place.image.temporalStatus)}</dd><dt>${isPt ? "direitos" : "rights"}</dt><dd>${esc(place.image.rightsStatus)} · public_reference_only</dd><dt>${isPt ? "locale / era" : "locale / era"}</dt><dd>${esc(place.hotelLocale.join(", "))} · ${esc(place.visualEra.join(", "))}</dd><dt>${isPt ? "dimensões" : "dimensions"}</dt><dd>${esc(dimensions)} · ${esc(format)}</dd><dt>${isPt ? "manifesto" : "manifest"}</dt><dd><a href="${sitePath("/PUBLICATION_MANIFEST.md")}">${isPt ? "ver manifesto de publicação" : "view publication manifest"}</a></dd></dl></div></details>`;
}

function v1PlaceVariants(place, locale) {
  const isPt = locale === "pt-br";
  const variants = place.variants || [place.image];
  if (variants.length < 2) return "";
  const name = localizedName(place, locale);
  const items = variants.map((variant, index) => `<a class="place-variant${index === 0 ? " is-current" : ""}" data-place-variant-button data-variant-id="${esc(variant.id)}" data-variant-image="${imagePath(place, variant)}" data-variant-width="${variant.width || 720}" data-variant-height="${variant.height || 480}" href="${linkFor(locale, place.id)}?variant=${encodeURIComponent(variant.id)}#place-title" aria-label="${esc(`${name} — ${variant.labelPt || variant.labelEn || `Map ${index + 1}`}`)}"><span class="place-variant-thumb"><img src="${imagePath(place, variant)}" alt="" loading="lazy" decoding="async" width="${variant.width || 720}" height="${variant.height || 480}"></span><span class="place-variant-copy"><strong>${esc(isPt ? (variant.labelPt || `Mapa ${index + 1}`) : (variant.labelEn || `Map ${index + 1}`))}</strong><small>${esc(variant.kind === "primary" ? (isPt ? "imagem principal" : "primary image") : (isPt ? "variante histórica" : "historic variant"))}</small></span></a>`).join("");
  return `<section class="place-variants" aria-labelledby="place-variants-title"><div class="reading-label"><span id="place-variants-title">${isPt ? "mapas deste lugar" : "maps for this place"}</span><span aria-hidden="true">${String(variants.length).padStart(2, "0")}</span></div><div class="place-variant-grid">${items}</div></section>`;
}

function renderPlaceV1(place, locale) {
  const isPt = locale === "pt-br";
  const localized = copy[place.id] || { arrival: place.arrivalText, spatial: place.spatialNotes, facts: place.shortFacts };
  const localizedCopy = { arrival: localized.arrival[isPt ? "pt" : "en"], spatial: localized.spatial[isPt ? "pt" : "en"], facts: localized.facts[isPt ? "pt" : "en"] };
  const manifest = manifestByName[place.canonicalNameEn] || {};
  const sequence = presentationPlaces;
  const index = sequence.findIndex((item) => item.id === place.id);
  const previous = sequence[(index - 1 + sequence.length) % sequence.length];
  const next = sequence[(index + 1) % sequence.length];
  const exits = v1PlaceExits(place, locale);
  const socialUses = (isPt ? place.socialUsesPtBr : place.socialUsesEn).slice(0, 5);
  const primaryVariant = (place.variants || [place.image])[0];
  const imageWidth = primaryVariant.width || place.image.width || 720;
  const imageHeight = primaryVariant.height || place.image.height || 480;
  const name = localizedName(place, locale);
  const otherName = isPt ? place.canonicalNameEn : place.canonicalNamePtBr;
  const body = `<main class="place-page"><section class="place-arrival" aria-labelledby="place-title"><div class="place-route-bar"><a class="back-link" data-back-presentation href="${homeUrl(locale)}#${esc(place.id)}"><span aria-hidden="true">←</span> ${isPt ? "voltar à apresentação" : "back to presentation"}</a><span class="place-route-label">${isPt ? "você está aqui" : "you are here"}</span><nav class="place-sequence" aria-label="${isPt ? "Navegar entre lugares" : "Move between places"}"><a href="${linkFor(locale, previous.id)}" title="${esc(localizedName(previous, locale))}"><span aria-hidden="true">←</span><span class="sequence-name">${esc(localizedName(previous, locale))}</span></a><a href="${linkFor(locale, next.id)}" title="${esc(localizedName(next, locale))}"><span class="sequence-name">${esc(localizedName(next, locale))}</span><span aria-hidden="true">→</span></a></nav></div><figure class="arrival-figure"><img data-place-main-image data-active-variant-id="${esc(primaryVariant.id)}" src="${imagePath(place, primaryVariant)}" alt="${esc(name)}" width="${imageWidth}" height="${imageHeight}" decoding="async" fetchpriority="high"></figure><div class="arrival-title"><p class="eyebrow">${isPt ? "espaço público · brpt" : "public space · brpt"}</p><h1 id="place-title">${esc(name)}</h1>${otherName && otherName !== name ? `<p class="place-alias">${esc(otherName)}</p>` : ""}<p class="arrival-line">${esc(localizedCopy.arrival)}</p></div></section>${v1PlaceVariants(place, locale)}<section class="place-reading" id="about" aria-labelledby="about-title"><div class="reading-label"><span>${isPt ? "sobre este lugar" : "about this place"}</span><span aria-hidden="true">01</span></div><div class="reading-copy"><h2 id="about-title">${isPt ? "O que permanece quando a porta abre" : "What remains when the door opens"}</h2><p>${esc(localizedCopy.spatial)}</p><p>${esc(localizedCopy.facts[0] || "")}</p></div></section><section class="place-life" aria-labelledby="life-title"><div class="reading-label"><span id="life-title">${isPt ? "vida no lugar" : "life here"}</span><span aria-hidden="true">02</span></div><ul class="memory-notes">${socialUses.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section><section class="place-exits" aria-labelledby="exits-title"><div class="reading-label"><span id="exits-title">${isPt ? "seguir por outra porta" : "continue through another door"}</span><span aria-hidden="true">03</span></div><p class="section-note">${isPt ? "Alguns caminhos são históricos; outros são aproximações editoriais para continuar andando." : "Some paths are historical; others are editorial invitations to keep moving."}</p><div class="exit-paths">${exits.length ? exits.map((exit) => v1ExitMarkup(exit, locale)).join("") : `<p class="empty-note">${isPt ? "Este lugar ainda não tem uma saída publicada." : "This place has no published exit yet."}</p>`}</div></section>${v1ArchiveDrawer(place, locale, manifest)}<nav class="place-bottom-nav" aria-label="${isPt ? "Navegação final" : "End navigation"}"><a href="${homeUrl(locale)}#${esc(place.id)}" data-back-presentation>${isPt ? "← voltar à apresentação" : "← back to presentation"}</a><a href="${linkFor(locale, next.id)}">${isPt ? "próximo lugar" : "next place"} <span aria-hidden="true">→</span></a></nav></main>`;
  return v1Layout(locale, "place", pageUrl(locale, place.id), alternateLocalePath(locale, "place", place.id), `${esc(name)} — Habbo`, body, "place", place.id);
}

const topologyAuxiliaryPosition = {
  hallway_1: [205, 430], hallway_2: [250, 450], hallway_3: [295, 470], hallway_ii: [335, 430],
  lido_deck: [590, 500], lido_diving: [610, 540], club_massiva_downstairs_disco: [740, 650],
  imperial_park_secondary_room: [280, 550], beauty_salon_secondary_room: [900, 430],
  misterape_wobble_squabble: [910, 565], old_treat_homage: [760, 120]
};

function topologyPosition(id) {
  return topologyMap[id] || topologyAuxiliaryPosition[id] || [500, 350];
}

function topologyNodeMarkup(id, locale) {
  const place = placeById[id];
  if (!place) {
    const auxiliary = auxiliaryById[id];
    if (!auxiliary) return "";
    const [x, y] = topologyPosition(id);
    return `<g class="topology-node topology-node--auxiliary" data-topology-node="${esc(id)}"><circle cx="${x}" cy="${y}" r="6"></circle><text x="${x + 11}" y="${y + 4}">${esc(auxiliary.label)}</text></g>`;
  }
  const [x, y] = topologyPosition(id);
  const name = localizedName(place, locale);
  const short = name.length > 19 ? `${name.slice(0, 18)}…` : name;
  return `<a class="topology-node" data-topology-node="${esc(id)}" href="${linkFor(locale, id)}" aria-label="${esc(name)}"><image href="${imagePath(place)}" x="${x - 28}" y="${y - 22}" width="56" height="42" preserveAspectRatio="xMidYMid meet"></image><text x="${x}" y="${y + 37}" text-anchor="middle">${esc(short)}</text></a>`;
}

function topologyEdgeMarkup(edge) {
  if (edge.evidenceStatus === "editorial_relation" || edge.from === "editorial_atlas" || edge.to === "editorial_atlas") return "";
  const [x1, y1] = topologyPosition(edge.from);
  const [x2, y2] = topologyPosition(edge.to);
  return `<line class="topology-edge topology-edge--${statusClass(edge.evidenceStatus)}" data-edge-status="${esc(edge.evidenceStatus)}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
}

function topologyTextMarkup(edge, locale) {
  const isPt = locale === "pt-br";
  const from = endpointName(edge.from, locale);
  const to = endpointName(edge.to, locale);
  return `<li data-edge-status="${esc(edge.evidenceStatus)}"><span class="text-edge-route">${esc(from)} <span aria-hidden="true">→</span> ${esc(to)}</span><span class="text-edge-meta">${esc(relationStatusLabel(edge.evidenceStatus, locale))} · ${esc(labelRelation(edge.relationType, locale))}</span></li>`;
}

function renderTopologyV1(locale) {
  const isPt = locale === "pt-br";
  const counts = ["documented_historical", "probable_historical", "testimony", "unknown"].map((status) => [status, edges.filter((edge) => edge.evidenceStatus === status).length]);
  const filters = [["all", isPt ? "todas" : "all"], ...counts.map(([status]) => [status, labelStatus(status, locale)])].map(([key, label], index) => `<button class="graph-filter${index === 0 ? " is-active" : ""}" type="button" data-topology-filter="${key}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(label)}</button>`).join("");
  const graphIds = [...new Set(edges.filter((edge) => edge.evidenceStatus !== "editorial_relation").flatMap((edge) => [edge.from, edge.to]))];
  const graph = `<svg class="topology-graph" viewBox="0 0 1000 760" role="img" aria-labelledby="graph-title graph-desc"><title id="graph-title">${isPt ? "Grafo de relações entre espaços" : "Graph of relations between places"}</title><desc id="graph-desc">${isPt ? "Disposição diagramática para mostrar relações documentadas, prováveis, testemunhais e em aberto. Não é uma planta histórica." : "A diagrammatic arrangement showing documented, probable, testimonial, and open relations. It is not a historical floor plan."}</desc><g class="topology-edges">${edges.map(topologyEdgeMarkup).join("")}</g><g class="topology-nodes">${graphIds.map((id) => topologyNodeMarkup(id, locale)).join("")}</g></svg>`;
  const legend = `<div class="graph-legend" aria-label="${isPt ? "Legenda do grafo" : "Graph legend"}"><span class="legend-item legend-item--documented"><i aria-hidden="true"></i>${isPt ? "documentada" : "documented"}</span><span class="legend-item legend-item--probable"><i aria-hidden="true"></i>${isPt ? "provável" : "probable"}</span><span class="legend-item legend-item--testimony"><i aria-hidden="true"></i>${isPt ? "testemunho" : "testimony"}</span><span class="legend-item legend-item--unknown"><i aria-hidden="true"></i>${isPt ? "em aberto" : "open"}</span></div>`;
  const textEdges = edges.filter((edge) => edge.evidenceStatus !== "editorial_relation").map((edge) => topologyTextMarkup(edge, locale)).join("");
  const body = `<main class="topology-page"><section class="research-intro"><p class="eyebrow">${isPt ? "camada de evidência" : "evidence layer"}</p><h1>${isPt ? "As relações ficam visíveis quando você procura por elas." : "Relations become visible when you ask for them."}</h1><p>${isPt ? "Este grafo não reconstrói um hotel. Ele separa portas documentadas, prováveis, testemunhais e ainda abertas para que a experiência espacial não precise fingir certezas." : "This graph does not rebuild a hotel. It separates documented, probable, testimonial, and still-open doors so the spatial experience never has to fake certainty."}</p></section><section class="graph-shell" aria-label="${isPt ? "Grafo de topologia" : "Topology graph"}"><div class="graph-toolbar"><div class="graph-filters">${filters}</div><span>${isPt ? "disposição diagramática · não é planta" : "diagrammatic arrangement · not a floor plan"}</span></div>${graph}${legend}</section><details class="relation-text"><summary>${isPt ? "ver relações como texto" : "read relations as text"}</summary><ol>${textEdges}</ol></details></main>`;
  return v1Layout(locale, "topology", topologyUrl(locale), alternateLocalePath(locale, "topology"), isPt ? "Topologia — Habbo" : "Topology — Habbo", body, "topology");
}

function renderMethodV1(locale) {
  const isPt = locale === "pt-br";
  const body = `<main class="method-page"><article class="method-article"><p class="eyebrow">${isPt ? "camada de confiança" : "trust layer"}</p><h1>${isPt ? "O mapa é simples porque a pesquisa não é." : "The map is quiet because the research is not."}</h1><p class="method-lead">${isPt ? "A entrada privilegia lugares e presença. Abaixo dela, o arquivo mantém proveniência, diferenças de evidência, locale, era e direitos sem transformar cada imagem em uma ficha técnica." : "The entry privileges places and presence. Beneath it, the archive keeps provenance, evidence differences, locale, era, and rights without turning every image into a technical record."}</p><section class="method-section"><h2>${isPt ? "Duas camadas" : "Two layers"}</h2><p>${isPt ? "A camada de experiência organiza a chegada: campo espacial, imagens, caminhos e memória curta. A camada de pesquisa alimenta o campo: nós canônicos, proveniência, relações, estados temporais e manifesto de publicação." : "The experience layer shapes arrival: spatial field, images, paths, and a short memory line. The research layer feeds it: canonical nodes, provenance, relations, temporal states, and the publication manifest."}</p><dl class="method-definition"><div><dt>${isPt ? "superfície" : "surface"}</dt><dd>${isPt ? "entrar em um lugar" : "enter a place"}</dd></div><div><dt>${isPt ? "evidência" : "evidence"}</dt><dd>${isPt ? "abrir quando necessário" : "open when needed"}</dd></div><div><dt>${isPt ? "disposição" : "arrangement"}</dt><dd>${isPt ? "editorial, não geográfica" : "editorial, not geographic"}</dd></div></dl></section><section class="method-section"><h2>${isPt ? "O que o arquivo distingue" : "What the archive distinguishes"}</h2><p>${isPt ? "Documentado histórico, provável histórico, testemunho, relação editorial e desconhecido/em aberto. Relações editoriais ajudam a circular; não são portas históricas. Quando a fonte não sustenta uma certeza, a interface deixa a pergunta aberta." : "Documented historical, probable historical, testimony, editorial relation, and unknown/open. Editorial relations help movement; they are not historical doors. When the source cannot sustain certainty, the interface keeps the question open."}</p></section><section class="method-section"><h2>${isPt ? "Imagens e publicação" : "Images and publication"}</h2><p>${isPt ? "As imagens são preservadas como referência pública com proveniência item a item. Este protótipo é não oficial, não comercial, sem indexação e sujeito à política de Fan Sites e a remoção/correção. O manifesto reúne o estado operacional da publicação." : "Images are preserved as public reference with item-level provenance. This prototype is unofficial, non-commercial, unindexed, and subject to the Fansite Policy and removal/correction. The manifest records the operational publication state."}</p><p><a href="${sitePath("/PUBLICATION_MANIFEST.md")}">${isPt ? "abrir manifesto de publicação" : "open publication manifest"}</a></p></section><section class="method-section method-section--closing"><h2>${isPt ? "Regra de produto" : "Product rule"}</h2><p>${isPt ? "Um ex-jogador deve reconhecer um lugar e querer entrar antes de receber uma aula sobre ele. A profundidade continua disponível; ela apenas deixa de ocupar a porta." : "A former player should recognize a place and want to enter before receiving a lesson about it. Depth remains available; it simply stops occupying the doorway."}</p></section></article></main>`;
  return v1Layout(locale, "method", methodUrl(locale), alternateLocalePath(locale, "method"), isPt ? "Método — Habbo" : "Method — Habbo", body, "method");
}

function renderCalibrationV1() {
  const body = `<main class="calibration-board"><p class="eyebrow">internal only · visual calibration board v2</p><h1>V2 states</h1><p class="quiet-note">Screenshots are produced by the Playwright workflow in the public repository.</p><div class="calibration-grid"><section class="calibration-cell"><h2>Dock / desktop</h2><iframe title="Dock desktop" src="../../pt-br/index.html"></iframe></section><section class="calibration-cell calibration-cell--mobile"><h2>Dock / mobile</h2><iframe title="Dock mobile" src="../../pt-br/index.html"></iframe></section><section class="calibration-cell"><h2>Lido / arrival</h2><iframe title="Lido place page" src="../../pt-br/lugar/lido/index.html"></iframe></section><section class="calibration-cell"><h2>Topology / graph</h2><iframe title="Topology graph" src="../../pt-br/topologia/index.html"></iframe></section></div></main>`;
  return v1Layout("pt-br", "calibration", sitePath("/internal/calibration/"), homeUrl("pt-br"), "Visual Calibration Board V2 — Habbo", body, "calibration");
}

function renderCalibration() {
  const body = [
    "<main class='calibration-board'><p class='eyebrow'>internal only · visual calibration board v0</p><h1>States to review</h1><p class='quiet-note'>A browser screenshot was unavailable in this runtime; this board preserves the exact states for the next visual pass.</p><div class='calibration-grid'>",
    "<section class='calibration-cell'><h2>Homepage / desktop</h2><iframe title='Homepage desktop' src='../../pt-br/index.html'></iframe></section>",
    "<section class='calibration-cell calibration-cell--mobile'><h2>Homepage / narrow mobile</h2><iframe title='Homepage mobile' src='../../pt-br/index.html'></iframe></section>",
    "<section class='calibration-cell'><h2>Pool / provenance drawer open</h2><iframe title='Pool place page' src='../../pt-br/lugar/lido/?drawer=1'></iframe></section>",
    "<section class='calibration-cell'><h2>Historical topology</h2><iframe title='Historical topology' src='../../pt-br/topologia/index.html'></iframe></section>",
    "<section class='calibration-cell'><h2>English method</h2><iframe title='English method' src='../../en/method/index.html'></iframe></section>",
    "</div></main>"
  ].join("");
  return layout("pt-br", "calibration", "/internal/calibration/", "Visual Calibration Board V0 — Habbo", body, "calibration");
}

function emitRoute(route, html) { write(path.join(DIST, route, "index.html"), html); }

function resetGenerated() {
  fs.rmSync(DIST, { recursive: true, force: true });
  ensure(DIST);
  ensure(DATA_DIR);
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles", "tokens.css"), "utf8") + "\n" + fs.readFileSync(path.join(PROJECT_ROOT, "styles", "base.css"), "utf8");
  const js = fs.readFileSync(path.join(PROJECT_ROOT, "src", "site.js"), "utf8");
  write(path.join(DIST, "assets", "site.css"), css);
  write(path.join(DIST, "assets", `site-${ASSET_VERSION}.css`), css);
  write(path.join(DIST, "assets", "site.js"), js);
  write(path.join(DIST, "assets", `site-${ASSET_VERSION}.js`), js);
  write(path.join(DIST, "assets", "flag-br.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" role="img"><rect width="32" height="22" rx="3" fill="#2b9b55"/><path d="M16 2.5 29 11 16 19.5 3 11Z" fill="#f4d64a"/><circle cx="16" cy="11" r="4.35" fill="#265ca8"/><path d="M12.1 9.9c2.5-.7 5.6-.55 7.75.35" fill="none" stroke="#fff" stroke-width=".65" stroke-linecap="round"/></svg>`);
  write(path.join(DIST, "assets", "flag-us.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" role="img"><rect width="32" height="22" rx="3" fill="#fff"/><path d="M0 0h32v2H0zm0 4h32v2H0zm0 4h32v2H0zm0 4h32v2H0zm0 4h32v2H0zm0 4h32v2H0z" fill="#c94c58"/><path d="M0 0h13.7v11H0z" fill="#315a9b"/><g fill="#fff"><circle cx="2.3" cy="2" r=".45"/><circle cx="5" cy="2" r=".45"/><circle cx="7.7" cy="2" r=".45"/><circle cx="10.4" cy="2" r=".45"/><circle cx="3.6" cy="4.1" r=".45"/><circle cx="6.3" cy="4.1" r=".45"/><circle cx="9" cy="4.1" r=".45"/><circle cx="11.7" cy="4.1" r=".45"/><circle cx="2.3" cy="6.2" r=".45"/><circle cx="5" cy="6.2" r=".45"/><circle cx="7.7" cy="6.2" r=".45"/><circle cx="10.4" cy="6.2" r=".45"/><circle cx="3.6" cy="8.3" r=".45"/><circle cx="6.3" cy="8.3" r=".45"/><circle cx="9" cy="8.3" r=".45"/><circle cx="11.7" cy="8.3" r=".45"/></g></svg>`);
  fs.cpSync(SOURCE_ASSETS, path.join(DIST, "assets", "archive-reference", "assets"), { recursive: true });
  fs.cpSync(SOURCE_ASSETS, path.join(PROJECT_ROOT, "public", "archive-reference", "assets"), { recursive: true });
  copyFile(path.join(PROJECT_ROOT, "PUBLICATION_MANIFEST.md"), path.join(DIST, "PUBLICATION_MANIFEST.md"));
}

function emitData() {
  const items = [["places.json", places], ["edges.json", edges], ["districts.json", districts], ["provenance.json", provenance], ["v3-content-ledger.json", v3Delta]];
  for (const [name, value] of items) {
    const serialized = JSON.stringify(value, null, 2) + "\n";
    write(path.join(DATA_DIR, name), serialized);
    write(path.join(DIST, "data", name), serialized);
  }
}

function emitDocs() {
  const architecture = [
    "# Habbo Public Prototype V3 — Cinematic Dock Architecture",
    "",
    `The entry surface is a Cinematic Dock: one horizontally sequenced presentation of ${presentationPlaces.length} classic Habbo BR public-space groups. The active image carries title, alias, and position; neighboring rooms gain scale through editorial distance and pointer-sensitive magnification.`,
    "Inspection is a lightbox, not an accidental route change. A place group can expose historic map variants without duplicating the dock entity; documentation is a deliberate CTA into a Place Page.",
    "Topology and method stay secondary. They are evidence and trust layers, not the homepage composition.",
    "",
    "The implementation uses a framework-neutral static generator with stable directory-index routes, local data, semantic HTML, plain CSS, and one progressive-enhancement script. The route contract remains ready for a later Next.js migration.",
    "",
    "presentationOrder is explicit editorial data, independent from the research graph and its non-geographic topology display. The homepage carries no source URL, evidence status, or technical metadata.",
    "",
    "Autoplay runs every 5.8 seconds with a mandatory pause control. Pointer focus shapes the dock continuously without freezing autoplay; focus, drag, wheel, hidden-document state, lightbox, and prefers-reduced-motion remain safe interaction states."
  ].join("\n");
  write(path.join(PROJECT_ROOT, "docs", "ARCHITECTURE.md"), architecture);
  write(path.join(PROJECT_ROOT, "HABBO_INTERNAL_ALPHA_V0_ARCHITECTURE_DECISION_2026-08-23.md"), architecture);
  write(path.join(PROJECT_ROOT, "docs", "CINEMATIC_DOCK_V2.md"), [
    "# Cinematic Dock V3",
    "",
    "## Three levels",
    "",
    "1. Discovery and emotion: the horizontal dock presentation.",
    "2. Inspection: the focused lightbox with original image, title, alias, navigation, and detail CTA.",
    "3. Documentation: the existing Place Page, archive drawer, evidence layer, and visual exits.",
    "",
    "## Interaction contract",
    "",
    "The dock supports autoplay, manual pause/resume, pointer-sensitive magnification, keyboard arrows, wheel, pointer drag, touch swipe, snap, Escape/focus return, localized lightbox navigation, grouped map variants, and locale switching with the active room preserved in the hash.",
    "",
    "Grouped variants remain one dock entity and appear as a quiet stacked marker. The lightbox exposes the variants as a vertical strip, supports outside-click close, and keeps an explicit Open page / Abrir página CTA. Reduced motion disables autoplay and 3D/depth motion while keeping manual navigation and inspection available."
  ].join("\n"));
  write(path.join(PROJECT_ROOT, "README.md"), [
    "# Habbo Public Prototype V3",
    "",
    "Static-first public prototype for Blog Nostalgia's independent Habbo BR public-space archive.",
    "",
    "## Build",
    "",
    "Run npm run build with Node 20+.",
    "",
    "The generated portable site is in dist/. Serve it with any static HTTP server. Core exploration has no runtime network dependency.",
    "",
    "## Route contract",
    "",
    "- /pt-br/ and /en/ — Cinematic Dock presentation, lightbox inspection, and selected-room hash state.",
    "- /pt-br/lugar/<slug>/ and /en/place/<slug>/ — generated C, door-to-door place pages.",
    "- /pt-br/topologia/ and /en/topology/ — A, evidence layer.",
    "- /pt-br/metodo/ and /en/method/ — provenance and rights method.",
    "- /internal/calibration/ — internal visual review board.",
    "",
    "## Rights",
    "",
    `All ${fs.readdirSync(SOURCE_ASSETS).length} source and presentation assets remain public_reference_only. The build is noindex/nofollow/noarchive and carries the independent, non-affiliation disclaimer.`,
    "",
    "## Data",
    "",
    "The source data lives in data/: normalized places, edges, editorial districts, and provenance. The original graph remains the governing research input."
  ].join("\n"));
}

function build() {
  resetGenerated();
  emitData();
  emitDocs();
  for (const locale of ["pt-br", "en"]) {
    emitRoute(locale, renderHomeV2(locale));
    emitRoute(locale + (locale === "pt-br" ? "/topologia" : "/topology"), renderTopologyV1(locale));
    emitRoute(locale + (locale === "pt-br" ? "/metodo" : "/method"), renderMethodV1(locale));
    for (const place of places) emitRoute(locale + (locale === "pt-br" ? "/lugar/" : "/place/") + place.slug, renderPlaceV1(place, locale));
  }
  write(path.join(DIST, "index.html"), renderHomeV2("pt-br").replace('data-root-entry="false"', 'data-root-entry="true"'));
  emitRoute("internal/calibration", renderCalibrationV1());
  console.log(JSON.stringify({
    project: PROJECT_ROOT,
    stack: "static-first HTML/CSS/JS generator",
    places: places.length,
    place_routes: places.length * 2,
    total_html_routes: 2 + 2 + 2 + places.length * 2 + 1 + 1,
    edge_count: edges.length,
    asset_count: fs.readdirSync(SOURCE_ASSETS).length,
    dist: DIST
  }, null, 2));
}

build();
