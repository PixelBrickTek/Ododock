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
    if (!video || document.hidden || !heroVisible) return;
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
    let activeWork = 0;
    let opener;
    const showWork = (index) => {
      activeWork = (index + works.length) % works.length;
      const work = works[activeWork];
      viewerImage.src = "assets/" + work.key + ".webp";
      viewerImage.alt = work.alt;
      viewerCount.textContent =
        String(activeWork + 1).padStart(2, "0") + " / 08";
    };
    document
      .querySelectorAll(
        ".art-print img, .hero-art img, .detail-photo img, .weather-panel img",
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
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        showWork(activeWork + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    let touchStartX;
    let touchStartY;
    viewerImage.addEventListener(
      "touchstart",
      (event) => {
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
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy))
          showWork(activeWork + (dx < 0 ? 1 : -1));
        touchStartX = undefined;
      },
      { passive: true },
    );
    viewer.addEventListener("close", () => {
      document.body.classList.remove("viewer-open");
      opener?.focus({ preventScroll: true });
      if (!manuallyPaused) playFilm();
    });
  }
})();
