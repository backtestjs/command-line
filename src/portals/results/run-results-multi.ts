import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { runStrategyPortal } from '../strategies/run-strategy'
import { createResultsChartsMulti } from '../../helpers/charts'
import { removeIndexFromTable, parseMultiResults } from '../../helpers/parse'
import { DataReturn, StrategyResultMulti } from '../../infra/interfaces'
import { headerStrategyResults } from '../../infra/headers'
import { colorHeader, colorBack } from '../../infra/colors'
import { saveMultiResult, deleteMultiResult, findMultiResultNames, parseRunResultsStats } from '@backtest/framework'

export async function resultsPortalMulti(results: StrategyResultMulti, newResult: boolean) {
  if (!newResult) console.clear()

  let back = false
  let portalReturn: DataReturn = { error: false, data: '' }

  let choices = [
    '🎉 All Trading Results In Browser',
    '📋 Table Of All Trading Results In CLI',
    newResult ? '💾 Save Trading Results' : '🔥 Delete Trading Result',
    '🏃 Run Trading Strategy',
    '🔮 Run Trading Strategy (more options)',
    colorBack('👈 Back')
  ]
  while (!back) {
    headerStrategyResults()
    await handlePortalReturn(portalReturn)

    const choiceCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose what to see:',
      choices
    })

    let shouldClear = true

    if (choiceCLI.includes('🎉')) {
      const runResultsStats = await parseRunResultsStats(results)

      const multiResultsParsed = parseMultiResults(
        [...results.multiResults],
        results.multiResults[0].assetAmounts.numberOfCandles,
        results.startingAmount,
        results.isMultiSymbol
      )
      const multiResults = {
        multiResults: [...multiResultsParsed],
        assetResults: results.multiResults[0].assetAmounts
      }

      await createResultsChartsMulti(multiResults, results.multiResults, runResultsStats)
      shouldClear = false
    } else if (choiceCLI.includes('📋')) {
      const runResultsStats = await parseRunResultsStats(results)

      const multiResults = parseMultiResults(
        [...results.multiResults],
        results.multiResults[0].assetAmounts.numberOfCandles,
        results.startingAmount,
        results.isMultiSymbol
      )

      console.log(colorHeader('* GENERAL *'))
      removeIndexFromTable(runResultsStats.generalData)

      console.log(colorHeader('* TOTAL RESULTS *'))
      removeIndexFromTable(runResultsStats.totals)

      if (!results.isMultiSymbol) {
        console.log(colorHeader('* ASSET AMOUNTS / PERCENTAGES *'))
        removeIndexFromTable(runResultsStats.assetAmountsPercentages)
      }

      console.log(colorHeader('* ALL PERMUTATION RESULTS *'))
      removeIndexFromTable(multiResults)
      shouldClear = false
    } else if (choiceCLI.includes('💾')) {
      const allResults = await findMultiResultNames()

      const resultsName = await interactCLI({
        type: 'input',
        message: 'Type A Name For The Trading Results:'
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

      await saveMultiResult(results.name, results, override)
      return { error: false, data: `Successfully saved results for ${results.name}` }
    } else if (choiceCLI.includes('🔥')) {
      await deleteMultiResult(results.name)
      return { error: false, data: `Successfully deleted results for ${results.name}` }
    } else if (choiceCLI.includes('🏃')) {
      portalReturn = await runStrategyPortal(true)
    } else if (choiceCLI.includes('🔮')) {
      portalReturn = await runStrategyPortal(false)
    } else if (choiceCLI.includes('👈')) back = true

    if (shouldClear) {
      console.clear()
    }
  }
  return portalReturn
}
