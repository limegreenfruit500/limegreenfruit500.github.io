// generate_html.js
// GitHub Copilot
// Script to generate an "Introduction HTML" view and a highlighted HTML source block
(function () {
    // Helpers
    function $(sel, ctx = document) { return ctx.querySelector(sel); }
    function $all(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
    function escapeHtml(s = '') {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function loadHighlightJS() {
        if (window.hljsLoaded) return Promise.resolve();
        window.hljsLoaded = true;
        return new Promise((resolve, reject) => {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css';
            document.head.appendChild(css);

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load highlight.js'));
            document.head.appendChild(script);
        });
    }

    // Find form and title
    const form = document.querySelector('form');
    const titleH2 = document.querySelector('h2');

    if (!form) {
        // nothing to do
        return;
    }

    // Create Generate HTML button and insert after existing buttons (append to form)
    const genBtn = document.createElement('button');
    genBtn.type = 'button';
    genBtn.textContent = 'Generate HTML';
    genBtn.id = 'generate-html-btn';
    genBtn.style.marginLeft = '8px';
    // Try to place near other buttons: append to last element with type=button or to form
    const buttonContainer = (function () {
        // common patterns: div.buttons, .form-actions, .actions
        return form.querySelector('.buttons') ||
                     form.querySelector('.form-actions') ||
                     form.querySelector('.actions') ||
                     null;
    })();
    if (buttonContainer) {
        buttonContainer.appendChild(genBtn);
    } else {
        // append to form (will come after form fields)
        form.appendChild(genBtn);
    }

    // Map common field names to logical values
    function gatherFormData(formEl) {
        const data = {};
        // Use FormData to support inputs/select/textarea
        const fd = new FormData(formEl);
        for (const [key, val] of fd.entries()) {
            // If multiple inputs share same name, FormData will give last; convert multiple into arrays
            if (data.hasOwnProperty(key)) {
                if (!Array.isArray(data[key])) data[key] = [data[key]];
                data[key].push(val);
            } else {
                data[key] = val;
            }
        }

        // Also capture plain inputs not named (fallback)
        $all('input, textarea, select', formEl).forEach(inp => {
            if (!inp.name) {
                const k = inp.id || inp.getAttribute('data-field') || null;
                if (k) data[k] = inp.value;
            }
        });

        return data;
    }

    // Build sensible HTML string from form data
    function buildHtmlFromData(data) {
        // Helpers to pick fields by possible names
        const pick = (names) => {
            for (const n of names) {
                if (data[n]) return data[n];
            }
            return undefined;
        };

        // Name/display
        const first = pick(['firstName', 'firstname', 'first', 'given']);
        const last = pick(['lastName', 'lastname', 'last', 'family']);
        const nick = pick(['nickname', 'nick', 'displayNick']);
        const display = pick(['displayName', 'name', 'fullname', 'fullName']) ||
                                        (first || last ? `${first || ''} ${last || ''}`.trim() : undefined);

        // Compose h3: include nickname in quotes if present
        let h3 = display || 'Your Name';
        if (!display && nick) h3 = nick;
        if (display && nick && !display.includes(nick)) {
            // show nickname in quotes
            const parts = (display.split(' ') || []);
            h3 = `${parts[0] || display} "${nick}" ${parts.slice(1).join(' ')}`.trim();
        }

        // Pronouns or stars
        const extras = [];
        const pronouns = pick(['pronouns', 'pro']);
        if (pronouns) extras.push(pronouns);
        const badge = pick(['badge','rank','class','role']);
        if (badge) extras.push(badge);

        if (extras.length) h3 += ' ★ ' + extras.join(' • ');

        // Image
        const image = pick(['imageUrl','img','avatar','photo','headshot','image']);
        const caption = pick(['imageCaption','caption','figcaption','imageAlt','alt']);

        // Paragraphs
        const bio = pick(['personalBackground','bio','about','background','story']);
        const captionText = caption;

        // Lists detection: any field with comma/semicolon-separated or array values
        const lists = [];
        // Known list field names
        const knownLists = ['highlights','bullets','items','things','hobbies','hobby','skills','interests','favorites'];
        knownLists.forEach(name => {
            if (data[name]) {
                let val = data[name];
                if (Array.isArray(val)) {
                    val = val.join(',');
                }
                lists.push({ title: name, items: splitToList(val) });
            }
        });

        // Also catch any field that looks like "item1, item2" or contains newline separated values
        Object.keys(data).forEach(k => {
            if (knownLists.includes(k)) return;
            const v = data[k];
            if (!v) return;
            if (Array.isArray(v) && v.length > 1) {
                lists.push({ title: k, items: v.map(String) });
            } else if (typeof v === 'string' && (v.includes(',') || v.includes('\n') || v.includes(';'))) {
                const items = splitToList(v);
                if (items.length > 1) lists.push({ title: k, items });
            }
        });

        // If no detected lists, try to collect numbered fields like item1, item2, etc.
        const numbered = {};
        Object.keys(data).forEach(k => {
            const m = k.match(/^(?:item|bullet|point|list)(\d+)$/i);
            if (m) {
                numbered[m[1]] = numbered[m[1]] || [];
                numbered[m[1]].push(data[k]);
            }
        });
        const numberedKeys = Object.keys(numbered).sort((a,b)=>a-b);
        if (numberedKeys.length) {
            const items = numberedKeys.map(k => numbered[k][0]);
            lists.push({ title: 'items', items });
        }

        // Build HTML string
        let html = '';
        html += `<h2>Introduction HTML</h2>\n`;
        html += `<h3>${escapeHtml(h3)}</h3>\n`;

        if (image) {
            html += `<figure>\n`;
            html += `    <img src="${escapeHtml(image)}" alt="${escapeHtml(captionText || h3)}" />\n`;
            if (captionText) {
                html += `    <figcaption>${escapeHtml(captionText)}</figcaption>\n`;
            }
            html += `</figure>\n`;
        }

        if (bio) {
            // split paragraphs by double newlines
            const paras = String(bio).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
            paras.forEach(p => {
                html += `<p>${escapeHtml(p)}</p>\n`;
            });
        }

        // Add lists as <ul>
        lists.forEach(list => {
            const title = prettifyTitle(list.title);
            html += `<h4>${escapeHtml(title)}</h4>\n`;
            html += `<ul>\n`;
            list.items.forEach(item => {
                html += `    <li>${escapeHtml(item)}</li>\n`;
            });
            html += `</ul>\n`;
        });

        // If nothing else, include raw dump for completeness
        if (!image && !bio && lists.length === 0) {
            html += `<p><strong>No recognizable fields found.</strong> Raw form data included below as attributes.</p>\n`;
            html += `<ul>\n`;
            Object.keys(data).forEach(k => {
                html += `    <li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(data[k]))}</li>\n`;
            });
            html += `</ul>\n`;
        }

        return html;
    }

    function splitToList(val) {
        if (!val) return [];
        return String(val)
            .split(/\r?\n|;|,/)
            .map(s => s.trim())
            .filter(Boolean);
    }

    function prettifyTitle(raw) {
        if (!raw) return '';
        return raw.replace(/[_-]/g, ' ')
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                            .replace(/\b\w/g, c => c.toUpperCase());
    }

    // Handler
    genBtn.addEventListener('click', async () => {
        const data = gatherFormData(form);
        const htmlString = buildHtmlFromData(data);

        // Replace H2 text on page if present
        if (titleH2) titleH2.textContent = 'Introduction HTML';

        // Create container to replace the form
        const container = document.createElement('div');
        container.id = 'introduction-html-output';

        // Rendered HTML preview (actual elements)
        const preview = document.createElement('div');
        preview.id = 'preview';
        preview.innerHTML = htmlString;
        container.appendChild(preview);

        // Create code block with escaped HTML for copying
        const section = document.createElement('section');
        section.style.marginTop = '1rem';

        const pre = document.createElement('pre');
        pre.style.maxHeight = '60vh';
        pre.style.overflow = 'auto';

        const code = document.createElement('code');
        code.className = 'language-html';
        code.textContent = htmlString; // textContent keeps it literal; will be highlighted by hljs

        pre.appendChild(code);
        section.appendChild(pre);
        container.appendChild(section);

        // Replace form with container
        form.parentNode.replaceChild(container, form);

        // Load highlight.js and highlight
        try {
            await loadHighlightJS();
            if (window.hljs && typeof window.hljs.highlightElement === 'function') {
                window.hljs.highlightElement(code);
            } else if (window.hljs && window.hljs.highlightAll) {
                window.hljs.highlightAll();
            }
        } catch (e) {
            // fail silently; code block will still show un-highlighted HTML
            console.warn('Highlight.js failed to load:', e);
        }
    });
})();