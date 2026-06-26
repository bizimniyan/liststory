(function () {
    const template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host { display: block; width: 100%; height: 100%; }
            .wrap { font-family: "72", Arial, sans-serif; height: 100%; box-sizing: border-box; padding: 12px; overflow: auto; }
            .title { font-weight: 700; margin: 0 0 10px 0; }
            .search { width: 100%; box-sizing: border-box; margin: 0 0 10px 0; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; }
            ul { list-style: none; margin: 0; padding: 0; }
            li { }
            a { text-decoration: none; cursor: pointer; word-break: break-word; }
            .meta { color: #888; font-size: 11px; margin-top: 2px; }
            .state { color: #888; font-size: 13px; padding: 8px 0; }
            .error { color: #bb0000; font-size: 13px; padding: 8px 0; white-space: pre-wrap; }
        </style>
        <div class="wrap" id="wrap">
            <h3 class="title" id="title"></h3>
            <input class="search" id="search" type="text" placeholder="Ara…" style="display:none;" />
            <div id="content"><div class="state">Builder panelinden API URL girin.</div></div>
        </div>
    `;

    class StoryList extends HTMLElement {
        constructor() {
            super();
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
            this._wrapEl = shadowRoot.getElementById("wrap");
            this._titleEl = shadowRoot.getElementById("title");
            this._searchEl = shadowRoot.getElementById("search");
            this._contentEl = shadowRoot.getElementById("content");
            this._stories = [];
            this._origin = "";
            this._searchEl.addEventListener("input", () => this.paint());
        }

        async onCustomWidgetAfterUpdate(changedProps) {
            // veri ile ilgili degisiklik -> yeniden cek
            if ("repositoryUrl" in changedProps) {
                this.render();
                return;
            }
            // sadece format degisikligi -> yeniden cizmek yeter (tekrar fetch yok)
            this.applyStyles();
            this.paint();
        }

        refresh() {
            this.render();
        }

        // --- property okuyucular (guvenli defaultlarla) ---
        get _title() { return this.title != null ? this.title : "Story'ler"; }
        get _fontSize() { return num(this.fontSize, 14); }
        get _textColor() { return str(this.textColor, "#0a6ed1"); }
        get _fontWeight() { return str(this.fontWeight, "normal"); }
        get _underline() { return bool(this.underline, false); }
        get _transparentBg() { return bool(this.transparentBg, false); }
        get _bg() { return this._transparentBg ? "transparent" : str(this.backgroundColor, "#ffffff"); }
        get _hoverColor() { return str(this.hoverColor, "#f5f7fa"); }
        get _showBorders() { return bool(this.showBorders, true); }
        get _rowPadding() { return num(this.rowPadding, 8); }
        get _showMeta() { return bool(this.showMeta, true); }
        get _sortBy() { return str(this.sortBy, "none"); }
        get _openInNewTab() { return bool(this.openInNewTab, true); }
        get _showSearch() { return bool(this.showSearch, false); }
        get _titleColor() { return str(this.titleColor, "#1a1a1a"); }
        get _titleSize() { return num(this.titleSize, 16); }

        applyStyles() {
            this._wrapEl.style.backgroundColor = this._bg;
            this.style.backgroundColor = this._bg;
            this._titleEl.style.color = this._titleColor;
            this._titleEl.style.fontSize = this._titleSize + "px";
            this._titleEl.textContent = this._title;
            this._titleEl.style.display = this._title ? "block" : "none";
            this._searchEl.style.display = this._showSearch ? "block" : "none";
        }

        async render() {
            this.applyStyles();
            const url = (this.repositoryUrl || "").trim();
            if (!url) {
                this._contentEl.innerHTML = '<div class="state">Builder panelinden API URL girin.</div>';
                return;
            }
            this._contentEl.innerHTML = '<div class="state">Yükleniyor…</div>';
            try {
                const resp = await fetch(url, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" }
                });
                if (!resp.ok) throw new Error("HTTP " + resp.status + " " + resp.statusText);
                const data = await resp.json();
                const items = Array.isArray(data && data.value) ? data.value : [];
                this._stories = items.filter(it => it && it.resourceType === "STORY");
                try { this._origin = new URL(url, window.location.href).origin; }
                catch (e) { this._origin = window.location.origin; }
                this.paint();
            } catch (e) {
                this._contentEl.innerHTML =
                    '<div class="error">Yüklenemedi:\n' + String(e && e.message ? e.message : e) + "</div>";
            }
        }

        // veriyi tekrar cekmeden mevcut listeyi cizer (format/arama/siralama)
        paint() {
            let list = this._stories.slice();
            if (!list.length) {
                this._contentEl.innerHTML = '<div class="state">Bu klasörde story bulunamadı.</div>';
                return;
            }

            // arama filtresi
            if (this._showSearch) {
                const q = (this._searchEl.value || "").toLowerCase().trim();
                if (q) list = list.filter(s => (s.name || "").toLowerCase().indexOf(q) !== -1);
            }

            // siralama
            const sortBy = this._sortBy;
            if (sortBy === "name") {
                list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "tr"));
            } else if (sortBy === "modified") {
                list.sort((a, b) => new Date(b.modifiedTime || 0) - new Date(a.modifiedTime || 0));
            }

            if (!list.length) {
                this._contentEl.innerHTML = '<div class="state">Eşleşen story yok.</div>';
                return;
            }

            const fontSize = this._fontSize;
            const textColor = this._textColor;
            const fontWeight = this._fontWeight;
            const underline = this._underline;
            const showBorders = this._showBorders;
            const rowPad = this._rowPadding;
            const showMeta = this._showMeta;
            const hoverColor = this._hoverColor;
            const newTab = this._openInNewTab;
            const origin = this._origin;

            const ul = document.createElement("ul");
            list.forEach(s => {
                const li = document.createElement("li");
                li.style.padding = rowPad + "px 6px";
                li.style.borderBottom = showBorders ? "1px solid #eee" : "none";
                li.addEventListener("mouseenter", () => { li.style.background = hoverColor; });
                li.addEventListener("mouseleave", () => { li.style.background = ""; });

                const a = document.createElement("a");
                let href = s.openURL || "";
                if (href && !/^https?:\/\//i.test(href)) {
                    href = origin + (href.charAt(0) === "/" ? "" : "/") + href;
                }
                a.textContent = s.name || s.objectId || s.resourceId || "(adsız)";
                a.href = href;
                if (newTab) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
                a.style.color = textColor;
                a.style.fontSize = fontSize + "px";
                a.style.fontWeight = fontWeight;
                a.style.textDecoration = underline ? "underline" : "none";
                li.appendChild(a);

                if (showMeta && (s.modifiedBy || s.modifiedTime)) {
                    const meta = document.createElement("div");
                    meta.className = "meta";
                    const when = s.modifiedTime ? new Date(s.modifiedTime).toLocaleString() : "";
                    meta.textContent = (s.modifiedBy ? s.modifiedBy : "") + (when ? " · " + when : "");
                    li.appendChild(meta);
                }
                ul.appendChild(li);
            });

            this._contentEl.innerHTML = "";
            this._contentEl.appendChild(ul);
        }
    }

    function num(v, d) { const n = parseFloat(v); return isNaN(n) ? d : n; }
    function str(v, d) { return (v == null || v === "") ? d : String(v); }
    function bool(v, d) { return (v == null) ? d : (v === true || v === "true"); }

    customElements.define("custom-story-list", StoryList);
})();
