import * as qr from 'qr-image';

export default class qrCodeComponent {
    /**
     * Generates a QR code synchronously.
     * The QR code is created as an SVG.
     * The size, error correction level, and color are defined by the provided options.
     *
     * @param attrs Data to encode in the QR code and options for the QR code
     * @returns String containing SVG of the QR code
     */
    static generateQRCodeSync(attrs: Record<string, string>): string {
        // Get the data to encode in the QR code
        let stringData = attrs.data || '';

        // Get the options for the QR code
        let options: qr.Options = {
            ec_level: attrs.ec_level as qr.ec_level || 'M',
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

    render(attrs: Record<string, string>): string {
        const qrSvg = qrCodeComponent.generateQRCodeSync(attrs);
        return qrSvg;
    }
}
