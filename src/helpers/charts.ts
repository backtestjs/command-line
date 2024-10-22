import { LooseObject, Candle, Order } from '../infra/interfaces'
const { exec } = require('child_process')
import { platform } from 'os'
import express from 'express'
import * as fs from 'fs'
import path from 'path'

const app = express()
let serverStarted = false

async function startServer(url: string) {
  if (!serverStarted) {
    app.use(express.static(path.join(`${__dirname}/../../charts`)))
    app.listen(8000)
    serverStarted = true
  }

  const osPlatform = platform()
  let command: string

  if (osPlatform === 'win32') command = `start microsoft-edge:${url}`
  else if (osPlatform === 'darwin') command = `open -a "Google Chrome" ${url}`
  else command = `google-chrome --no-sandbox ${url}`

  exec(command)
}

export async function createResultsCharts(
  allWorths: LooseObject,
  allCandles: Candle[],
  allOrders: Order[],
  runResultsStats: LooseObject
) {
  const allCandlesResults = allCandles.map((candle: Candle) => {
    return {
      time: candle.closeTime,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }
  })

  fs.writeFileSync(`${__dirname}/../../charts/results-orders.json`, JSON.stringify(allOrders))
  fs.writeFileSync(`${__dirname}/../../charts/results-worths.json`, JSON.stringify(allWorths))
  fs.writeFileSync(`${__dirname}/../../charts/results-stats.json`, JSON.stringify(runResultsStats))
  fs.writeFileSync(`${__dirname}/../../charts/results-candles.json`, JSON.stringify(allCandlesResults))

  await startServer('http://localhost:8000/results.html')
}

export async function createResultsChartsMulti(
  results: LooseObject,
  resultsUnsorted: LooseObject,
  resultStats: LooseObject
) {
  fs.writeFileSync(`${__dirname}/../../charts/results-multi.json`, JSON.stringify(results))
  fs.writeFileSync(`${__dirname}/../../charts/results-unsorted-multi.json`, JSON.stringify(resultsUnsorted))
  fs.writeFileSync(`${__dirname}/../../charts/results-stats-multi.json`, JSON.stringify(resultStats))

  await startServer('http://localhost:8000/results-multi.html')
}

export async function createCandlesChart(allCandles: Candle[], symbolName: string) {
  const allCandlesResults = allCandles.map((candle: Candle) => {
    return {
      time: candle.closeTime,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }
  })

  fs.writeFileSync(`${__dirname}/../../charts/candles.json`, JSON.stringify(allCandlesResults))
  fs.writeFileSync(`${__dirname}/../../charts/candleName.json`, JSON.stringify({ name: symbolName }))

  await startServer('http://localhost:8000/candles.html')
}
