import PDFDocument from 'pdfkit';

export interface ConsentPdfOptions {
  firstName: string;
  lastName: string;
  email: string;
  signedAt: Date;
  ip: string;
  signatureBase64: string;
  guardianName?: string;
  guardianPhone?: string;
}

export function generateConsentPdf(options: ConsentPdfOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('InsideOut Expressions', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text('Fundación Escuela Tecnológica de Neiva', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('Consentimiento Informado de Tratamiento de Datos', { align: 'center' });
    doc.moveDown();

    // Consent text
    doc.fontSize(10).font('Helvetica').text(
      'Yo, el firmante, autorizo a InsideOut Expressions y a la Fundación Escuela Tecnológica de Neiva ' +
      'al tratamiento de mis datos personales con fines de apoyo psicológico, investigación académica ' +
      'y mejora de los servicios de bienestar estudiantil, de conformidad con la Ley 1581 de 2012 ' +
      'y el Decreto 1377 de 2013 de la República de Colombia. ' +
      'Los datos recopilados serán tratados con confidencialidad y no serán compartidos con terceros ' +
      'sin previo consentimiento, salvo en los casos previstos por la ley.',
      { align: 'justify' },
    );
    doc.moveDown();

    // Signer info
    doc.fontSize(11).font('Helvetica-Bold').text('Datos del firmante');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Nombre: ${options.firstName} ${options.lastName}`);
    doc.text(`Correo: ${options.email}`);
    doc.text(`Fecha y hora: ${options.signedAt.toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
    doc.text(`IP de firma: ${options.ip}`);
    doc.moveDown();

    // Guardian (if minor)
    if (options.guardianName) {
      doc.fontSize(11).font('Helvetica-Bold').text('Acudiente (firmante es menor de edad)');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Nombre del acudiente: ${options.guardianName}`);
      doc.text(`Teléfono del acudiente: ${options.guardianPhone ?? 'No proporcionado'}`);
      doc.moveDown();
    } else {
      doc.fontSize(10).font('Helvetica').text(
        'El firmante declara ser mayor de 18 años y se hace responsable del presente consentimiento.',
      );
      doc.moveDown();
    }

    // Signature image
    doc.fontSize(11).font('Helvetica-Bold').text('Firma digital');
    doc.moveDown(0.5);
    const base64Data = options.signatureBase64.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    doc.image(imgBuffer, { width: 200, height: 80 });

    doc.end();
  });
}
