# Wedding Invitation & RSVP

A static wedding invitation site. It opens on a felt envelope, works in Indonesian and English, and sends RSVPs to a Google Form. There's no database and no build step, and it costs $0 to host.

```
index.html        page shell + envelope cover
css/style.css     all styling (tokens documented in DESIGN.md)
js/config.js      ← EDIT THIS: names, dates, venues, sections on/off, RSVP IDs, gifts, photos
js/i18n.js        fixed interface text (ID / EN)
js/main.js        rendering, envelope, countdown, gallery, calendar, navbar
js/rsvp.js        Google Form submit
apps-script/      confirmation-email script to paste into the Google Form (see §5)
assets/img/       photos + og.jpg (the link-preview image)
_headers          Cloudflare Pages caching/security headers
```

## 1. Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000            (generic guest)
# open http://localhost:8000/?to=Budi   (personalised)
```

## 2. Edit the content

Everything lives in `js/config.js`, and every `TODO` there is placeholder content to replace.
- **Turn sections on or off** under `sections`.
- **Photos.** Put them in `assets/img/` and list them, e.g. `gallery: ['assets/img/gallery-1.jpg', …]`.
  The venue photo behind The Celebration is `eventsPhoto` (now `assets/img/StcBuilding.jpeg`).
  Resize them to about 1200px on the long edge and save as JPG at around 80% quality (aim for under 300 KB each).
- **Link preview.** Update `<title>` and the `og:*` tags in `index.html`. After the domain is live,
  make `og:image` an absolute URL. To make a new preview image, screenshot the cover at 1200×630.

## 3. Personalised links (optional)

- Anyone can open `https://yourdomain.com/` and they'll see "Kepada Yth. Tamu Undangan".
- A personalised link adds `?to=`, e.g. `https://yourdomain.com/?to=Budi%20%26%20Partner`.
  The name is shown on the envelope and pre-fills the RSVP. Spaces become `%20` and `&` becomes `%26`.
- No guest list is stored in the code, so the public link reveals nothing.

## 4. RSVP setup (Google Form, free)

1. Create a Google Form with these questions, in this order:
   - **Nama**: Short answer
   - **Kehadiran**: Multiple choice with exactly two options, `Hadir` and `Tidak Hadir`
     (or change `rsvp.attendanceValues` in config to match your options exactly)
   - **Jumlah Tamu**: Short answer
   - **Ucapan**: Paragraph
   - **Email**: Short answer, *not* required (only for the confirmation email, see §5)
   - **Language**: Short answer, *not* required (the site fills in `en` or `id`)
2. Go to **Settings → Responses** and turn **off** "Collect email addresses" and "Restrict to users in … / require sign-in".
   The guest's email comes from the normal **Email** question above, not from Google's email setting.
3. Go to **Responses → Link to Sheets** to create the responses spreadsheet.
4. Open **⋮ → Get pre-filled link**, type a value in every field, click **Get link**, and copy it. It looks like this:
   `https://docs.google.com/forms/d/e/1FAIpQL.../viewform?usp=pp_url&entry.123=a&entry.456=Hadir&entry.789=1&entry.555=hi`
5. Fill in `js/config.js`:
   ```js
   rsvp: {
     formAction: 'https://docs.google.com/forms/d/e/1FAIpQL.../formResponse', // viewform → formResponse
     fields: {
       name: 'entry.123', attendance: 'entry.456', guests: 'entry.789', message: 'entry.555',
       email: 'entry.666', lang: 'entry.777',
     },
   ```
   Set `email: ''` if you don't want the Email field on the site.
6. Test it: send an RSVP from the site and check that a row appears in the Sheet.
   While `formAction` is empty, the form runs in **demo mode** and sends nothing.

> Google Forms doesn't let websites read its reply, so the site shows "Thank you" once the request
> has been sent. Each change of answer adds a new row, so use the newest row per name.

## 5. RSVP confirmation email (free, optional)

Google Form's own "send responders a copy" setting doesn't work for answers sent from this website, so a
small Google Apps Script does it instead. Guests who fill in **Email** get a confirmation in their language (EN/ID):
a summary of their reply, plus the date, venue, map and calendar buttons and an attached `.ics` calendar file if they're attending.

1. Make sure the form has the **Email** and **Language** questions (§4) and that both IDs are set in `rsvp.fields`.
2. In the Google Form, open **⋮ → Apps Script**. Delete the sample code, paste the whole of
   [`apps-script/rsvp-confirmation.gs`](apps-script/rsvp-confirmation.gs), and click **Save**.
3. Edit `CONFIG` at the top of the script:
   - `questions` must match the question titles in your form **exactly**
   - set `siteUrl` to your website link; `replyTo` is optional
4. Choose **testSend** in the function menu and click **Run**. Google asks for permission the first time
   ("Advanced → Go to … (unsafe)" is expected for your own script). Two sample emails (EN + ID) arrive in your Gmail.
5. Open **Triggers** (clock icon) → **Add Trigger** → function `onRsvpSubmit`, event source **From form**,
   event type **On form submit** → **Save**.
6. Send an RSVP from the website with your own email and check your inbox.

Notes:
- Emails are sent from the Gmail account that owns the form. Gmail allows about **100 recipients a day**;
  if that runs out, the RSVP is still saved and only that email is skipped.
- If something fails, open **Executions** in the Apps Script editor to see the error.
- The website can't see whether Google sent the email, so it says the email "will be sent".

## 6. Hosting: Cloudflare Pages (free)

You do all the git steps yourself. Cloudflare deploys automatically on every push to `main`.
1. Push this repo to GitHub (it can be private).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Build settings: Framework preset **None**, Build command *(empty)*, Build output directory **`/`**.
4. Click **Deploy**. The site goes live at `https://<project>.pages.dev`.
5. **Custom domain (later):** go to the project → **Custom domains → Set up a domain**. If the domain's DNS is on Cloudflare,
   it connects automatically. Otherwise add the CNAME record Cloudflare shows you. SSL is automatic.

The free plan gives unlimited static bandwidth, custom domains, and SSL, and allows commercial use. If you need a backup host,
Netlify's free plan works the same way: drag the folder in or connect the repo, with no build command and `/` as the publish directory.
