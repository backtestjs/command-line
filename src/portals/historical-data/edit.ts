import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { createCandlesChart } from '../../helpers/charts'
import { exportCSV } from '../../helpers/csv'
import { dateToString } from '../../helpers/parse'
import { headerEditHistoricalData } from '../../infra/headers'
import { DataReturn } from '../../infra/interfaces'
import { colorHeader, colorError, colorBack } from '../../infra/colors'
import { getCandles, deleteHistoricalData, findHistoricalData } from '@backtestjs/core'

export async function editPortal(name: string) {
  console.clear()

  let back = false
  let portalReturn: DataReturn = { error: false, data: '' }

  while (!back) {
    const metaData = await findHistoricalData(name)
    if (!metaData) {
      return { error: true, data: `Historical data with name ${name} not found` }
    }

    const { symbol, interval, startTime, endTime } = metaData
    const title = `${symbol} | ${interval} | ${dateToString(startTime)} | ${dateToString(endTime)}`

    let choices: string[] = []
    choices.push('📈 View Candles Chart in Browser')
    choices.push('📥 Export Candles to CSV')
    choices.push('❌ Delete Candles')
    choices.push(colorBack('👈 Back'))

    headerEditHistoricalData()

    console.log(colorHeader(`${title}`))
    console.log()

    if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

    const choiceCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose what to do:',
      choices
    })

    if (choiceCLI.includes('📈')) {
      const candlesRequest = await getCandles(name)
      if (!candlesRequest) {
        return { error: true, data: `Candles with name ${name} not found` }
      }

      const candles = candlesRequest.candles
      await createCandlesChart(candles, name)
    } else if (choiceCLI.includes('📥')) {
      portalReturn = await exportCSV(name)
    } else if (choiceCLI.includes('❌')) {
      back = true
      try {
        await deleteHistoricalData(name)
      } catch (error) {
        console.log(colorError((error as Error).toString()))
      }
    } else if (choiceCLI.includes('👈')) {
      back = true
      portalReturn.error = false
      portalReturn.data = ''
    }

    console.clear()
  }
  return portalReturn
}
