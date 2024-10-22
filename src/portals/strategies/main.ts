import { interactCLI, handlePortalReturn } from "../../helpers/portals";
import { headerStrategies } from "../../infra/headers";
import { DataReturn } from "../../infra/interfaces";
import { runStrategyPortal } from "./run-strategy";
import { scanStrategiesPortal } from "./scan";

export async function mainStrategyPortal() {
  console.clear();

  let back = false;
  let portalReturn: DataReturn = { error: false, data: "" };

  const choices = [
    "🏃 Run Trading Strategy",
    "🔮 Run Trading Strategy (more options)",
    "🌀 Scan Trading Strategies",
    "👈 Back",
  ];

  while (!back) {
    headerStrategies();

    if (portalReturn.data !== "") await handlePortalReturn(portalReturn);

    const choiceCLI = await interactCLI({
      type: "autocomplete",
      message: "Choose what to do:",
      choices,
    });

    let shouldClear = true;

    if (choiceCLI.includes("🏃")) {
      portalReturn = await runStrategyPortal(true);
      if (portalReturn.error) shouldClear = false;
    } else if (choiceCLI.includes("🔮")) {
      portalReturn = await runStrategyPortal(false);
      if (portalReturn.error) shouldClear = false;
    } else if (choiceCLI.includes("🌀")) portalReturn = await scanStrategiesPortal();
    else if (choiceCLI.includes("👈")) {
      back = true;
      portalReturn.error = false;
      portalReturn.data = "";
    }

    if (shouldClear) console.clear();
  }
  return portalReturn;
}
