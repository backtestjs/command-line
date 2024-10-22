import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { headerHistoricalData } from '../../infra/headers'
import { colorBack } from '../../infra/colors'
import { DataReturn } from '../../infra/interfaces'
import { viewHistoricalDataPortal } from './view'
import { downloadHistoricalDataPortal } from './download'
import { importCSVPortal } from './import-csv'

export async function mainHistoricalDataPortal() {
  console.clear()

  let back = false
  let portalReturn: DataReturn = { error: false, data: '' }

  const choices = [
    '🔍 View / Update / Delete Downloaded Candle Data',
    '⬇️  Download Candle Data from Binance',
    '📥 Import Candle Data from CSV',
    colorBack('👈 Back')
  ]

  while (!back) {
    headerHistoricalData()

    if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

    const choiceCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose what to do:',
      choices
    })

    /**/ if (choiceCLI.includes('🔍')) portalReturn = await viewHistoricalDataPortal()
    else if (choiceCLI.includes('⬇️')) portalReturn = await downloadHistoricalDataPortal()
    else if (choiceCLI.includes('📥')) portalReturn = await importCSVPortal()
    else if (choiceCLI.includes('👈')) {
      back = true
      portalReturn.error = false
      portalReturn.data = ''
    }

    console.clear()
  }
  return portalReturn
}
