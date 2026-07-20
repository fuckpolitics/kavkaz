export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === 'number' ? value : Number(value);
}

export function toMoneyString(value: number): string {
  return value.toFixed(2);
}
