/**
 * RSVP confirmation email — Google Apps Script for the RSVP Google Form.
 *
 * Setup (full steps in README → "RSVP confirmation email"):
 *   1. Open the Google Form → ⋮ → Apps Script, paste this whole file, save.
 *   2. Edit CONFIG below (question titles must match the form exactly).
 *   3. Run `testSend` once and allow the permissions → a sample email arrives in your inbox.
 *   4. Triggers (clock icon) → Add trigger → function `onRsvpSubmit`, source "From form",
 *      event "On form submit" → Save.
 *
 * Every RSVP with an email address then gets a confirmation in the guest's language (en / id).
 * Gmail accounts can send to about 100 recipients a day; the RSVP is still saved if that runs out.
 * This file holds no secrets, so it is fine for it to be public.
 */

const CONFIG = {
  // Question titles in the Google Form (must match exactly, including capital letters)
  questions: {
    name: "Nama",
    attendance: "Kehadiran",
    guests: "Jumlah Tamu",
    message: "Ucapan",
    email: "Email",
    lang: "Language",
  },
  attendingValue: "Hadir", // the "yes" option of the attendance question (same as rsvp.attendanceValues.yes)

  senderName: "Assela & Rama", // shown as the sender in the guest's inbox
  replyTo: "", // optional: where replies go, e.g. 'rama@email.com' ('' = your Gmail)
  couple: "Assela & Rama",
  siteUrl: "", // TODO: the website link, e.g. 'https://yourdomain.com'
  zoomUrl: "", // TODO: Zoom link, e.g. 'https://zoom.us/j/123...' — '' hides the Zoom button/line for everyone

  event: {
    name: { en: "Holy Ceremony", id: "Upacara Pernikahan" },
    start: "2026-12-19T11:00:00-10:00",
    end: "2026-12-19T13:00:00-10:00", // used for the calendar entry
    timeZone: "Pacific/Honolulu",
    timeZoneLabel: "HST",
    venue: "BYU–Hawaii · STC 179 - North Chapel",
    address: "Laie, Hawaii",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=BYU-Hawaii%2C%20Laie%2C%20HI",
  },
};

