import { colorHeader } from './colors'

function createHeader(title: string) {
  console.log()
  console.log(colorHeader(`* ${title} *`))
  console.log()
}

export function headerMain() {
  createHeader('BACKTESTJS')
}

export function headerHistoricalData() {
  createHeader('HISTORICAL CANDLE DATA')
}

export function headerViewHistoricalData() {
  createHeader('VIEW HISTORICAL CANDLE DATA')
}

export function headerDownloadHistoricalData() {
  createHeader('DOWNLOAD HISTORICAL CANDLE DATA')
}

export function headerEditHistoricalData() {
  createHeader('EDIT HISTORICAL CANDLE DATA')
}

export function headerStrategies() {
  createHeader('TRADING STRATEGIES')
}

export function headerScanStrategy() {
  createHeader('SCAN ALL TRADING STRATEGIES')
}

export function headerCreateStrategy() {
  createHeader('CREATE TRADING STRATEGY')
}

export function headerRunStrategy() {
  createHeader('RUN TRADING STRATEGY')
}

export function headerDeleteStrategy() {
  createHeader('DELETE TRADING STRATEGY')
}

export function headerImportCSV() {
  createHeader('IMPORT CSV')
}

export function headerStrategyResults() {
  createHeader('TRADING STRATEGY RESULTS')
}

export function headerResults() {
  createHeader('SAVED TRADING RESULTS')
}
