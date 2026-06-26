(function () {
    const template = document.createElement("template");
    template.innerHTML = `
    <style>
        #root { font-family: "72", Arial, sans-serif; font-size: 13px; }
        #root div { margin: 0.5rem; }
        label { display: block; margin-bottom: 4px; color: #333; font-weight: 600; }
        input { padding: 6px 8px; width: 100%; box-sizing: border-box; border: 1px solid #bbb; border-radius: 4px; font-size: 13px; }
        textarea { padding: 6px 8px; width: 100%; box-sizing: border-box; height: 8rem; border: 1px solid #bbb; border-radius: 4px; font-size: 12px; resize: vertical; }
        button { padding: 6px 14px; background: #0a6ed1; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
        button:hover { background: #085caf; }
    </style>
    <div id="root" style="width: 100%; height: 100%;">
        <div>
            <label for="title">Başlık</label>
            <input id="title" type="text" />
        </div>
        <div>
            <label for="repositoryUrl">File Repository API URL</label>
            <textarea id="repositoryUrl" placeholder="https://.../api/v1/filerepository/Resources?$filter=..."></textarea>
        </div>
        <div>
            <button id="button">Uygula</button>
        </div>
    </div>
    `;

    class Builder extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._title = this._shadowRoot.getElementById("title");
            this._url = this._shadowRoot.getElementById("repositoryUrl");
            this._button = this._shadowRoot.getElementById("button");
            this._button.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                    detail: {
                        properties: {
                            title: this._title.value,
                            repositoryUrl: this._url.value
                        }
                    }
                }));
            });
        }

        async onCustomWidgetBeforeUpdate(changedProps) {}

        async onCustomWidgetAfterUpdate(changedProps) {
            if ("title" in changedProps) {
                this._title.value = changedProps.title || "";
            }
            if ("repositoryUrl" in changedProps) {
                this._url.value = changedProps.repositoryUrl || "";
            }
        }

        async onCustomWidgetResize(width, height) {}
        async onCustomWidgetDestroy() {}
    }

    customElements.define("custom-story-list-builder", Builder);
})();
