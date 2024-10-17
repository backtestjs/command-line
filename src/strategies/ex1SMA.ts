import { BTH } from "../infra/interfaces";
import { indicatorSMA } from "../indicators/moving-averages";

export const properties = {
  params: ["lowSMA", "highSMA"],
  dynamicParams: false,
};

export async function runStrategy(bth: BTH) {
  const lowSMAInput = bth.params.lowSMA;
  const highSMAInput = bth.params.highSMA;

  // Get last candles
  const lowSMACandles = await bth.getCandles("close", 0, lowSMAInput);
  const highSMACandles = await bth.getCandles("close", 0, highSMAInput);

  // Calculate low and high SMA
  const lowSMA = await indicatorSMA(lowSMACandles, lowSMAInput);
  const highSMA = await indicatorSMA(highSMACandles, highSMAInput);

  // Buy if lowSMA crosses over the highSMA
  if (lowSMA > highSMA) {
    await bth.buy();
  }

  // Sell if lowSMA crosses under the highSMA
  else {
    await bth.sell();
  }
}
