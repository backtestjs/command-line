import { colorChoice, colorError, colorMessage, colorSuccess } from "../infra/colors";
import { UserQuestions, LooseObject, DataReturn } from "../infra/interfaces";
import autocomplete from "inquirer-autocomplete-prompt";
import DatePrompt from "inquirer-date-prompt";
import inquirer from "inquirer";
import fuzzy from "fuzzy";

export async function handlePortalReturn(portalReturn: DataReturn) {
  if (portalReturn.error) {
    console.log(colorError(portalReturn.data));
  } else console.log(colorSuccess(portalReturn.data));
}

function stripAnsi(str: string): string {
  return str.replace(/\u001B\[(\d+(;\d+)*)?m/g, "");
}

export async function interactCLI(paramsCLI: UserQuestions) {
  let response: any = "";

  function searchCLI(answers: LooseObject, input = "") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fuzzy.filter(input, paramsCLI.choices ?? []).map((el) => el.original));
      }, Math.random() * 470 + 30);
    });
  }

  //@ts-ignore needed for DatePrompt
  inquirer.registerPrompt("date", DatePrompt);
  inquirer.registerPrompt("autocomplete", autocomplete);

  const objectCLI: LooseObject = {
    type: paramsCLI.type,
    name: "interact",
    message: colorMessage(paramsCLI.message),
  };

  if (paramsCLI.type === "autocomplete") {
    paramsCLI.choices = paramsCLI.choices?.map((choice) => colorChoice(choice));
    objectCLI.choices = paramsCLI.choices;
    objectCLI.source = searchCLI;
  }

  if (paramsCLI.type === "date") {
    objectCLI.default = new Date(paramsCLI.dateDefault ?? "");
    objectCLI.format = { month: "short" };
  }

  if (paramsCLI.type === "checkbox") {
    paramsCLI.choices = paramsCLI.choices?.map((choice) => colorChoice(choice));
    objectCLI.choices = paramsCLI.choices;
  }

  await inquirer.prompt(objectCLI).then((answer: LooseObject) => {
    response = answer["interact"];
  });

  if (paramsCLI.type === "checkbox") {
    for (let i = 0; i < response.length; i++) {
      response[i] = stripAnsi(response[i]);
    }
  }

  return paramsCLI.type === "date" || paramsCLI.type === "checkbox" ? response : stripAnsi(response);
}
