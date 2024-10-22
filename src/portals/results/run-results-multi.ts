import { interactCLI, handlePortalReturn } from "../../helpers/portals";
import { runStrategyPortal } from "../strategies/run-strategy";
import { createResultsChartsMulti } from "../../helpers/charts";
import { removeIndexFromTable, round } from "../../helpers/parse";
import { DataReturn, StrategyResultMulti } from "../../infra/interfaces";
import { headerStrategyResults } from "../../infra/headers";
import { colorHeader } from "../../infra/colors";
import { saveMultiResults, deleteMultiResults, findMultiResultNames, parseRunResultsStats } from "@backtestjs/core";

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
      const runResultsStats = await parseRunResultsStats(results);

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
      const runResultsStats = await parseRunResultsStats(results);

      const multiResults = parseMultiResults(
        [...results.multiResults],
        results.multiResults[0].assetAmounts.numberOfCandles,
        results.startingAmount,
        results.isMultiSymbol
      );

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
    } else if (choiceCLI.includes("💾")) {
      const allResults = await findMultiResultNames();

      const resultsName = await interactCLI({
        type: "input",
        message: "Type A Name For The Trading Results:",
      });
      if (resultsName !== undefined) {
        results.name = resultsName;
      }

      let override = false;
      if (allResults.includes(results.name)) {
        const saveResultsChoice = await interactCLI({
          type: "autocomplete",
          message: `Results ${results.name} has saved results already, would you like to rewrite them`,
          choices: ["Yes", "No"],
        });

        override = saveResultsChoice === "Yes";
      }

      await saveMultiResults(results.name, results, override);
      return { error: false, data: `Successfully saved results for ${results.name}` };
    } else if (choiceCLI.includes("🔥")) {
      await deleteMultiResults(results.name);
      return { error: false, data: `Successfully deleted results for ${results.name}` };
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
