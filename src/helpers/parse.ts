import { LooseObject } from '@backtest/framework'

const { Console } = require('console')
const { Transform } = require('stream')

export function round(numberToConvert: number) {
  if (Math.abs(numberToConvert) >= 1) {
    return +numberToConvert.toFixed(2)
  } else {
    let strNum = numberToConvert.toFixed(20)
    let i = 0

    while (strNum[i + 2] === '0') {
      i++
    }

    let rounded = parseFloat(strNum.slice(0, i + 2 + 3 + 1))

    const strRounded = rounded.toString()

    return +strRounded.slice(0, i + 2 + 3)
  }
}

export function removeIndexFromTable(data: LooseObject[]) {
  const ts = new Transform({
    transform(chunk: any, enc: any, cb: any) {
      cb(null, chunk)
    }
  })
  const logger = new Console({ stdout: ts })
  logger.table(data)
  const table = (ts.read() || '').toString()
  let result = ''
  for (let row of table.split(/[\r\n]+/)) {
    let r = row.replace(/[^┬]*┬/, '┌')
    r = r.replace(/^├─*┼/, '├')
    r = r.replace(/│[^│]*/, '')
    r = r.replace(/^└─*┴/, '└')
    r = r.replace(/'/g, ' ')
    result += `${r}\n`
  }
  console.log(result)
}

export function parseMultiResults(
  data: LooseObject[],
  numberOfCandles: number,
  startingAmount: number,
  multiSymbol: boolean
) {
  data.sort((a: LooseObject, b: LooseObject) => b.endAmount - a.endAmount)

  data = data.map((item) => {
    const {
      maxDrawdownAmount,
      maxDrawdownPercent,
      numberOfCandlesInvested,
      endAmount,
      assetAmounts,
      sharpeRatio,
      symbol,
      interval,
      ...rest
    } = item
    const maxDrawdown = `${maxDrawdownPercent}% : ${maxDrawdownAmount}`

    const endAmountUpdated = `${((item.endAmount / startingAmount) * 100).toFixed(2)}% : ${item.endAmount}`
    const numberOfCandlesInvestedUpdated = `${((item.numberOfCandlesInvested / numberOfCandles) * 100).toFixed(2)}% : ${
      item.numberOfCandlesInvested
    } out of ${numberOfCandles}`
    const sharpeRatioUpdated = sharpeRatio === 10000 ? 'Need > 1 Year' : sharpeRatio
    const returnData = {
      ...rest,
      endAmountUpdated,
      sharpeRatioUpdated,
      maxDrawdown,
      numberOfCandlesInvested: numberOfCandlesInvestedUpdated
    }

    return multiSymbol ? { symbol, interval, ...returnData } : returnData
  })

  return data
}

export function dateToString(date: Date | number | string) {
  return new Date(date).toLocaleString()
}
