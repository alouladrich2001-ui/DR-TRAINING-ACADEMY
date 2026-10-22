require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "../frontend"))); // sert aussi le site en local

const DATA = path.join(__dirname, "data");
fs.mkdirSync(DATA, { recursive: true });

const mailer = process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  : null;

const clean = v => String(v ?? "").trim().slice(0, 1000);
const hits = new Map(); // limite simple : 10 envois / heure / IP
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  arr.push(now); hits.set(ip, arr); return arr.length > 10;
}

function handler(type, required, label) {
  return async (req, res) => {
    if (limited(req.ip)) return res.status(429).json({ error: "Trop de demandes, réessayez plus tard." });
    const b = req.body || {};
    if (b.website) return res.json({ ok: true }); // anti-spam (champ piège)
    const data = {};
    for (const [k, v] of Object.entries(b)) if (k !== "website") data[k] = clean(v);
    const missing = required.filter(k => !data[k]);
    if (missing.length) return res.status(400).json({ error: "Champs manquants : " + missing.join(", ") });

    const entry = { type, date: new Date().toISOString(), ...data };
    fs.appendFileSync(path.join(DATA, type + ".jsonl"), JSON.stringify(entry) + "\n");

    if (mailer) {
      try {
        await mailer.sendMail({
          from: process.env.SMTP_USER, to: process.env.MAIL_TO || process.env.SMTP_USER,
          subject: `[Site] ${label} : ${data.nom || ""}`,
          text: Object.entries(data).map(([k, v]) => `${k} : ${v}`).join("\n") });
      } catch (e) { console.error("Mail:", e.message); }
    }
    res.json({ ok: true });
  };
}

app.post("/api/candidature", handler("candidature", ["nom", "naissance", "nationalite", "telephone", "email", "procedure", "consentement"], "Nouvelle candidature"));
app.post("/api/contact", handler("contact", ["nom", "telephone", "message"], "Contact / rendez-vous"));
app.post("/api/voiture", handler("voiture", ["nom", "telephone", "type", "marque"], "Demande voiture"));
// Nouveaux formulaires (projet DR_Project)
app.post("/api/tourisme", handler("tourisme", ["nom", "telephone", "destination", "consentement"], "Demande tourisme"));
app.post("/api/reservation", handler("reservation", ["nom", "telephone", "zone", "type"], "Réservation hôtel / appartement"));
app.post("/api/formation", handler("formation", ["nom", "telephone", "domaine"], "Inscription formation"));
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3000, () => console.log("API prête sur le port", process.env.PORT || 3000));
