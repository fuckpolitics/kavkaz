'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  buildQuizResults,
  FORM_MICROCOPY,
  QUIZ_QUESTIONS,
  type QuizAnswer,
} from '@/lib/home-content';
import { IconArrow } from '../icons';
import { Reveal } from '../Reveal';
import { SectionIntro } from './SectionIntro';

export function QuizSection() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [multiDraft, setMultiDraft] = useState<string[]>([]);

  const question = QUIZ_QUESTIONS[step];
  const done = started && step >= QUIZ_QUESTIONS.length;
  const progress = done
    ? 100
    : started
      ? Math.round((step / QUIZ_QUESTIONS.length) * 100)
      : 0;

  const results = useMemo(
    () => (done ? buildQuizResults(answers) : []),
    [done, answers],
  );

  function pickSingle(optionId: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setStep((s) => s + 1);
    setMultiDraft([]);
  }

  function toggleMulti(optionId: string) {
    setMultiDraft((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }

  function confirmMulti() {
    if (!question || multiDraft.length === 0) return;
    setAnswers((prev) => ({ ...prev, [question.id]: multiDraft }));
    setStep((s) => s + 1);
    setMultiDraft([]);
  }

  function reset() {
    setStarted(false);
    setStep(0);
    setAnswers({});
    setMultiDraft([]);
  }

  return (
    <section id="quiz" className="section-topo section-grain relative overflow-hidden py-20 desktop:py-28">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-forest-light/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="dark"
            eyebrow="за минуту — ваш Кавказ"
            title={
              <>
                Не знаете, выбрать Домбай, Архыз,
                <br className="hidden tablet:block" /> Эльбрус или Кавминводы?
              </>
            }
            subtitle="Ответьте на несколько вопросов — получите три маршрута с бюджетом и понятными различиями. Без звонка «какой тур вас интересует?»."
          />
        </Reveal>

        {!started ? (
          <Reveal delayMs={100}>
            <div className="mt-12 flex flex-col gap-6 tablet:flex-row tablet:items-end tablet:justify-between">
              <ul className="grid max-w-xl gap-3 text-sm text-white/70 tablet:grid-cols-2">
                {[
                  'Оптимальный маршрут',
                  'Более доступный вариант',
                  'Комфорт / индивидуальный',
                  'Предварительный бюджет',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <div>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="group inline-flex items-center gap-3 rounded-btn bg-accent px-7 py-4 text-base font-semibold text-ink transition hover:bg-white"
                >
                  Подобрать мой Кавказ
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition group-hover:translate-x-0.5">
                    <IconArrow size={16} />
                  </span>
                </button>
                <p className="mt-3 max-w-xs text-xs text-white/45">{FORM_MICROCOPY}</p>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12">
            <div className="mb-2 flex items-center justify-between text-xs text-white/50">
              <span>
                {done
                  ? 'Готово'
                  : `Вопрос ${step + 1} из ${QUIZ_QUESTIONS.length}`}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mb-8 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="progress-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {!done && question ? (
              <div key={question.id} className="animate-fade-up">
                <h3 className="max-w-2xl text-2xl font-semibold tracking-tight text-white tablet:text-3xl">
                  {question.title}
                </h3>
                {question.multi ? (
                  <p className="mt-2 text-sm text-white/55">
                    Можно выбрать несколько вариантов
                  </p>
                ) : null}
                <div className="mt-8 grid gap-3 tablet:grid-cols-2">
                  {question.options.map((opt, i) => {
                    const selected = question.multi
                      ? multiDraft.includes(opt.id)
                      : false;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          question.multi
                            ? toggleMulti(opt.id)
                            : pickSingle(opt.id)
                        }
                        className={`quiz-option flex items-center gap-4 rounded-[22px] border px-5 py-5 text-left backdrop-blur-sm ${
                          selected
                            ? 'border-accent bg-accent/15'
                            : 'border-white/15 bg-white/[0.04] hover:border-accent/80 hover:bg-white/[0.09]'
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-script text-xl text-accent">
                          {question.multi ? (selected ? '✓' : i + 1) : i + 1}
                        </span>
                        <span className="text-base font-medium text-white">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {question.multi ? (
                  <button
                    type="button"
                    disabled={multiDraft.length === 0}
                    onClick={confirmMulti}
                    className="mt-6 rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-40"
                  >
                    Далее
                    {multiDraft.length > 0 ? ` · выбрано ${multiDraft.length}` : ''}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-semibold text-white tablet:text-3xl">
                  Три варианта под ваши ответы
                </h3>
                <p className="mt-2 max-w-2xl text-white/65">
                  Сравните маршруты, бюджет и различия — и выберите следующий шаг.
                </p>
                <div className="mt-8 grid gap-4 desktop:grid-cols-3">
                  {results.map((variant, i) => (
                    <article
                      key={variant.id}
                      className={`relative overflow-hidden rounded-[28px] p-6 ${
                        i === 0
                          ? 'bg-accent text-ink'
                          : 'border border-white/15 bg-white/[0.06] text-white'
                      }`}
                    >
                      <p
                        className={`font-script text-2xl ${i === 0 ? 'text-forest' : 'text-accent'}`}
                      >
                        {variant.kind}
                      </p>
                      <h4 className="mt-2 text-xl font-bold leading-snug">
                        {variant.region}
                      </h4>
                      <p
                        className={`mt-5 text-xs uppercase tracking-wide ${i === 0 ? 'text-ink/55' : 'text-white/50'}`}
                      >
                        Предварительный бюджет
                      </p>
                      <p className="mt-1 text-2xl font-bold">{variant.budget}</p>
                      <p
                        className={`mt-4 text-sm leading-relaxed ${i === 0 ? 'text-ink/75' : 'text-white/70'}`}
                      >
                        {variant.diff}
                      </p>
                    </article>
                  ))}
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href={
                      Array.isArray(answers.must) && answers.must.length > 0
                        ? `/trip-builder?must=${answers.must.join(',')}`
                        : '/trip-builder'
                    }
                    className="rounded-btn bg-accent px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Собрать индивидуальную поездку
                  </Link>
                  <Link
                    href="/tours"
                    className="rounded-btn border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Выбрать готовый тур
                  </Link>
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-3.5 text-sm text-white/50 underline decoration-white/25 underline-offset-4"
                  >
                    Пройти ещё раз
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
