// ----------------------------------------------------
// |                     CSV HELPERS                  |
// ----------------------------------------------------

// ----------------------------------------------------
// |                     GLOBALS                      |
// ----------------------------------------------------

// Define imports
import { LooseObject, ImportCSV, Candle } from "../infra/interfaces";
import { insertCandles, getCandles } from "./prisma-historical-data";
import { colorError, colorSuccess } from "../infra/colors";
import { interactCLI } from "./portals";
import csvToJson from "csvtojson";
import * as path from "path";
import * as fs from "fs";

// ----------------------------------------------------
// |                   FUNCTIONS                      |
// ----------------------------------------------------

function getNormalizedField(json: LooseObject, possibleFields: string[]): string | null {
  const normalizedFields: { [key: string]: string } = Object.keys(json).reduce(
    (acc: { [key: string]: string }, key) => {
      acc[key.toLowerCase()] = key;
      return acc;
    },
    {}
  );

  for (const field of possibleFields) {
    if (normalizedFields[field.toLowerCase()]) {
      return normalizedFields[field.toLowerCase()];
    }
  }
  return null;
}

function getFieldKeys(json: LooseObject, fields: { [key: string]: string[] }): { [key: string]: string } {
  const fieldKeys: { [key: string]: string } = {};
  for (const [key, possibleFields] of Object.entries(fields)) {
    const fieldKey = getNormalizedField(json, possibleFields);
    if (fieldKey) {
      fieldKeys[key] = fieldKey;
    } else {
      throw new Error(`CSV does not have a valid ${possibleFields.join(", ")} field`);
    }
  }
  return fieldKeys;
}

function getOptionalFieldKeys(json: LooseObject, fields: { [key: string]: string[] }): { [key: string]: string } {
  const optionalFields: { [key: string]: string } = {};
  for (const [key, possibleFields] of Object.entries(fields)) {
    const fieldKey = getNormalizedField(json, possibleFields);
    if (fieldKey) {
      optionalFields[key] = fieldKey;
    }
  }
  return optionalFields;
}

export async function importCSV(importCSVParams: ImportCSV) {
  let jsonCSV: LooseObject;
  try {
    jsonCSV = await csvToJson().fromFile(importCSVParams.path);
  } catch (error) {
    return { error: true, data: `Path ${importCSVParams.path} does not exist or is incorrect` };
  }

  const json = jsonCSV[0];

  const requiredFields = {
    closeTime: ["closeTime", "closetime", "date", "Date"],
    open: ["open", "Open"],
    close: ["close", "Close"],
    low: ["low", "Low"],
    high: ["high", "High"],
  };

  const optionalFields = {
    openTime: ["opentime", "openTime", "OpenTime"],
    volume: ["volume", "Volume"],
    assetVolume: ["assetvolume", "assetVolume", "AssetVolume"],
    numberOfTrades: ["numberoftrades", "numberOfTrades", "NumberOfTrades"],
  };

  try {
    const fieldKeys = getFieldKeys(json, requiredFields);
    const optionalFileds = getOptionalFieldKeys(json, optionalFields);

    console.log(colorSuccess("✅ Found Close Time"));
    console.log(colorSuccess("✅ Found Open"));
    console.log(colorSuccess("✅ Found High"));
    console.log(colorSuccess("✅ Found Low"));
    console.log(colorSuccess("✅ Found Close"));
    console.log(
      optionalFileds.openTime
        ? colorSuccess("✅ Found Open Time")
        : colorError("❌ Not Found Open Time will populate with 0")
    );
    console.log(
      optionalFileds.volume ? colorSuccess("✅ Found Volume") : colorError("❌ Not Found Volume will populate with 0")
    );
    console.log(
      optionalFileds.assetVolume
        ? colorSuccess("✅ Found Asset Volume")
        : colorError("❌ Not Found Asset Volume will populate with 0")
    );
    console.log(
      optionalFileds.numberOfTrades
        ? colorSuccess("✅ Found Number Of Trades")
        : colorError("❌ Not Found Number Of Trades will populate with 0")
    );

    // Ask user if want to continue
    const continueToImport = await interactCLI({
      type: "autocomplete",
      message: "Import CSV and save to DB?:",
      choices: ["Yes", "No"],
    });

    // Go back if user does not want to continue
    if (continueToImport === "No") return { error: false, data: "Successfully cancelled importing data from CSV" };

    // Parse JSON for DB
    const jsonParsedCandles: Candle[] = jsonCSV.map((entry: LooseObject) => ({
      openTime: optionalFileds.openTime ? new Date(entry[optionalFileds.openTime]).getTime() : 0,
      open: +entry[fieldKeys.open],
      high: +entry[fieldKeys.high],
      low: +entry[fieldKeys.low],
      close: +entry[fieldKeys.close],
      volume: optionalFileds.volume ? +entry[optionalFileds.volume] : 0,
      closeTime: new Date(entry[fieldKeys.closeTime]).getTime(),
      assetVolume: optionalFileds.assetVolume ? +entry[optionalFileds.assetVolume] : 0,
      numberOfTrades: optionalFileds.numberOfTrades ? +entry[optionalFileds.numberOfTrades] : 0,
    }));

    // Create and add meta data
    const meta = {
      name: `${importCSVParams.base + importCSVParams.quote}-${importCSVParams.interval}`,
      symbol: importCSVParams.base + importCSVParams.quote,
      interval: importCSVParams.interval,
      base: importCSVParams.base,
      quote: importCSVParams.quote,
      startTime: jsonParsedCandles[0].closeTime,
      endTime: jsonParsedCandles[jsonParsedCandles.length - 1].closeTime,
      importedFromCSV: true,
      creationTime: new Date().getTime(),
      lastUpdatedTime: new Date().getTime(),
    };

    // Insert candles into the DB
    const insertedCandles = await insertCandles(meta, jsonParsedCandles);
    if (insertedCandles.error) return insertedCandles;

    // Return success
    return {
      error: false,
      data: `Successfully imported ${importCSVParams.base + importCSVParams.quote} from ${new Date(
        meta.startTime
      ).toLocaleString()} to ${new Date(meta.endTime).toLocaleString()}`,
    };
  } catch (error: any) {
    return { error: true, data: error?.message || "Generic error !?" };
  }
}

export async function exportCSV(name: string) {
  // Clear the console
  console.clear();

  // Get candles
  const candlesRequest = await getCandles(name);
  if (candlesRequest.error) return candlesRequest;
  if (typeof candlesRequest.data !== "string") {
    // Get candles keys for the header row
    const keys = Object.keys(candlesRequest.data.candles[0]);

    // Create the header row
    const headerRow = keys.join(",") + "\n";

    // Create the data rows
    const dataRows = candlesRequest.data.candles
      .map((obj: LooseObject) => {
        const values = keys.map((key) => {
          const value = obj[key];
          return typeof value === "string" ? `"${value}"` : value;
        });
        return values.join(",");
      })
      .join("\n");

    // Check if the directory exists, and create it if it doesn't
    const dir = "./csv";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // Write the file to csv folder
    const filePath = path.join(dir, `${name}.csv`);
    fs.writeFileSync(filePath, headerRow + dataRows);
  }

  // Return success
  return { error: false, data: `Successfully exported data to ./csv folder with name ${name}.csv` };
}
