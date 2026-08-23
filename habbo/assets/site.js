(() => {
  const $all = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  $all("[data-drawer-toggle]").forEach((button) => {
    const drawer = document.querySelector(button.dataset.drawerToggle);
    if (!drawer) return;
    button.addEventListener("click", () => {
      const open = drawer.dataset.open === "true";
      drawer.dataset.open = String(!open);
      button.setAttribute("aria-expanded", String(!open));
      button.textContent = !open ? button.dataset.closeLabel : button.dataset.openLabel;
    });
  });

  if (new URLSearchParams(window.location.search).get("drawer") === "1") {
    const drawer = document.querySelector("[data-drawer]");
    const button = document.querySelector("[data-drawer-toggle]");
    if (drawer && button) {
      drawer.dataset.open = "true";
      button.setAttribute("aria-expanded", "true");
      button.textContent = button.dataset.closeLabel;
    }
  }

  $all("[data-topology-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.topologyFilter;
      $all("[data-topology-filter]").forEach((item) => {
        item.dataset.active = String(item === button);
      });
      $all("[data-edge-status]").forEach((edge) => {
        edge.classList.toggle("is-hidden", filter !== "all" && edge.dataset.edgeStatus !== filter);
      });
    });
  });

  const homeSearch = document.querySelector("[data-place-search]");
  if (homeSearch) {
    const nodes = $all("[data-place-node]");
    homeSearch.addEventListener("input", () => {
      const query = homeSearch.value.trim().toLocaleLowerCase();
      nodes.forEach((node) => {
        node.classList.toggle("is-hidden", query.length > 0 && !node.dataset.placeSearch.includes(query));
      });
    });
  }

  $all("[data-open-all-districts]").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.dataset.openState !== "true";
      $all("details[data-district]").forEach((district) => { district.open = open; });
      button.dataset.openState = String(open);
      button.textContent = open ? button.dataset.closeLabel : button.dataset.openLabel;
    });
  });
})();
