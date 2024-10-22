import { interactCLI } from "../../helpers/portals";
import { headerDownloadHistoricalData } from "../../infra/headers";
import { colorSuccess, colorError } from "../../infra/colors";
import { downloadHistoricalData, getCandleStartDate, getIntervals, findHistoricalData } from "@backtestjs/core";

export async function downloadHistoricalDataPortal() {
  console.clear();

  let valid = false;
  let symbolStart = 0;
  let symbol = "";
  let choiceInterval = "";
  let startTime = 0;
  let endTime = 0;

  headerDownloadHistoricalData();

  while (!valid) {
    while (!valid) {
      symbol = (
        await interactCLI({
          type: "input",
          message: "Symbol:",
        })
      ).toUpperCase();

      if (!symbol) {
        console.log(colorError("Symbol is required"));
        continue;
      }

      try {
        symbolStart = await getCandleStartDate(symbol);
      } catch (error) {
        console.log(colorError((error as Error).toString()));
        continue;
      }

      valid = !!symbolStart && symbolStart > 0;

      if (!valid) console.log(colorError(`Symbol ${symbol} does not exist`));
    }
    valid = false;

    choiceInterval = await interactCLI({
      type: "autocomplete",
      message: "Interval:",
      choices: getIntervals(),
    });

    const historicalData = await findHistoricalData(`${symbol}-${choiceInterval}`);
    valid = !historicalData || historicalData.symbol != symbol || historicalData.interval != choiceInterval;

    if (!valid) {
      console.log(
        colorError(
          `Entry already exists for ${symbol} at the ${choiceInterval} interval, either edit or remove the existing entry`
        )
      );
    }
  }

  if (!valid) {
    return { error: true, data: "Download aborted" };
  }

  valid = false;

  while (!valid) {
    const now = new Date().getTime();
    const startTimeInput = await interactCLI({
      type: "date",
      message: "Start Date:",
      dateDefault: symbolStart,
    });
    startTime = new Date(startTimeInput).getTime();

    if (startTime < symbolStart)
      console.log(colorError(`Date must be on or after ${new Date(symbolStart).toLocaleString()}`));
    else if (startTime > now) console.log(colorError(`Date must be on or before ${new Date(now).toLocaleString()}`));
    else valid = true;
  }
  valid = false;

  while (!valid) {
    const now = new Date().getTime();
    const endTimeInput = await interactCLI({
      type: "date",
      message: "End Date:",
      dateDefault: now,
    });
    endTime = new Date(endTimeInput).getTime();

    if (endTime > now) console.log(colorError(`Date must be on or before ${new Date(now).toLocaleString()}`));
    else if (endTime <= startTime)
      console.log(colorError(`Date must be after your declared start time of ${new Date(startTime).toLocaleString()}`));
    else valid = true;
  }
  valid = false;

  console.log();
  console.log(
    colorSuccess(
      `Downloading ${symbol} data from ${new Date(startTime).toLocaleString()} to ${new Date(
        endTime
      ).toLocaleString()} at the ${choiceInterval} interval`
    )
  );

  try {
    await downloadHistoricalData(symbol, {
      interval: choiceInterval,
      startDate: startTime,
      endDate: endTime,
      downloadIsMandatory: true,
    });
  } catch (error) {
    console.log(colorError((error as Error).toString()));
  }

  return { error: false, data: "Successfully downloaded" };
}
