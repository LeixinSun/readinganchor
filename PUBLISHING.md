# Publishing Reading Anchors

This document covers:

1. How to publish the extension to Chrome Web Store and Microsoft Edge Add-ons
2. What is still needed before submission

## Current Status

The extension code is already in a publishable shape as a Manifest V3 extension, but store submission still needs release assets and listing metadata.

Current code files:

- `manifest.json`
- `background.js`
- `content.js`
- `styles.css`
- `README.md`

## What I Still Need From You

Before store submission, these items are still needed:

1. Extension icon set
   - Recommended sizes: `16x16`, `32x32`, `48x48`, `128x128`
   - The manifest should reference these before submission

2. Store screenshots
   - At least 3 useful screenshots
   - Recommended examples:
     - before vs after on a news article
     - floating control panel
     - Wikipedia or blog article usage

3. Store copy
   - short description
   - full description
   - optional promotional copy

4. Support contact
   - at minimum, an email address for the store listing

5. Privacy policy URL or hosted privacy page
   - strongly recommended for Chrome
   - practically necessary if the store asks for public privacy disclosure

6. Final branding choices
   - final extension name
   - final icon style
   - whether the default mode should stay `High + Dense`

## Recommended Release Assets

Prepare these in a release folder:

- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`
- `screenshots/shot-1.png`
- `screenshots/shot-2.png`
- `screenshots/shot-3.png`
- `privacy-policy.md` or a hosted privacy page

## Privacy Summary You Can Use

This extension:

- processes page text locally in the browser
- only runs when the user clicks the extension action
- stores user settings in browser local storage
- does not send page text to a remote server
- does not collect account credentials, payment data, or personal profile data

You should keep the actual public privacy policy consistent with that behavior.

## Packaging

Create a zip that contains the extension files directly, not the parent folder.

Example:

```bash
mkdir -p release
zip -r release/reading-anchors.zip manifest.json background.js content.js styles.css README.md icons
```

If you add more files such as a hosted help page reference, include them too.

## Publish To Chrome Web Store

Official docs:

- Register: <https://developer.chrome.com/docs/webstore/register>
- Publish overview: <https://developer.chrome.com/docs/webstore/publish>
- Listing assets: <https://developer.chrome.com/docs/webstore/images>
- Policies: <https://developer.chrome.com/docs/webstore/program-policies/policies>

Steps:

1. Create a Chrome Web Store developer account.
2. Enable two-step verification on the Google account.
3. Open the developer dashboard.
4. Create a new item and upload the zip package.
5. Fill in the store listing:
   - name
   - short description
   - full description
   - screenshots
   - icons and promotional images if requested
6. Fill in privacy disclosures and permission usage.
7. Set visibility:
   - public
   - unlisted
   - private
8. Submit for review.

## Publish To Microsoft Edge Add-ons

Official docs:

- Create developer account: <https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account>
- Publish extension: <https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension>
- Developer policies: <https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies>

Steps:

1. Sign in with a personal Microsoft account.
2. Register in Partner Center for Edge extensions.
3. Create a new extension submission.
4. Upload the same zip package used for Chrome.
5. Fill in listing metadata:
   - name
   - summary
   - description
   - screenshots
   - support contact
6. Fill in privacy information if requested.
7. Choose visibility:
   - public
   - hidden
8. Submit for review.

## Store Review Risks To Watch

These are the main reasons a lightweight extension still gets delayed:

- no icons or poor-quality icons
- weak listing description that does not explain the purpose clearly
- missing privacy statement
- screenshots that do not show the real product
- mismatch between declared permissions and store explanation

For this extension, permissions are limited:

- `activeTab`
- `scripting`
- `storage`

That is good, but the listing should still explicitly explain why each is needed:

- `activeTab`: run only on the page the user activates
- `scripting`: inject the content script and styles
- `storage`: save density and mode settings

## Release Checklist

- extension name finalized
- icons added
- manifest updated with icon paths
- screenshots prepared
- short description written
- full description written
- support email ready
- privacy policy ready
- zip package created
- tested by loading unpacked in Chrome
- tested by loading unpacked in Edge

## Suggested Next Step

The most useful next step is not submission yet. It is to add the icon set and manifest icon fields, then prepare screenshots from real pages.
