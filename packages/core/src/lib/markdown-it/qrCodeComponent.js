"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrCodeComponent = void 0;
const qr = __importStar(require("qr-image"));
class QrCodeComponent {
    static changeSvgAttributes(svgString, attrName, attrValue) {
        return svgString.replace(/<path/g, `<path ${attrName}="${attrValue}"`);
    }
    static addBackgroundLayers(svg, attrs) {
        const layers = {
            backgroundColor: attrs.backgroundColor
                ? `<rect width="100%" height="100%" fill="${attrs.backgroundColor}"></rect>`
                : null,
            image: attrs.image
                ? `<image href="${attrs.image}" style="opacity:${attrs.imageOpacity || 1}" 
          width="100%" height="100%"></image>`
                : null,
        };
        const newLayers = Object.values(layers).filter(Boolean).join('');
        if (newLayers) {
            const svgTagEnd = svg.indexOf('>') + 1;
            const newSvg = [svg.slice(0, svgTagEnd), newLayers, svg.slice(svgTagEnd)].join('');
            return newSvg;
        }
        return svg;
    }
    static generateQRCodeSync(attrs) {
        const stringData = attrs.data || '';
        const options = {
            ec_level: attrs.ec_level || 'M',
            type: 'svg',
            size: parseInt(attrs.size, 10) || 5,
            margin: parseInt(attrs.margin, 10) || 4,
        };
        const qrSvgBuffer = qr.imageSync(stringData, options);
        let qrSvg = qrSvgBuffer.toString();
        qrSvg = QrCodeComponent.addBackgroundLayers(qrSvg, attrs);
        const svgAttributes = ['stroke', 'stroke-linecap', 'stroke-linejoin', 'fill', 'stroke-width', 'fill'];
        svgAttributes.forEach((attr) => {
            if (attrs[attr]) {
                qrSvg = QrCodeComponent.changeSvgAttributes(qrSvg, attr, attrs[attr]);
            }
        });
        return qrSvg;
    }
    static render(attrs) {
        return QrCodeComponent.generateQRCodeSync(attrs);
    }
}
exports.QrCodeComponent = QrCodeComponent;
//# sourceMappingURL=qrCodeComponent.js.map