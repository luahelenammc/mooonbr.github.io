const CONFIG = {
  sourceOrigin: "https://www.luahelena.com.br",
  sourcePage: "https://www.luahelena.com.br/ia/?lang=en",
  publicPage: "https://mooon.com.br/ai/",
  discordDisplay: "@moon_aurea",
  discordCopy: "moon_aurea",
  email: "luahelenammc@gmail.com",
};

export default {
  async fetch(request) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === "/ai") {
      return Response.redirect(`${requestUrl.origin}/ai/`, 308);
    }

    const originUrl = mapToSource(requestUrl);

    const upstream = await fetch(originUrl.toString(), {
      headers: {
        "User-Agent": "Moon-AI-Live-Mirror/1.0",
        "Accept": request.headers.get("Accept") || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cf: {
        cacheTtl: 300,
        cacheEverything: false,
      },
    });

    const headers = new Headers(upstream.headers);
    headers.delete("content-security-policy");
    headers.delete("content-security-policy-report-only");
    headers.delete("x-frame-options");
    headers.set("Cache-Control", "public, max-age=300, s-maxage=300");

    const contentType = headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("text/html")) {
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      });
    }

    let html = await upstream.text();
    html = transformHtml(html);

    headers.set("content-type", "text/html; charset=utf-8");

    return new Response(html, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
};

function mapToSource(requestUrl) {
  const path = requestUrl.pathname;

  if (path === "/ai/" || path === "/ai/index.html") {
    return new URL(CONFIG.sourcePage);
  }

  const assetPath = path.replace(/^\/ai\/?/, "");
  const originUrl = new URL(`/ia/${assetPath}`, CONFIG.sourceOrigin);
  originUrl.search = requestUrl.search;
  return originUrl;
}

function transformHtml(html) {
  html = forceEnglish(html);
  html = rewritePublicMetadata(html);
  html = removePrivateContactMarkup(html);
  html = sanitizePacketContact(html);
  html = injectDiscordCss(html);
  html = injectDiscordRuntime(html);
  return html;
}

function forceEnglish(html) {
  return html
    .replace(/<html\b[^>]*>/i, '<html lang="en">')
    .replace(/<body\b([^>]*)>/i, '<body$1><script>try{localStorage.setItem("moonIaLang","en");}catch(e){}</script>')
    .replace(/setLanguage\(getInitialLanguage\(\),\s*false\);/g, "setLanguage('en', false);")
    .replace(/const\s+s\s*=\s*localStorage\.getItem\('moonIaLang'\);[\s\S]*?return s === 'en' \|\| s === 'pt' \? s : 'pt';/g, "return 'en';")
    .replace(/\s*<div class="lang-toggle"[\s\S]*?<\/div>\s*/gi, "\n");
}

function rewritePublicMetadata(html) {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, '<title>Lua Helena Moon — Human–AI Context Architecture</title>')
    .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${CONFIG.publicPage}">`)
    .replace(/<link\s+rel="alternate"[^>]*>/gi, "")
    .replace(/https:\/\/www\.luahelena\.com\.br\/ia\/\?lang=en/g, CONFIG.publicPage)
    .replace(/https:\/\/www\.luahelena\.com\.br\/ia\//g, CONFIG.publicPage)
    .replace(/https:\/\/www\.luahelena\.com\.br\/ia/g, CONFIG.publicPage)
    .replace(/"sameAs"\s*:\s*\["https:\/\/www\.linkedin\.com\/in\/luahelena\/"\],?\s*/g, "")
    .replace(/"telephone"\s*:\s*"\+55-41-99222-8411",?\s*/g, "");
}

