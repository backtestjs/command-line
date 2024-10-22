import { runStrategyPortal } from "../strategies/run-strategy";
import { interactCLI, handlePortalReturn } from "../../helpers/portals";
import { createResultsCharts } from "../../helpers/charts";
import { DataReturn, GetStrategyResult, LooseObject } from "../../infra/interfaces";
import { headerStrategyResults } from "../../infra/headers";
import { colorHeader } from "../../infra/colors";

import { insertResult, getAllStrategyResultNames, deleteStrategyResult } from "../../helpers/prisma-results";
import { parseRunResultsStats, round, removeIndexFromTable } from "../../helpers/parse";

export async function resultsPortal(results: GetStrategyResult, newResult: boolean) {
  if (!newResult) console.clear();

  let back = false;
  let portalReturn: DataReturn = { error: false, data: "" };

  let choices = [
    "🎉 All Trading Results In Browser",
    "🚀 Statistic Trading Results In CLI",
    "📋 Table Of All Trades In CLI",
  ];
  choices.push(newResult ? "💾 Save Results" : "🔥 Delete Result");
  choices.push("🏃 Run Trading Strategy");
  choices.push("🔮 Run Trading Strategy (more options)");
  choices.push("👈 Back");

  while (!back) {
    if (portalReturn.data !== "") await handlePortalReturn(portalReturn);

    headerStrategyResults();

    const choiceCLI = await interactCLI({
      type: "autocomplete",
      message: "Choose what to see:",
      choices,
    });

    if (choiceCLI.includes("🎉")) {
      const runResultsStats = await parseRunResultsStats({
        name: results.name,
        historicalDataName: results.historicalDataName,
        strategyName: results.strategyName,
        params: results.params,
        startTime: results.startTime,
        endTime: results.endTime,
        txFee: results.txFee,
        slippage: results.slippage,
        startingAmount: results.startingAmount,
        runMetaData: results.runMetaData,
        allOrders: results.allOrders,
        allWorths: results.allWorths,
      });

      await createResultsCharts(results.allWorths, results.candles, results.allOrders, runResultsStats);
    } else if (choiceCLI.includes("🚀")) {
      const runResultsStatsReturn = await parseRunResultsStats({
        name: results.name,
        historicalDataName: results.historicalDataName,
        strategyName: results.strategyName,
        params: results.params,
        startTime: results.startTime,
        endTime: results.endTime,
        txFee: results.txFee,
        slippage: results.slippage,
        startingAmount: results.startingAmount,
        runMetaData: results.runMetaData,
        allOrders: results.allOrders,
        allWorths: results.allWorths,
      });
      if (runResultsStatsReturn.error) return runResultsStatsReturn;
      const runResultsStats = runResultsStatsReturn.data;

      if (typeof runResultsStats !== "string") {
        console.log("");
        console.log(colorHeader("|            *** GENERAL ***           |"));
        removeIndexFromTable(runResultsStats.generalData);

        console.log("");
        console.log(colorHeader("|            *** TOTALS ***            |"));
        removeIndexFromTable(runResultsStats.totals);

        console.log("");
        console.log(colorHeader("|            *** TRADES ***            |"));
        removeIndexFromTable(runResultsStats.trades);

        console.log("");
        console.log(colorHeader("|            *** TRADE BUY / SELL AMOUNTS ***            |"));
        removeIndexFromTable(runResultsStats.tradeBuySellAmounts);

        console.log("");
        console.log(colorHeader("|            *** ASSET AMOUNTS / PERCENTAGES ***            |"));
        removeIndexFromTable(runResultsStats.assetAmountsPercentages);
      }
    } else if (choiceCLI.includes("📋")) {
      let allOrdersCopy: LooseObject = results.allOrders;

      const hasNonZeroBorrowedBaseAmount = allOrdersCopy.some((order: LooseObject) => order.borrowedBaseAmount !== 0);

      if (!hasNonZeroBorrowedBaseAmount) {
        allOrdersCopy = allOrdersCopy.map(
          ({ borrowedBaseAmount, ...rest }: { borrowedBaseAmount: number; rest: LooseObject }) => rest
        );
      }

      allOrdersCopy = allOrdersCopy.map((order: LooseObject) => {
        let newOrder: LooseObject = {
          ...order,
          time: new Date(order.time).toLocaleString(),
          baseAmount: round(order.baseAmount),
        };

        if (order.borrowedBaseAmount) {
          newOrder.borrowedBaseAmount = round(order.borrowedBaseAmount);
        }

        return newOrder;
      });

      console.table(allOrdersCopy);
    } else if (choiceCLI.includes("💾")) {
      let allResultsReturn = await getAllStrategyResultNames();
      if (allResultsReturn.error) return allResultsReturn;
      let allResults = allResultsReturn.data;

      const resultsName = await interactCLI({
        type: "input",
        message: "Type A Name For The Results:",
      });
      if (resultsName !== undefined) results.name = resultsName;

      if (allResults.includes(results.name)) {
        const saveResultsChoice = await interactCLI({
          type: "autocomplete",
          message: `Results ${results.name} has saved results already, would you like to rewrite them`,
          choices: ["Yes", "No"],
        });
        if (saveResultsChoice === "No") {
          return { error: false, data: "Cancelled saving results" };
        } else {
          const deleteResults = await deleteStrategyResult(results.name);
          if (deleteResults.error) return deleteResults;
        }
      }

      const saveResultsRes = await insertResult(results);
      if (saveResultsRes.error) return saveResultsRes;
      return { error: false, data: `Successfully saved trading results for ${results.name}` };
    } else if (choiceCLI.includes("🔥")) {
      return await deleteStrategyResult(results.name);
    } else if (choiceCLI.includes("🏃")) {
      portalReturn = await runStrategyPortal(true);
      back = true;
    } else if (choiceCLI.includes("🔮")) {
      portalReturn = await runStrategyPortal(false);
      back = true;
    } else if (choiceCLI.includes("👈")) back = true;
  }
  return portalReturn;
}
