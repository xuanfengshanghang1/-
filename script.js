const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const bookingForm = document.querySelector("[data-booking-form]");
const formStatus = document.querySelector("[data-form-status]");

function setHeaderState() {
  header.classList.toggle("scrolled", window.scrollY > 16);
}

function closeNav() {
  header.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeNav();
  }
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const name = String(formData.get("name") || "").trim();
  const service = String(formData.get("service") || "婚礼服务").trim();

  formStatus.textContent = `${name || "您好"}，咨询信息已记录。禧见文化顾问会围绕${service}尽快与你确认沟通时间。`;
  bookingForm.reset();
});
