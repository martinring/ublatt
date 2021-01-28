var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import marked from 'marked';
var Renderer = /** @class */ (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.codespan = function (code) {
        return _super.prototype.codespan.call(this, code);
    };
    return Renderer;
}(marked.Renderer));
export { Renderer };
var Tokenizer = /** @class */ (function (_super) {
    __extends(Tokenizer, _super);
    function Tokenizer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Tokenizer.prototype.codespan = function (src) {
        var match = /^\$(([^\$]|\\\$)*[^\\])\$/.exec(src);
        if (match) {
            return {
                type: "codespan",
                raw: match[0],
                text: match[1].trim()
            };
        }
        else
            return _super.prototype.codespan.call(this, src);
    };
    return Tokenizer;
}(marked.Tokenizer));
export { Tokenizer };
export var options = {
    "gfm": true,
    "headerIds": true,
    "sanitize": true
};
