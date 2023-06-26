import * as qr from 'qr-image';

export default class qrCodeComponent {
    
    /**
     * Changes the attributes of an SVG image's path tag.
     *
     * @param svgString Original SVG string
     * @param attrName Name of the attribute to change
     * @param attrValue New value for the attribute
     * @returns Modified SVG string
     */
    static changeSvgAttributes(svgString: string, attrName: string, attrValue: string): string {
        // Add the new attribute to the path tag
        const newSvgString = svgString.replace(/<path/g, `<path ${attrName}="${attrValue}"`);

        // Return the modified SVG string
        return newSvgString;
    }

    /**
    * Adds the background color and image layers to an SVG image.
    *
    * @param svgString Original SVG string
    * @param attrs Attributes including backgroundColor and image URL
    * @returns Modified SVG string
    */
    static addBackgroundLayers(svgString: string, attrs: Record<string, string>): string {
        // Map from layer types to their SVG elements
        const layers = {
            backgroundColor: attrs.backgroundColor ? `<rect width="100%" height="100%" fill="${attrs.backgroundColor}"></rect>` : null,
            image: attrs.image ? `<image href="${attrs.image}" width="100%" height="100%"></image>` : null,
        };

        // Get the new layers, filter out the null ones, and join them into a string
        const newLayers = Object.values(layers).filter(Boolean).join('');

        // If any new layers were provided, add them to the SVG
        if (newLayers) {
            // Find the end of the svg opening tag
            const svgTagEnd = svgString.indexOf('>') + 1;

            // Insert the new layers after the svg opening tag
            svgString = [svgString.slice(0, svgTagEnd), newLayers, svgString.slice(svgTagEnd)].join('');
        }

        // Return the modified SVG string
        return svgString;
    }

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
            margin: parseInt(attrs.margin) || 4,
        };

        // Generate the QR code
        let qrSvgBuffer = qr.imageSync(stringData, options);

        // Convert the Buffer to a string
        let qrSvg = qrSvgBuffer.toString();

        // Add background layers to the SVG
        qrSvg = qrCodeComponent.addBackgroundLayers(qrSvg, attrs);
        
        // List of SVG attributes we want to change
        const svgAttributes = ["stroke", "stroke-linecap", "stroke-linejoin", "fill", "stroke-width", "fill"];

        // If attributes were provided, change them in the SVG
        for (const attr of svgAttributes) {
            if (attrs[attr]) {
                qrSvg = qrCodeComponent.changeSvgAttributes(qrSvg, attr, attrs[attr]);
            }
        }

        // Return the SVG as a string
        return qrSvg;
    }


    render(attrs: Record<string, string>): string {
        const qrSvg = qrCodeComponent.generateQRCodeSync(attrs);
        return qrSvg;
    }
}
