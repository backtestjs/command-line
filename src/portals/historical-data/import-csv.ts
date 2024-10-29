import { getIntervals } from '@backtest/framework'
import { interactCLI } from '../../helpers/portals'
import { importCSV } from '../../helpers/csv'
import { headerImportCSV } from '../../infra/headers'

export async function importCSVPortal() {
  console.clear()

  headerImportCSV()

  const base = (
    await interactCLI({
      type: 'input',
      message: 'Base name (EX: BTC in BTCUSDT or APPL in APPL/USD):'
    })
  ).toUpperCase()

  const quote = (
    await interactCLI({
      type: 'input',
      message: 'Quote name (EX: USDT in BTCUSDT or USD in APPL/USD):'
    })
  ).toUpperCase()

  const interval = await interactCLI({
    type: 'autocomplete',
    message: 'Interval:',
    choices: getIntervals()
  })

  const path = await interactCLI({
    type: 'input',
    message: 'Full Path to CSV:'
  })

  return await importCSV({ interval, base, quote, path })
}
