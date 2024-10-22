import { runStrategyPortal } from '../strategies/run-strategy'
import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { createResultsCharts } from '../../helpers/charts'
import { removeIndexFromTable, round } from '../../helpers/parse'
import { DataReturn, GetStrategyResult, LooseObject } from '../../infra/interfaces'
import { headerStrategyResults } from '../../infra/headers'
import { colorHeader, colorBack } from '../../infra/colors'
import { saveResults, deleteResults, findResultNames, parseRunResultsStats } from '@backtestjs/core'

export async function resultsPortal(results: GetStrategyResult, newResult: boolean) {
  if (!newResult) console.clear()

  let back = false
  let portalReturn: DataReturn = { error: false, data: '' }

  let choices = [
    '🎉 All Trading Results In Browser',
    '🚀 Statistic Trading Results In CLI',
    '📋 Table Of All Trades In CLI'
  ]
  choices.push(newResult ? '💾 Save Results' : '🔥 Delete Result')
  choices.push('🏃 Run Trading Strategy')
  choices.push('🔮 Run Trading Strategy (more options)')
  choices.push(colorBack('👈 Back'))

  while (!back) {
    if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

    headerStrategyResults()

    const choiceCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose what to see:',
      choices
    })

    if (choiceCLI.includes('🎉')) {
      const runResultsStats = await parseRunResultsStats(results)

      await createResultsCharts(results.allWorths, results.candles, results.allOrders, runResultsStats)
    } else if (choiceCLI.includes('🚀')) {
      const runResultsStats = await parseRunResultsStats(results)

      console.log()
      console.log(colorHeader('* GENERAL *'))
      removeIndexFromTable(runResultsStats.generalData)

      console.log()
      console.log(colorHeader('* TOTALS *'))
      removeIndexFromTable(runResultsStats.totals)

      console.log()
      console.log(colorHeader('* TRADES *'))
      removeIndexFromTable(runResultsStats.trades)

      console.log()
      console.log(colorHeader('* TRADE BUY / SELL AMOUNTS *'))
      removeIndexFromTable(runResultsStats.tradeBuySellAmounts)

      console.log()
      console.log(colorHeader('* ASSET AMOUNTS / PERCENTAGES *'))
      removeIndexFromTable(runResultsStats.assetAmountsPercentages)
    } else if (choiceCLI.includes('📋')) {
      let allOrdersCopy: LooseObject = results.allOrders

      const hasNonZeroBorrowedBaseAmount = allOrdersCopy.some((order: LooseObject) => order.borrowedBaseAmount !== 0)

      if (!hasNonZeroBorrowedBaseAmount) {
        allOrdersCopy = allOrdersCopy.map(
          ({ borrowedBaseAmount, ...rest }: { borrowedBaseAmount: number; rest: LooseObject }) => rest
        )
      }

      allOrdersCopy = allOrdersCopy.map((order: LooseObject) => {
        let newOrder: LooseObject = {
          ...order,
          time: new Date(order.time).toLocaleString(),
          baseAmount: round(order.baseAmount)
        }

        if (order.borrowedBaseAmount) {
          newOrder.borrowedBaseAmount = round(order.borrowedBaseAmount)
        }

        return newOrder
      })

      console.table(allOrdersCopy)
    } else if (choiceCLI.includes('💾')) {
      const allResults = await findResultNames()

      const resultsName = await interactCLI({
        type: 'input',
        message: 'Type A Name For The Results:'
      })

      if (resultsName !== undefined) {
        results.name = resultsName
      }

      let override = false
      if (allResults.includes(results.name)) {
        const saveResultsChoice = await interactCLI({
          type: 'autocomplete',
          message: `Results ${results.name} has saved results already, would you like to rewrite them`,
          choices: ['Yes', 'No']
        })

        override = saveResultsChoice === 'Yes'
      }

      await saveResults(results.name, results, override)
      return { error: false, data: `Successfully saved trading results for ${results.name}` }
    } else if (choiceCLI.includes('🔥')) {
      await deleteResults(results.name)
      return { error: false, data: `Successfully deleted trading results for ${results.name}` }
    } else if (choiceCLI.includes('🏃')) {
      portalReturn = await runStrategyPortal(true)
      back = true
    } else if (choiceCLI.includes('🔮')) {
      portalReturn = await runStrategyPortal(false)
      back = true
    } else if (choiceCLI.includes('👈')) back = true
  }
  return portalReturn
}
