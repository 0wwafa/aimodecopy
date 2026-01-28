# Google AI Markdown Copier (Universal)

A lightweight Tampermonkey userscript that adds a missing "Copy" button to Google Search AI results. It automatically converts AI Overviews and Full AI Mode responses into clean, formatted Markdown.

## Why this exists?

Google’s AI Overviews (SGE) provide incredibly useful summaries, yet **Google has — for some unknown reason — omitted a standard "Copy" button.**

Currently, if you want to save an AI response, you are forced to manually highlight text (which often captures unwanted UI elements) or copy the entire page. This script fixes that oversight by adding a native-looking copy icon directly into the AI interaction bar.

## Features

- **Universal Support:** Works seamlessly in both the "Embedded Overview" (top of search results) and the "Full AI Mode" (Gemini-powered search).
- **Smart Markdown Conversion:**
    - **Headers:** Converts AI section titles into Markdown headers (`###`).
    - **Tables:** Properly formats data tables for use in Obsidian, Notion, or GitHub.
    - **Lists:** Detects and formats bulleted lists correctly.
    - **Styling:** Preserves **bold** and *italic* emphasis.
- **Clean Extraction:** Automatically strips out citations, timestamps, "Feedback" buttons, and other UI clutter to give you just the data.
- **Native UI:** The copy icon is designed to match Google's Material Design, providing a "built-in" feel with visual feedback when a copy is successful.

## Installation

1. Install the **Tampermonkey** extension for your browser ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)).
2. Click the link below to install the script:
   - [**Install Google AI Markdown Copier**](https://0wwafa.github.io/aimodecopy/print_ai_mode.user.js)
3. Refresh any open Google Search pages.

## How to Use

1. Perform a Google Search that triggers an AI Overview.
2. Look for the **Clipboard Icon** next to the "Share" or "Feedback" buttons at the bottom of the AI response.
3. Click the icon. The icon will turn green to confirm the Markdown text is now in your clipboard.
4. Paste it into your favorite note-taking app!


## Author

Created by **Zibri**.

---
*Disclaimer: This script is not affiliated with, maintained, authorized, endorsed, or sponsored by Google LLC. Use it to fill the gap Google left behind!*
