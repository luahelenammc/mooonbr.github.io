(() => {
  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const body = document.body;
  const pageUrl = new URL(location.href);
  const rootEntry = body?.dataset.rootEntry === "true";
  const languageKey = "habbo-archive-language";
  const dockPreferenceKey = "habbo-dock-autoplay-v4";
  const safeStorage = (kind) => {
    try { return window[kind]; } catch { return null; }
  };
  const localStorageSafe = safeStorage("localStorage");
  const sessionStorageSafe = safeStorage("sessionStorage");
  const readStored = (storage, key) => {
    try { return storage?.getItem(key) || ""; } catch { return ""; }
  };
  const writeStored = (storage, key, value) => {
    try { storage?.setItem(key, value); } catch { /* private browsing can deny storage */ }
  };
  const storedLanguage = readStored(localStorageSafe, languageKey);
  let presentationState = null;

  if (rootEntry && storedLanguage === "en") {
    const targetPath = location.pathname.replace(/\/habbo\/?$/, "/habbo/en/");
    const target = `${targetPath}${location.search}${location.hash}`;
    if (target !== `${location.pathname}${location.search}${location.hash}`) {
      location.replace(target);
      return;
    }
  }

  const setLanguage = (lang) => writeStored(localStorageSafe, languageKey, lang === "en" ? "en" : "pt-br");
  const preserveLanguageSelection = (event, button) => {
    setLanguage(button.dataset.lang);
    if (body?.dataset.page !== "home" || !button.dataset.homeLocale || !presentationState) return;
    const target = new URL(button.href, location.href);
    if (location.hash) target.hash = location.hash;
    if (presentationState.lightboxOpen) target.searchParams.set("lightbox", "1");
    event.preventDefault();
    location.assign(`${target.pathname}${target.search}${target.hash}`);
  };
  all("[data-lang]").forEach((button) => button.addEventListener("click", (event) => preserveLanguageSelection(event, button)));

  const infoDialog = document.querySelector("[data-info-dialog]");
  const openInfo = () => {
    if (!infoDialog) return;
    if (typeof infoDialog.showModal === "function") infoDialog.showModal();
    else infoDialog.setAttribute("open", "");
    infoDialog.querySelector("[data-close-info]")?.focus();
  };
  const closeInfo = () => {
    if (!infoDialog) return;
    if (typeof infoDialog.close === "function") infoDialog.close();
    else infoDialog.removeAttribute("open");
  };
  all("[data-open-info]").forEach((button) => button.addEventListener("click", openInfo));
  all("[data-close-info]").forEach((button) => button.addEventListener("click", closeInfo));
  infoDialog?.addEventListener("click", (event) => {
    if (event.target === infoDialog) closeInfo();
  });

  const dock = document.querySelector("[data-cinematic-dock]");
  if (dock) {
    const viewport = dock.querySelector("[data-dock-viewport]");
    const track = dock.querySelector("[data-dock-track]");
    const slides = all("[data-dock-slide]", dock);
    const rooms = slides.flatMap((slide, slideIndex) => all("[data-room-open]", slide).map((button, variantIndex) => ({
      button,
      slide,
      slideIndex,
      variantIndex,
      itemId: button.dataset.roomItemId || `${slide.dataset.roomId}_${variantIndex + 1}`
    })));
    const activeName = dock.querySelector("[data-active-name]");
    const activeVariant = dock.querySelector("[data-active-variant]");
    const activeAlias = dock.querySelector("[data-active-alias]");
    const activeIndex = dock.querySelector("[data-active-index]");
    const status = dock.querySelector("[data-dock-status]");
    const playButton = dock.querySelector("[data-dock-play]");
    const playLabel = dock.querySelector("[data-dock-play-label]");
    const lightbox = document.querySelector("[data-lightbox]");
    const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
    const lightboxTitle = lightbox?.querySelector("[data-lightbox-title]");
    const lightboxAlias = lightbox?.querySelector("[data-lightbox-alias]");
    const lightboxIndex = lightbox?.querySelector("[data-lightbox-index]");
    const lightboxVariantLabel = lightbox?.querySelector("[data-lightbox-variant-label]");
    const lightboxVariants = lightbox?.querySelector("[data-lightbox-variants]");
    const lightboxDetail = lightbox?.querySelector("[data-lightbox-detail]");
    const lightboxShell = lightbox?.querySelector(".lightbox-shell");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const autoplayMs = Number(dock.dataset.autoplayMs || 4000);
    const initialId = decodeURIComponent(location.hash.replace(/^#/, ""));
    const initialMatch = rooms.findIndex((item) => item.itemId === initialId || item.slide.dataset.roomId === initialId);
    const state = {
      activeItemIndex: initialMatch >= 0 ? initialMatch : 0,
      visualSlideIndex: null,
      holds: new Set(),
      timer: null,
      resumeTimer: null,
      manualResumeTimer: null,
      transitionTimer: null,
      wheelTimer: null,
      wheelLocked: false,
      manualPaused: readStored(sessionStorageSafe || localStorageSafe, dockPreferenceKey) === "paused",
      lightboxOpen: false,
      lightboxVariantIndex: 0,
      originFocus: null,
      drag: null,
      suppressClickUntil: 0,
      reducedMotion: prefersReducedMotion.matches,
      pointerX: null
    };
    presentationState = state;
    dock.dataset.reducedMotion = String(state.reducedMotion);
    dock.dataset.effect = dock.dataset.dockEffect || "zoom";

    const normalizeIndex = (value) => rooms.length ? (value + rooms.length) % rooms.length : 0;
    const itemAt = (index) => rooms[normalizeIndex(index)];
    const slideVariants = (slide) => {
      if (!slide) return [];
      try {
        const parsed = JSON.parse(slide.dataset.roomVariants || "[]");
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch { /* malformed data falls back to the visible image */ }
      const source = slide.querySelector("img");
      return [{ id: "primary", labelPt: "Sala principal", labelEn: "Main room", src: source?.src || "", width: Number(source?.width || 720), height: Number(source?.height || 480), detailId: slide.dataset.roomId }];
    };
    const variantFor = (item) => slideVariants(item?.slide)[item?.variantIndex] || slideVariants(item?.slide)[0] || {};

    function clearAutoplayTimer() {
      if (state.timer) window.clearTimeout(state.timer);
      state.timer = null;
      if (state.resumeTimer) window.clearTimeout(state.resumeTimer);
      state.resumeTimer = null;
    }

    function updatePlayControl() {
      if (!playButton) return;
      const paused = state.manualPaused || state.holds.has("manualPause") || state.reducedMotion;
      playButton.setAttribute("aria-pressed", String(state.manualPaused));
      playButton.dataset.paused = String(paused);
      if (playLabel) playLabel.textContent = state.manualPaused ? (body.dataset.locale === "pt-br" ? "retomar" : "resume") : (body.dataset.locale === "pt-br" ? "pausar" : "pause");
      const icon = playButton.querySelector(".dock-play-icon");
      if (icon) icon.textContent = state.manualPaused ? "▶" : "Ⅱ";
    }

    function hold(reason) {
      state.holds.add(reason);
      dock.dataset.autoplayHolds = [...state.holds].join(",");
      clearAutoplayTimer();
      updatePlayControl();
    }

    function release(reason, grace = 0) {
      state.holds.delete(reason);
      dock.dataset.autoplayHolds = [...state.holds].join(",");
      if (state.holds.size === 0 && grace > 0 && !state.manualPaused && !state.reducedMotion && !state.lightboxOpen) {
        if (state.resumeTimer) window.clearTimeout(state.resumeTimer);
        state.resumeTimer = window.setTimeout(() => {
          state.resumeTimer = null;
          scheduleAutoplay();
        }, grace);
      } else if (state.holds.size === 0) scheduleAutoplay();
      updatePlayControl();
    }

    function scheduleAutoplay(delay = autoplayMs) {
      if (state.timer) window.clearTimeout(state.timer);
      state.timer = null;
      if (state.manualPaused || state.reducedMotion || state.lightboxOpen || state.holds.size > 0 || rooms.length < 2) return;
      state.timer = window.setTimeout(() => {
        state.timer = null;
        goTo(state.activeItemIndex + 1, { source: "autoplay" });
        scheduleAutoplay();
      }, delay);
    }

    function setTrackPosition(animate = true) {
      if (!viewport || !track || !slides.length) return;
      const item = itemAt(state.activeItemIndex);
      if (!item) return;
      const shift = viewport.clientWidth / 2 - (item.slide.offsetLeft + item.slide.offsetWidth / 2);
      track.style.setProperty("--dock-shift", `${shift}px`);
      if (!state.drag) track.style.setProperty("--dock-drag-shift", "0px");
      track.classList.toggle("is-instant", !animate || state.reducedMotion);
    }

    function updateVisualFocus() {
      const narrow = window.matchMedia("(max-width: 720px)").matches;
      const pointerX = state.pointerX;
      const active = itemAt(state.activeItemIndex);
      const activeSlideIndex = active?.slideIndex || 0;
      let focusIndex = activeSlideIndex;
      const centers = slides.map((slide) => {
        const rect = slide.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
      if (pointerX !== null && centers.length) {
        focusIndex = centers.reduce((best, center, index) => Math.abs(center - pointerX) < Math.abs(centers[best] - pointerX) ? index : best, 0);
      } else if (state.visualSlideIndex !== null) focusIndex = state.visualSlideIndex;
      slides.forEach((slide, index) => {
        const distance = Math.abs(index - activeSlideIndex);
        const pointerDistance = pointerX === null ? Infinity : Math.abs(centers[index] - pointerX);
        const pointerReach = Math.max(150, (slide.offsetWidth || 260) * (narrow ? 1.3 : 1.85));
        const pointerInfluence = pointerX === null ? 0 : Math.max(0, 1 - pointerDistance / pointerReach);
        const baseScale = index === activeSlideIndex ? (narrow ? 1.08 : 1.14) : Math.max(narrow ? .7 : .5, (narrow ? 1 : 1.01) - distance * (narrow ? .11 : .15));
        const scale = Math.min(narrow ? 1.12 : 1.34, baseScale + pointerInfluence * (narrow ? .06 : .22));
        const opacity = Math.max(narrow ? .34 : .24, Math.min(1, .86 - distance * (narrow ? .1 : .15) + pointerInfluence * .22));
        const blur = narrow ? 0 : Math.max(0, Math.min(2.8, (1 - pointerInfluence) * .62 + distance * .1));
        const pointerAngle = pointerX === null ? (index - activeSlideIndex) * 2.2 : Math.max(-8, Math.min(8, (centers[index] - pointerX) / 44));
        const z = narrow ? (index === focusIndex ? 40 : 0) : Math.max(0, 130 - distance * 38 + pointerInfluence * 58);
        slide.style.setProperty("--dock-scale", scale.toFixed(3));
        slide.style.setProperty("--dock-opacity", opacity.toFixed(3));
        slide.style.setProperty("--dock-blur", `${blur.toFixed(2)}px`);
        slide.style.setProperty("--dock-rotate", `${narrow ? 0 : pointerAngle.toFixed(2)}deg`);
        slide.style.setProperty("--dock-z", `${z.toFixed(1)}px`);
        slide.classList.toggle("is-active", index === activeSlideIndex);
        slide.classList.toggle("is-visual-focus", index === focusIndex);
      });
      rooms.forEach((item, index) => {
        const selected = index === state.activeItemIndex;
        item.button.classList.toggle("is-current", selected);
        item.button.setAttribute("aria-current", String(selected));
      });
    }

    function updateCaption(announce = true) {
      const item = itemAt(state.activeItemIndex);
      const variant = variantFor(item);
      const name = item?.slide.dataset.roomName || "";
      const alias = item?.slide.dataset.roomAlias || "";
      const variantName = body.dataset.locale === "pt-br" ? (variant.labelPt || `Mapa ${(item?.variantIndex || 0) + 1}`) : (variant.labelEn || `Map ${(item?.variantIndex || 0) + 1}`);
      if (activeName) activeName.textContent = name;
      if (activeVariant) activeVariant.textContent = variantName;
      if (activeAlias) activeAlias.textContent = alias;
      if (activeIndex) activeIndex.textContent = `${String(state.activeItemIndex + 1).padStart(2, "0")} / ${String(rooms.length).padStart(2, "0")}`;
      if (status && announce) status.textContent = body.dataset.locale === "pt-br" ? `Mapa ${state.activeItemIndex + 1} de ${rooms.length}: ${name} — ${variantName}` : `Map ${state.activeItemIndex + 1} of ${rooms.length}: ${name} — ${variantName}`;
      dock.dataset.activeId = item?.slide.dataset.roomId || "";
      dock.dataset.activeItemId = item?.itemId || "";
      dock.dataset.activeVariantId = variant?.id || item?.itemId || "";
      dock.dataset.activeIndex = String(state.activeItemIndex);
    }

    function goTo(value, { source = "manual", announce = true } = {}) {
      if (!rooms.length) return;
      state.activeItemIndex = normalizeIndex(value);
      state.visualSlideIndex = null;
      updateVisualFocus();
      updateCaption(announce);
      setTrackPosition(true);
      dock.classList.remove("is-transitioning");
      void dock.offsetWidth;
      dock.classList.add("is-transitioning");
      if (state.transitionTimer) window.clearTimeout(state.transitionTimer);
      state.transitionTimer = window.setTimeout(() => {
        state.transitionTimer = null;
        dock.classList.remove("is-transitioning");
      }, state.reducedMotion ? 0 : 820);
      if (source !== "autoplay") {
        hold("manual");
        if (state.manualResumeTimer) window.clearTimeout(state.manualResumeTimer);
        state.manualResumeTimer = window.setTimeout(() => {
          state.manualResumeTimer = null;
          release("manual", 850);
        }, 850);
      }
    }

    function manualAdvance(value) { goTo(value, { source: "manual" }); }

    function updateHash(item, lightboxMode = false) {
      if (!item) return;
      const next = new URL(location.href);
      next.hash = item.itemId || item.slide.dataset.roomId;
      if (lightboxMode) next.searchParams.set("lightbox", "1");
      else next.searchParams.delete("lightbox");
      history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    }

    function renderLightboxVariants(variants, selectedIndex) {
      if (!lightboxVariants) return;
      lightboxVariants.replaceChildren();
      lightboxVariants.hidden = variants.length < 2;
      if (variants.length < 2) return;
      variants.forEach((variant, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lightbox-variant";
        button.dataset.variantIndex = String(index);
        button.classList.toggle("is-active", index === selectedIndex);
        button.setAttribute("aria-pressed", String(index === selectedIndex));
        const label = body.dataset.locale === "pt-br" ? (variant.labelPt || `Mapa ${index + 1}`) : (variant.labelEn || `Map ${index + 1}`);
        button.setAttribute("aria-label", label);
        const image = document.createElement("img");
        image.src = variant.src || "";
        image.alt = "";
        image.width = 120;
        image.height = 80;
        const text = document.createElement("span");
        text.textContent = label;
        button.append(image, text);
        button.addEventListener("click", () => {
          const active = itemAt(state.activeItemIndex);
          const target = rooms.findIndex((item) => item.slide === active?.slide && item.itemId === variant.id);
          if (target >= 0) goTo(target, { source: "manual" });
          state.lightboxVariantIndex = index;
          populateLightbox(state.activeItemIndex);
          updateHash(itemAt(state.activeItemIndex), true);
        });
        lightboxVariants.append(button);
      });
    }

    function populateLightbox(index) {
      const item = itemAt(index);
      if (!item || !lightboxImage) return;
      const variants = slideVariants(item.slide);
      const selectedIndex = Math.min(item.variantIndex, variants.length - 1);
      state.lightboxVariantIndex = selectedIndex;
      const variant = variants[selectedIndex] || {};
      const name = item.slide.dataset.roomName || "";
      const alias = item.slide.dataset.roomAlias || "";
      const variantName = body.dataset.locale === "pt-br" ? (variant.labelPt || `Mapa ${selectedIndex + 1}`) : (variant.labelEn || `Map ${selectedIndex + 1}`);
      lightboxImage.src = variant.src || item.button.querySelector("img")?.currentSrc || item.button.querySelector("img")?.src || "";
      lightboxImage.alt = `${name} — ${variantName}`;
      lightboxImage.width = Number(variant.width || item.button.querySelector("img")?.getAttribute("width") || 720);
      lightboxImage.height = Number(variant.height || item.button.querySelector("img")?.getAttribute("height") || 480);
      if (lightboxTitle) lightboxTitle.textContent = name;
      if (lightboxAlias) lightboxAlias.textContent = alias;
      if (lightboxIndex) lightboxIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(rooms.length).padStart(2, "0")}`;
      if (lightboxVariantLabel) lightboxVariantLabel.textContent = variantName;
      if (lightboxDetail) {
        const detail = new URL(item.slide.dataset.roomDetail || "", location.href);
        if (variant.detailId && variant.detailId !== item.slide.dataset.roomId) detail.pathname = detail.pathname.replace(/[^/]+\/$/, `${variant.detailId}/`);
        if (variant.id) detail.searchParams.set("variant", variant.id);
        lightboxDetail.href = `${detail.pathname}${detail.search}${detail.hash}`;
      }
      renderLightboxVariants(variants, selectedIndex);
    }

    function openLightbox(index, origin = null) {
      if (!lightbox) return;
      goTo(index, { source: "manual" });
      state.originFocus = origin || itemAt(state.activeItemIndex)?.button;
      state.lightboxOpen = true;
      hold("lightbox");
      populateLightbox(state.activeItemIndex);
      updateHash(itemAt(state.activeItemIndex), true);
      if (typeof lightbox.showModal === "function") lightbox.showModal();
      else lightbox.setAttribute("open", "");
      lightbox.querySelector("[data-lightbox-close]")?.focus();
    }

    function closeLightbox() {
      if (!state.lightboxOpen) return;
      state.lightboxOpen = false;
      if (typeof lightbox?.close === "function" && lightbox.open) lightbox.close();
      else lightbox?.removeAttribute("open");
      updateHash(itemAt(state.activeItemIndex), false);
      release("lightbox");
      const returnFocus = state.originFocus || itemAt(state.activeItemIndex)?.button;
      returnFocus?.focus();
      state.originFocus = null;
    }

    rooms.forEach((item, index) => {
      item.button.addEventListener("click", () => {
        if (Date.now() < state.suppressClickUntil) return;
        openLightbox(index, item.button);
      });
      item.button.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch" || event.pointerType === "pen") return;
        state.pointerX = event.clientX;
        state.visualSlideIndex = item.slideIndex;
        updateVisualFocus();
      });
      item.button.addEventListener("focus", () => {
        state.visualSlideIndex = item.slideIndex;
        updateVisualFocus();
        hold("focus");
      });
      item.button.addEventListener("blur", () => {
        if (!dock.contains(document.activeElement)) {
          state.visualSlideIndex = null;
          updateVisualFocus();
          release("focus", 700);
        }
      });
    });

    dock.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") return;
      state.pointerX = event.clientX;
      updateVisualFocus();
    });
    dock.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") return;
      state.pointerX = event.clientX;
      updateVisualFocus();
    });
    dock.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") return;
      state.pointerX = null;
      state.visualSlideIndex = null;
      updateVisualFocus();
    });

    viewport?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        manualAdvance(state.activeItemIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        manualAdvance(state.activeItemIndex + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        manualAdvance(0);
      } else if (event.key === "End") {
        event.preventDefault();
        manualAdvance(rooms.length - 1);
      } else if (event.key.toLowerCase() === "p" || event.key === " ") {
        event.preventDefault();
        playButton?.click();
      }
    });

    dock.querySelector("[data-dock-prev]")?.addEventListener("click", () => manualAdvance(state.activeItemIndex - 1));
    dock.querySelector("[data-dock-next]")?.addEventListener("click", () => manualAdvance(state.activeItemIndex + 1));
    playButton?.addEventListener("click", () => {
      state.manualPaused = !state.manualPaused;
      writeStored(sessionStorageSafe || localStorageSafe, dockPreferenceKey, state.manualPaused ? "paused" : "running");
      if (state.manualPaused) hold("manualPause");
      else release("manualPause");
      updatePlayControl();
    });

    viewport?.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaX) < 2 && Math.abs(event.deltaY) < 2) return;
      event.preventDefault();
      hold("wheel");
      if (state.wheelLocked) return;
      state.wheelLocked = true;
      manualAdvance(state.activeItemIndex + (event.deltaY + event.deltaX > 0 ? 1 : -1));
      state.wheelTimer = window.setTimeout(() => {
        state.wheelLocked = false;
        release("wheel", 500);
      }, 500);
    }, { passive: false });

    viewport?.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      state.drag = { pointerId: event.pointerId, startX: event.clientX, deltaX: 0, moved: false };
      hold("drag");
      track?.classList.add("is-dragging");
    });
    viewport?.addEventListener("pointermove", (event) => {
      if (!state.drag || state.drag.pointerId !== event.pointerId) return;
      state.drag.deltaX = event.clientX - state.drag.startX;
      if (Math.abs(state.drag.deltaX) > 5) {
        if (!state.drag.moved) viewport.setPointerCapture?.(event.pointerId);
        state.drag.moved = true;
        event.preventDefault();
      }
      track?.style.setProperty("--dock-drag-shift", `${state.drag.deltaX}px`);
    });
    const finishDrag = (event) => {
      if (!state.drag || (event.pointerId !== undefined && state.drag.pointerId !== event.pointerId)) return;
      const drag = state.drag;
      state.drag = null;
      track?.classList.remove("is-dragging");
      track?.style.setProperty("--dock-drag-shift", "0px");
      if (drag.moved) {
        state.suppressClickUntil = Date.now() + 350;
        if (Math.abs(drag.deltaX) > 42) manualAdvance(state.activeItemIndex + (drag.deltaX < 0 ? 1 : -1));
        else setTrackPosition(false);
      }
      release("drag", 550);
    };
    viewport?.addEventListener("pointerup", finishDrag);
    viewport?.addEventListener("pointercancel", finishDrag);

    lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
    lightbox?.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => {
      manualAdvance(state.activeItemIndex - 1);
      populateLightbox(state.activeItemIndex);
      updateHash(itemAt(state.activeItemIndex), true);
    });
    lightbox?.querySelector("[data-lightbox-next]")?.addEventListener("click", () => {
      manualAdvance(state.activeItemIndex + 1);
      populateLightbox(state.activeItemIndex);
      updateHash(itemAt(state.activeItemIndex), true);
    });
    lightbox?.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeLightbox();
    });
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target === lightboxShell) closeLightbox();
    });

    let lightboxPointer = null;
    lightbox?.addEventListener("pointerdown", (event) => {
      if (event.target === lightboxImage) lightboxPointer = event.clientX;
    });
    lightbox?.addEventListener("pointerup", (event) => {
      if (lightboxPointer === null) return;
      const delta = event.clientX - lightboxPointer;
      lightboxPointer = null;
      if (Math.abs(delta) < 45) return;
      manualAdvance(state.activeItemIndex + (delta < 0 ? 1 : -1));
      populateLightbox(state.activeItemIndex);
      updateHash(itemAt(state.activeItemIndex), true);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.lightboxOpen) closeLightbox();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hold("visibility");
      else release("visibility", 400);
    });
    const reducedMotionChange = () => {
      state.reducedMotion = prefersReducedMotion.matches;
      dock.dataset.reducedMotion = String(state.reducedMotion);
      updatePlayControl();
      if (state.reducedMotion) hold("reducedMotion");
      else release("reducedMotion");
      setTrackPosition(false);
    };
    prefersReducedMotion.addEventListener?.("change", reducedMotionChange);
    window.addEventListener("resize", () => setTrackPosition(false));
    all("img", dock).forEach((image) => image.addEventListener("load", () => setTrackPosition(false), { once: true }));

    updateVisualFocus();
    updateCaption(false);
    updatePlayControl();
    setTrackPosition(false);
    dock.classList.add("is-ready");
    if (state.reducedMotion) hold("reducedMotion");
    if (state.manualPaused) hold("manualPause");
    else scheduleAutoplay(autoplayMs);
    if (pageUrl.searchParams.get("lightbox") === "1" && initialMatch >= 0) window.setTimeout(() => openLightbox(state.activeItemIndex), 0);
  }

  const placeMainImage = document.querySelector("[data-place-main-image]");
  const placeVariantButtons = all("[data-place-variant-button]");
  if (placeMainImage && placeVariantButtons.length) {
    const selectPlaceVariant = (id, updateUrl = true) => {
      const button = placeVariantButtons.find((item) => item.dataset.variantId === id) || placeVariantButtons[0];
      if (!button) return;
      placeMainImage.src = button.dataset.variantImage || placeMainImage.src;
      placeMainImage.width = Number(button.dataset.variantWidth || placeMainImage.width || 720);
      placeMainImage.height = Number(button.dataset.variantHeight || placeMainImage.height || 480);
      placeMainImage.dataset.activeVariantId = button.dataset.variantId || "";
      placeVariantButtons.forEach((item) => item.classList.toggle("is-current", item === button));
      all("[data-back-presentation]").forEach((link) => {
        const target = new URL(link.href, location.href);
        target.hash = button.dataset.variantId || "";
        link.href = `${target.pathname}${target.search}${target.hash}`;
      });
      if (updateUrl) {
        const next = new URL(location.href);
        next.searchParams.set("variant", button.dataset.variantId || "");
        history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
      }
    };
    placeVariantButtons.forEach((button) => button.addEventListener("click", (event) => {
      event.preventDefault();
      selectPlaceVariant(button.dataset.variantId || "");
    }));
    selectPlaceVariant(new URLSearchParams(location.search).get("variant") || placeVariantButtons[0].dataset.variantId, false);
  }

  all("[data-topology-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.topologyFilter;
      all("[data-topology-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      all("[data-edge-status]").forEach((edge) => edge.classList.toggle("is-hidden", filter !== "all" && edge.dataset.edgeStatus !== filter));
    });
  });

  const drawer = document.querySelector("[data-archive-drawer]");
  if (drawer && new URLSearchParams(location.search).get("drawer") === "1") drawer.open = true;
})();
