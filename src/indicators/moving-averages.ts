import * as indicator from "technicalindicators";

export async function indicatorSMA(candles: number[], length: number, limit?: number) {
  const sma = indicator.SMA.calculate({
    values: candles,
    period: length,
  });

  if (limit === undefined) limit = 1;
  if (limit >= sma.length) return sma;
  if (limit === 1) return sma[sma.length - 1];

  return sma.slice(sma.length - limit);
}

export async function indicatorEMA(candles: number[], length: number, limit?: number) {
  const ema = indicator.EMA.calculate({
    values: candles,
    period: length,
  });

  if (limit === undefined) limit = 1;
  if (limit >= ema.length) return ema;
  if (limit === 1) return ema[ema.length - 1];

  return ema.slice(ema.length - limit);
}
