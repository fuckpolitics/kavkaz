import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  /** True when SMTP_HOST (and credentials if needed) are configured. */
  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('SMTP_HOST')?.trim());
  }

  async sendMail(input: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    const from =
      this.configService.get<string>('SMTP_FROM')?.trim() ||
      this.configService.get<string>('MAIL_FROM')?.trim() ||
      'Сорвались <noreply@sorvalis.ru>';

    try {
      const info = await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html ?? input.text,
      });
      this.logger.log(
        `Mail sent to ${input.to} messageId=${info.messageId ?? 'n/a'}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send mail to ${input.to}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new ServiceUnavailableException(
        'Не удалось отправить письмо. Попробуйте позже.',
      );
    }
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const brand =
      this.configService.get<string>('MAIL_BRAND_NAME')?.trim() || 'Сорвались';
    const ttlMinutes = Math.max(
      1,
      Math.floor(
        Number(this.configService.get<string>('OTP_TTL_MINUTES') ?? '10'),
      ),
    );

    const subject = `${brand}: код подтверждения ${code}`;
    const text = [
      `Ваш код подтверждения: ${code}`,
      '',
      `Код действует ${ttlMinutes} мин.`,
      'Если вы не запрашивали вход — просто проигнорируйте письмо.',
      '',
      `— ${brand}`,
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html lang="ru">
<body style="margin:0;padding:0;background:#f4f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:440px;background:#ffffff;border-radius:16px;padding:28px 24px;border:1px solid #e5ebe6;">
          <tr>
            <td style="font-size:14px;color:#5a6b5e;">${brand}</td>
          </tr>
          <tr>
            <td style="padding-top:12px;font-size:22px;font-weight:700;color:#1a2e22;">Код подтверждения</td>
          </tr>
          <tr>
            <td style="padding-top:20px;font-size:36px;letter-spacing:0.28em;font-weight:700;color:#1a2e22;text-align:center;">${code}</td>
          </tr>
          <tr>
            <td style="padding-top:20px;font-size:14px;line-height:1.5;color:#5a6b5e;">
              Код действует ${ttlMinutes}&nbsp;мин. Никому его не сообщайте.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    await this.sendMail({ to, subject, text, html });
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Отправка email не настроена (SMTP_HOST).',
      );
    }

    const host = this.configService.getOrThrow<string>('SMTP_HOST').trim();
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? '587');
    const user = this.configService.get<string>('SMTP_USER')?.trim();
    const pass = this.configService.get<string>('SMTP_PASS')?.trim();
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }
}
