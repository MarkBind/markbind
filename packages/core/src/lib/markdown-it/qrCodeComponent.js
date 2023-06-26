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
const qr = __importStar(require("qr-image"));
class qrCodeComponent {
    /**
     * Generates a QR code synchronously.
     * The QR code is created as an SVG.
     * The size, error correction level, and color are defined by the provided options.
     *
     * @param attrs Data to encode in the QR code and options for the QR code
     * @returns String containing SVG of the QR code
     */
    static generateQRCodeSync(attrs) {
        // Get the data to encode in the QR code
        let stringData = attrs.data || '';
        // Get the options for the QR code
        let options = {
            ec_level: attrs.ec_level || 'M',
            type: 'svg',
            size: parseInt(attrs.size) || 5,
            margin: parseInt(attrs.margin) || 4
        };
        // Generate the QR code
        let qrSvgBuffer = qr.imageSync(stringData, options);
        // Convert the Buffer to a string
        let qrSvg = qrSvgBuffer.toString();
        // Return the SVG as a string
        return qrSvg;
    }
    render(attrs) {
        const qrSvg = qrCodeComponent.generateQRCodeSync(attrs);
        return qrSvg;
    }
}
exports.default = qrCodeComponent;
//# sourceMappingURL=qrCodeComponent.js.map