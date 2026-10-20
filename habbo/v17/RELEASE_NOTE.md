# Habbo V17 · Gerentes clássicos: galeria horizontal de sprites
Data: 19/10/2026

## Correção de apresentação
Substituir integralmente o capítulo biográfico de cards da V16 por **uma única fileira horizontal scrollável** com o nome de cada gerente sob o sprite, como os raros e Espaços Públicos. Sem grid, sem três grupos visuais separados, sem minibios, sem links/editoriais na face dos itens. Páginas PT `/habbo/pt-br/gerentes/` e EN `/habbo/en/managers/` acompanham a mesma única rail.

**Doze nomes exatamente conforme o texto da Moon**: Flecha, Mordomo, Paty-Nestle, 4Queijos, Disco-Lee, MissFurby, Reeet, TheDJHabbo, Acapulca, Sir-Lawnrence, Prefeita, DJapamala.
Fonte editorial: https://nostalgia.mooon.com.br/2025/12/habbo-hotel.html .

## Sprite-only com integridade de evidência
Fãs preservaram versões históricas de corpo inteiro (64×110 px) para **oito nomes**, recuperadas por link direto do artigo ViaJovem: https://viajovem.blogspot.com/2021/02/staffs.html (compilação retrospectiva de 2021 dos gerentes clássicos). Arquivos baixados em `habbo/assets/v17/staff/`, URLs fontes e SHA-256 auditáveis em `habbo/v17/sprite-ledger.json`. Importação/QA offline: `node habbo/v17/acquire-staff.mjs --check`; fontes literais fixadas em `habbo/v17/staff-source-urls.json`. NÃO é correto dizer que a data do sprite individual é 2021 ou que é necessariamente a roupa usada durante todo o período: é uma ilustração conservada numa retrospectiva publicada em 2021.

**Quatro identidades sem arquivo original utilizável**: Mordomo, Sir-Lawnrence, Prefeita, DJapamala. Os arquivos de 2011 https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html citam ilustrações originais de Mordomo e Sir-Lawnrence, mas seus antigos endpoints Google Blogger proxy retornam 404. O gerador de avatar contemporâneo do Habbo não está acessível/é inadequado como documento da época. Por isso, ficam como itens nomeados e assinalados sem sprite (não produzir imagem com Python, CSS, IA, avatar atual disfarçado, nem reusar rosto de outro Habbo). Este limite permanece para futura pesquisa de arquivo e não deve ser ocultado.

## Layout e rotas
`habbo/v16/render-staff.mjs`: uma única `v17-staff-rail`, 12 `figure` simples (8 `img`, 4 ausências explicitadas), controles de rolagem nativos para homepage e `habbo/v17/staff.js` para páginas independentes. `habbo/v16/staff.css` reescrito como rail de figuras; nenhuma biografia em card. `habbo/v8/build-unified.mjs` integra dados e publica os assets; `habbo/v6/sync-static-output.mjs` sincroniza os PNG, CSS, JS, ambas as páginas e as três indices. Navegação com quatro capítulos, sem alteração do Dock, 148 mobis e 101 badges.

## Gates
`habbo/qa/v17-staff-sprite-rail.mjs` exige uma rail, os doze nomes, verificação dos oito sprites e quatro ausências, ausência dos velhos cards, rolagem horizontal via botão/touch/teclado, dimensões de sprite, pages PT/EN, telas 1440/390/320 e sem JS. Pipeline `.github/workflows/habbo-v17-release.yml` deve também passar regressões V13–V15, V12/V8 e Dock antes do merge. Nenhum deploy externo é presumido pelo merge.
