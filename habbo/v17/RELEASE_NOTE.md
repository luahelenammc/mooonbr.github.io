# Habbo V17 · Gerentes clássicos: uma fileira de sprites

Data: 19/10/2026. Refatoração corretiva da V16 após feedback explícito de Moon.

## Contrato visual da V17
- **Uma única fileira horizontal scrollável** em `#gerentes`, sem cards biográficos, sem três grupos empilhados, sem mini-textos por gerente.
- Doze nomes na ordem curatorial preservada do post da Moon: Flecha, Mordomo, Paty-Nestle, 4Queijos, Disco-Lee, MissFurby, Reeet, TheDJHabbo, Acapulca, Sir-Lawnrence, Prefeita, DJapamala.
- Cada posição é apenas **sprite histórico e nome**. Há setas externas e swipe nativo, scroll-snap, navegação por teclado e fallback funcional sem JavaScript.
- As páginas `/habbo/pt-br/gerentes/` e `/habbo/en/managers/` exibem **a mesma fileira**, não a interface antiga.
- As URLs dos quatro capítulos na home, o Dock dos Espaços Públicos, 148 peças de raros/HC e 101 emblemas não podem sofrer regressão.

## Originalidade dos arquivos de personagens
Fonte curatorial: https://nostalgia.mooon.com.br/2025/12/habbo-hotel.html .

Artistas e looks foram **recuperados de fontes documentais**, não gerados: oito PNGs de personagens completos 64×110 indexados em https://viajovem.blogspot.com/2021/02/staffs.html ; duas versões GIF 128×220 usadas em https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html ; uma captura de perfil 2011 de DJapamala indexada em https://habbo.fandom.com/pt-br/wiki/Gerentes . Esta última é exibida via recorte de apresentação em CSS, preservando os bytes intactos, **sem simular um sprite novo**.

O ledger `habbo/v17/staff-originals.json` documenta URL de cada arquivo, fonte, dimensões, formato e SHA256. Os arquivos estão em `habbo/assets/v17/staff/` com nomes estáveis. O roteiro `habbo/v17/acquire-staff.mjs` permite revalidar/remetabolizar as fontes.

### Lacuna histórica explícita
**Prefeita:** o nome é garantido pelo post e por arquivos históricos, porém, na presente coleta, nenhum sprite clássico individual pôde ser identificado de forma confiável. Preservar o nome na mesma fileira com marcador editorial discreto `Sprite não localizado`, sem confundir um avatar atual, rosto de outra pessoa ou geração artificial com o look de época. Repor o marcador assim que houver uma fonte específica verificável; nunca se apropriar de pixels de outro personagem.

## Implementação
`habbo/v17/render-rail.mjs`: renderizador bilíngue; `habbo/v17/staff.css`: rail simples sem estética de card, proporção original, responsive; `habbo/v17/staff.js`: setas funcionais e progresso; `habbo/v8/build-unified.mjs`: substituição de renderer V16 por V17; `habbo/v6/sync-static-output.mjs`: integra asset e páginas em Pages; `habbo/qa/v17-staff-rail.mjs` e `.github/workflows/habbo-v17-release.yml`: testes e publicação com gates.

Exigir CI verde, visual mobile/desktop/320px, nenhum card visível, uma única rail, 12 nomes e imagens arquivísticas legíveis, ausência de overflow da página, e preservar todos os 249 exemplares históricos de mobis/emblemas. Só mesclar após validado.