const TEXT = {
  en: {
    subject: "RSVP received — ",
    hello: "Dear",
    intro: "Thank you for your RSVP. Here is a copy of your reply.",
    attending: "Attending",
    yes: "Joyfully accepts",
    no: "Regretfully declines",
    guests: "Number of guests",
    message: "Your message",
    details: "The celebration",
    map: "Open Map",
    calendar: "Add to Google Calendar",
    ics: "A calendar file is attached — open it to add the day to your calendar.",
    yesClose: "We can’t wait to celebrate with you.",
    noClose: "You will be missed. Thank you for your kind wishes.",
    change:
      "Need to change your reply? Simply send the RSVP again on our website.",
    site: "Visit the website",
    zoom: "Join via Zoom",
    zoomNote: "Can't make it in person? Join the live stream using the button above.",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  id: {
    subject: "Konfirmasi RSVP diterima — ",
    hello: "Halo",
    intro: "Terima kasih sudah mengisi RSVP. Berikut salinan jawaban Anda.",
    attending: "Kehadiran",
    yes: "Akan hadir",
    no: "Berhalangan hadir",
    guests: "Jumlah tamu",
    message: "Ucapan Anda",
    details: "Detail acara",
    map: "Buka Peta",
    calendar: "Simpan ke Google Calendar",
    ics: "File kalender terlampir — buka untuk menyimpan acara ke kalender Anda.",
    yesClose: "Kami menantikan kehadiran Anda.",
    noClose: "Terima kasih atas doa dan restunya.",
    change: "Ingin mengubah jawaban? Cukup isi RSVP lagi di website kami.",
    site: "Kunjungi website",
    zoom: "Gabung via Zoom",
    zoomNote: "Tidak bisa hadir langsung? Gabung live streaming lewat tombol di atas.",
    days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    months: [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ],
  },
};

/** Trigger: Form → On form submit. */
function onRsvpSubmit(e) {
  const answers = {};
  e.response.getItemResponses().forEach((r) => {
    answers[r.getItem().getTitle().trim()] = String(
      r.getResponse() || "",
    ).trim();
  });
  const q = CONFIG.questions;
  sendConfirmation({
    name: answers[q.name] || "",
    email: answers[q.email] || "",
    attending: answers[q.attendance] === CONFIG.attendingValue,
    guests: answers[q.guests] || "",
    message: answers[q.message] || "",
    lang: (answers[q.lang] || "").toLowerCase() === "id" ? "id" : "en",
  });
}

/** Run once by hand: sends a sample (English + Indonesian) to your own Gmail. */
function testSend() {
  const me = Session.getActiveUser().getEmail();
  sendConfirmation({
    name: "Test Guest",
    email: me,
    attending: true,
    guests: "2",
    message: "Congratulations!",
    lang: "en",
  });
  sendConfirmation({
    name: "Tamu Uji",
    email: me,
    attending: true,
    guests: "2",
    message: "Selamat!",
    lang: "id",
  });
  console.log("Sent 2 sample emails to " + me);
}

function sendConfirmation(d) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return; // no / invalid email → nothing to send
  if (MailApp.getRemainingDailyQuota() < 1) {
    console.warn("Daily email quota used up; skipped " + d.email);
    return;
  }

  const t = TEXT[d.lang];
  const ev = CONFIG.event;
  const when = formatWhen(ev, d.lang);
  const evName = ev.name[d.lang];
  const calUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent(evName + " — " + CONFIG.couple) +
    "&dates=" +
    utc(ev.start) +
    "/" +
    utc(ev.end) +
    "&location=" +
    encodeURIComponent(ev.venue + ", " + ev.address) +
    (CONFIG.siteUrl ? "&details=" + encodeURIComponent(CONFIG.siteUrl) : "");

  // ---- plain-text version ----
  const lines = [
    t.hello + " " + d.name + ",",
    "",
    t.intro,
    "",
    t.attending + ": " + (d.attending ? t.yes : t.no),
  ];
  if (d.attending && d.guests) lines.push(t.guests + ": " + d.guests);
  if (d.message) lines.push(t.message + ": " + d.message);
  if (d.attending) {
    lines.push(
      "",
      t.details + ": " + evName,
      when,
      ev.venue,
      ev.address,
      t.map + ": " + ev.mapsUrl,
      t.calendar + ": " + calUrl,
    );
  }
  lines.push("", d.attending ? t.yesClose : t.noClose, t.change);
  if (CONFIG.siteUrl) lines.push(CONFIG.siteUrl);
  if (CONFIG.zoomUrl) lines.push("", t.zoomNote, t.zoom + ": " + CONFIG.zoomUrl);
  lines.push("", "— " + CONFIG.couple);

  // ---- HTML version (inline styles: email apps ignore <style>) ----
  const row = (k, v) =>
    '<tr><td style="padding:6px 0;color:#5a6872;font-size:14px;letter-spacing:.08em;text-transform:uppercase;width:42%;vertical-align:top">' +
    esc(k) +
    '</td><td style="padding:6px 0;color:#1f2a31;font-size:17px">' +
    esc(v) +
    "</td></tr>";
  const btn = (href, label, solid) =>
    '<a href="' +
    esc(href) +
    '" style="display:inline-block;margin:6px 4px;padding:12px 22px;border-radius:4px;' +
    "font-size:13px;letter-spacing:.16em;text-transform:uppercase;text-decoration:none;" +
    (solid
      ? "background:#2f4450;color:#f4f2ec;border:1px solid #2f4450"
      : "background:#ffffff;color:#22333d;border:1px solid #2f4450") +
    '">' +
    esc(label) +
    "</a>";

  let html =
    "<div style=\"margin:0;padding:24px 12px;background:#e8edef;font-family:Georgia,'Times New Roman',serif\">" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#f5f6f3;border-radius:10px;overflow:hidden">' +
    '<tr><td style="background:#90a4af;padding:32px 24px;text-align:center;color:#22333d">' +
    '<div style="font-size:12px;letter-spacing:.3em;text-transform:uppercase">RSVP</div>' +
    '<div style="font-size:34px;font-style:italic;margin-top:8px">' +
    esc(CONFIG.couple) +
    "</div></td></tr>" +
    '<tr><td style="padding:28px 28px 8px;color:#1f2a31;font-size:17px;line-height:1.6">' +
    '<p style="margin:0 0 12px">' +
    esc(t.hello) +
    " " +
    esc(d.name) +
    ",</p>" +
    '<p style="margin:0 0 16px">' +
    esc(t.intro) +
    "</p>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d3dade;border-bottom:1px solid #d3dade;margin:8px 0 20px">' +
    row(t.attending, d.attending ? t.yes : t.no) +
    (d.attending && d.guests ? row(t.guests, d.guests) : "") +
    (d.message ? row(t.message, d.message) : "") +
    "</table>";
  if (d.attending) {
    html +=
      '<div style="text-align:center;background:#ffffff;border:1px solid #d3dade;border-radius:8px;padding:20px 16px;margin-bottom:20px">' +
      '<div style="font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#2f4450">' +
      esc(t.details) +
      "</div>" +
      '<div style="font-size:24px;font-style:italic;margin:8px 0 6px;color:#22333d">' +
      esc(evName) +
      "</div>" +
      '<div style="font-size:16px">' +
      esc(when) +
      "</div>" +
      '<div style="font-size:18px;margin-top:8px">' +
      esc(ev.venue) +
      "</div>" +
      '<div style="font-size:15px;color:#5a6872">' +
      esc(ev.address) +
      "</div>" +
      '<div style="margin-top:14px">' +
      btn(ev.mapsUrl, t.map, true) +
      btn(calUrl, t.calendar, false) +
      "</div>" +
      '<div style="font-size:13px;color:#5a6872;margin-top:10px">' +
      esc(t.ics) +
      "</div></div>";
  }
  html +=
    '<p style="margin:0 0 8px">' +
    esc(d.attending ? t.yesClose : t.noClose) +
    "</p>" +
    '<p style="margin:0 0 20px;font-size:15px;color:#5a6872">' +
    esc(t.change) +
    "</p>" +
    (CONFIG.zoomUrl
      ? '<div style="text-align:center;background:#ffffff;border:1px solid #d3dade;border-radius:8px;padding:16px;margin-bottom:20px">' +
        '<div style="font-size:14px;color:#5a6872;margin-bottom:10px">' +
        esc(t.zoomNote) +
        "</div>" +
        btn(CONFIG.zoomUrl, t.zoom, true) +
        "</div>"
      : "") +
    (CONFIG.siteUrl
      ? '<p style="margin:0 0 20px;text-align:center">' +
        btn(CONFIG.siteUrl, t.site, false) +
        "</p>"
      : "") +
    "</td></tr>" +
    '<tr><td style="padding:16px 24px 28px;text-align:center;color:#5a6872;font-size:14px;letter-spacing:.12em">— ' +
    esc(CONFIG.couple) +
    " —</td></tr></table></div>";

  const mail = {
    to: d.email,
    subject: t.subject + CONFIG.couple,
    body: lines.join("\n"),
    htmlBody: html,
    name: CONFIG.senderName,
  };
  if (CONFIG.replyTo) mail.replyTo = CONFIG.replyTo;
  if (d.attending) mail.attachments = [icsFile(evName)];
  MailApp.sendEmail(mail);
}

