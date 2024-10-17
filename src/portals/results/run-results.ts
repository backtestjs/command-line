// ----------------------------------------------------
// |               STRATEGY RESULTS PORTAL            |
// ----------------------------------------------------

// ----------------------------------------------------
// |                     GLOBALS                      |
// ----------------------------------------------------

import { runStrategyPortal } from "../strategies/run-strategy";

// Define helper imports
import { insertResult, getAllStrategyResultNames, deleteStrategyResult } from "../../helpers/prisma-results";
import { interactCLI, handlePortalReturn } from "../../helpers/portals";
import { parseRunResultsStats, round, removeIndexFromTable } from "../../helpers/parse";
import { createResultsCharts } from "../../helpers/charts";

// Define infra imports
import { DataReturn, GetStrategyResult, LooseObject } from "../../infra/interfaces";
import { headerStrategyResults } from "../../infra/headers";
import { colorHeader } from "../../infra/colors";

// ----------------------------------------------------
// |                   FUNCTIONS                      |
// ----------------------------------------------------

export async function resultsPortal(results: GetStrategyResult, newResult: boolean) {
  // Clear console
  if (!newResult) console.clear();

  // Define back and portal return params
  let back = false;
  let portalReturn: DataReturn = { error: false, data: "" };

  // Define choices for historical data screen
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
    // Handle portal return
    if (portalReturn.data !== "") await handlePortalReturn(portalReturn);

    // Show header
    headerStrategyResults();

    // Interact with user
    const choiceCLI = await interactCLI({
      type: "autocomplete",
      message: "Choose what to see:",
      choices,
    });

    // Show results in browser
    if (choiceCLI.includes("🎉")) {
      // Parse the results
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

      // Open chart in browser with results
      await createResultsCharts(results.allWorths, results.candles, results.allOrders, runResultsStats);
    }

    // Show statistical results in the CLI
    else if (choiceCLI.includes("🚀")) {
      // Parse the results
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
        // Log general info
        console.log("");
        console.log(colorHeader("|            *** GENERAL ***           |"));
        removeIndexFromTable(runResultsStats.generalData);

        // Log total amounts / percentages
        console.log("");
        console.log(colorHeader("|            *** TOTALS ***            |"));
        removeIndexFromTable(runResultsStats.totals);

        // Log trade amounts / percentages
        console.log("");
        console.log(colorHeader("|            *** TRADES ***            |"));
        removeIndexFromTable(runResultsStats.trades);

        // Log trade buy / sell amounts
        console.log("");
        console.log(colorHeader("|            *** TRADE BUY / SELL AMOUNTS ***            |"));
        removeIndexFromTable(runResultsStats.tradeBuySellAmounts);

        // Log asset amounts / percentages
        console.log("");
        console.log(colorHeader("|            *** ASSET AMOUNTS / PERCENTAGES ***            |"));
        removeIndexFromTable(runResultsStats.assetAmountsPercentages);
      }
    }

    // Show all the orders in the CLI
    else if (choiceCLI.includes("📋")) {
      let allOrdersCopy: LooseObject = results.allOrders;
      // Check if any borrowedBaseAmount is non-zero
      const hasNonZeroBorrowedBaseAmount = allOrdersCopy.some((order: LooseObject) => order.borrowedBaseAmount !== 0);

      // If there are no non-zero borrowedBaseAmount, create a new array without the borrowedBaseAmount property
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

        // Only round borrowedBaseAmount if it exists
        if (order.borrowedBaseAmount) {
          newOrder.borrowedBaseAmount = round(order.borrowedBaseAmount);
        }

        return newOrder;
      });

      console.table(allOrdersCopy);
    }

    // Save the results
    else if (choiceCLI.includes("💾")) {
      // Check if results already exist
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
          // Delete already existing entry
          const deleteResults = await deleteStrategyResult(results.name);
          if (deleteResults.error) return deleteResults;
        }
      }

      // Save the results to the dB
      const saveResultsRes = await insertResult(results);
      if (saveResultsRes.error) return saveResultsRes;
      return { error: false, data: `Successfully saved trading results for ${results.name}` };
    }

    // Delete the results
    else if (choiceCLI.includes("🔥")) {
      // Delete result
      return await deleteStrategyResult(results.name);
    }

    // Run Trading Strategy
    else if (choiceCLI.includes("🏃")) {
      portalReturn = await runStrategyPortal(true);
      back = true;
    }

    // Run Trading Strategy (more options)
    else if (choiceCLI.includes("🔮")) {
      portalReturn = await runStrategyPortal(false);
      back = true;
    }

    // Back
    else if (choiceCLI.includes("👈")) back = true;
  }
  return portalReturn;
}
