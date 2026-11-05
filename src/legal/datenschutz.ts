import { operator } from './operator.ts'
import type { LegalDocument, LegalLanguage } from './types.ts'

const controller = `${operator.name}, ${operator.street}, ${operator.postalCodeAndCity}, ${operator.country}, ${operator.email}`

export const datenschutz: Record<LegalLanguage, LegalDocument> = {
  de: {
    title: 'Datenschutzerklärung',
    updated: 'Stand: [PLATZHALTER: Datum]',
    sections: [
      { heading: 'Verantwortlicher', paragraphs: [controller] },
      {
        heading: 'Kurzfassung',
        paragraphs: [
          'Diese Website hat keine Benutzerkonten, keine Werbung, keine Analyse- oder Tracking-Dienste und bindet keine Inhalte von Drittanbietern ein. Schriften, Bilder und Skripte kommen von unserem eigenen Server. Deshalb zeigen wir kein Einwilligungsbanner: Wir setzen nur Speicherungen ein, die für die von dir gewünschte Funktion erforderlich sind.',
        ],
      },
      {
        heading: 'Hosting und Server-Logs',
        paragraphs: [
          'Die Website läuft auf einem Server der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland (Hosting). Standort des Rechenzentrums: ' + operator.serverLocation + '. Mit Hetzner besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO [PLATZHALTER: Abschluss durch den Betreiber bestätigen].',
          'Bei jedem Aufruf verarbeitet der vorgeschaltete Webserver technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Statuscode, übertragene Datenmenge und User-Agent. Zweck ist der sichere und stabile Betrieb. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Zugriffsprotokolle werden ' + operator.accessLogRetention + ' Tage aufbewahrt. Die Anwendung selbst schreibt keine IP-Adressen in Protokolle.',
        ],
      },
      {
        heading: 'Cookies und lokaler Speicher',
        paragraphs: ['Wir setzen ausschließlich technisch erforderliche Speicherungen ein (§ 25 Abs. 2 Nr. 2 TDDDG). Es gibt keine Cookies zu Werbung oder Analyse.'],
        items: [
          'creator: wird gesetzt, wenn du eine Abstimmung erstellst. Eine zufällige Kennung, mit der du die Abstimmung beenden kannst. Gilt nur für den Pfad dieser Abstimmung, HttpOnly, SameSite Lax, 60 Tage.',
          'participant: wird gesetzt, wenn du einer Abstimmung beitrittst. Eine zufällige Kennung, damit dein Name und deine Stimme dir zugeordnet bleiben. Gilt nur für den Pfad dieser Abstimmung, HttpOnly, SameSite Lax, 60 Tage.',
          'recipes_admin: nur für den Betreiber nach der Anmeldung im Admin-Bereich. Zufällige Sitzungskennung, HttpOnly, SameSite Strict, 8 Stunden.',
          'Lokaler Speicher deines Browsers (bleibt auf deinem Gerät und wird nicht an uns gesendet): recipe-app-language (gewählte Sprache), preferred-theme (helles oder dunkles Design), preferred-cuisine (gewählte Küche). Du kannst diese Werte jederzeit in den Browser-Einstellungen löschen.',
          'Offline-Speicher (Service Worker): Die Seite legt ihre Dateien und angesehene Bilder in deinem Browser ab, damit sie ohne Verbindung funktioniert. Auch dieser Speicher bleibt auf deinem Gerät.',
        ],
      },
      {
        heading: 'Abstimmungen',
        paragraphs: [
          'Wenn du eine Abstimmung erstellst oder ihr beitrittst, speichern wir den Namen der Abstimmung, deinen frei gewählten Anzeigenamen, die gewählten Rezepte und deine Stimme. Zweck ist die gemeinsame Auswahl eines Rezepts (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Wer den Link kennt, sieht Namen und Ergebnis der Abstimmung; verwende deshalb keinen Klarnamen, wenn du das nicht möchtest. Eine Abstimmung wird 30 Tage nach ihrem Ende gelöscht.',
        ],
      },
      {
        heading: 'Rezepte einreichen',
        paragraphs: [
          'Wenn du den Link zu einer Rezeptseite einreichst, speichern wir den Link und den Bearbeitungsstand. Unser Server ruft die Seite ab. Um das Rezept zu lesen und in vier Sprachen zu übersetzen, wird der Text der Seite an OpenRouter (OpenRouter, Inc., USA) gesendet und von dort an das ausgewählte Sprachmodell weitergeleitet, betrieben von: ' + operator.modelProviders + '. Diese Anbieter erhalten den Seitentext und die IP-Adresse unseres Servers, nicht deine IP-Adresse. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Betrieb der Einreichungsfunktion). Bei der Übermittlung in die USA stützen wir uns auf [PLATZHALTER: Angemessenheitsbeschluss / EU-US Data Privacy Framework oder Standardvertragsklauseln, vom Betreiber zu prüfen].',
          'Reiche deshalb keine Links ein, die personenbezogene Daten enthalten. Eingereichte Rezepte werden erst nach Prüfung veröffentlicht. Abgelehnte Links bleiben gespeichert, damit sie nicht erneut importiert werden.',
        ],
      },
      {
        heading: 'Begrenzung von Anfragen (Rate Limit)',
        paragraphs: [
          'Um Missbrauch zu verhindern, zählt der Server pro IP-Adresse die Einreichungen (5 pro Stunde) und die Anmeldeversuche im Admin-Bereich (10 pro 15 Minuten). Die Zähler liegen nur im Arbeitsspeicher, werden nie auf die Festplatte geschrieben und verschwinden spätestens beim Neustart (Art. 6 Abs. 1 lit. f DSGVO).',
        ],
      },
      {
        heading: 'Inhalte anderer Webseiten',
        paragraphs: [
          'Die Rezepte stammen von anderen Webseiten. Jedes Rezept nennt seine Quelle mit Link. Bilder werden auf unserem Server gespeichert und von dort ausgeliefert; beim Betrachten einer Rezeptseite wird keine fremde Seite kontaktiert. Erst wenn du einen Quell-Link anklickst, verlässt du diese Website, und es gilt die Datenschutzerklärung der Zielseite.',
        ],
      },
      {
        heading: 'Deine Rechte',
        paragraphs: [
          'Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Wende dich dazu an ' + operator.email + '. Du kannst dich außerdem bei einer Aufsichtsbehörde beschweren, zum Beispiel bei: ' + operator.supervisoryAuthority + '.',
        ],
      },
      { heading: 'Sicherheit', paragraphs: ['Die Verbindung zu dieser Website ist per HTTPS verschlüsselt.'] },
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: 'Last updated: [PLACEHOLDER: date]',
    sections: [
      { heading: 'Controller', paragraphs: [controller] },
      {
        heading: 'In short',
        paragraphs: [
          'This website has no user accounts, no advertising, no analytics or tracking services and embeds no content from third parties. Fonts, pictures and scripts come from our own server. For that reason there is no consent banner: we only store what is needed for a function you ask for.',
        ],
      },
      {
        heading: 'Hosting and server logs',
        paragraphs: [
          'The site runs on a server of Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany (hosting). Data centre location: ' + operator.serverLocation + '. A data processing agreement under Art. 28 GDPR exists with Hetzner [PLACEHOLDER: operator to confirm it is concluded].',
          'On every visit the web server in front of the application processes the technically necessary data: IP address, date and time, requested address, status code, amount of data and user agent. The purpose is secure and stable operation. The legal basis is Art. 6 (1) (f) GDPR. Access logs are kept for ' + operator.accessLogRetention + ' days. The application itself does not write IP addresses to logs.',
        ],
      },
      {
        heading: 'Cookies and local storage',
        paragraphs: ['We only use storage that is technically necessary (section 25 (2) no. 2 TDDDG). There are no advertising or analytics cookies.'],
        items: [
          'creator: set when you create a vote. A random identifier that lets you close the vote. Valid only for the path of that vote, HttpOnly, SameSite Lax, 60 days.',
          'participant: set when you join a vote. A random identifier that keeps your name and your vote linked to you. Valid only for the path of that vote, HttpOnly, SameSite Lax, 60 days.',
          'recipes_admin: for the operator only, after signing in to the admin area. Random session identifier, HttpOnly, SameSite Strict, 8 hours.',
          'Local storage of your browser (stays on your device and is not sent to us): recipe-app-language (chosen language), preferred-theme (light or dark design), preferred-cuisine (chosen cuisine). You can delete these values in your browser settings at any time.',
          'Offline storage (service worker): the site keeps its files and the pictures you viewed in your browser so that it works without a connection. This storage also stays on your device.',
        ],
      },
      {
        heading: 'Votes',
        paragraphs: [
          'When you create or join a vote we store the name of the vote, the display name you chose, the recipes and your vote. The purpose is choosing a recipe together (Art. 6 (1) (b) or (f) GDPR). Anyone with the link sees the names and the result, so do not use your real name if you do not want that. A vote is deleted 30 days after it ends.',
        ],
      },
      {
        heading: 'Submitting recipes',
        paragraphs: [
          'When you submit the link to a recipe page we store the link and its progress. Our server fetches the page. To read the recipe and translate it into four languages, the text of the page is sent to OpenRouter (OpenRouter, Inc., USA) and passed on from there to the selected language model, run by: ' + operator.modelProviders + '. These providers receive the page text and the IP address of our server, not your IP address. The legal basis is Art. 6 (1) (f) GDPR (running the submission function). For the transfer to the USA we rely on [PLACEHOLDER: adequacy decision / EU-US Data Privacy Framework or standard contractual clauses, to be checked by the operator].',
          'Therefore do not submit links that contain personal data. Submitted recipes are published only after a review. Rejected links stay stored so that they are not imported again.',
        ],
      },
      {
        heading: 'Rate limiting',
        paragraphs: [
          'To prevent abuse the server counts submissions (5 per hour) and admin sign-in attempts (10 per 15 minutes) per IP address. The counters live in memory only, are never written to disk and disappear at the latest when the server restarts (Art. 6 (1) (f) GDPR).',
        ],
      },
      {
        heading: 'Content from other websites',
        paragraphs: [
          'The recipes come from other websites. Every recipe names its source with a link. Pictures are stored on our server and delivered from there; viewing a recipe page does not contact any other site. Only when you click a source link do you leave this website, and the privacy policy of the target site applies.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You have the right of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data portability (Art. 20) and objection (Art. 21 GDPR). Contact ' + operator.email + '. You can also complain to a supervisory authority, for example: ' + operator.supervisoryAuthority + '.',
        ],
      },
      { heading: 'Security', paragraphs: ['The connection to this website is encrypted with HTTPS.'] },
    ],
  },
}
