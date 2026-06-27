const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const bookingForm = document.querySelector("[data-booking-form]");
const formStatus = document.querySelector("[data-form-status]");
const revealItems = document.querySelectorAll("[data-reveal]");
const serviceChoices = document.querySelectorAll("[data-service-choice]");

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 16);
}

function closeNav() {
  if (!header || !navToggle) return;
  header.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}


function correctHashScroll() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  target.scrollIntoView({ block: "start" });
}

function setServiceChoice(service) {
  const serviceSelect = bookingForm?.querySelector('[name="service"]');
  if (!serviceSelect || !service) return;
  const option = Array.from(serviceSelect.options).find((item) => item.textContent.trim() === service);
  if (option) {
    serviceSelect.value = option.value || option.textContent;
  }
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("load", () => {
  window.requestAnimationFrame(correctHashScroll);
  [350, 900, 1600].forEach((delay) => window.setTimeout(correctHashScroll, delay));
});

if (header && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (nav) {
  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeNav();
    }
  });
}

if (revealItems.length) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

serviceChoices.forEach((link) => {
  link.addEventListener("click", () => {
    setServiceChoice(link.dataset.serviceChoice);
  });
});

if (bookingForm && formStatus) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const name = String(formData.get("name") || "").trim();
    const service = String(formData.get("service") || "婚礼服务").trim();

    formStatus.textContent = `${name || "您好"}，咨询信息已记录。禧见文化顾问会围绕${service}尽快与你确认沟通时间。`;
    bookingForm.reset();
  });
}
