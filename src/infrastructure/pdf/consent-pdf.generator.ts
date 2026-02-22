import PDFDocument from "pdfkit";

const PROGRAM_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEERING: "Ingeniería de Software",
  ENVIRONMENTAL_ENGINEERING: "Ingeniería Ambiental",
  OCCUPATIONAL_HEALTH_ADMIN:
    "Administración de la Seguridad y Salud en el Trabajo",
  FOOD_ENGINEERING: "Ingeniería de Alimentos",
  ELECTRICAL_ENGINEERING: "Ingeniería Eléctrica",
  DIGITAL_BUSINESS_ADMIN: "Administración de Negocios Digitales",
};

export interface ConsentPdfOptions {
  firstName: string;
  lastName: string;
  email: string;
  idDocument?: string | null;
  program?: string | null;
  signedAt: Date;
  signatureBase64: string;
  guardianName?: string;
  guardianPhone?: string;
}

export function generateConsentPdf(
  options: ConsentPdfOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fullName = `${options.firstName} ${options.lastName}`;
    const document = options.idDocument ?? "_______________";
    const program = options.program
      ? (PROGRAM_LABELS[options.program] ?? options.program)
      : "_______________";
    const representation = options.guardianName ? "mis padres" : "sí mismo";

    // Header
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("InsideOut Expressions", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Fundación Escuela Tecnológica de Neiva - FET", {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Consentimiento Informado", { align: "center" });
    doc.moveDown(1.5);

    // Consent body
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Yo ${fullName} con número de documento ${document} perteneciente al programa de ${program} ` +
          `en representación de ${representation} en la FET dejo mi expreso consentimiento para que en caso ` +
          `de ser necesario pueda recibir el acompañamiento psicológico que ha sido propuesto por el profesional ` +
          `que me asiste, cuyos encuentros tendrán variación según la naturaleza de mi situación y necesidad, ` +
          `así como la posible inexistencia de resultados positivos y la indicación de interconsultas con otros ` +
          `profesionales de la salud en caso de ser necesarias.`,
        { align: "justify" },
      );
    doc.moveDown();

    doc.text(
      `Además, he sido informado de que la continuidad del acompañamiento es de mi entera responsabilidad ` +
        `y que luego de dos ausentes consecutivos, sin aviso, en citas programadas, se considerará alta por abandono.`,
      { align: "justify" },
    );
    doc.moveDown();

    doc.text(
      `Así mismo se me aclara que los encuentros por acompañamiento deben ser confirmados por medio del correo ` +
        `compartido por el profesional y la puntualidad al espacio debe ser prioridad.`,
      { align: "justify" },
    );
    doc.moveDown();

    doc.text(
      `Toda la información compartida con el profesional no saldrá del espacio terapéutico, teniendo como salvedad ` +
        `aquella que implique riesgo de vida para el paciente y/o para terceros.`,
      { align: "justify" },
    );
    doc.moveDown();

    if (options.guardianName) {
      doc.text(
        `En caso de emergencia se pueden comunicar con ${options.guardianName} ` +
          `al siguiente número de contacto ${options.guardianPhone ?? "_______________"}.`,
        { align: "justify" },
      );
      doc.moveDown();
    }

    // Signer info
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica-Bold").text("Datos del firmante");
    doc.font("Helvetica").fontSize(10);
    doc.text(`Nombre: ${fullName}`);
    doc.text(`Documento: ${document}`);
    doc.text(`Correo: ${options.email}`);
    doc.text(`Programa: ${program}`);
    doc.text(
      `Fecha de firma: ${options.signedAt.toLocaleString("es-CO", { timeZone: "America/Bogota" })}`,
    );
    doc.moveDown();

    // Signature
    doc.fontSize(11).font("Helvetica-Bold").text("Firma digital");
    doc.moveDown(0.5);
    const base64Data = options.signatureBase64.replace(
      /^data:image\/\w+;base64,/,
      "",
    );
    doc.image(Buffer.from(base64Data, "base64"), { width: 200, height: 80 });

    doc.end();
  });
}
