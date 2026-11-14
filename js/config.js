/* ============================================================================
 *  WEDDING CONFIG — edit this file only.
 *
 *  Text can be a plain string (same in both languages) or { id: '...', en: '...' }.
 *  Everything marked TODO is placeholder content — replace before sharing.
 *  Images: put files in assets/img/ and write the path, e.g. 'assets/img/bride.jpg'.
 * ========================================================================== */
window.WEDDING = {
  defaultLang: "en", // 'en' or 'id' — guests can switch with the ID / EN toggle

  /* Turn any section on (true) or off (false). */
  sections: {
    story: true, // love-story timeline (comes right after the first screen)
    countdown: false, // the first screen already has a countdown; true adds a second, larger one
    events: true, // ceremony / reception, map, add-to-calendar
    agenda: true, // day-of schedule / run of show (between The Celebration and Dress Code)
    dresscode: true, // colour palette for guests' outfits (between The Celebration and Gallery)
    gallery: true, // an envelope with photos peeking out; tap opens a small gallery pop-up
    rsvp: true, // Google Form RSVP
    closing: true,
    support: true, // last section: "Support Us" with all gift options shown on the page
  },

  couple: {
    first: "bride", // whose name is written first: 'bride' or 'groom'
    monogram: "AR", // two initials on the wax seal
    bride: { nick: "Assela" },
    groom: { nick: "Rama" },
  },

  /* Main date — drives the countdown and the date on the cover.
     Written in Hawaii time (-10:00); guests anywhere still get a correct countdown. */
  date: "2026-12-19T11:00:00-10:00",
  timeZone: "Pacific/Honolulu",
  timeZoneLabel: "HST",

  /* First screen after the envelope opens: vintage polaroid stack on deep night-blue.
     3 photos overlap with tape strips, handwritten captions, slim script names. */
  firstLook: {
    title: { id: "Simpan Tanggalnya!", en: "Save the Date!" }, // handwritten kicker above the stack
    subtitle: {
      id: "— cerita cinta kami berlanjut —",
      en: "— our love story continues —",
    }, // small italic line under kicker
    photos: [
      "assets/img/web/photo-1.jpg",
      "assets/img/web/photo-4.jpg",
      "assets/img/web/photo-5.jpg",
    ], // 3 polaroid photos (top-left, top-right, bottom-center)
    captions: ["us, '24", "BYUH days", "forever ♡"], // handwritten caption under each polaroid
    place: {
      id: "di Laie, Hawaii yang indah",
      en: "in beautiful Laie, Hawaii",
    }, // handwritten location line
    photosBW: false, // true = grayscale, false = original colours
    contact: "", // e.g. 'ramaassela@email.com' or a WhatsApp number — '' hides the line
  },

  /* How the cover addresses guests. Personal link: https://your-site/?to=Budi%20%26%20Partner */
  guest: {
    param: "to",
    fallback: { id: "Tamu Undangan", en: "Our Beloved Guest" },
  },

  story: [
    {
      year: "2022",
      title: { id: "Bersama", en: "Together" },
      text: {
        id: "Setelah menyelesaikan misi, Rama menjadi orang pertama yang mengambil langkah untuk memulai hubungan kami.",
        en: "After completing our mission, Rama was the first to make a move and start our journey together.",
      },
    },
    {
      year: "2024-2025",
      title: { id: "LDR ke BYUH", en: "LDR to BYUH" },
      text: {
        id: "Kami menjalani hubungan jarak jauh selama kurang lebih satu setengah tahun, hingga akhirnya Assela tiba di BYUH pada tahun 2025. Sementara itu, Rama sudah lebih dulu berada di BYUH sejak 2024. (Masih Bersama!)",
        en: "We were in a long-distance relationship for about a year and half, until Assela finally got into BYUH in 2025. Rama had already been there since 2024. (Still Together!)",
      },
    },
    {
      year: "2026",
      title: { id: "Lamaran dan Pernikahan", en: "The Proposal & Wedding" },
      text: {
        id: "Dengan kehendak Bapa Surgawi dan restu keluarga, kami siap melangkah ke babak baru dalam perjalanan cinta kami.",
        en: "With Heavenly Father's will and our families' blessings, we are ready to begin a new chapter in our journey together for eternity.",
      },
    },
  ],

  events: [
    {
      name: { id: "Upacara Pernikahan", en: "Holy Ceremony" }, // TODO: Indonesian name of the ceremony
      start: "2026-12-19T11:00:00-10:00",
      end: "", // e.g. '2026-12-19T13:00:00-10:00' — empty shows the start time only
      venue: "BYU–Hawaii · STC Chapel 179",
      address: "Laie, Hawaii",
      mapsUrl:
        "https://www.google.com/maps/?q=21.642776617331553,-157.9276080508247", // pin ke koordinat exact STC Chapel
      note: "", // small italic line on the card, e.g. { en: 'Doors open 10:30 AM', id: 'Pintu dibuka 10.30' }
    },
  ],

  /* Day-of schedule. Each time is a full date-time (same timezone as above) so it formats the
     same way as the event times. 'text' is optional — '' hides that line. */
  agenda: [
    {
      time: "2026-12-19T10:30:00-10:00",
      title: { id: "Kedatangan Tamu", en: "Guest Arrival & Guest Book" },
      text: {
        id: "Silakan mengisi wedding guest book kami untuk mendapatkan kenang-kenangan kecil dari kami sambil menunggu kedua mempelai.",
        en: "Please Sign our wedding guest book and get little gift from us while waiting for the bride and groom.",
      },
    },
    {
      time: "2026-12-19T11:00:00-10:00",
      title: { id: "Upacara Pernikahan", en: "Wedding Ceremony" },
      text: {
        id: "Upacara pernikahan akan segera dimulai. Kami mengundang semua tamu untuk mengambil tempat duduk dan menikmati momen spesial ini bersama kami.",
        en: "The ceremony is about to begin. Please take your seats and enjoy this special moment with us.",
      },
    },
    {
      time: "2026-12-19T12:00:00-10:00",
      title: { id: "Ucapan Selamat & Foto", en: "Congratulations & Photos" },
      text: {
        id: "Setelah upacara selesai, tamu dipersilakan keluar dari chapel secara bergantian untuk memberikan ucapan selamat dan berfoto bersama kedua mempelai.",
        en: "After the ceremony, guests will exit the chapel one by one to congratulate the newlyweds and take photos with them.",
      },
    },
    {
      time: "2026-12-19T12:01:00-10:00",
      title: {
        id: "Hidangan Ringan & Guest Book",
        en: "Refreshments & Guest Book",
      },
      text: {
        id: "Setelah sesi foto, silakan menikmati hidangan ringan yang telah kami sediakan. Jika belum mengisi wedding guest book, jangan lupa untuk mengisinya dan mengambil kenang-kenangan kecil dari kami!",
        en: "After the photos, please get some of the little refreshments we've prepared. And if you haven't signed our wedding guest book yet, don't forget to do so and pick up a little gift from us!",
      },
    },
  ],

  /* Background photo for The Celebration section ('' = plain background). */
  eventsPhoto: "assets/img/StcBuilding.jpeg",

  /* Dress code: colour circles shown in their own section. Add, remove or reorder freely. */
  dressCode: {
    note: {
      en: "We would love to see you in these colours.",
      id: "Kami akan senang melihat Anda mengenakan warna-warna ini.",
    },
    colors: [
      { hex: "#80aac6", name: { en: "Dusty Blue", id: "Biru Muda" } },
      { hex: "#552421", name: { en: "Burgundy", id: "Merah Marun" } },
      { hex: "#9ca990", name: { en: "Sage", id: "Hijau Sage" } },
      { hex: "#ecdfcb", name: { en: "Cream", id: "Krem" } },
    ],
  },

  /* Gallery photos (any number). The first 3 peek out of the envelope; all of them are in the pop-up.
     Empty list = 6 empty frames (so you can see the layout). */
  gallery: [
    "assets/img/web/photo-1.jpg",
    "assets/img/web/photo-2.jpg",
    "assets/img/web/photo-4.jpg",
    "assets/img/web/photo-5.jpg",
    "assets/img/web/photo-7.jpg",
    "assets/img/web/photo-10.jpg",
  ],

  rsvp: {
    /* Paste the Google Form IDs here (see README → "RSVP setup").
       While formAction is empty the form runs in DEMO mode (nothing is sent). */
    formAction:
      "https://docs.google.com/forms/d/e/1FAIpQLSdaUeiro36DO0jWatv09E_l9UUcaL3ZyJxf81vBKHQnpBQbSQ/formResponse",
    fields: {
      name: "entry.1308206486",
      attendance: "entry.1076587791",
      guests: "entry.377577629",
      message: "entry.295779455",
      email: "entry.713499977", // optional "Email" question — '' hides the email field on the site
      lang: "entry.998449259", // "Language" question — the site fills it with en / id (for the confirmation email)
    },
    /* Must match the Google Form's multiple-choice options EXACTLY. */
    attendanceValues: { yes: "Hadir", no: "Tidak Hadir" },
    maxGuests: 5,
    deadline: "2026-12-05", // TODO: shown as "Kindly reply by"; '' to hide
  },

  /* "Support Us" — shown in the last section of the page, and in the pop-up
     that the round gift button (bottom right) opens.
     url    → the whole option is one link button (opens in a new tab)
              logo = icon file (shown white on `color`), note = small line under the name
     number → shown with a "Copy" button; holder = account name under it */
  gift: {
    intro: {
      id: "Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami. Namun jika ingin memberi tanda kasih, Anda dapat melalui:",
      en: "Your presence and blessing are the greatest gift. Should you wish to send a token of love, you may use:",
    },
    options: [
      {
        name: "Amazon Registry",
        url: "https://www.amazon.com/wedding/guest-view/3I9NJ15K85IQE", // TODO: your Amazon registry link
        logo: "assets/icons/amazon.svg",
        color: "#ff9900",
        note: {
          en: "Send a gift of our wish list",
          id: "Lihat daftar hadiah kami",
        },
      },
      {
        name: "Venmo",
        url: "https://account.venmo.com/u/ramaputra1", // TODO: e.g. 'https://venmo.com/u/your-venmo'
        logo: "assets/icons/venmo.svg",
        color: "#008cff",
        note: { en: "Send a gift via Venmo", id: "Kirim hadiah lewat Venmo" },
      },
      {
        name: "Chime",
        url: "https://app.chime.com/link/qr?u=Assela-Sutrisno", // TODO: your Chime pay link
        logo: "",
        color: "#1ec677", // add the official Chime logo file here if you have one
        note: { en: "Send a gift via Chime", id: "Kirim hadiah lewat Chime" },
      },
      {
        name: "BCA - Indonesian Bank",
        number: "7651104088",
        holder: "Assela Zeniffia Sutrisno", // TODO: account number + name
        color: "#00539f", // tile colour behind the icon; swap in logo: 'assets/icons/<file>.svg' if you have BCA's official mark
      },
    ],
    address: "", // physical gift address; '' hides it
  },

  closing: {
    text: {
      id: "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
      en: "It would be our joy and honor to have you with us and receive your blessing.",
    },
    hashtag: "#AsselaAndRama", // TODO or ''
  },

  /* Small credit line at the very bottom of the page, under the names/date. '' hides it. */
  footer: {
    credit: "© Rama Putra 2026 · Developed by Rama Putra",
  },
};
