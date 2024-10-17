// ----------------------------------------------------
// |               CREATE STRATEGY PORTAL             |
// ----------------------------------------------------

// ----------------------------------------------------
// |                     GLOBALS                      |
// ----------------------------------------------------

// Define helper imports
import { insertStrategy, updateStrategy, deleteStrategy, getAllStrategies } from "../../helpers/prisma-strategies";
import { interactCLI } from "../../helpers/portals";

// Define infra imports
import { headerScanStrategy } from "../../infra/headers";
import { StrategyMeta } from "../../infra/interfaces";
import { colorError, colorChoice, colorHeader } from "../../infra/colors";

const path = require("path");
import * as fs from "fs";

// ----------------------------------------------------
// |                   FUNCTIONS                      |
// ----------------------------------------------------

export async function scanStrategiesPortal() {
  // Clear console
  console.clear();

  // Get strategies
  let allStrategies = await getAllStrategies();
  if (allStrategies.error) return allStrategies;

  // Show header
  headerScanStrategy();

  const rescanStrategiesInput = await interactCLI({
    type: "autocomplete",
    message: "Rescan all strategies:",
    choices: ["Yes", "No"],
  });

  if (rescanStrategiesInput === "Yes") {
    let allStrategies = await getAllStrategies();
    if (allStrategies.error) return allStrategies;

    let strategies: {
      name: string;
      creationTime: number;
      lastRunTime: number;
      dynamicParams: boolean;
      params: string[];
    }[] = [];

    if (typeof allStrategies.data !== "string") {
      strategies = allStrategies.data.map((strategy: StrategyMeta) => ({
        name: strategy.name,
        creationTime: strategy.creationTime,
        lastRunTime: strategy.lastRunTime,
        dynamicParams: strategy.dynamicParams,
        params: strategy.params,
      }));
    }

    let isJS = false;
    const extension = path.extname(__filename);
    if (extension === ".js") isJS = true;

    const importPath = isJS ? `./dist/strategies` : `./src/strategies`;

    const files = fs.readdirSync(importPath);
    if (files?.length > 0) {
      const fileStrategies = files.map((file) => path.basename(file, path.extname(file)));

      for (const [index, strategyName] of fileStrategies.entries()) {
        const registeredStrategy = strategies.find(({ name }) => name === strategyName);
        const strategy = await import(path.join(path.resolve(importPath), files[index]));
        const strategyProperties = strategy.properties || {};

        const meta = {
          name: strategyName,
          params: strategyProperties.params || registeredStrategy?.params || [],
          dynamicParams: strategyProperties.dynamicParams || registeredStrategy?.dynamicParams || false,
          creationTime: registeredStrategy?.creationTime || new Date().getTime(),
          lastRunTime: registeredStrategy?.lastRunTime || 0,
        };

        if (!!registeredStrategy?.name) {
          const saveResults = await updateStrategy(meta);
          const message = saveResults.error ? saveResults.data : "";
          console.log(colorHeader("- update", strategyName, message));
        } else {
          const saveResults = await insertStrategy(meta);
          const message = saveResults.error ? saveResults.data : "";
          console.log(colorHeader("- insert", strategyName, message));
        }
      }

      for (const { name: strategyName } of strategies) {
        if (!fileStrategies.includes(strategyName)) {
          const saveResults = await deleteStrategy(strategyName);
          const message = saveResults.error ? saveResults.data : "";
          console.log(colorHeader("- delete", strategyName, message));
        }
      }

      console.log();
      console.log(colorHeader(`Ok strategies aligned`));
      console.log();
    } else {
      console.log(colorError(`Oops scan completed with errors`));
      console.log();
    }

    let choices: string[] = [];
    choices.push("👈 " + colorChoice("Back"));

    // Interact with user
    const choiceCLI = await interactCLI({
      type: "autocomplete",
      message: "All done:",
      choices,
    });

    // Choose which flow to go
    if (choiceCLI.includes("👈")) {
      // Save the strategy
      const saveResults = {
        error: false,
        data: `Successfully scanned strategies`,
      }; // TO REMOVE
      if (saveResults.error) return saveResults;
      return { error: false, data: `Successfully scanned strategies` };
    }
  }

  return { error: false, data: "Scan aborted" };
}