function removePrivateContactMarkup(html) {
  return html
    .replace(/\s*<a\b[^>]*href=["'][^"']*(?:linkedin\.com|wa\.me)[^"']*["'][\s\S]*?<\/a>\s*/gi, "\n")
    .replace(/\s*<span>\s*<strong>\s*(?:LinkedIn|WhatsApp)\s*:\s*<\/strong>[\s\S]*?<\/span>\s*/gi, "\n")
    .replace(/LinkedIn:\s*@luahelena\s*·\s*/gi, "")
    .replace(/\s*·\s*WhatsApp:\s*(?:\+55\s*)?\(?41\)?\s*9?\s*9222-8411\s*/gi, "")
    .replace(/WhatsApp:\s*(?:\+55\s*)?\(?41\)?\s*9?\s*9222-8411\s*·\s*/gi, "")
    .replace(/LinkedIn:\s*@luahelena/gi, "")
    .replace(/WhatsApp:\s*(?:\+55\s*)?\(?41\)?\s*9?\s*9222-8411/gi, "");
}

function sanitizePacketContact(html) {
  return html
    .replace(/\n\s*linkedin:\s*"https:\/\/www\.linkedin\.com\/in\/luahelena\/"/g, `\n  discord: "${CONFIG.discordDisplay}"`)
    .replace(/\n\s*whatsapp:\s*"\+55 41 9 9222-8411"/g, "")
    .replace(/\n\s*linkedin:\s*"https:\/\/www\.linkedin\.com\/in\/luahelena"/g, `\n  discord: "${CONFIG.discordDisplay}"`)
    .replace(/\n\s*whatsapp:\s*"\+55-41-99222-8411"/g, "");
}

function injectDiscordCss(html) {
  const css = `

    /* Reddit-safe Discord contact patch — injected by mooon.com.br/ai Worker */
    .button.discord-moon {
      position: relative;
      overflow: visible;
      gap: 8px;
      border-color: rgba(88, 101, 242, .82);
      background:
        radial-gradient(circle at 18% 20%, rgba(255,255,255,.30), transparent 12px),
        linear-gradient(135deg, #5865F2 0%, #6f7cff 48%, #404eed 100%);
      color: #fff;
      font-weight: 850;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.10) inset,
        0 0 20px rgba(88,101,242,.34),
        0 14px 34px rgba(0,0,0,.24);
      animation: moonDiscordOuterGlow 2.65s ease-in-out infinite;
    }

    .button.discord-moon::after {
      content: "";
      position: absolute;
      inset: -7px;
      z-index: -1;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(88,101,242,.34), rgba(88,101,242,.13) 43%, transparent 72%);
      filter: blur(10px);
      opacity: .72;
      animation: moonDiscordHalo 2.65s ease-in-out infinite;
      pointer-events: none;
    }

    .button.discord-moon:hover,
    .button.discord-moon:focus-visible {
      border-color: rgba(188,194,255,.96);
      background:
        radial-gradient(circle at 18% 20%, rgba(255,255,255,.36), transparent 12px),
        linear-gradient(135deg, #6875ff 0%, #7f88ff 48%, #5865F2 100%);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.14) inset,
        0 0 26px rgba(88,101,242,.58),
        0 18px 42px rgba(0,0,0,.28);
    }

    .discord-moon svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.24));
    }

    .discord-copy-toast {
      position: fixed;
      left: 50%;
      bottom: 22px;
      z-index: 9999;
      transform: translateX(-50%) translateY(12px);
      opacity: 0;
      padding: 10px 14px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      background: rgba(14, 10, 28, .86);
      backdrop-filter: blur(12px);
      color: #fffaf7;
      box-shadow: 0 18px 44px rgba(0,0,0,.34), 0 0 22px rgba(88,101,242,.28);
      pointer-events: none;
      transition: opacity .18s ease, transform .18s ease;
      font-size: .92rem;
    }

    .discord-copy-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    footer .discord-inline-copy {
      border: 0;
      padding: 0;
      background: transparent;
      color: #dfe3ff;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      text-decoration: underline;
      text-decoration-color: rgba(223,227,255,.34);
      text-underline-offset: 3px;
    }

    footer .discord-inline-copy:hover,
    footer .discord-inline-copy:focus-visible {
      color: #fff;
      text-decoration-color: rgba(255,255,255,.72);
      outline: none;
    }

    @keyframes moonDiscordOuterGlow {
      0%, 100% {
        box-shadow:
          0 0 0 1px rgba(255,255,255,.10) inset,
          0 0 17px rgba(88,101,242,.28),
          0 12px 31px rgba(0,0,0,.22);
      }
      50% {
        box-shadow:
          0 0 0 1px rgba(255,255,255,.13) inset,
          0 0 34px rgba(88,101,242,.68),
          0 0 58px rgba(88,101,242,.20),
          0 18px 42px rgba(0,0,0,.27);
      }
    }

    @keyframes moonDiscordHalo {
      0%, 100% { opacity: .42; transform: scale(.985); }
      50% { opacity: .92; transform: scale(1.045); }
    }

    @media(prefers-reduced-motion:reduce) {
      .button.discord-moon,
      .button.discord-moon::after {
        animation: none !important;
      }
    }
`;

  if (html.includes("</style>")) {
    return html.replace("</style>", `${css}\n  </style>`);
  }

  return html.replace("</head>", `<style>${css}</style></head>`);
}

function injectDiscordRuntime(html) {
  const script = `
  <script>
    (function moonDiscordPatch() {
      const DISCORD_DISPLAY = ${JSON.stringify(CONFIG.discordDisplay)};
      const DISCORD_COPY = ${JSON.stringify(CONFIG.discordCopy)};
      const EMAIL = ${JSON.stringify(CONFIG.email)};

      function discordSvg() {
        return '<svg viewBox="0 0 245 240" aria-hidden="true" focusable="false"><path fill="currentColor" d="M104.4 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1Zm36.2 0c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1Z"/><path fill="currentColor" d="M189.5 20h-134C44.2 20 35 29.2 35 40.6v135.2c0 11.4 9.2 20.6 20.5 20.6h113.4l-5.3-18.4 12.8 11.9 12.1 11.2L210 220V40.6c0-11.4-9.2-20.6-20.5-20.6Zm-38.9 130.6s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.5 5.9-5 2.1-9.8 3.5-14.5 4.3-9.6 1.8-18.4 1.3-25.9-.1-5.7-1.1-10.6-2.6-14.7-4.3-2.3-.9-4.8-2-7.3-3.4-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.3-1.8-1-2.8-1.7-2.8-1.7s4.8 8 17.5 11.8c-3 3.8-6.7 8.3-6.7 8.3-22.1-.7-30.5-15.2-30.5-15.2 0-32.2 14.4-58.3 14.4-58.3 14.4-10.8 28.1-10.5 28.1-10.5l1 1.2c-18 5.2-26.3 13.1-26.3 13.1s2.2-1.2 5.9-2.9c10.7-4.7 19.2-6 22.7-6.3.6-.1 1.1-.2 1.7-.2 6.1-.8 13-1 20.2-.2 9.5 1.1 19.7 3.9 30.1 9.6 0 0-7.9-7.5-24.9-12.7l1.4-1.6s13.7-.3 28.1 10.5c0 0 14.4 26.1 14.4 58.3 0 .1-8.5 14.6-30.8 15.3Z"/></svg>';
      }

      function makeDiscordButton(context) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button discord-moon';
        button.setAttribute('data-moon-discord-button', context || 'default');
        button.setAttribute('aria-label', 'Copy Discord username ' + DISCORD_DISPLAY);
        button.innerHTML = discordSvg() + '<span>Discord</span> <strong>' + DISCORD_DISPLAY + '</strong>';
        button.addEventListener('click', function () { copyDiscord(button); });
        return button;
      }

      function showToast(message) {
        let toast = document.querySelector('.discord-copy-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.className = 'discord-copy-toast';
          document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(function () { toast.classList.remove('show'); }, 1450);
      }

      async function copyText(value) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
          return;
        }
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }

      async function copyDiscord(button) {
        const original = button ? button.innerHTML : '';
        try {
          await copyText(DISCORD_COPY);
          if (button) {
            button.innerHTML = discordSvg() + '<span>Copied</span> <strong>' + DISCORD_DISPLAY + '</strong>';
            setTimeout(function () { button.innerHTML = original; }, 1250);
          }
          showToast('Discord username copied: ' + DISCORD_DISPLAY);
        } catch (e) {
          showToast('Discord: ' + DISCORD_DISPLAY);
        }
      }

      function sanitizePrivateContacts() {
        document.querySelectorAll('a[href*="linkedin.com"], a[href*="wa.me"]').forEach(function (a) {
          const kill = a.closest('.button, address span, .contact-links span, nav.actions > a') || a;
          kill.remove();
        });

        document.querySelectorAll('.lang-toggle').forEach(function (el) { el.remove(); });

        document.querySelectorAll('address.contact-links span').forEach(function (span) {
          if (/LinkedIn|WhatsApp/i.test(span.textContent || '')) span.remove();
        });
      }

      function installTopDiscord() {
        const topActions = document.querySelector('header.topbar .actions');
        if (!topActions) return;

        topActions.querySelectorAll('[data-moon-discord-button]').forEach(function (el) { el.remove(); });

        const packetWrap = topActions.querySelector('.ai-packet-wrap');
        const button = makeDiscordButton('top');

        if (packetWrap) packetWrap.insertAdjacentElement('afterend', button);
        else topActions.appendChild(button);
      }

      function installContactDiscord() {
        const contactActions = document.querySelector('.contact nav.actions');
        if (!contactActions) return;

        contactActions.querySelectorAll('[data-moon-discord-button]').forEach(function (el) { el.remove(); });
        contactActions.querySelectorAll('a[href*="linkedin.com"], a[href*="wa.me"]').forEach(function (el) { el.remove(); });

        const packetWrap = contactActions.querySelector('.ai-packet-wrap');
        const button = makeDiscordButton('contact');

        if (packetWrap) packetWrap.insertAdjacentElement('afterend', button);
        else contactActions.appendChild(button);
      }

      function rewriteContactAndFooter() {
        const address = document.querySelector('address.contact-links');
        if (address) {
          address.innerHTML = '<span><strong>Email:</strong> <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></span>';
        }

        const footer = document.querySelector('footer');
        if (footer) {
          footer.innerHTML = 'Lua Helena Moon Martins Cardoso · Human–AI Context Architecture · Limeira/SP, Brazil · Fully remote<br>Discord: <button type="button" class="discord-inline-copy" data-discord-inline-copy>' + DISCORD_DISPLAY + '</button> · Email: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>';
          const inline = footer.querySelector('[data-discord-inline-copy]');
          if (inline) inline.addEventListener('click', function () { copyDiscord(null); });
        }
      }

      function run() {
        try { if (typeof setLanguage === 'function') setLanguage('en', false); } catch (e) {}
        sanitizePrivateContacts();
        installTopDiscord();
        installContactDiscord();
        rewriteContactAndFooter();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        run();
      }
    })();
  </script>
`;

  return html.replace(/<\/body>\s*<\/html>\s*$/i, `${script}\n</body>\n</html>`);
}
