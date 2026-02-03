"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializableAssets = exports.createMicroElementTemplate = exports.templateZip = void 0;
var tslib_1 = require("tslib");
var templateZip = function (template, mapping) {
    if (mapping === void 0) { mapping = {}; }
    var keys = Object.keys(mapping);
    var formatTemplate = template.replace(/\n*/g, '').replace(/[ ]+/g, ' ');
    return keys.reduce(function (t, key) { return t.replace(new RegExp("\\{".concat(key, "\\}"), 'g'), mapping[key]); }, formatTemplate);
};
exports.templateZip = templateZip;
// eslint-disable-next-line max-lines-per-function
var createMicroElementTemplate = function (microName, options) {
    var _a = options.initHtml, initHtml = _a === void 0 ? '' : _a, _b = options.initStyle, initStyle = _b === void 0 ? '' : _b, _c = options.linkToStyles, linkToStyles = _c === void 0 ? [] : _c;
    var ElementName = "Micro".concat(microName.replace(/[^A-Za-z]*/g, ''), "Element");
    return (0, exports.templateZip)("\n    (function() {\n      let initStyle = '{initStyle}';\n      let initHtml = '{initHtml}';\n      class ".concat(ElementName, " extends HTMLElement {\n        constructor() {\n          super();\n          const shadow = this.attachShadow({ mode: 'open' });\n          const head = this.createHead();\n          shadow.appendChild(head);\n          shadow.appendChild(this.createBody());\n          this.appendStyleNode(head);\n          initStyle = '';\n          initHtml = '';\n        }\n\n        createHead() {\n          const head = document.createElement('div');\n          const _appendChild = head.appendChild.bind(head);\n          head.setAttribute('data-app', 'head');\n          head.innerHTML = initStyle;\n          return head;\n        }\n\n        createBody() {\n          const body = document.createElement('div');\n          body.setAttribute('data-app', 'body');\n          body.innerHTML = initHtml;\n          return body;\n        }\n\n        appendStyleNode(container) {\n          const beforeNode = container.firstChild;\n          {linkToStyles}.forEach(function(styleText) {\n            const style = document.createElement('style');\n            style.appendChild(document.createTextNode(styleText));\n            container.insertBefore(style, beforeNode);\n          });\n        }\n      }\n      customElements.define('").concat(microName, "-tag', ").concat(ElementName, ");\n    })();\n  "), {
        initStyle: initStyle.replace(/'/g, '\'').replace(/\n/g, ''),
        initHtml: initHtml.replace(/'/g, '\'').replace(/\n/g, ''),
        linkToStyles: JSON.stringify(linkToStyles)
    });
};
exports.createMicroElementTemplate = createMicroElementTemplate;
var serializableAssets = function (entrypoints, ignores) {
    if (ignores === void 0) { ignores = []; }
    var staticAssets = { js: [], links: [] };
    Object.keys(entrypoints).forEach(function (key) {
        var _a, _b;
        if (ignores.includes(key)) {
            return;
        }
        var _c = entrypoints[key], _d = _c.js, js = _d === void 0 ? [] : _d, _e = _c.css, css = _e === void 0 ? [] : _e;
        (_a = staticAssets.js).push.apply(_a, tslib_1.__spreadArray([], tslib_1.__read(js), false));
        (_b = staticAssets.links).push.apply(_b, tslib_1.__spreadArray([], tslib_1.__read(css), false));
    });
    return staticAssets;
};
exports.serializableAssets = serializableAssets;