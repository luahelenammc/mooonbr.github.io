(() => {
  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const languageKey = "habbo-archive-language";

  // The root entry may follow the last chosen language without changing the
  // stable locale routes. Every other language button is a real link, so the
  // archive remains usable with JavaScript disabled.
  const rootEntry = document.body?.dataset.rootEntry === "true";
  const storedLanguage = localStorage.getItem(languageKey);
  if (rootEntry && storedLanguage === "en") {
    const target = `${location.pathname.replace(/\/habbo\/?$/, "/habbo/en/")}${location.search}${location.hash}`;
    if (target !== location.href) {
      location.replace(target);
      return;
    }
  }

  all("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(languageKey, button.dataset.lang === "en" ? "en" : "pt-br");
    });
  });

  // A quiet map selection state makes the world legible without adding a
  // permanent card or status label to every room.
  const spatialWorld = document.querySelector("[data-spatial-map]");
  if (spatialWorld) {
    const selectedId = new URLSearchParams(location.search).get("selected");
    const nodes = all("[data-room-node]", spatialWorld);
    const selected = selectedId ? nodes.find((node) => node.href.includes(`/lugar/${selectedId}/`) || node.href.includes(`/place/${selectedId}/`)) : null;
    if (selected) {
      selected.classList.add("is-selected");
      spatialWorld.classList.add("has-selection");
      selected.setAttribute("aria-current", "location");
    }
  }

  // Search is deliberately a utility layer, not the homepage composition.
  const dialog = document.querySelector("[data-search-dialog]");
  const openSearch = () => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.querySelector("input")?.focus();
  };
  const closeSearch = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };
  all("[data-open-search]").forEach((button) => button.addEventListener("click", openSearch));
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeSearch();
  });
  const searchInput = document.querySelector("[data-place-search]");
  if (searchInput) {
    const searchItems = all("[data-search-results] li");
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLocaleLowerCase();
      searchItems.forEach((item) => {
        item.classList.toggle("is-hidden", query.length > 0 && !item.textContent.toLocaleLowerCase().includes(query));
      });
    });
  }

  // Filter the evidence graph by line type. The text fallback shares the same
  // data attribute, keeping the graph and semantic list synchronized.
  all("[data-topology-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.topologyFilter;
      all("[data-topology-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      all("[data-edge-status]").forEach((edge) => {
        edge.classList.toggle("is-hidden", filter !== "all" && edge.dataset.edgeStatus !== filter);
      });
    });
  });

  const drawer = document.querySelector("[data-archive-drawer]");
  if (drawer && new URLSearchParams(location.search).get("drawer") === "1") drawer.open = true;
})();
