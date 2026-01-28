// ==UserScript==
// @name         Google AI Markdown Copier - Universal (Embedded + Full)
// @namespace    http://tampermonkey.net/
// @version      10.0
// @description  Adds a Copy icon to Google AI answers in both Embedded Overview and Full AI Mode.
// @author       Zibri
// @author       Robert Sinclair
// @match        https://www.google.com/search?*
// @grant        none
// @run-at       document-end
// @home         https://0wwafa.github.io/aimodecopy
// @homepageURL  https://0wwafa.github.io/aimodecopy
// @downloadURL https://0wwafa.github.io/aimodecopy/print_ai_mode.user.js
// @updateURL https://0wwafa.github.io/aimodecopy/print_ai_mode.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const TAG = "[AI-MD-Hook]";

    // --- Markdown Extraction Logic ---

    function getMarkdownFromTurn(turnElement) {
        let md = "";
        // Target headers, paragraphs, and list items found in both AI modes
        const elements = turnElement.querySelectorAll('.otQkpb, .Y3BBE, .KsbFXc li, table.NRefec, [role="heading"][aria-level="3"], .VndcI');

        if (elements.length === 0) return null;

        elements.forEach(el => {
            if (el.classList.contains('otQkpb') || el.classList.contains('VndcI')) {
                md += `\n### ${el.innerText.trim()}\n\n`;
            } else if (el.tagName === 'TABLE') {
                md += "\n" + parseTable(el) + "\n";
            } else if (el.tagName === 'LI') {
                md += `* ${processInline(el)}\n`;
            } else if (el.classList.contains('Y3BBE') || el.innerText.trim().length > 0) {
                const line = processInline(el);
                if (line) md += `${line}\n\n`;
            }
        });

        return md.replace(/\n{3,}/g, '\n\n').trim();
    }

    function processInline(el) {
        let clone = el.cloneNode(true);
        // Remove citations, buttons, timestamps, and our own UI
        clone.querySelectorAll('svg, button, style, script, .uJ19be, .txxDge, .UYpEO, .md-copy-wrapper, .cIcqpf').forEach(n => n.remove());
        // Handle Bold
        clone.querySelectorAll('.Yjhzub, strong, b').forEach(b => b.innerText = ` **${b.innerText.trim()}** `);
        // Handle Italics
        clone.querySelectorAll('.eujQNb, em, i').forEach(i => i.innerText = ` *${i.innerText.trim()}* `);
        return clone.innerText.replace(/\s+/g, ' ').trim();
    }

    function parseTable(tableEl) {
        const rows = Array.from(tableEl.querySelectorAll('tr'));
        let tableMd = "";
        rows.forEach((row, i) => {
            const cells = Array.from(row.querySelectorAll('th, td')).map(c => c.innerText.trim().replace(/\|/g, '\\|'));
            tableMd += `| ${cells.join(' | ')} |\n`;
            if (i === 0) tableMd += `| ${cells.map(() => '---').join(' | ')} |\n`;
        });
        return tableMd;
    }

    // --- UI Logic (Icon Button) ---

    function createIconButton(markdown) {
        const wrapper = document.createElement('div');
        wrapper.className = 'md-copy-wrapper';
        wrapper.style.cssText = "display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; vertical-align: middle; flex-shrink: 0;";

        const btn = document.createElement('button');
        btn.setAttribute('aria-label', 'Copy Markdown');
        btn.setAttribute('title', 'Copy Markdown');

        btn.style.cssText = `
            all: initial;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            color: #5f6368;
            height: 36px;
            width: 36px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        `;

        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
        `;

        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = 'rgba(60, 64, 67, 0.1)');
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = 'transparent');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(markdown).then(() => {
                const originalColor = btn.style.color;
                btn.style.color = "#137333";
                btn.style.backgroundColor = "#e6f4ea";
                setTimeout(() => {
                    btn.style.color = originalColor;
                    btn.style.backgroundColor = "transparent";
                }, 1500);
            });
        });

        wrapper.appendChild(btn);
        return wrapper;
    }

    // --- Detection Logic ---

    function findAndInject() {
        // Find both turn containers (Full mode) and Overview containers (Embedded mode)
        const containers = document.querySelectorAll('.CKgc1d, .OZ9ddf, .Pqkn2e');

        containers.forEach((container) => {
            // Find the interaction row where Share/Like buttons live
            // We look for containers containing elements with "feedback" or "Share" labels
            const interactionBar = container.querySelector('.zkL70c, .x2qcTc, .KXMsz') ||
                                   container.querySelector('button[aria-label*="feedback"], button[aria-label*="Share"]')?.closest('div');

            if (interactionBar && !interactionBar.querySelector('.md-copy-wrapper')) {
                const markdown = getMarkdownFromTurn(container);

                if (markdown && markdown.length > 20) {
                    console.log(`%c${TAG} AI Content Found. Logging Markdown...`, "color: #fbbc04; font-weight: bold;");
                    console.log(markdown);

                    const iconBtn = createIconButton(markdown);
                    interactionBar.appendChild(iconBtn);
                }
            }
        });
    }

    // High frequency observation to handle the "Generating..." phase transition
    const observer = new MutationObserver(findAndInject);
    observer.observe(document.body, { childList: true, subtree: true });

    findAndInject();

})();
