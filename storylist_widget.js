(function () {
  // ---- Builder panel (sağ panel) için ayarlar arayüzü ----
  const builderTemplate = document.createElement("template");
  builderTemplate.innerHTML = `
    <style>
      .form { font-family: "72", Arial, sans-serif; font-size: 13px; padding: 8px; }
      .row { margin-bottom: 12px; display: flex; flex-direction: column; }
      label { margin-bottom: 4px; color: #333; font-weight: 600; }
      input { padding: 6px 8px; border: 1px solid #bbb; border-radius: 4px; font-size: 13px; }
      textarea { padding: 6px 8px; border: 1px solid #bbb; border-radius: 4px; font-size: 12px; min-height: 70px; resize: vertical; }
    </style>
    <div class="form">
      <div class="row">
        <label>Başlık</label>
        <input id="title" type="text" />
      </div>
      <div class="row">
        <label>File Repository API URL</label>
        <textarea id="repositoryUrl" placeholder="https://.../api/v1/filerepository/Resources?$filter=..."></textarea>
      </div>
    </div>
  `;

  class StoryListBuilder extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.appendChild(builderTemplate.content.cloneNode(true));
      this._title = this._shadow.getElementById("title");
      this._url = this._shadow.getElementById("repositoryUrl");
      this._title.addEventListener("change", () => this._emit());
      this._url.addEventListener("change", () => this._emit());
    }
    _emit() {
      this.dispatchEvent(
        new CustomEvent("propertiesChanged", {
          detail: {
            properties: {
              title: this._title.value,
              repositoryUrl: this._url.value,
            },
          },
        })
      );
    }
    set title(v) { this._title.value = v || ""; }
    get title() { return this._title.value; }
    set repositoryUrl(v) { this._url.value = v || ""; }
    get repositoryUrl() { return this._url.value; }
  }
  customElements.define("com-dalgakiran-storylist-builder", StoryListBuilder);

  // ---- Ana widget ----
  const tmpl = document.createElement("template");
  tmpl.innerHTML = `
    <style>
      :host { display: block; height: 100%; box-sizing: border-box; }
      .wrap {
        font-family: "72", Arial, sans-serif;
        height: 100%; box-sizing: border-box;
        padding: 12px; overflow: auto; color: #1a1a1a;
      }
      .title { font-size: 16px; font-weight: 700; margin: 0 0 10px 0; }
      ul { list-style: none; margin: 0; padding: 0; }
      li { padding: 8px 6px; border-bottom: 1px solid #eee; }
      li:hover { background: #f5f7fa; }
      a {
        color: #0a6ed1; text-decoration: none; font-size: 14px;
        cursor: pointer; word-break: break-word;
      }
      a:hover { text-decoration: underline; }
      .meta { color: #888; font-size: 11px; margin-top: 2px; }
      .state { color: #888; font-size: 13px; padding: 8px 0; }
      .error { color: #bb0000; font-size: 13px; padding: 8px 0; white-space: pre-wrap; }
    </style>
    <div class="wrap">
      <h3 class="title" id="title"></h3>
      <div id="content"><div class="state">Yükleniyor…</div></div>
    </div>
  `;

  class StoryList extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.appendChild(tmpl.content.cloneNode(true));
      this._titleEl = this._shadow.getElementById("title");
      this._contentEl = this._shadow.getElementById("content");
      this._props = {
        title: "Story'ler",
        repositoryUrl: "",
      };
    }

    // SAC lifecycle: widget DOM'a eklendiğinde
    connectedCallback() {
      this._render();
    }

    // SAC lifecycle: builder/script'ten property güncellemesi
    onCustomWidgetBeforeUpdate(changedProps) {
      this._props = Object.assign({}, this._props, changedProps);
    }
    onCustomWidgetAfterUpdate(changedProps) {
      if ("title" in changedProps || "repositoryUrl" in changedProps) {
        this._render();
      }
    }

    // Script API: StoryList_1.refresh()
    refresh() {
      this._render();
    }

    _setTitle() {
      this._titleEl.textContent = this._props.title || "";
      this._titleEl.style.display = this._props.title ? "block" : "none";
    }

    async _render() {
      this._setTitle();
      const url = (this._props.repositoryUrl || "").trim();
      if (!url) {
        this._contentEl.innerHTML =
          '<div class="state">Builder panelinden API URL girin.</div>';
        return;
      }
      this._contentEl.innerHTML = '<div class="state">Yükleniyor…</div>';

      try {
        const resp = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!resp.ok) {
          throw new Error("HTTP " + resp.status + " " + resp.statusText);
        }
        const data = await resp.json();
        const items = Array.isArray(data && data.value) ? data.value : [];
        const stories = items.filter(function (it) {
          return it && it.resourceType === "STORY";
        });
        this._renderList(stories, url);
      } catch (e) {
        this._contentEl.innerHTML =
          '<div class="error">Yüklenemedi:\n' +
          String(e && e.message ? e.message : e) +
          "</div>";
      }
    }

    _renderList(stories, sourceUrl) {
      if (!stories.length) {
        this._contentEl.innerHTML =
          '<div class="state">Bu klasörde story bulunamadı.</div>';
        return;
      }

      // openURL göreli path → kaynak URL'in origin'i ile tam URL'e çevir
      let origin = "";
      try {
        origin = new URL(sourceUrl, window.location.href).origin;
      } catch (e) {
        origin = window.location.origin;
      }

      const ul = document.createElement("ul");
      stories.forEach(function (s) {
        const li = document.createElement("li");
        const a = document.createElement("a");

        let href = s.openURL || "";
        if (href && !/^https?:\/\//i.test(href)) {
          href = origin + (href.charAt(0) === "/" ? "" : "/") + href;
        }

        a.textContent = s.name || s.objectId || s.resourceId || "(adsız)";
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        li.appendChild(a);

        if (s.modifiedBy || s.modifiedTime) {
          const meta = document.createElement("div");
          meta.className = "meta";
          const when = s.modifiedTime
            ? new Date(s.modifiedTime).toLocaleString()
            : "";
          meta.textContent =
            (s.modifiedBy ? s.modifiedBy : "") + (when ? " · " + when : "");
          li.appendChild(meta);
        }
        ul.appendChild(li);
      });

      this._contentEl.innerHTML = "";
      this._contentEl.appendChild(ul);
    }
  }

  customElements.define("com-dalgakiran-storylist", StoryList);
})();
