import { interactCLI, handlePortalReturn } from "../../helpers/portals";
import { runStrategyPortal } from "../strategies/run-strategy";
import { createResultsChartsMulti } from "../../helpers/charts";
import { DataReturn, StrategyResultMulti } from "../../infra/interfaces";
import { headerStrategyResults } from "../../infra/headers";
import { colorHeader } from "../../infra/colors";

import { insertMultiResult, getAllMultiResults, deleteMultiResult } from "../../helpers/prisma-results-multi-value";
import { parseRunResultsStatsMulti, removeIndexFromTable, parseMultiResults } from "../../helpers/parse";

export async function resultsPortalMulti(results: StrategyResultMulti, newResult: boolean) {
  if (!newResult) console.clear();

  let back = false;
  let portalReturn: DataReturn = { error: false, data: "" };

  let choices = ["🎉 All Trading Results In Browser", "📋 Table Of All Trading Results In CLI"];
  choices.push(newResult ? "💾 Save Trading Results" : "🔥 Delete Trading Result");
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
      const runResultsStats = await parseRunResultsStatsMulti({
        name: results.name,
        permutationCount: results.multiResults.length,
        symbols: results.symbols,
        strategyName: results.strategyName,
        params: results.params,
        startTime: results.startTime,
        endTime: results.endTime,
        txFee: results.txFee,
        slippage: results.slippage,
        startingAmount: results.startingAmount,
        multiResults: results.multiResults,
        isMultiValue: results.isMultiValue,
        isMultiSymbol: results.isMultiSymbol,
      });

      const multiResultsParsed = parseMultiResults(
        [...results.multiResults],
        results.multiResults[0].assetAmounts.numberOfCandles,
        results.startingAmount,
        results.isMultiSymbol
      );
      const multiResults = {
        multiResults: [...multiResultsParsed],
        assetResults: results.multiResults[0].assetAmounts,
      };

      await createResultsChartsMulti(multiResults, results.multiResults, runResultsStats);
    } else if (choiceCLI.includes("📋")) {
      const runResultsStatsReturn = await parseRunResultsStatsMulti({
        name: results.name,
        permutationCount: results.multiResults.length,
        symbols: results.symbols,
        strategyName: results.strategyName,
        params: results.params,
        startTime: results.startTime,
        endTime: results.endTime,
        txFee: results.txFee,
        slippage: results.slippage,
        startingAmount: results.startingAmount,
        multiResults: results.multiResults,
        isMultiValue: results.isMultiValue,
        isMultiSymbol: results.isMultiSymbol,
      });
      if (runResultsStatsReturn.error) return runResultsStatsReturn;
      const runResultsStats = runResultsStatsReturn.data;

      const multiResults = parseMultiResults(
        [...results.multiResults],
        results.multiResults[0].assetAmounts.numberOfCandles,
        results.startingAmount,
        results.isMultiSymbol
      );

      if (typeof runResultsStats !== "string") {
        console.log("");
        console.log(colorHeader("|              *** GENERAL ***            |"));
        removeIndexFromTable(runResultsStats.generalData);

        console.log("");
        console.log(colorHeader("|                     *** TOTAL RESULTS ***                 |"));
        removeIndexFromTable(runResultsStats.totals);

        if (!results.isMultiSymbol) {
          console.log("");
          console.log(colorHeader("|            *** ASSET AMOUNTS / PERCENTAGES ***            |"));
          removeIndexFromTable(runResultsStats.assetAmountsPercentages);
        }

        console.log("");
        console.log(colorHeader("|               *** ALL PERMUTATION RESULTS ***             |"));
        removeIndexFromTable(multiResults);
      }
    } else if (choiceCLI.includes("💾")) {
      let allResultsReturn = await getAllMultiResults();
      if (allResultsReturn.error) return allResultsReturn;
      let allResults = allResultsReturn.data;

      const resultsName = await interactCLI({
        type: "input",
        message: "Type A Name For The Trading Results:",
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
          const deleteResults = await deleteMultiResult(results.name);
          if (deleteResults.error) return deleteResults;
        }
      }

      const saveResultsRes = await insertMultiResult(results);
      if (saveResultsRes.error) return saveResultsRes;
      return { error: false, data: `Successfully saved results for ${results.name}` };
    } else if (choiceCLI.includes("🔥")) {
      return await deleteMultiResult(results.name);
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
