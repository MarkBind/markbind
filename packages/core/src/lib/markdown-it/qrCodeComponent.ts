import * as qr from 'qr-image';

class QrCodeComponent {
  static changeSvgAttributes(svgString: string, attrName: string, attrValue: string): string {
    return svgString.replace(/<path/g, `<path ${attrName}="${attrValue}"`);
  }

  static addBackgroundLayers(svg: string, attrs: Record<string, string>): string {
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

  static generateQRCodeSync(attrs: Record<string, string>): string {
    const stringData = attrs.data || '';
    const options: qr.Options = {
      ec_level: attrs.ec_level as qr.ec_level || 'M',
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

  static render(attrs: Record<string, string>): string {
    return QrCodeComponent.generateQRCodeSync(attrs);
  }
}

export { QrCodeComponent };
