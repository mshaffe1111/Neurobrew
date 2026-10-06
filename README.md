# Neurobrew

Neurobrew helps people create perfect coffee brews.  It has a workflow that uses to brew, cup and perfect based on their exact coffee.

**Brew it. Cup it. Perfect it.**

**Try it:** https://mshaffe1111.github.io/Neurobrew/

## What it does
- Gives a brew recipe for your exact coffee (roast, process, origin, method, grinder, water) with the reasons behind each number.
- Walks you through the brew with a guided timer and voice cues.
- Lets you cup and score the coffee, then tells you what to change.
- **Dial it in:** keeps every try of a coffee, shows what changed and whether it helped, and starts the next brew from your best one. It also handles a new bag of a coffee you already know.
- **Look up this coffee:** reads the roaster's own online shop listing (shops built on Shopify) and offers the origin, process, elevation, roast level and tasting notes it states. You check every line first.
- **My setup:** your units, level, timer sound and gear in one place, saved inside your cupping file so a restored file brings them back.
- Learns your tendencies from your own scores and tells you what to look for on a bag.

## Your data
Everything runs in your browser. There is no account and no server. Your cuppings are kept in your browser and saved as a `cuppings.csv` file you own; upload that file next time to carry your history forward. In Chrome and Edge you can choose the file to save into and NeuroBrew remembers it, so each cupping goes straight into it; other browsers download a copy. They are never sent to a server.

## Notes
- Photo scanning of a bag label works only inside Claude. On this site, use Look up this coffee, paste the label text, or ask Claude in a chat to read the bag and paste the answer.
- Look up this coffee asks the roaster's website directly from your browser. Nothing goes through NeuroBrew, and nothing about your cuppings is sent. It works only with Shopify shops, and some shops may block it.
- The page loads the Poppins font from Google Fonts. If that is blocked, the app still works with a standard font.
- This is a prototype. Scores and advice are guidance, not rules, and the app says so where it applies its own rules of thumb.

## Releases
Each release is one tested build. See [RELEASE_NOTES.md](RELEASE_NOTES.md) for what changed and when. The release number and date are also at the bottom of the app's menu.

## About this repository
`index.html` is the whole app: one self-contained file with no build step and no dependencies. It is updated from the working version periodically.
