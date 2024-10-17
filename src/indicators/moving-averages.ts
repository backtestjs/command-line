// ----------------------------------------------------
// |              MOVING AVERAGE INDICATORS           |
// ----------------------------------------------------

// ----------------------------------------------------
// |                     GLOBALS                      |
// ----------------------------------------------------

import * as indicator from "technicalindicators";

// ----------------------------------------------------
// |                   FUNCTIONS                      |
// ----------------------------------------------------

// Get SMA
export async function indicatorSMA(candles: number[], length: number, limit?: number) {
  // Call SMA function from TI with the candles and desired sma length
  const sma = indicator.SMA.calculate({
    values: candles,
    period: length,
  });

  // TI can return a few things, in this case the SMA data is in the first item in its return
  if (limit === undefined) limit = 1;

  // If you requested more SMA's then were generated return all that you have
  if (limit >= sma.length) return sma;
  // Return the most recent SMA
  if (limit === 1) return sma[sma.length - 1];
  // Return only a specific amount of SMA's
  return sma.slice(sma.length - limit);
}

// Get EMA
export async function indicatorEMA(candles: number[], length: number, limit?: number) {
  const ema = indicator.EMA.calculate({
    values: candles,
    period: length,
  });

  // TI can return a few things, in this case the SMA data is in the first item in its return
  if (limit === undefined) limit = 1;

  // If you requested more SMA's then were generated return all that you have
  if (limit >= ema.length) return ema;
  // Return the most recent SMA
  if (limit === 1) return ema[ema.length - 1];
  // Return only a specific amount of SMA's
  return ema.slice(ema.length - limit);
}
