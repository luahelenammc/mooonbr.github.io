# Habbo V6 — Recuperação segura no Chat

**Status:** implementação parcial, **não é a V6 do Work perdida**.

A V5 permanece em `main` (`e68cec23b41c19f340ffc68e123eb508a424a31a`). O Work deixou uma V6 staged apenas no worktree remoto de sua execução; ela não foi publicada nem anexada como fonte. Relatórios e matrizes foram preservados no Drive, mas os arquivos `repo-v6/habbo/v6/` e 22 GIFs **não estão disponíveis nesta conversa**.

Esta branch fornece um avanço sem atravessar o gate de direitos:
- experiência de Raros com uma família por vez, atalho para ver todas as famílias e foco estável;
- CSS/JS V6 desacoplados;
- nenhum sprite novo e nenhuma alegação de autorização de publicação;
- nenhuma mutação em Lugares ou no catálogo de emblemas regionais.

## Continuidade bloqueada

1. Recuperar `repo-v6` do Work (checkpoint tar.gz do worktree staged).
2. Comparar com esta branch e integrar preservando seus 69 raros e 13 globais candidatos.
3. Resolver a questão da política BR/PT para **novos assets** antes do merge público.
4. Executar Chromium/Playwright real e comparar screenshots, mobile e redução de movimento.
5. Gerar os HTMLs estáticos sob `habbo/` (não somente `habbo/dist/`).
6. Atualizar fonte canônica somente após release real.

O Gate de direitos vigente não é um parecer jurídico. Fontes oficiais:
- https://help.habbo.com.br/hc/pt-br/articles/360011610939-Pol%C3%ADtica-de-F%C3%A3-Sites-do-Habbo-Hotel
- https://help.habbo.com/hc/en-us/articles/360011512480-Habbo-Fansite-Policy

**Não fazer merge desta branch enquanto os gates de QA do renderer gerado estiverem pendentes.**
