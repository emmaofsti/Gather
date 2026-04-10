export type Lang = "no" | "en";

const t = {
  // Bottom nav
  "nav.gatherings": { no: "Gatherings", en: "Gatherings" },
  "nav.new": { no: "Ny", en: "New" },
  "nav.me": { no: "Meg", en: "Me" },

  // Home
  "home.hi": { no: "hei", en: "hi" },
  "home.title": { no: "Mine Gatherings", en: "My Gatherings" },
  "home.moment_now": { no: "Det er et moment nå!", en: "There's a moment now!" },
  "home.moment_tap": { no: "Trykk for å ta bildet", en: "Tap to take the photo" },
  "home.no_gatherings": { no: "Ingen gatherings enda", en: "No gatherings yet" },
  "home.no_gatherings_sub": { no: "Lag din første og inviter gjengen", en: "Create your first and invite the crew" },
  "home.create": { no: "Lag gathering", en: "Create gathering" },
  "home.active": { no: "Pågående", en: "Active" },
  "home.upcoming": { no: "Kommende", en: "Upcoming" },
  "home.past": { no: "Tidligere", en: "Past" },

  // Install banner
  "install.tip": { no: "Tips", en: "Tip" },
  "install.title": { no: "Legg til Gather på hjemskjermen", en: "Add Gather to your home screen" },
  "install.show": { no: "Vis hvordan", en: "Show how" },
  "install.modal_title": { no: "Legg til på hjemskjermen", en: "Add to home screen" },
  "install.modal_desc": { no: "Da får du Gather som en app — raskere, fullskjerm og med varsler for moments.", en: "You'll get Gather as an app — faster, full screen, and with moment notifications." },
  "install.iphone": { no: "iPhone", en: "iPhone" },
  "install.android": { no: "Android", en: "Android" },
  "install.ios_1": { no: "Åpne denne siden i Safari eller Chrome", en: "Open this page in Safari or Chrome" },
  "install.ios_2": { no: "Del-knappen", en: "the Share button" },
  "install.ios_3": { no: "Scroll ned og trykk «Legg til på Hjem-skjerm»", en: "Scroll down and tap 'Add to Home Screen'" },
  "install.ios_4": { no: "Trykk «Legg til» oppe i høyre hjørne", en: "Tap 'Add' in the top right corner" },
  "install.android_1": { no: "Åpne denne siden i Chrome (eller Samsung Internet)", en: "Open this page in Chrome (or Samsung Internet)" },
  "install.android_2": { no: "Del-knappen (eller menyen ⋮)", en: "the Share button (or menu ⋮)" },
  "install.android_3": { no: "Velg «Legg til på startskjerm»", en: "Choose 'Add to Home screen'" },
  "install.android_4": { no: "Bekreft", en: "Confirm" },
  "install.got_it": { no: "Skjønner", en: "Got it" },
  "install.tap_on": { no: "Trykk på", en: "Tap" },

  // Login
  "login.tagline": { no: "Én gathering. Ett sted. Samle minnene.", en: "One gathering. One place. Collect the memories." },
  "login.tab_login": { no: "Logg inn", en: "Log in" },
  "login.tab_signup": { no: "Ny bruker", en: "Sign up" },
  "login.email_placeholder": { no: "din@epost.no", en: "your@email.com" },
  "login.password_placeholder": { no: "passord", en: "password" },
  "login.submit_login": { no: "Logg inn ✦", en: "Log in ✦" },
  "login.submit_signup": { no: "Opprett konto ✦", en: "Create account ✦" },
  "login.signup_confirm": { no: "Konto opprettet ✦ Sjekk eposten din for å bekrefte kontoen, og logg så inn.", en: "Account created ✦ Check your email to confirm your account, then log in." },

  // Trip page
  "trip.back": { no: "Mine Gatherings", en: "My Gatherings" },
  "trip.album": { no: "Album", en: "Album" },
  "trip.moments": { no: "Moments", en: "Moments" },
  "trip.notes": { no: "Notater", en: "Notes" },
  "trip.notes_hint": { no: "Alle kan skrive ✿", en: "Everyone can write ✿" },
  "trip.notes_placeholder": { no: "Skriv noe her — planer, minner, tanker…", en: "Write something — plans, memories, thoughts…" },
  "trip.links": { no: "Lenker", en: "Links" },
  "trip.no_links": { no: "Ingen lenker enda", en: "No links yet" },
  "trip.link_title_placeholder": { no: "Tittel (valgfri)", en: "Title (optional)" },
  "trip.person": { no: "person", en: "person" },
  "trip.persons": { no: "personer", en: "people" },

  // Album
  "album.upload": { no: "+ Last opp bilder", en: "+ Upload photos" },
  "album.uploading": { no: "Laster opp…", en: "Uploading…" },
  "album.empty": { no: "Ingen bilder enda", en: "No photos yet" },
  "album.empty_sub": { no: "Last opp det første for å starte minnealbumet", en: "Upload the first one to start the memory album" },

  // Crop
  "crop.cancel": { no: "Avbryt", en: "Cancel" },
  "crop.title": { no: "Beskjær", en: "Crop" },
  "crop.done": { no: "Ferdig", en: "Done" },

  // Profile
  "me.profile": { no: "profil", en: "profile" },
  "me.title": { no: "Meg", en: "Me" },
  "me.password_title": { no: "Sett / bytt passord", en: "Set / change password" },
  "me.password_placeholder": { no: "nytt passord", en: "new password" },
  "me.password_save": { no: "Lagre passord", en: "Save password" },
  "me.password_saving": { no: "Lagrer…", en: "Saving…" },
  "me.password_done": { no: "Passord oppdatert ✓", en: "Password updated ✓" },
  "me.signout": { no: "Logg ut", en: "Log out" },
  "me.language": { no: "Språk", en: "Language" },
  "me.lang_no": { no: "Norsk", en: "Norwegian" },
  "me.lang_en": { no: "Engelsk", en: "English" },

  // Push
  "push.moment_title": { no: "📸 Moment!", en: "📸 Moment!" },
  "push.moment_body": { no: "Du har 2 minutter — hva gjør du akkurat nå?", en: "You have 2 minutes — what are you doing right now?" },

  // Board saving
  "board.saving": { no: "Lagrer…", en: "Saving…" },
} as const;

export type TKey = keyof typeof t;

export function translate(key: TKey, lang: Lang): string {
  return t[key]?.[lang] ?? t[key]?.["no"] ?? key;
}
