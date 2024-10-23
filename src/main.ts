#!/usr/bin/env node
import { interactCLI, handlePortalReturn } from './helpers/portals'
import { DataReturn } from './infra/interfaces'
import { headerMain } from './infra/headers'
import { colorBack, colorBye } from './infra/colors'
import { mainHistoricalDataPortal } from './portals/historical-data/main'
import { mainStrategyPortal } from './portals/strategies/main'
import { viewResultsPortal } from './portals/results/view-results'

async function main() {
  console.clear()

  let exit = false
  let portalReturn: DataReturn = { error: false, data: '' }

  const choices = [
    '📚 Historical Candle Data',
    '💎 Trading Strategies',
    '📜 View Saved Trading Results',
    colorBack('👈 Exit')
  ]

  while (!exit) {
    headerMain()
    await handlePortalReturn(portalReturn)

    const responseCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose what to do:',
      choices
    })

    if (responseCLI.includes('📚')) portalReturn = await mainHistoricalDataPortal()
    else if (responseCLI.includes('💎')) portalReturn = await mainStrategyPortal()
    else if (responseCLI.includes('📜')) portalReturn = await viewResultsPortal()
    else if (responseCLI.includes('👈')) {
      exit = true
      portalReturn.error = false
      portalReturn.data = ''
    }

    console.clear()
  }

  console.log(colorBye(`See you next time, bye bye ✨`))
  console.log()
}

main()
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
