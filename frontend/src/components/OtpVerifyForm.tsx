'use client';

import { FormEvent, useState } from 'react';
import { ApiError } from '@/api/client';
import { useAuth } from '@/lib/auth-context';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';

type Channel = 'email' | 'phone';

export function OtpVerifyForm({
  firstNameOptional = true,
  submitLabel = 'Подтвердить',
  onVerified,
}: {
  firstNameOptional?: boolean;
  submitLabel?: string;
  onVerified?: (payload: {
    email?: string;
    phone?: string;
    code: string;
    firstName?: string;
  }) => Promise<void> | void;
}) {
  const { requestOtp, verifyOtp } = useAuth();
  const [channel, setChannel] = useState<Channel>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [step, setStep] = useState<'contact' | 'code'>('contact');
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dto =
        channel === 'email'
          ? { email: email.trim() }
          : { phone: phone.trim() };
      const res = await requestOtp(dto);
      setHint(res.message);
      setStep('code');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Не удалось отправить код',
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...(channel === 'email'
          ? { email: email.trim() }
          : { phone: phone.trim() }),
        code: code.trim(),
        firstName: firstName.trim() || undefined,
      };
      if (onVerified) {
        await onVerified(payload);
      } else {
        await verifyOtp(payload);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Неверный код',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-btn bg-background p-1">
        <button
          type="button"
          className={`flex-1 rounded-btn px-3 py-2 text-sm ${channel === 'email' ? 'bg-primary text-white' : 'text-text-secondary'}`}
          onClick={() => {
            setChannel('email');
            setStep('contact');
          }}
        >
          Email
        </button>
        <button
          type="button"
          className={`flex-1 rounded-btn px-3 py-2 text-sm ${channel === 'phone' ? 'bg-primary text-white' : 'text-text-secondary'}`}
          onClick={() => {
            setChannel('phone');
            setStep('contact');
          }}
        >
          Телефон
        </button>
      </div>

      {step === 'contact' ? (
        <form onSubmit={sendCode} className="space-y-3">
          {channel === 'email' ? (
            <AppInput
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mail.ru"
            />
          ) : (
            <AppInput
              label="Телефон"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+79001112233"
            />
          )}
          {!firstNameOptional || firstName ? (
            <AppInput
              label="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Как к вам обращаться"
            />
          ) : (
            <AppInput
              label="Имя (необязательно)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Как к вам обращаться"
            />
          )}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <AppButton type="submit" className="w-full" loading={loading}>
            Получить код
          </AppButton>
          <p className="text-xs text-text-secondary">
            {channel === 'email'
              ? 'Код придёт на email. Регистрация и пароль не нужны.'
              : 'Код придёт в SMS. Регистрация и пароль не нужны.'}
          </p>
        </form>
      ) : (
        <form onSubmit={confirmCode} className="space-y-3">
          {hint ? <p className="text-sm text-text-secondary">{hint}</p> : null}
          <AppInput
            label={channel === 'email' ? 'Код из письма' : 'Код из SMS'}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="4 цифры"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <AppButton type="submit" className="w-full" loading={loading}>
            {submitLabel}
          </AppButton>
          <button
            type="button"
            className="text-sm text-primary underline"
            onClick={() => setStep('contact')}
          >
            Изменить контакт
          </button>
        </form>
      )}
    </div>
  );
}
