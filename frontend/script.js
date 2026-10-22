// Adresse du backend (laisser vide si le site est servi par le backend lui-même)
const API_URL = "";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Menu mobile
const burger = $("#burger"), menu = $("#menu");
burger.setAttribute("aria-expanded", "false");
burger.addEventListener("click", () => burger.setAttribute("aria-expanded", menu.classList.toggle("open")));
$$("#menu a").forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));

// Année du pied de page
$("#y").textContent = new Date().getFullYear();

// Images manquantes : masquer le logo, repli sur le visuel de remplacement pour les voitures
$$("img").forEach(img => {
  const fix = () => {
    if (img.closest(".car-img")) { if (!img.src.endsWith("placeholder.svg")) img.src = "images/cars/placeholder.svg"; }
    else img.style.display = "none";
  };
  if (img.complete && img.naturalWidth === 0) fix(); else img.addEventListener("error", fix, { once: true });
});

// Boutons Louer / Acheter : pré-remplir le formulaire voiture
$$("[data-car]").forEach(b => b.addEventListener("click", () => {
  const f = $("#car-form");
  f.marque.value = b.dataset.car; f.type.value = b.dataset.type;
  $("#demande").scrollIntoView({ behavior: "smooth" });
  (b.dataset.car ? f.nom : f.marque).focus({ preventScroll: true });
}));

// Envoi des formulaires vers l'API
$$("form[data-endpoint]").forEach(form => form.addEventListener("submit", async e => {
  e.preventDefault();
  const status = $(".status", form), btn = $("button", form);
  const data = {};
  new FormData(form).forEach((v, k) => data[k] = v);
  status.className = "status"; status.textContent = "Envoi en cours…"; btn.disabled = true;
  try {
    const res = await fetch(API_URL + form.dataset.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || "Erreur d'envoi.");
    status.className = "status ok"; status.textContent = "Merci, votre demande est bien envoyée. Nous vous répondons rapidement.";
    form.reset();
  } catch (err) {
    status.className = "status err"; status.textContent = err.message + " Vous pouvez aussi nous écrire sur WhatsApp.";
  } finally { btn.disabled = false; }
}));
