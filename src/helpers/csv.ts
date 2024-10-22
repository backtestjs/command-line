import { ImportCSV } from '../infra/interfaces'
import { interactCLI } from './portals'
import { importFileCSV, exportFileCSV } from '@backtestjs/core'

// import { colorError, colorSuccess } from "../infra/colors";
// console.log(colorSuccess("✅ Found Close Time"));
// colorError("❌ Not Found Open Time will populate with 0")

export async function importCSV(importCSVParams: ImportCSV) {
  const continueToImport = await interactCLI({
    type: 'autocomplete',
    message: 'Import CSV and save to DB?',
    choices: ['Yes', 'No']
  })

  if (continueToImport === 'No') {
    return { error: false, data: 'Successfully aborted importing data from CSV' }
  }

  const { base, quote, interval, path } = importCSVParams

  try {
    await importFileCSV(base, quote, interval, path)
  } catch (error) {
    return { error: true, data: `Error importing data from CSV ${error}` }
  }

  return { error: false, data: `Successfully imported ${base + quote}` }
}

export async function exportCSV(name: string) {
  console.clear()

  try {
    await exportFileCSV(name)
  } catch (error) {
    return { error: true, data: `Error exporting data to CSV ${error}` }
  }

  return { error: false, data: `Successfully exported data to ./csv folder with name ${name}.csv` }
}
