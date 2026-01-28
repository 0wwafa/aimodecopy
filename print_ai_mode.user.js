// ==UserScript==
// @name         Google AI Markdown Copier - Universal Icon
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  Agnostic injection before Share or Labs icons in Google AI results.
// @author       Zibri
// @author       Robert Sinclair
// @match        https://www.google.com/search?*
// @grant        none
// @run-at       document-end
// @homepageURL  https://0wwafa.github.io/aimodecopy
// @downloadURL  https://0wwafa.github.io/aimodecopy/print_ai_mode.user.js
// @source       https://0wwafa.github.io/aimodecopy
// @updateURL    https://0wwafa.github.io/aimodecopy/print_ai_mode.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const TAG = "[AI-MD-Hook]";

    // Hardcoded SVG path start markers (Google's "Biological Signatures")
    const SIG_SHARE = "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7";
    const SIG_LABS  = "M5.95 19.975C5.33889 19.975";

    /**
     * EXTRACTOR: Locates the answer text and converts to Markdown.
     */
    function getMarkdownFromTurn(anchorElement) {
        // Find the nearest broad container for this specific turn
        const turn = anchorElement.closest('[data-scope-id="turn"], .CKgc1d, .OZ9ddf, .Pqkn2e, .mZJni') || document.body;

        let md = "";
        const elements = turn.querySelectorAll('table, li, [role="heading"], [data-sfc-cp], .Y3BBE, .otQkpb');

        if (elements.length === 0) return null;

        elements.forEach(el => {
            if (el.closest('.md-copy-anchor')) return;

            if (el.getAttribute('role') === 'heading') {
                const level = el.getAttribute('aria-level') || '3';
                md += `\n${'#'.repeat(parseInt(level))} ${el.innerText.trim()}\n\n`;
            } else if (el.tagName === 'TABLE') {
                md += "\n" + parseTable(el) + "\n";
            } else if (el.tagName === 'LI') {
                md += `* ${processInline(el)}\n`;
            } else {
                const line = processInline(el);
                if (line && line.length > 2) md += `${line}\n\n`;
            }
        });

        return md.replace(/\n{3,}/g, '\n\n').trim();
    }

    function processInline(el) {
        let clone = el.cloneNode(true);
        clone.querySelectorAll('svg, button, style, script, [aria-label*="links"], .md-copy-anchor').forEach(n => n.remove());
        clone.querySelectorAll('strong, b, [style*="font-weight: 700"], [style*="font-weight: 600"]').forEach(b => b.innerText = ` **${b.innerText.trim()}** `);
        clone.querySelectorAll('em, i, [style*="font-style: italic"]').forEach(i => i.innerText = ` *${i.innerText.trim()}* `);
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

    /**
     * UI: Create the copy icon button.
     */
    function createCopyIcon(markdown) {
        const wrapper = document.createElement('div');
        wrapper.className = 'md-copy-anchor';
        wrapper.setAttribute('title', 'Copy Markdown');
        wrapper.style.cssText = "display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer; color: #5f6368; flex-shrink: 0; transition: background 0.2s; border-radius: 50%; vertical-align: middle;";

        wrapper.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
        `;

        wrapper.addEventListener('mouseenter', () => wrapper.style.backgroundColor = 'rgba(60, 64, 67, 0.08)');
        wrapper.addEventListener('mouseleave', () => wrapper.style.backgroundColor = 'transparent');

        wrapper.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            navigator.clipboard.writeText(markdown).then(() => {
                const oldColor = wrapper.style.color;
                wrapper.style.color = "#137333";
                setTimeout(() => wrapper.style.color = oldColor, 1500);
            });
        });

        return wrapper;
    }

    /**
     * CORE: Detects Labs or Share SVG and injects button.
     */
    function performUniversalInjection() {
        const svgs = document.querySelectorAll('svg');

        svgs.forEach(svg => {
            const path = svg.querySelector('path');
            if (!path) return;

            const d = path.getAttribute('d') || "";
            // Heuristic check: is this a Share icon or a Labs icon?
            const isTarget = d.startsWith(SIG_SHARE) || d.startsWith(SIG_LABS);

            if (isTarget) {
                // Find the interactive element wrapper (usually an <a> or <button> or <div>)
                const anchor = svg.closest('a') || svg.closest('button') || svg.parentElement;

                // Ensure we don't inject multiple times into the same bar
                const container = anchor.parentElement;
                if (container && !container.querySelector('.md-copy-anchor')) {
                    const md = getMarkdownFromTurn(anchor);
                    if (md) {
                        const copyBtn = createCopyIcon(md);
                        container.insertBefore(copyBtn, anchor);
                    }
                }
            }
        });
    }

    // Monitor for changes (streaming answers or follow-up turns)
    const observer = new MutationObserver(performUniversalInjection);
    observer.observe(document.body, { childList: true, subtree: true });

    // Run initial scan
    performUniversalInjection();

})();
