# mooon.com.br/ai — live sanitized mirror

Este Worker cria um espelho vivo de:

`https://www.luahelena.com.br/ia/?lang=en`

em:

`https://mooon.com.br/ai/`

Ele busca a página original em tempo real, força o runtime para inglês, remove LinkedIn/WhatsApp, remove o switch de idioma, injeta Discord `@moon_aurea` no topo e na área de contato, e mantém o CSS/JS/layout original da página-fonte.

## Como instalar pelo painel da Cloudflare

1. Cloudflare Dashboard → Workers & Pages → Create Worker.
2. Cole o conteúdo de `src/worker.js`.
3. Salve e publique.
4. Vá em Settings → Triggers → Routes.
5. Adicione a rota:

`mooon.com.br/ai*`

6. Garanta que não exista um `index.html` estático competindo em `/ai/`, porque a rota do Worker deve interceptar esse caminho.

## Como testar

Abrir:

`https://mooon.com.br/ai/`

Esperado:

- página em inglês;
- sem switch PT/EN;
- sem LinkedIn;
- sem WhatsApp;
- botão Discord no topo;
- botão Discord na área de contato;
- footer textual com Discord e email;
- botão Discord copia `moon_aurea`.

## Limite honesto

Isto é um espelho vivo: mudanças de texto, cards, CSS e layout na página original tendem a refletir automaticamente.

Mas se a estrutura HTML da página original mudar radicalmente, especialmente nomes de classes, labels de contato ou arquitetura do script de idioma, os seletores de saneamento podem precisar de ajuste.
