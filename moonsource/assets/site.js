(() => {
  const root = document.documentElement;
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch { /* optional */ } }
  };

  const translations = {
    pt: {
      'meta.title': 'Moon Source · Public Portable',
      'meta.description': 'Uma arquitetura pública, gratuita e portátil para transformar contexto em orientação reutilizável para IA.',
      'a11y.skip': 'Pular para o conteúdo',
      'brand.subtitle': 'Public Portable · v2',
      'nav.menu': 'Menu', 'nav.start': 'Começar', 'nav.architecture': 'Arquitetura', 'nav.library': 'Biblioteca', 'nav.method': 'Método', 'nav.knowledge': 'Conhecimento', 'nav.theme': 'Noite',
      'hero.eyebrow': 'Arquitetura pública de contexto para IA',
      'hero.title': 'Contexto que sua IA consegue realmente usar.',
      'hero.lead': 'Moon Source transforma identidade, projetos, preferências, limites e decisões em orientação reutilizável — sem obrigar você a se explicar do zero em toda conversa.',
      'hero.primary': 'Começar com o Setup', 'hero.secondary': 'Abrir o Kernel',
      'hero.note': 'Gratuito · portátil · sem conta · funciona em qualquer IA que leia texto',
      'map.label': 'Fluxo público', 'map.setup.title': 'Setup', 'map.setup.body': 'constitui o primeiro perfil', 'map.profile.title': 'Source Profile', 'map.profile.body': 'orienta sua IA e seus projetos', 'map.kernel.title': 'Kernel', 'map.kernel.body': 'mantém, corrige e atualiza', 'map.modules.title': 'Módulos', 'map.modules.body': 'expandem capacidades específicas',
      'trust.free.title': 'Livre para começar', 'trust.free.body': 'sem cadastro ou paywall', 'trust.portable.title': 'Portátil por desenho', 'trust.portable.body': 'ChatGPT, Claude, Gemini, local e outros', 'trust.private.title': 'Privacidade explícita', 'trust.private.body': 'o arquivo não recebe nem armazena seus dados', 'trust.living.title': 'Feito para mudar', 'trust.living.body': 'perfis podem ser auditados e atualizados',
      'architecture.index': 'Arquitetura', 'architecture.eyebrow': 'Não é um prompt solto', 'architecture.title': 'Um sistema pequeno para continuidade real.', 'architecture.lead': 'O Portable separa o primeiro gesto de criação, a referência viva e as extensões. Assim, cada parte pode cumprir uma função clara sem virar um arquivo infinito.',
      'architecture.setup.kicker': 'Executável', 'architecture.setup.title': 'Moon Source Setup', 'architecture.setup.body': 'Guia a conversa inicial, usa o que a IA já sabe com confirmação e produz um perfil pronto para reutilização.', 'architecture.setup.link': 'Baixar Setup →',
      'architecture.kernel.kicker': 'Consultável', 'architecture.kernel.title': 'Moon Source Kernel', 'architecture.kernel.body': 'Explica o método e mantém perfis vivos: audita, reduz ruído, corrige obsolescência e organiza atualizações.', 'architecture.kernel.link': 'Baixar Kernel →',
      'architecture.outputs.kicker': 'Gerados', 'architecture.outputs.title': 'Perfis e packets', 'architecture.outputs.body': 'O resultado pode caber em instruções pessoais, projetos, equipes, workflows ou pacotes de contexto transferíveis.', 'architecture.outputs.meta': 'A saída nasce da sua conversa',
      'architecture.modules.kicker': 'Opcionais', 'architecture.modules.title': 'Módulos de conhecimento', 'architecture.modules.body': 'Camadas específicas podem aprofundar trabalho, pesquisa, escrita, imagem, projetos e outros domínios sem inflar o núcleo.', 'architecture.modules.link': 'Explorar bancos →',
      'method.index': 'Método vivo', 'method.eyebrow': 'Dois movimentos inseparáveis', 'method.title': 'Constituir. Metabolizar.', 'method.lead': 'Uma fonte útil não é só criada; ela também precisa sobreviver ao tempo sem acumular contradição, repetição e memória morta.',
      'method.constitute.eyebrow': 'Constituir', 'method.constitute.title': 'Transformar contexto disperso em fonte legível.', 'method.constitute.body': 'Começar por uma pessoa, ideia, equipe ou conjunto de materiais; descobrir o que importa, definir fronteiras e gerar uma orientação utilizável.',
      'method.metabolize.eyebrow': 'Metabolizar', 'method.metabolize.title': 'Manter a fonte viva sem deformá-la.', 'method.metabolize.body': 'Revisar o que mudou, separar delta real de repetição, resolver obsolescência e atualizar com preservação de conteúdo e autoridade.',
      'library.index': 'Biblioteca pública', 'library.eyebrow': 'Baixe apenas o que precisa', 'library.title': 'O núcleo e seus extras.', 'library.lead': 'Setup e Kernel formam o núcleo. Os packs adicionais resolvem problemas específicos sem exigir a arquitetura privada.',
      'library.setup': 'Cria seu primeiro perfil reutilizável por uma conversa guiada.', 'library.kernel': 'Referência para compreender, manter, reparar e expandir sua fonte.', 'library.routing': 'Para ChatGPT: separa modo, modelo e esforço, poupando uso agentivo sem sacrificar qualidade.', 'library.knowledge.title': 'Bancos de conhecimento', 'library.knowledge.body': 'Prateleira para módulos especializados e expansões futuras.', 'library.download': 'Baixar ↓', 'library.open': 'Abrir ↗',
      'usage.index': 'Uso imediato', 'usage.eyebrow': 'Três passos', 'usage.title': 'Baixe. Execute. Reutilize.', 'usage.step1.title': 'Baixe o Setup', 'usage.step1.body': 'Abra uma nova conversa na IA que você já usa e anexe o arquivo.', 'usage.step2.title': 'Diga “Execute”', 'usage.step2.body': 'A IA conduz a configuração no seu idioma e pede apenas o contexto necessário.', 'usage.step3.title': 'Guarde a saída', 'usage.step3.body': 'Cole o perfil nas instruções, projeto ou workspace onde ele deve orientar futuras conversas.',
      'boundary.eyebrow': 'Fronteira pública', 'boundary.title': 'Uma semente útil. Não a casa inteira.', 'boundary.body': 'O Public Portable é gratuito e funcional por si só. Ele não é aplicativo, terapia, armazenamento de dados nem o corpus privado do Moon Source. O arquivo não coleta suas respostas; a privacidade depende da plataforma de IA onde você decidir usá-lo.',
      'future.eyebrow': 'Living Source', 'future.body': 'O Portable é a camada pública de um método mais amplo para construir e manter contexto vivo para pessoas, projetos e equipes. Essa evolução aparece aqui apenas como horizonte — não como condição para usar o que já é gratuito.',
      'footer.created': 'Criado por Lua Helena Moon · processo coautoral Moon–Áurion', 'footer.work': 'Trabalho em IA', 'footer.knowledge': 'Conhecimento', 'footer.start': 'Começar'
    },
    en: {
      'meta.title': 'Moon Source · Public Portable',
      'meta.description': 'A free, public and portable architecture for turning context into reusable AI orientation.',
      'a11y.skip': 'Skip to content',
      'brand.subtitle': 'Public Portable · v2',
      'nav.menu': 'Menu', 'nav.start': 'Start', 'nav.architecture': 'Architecture', 'nav.library': 'Library', 'nav.method': 'Method', 'nav.knowledge': 'Knowledge', 'nav.theme': 'Night',
      'hero.eyebrow': 'Public context architecture for AI',
      'hero.title': 'Context your AI can actually use.',
      'hero.lead': 'Moon Source turns identity, projects, preferences, boundaries and decisions into reusable orientation — without making you explain yourself from zero in every conversation.',
      'hero.primary': 'Start with Setup', 'hero.secondary': 'Open the Kernel',
      'hero.note': 'Free · portable · no account · works with any AI that can read text',
      'map.label': 'Public flow', 'map.setup.title': 'Setup', 'map.setup.body': 'constitutes the first profile', 'map.profile.title': 'Source Profile', 'map.profile.body': 'orients your AI and projects', 'map.kernel.title': 'Kernel', 'map.kernel.body': 'maintains, repairs and updates', 'map.modules.title': 'Modules', 'map.modules.body': 'extend focused capabilities',
      'trust.free.title': 'Free to begin', 'trust.free.body': 'no signup or paywall', 'trust.portable.title': 'Portable by design', 'trust.portable.body': 'ChatGPT, Claude, Gemini, local and others', 'trust.private.title': 'Explicit privacy', 'trust.private.body': 'the file does not receive or store your data', 'trust.living.title': 'Built to change', 'trust.living.body': 'profiles can be audited and updated',
      'architecture.index': 'Architecture', 'architecture.eyebrow': 'Not a loose prompt', 'architecture.title': 'A small system for real continuity.', 'architecture.lead': 'The Portable separates initial creation, living reference and extensions. Each part can do one clear job without becoming an endless file.',
      'architecture.setup.kicker': 'Executable', 'architecture.setup.title': 'Moon Source Setup', 'architecture.setup.body': 'Guides the first conversation, uses accessible AI memory with confirmation and produces a reusable profile.', 'architecture.setup.link': 'Download Setup →',
      'architecture.kernel.kicker': 'Consultable', 'architecture.kernel.title': 'Moon Source Kernel', 'architecture.kernel.body': 'Explains the method and keeps profiles alive: audits, reduces noise, repairs obsolescence and organizes updates.', 'architecture.kernel.link': 'Download Kernel →',
      'architecture.outputs.kicker': 'Generated', 'architecture.outputs.title': 'Profiles and packets', 'architecture.outputs.body': 'Outputs can fit personal instructions, projects, teams, workflows or transferable context packets.', 'architecture.outputs.meta': 'The output is created in your conversation',
      'architecture.modules.kicker': 'Optional', 'architecture.modules.title': 'Knowledge modules', 'architecture.modules.body': 'Focused layers can deepen work, research, writing, image, projects and other domains without bloating the core.', 'architecture.modules.link': 'Explore banks →',
      'method.index': 'Living method', 'method.eyebrow': 'Two inseparable movements', 'method.title': 'Constitute. Metabolize.', 'method.lead': 'A useful source is not only created; it must also survive time without accumulating contradiction, repetition and dead memory.',
      'method.constitute.eyebrow': 'Constitute', 'method.constitute.title': 'Turn scattered context into a legible source.', 'method.constitute.body': 'Begin from a person, idea, team or body of materials; discover what matters, define boundaries and generate usable orientation.',
      'method.metabolize.eyebrow': 'Metabolize', 'method.metabolize.title': 'Keep the source alive without deforming it.', 'method.metabolize.body': 'Review what changed, separate real delta from repetition, resolve obsolescence and update while preserving content and authority.',
      'library.index': 'Public library', 'library.eyebrow': 'Download only what you need', 'library.title': 'The core and its extras.', 'library.lead': 'Setup and Kernel form the core. Additional packs solve focused problems without requiring the private architecture.',
      'library.setup': 'Creates your first reusable profile through a guided conversation.', 'library.kernel': 'Reference for understanding, maintaining, repairing and extending your source.', 'library.routing': 'For ChatGPT: separates mode, model and effort, preserving agentic usage without sacrificing quality.', 'library.knowledge.title': 'Knowledge banks', 'library.knowledge.body': 'A shelf for specialized modules and future extensions.', 'library.download': 'Download ↓', 'library.open': 'Open ↗',
      'usage.index': 'Immediate use', 'usage.eyebrow': 'Three steps', 'usage.title': 'Download. Execute. Reuse.', 'usage.step1.title': 'Download Setup', 'usage.step1.body': 'Open a new conversation in the AI you already use and attach the file.', 'usage.step2.title': 'Say “Execute”', 'usage.step2.body': 'The AI runs the setup in your language and asks only for needed context.', 'usage.step3.title': 'Keep the output', 'usage.step3.body': 'Paste the profile into the instructions, project or workspace where it should orient future conversations.',
      'boundary.eyebrow': 'Public boundary', 'boundary.title': 'A useful seed. Not the whole house.', 'boundary.body': 'The Public Portable is free and useful on its own. It is not an app, therapy, data storage or the private Moon Source corpus. The file does not collect your answers; privacy depends on the AI platform where you choose to use it.',
      'future.eyebrow': 'Living Source', 'future.body': 'The Portable is the public layer of a broader method for building and maintaining living context for people, projects and teams. That evolution appears here only as a horizon — not as a condition for using what is already free.',
      'footer.created': 'Created by Lua Helena Moon · Moon–Áurion coauthorial process', 'footer.work': 'AI work', 'footer.knowledge': 'Knowledge', 'footer.start': 'Start'
    }
  };

  const applyLanguage = (language, persist = true) => {
    const lang = translations[language] ? language : 'pt';
    const dictionary = translations[lang];
    root.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = dictionary[element.dataset.i18n];
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(';').forEach((mapping) => {
        const [attribute, key] = mapping.split(':');
        if (dictionary[key] !== undefined) element.setAttribute(attribute, dictionary[key]);
      });
    });
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === lang));
    });
    if (persist) storage.set('moon-source-language', lang);
    const url = new URL(window.location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
  };

  const storedTheme = storage.get('moon-source-theme');
  const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'paper';
  root.dataset.theme = storedTheme === 'night' || storedTheme === 'paper' ? storedTheme : preferredTheme;

  const syncThemeLabel = () => {
    const lang = root.lang === 'en' ? 'en' : 'pt';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.textContent = root.dataset.theme === 'night' ? (lang === 'en' ? 'Paper' : 'Papel') : (lang === 'en' ? 'Night' : 'Noite');
    });
  };

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'night' ? 'paper' : 'night';
      storage.set('moon-source-theme', root.dataset.theme);
      syncThemeLabel();
    });
  });

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
      applyLanguage(button.dataset.language);
      syncThemeLabel();
    });
  });

  const requested = new URLSearchParams(window.location.search).get('lang');
  const storedLanguage = storage.get('moon-source-language');
  const browserLanguage = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
  const initialLanguage = requested === 'en' || requested === 'pt'
    ? requested
    : storedLanguage === 'en' || storedLanguage === 'pt'
      ? storedLanguage
      : browserLanguage.startsWith('pt') ? 'pt' : 'en';
  applyLanguage(initialLanguage, false);
  syncThemeLabel();

  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-nav');
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    navigation?.classList.toggle('is-open', !expanded);
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu?.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }));
})();
