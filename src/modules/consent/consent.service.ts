import { ConsentRepository } from "./consent.repository";
import { SignConsentInput } from "./consent.validation";
import { generateConsentPdf } from "../../infrastructure/pdf/consent-pdf.generator";
import {
  uploadFile,
  getPresignedUrl,
} from "../../infrastructure/storage/storage";
import { AppError } from "../../shared/errors/app-error";
import * as codes from "../../shared/errors/error-codes";
import {
  parsePagination,
  paginate,
  PaginationQuery,
} from "../../shared/utils/pagination";

export class ConsentService {
  constructor(private readonly repo = new ConsentRepository()) {}

  async sign(userId: string, data: SignConsentInput, ip: string) {
    const existing = await this.repo.findByUserId(userId);
    if (existing) throw AppError.conflict(codes.CONSENT_ALREADY_SIGNED);

    const user = await this.repo.findUserById(userId);
    if (!user) throw AppError.notFound(codes.USER_NOT_FOUND);

    const isMinor = user.birthDate
      ? (Date.now() - user.birthDate.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000) <
        18
      : false;

    if (isMinor && (!data.guardianName || !data.guardianPhone)) {
      throw AppError.badRequest(codes.CONSENT_GUARDIAN_INCOMPLETE);
    }

    const signedAt = new Date();
    const pdfBuffer = await generateConsentPdf({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      idDocument: user.idDocument,
      program: user.program,
      signedAt,
      signatureBase64: data.signature,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
    });

    const storageKey = `consents/${userId}.pdf`;
    await uploadFile(storageKey, pdfBuffer, "application/pdf");
    await this.repo.create({
      userId,
      storageKey,
      ip,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
    });
    await this.repo.markUserConsentGiven(userId);
  }

  async getMyConsent(userId: string) {
    const consent = await this.repo.findByUserId(userId);
    if (!consent) throw AppError.notFound(codes.CONSENT_NOT_FOUND);
    const url = await getPresignedUrl(consent.storageKey);
    return { ...consent, url };
  }

  async getAllConsents(query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findAllWithUser(
      skip,
      limit,
      query.search,
    );
    const enriched = await Promise.all(
      data.map(async (c) => ({
        ...c,
        url: await getPresignedUrl(c.storageKey),
      })),
    );
    return paginate(enriched, total, page, limit);
  }
}