/* ---------- helpers ---------- */
function formatWhen(ev, lang) {
  const t = TEXT[lang];
  const date = new Date(ev.start);
  const p = Utilities.formatDate(
    date,
    ev.timeZone,
    "u|d|M|yyyy|h:mm a|HH.mm",
  ).split("|");
  const day = t.days[Number(p[0]) - 1];
  const month = t.months[Number(p[2]) - 1];
  return lang === "id"
    ? day +
        ", " +
        p[1] +
        " " +
        month +
        " " +
        p[3] +
        " · " +
        p[5] +
        " " +
        ev.timeZoneLabel
    : day +
        ", " +
        month +
        " " +
        p[1] +
        ", " +
        p[3] +
        " · " +
        p[4] +
        " " +
        ev.timeZoneLabel;
}

function utc(iso) {
  return Utilities.formatDate(new Date(iso), "UTC", "yyyyMMdd'T'HHmmss'Z'");
}

function icsFile(evName) {
  const ev = CONFIG.event;
  const e = (s) => String(s).replace(/([,;\\])/g, "\\$1");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding//rsvp//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + utc(ev.start) + "-rsvp@wedding",
    "DTSTAMP:" + utc(new Date().toISOString()),
    "DTSTART:" + utc(ev.start),
    "DTEND:" + utc(ev.end),
    "SUMMARY:" + e(evName + " — " + CONFIG.couple),
    "LOCATION:" + e(ev.venue + ", " + ev.address),
    CONFIG.siteUrl ? "URL:" + CONFIG.siteUrl : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return Utilities.newBlob(ics, "text/calendar", "wedding.ics");
}

function esc(s) {
  return String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
