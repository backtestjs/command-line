import {
  RunStrategy,
  BuySell,
  BuySellReal,
  GetCandles,
  Candle,
  MetaCandle,
  BTH,
  OrderBook,
  ImportCSV,
  StrategyResult,
  GetStrategyResult,
  StrategyResultMulti,
  Order,
  Worth,
  RunMetaData,
  StrategyMeta,
  LooseObject,
} from "@backtestjs/core";

export {
  RunStrategy,
  BuySell,
  BuySellReal,
  GetCandles,
  Candle,
  MetaCandle,
  BTH,
  OrderBook,
  ImportCSV,
  StrategyResult,
  GetStrategyResult,
  StrategyResultMulti,
  Order,
  Worth,
  RunMetaData,
  StrategyMeta,
  LooseObject,
};

export interface UserQuestions {
  type: string;
  message: string;
  choices?: string[];
  dateDefault?: number;
}

export interface DataReturn {
  error: boolean;
  data: string | LooseObject;
}
