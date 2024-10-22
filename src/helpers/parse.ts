import { LooseObject } from "@backtestjs/core";

const { Console } = require("console");
const { Transform } = require("stream");

export function round(numberToConvert: number) {
  // If the number is greater than or equal to 1, round to two decimal places
  if (Math.abs(numberToConvert) >= 1) {
    return +numberToConvert.toFixed(2);
  }

  // If the number is less than 1
  else {
    let strNum = numberToConvert.toFixed(20);
    let i = 0;

    // Find the first non-zero digit
    while (strNum[i + 2] === "0") {
      i++;
    }

    // Extract and round the number up to three places after the first non-zero digit
    let rounded = parseFloat(strNum.slice(0, i + 2 + 3 + 1));

    // Convert the rounded number back to a string and truncate to the required number of decimal places
    const strRounded = rounded.toString();

    // Return the rounded number
    return +strRounded.slice(0, i + 2 + 3);
  }
}

export function removeIndexFromTable(data: LooseObject[]) {
  const ts = new Transform({
    transform(chunk: any, enc: any, cb: any) {
      cb(null, chunk);
    },
  });
  const logger = new Console({ stdout: ts });
  logger.table(data);
  const table = (ts.read() || "").toString();
  let result = "";
  for (let row of table.split(/[\r\n]+/)) {
    let r = row.replace(/[^┬]*┬/, "┌");
    r = r.replace(/^├─*┼/, "├");
    r = r.replace(/│[^│]*/, "");
    r = r.replace(/^└─*┴/, "└");
    r = r.replace(/'/g, " ");
    result += `${r}\n`;
  }
  console.log(result);
}
