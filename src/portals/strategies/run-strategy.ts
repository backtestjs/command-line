import { LooseObject, DataReturn } from "../../infra/interfaces";
import { interactCLI } from "../../helpers/portals";
import { colorChoice, colorError, colorMessage, colorSuccess } from "../../infra/colors";
import { headerRunStrategy } from "../../infra/headers";
import { resultsPortal } from "../results/run-results";
import { resultsPortalMulti } from "../results/run-results-multi";
import {
  findStrategyNames,
  findHistoricalDataNames,
  findStrategy,
  findHistoricalData,
  runStrategy,
  RunStrategy,
  StrategyResultMulti,
  GetStrategyResult,
} from "@backtestjs/core";

export async function runStrategyPortal(runFast: boolean) {
  console.clear();

  let back = false;
  let valid = false;
  let portalReturn: DataReturn = { error: false, data: "" };

  let runParams: RunStrategy = {
    strategyName: "",
    historicalMetaData: [],
    startingAmount: 0,
    startTime: 0,
    endTime: 0,
    params: {},
    percentFee: 0,
    percentSlippage: 0,
  };

  while (!back) {
    const strategyNames = await findStrategyNames();
    if (!strategyNames?.length) return { error: true, data: "There are no saved strategies" };

    let choicesStrategy: string[] = strategyNames;
    choicesStrategy.push(colorChoice("👈 Back"));

    headerRunStrategy();

    runParams.strategyName = await interactCLI({
      type: "autocomplete",
      message: "Choose a strategy to run:",
      choices: choicesStrategy,
    });

    if (runParams.strategyName.includes("👈")) return { error: false, data: "" };

    const historicalNames = await findHistoricalDataNames();
    if (!historicalNames?.length) return { error: true, data: "There are no saved candles" };

    let choiceHistoricalData: string[] = [];

    while (choiceHistoricalData.length === 0) {
      choiceHistoricalData = await interactCLI({
        type: "checkbox",
        message: "Choose which candle(s) set to run on:",
        choices: historicalNames,
      });
    }

    for (let i = 0; i < choiceHistoricalData.length; i++) {
      for (let j = 0; j < historicalNames.length; j++) {
        if (choiceHistoricalData[i] === historicalNames[j]) {
          //@ts-ignore
          runParams.historicalMetaData.push(historicalNames[j]);
          break;
        }
      }
    }

    const isMultiSymbol = runParams.historicalMetaData.length > 1;
    const historicalMetaData = await findHistoricalData(runParams.historicalMetaData[0]);
    const metaDataStrategy = await findStrategy(runParams.strategyName);

    if (!historicalMetaData) {
      return { error: true, data: `There are no historical data for ${runParams.historicalMetaData[0]}` };
    }

    let paramsCache: LooseObject = {};

    for (let i = 0; i < metaDataStrategy.params.length; i++) {
      let param: string | number = await interactCLI({
        type: "input",
        message: metaDataStrategy.params[i],
      });
      if (param === undefined || param === "") param = 0;
      paramsCache[metaDataStrategy.params[i]] = isNaN(+param) ? param : +param;
    }

    if (metaDataStrategy.dynamicParams) {
      let doneWithParams = false;
      while (!doneWithParams) {
        const addParam = await interactCLI({
          type: "autocomplete",
          message: "Add a param:",
          choices: ["Yes", "No"],
        });
        if (addParam === "Yes") {
          let paramName = await interactCLI({
            type: "input",
            message: "Param name:",
          });
          let param = await interactCLI({
            type: "input",
            message: paramName,
          });

          if (param === undefined || param === "") param = 0;
          paramsCache[paramName] = isNaN(+param) ? param : +param;
        } else doneWithParams = true;
      }
    }
    runParams.params = paramsCache;

    if (!runFast) {
      if (!isMultiSymbol) {
        while (!valid) {
          const startTimeInput = await interactCLI({
            type: "date",
            message: "Start Date:",
            dateDefault: historicalMetaData.startTime,
          });
          runParams.startTime = new Date(startTimeInput).getTime();

          if (runParams.startTime < historicalMetaData.startTime)
            console.log(
              colorError(`Date must be on or after ${new Date(historicalMetaData.startTime).toLocaleString()}`)
            );
          else if (runParams.startTime > historicalMetaData.endTime)
            console.log(
              colorError(`Date must be on or before ${new Date(historicalMetaData.endTime).toLocaleString()}`)
            );
          else valid = true;
        }
        valid = false;

        while (!valid) {
          const endTimeInput = await interactCLI({
            type: "date",
            message: "End Date:",
            dateDefault: historicalMetaData.endTime,
          });
          runParams.endTime = new Date(endTimeInput).getTime();

          if (runParams.endTime > historicalMetaData.endTime)
            console.log(
              colorError(`Date must be on or before ${new Date(historicalMetaData.endTime).toLocaleString()}`)
            );
          else if (runParams.endTime <= runParams.startTime)
            console.log(
              colorError(
                `Date must be after your declared start time of ${new Date(runParams.startTime).toLocaleString()}`
              )
            );
          else valid = true;
        }
      } else {
        runParams.startTime = historicalMetaData.startTime;
        runParams.endTime = historicalMetaData.endTime;
      }

      runParams.startingAmount = +(await interactCLI({
        type: "input",
        message: `Starting ${isMultiSymbol ? "" : historicalMetaData.quote} amount:`,
      }));

      const choiceFee = await interactCLI({
        type: "autocomplete",
        message: "Add transaction fee or slippage:",
        choices: ["Yes", "No"],
      });

      if (choiceFee === "Yes") {
        runParams.percentFee = +(await interactCLI({
          type: "input",
          message: "Transaction Fee Percentage (0 for none):",
        }));

        runParams.percentSlippage = +(await interactCLI({
          type: "input",
          message: "Slippage Percentage (0 for none):",
        }));
      }
    } else {
      runParams.startingAmount = 1000;
      runParams.startTime = historicalMetaData.startTime;
      runParams.endTime = historicalMetaData.endTime;
    }

    console.clear();
    console.log(colorMessage(`Running ${runParams.strategyName} Strategy`));

    const result = await runStrategy(runParams);
    console.log(colorSuccess(`Strategy ${runParams.strategyName} completed`));

    if ("allOrders" in result && result.allOrders.length > 0) {
      portalReturn = await resultsPortal(result as GetStrategyResult, true);
    } else {
      portalReturn = await resultsPortalMulti(result as StrategyResultMulti, true);
    }
  }
  return portalReturn;
}
