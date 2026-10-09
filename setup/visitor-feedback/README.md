# Automatic visitor-feedback storage (Google Sheets)

This folder contains the Google Apps Script backend for the RegTech Nexus AI visitor survey. The public website is static, so the backend must be deployed from a Google account; a GitHub commit alone cannot authorize access to Google Sheets or send email.

## One-time setup

1. Sign in to the Google account that should own the response spreadsheet.
2. Open https://script.google.com/ and create a **New project**.
3. Replace the editor's starter code with the contents of `Code.gs` from this folder.
4. Save, select `setupFeedbackStorage`, and click **Run**. Review and approve Google's requested permissions. The script creates a spreadsheet named **RegTech Nexus AI — Visitor Feedback Responses**. The execution log contains its URL.
5. In **Deploy → New deployment**, select **Web app**. Set **Execute as** to **Me** and access to **Anyone** so the public website can submit without requiring visitors to sign in. Deploy and copy the Web app URL ending in `/exec`.
6. Send that `/exec` URL to the site maintainer to connect it to `visitor-feedback.html`. Do not paste an access token or password into the website.
7. Submit one test response and confirm that a new row appears in the spreadsheet and a notification arrives at **regtechnexusai@gmail.com**.

## What it stores

Timestamp, visitor type, visit purpose, selected topics, requested improvement, whether the visitor found what they needed, optional suggestion, and the page URL. It does not request a visitor's name, email address, or employer. The script sends a notification email to `regtechnexusai@gmail.com`.

## Security and privacy

- Do not use this survey for confidential customer, transaction, bank, or supervisory information.
- The deployment URL is public-facing. The script validates the fixed-choice answers and limits the suggestion length, but it is not an authenticated or abuse-proof service. Monitor submissions and quotas.
- Keep the response spreadsheet restricted to the account and trusted collaborators who need access.
- Do not put secrets or private credentials in the public GitHub repository.
- Google Apps Script quotas and Google account settings may affect delivery. Test before treating the workflow as operational.
