export const templateZip = (template, mapping = {}) => {
    const keys = Object.keys(mapping);
    const formatTemplate = template.replace(/\n*/g, '').replace(/[ ]+/g, ' ');
    return keys.reduce((t, key) => t.replace(new RegExp(`\\{${key}\\}`, 'g'), mapping[key]), formatTemplate);
};
// eslint-disable-next-line max-lines-per-function
export const createMicroElementTemplate = (microName, options) => {
    const { initHtml = '', initStyle = '', linkToStyles = [] } = options;
    const ElementName = `Micro${microName.replace(/[^A-Za-z]*/g, '')}Element`;
    return templateZip(`
    (function() {
      let initStyle = '{initStyle}';
      let initHtml = '{initHtml}';
      class ${ElementName} extends HTMLElement {
        constructor() {
          super();
          const shadow = this.attachShadow({ mode: 'open' });
          const head = this.createHead();
          shadow.appendChild(head);
          shadow.appendChild(this.createBody());
          this.appendStyleNode(head);
          initStyle = '';
          initHtml = '';
        }

        createHead() {
          const head = document.createElement('div');
          const _appendChild = head.appendChild.bind(head);
          head.setAttribute('data-app', 'head');
          head.innerHTML = initStyle;
          return head;
        }

        createBody() {
          const body = document.createElement('div');
          body.setAttribute('data-app', 'body');
          body.innerHTML = initHtml;
          return body;
        }

        appendStyleNode(container) {
          const beforeNode = container.firstChild;
          {linkToStyles}.forEach(function(styleText) {
            const style = document.createElement('style');
            style.appendChild(document.createTextNode(styleText));
            container.insertBefore(style, beforeNode);
          });
        }
      }
      customElements.define('${microName}-tag', ${ElementName});
    })();
  `, {
        initStyle: initStyle.replace(/'/g, '\'').replace(/\n/g, ''),
        initHtml: initHtml.replace(/'/g, '\'').replace(/\n/g, ''),
        linkToStyles: JSON.stringify(linkToStyles)
    });
};
export const serializableAssets = (entrypoints, ignores = []) => {
    const staticAssets = { js: [], links: [] };
    Object.keys(entrypoints).forEach((key) => {
        if (ignores.includes(key)) {
            return;
        }
        const { js = [], css = [] } = entrypoints[key];
        staticAssets.js.push(...js);
        staticAssets.links.push(...css);
    });
    return staticAssets;
};