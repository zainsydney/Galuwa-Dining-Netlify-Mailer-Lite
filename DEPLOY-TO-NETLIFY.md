# Galuwa Dining Netlify Update — Secure MailerLite Sign-up

This package retains the approved single-page visual layout and adds a **private server-side sign-up endpoint**. When a visitor submits the Founding Guest form, the endpoint adds the visitor to the existing **Founding Guests** group in MailerLite. The API key is never placed in `index.html` or sent to a visitor's browser.

## Important: deploy through a connected repository

This version contains a Netlify Function under `netlify/functions`. A simple drag-and-drop deployment of the static folder does **not** reliably build or deploy server-side functions. Connect this folder to the existing Netlify site through a Git repository, then trigger a deploy from that repository. Keep `index.html`, `netlify.toml`, `assets/`, and `netlify/functions/` at the repository root.

## Private environment settings

Before deploying, open the existing Netlify site and go to **Project configuration → Environment variables**. Add the following variables for **all deploy contexts**:

| Variable | Value | Purpose |
| --- | --- | --- |
| `MAILERLITE_API_KEY` | The MailerLite API key you already have | Authenticates the private endpoint with MailerLite. |
| `MAILERLITE_FOUNDING_GUESTS_GROUP_ID` | `196343617034389388` | Directs sign-ups into the verified **Founding Guests** group. |

Save the variables, then redeploy. Do not put either value into the HTML file, a public JavaScript file, or a Git commit.

## Deployment and verification

1. Create or use a private Git repository containing this package, with `index.html` at its root.
2. In the existing Netlify site, open **Project configuration → Build & deploy → Continuous deployment** and connect that repository. Netlify reads `netlify.toml`; no separate build command is required.
3. After the deployment succeeds, check **Functions** in Netlify. A function named `founding-guest` must appear.
4. Submit the Founding Guest form with an internal test email address. The site should open the branded thank-you page and the address should appear in MailerLite under **Founding Guests**.
5. If you also want inbox alerts, configure Netlify Forms notifications for the `mailing-list` form to send to `bookings@galuwadining.com.au` and `marketing@galuwadining.com.au`. Those alerts are separate from MailerLite membership.

## Form behaviour

The page continues to submit the visible form to Netlify Forms as a secondary dashboard record. Its success state now depends on the secure server-side MailerLite call succeeding; if MailerLite is unavailable, the visitor receives an on-page retry message rather than an incorrect thank-you confirmation.

This Netlify package does not include the separate full-stack database, owner dashboard, or direct Resend email workflow.
