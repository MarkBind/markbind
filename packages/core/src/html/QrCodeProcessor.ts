import cheerio from 'cheerio';
import qr from 'qr-image';
import isString from 'lodash/isString';
import { NodeOrText } from '../utils/node';

/**
 * Class to process QR code custom elements.
 * The element is replaced by a div containing an SVG of the QR code and an optional caption.
 * Attributes of the original element control various aspects of the QR code.
 */
class QrCodeProcessor {
  /**
        * Processes a node, converting it to a div containing a QR code SVG and optional caption.
        * The QR code and its options are defined by the attributes of the node.
        * The options include size, margin, error correction level, color, and background.
        * The original node is replaced by a new div node with the QR code SVG and optional caption.
        *
        * @param node Node to process
        * @returns Processed node with QR code and optional caption
        */
  static process(node: NodeOrText) {
    // Convert the tag name to 'div'
    node.name = 'div';

    if (node.attribs && node.attribs.data) {
      const { data } = node.attribs;

      // Collect QR code options from the node attributes
      const options = {
        size: parseInt(node.attribs.size, 10) || 10,
        margin: parseInt(node.attribs.margin, 10) || 4,
        ecLevel: node.attribs.ecLevel || 'H',
        color: node.attribs.color || 'black',
        background: node.attribs.background || 'white',
        caption: node.attribs.caption || '',
        alt: node.attribs.alt || '',
      };

      // Generate the QR code
      const qrSvg = QrCodeProcessor.generateQRCodeSync(data, options);

      // Prepare the styles as a JavaScript object
      const styles = {
        textAlign: 'center',
        ...node.attribs.style, // Spread operation to merge the styles from node.attribs.style
      };

      // Convert the styles object to a CSS string
      const stylesString = Object.entries(styles).map(([prop, value]) => `${prop}: ${value}`).join('; ');

      // Initialize the wrapper div with the styles
      const $wrapper = cheerio.load(`<div style="${stylesString}"></div>`);

      // Append the generated QR code SVG and the caption (if present) to the wrapper
      $wrapper('div').append(qrSvg);

      if (options.caption) {
        $wrapper('div').append(`<p>${options.caption}</p>`);
      }

      // Append the wrapper div to the node
      cheerio(node).append($wrapper.html());

      return node;
    }

    return node;
  }

  /**
        * Generates a QR code synchronously.
        * The QR code is created as an SVG.
        * The size, margin, error correction level, and color are defined by the provided options.
        *
        * @param data Data to encode in the QR code
        * @param options Options for the QR code
        * @returns String containing SVG of the QR code
        */
  static generateQRCodeSync(data: string, options: any) {
    // Convert the data to a string if it's not already
    let stringData = data;

    if (!isString(data)) {
      stringData = JSON.stringify(data);
    }

    // Generate the QR code
    let qrSvg = qr.imageSync(stringData, {
      type: 'svg', size: options.size, margin: options.margin, ec_level: options.ecLevel,
    });

    // Load the SVG with cheerio
    const $ = cheerio.load(qrSvg, { xmlMode: true });

    // Change the fill color of all path elements (the QR code itself)
    $('path').attr('fill', options.color);

    // Serialize the SVG back to a string
    qrSvg = $.html();

    return qrSvg;
  }
}

export { QrCodeProcessor };
