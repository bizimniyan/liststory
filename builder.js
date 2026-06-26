(function () {
    const template = document.createElement("template");
    template.innerHTML = `
    <style>
        #root { font-family: "72", Arial, sans-serif; font-size: 13px; padding: 4px 2px; }
        .grp { border: 1px solid #e0e0e0; border-radius: 6px; padding: 8px 10px; margin: 0 0 12px 0; }
        .grp > .h { font-weight: 700; color: #0a6ed1; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: .3px; }
        .row { margin: 0 0 10px 0; display: flex; flex-direction: column; }
        .row.inline { flex-direction: row; align-items: center; justify-content: space-between; }
        label { margin-bottom: 4px; color: #333; font-weight: 600; }
        .row.inline label { margin-bottom: 0; }
        input[type=text], textarea, select { padding: 6px 8px; width: 100%; box-sizing: border-box; border: 1px solid #bbb; border-radius: 4px; font-size: 13px; }
        textarea { height: 7rem; resize: vertical; font-size: 12px; }
        input[type=number] { padding: 6px 8px; width: 90px; box-sizing: border-box; border: 1px solid #bbb; border-radius: 4px; font-size: 13px; }
        input[type=color] { width: 44px; height: 28px; border: 1px solid #bbb; border-radius: 4px; padding: 0; cursor: pointer; }
        input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; }
        button { padding: 8px 14px; width: 100%; background: #0a6ed1; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600; }
        button:hover { background: #085caf; }
    </style>
    <div id="root">
        <div class="grp">
            <div class="h">Veri</div>
            <div class="row">
                <label for="title">Başlık</label>
                <input id="title" type="text" />
            </div>
            <div class="row">
                <label for="repositoryUrl">File Repository API URL</label>
                <textarea id="repositoryUrl" placeholder="https://.../api/v1/filerepository/Resources?$filter=..."></textarea>
            </div>
            <div class="row">
                <label for="sortBy">Sıralama</label>
                <select id="sortBy">
                    <option value="none">Varsayılan (API sırası)</option>
                    <option value="name">İsme göre (A→Z)</option>
                    <option value="modified">Tarihe göre (yeni→eski)</option>
                </select>
            </div>
        </div>

        <div class="grp">
            <div class="h">Yazı</div>
            <div class="row inline">
                <label for="textColor">Link rengi</label>
                <input id="textColor" type="color" />
            </div>
            <div class="row inline">
                <label for="fontSize">Yazı boyutu (px)</label>
                <input id="fontSize" type="number" min="8" max="48" />
            </div>
            <div class="row inline">
                <label for="fontWeight">Kalın yazı</label>
                <input id="fontWeight" type="checkbox" />
            </div>
            <div class="row inline">
                <label for="underline">Altı çizili</label>
                <input id="underline" type="checkbox" />
            </div>
        </div>

        <div class="grp">
            <div class="h">Başlık görünümü</div>
            <div class="row inline">
                <label for="titleColor">Başlık rengi</label>
                <input id="titleColor" type="color" />
            </div>
            <div class="row inline">
                <label for="titleSize">Başlık boyutu (px)</label>
                <input id="titleSize" type="number" min="10" max="48" />
            </div>
        </div>

        <div class="grp">
            <div class="h">Arka plan & Satır</div>
            <div class="row inline">
                <label for="transparentBg">Şeffaf arka plan</label>
                <input id="transparentBg" type="checkbox" />
            </div>
            <div class="row inline">
                <label for="backgroundColor">Arka plan rengi</label>
                <input id="backgroundColor" type="color" />
            </div>
            <div class="row inline">
                <label for="hoverColor">Üzerine gelince renk</label>
                <input id="hoverColor" type="color" />
            </div>
            <div class="row inline">
                <label for="rowPadding">Satır aralığı (px)</label>
                <input id="rowPadding" type="number" min="0" max="40" />
            </div>
            <div class="row inline">
                <label for="showBorders">Satır çizgileri</label>
                <input id="showBorders" type="checkbox" />
            </div>
        </div>

        <div class="grp">
            <div class="h">Seçenekler</div>
            <div class="row inline">
                <label for="showMeta">Meta bilgi (kişi · tarih)</label>
                <input id="showMeta" type="checkbox" />
            </div>
            <div class="row inline">
                <label for="showSearch">Arama kutusu</label>
                <input id="showSearch" type="checkbox" />
            </div>
            <div class="row inline">
                <label for="openInNewTab">Yeni sekmede aç</label>
                <input id="openInNewTab" type="checkbox" />
            </div>
        </div>

        <button id="button">Uygula</button>
    </div>
    `;

    class Builder extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            const $ = (id) => this._shadowRoot.getElementById(id);
            this.$ = $;
            this._button = $("button");
            this._button.addEventListener("click", () => this._apply());
        }

        _apply() {
            const $ = this.$;
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        title: $("title").value,
                        repositoryUrl: $("repositoryUrl").value,
                        sortBy: $("sortBy").value,
                        textColor: $("textColor").value,
                        fontSize: parseInt($("fontSize").value, 10) || 14,
                        fontWeight: $("fontWeight").checked ? "bold" : "normal",
                        underline: $("underline").checked,
                        titleColor: $("titleColor").value,
                        titleSize: parseInt($("titleSize").value, 10) || 16,
                        transparentBg: $("transparentBg").checked,
                        backgroundColor: $("backgroundColor").value,
                        hoverColor: $("hoverColor").value,
                        rowPadding: parseInt($("rowPadding").value, 10) || 0,
                        showBorders: $("showBorders").checked,
                        showMeta: $("showMeta").checked,
                        showSearch: $("showSearch").checked,
                        openInNewTab: $("openInNewTab").checked
                    }
                }
            }));
        }

        async onCustomWidgetBeforeUpdate(changedProps) {}

        async onCustomWidgetAfterUpdate(p) {
            const $ = this.$;
            if ("title" in p) $("title").value = p.title || "";
            if ("repositoryUrl" in p) $("repositoryUrl").value = p.repositoryUrl || "";
            if ("sortBy" in p) $("sortBy").value = p.sortBy || "none";
            if ("textColor" in p) $("textColor").value = toHex(p.textColor, "#0a6ed1");
            if ("fontSize" in p) $("fontSize").value = p.fontSize != null ? p.fontSize : 14;
            if ("fontWeight" in p) $("fontWeight").checked = (p.fontWeight === "bold");
            if ("underline" in p) $("underline").checked = !!p.underline;
            if ("titleColor" in p) $("titleColor").value = toHex(p.titleColor, "#1a1a1a");
            if ("titleSize" in p) $("titleSize").value = p.titleSize != null ? p.titleSize : 16;
            if ("transparentBg" in p) $("transparentBg").checked = !!p.transparentBg;
            if ("backgroundColor" in p) $("backgroundColor").value = toHex(p.backgroundColor, "#ffffff");
            if ("hoverColor" in p) $("hoverColor").value = toHex(p.hoverColor, "#f5f7fa");
            if ("rowPadding" in p) $("rowPadding").value = p.rowPadding != null ? p.rowPadding : 8;
            if ("showBorders" in p) $("showBorders").checked = p.showBorders !== false;
            if ("showMeta" in p) $("showMeta").checked = p.showMeta !== false;
            if ("showSearch" in p) $("showSearch").checked = !!p.showSearch;
            if ("openInNewTab" in p) $("openInNewTab").checked = p.openInNewTab !== false;
        }

        async onCustomWidgetResize(width, height) {}
        async onCustomWidgetDestroy() {}
    }

    // color input sadece #rrggbb kabul eder; gelen degeri normalize et
    function toHex(v, d) {
        if (!v) return d;
        const s = String(v).trim();
        if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
        if (/^#[0-9a-fA-F]{3}$/.test(s)) {
            return "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
        }
        return d;
    }

    customElements.define("custom-story-list-builder", Builder);
})();
