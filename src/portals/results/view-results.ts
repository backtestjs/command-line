import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { DataReturn } from '../../infra/interfaces'
import { headerResults } from '../../infra/headers'
import { colorBack } from '../../infra/colors'
import { resultsPortalMulti } from './run-results-multi'
import { resultsPortal } from './run-results'
import { findResultNames, findMultiResultNames, getResult, getMultiResult } from '@backtestjs/framework'

export async function viewResultsPortal() {
  console.clear()

  let back = false
  let portalReturn: DataReturn = { error: false, data: '' }

  while (!back) {
    const choicesResults = await findResultNames()
    const choicesMulti = await findMultiResultNames()
    let choices = [...choicesResults, ...choicesMulti]
    if (choices.length === 0) return { error: true, data: 'There are no saved trading results' }
    choices.push(colorBack('👈 Back'))

    headerResults()
    await handlePortalReturn(portalReturn)

    const choiceCLI = await interactCLI({
      type: 'autocomplete',
      message: 'Choose which result to view:',
      choices: choices
    })

    if (choiceCLI.includes('👈')) return { error: false, data: '' }

    if (choicesMulti.includes(choiceCLI)) {
      const strategyResults = await getMultiResult(choiceCLI)
      portalReturn = await resultsPortalMulti(strategyResults, false)
    } else {
      const strategyResults = await getResult(choiceCLI)
      portalReturn = await resultsPortal(strategyResults, false)
    }
  }
  return portalReturn
}
