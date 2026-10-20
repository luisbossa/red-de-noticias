import { LOCALE } from "../config/settings.js";
import { formatPublished } from "../lib/format.js";

/*----------------- APARICIÓN AL HACER SCROLL ----------------*/

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px" }
      )
    : null;

export function observeReveal(root) {
  root.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("is-visible");
  });
}

/*----------------- BARRA FIJA Y VOLVER ARRIBA ----------------*/

export function initScrollEffects({ masthead, backToTop }) {
  const observer = new IntersectionObserver(([entry]) => {
    const scrolled = !entry.isIntersecting;
    document.body.classList.toggle("is-scrolled", scrolled);
    backToTop.classList.toggle("is-visible", scrolled);
  });
  observer.observe(masthead);

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/*----------------- HORAS RELATIVAS ----------------*/

export function startRelativeTimes() {
  setInterval(() => {
    document.querySelectorAll("time[data-relative]").forEach((el) => {
      el.querySelector("span").textContent = formatPublished(new Date(el.dateTime), LOCALE);
    });
  }, 60 * 1000);
}
