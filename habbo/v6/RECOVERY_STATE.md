# Habbo V6 — release visual recuperado e validado

**Estado atual:** release candidate completo na branch `feat/habbo-v6-global-first-reconstruction`. Este registro foi escrito antes do merge; não substitui verificação posterior de `main`.

## O que foi recuperado
- 22 GIFs autênticos, resgatados individualmente de `images.habbo.com` e do arquivo histórico Habborator.
- Verificação SHA-256 integral: **22/22** correspondem ao manifesto oriundo da pesquisa V6 do Work.
- 9 novos raros acrescentados ao corpus anterior de 60; total **69 raros**, com fichas PT-BR/EN.
- 13 emblemas globais/cross-hotel com imagens originais e fichas PT-BR/EN (HC1/HC2, conquistas de HC e VIP, EHR).
- Os **62 emblemas regionais BR/PT** foram preservados em uma seção posterior; nenhuma atribuição não documentada de hotel foi inventada.
- Interface com quatro famílias globais no topo da galeria de emblemas e apresentação minimalista cinza-escura.
- Gerador de páginas para `/habbo/` sincronizado com a árvore servida pelo GitHub Pages.

## Evidência de funcionamento
- Workflow de compilação e publicação do candidato: https://github.com/luahelenammc/mooonbr.github.io/actions/runs/39245193748 (**concluído com sucesso**).
- Suite Chromium V6 com originais servidos, PT/EN, desktop/mobile: **52 checks passaram**.
- Regressões do display de Raros V5/V6, grupos, idiomas e imagens presentes.
- Screenshots anexados ao artefato `habbo-v6-originals-and-release-qa` do workflow.

## Condições de uso
Os 22 GIFs são de propriedade dos respectivos titulares. Este projeto usa uma **interpretação documentada da política internacional de fã-sites não comerciais**, sem se apresentar como afiliado, registrado, oficial ou individualmente autorizado pela Sulake. A redação BR/PT sobre registro difere. Revisar em qualquer questionamento do titular; licença aberta **não** foi concedida. Fonte: `habbo/v6/PUBLICATION_POLICY_DECISION.md` e `asset-release-approval.json` (o nome histórico deste último arquivo NÃO significa aprovação Sulake).

## Limitações editoriais
A disponibilização documentada do sprite não comprova que cada item existiu em todos os hotéis. Algumas imagens adicionais de raros são **sprites de catálogo de 30px**, não renders 3D completos. Os 13 emblemas globais são a primeira seleção verificada, não um catálogo exaustivo de todos os emblemas globais pré-2012. Novas séries permanecem no backlog.

## Pós-merge obrigatório
Validar commit em `main`, Pages deploy e URLs `/habbo/pt-br/emblemas/`, `/habbo/en/badges/`, `/habbo/pt-br/raros/`, uma ficha global e uma ficha de raro. Depois, atualizar a fonte canônica com evidências reais do release.
