# Habbo Museu Vivo · V19 NIGHT HOTEL

**Status:** proposta de arquitetura e direção de arte, não implementada.  
**Destino pretendido:** \`habbo/beta/index.html\` e \`habbo/beta/en/index.html\`.  
**Versão preservada e independente:** \`habbo/beta/classic.html\` e \`habbo/beta/en/classic.html\` (V18), com tema congelado em \`v18-classic-archive.css\`.

## Tese

Um Habbo noturno, quase silencioso. A familiaridade virá das proporções, bordas, sprites, estrutura de janelas e navegação de um client clássico, não de um banquete de gradientes, cartões arredondados ou tipografia pixelada espalhada por tudo.

O museu deixa de parecer uma homepage do Habbo antigo e passa a parecer **um navegador de memórias aberto dentro de um Hotel vazio, iluminado pelas próprias peças preservadas**.

Direção: **80% dark minimal editorial / 20% Habbo clássico reconhecível**. Nenhuma simulação enganosa de conta, moeda, login ou interface oficial.

## Diferenciar radicalmente a V18

| V18 Classic Web (preservada) | V19 Night Hotel (proposta) |
| --- | --- |
| Azul, dourado, creme | Carvão, azul-petróleo escuro, verde-água contido |
| Home de 2006 reinterpretada | Client de 2007 reinterpretado como museu |
| Hero de recepção em painel grande | Tela inicial com sala arquivada como protagonista |
| Múltiplas molduras, barras vistosas | Um shell contínuo com divisões finas e pixels pontuais |
| Catálogo com categorias azuis | Navegador escuro de famílias com foco na arte |
| Texto de abertura destacado | Texto curto, numeradores, legendas, metadados |

## Tokens (autorais, não oficiais)

- Night depth: \`#081016\` (plano geral)
- Window: \`#111E27\` (painéis e navegação)
- Raised surface: \`#192C34\` (seleção)
- Border: \`#33515B\` (arestas de 1px)
- Primary text: \`#E6EDEB\`
- Muted text: \`#A1B6BA\`
- Habbo memory turquoise: \`#8AC7C5\` (interação)
- Antique amber: \`#E4B16A\` (indicação pontual)

Usar Tahoma/Verdana para rótulos compactos, uma sans contemporânea apenas se já disponível com licença correta; não exigir assets de terceiros, nem fontes externas. Pixelização somente em arte original e pequenos ícones.

## Organização espacial proposta

### 01. Moldura superior, sem marketing

Uma barra horizontal baixa: monograma pixelado “H”, \`HABBO / ARQUIVO\`, “2000–2011”, quatro destinos (Salas, Raros, Emblemas, Gerentes), idioma e link visível para a versão Classic. A aparência remete a uma janela de client clássico em modo noturno, sem copiar marcas oficiais além do nome histórico do acervo.

### 02. Arquivo de salas, primeiro viewport

Ocupa a maior parte da primeira tela. À esquerda (ou numa coluna lateral discreta), número da cena e identificação da sala; ao centro, imagem histórica bem grande; abaixo, controles nativos de navegação, autoplay com quatro segundos e indicadores precisos \`01 / 36\`. O Dock permanece o mesmo mecanismo validado, com 29 grupos e 36 cenas. Nada de carrossel alternativo inventado.

O fundo fica quieto: quase preto, com um dégradé muito suave atrás da imagem. A própria arquitetura isométrica do Habbo produz o espetáculo.

### 03. Navegador de mobis e raros

Famílias aparecem numa barra curta de navegação secundária. Cada item histórico fica sobre uma área neutra, sem “cartões de produto”. Miniaturas originais, nome em tamanho legível e tooltip/modal com fonte. Preservar 148 raros e mobis HC, incluindo coleções e variantes.

### 04. Inventário de emblemas

Grade densa e ordenada, inspirada na interface de emblemas do client, mas sem simular inventário pessoal. Pequenos slots quadrados com espaçamento contido e contraste bom. Ao abrir, mostrar maior detalhe, fonte e cronologia. Preservar 101 emblemas sem regionalização inventada.

### 05. Pessoas por trás do Hotel

Os 12 gerentes continuam **uma só fileira horizontal de sprites e nomes**. Nada de cards, bios na face ou grupos separando períodos. A Flecha usa a captura HC, Mordomo e Prefeita usam os recortes históricos governantes. Fundo neutro para destacar as silhuetas; sombras e animações discretas.

### 06. Rodapé documental

Um único rodapé com “arquivo independente”, autoria/atribuições pertinentes, links à política e à versão Classic. Sem fingir que o museu é o cliente oficial.

## Interações

- Barra superior acompanha o capítulo ativo; navegação por anchors reais.
- Scroll de salas e personagens por mouse, teclado e toque; foco visível.
- Transições de 120–180 ms somente em controles; nada de motion constante.
- Janela de inspeção compacta, com fechamento, próxima/anterior, fonte, legenda.
- Suporte a \`prefers-reduced-motion\`, sem quebrar navegação com JS desligado.
- Mobile: header compacto em duas linhas, palco responsivo, famílias por scroll e zoom sem overflow da página.

## Arquitetura técnica

Ao contrário da V18, **não** partir de um \`index.html\` de 240 KB acrescido de CSS overrides. Criar novo renderer de composição sem substituir ou duplicar a base curatorial: aproveitar o manifesto de espaços públicos, o ledger de raros e emblemas e o contrato V17 de Staff. O HTML novo deve ser estático e semântico; scripts entram como aprimoramentos.

Entregáveis de implementação em etapa futura:

1. \`habbo/beta/index.html\` e \`habbo/beta/en/index.html\`, gerados por um novo builder;
2. \`habbo/beta/v19-night.css\` com tokens e layout próprios;
3. \`habbo/beta/v19-night.js\` somente se componentes inéditos exigirem;
4. \`habbo/beta/build-v19.mjs\` para geração reproduzível;
5. \`habbo/beta/qa-v19.mjs\` e capturas desktop/mobile comparadas à versão Classic.

**Invariantes:** 29 grupos, 36 cenas, autoplay de 4000ms, 148 raros, 101 emblemas, 12 gerentes, PT/EN, imagens históricas verificáveis e aviso de fan-site. Manter \`noindex\` enquanto for beta.

## Critérios de aprovação da futura V19

Design deve ser reconhecivelmente Habbo sem virar “dark mode de app SaaS”. Não criar card grids de biografias. Não substituir o Dock funcional. Não alterar a home pública. Não comprometer a versão Classic. Só publicar \`index\` novo depois de revisão visual e QA, preservando a possibilidade de voltar ao design salvo.

**Frase-guia:** _O Hotel está fechado, mas as luzes das memórias continuam acesas._
