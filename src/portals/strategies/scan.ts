import { interactCLI } from "../../helpers/portals";
import { headerScanStrategy } from "../../infra/headers";
import { scanStrategies } from "@backtestjs/core";
import { colorError, colorChoice, colorHeader } from "../../infra/colors";

export async function scanStrategiesPortal() {
  console.clear();

  headerScanStrategy();

  const rescanStrategiesInput = await interactCLI({
    type: "autocomplete",
    message: "Rescan all strategies:",
    choices: ["Yes", "No"],
  });

  let message = "";

  if (rescanStrategiesInput === "Yes") {
    await scanStrategies();
    message = `Ok strategies aligned`;
    console.log();
    console.log(colorHeader(message));
  } else {
    message = `Scan strategies aborted`;
    console.log(colorError(message));
  }
  console.log();

  const choiceCLI = await interactCLI({
    type: "autocomplete",
    message: "All done:",
    choices: [colorChoice("👈 Back")],
  });

  // implict if (choiceCLI.includes("👈"))
  return { error: false, data: message };
}
