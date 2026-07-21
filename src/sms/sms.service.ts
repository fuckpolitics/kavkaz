import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SmsProvider = 'smsru' | 'smsc';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    const provider = this.getProvider();
    if (provider === 'smsc') {
      return Boolean(
        this.configService.get<string>('SMSC_LOGIN')?.trim() &&
          this.configService.get<string>('SMSC_PASSWORD')?.trim(),
      );
    }
    return Boolean(this.configService.get<string>('SMSRU_API_ID')?.trim());
  }

  async sendOtpSms(toPhoneE164: string, code: string): Promise<void> {
    const phone = this.toDigits(toPhoneE164);
    if (!/^7\d{10}$/.test(phone)) {
      throw new ServiceUnavailableException(
        'Укажите российский номер в формате +7XXXXXXXXXX',
      );
    }

    const brand =
      this.configService.get<string>('MAIL_BRAND_NAME')?.trim() || 'Сорвались';
    const ttlMinutes = Math.max(
      1,
      Math.floor(
        Number(this.configService.get<string>('OTP_TTL_MINUTES') ?? '10'),
      ),
    );
    // Keep under 70 Cyrillic chars so it stays 1 SMS segment.
    const text = `${brand}: код ${code}. Действует ${ttlMinutes} мин.`;

    const provider = this.getProvider();
    if (provider === 'smsc') {
      await this.sendViaSmsc(phone, text);
      return;
    }
    await this.sendViaSmsRu(phone, text);
  }

  private getProvider(): SmsProvider {
    const raw = this.configService.get<string>('SMS_PROVIDER')?.trim().toLowerCase();
    return raw === 'smsc' ? 'smsc' : 'smsru';
  }

  private toDigits(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('8')) {
      return `7${digits.slice(1)}`;
    }
    return digits;
  }

  private async sendViaSmsRu(phone: string, text: string): Promise<void> {
    const apiId = this.configService.get<string>('SMSRU_API_ID')?.trim();
    if (!apiId) {
      throw new ServiceUnavailableException('SMS не настроено (SMSRU_API_ID).');
    }

    const from = this.configService.get<string>('SMS_FROM')?.trim();
    const url = new URL('https://sms.ru/sms/send');
    url.searchParams.set('api_id', apiId);
    url.searchParams.set('to', phone);
    url.searchParams.set('msg', text);
    url.searchParams.set('json', '1');
    if (from) {
      url.searchParams.set('from', from);
    }

    const res = await fetch(url, { method: 'GET' });
    const body = (await res.json()) as {
      status?: string;
      status_code?: number;
      status_text?: string;
      sms?: Record<string, { status?: string; status_code?: number; status_text?: string }>;
    };

    if (body.status !== 'OK' || body.status_code !== 100) {
      this.logger.error(`sms.ru failed: ${JSON.stringify(body)}`);
      throw new ServiceUnavailableException(
        body.status_text || 'Не удалось отправить SMS. Попробуйте позже.',
      );
    }

    const first = body.sms ? Object.values(body.sms)[0] : null;
    if (first && first.status_code !== 100) {
      this.logger.error(`sms.ru message failed: ${JSON.stringify(first)}`);
      throw new ServiceUnavailableException(
        first.status_text || 'Не удалось отправить SMS. Попробуйте позже.',
      );
    }

    this.logger.log(`SMS sent via sms.ru to ${phone}`);
  }

  private async sendViaSmsc(phone: string, text: string): Promise<void> {
    const login = this.configService.get<string>('SMSC_LOGIN')?.trim();
    const password = this.configService.get<string>('SMSC_PASSWORD')?.trim();
    if (!login || !password) {
      throw new ServiceUnavailableException(
        'SMS не настроено (SMSC_LOGIN / SMSC_PASSWORD).',
      );
    }

    const sender = this.configService.get<string>('SMS_FROM')?.trim();
    const url = new URL('https://smsc.ru/sys/send.php');
    url.searchParams.set('login', login);
    url.searchParams.set('psw', password);
    url.searchParams.set('phones', phone);
    url.searchParams.set('mes', text);
    url.searchParams.set('fmt', '3');
    url.searchParams.set('charset', 'utf-8');
    if (sender) {
      url.searchParams.set('sender', sender);
    }

    const res = await fetch(url, { method: 'GET' });
    const body = (await res.json()) as {
      id?: number;
      error?: string;
      error_code?: number;
    };

    if (body.error || body.error_code) {
      this.logger.error(`smsc.ru failed: ${JSON.stringify(body)}`);
      throw new ServiceUnavailableException(
        body.error || 'Не удалось отправить SMS. Попробуйте позже.',
      );
    }

    this.logger.log(`SMS sent via smsc.ru to ${phone} id=${body.id ?? 'n/a'}`);
  }
}
