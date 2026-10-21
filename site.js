"use strict";
(() => {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("#mobile-nav");
  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
    if (mobileNav) mobileNav.hidden = true;
  };
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
  });
  mobileNav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuToggle?.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (
      !mobileNav?.contains(event.target) &&
      !menuToggle?.contains(event.target)
    )
      closeMenu();
  });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const video = document.querySelector("[data-hero-video]");
  const filmToggle = document.querySelector("[data-film-toggle]");
  let manuallyPaused =
    reducedMotion.matches || Boolean(navigator.connection?.saveData);
  let heroVisible = true;
  const updateFilmControl = () => {
    if (!filmToggle) return;
    const paused = video.paused;
    filmToggle.setAttribute(
      "aria-label",
      paused ? "Play background video" : "Pause background video",
    );
    filmToggle.querySelector("[data-film-label]").textContent = paused
      ? "Play motion"
      : "Pause motion";
    filmToggle.querySelector("[data-film-symbol]").textContent = paused
      ? "▷"
      : "Ⅱ";
  };
  const playFilm = async () => {
    if (!video || document.hidden || !heroVisible || document.querySelector(".art-viewer[open]")) return;
    const source = video.querySelector("source");
    if (!source.hasAttribute("src")) {
      source.src = source.dataset.src;
      video.load();
    }
    try {
      await video.play();
    } catch {
      updateFilmControl();
    }
  };
  if (video && filmToggle) {
    filmToggle.hidden = false;
    video.addEventListener("play", updateFilmControl);
    video.addEventListener("pause", updateFilmControl);
    filmToggle.addEventListener("click", () => {
      manuallyPaused = !video.paused;
      if (manuallyPaused) video.pause();
      else playFilm();
    });
    if (!manuallyPaused) playFilm();
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        if (!heroVisible) video.pause();
        else if (!manuallyPaused) playFilm();
      },
      { threshold: 0 },
    ).observe(video.closest(".hero"));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else if (!manuallyPaused) playFilm();
    });
    reducedMotion.addEventListener("change", (event) => {
      manuallyPaused = event.matches;
      if (manuallyPaused) video.pause();
      else playFilm();
    });
  }

  // Native tabs: all sky effects can be reached with a keyboard.
  const weatherTabs = [...document.querySelectorAll("[data-weather]")];
  const selectWeather = (tab) => {
    weatherTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !selected;
    });
    document.querySelector(".weather-study").dataset.sky = tab.dataset.weather;
  };
  weatherTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectWeather(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % weatherTabs.length;
      if (event.key === "ArrowLeft")
        next = (index + weatherTabs.length - 1) % weatherTabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = weatherTabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      weatherTabs[next].focus();
      selectWeather(weatherTabs[next]);
    });
  });

  const works = [
{"key": "cloud", "title": "Clouds and blue sky", "alt": "Clouds and blue sky with weather and a calendar on an iPhone lock screen"},
{"key": "forest", "title": "Forest and water", "alt": "A forest and lake with weather and a calendar on an iPhone lock screen"},
{"key": "tide", "title": "Sunlight on the sea", "alt": "Sunlight on ocean waves with weather and a calendar on an iPhone lock screen"},
{"key": "branch", "title": "Branches in the sky", "alt": "Delicate branches against a blue sky on an iPhone lock screen"},
{"key": "starlight", "title": "Under the stars", "alt": "A starry mountain landscape with moon and weather on an iPhone lock screen"},
    {
      key: "clear",
      title: "A clear beginning",
      alt: "Clear sky, weather and calendar",
    },
    {
      key: "fog",
      title: "A softer kind of day",
      alt: "Fog over a blue sky, with weather and calendar",
    },
    {
      key: "rain",
      title: "A change in the air",
      alt: "Rain over a blue sky, with an hourly precipitation graph",
    },
    {
      key: "snow",
      title: "A quieter world",
      alt: "Snow over a blue sky, with weather and a precipitation graph",
    },
    {
      key: "moon",
      title: "After the light fades",
      alt: "Moonlight, current weather and trending topics",
    },
    {
      key: "storm",
      title: "An evening downpour",
      alt: "Heavy rain, moonlight and detailed precipitation information",
    },
    {
      key: "alpine-rain",
      title: "A different perspective",
      alt: "An alpine lake in the rain, with weather and calendar",
    },
    {
      key: "alpine",
      title: "Outside, brought closer",
      alt: "An alpine lake, current weather, calendar and wind information",
    },
  ];
  const viewer = document.querySelector(".art-viewer");
  if (viewer && typeof viewer.showModal === "function") {
    const viewerImage = viewer.querySelector("[data-viewer-image]");
    const viewerCount = viewer.querySelector("[data-viewer-count]");
    const viewerFigure = viewerImage.closest("figure");
    const thumbnails = document.createElement("div");
    thumbnails.className = "viewer-thumbs";
    thumbnails.setAttribute("role", "group");
    thumbnails.setAttribute("aria-label", "Choose a wallpaper");
    viewer.append(thumbnails);
    let activeWork = 0;
    let opener;
    let suppressZoom = false;
    const setZoom = (zoomed) => {
      viewer.classList.toggle("is-zoomed", zoomed);
      viewerImage.setAttribute("aria-pressed", String(zoomed));
      viewerImage.setAttribute("aria-label", works[activeWork].alt + (zoomed ? ". Zoom out" : ". Zoom in"));
      viewerFigure.scrollTop = 0;
      viewerFigure.scrollLeft = 0;
    };
    viewerImage.tabIndex = 0;
    viewerImage.setAttribute("role", "button");
    const toggleZoom = () => {
      if (suppressZoom) return;
      setZoom(!viewer.classList.contains("is-zoomed"));
    };
    viewerImage.addEventListener("click", toggleZoom);
    viewerImage.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleZoom();
      }
    });
    const showWork = (index) => {
      activeWork = (index + works.length) % works.length;
      const work = works[activeWork];
      viewerImage.src = "assets/" + work.key + ".webp";
      viewerImage.alt = work.alt;
      viewerImage.width = activeWork < 5 ? 1179 : 1080;
      viewerImage.height = activeWork < 5 ? 2556 : 2341;
      viewerCount.textContent =
        String(activeWork + 1).padStart(2, "0") + " / " + String(works.length).padStart(2, "0");
      setZoom(false);
      [...thumbnails.children].forEach((button, thumbnailIndex) => {
        button.setAttribute("aria-current", String(thumbnailIndex === activeWork));
      });
    };
    works.forEach((work, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "View wallpaper: " + work.title);
      const img = document.createElement("img");
      img.src = "assets/" + work.key + "-small.webp";
      img.alt = "";
      img.width = 540;
      img.height = 1171;
      img.loading = "lazy";
      button.append(img);
      button.addEventListener("click", () => showWork(index));
      thumbnails.append(button);
    });
    document
      .querySelectorAll(
        ".art-print img, .hero-art img, .hero-companion img, .detail-photo img, .weather-panel img",
      )
      .forEach((img) => {
        const key = img
          .getAttribute("src")
          .split("/")
          .pop()
          .replace("-small", "")
          .replace(".webp", "");
        const index = works.findIndex((work) => work.key === key);
        if (index === -1) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "art-open";
        button.setAttribute(
          "aria-label",
          "View wallpaper: " + works[index].title,
        );
        img.replaceWith(button);
        button.append(img);
        button.addEventListener("click", () => {
          opener = button;
          showWork(index);
          viewer.showModal();
          document.body.classList.add("viewer-open");
          if (video) video.pause();
          viewer.querySelector("[data-viewer-close]").focus();
        });
      });
    viewer
      .querySelector("[data-viewer-close]")
      .addEventListener("click", () => viewer.close());
    viewer
      .querySelector("[data-viewer-prev]")
      .addEventListener("click", () => showWork(activeWork - 1));
    viewer
      .querySelector("[data-viewer-next]")
      .addEventListener("click", () => showWork(activeWork + 1));
    viewer.addEventListener("keydown", (event) => {
      if (!viewer.classList.contains("is-zoomed") && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        showWork(activeWork + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    let touchStartX;
    let touchStartY;
    viewerImage.addEventListener(
      "touchstart",
      (event) => {
        suppressZoom = false;
        touchStartX = undefined;
        if (event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true },
    );
    viewerImage.addEventListener(
      "touchend",
      (event) => {
        if (touchStartX === undefined || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        const dy = event.changedTouches[0].clientY - touchStartY;
        suppressZoom = Math.abs(dx) > 10 || Math.abs(dy) > 10;
        if (!viewer.classList.contains("is-zoomed") && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy))
          showWork(activeWork + (dx < 0 ? 1 : -1));
        touchStartX = undefined;
      },
      { passive: true },
    );
    viewer.addEventListener("close", () => {
      setZoom(false);
      document.body.classList.remove("viewer-open");
      opener?.focus({ preventScroll: true });
      if (!manuallyPaused) playFilm();
    });
  }
})();

// Scroll-linked depth follows native scrolling and sleeps between scroll events.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.reading-progress');
  const main = document.querySelector('main');
  const targets = [
    ...document.querySelectorAll('.collection h2, .collection-note, .art-print, .study-copy, .study-stage, .detail-visual, .details-copy, .how-heading, .section-top, .steps article, .privacy-note, .policy-hero, .policy-card section'),
  ];
  let revealObserver;
  if ('IntersectionObserver' in window && !preference.matches) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        entry.target.classList.remove('reveal-pending');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: .07, rootMargin: '0px 0px -22px 0px' });
    for (const element of targets) {
      element.classList.add('reveal-pending', 'reveal-ready');
      if (element.matches('.steps article')) {
        element.style.setProperty('--reveal-delay', `${[...element.parentElement.children].indexOf(element) * 90}ms`);
      }
      revealObserver.observe(element);
    }
  }

  const drifts = [
    ['.hero-art', -65], ['.hero-companion', 42],
    ['.print-cloud', 40], ['.print-forest', 8], ['.print-tide', -36],
    ['.print-branch', 8], ['.print-starlight', 40],
    ['.study-stage', -28], ['.detail-photo', -35],
  ].flatMap(([selector, amount]) => {
    const element = document.querySelector(selector);
    return element ? [{ element, section: element.closest('section'), amount, value: 0, top: 0, height: 1 }] : [];
  });
  const links = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const sections = links.map(link => ({ link, element: document.querySelector(link.getAttribute('href')), top: 0 }));
  let viewportHeight = innerHeight;
  let maxScroll = 1;
  let frame = 0;
  let needsMeasure = true;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  function measure() {
    viewportHeight = innerHeight;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    const positions = new Map();
    for (const item of drifts) {
      if (!positions.has(item.section)) {
        const rect = item.section.getBoundingClientRect();
        positions.set(item.section, { top: rect.top + scrollY, height: rect.height });
      }
      Object.assign(item, positions.get(item.section));
    }
    for (const item of sections) item.top = item.element.getBoundingClientRect().top + scrollY;
    needsMeasure = false;
  }
  function update() {
    frame = 0;
    if (needsMeasure) measure();
    const y = scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    progress?.style.setProperty('--progress', clamp(y / maxScroll, 0, 1).toFixed(4));
    let active;
    for (const item of sections) if (y + viewportHeight * .36 >= item.top) active = item;
    for (const item of sections) item.link.classList.toggle('is-active', active === item);
    let settling = false;
    const smallScreen = innerWidth <= 760;
    for (const item of drifts) {
      if (y + viewportHeight < item.top - 100 || y > item.top + item.height + 100) continue;
      const phase = clamp((y + viewportHeight * .5 - item.top - item.height * .5) / ((viewportHeight + item.height) * .5), -1, 1);
      const target = preference.matches ? 0 : phase * item.amount * (smallScreen ? .35 : 1);
      const difference = target - item.value;
      item.value = Math.abs(difference) < .08 ? target : item.value + difference * .14;
      item.element.style.setProperty('--drift', `${item.value.toFixed(2)}px`);
      if (Math.abs(difference) > .08) settling = true;
    }
    if (settling && !document.hidden) frame = requestAnimationFrame(update);
  }
  function requestUpdate() { if (!frame && !document.hidden) frame = requestAnimationFrame(update); }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', () => {
    needsMeasure = true;
    if (innerWidth > 760) {
      document.querySelector('#mobile-nav')?.setAttribute('hidden', '');
      document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
      document.querySelector('[data-menu-toggle]')?.setAttribute('aria-label', 'Open menu');
    }
    requestUpdate();
  }, { passive: true });
  document.addEventListener('visibilitychange', requestUpdate);
  if ('ResizeObserver' in window && main) new ResizeObserver(() => { needsMeasure = true; requestUpdate(); }).observe(main);
  preference.addEventListener('change', () => {
    if (preference.matches) {
      revealObserver?.disconnect();
      targets.forEach(element => {
        element.classList.remove('reveal-pending');
        element.classList.add('is-revealed');
      });
      drifts.forEach(item => { item.value = 0; item.element.style.setProperty('--drift','0px'); });
    }
    requestUpdate();
  });
  requestUpdate();
})();
