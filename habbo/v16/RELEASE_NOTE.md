# Habbo V16 · Gerentes clássicos do Habbo BR

Data: 19/10/2026. Implementação editorial no Museu Vivo `/habbo/`.

## Fonte governante
Post autoral de Moon: https://nostalgia.mooon.com.br/2025/12/habbo-hotel.html , seção "Recapitulação: gerentes, moderadores e o motor humano do Habbo BR". O recorte preserva os 12 nomes efetivamente citados no artigo e os reúne em três grupos editoriais, sem afirmar que essas faixas de tempo são exclusivas ou representam a listagem integral de contratados. Referências de contraste: https://habboxwiki.com/Habbo.com.br , https://habbo.fandom.com/pt-br/wiki/Gerentes .

## Novo capítulo na home
Capítulo 4: `#gerentes` (PT: **Gerentes clássicos do Habbo BR**, EN: **Classic Habbo BR Managers**), depois de Raros e Emblemas, sem tocar o Dock cinematográfico dos Espaços Públicos. O cabeçalho oferece quatro capítulos com marcação visual do capítulo ativo. A quarta opção permanece navegável também a 320 px e sem JavaScript.

Pioneiros: **Flecha, Mordomo, Paty-Nestle**. Ícones do hotel: **4Queijos, Disco-Lee, MissFurby**. Outros nomes da Staff: **Reeet, TheDJHabbo, Acapulca, Sir-Lawnrence, Prefeita, DJapamala**.

Cada pessoa tem nome, papel editorial, memória resumida e fontes expandíveis com `<details>` nativo. MOD_Guto, MOD_Annie e MOD_Bezao recebem nota específica como **moderadores**, não perfis equivocados de gerentes. O capítulo também remete ao vídeo de Emiseis e às entrevistas de Igor Saringer citados no próprio post, sem inventar URLs externas.

### Fronteiras históricas
- O post da Moon se refere a Mordomo como conta alternativa de Flecha; a Habbox Wiki informa que isso *pode* ter ocorrido. A página preserva essa diferença de confiança, sem fingir verificação conclusiva.
- MissFurby é mencionada com a "segunda geração" no artigo, mas registros independentes situam sua chegada em **2010**; os grupos são editoriais, não trimestres fechados.
- Funções como Community Manager, produtor, marketing, country/office operations e moderador não são sinônimos. O texto diferencia papéis, sem inventar cargos oficiais para as pessoas.
- **Nenhum retrato/avatares gerados por IA, nenhum avatar moderno apresentado como original de 2006–2012.** Cartões tipográficos têm valor editorial, não simulam fotografias.
- O artigo original permanece a fonte primária para seleção dos 12 nomes, com histórico de arquivo externamente vinculado por perfil.

## Rotas
- `/habbo/`, `/habbo/pt-br/`, `/habbo/en/`: capítulo in situ e links do menu.
- `/habbo/pt-br/gerentes/`, `/habbo/en/managers/`: páginas independentes bilíngues, com âncoras para os quatro capítulos e `noindex`, respeitando o padrão do arquivo.

## Arquivos
`habbo/v16/staff-manifest.json` (conteúdo e fontes), `habbo/v16/render-staff.mjs` (renderizador), `habbo/v16/staff.css` (layout original integrado sem geração de imagem), `habbo/v8/build-unified.mjs` (integração no build), `habbo/v6/sync-static-output.mjs` (sincronização estática), `habbo/v13/home.js` (quatro capítulos no estado ativo) e `habbo/qa/v16-classic-staff.mjs` (testes visuais). CI: `.github/workflows/habbo-v16-release.yml`.

## Gates
Aguardar a execução integral da pipeline V16: checagens dos 12 perfis, rotas PT/EN, fontes, smartphones 320/390 px, não-JS, quatro links do cabeçalho, preservação de 148 mobis, 101 emblemas e Dock, além das regressões V15/V14/V13/V12/V8. Mesclar PR #36 somente com testes verdes, e confirmar depois os arquivos de fonte na main. Não confundir merge com propagação do domínio público.
