import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { DataReturn } from '../../infra/interfaces'
import { headerViewHistoricalData } from '../../infra/headers'
import { colorBack } from '../../infra/colors'
import { editPortal } from './edit'
import { findHistoricalDataNames } from '@backtestjs/core'

export async function viewHistoricalDataPortal() {
  console.clear()

  let back = false
  let portalReturn: DataReturn = { error: false, data: '' }

  while (!back) {
    const historicalNames = await findHistoricalDataNames()
    if (!historicalNames?.length) return { error: true, data: 'There are no saved candles' }

    let choices: string[] = historicalNames
    choices.push(colorBack('👈 Back'))

    headerViewHistoricalData()
    await handlePortalReturn(portalReturn)

    const choiceCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose a symbol / interval to interact with:',
      choices
    })

    if (choiceCLI.includes('👈')) {
      back = true
      portalReturn.error = false
      portalReturn.data = ''
    } else {
      let userChoice = ''
      for (let i = 0; i < choices.length; i++) {
        if (choices[i] === choiceCLI) {
          userChoice = historicalNames[i]
          break
        }
      }
      portalReturn = await editPortal(userChoice)
    }

    console.clear()
  }

  return portalReturn
}
