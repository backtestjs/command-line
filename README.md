![GitHub](https://img.shields.io/github/license/backtestjs/command-line)
![GitHub package.json version](https://img.shields.io/github/package-json/v/backtestjs/command-line)
[![npm](https://img.shields.io/badge/package-npm-white)](https://www.npmjs.com/package/@backtest/command-line)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fbacktestjs%2Fframework&count_bg=%23AE21A7&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=views&edge_flat=false)](https://hits.seeyoufarm.com)

# Backtest JS: Command-line Interface (CLI)

Enhance your trading strategies with Backtest, the leading CLI tool crafted for trading developers. Leverage the power of TypeScript (or JavaScript) to backtest your strategies with unmatched precision, efficiency, and flexibility.

## Key Features 🌟

- **Intuitive CLI Interface**: User-friendly command-line interface for smooth operation.

- **Comprehensive Candle Data**: Access historical candle data from Binance or effortlessly import your own CSV files.

- **Integrated Storage**: Efficiently store your candle data, strategies, and results in the internal SQLite storage.

- **Documentation**: Maximize Backtest’s capabilities with thorough guides and resources.

## Quick Start

### How to try it out

Install package globally, and then excute it. That's all 👇

```bash
npm install -g @backtest/command-line
npx backtest
```

But **WAIT**, there's more! This is perfect for checking functionality and running strategies well-defined. However, if you want to write your own strategies, probably, you'll need a local copy of the project. This way, you can debug 🐞 and test your strategies more effectively.

Otherwise, if you're a skilled developer or you want to integrate Backtest into your project, consider using the [Backtest Framework](https://github.com/backtestjs/framework) directly or starting from the [Quick Start](https://github.com/backtestjs/quick-start) project.

### Setup Environment

Follow these instructions to set up the environment locally:

```bash
  git clone git@github.com:backtestjs/command-line.git backtest-cli
  cd backtest-cli
  npm install
```

### Initial Setup

When you run the project for the first time, you need to set up the database. Follow these steps:

1. Validate your Prisma schemas: `npx prisma validate`
2. Generate the Prisma client: `npx prisma generate`
3. Create the database: `npx prisma db push`

These commands ensure that your project is properly configured and ready to use.

**_Note_**: If you are not familiar with **Prisma** and the commands above, you can use `npm run align-db` to align the schema with the database.

```bash
npm run align-db
```

### Run this project

Start strategic backtesting with a single command:

```bash
  npm run dev # main.ts
  npm run start # dist/main.js
```

## Historical Candle Data

Easily download candle data from Binance or import it from a CSV file for strategy execution. Additionally, you can export your data to a CSV file via the CLI with just a few clicks. No coding or API key is required (thanks Binance!).

## Custom Strategies

In addition to the demonstration strategies already present, you can create your own by adding a file under `src/strategies`.

Use one of the existing files or the examples present in this [link](https://github.com/backtestjs/framework) as a reference. Each file should contain a `runStrategy` method, and if it uses external or dynamic parameters, it should also include a properly filled-out `properties` structure.

Whenever you create a new strategy, modify the `properties` structure of an existing one, or delete an existing strategy, you need to run the `🌀 Scan Trading Strategies` CLI command.

If you run your strategy with `alwaysFreshLoad` set to true, there’s no need to stop or restart the backtest process if it’s running, or to exit the program. The program will reload the contents of your file with each launch, as long as it’s synchronized. But, pay attention, it's important to note that in this case you cannot use global variables in your strategy. As a result, you won't be able to take advantage of the benefits of using support historical

Using well-defined or dynamic parameters (instead of constants within your strategy) will allow you to run multiple tests simultaneously.

### How to write a Custom Strategy

Please, refer to [Write a Strategy](https://github.com/backtestjs/framework) to discover how write your custom strategy.

### How to execute a Custom Strategy

1. Create a new file under `src/strategies`.
2. Write your strategy (see above for more details).
3. Export a `runStrategy` method.
4. If your strategy uses external or dynamic parameters, export a `properties` structure.
5. Run the `🌀 Scan Trading Strategies` CLI command.
6. Run the `🏃 Run Trading Strategy` CLI command.
7. Select your strategy from the list.
8. Follow the prompts to enter the required parameters.
9. View and enjoy the results.

## Visualize Results

BacktestJS not only delivers performance insights but also visualizes your strategy’s effectiveness through comprehensive charts and statistics.

### Income Results, Buy/Sell Locations, and More

Explore the visual representation of your trading outcomes, from income results to buy/sell locations, offering you a clear view of your strategy’s performance.

![General Info](https://github.com/backtestjs/command-line/blob/main/screenshots/results/1-general.png?raw=true)

![Total Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/results/2-total-stats.png?raw=true)

![Trade Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/results/3-trade-stats.png?raw=true)

![Trade Buy Sell Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/results/4-trade-buy-sell-stats.png?raw=true)

![Asset Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/results/5-asset-stats.png?raw=true)

![Income Results](https://github.com/backtestjs/command-line/blob/main/screenshots/results/6-income-results.png?raw=true)

![Buy Sell Locations](https://github.com/backtestjs/command-line/blob/main/screenshots/results/7-buy-sell-location.png?raw=true)

![All Orders](https://github.com/backtestjs/command-line/blob/main/screenshots/results/8-all-orders.png?raw=true)

### Multi Value Results

Examine permutation results and heatmap visualizations to refine your strategies across different values all in one run.

![General Info](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-results/1-general-info.png?raw=true)

![Total Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-results/2-total-stats.png?raw=true)

![Asset Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-results/3-asset-stats.png?raw=true)

![Permutation Results](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-results/4-permutation-results.png?raw=true)

![Heatmap](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-results/5-heatmap.png?raw=true)

### Multi Symbol Results

See if that killer strategy works across the board on many symbols and timeframes with ease. Get all your results in one shot with blazing fast results.

![General Info](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-symbols/1-general-info.png?raw=true)

![Total Stats](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-symbols/2-total-stats.png?raw=true)

![Permutation Results](https://github.com/backtestjs/command-line/blob/main/screenshots/multi-symbols/3-permutation-results.png?raw=true)

## Import Candle Data from CSV

Although there is an option to download data from **binance** for `crypto` assets there is no automatic download available for traditional symbols such as `apple` or `tesla` stock as well as forex symbols such as `usdyen`.

This candle data can be downloaded from third party sites such as `yahoo finance` and can then be easily imported to the Backtest database to use with any strategy.

### How to prepare CSV file

The CSV file **must** have the following fields:

- Close time of the candle: closeTime or date
- Open price of the candle: open
- High price of the candle: high
- Low price of the candle: low
- Close price of the candle: close

The CSV file can have the following **optional** fields:

- Open time of the candle: openTime, openTime
- Volume in the candle: volume
- Asset volume of the candle: assetVolume
- Number of trades done in the candle: numberOfTrades

**_Pay attention_**: follow these rules:

- Each field can be written without considering case sensitivity.
- The order of the fields in the CSV file is not important.
- Any additional fields will not cause an error but won't be added to the database.

## Support the project

This open-source project grows thanks to everyone's support. If you appreciate this work and want to keep it active, consider making a small donation. Even a small contribution, like the cost of a coffee ☕, can make a difference!

### Why Donate?

- You support the continuous development and maintenance of the project.
- You contribute to creating new features and improvements.

### How to Donate?

You can make a donation through:

**Lighjtning Network**
roaringcent59@walletofsatoshi.com

**Bitcoin address**
bc1qtly7cqy8zxzs79ksmdsfnz7hjyhhd3t2f9mvvj

**Ethereum address**
0xa4A79Be4e7AE537Cb9ee65DB92E6368425b2d63D

Thank you for your support! 💙

<br/>
<br/>
<br/>

## This or that (!?)

**_TL;DR_** If you are unaware of the original project, you probably don’t need to read further unless you’re curious.

If you’re wondering why there are two similar repositories (this one and the one you can find [here](https://github.com/andrewbaronick/BacktestJS)), the answer is simple: Andrew’s is the original platform, and it’s well-made, but it hasn’t been updated for a while. While waiting for the author to resume work on it, I decided to create an updated and maintained version. The original license allows this (at least it seems clear to me), and we don’t intend to change the license in the future. The basic idea is to keep this product updated and add some features over time. So far, we’ve added what we needed, which includes:

- Agile loading of strategies (added the command `🌀 Scan Trading Strategies`);
- Removed explicit commands for adding and deleting strategies in favor of the single scan command;
- Strategies are always **reloaded as code**, so you just need to modify the code on the fly and save the `.ts` file. Then, by restarting the strategy from the CLI, even from an already running process, the new version is used;
- Modified the HTML template to make a few things clearer for now (like params, colors, note, ..);
- Added the ability to include a **note** on purchase and sale (to understand why a purchase or sale was made, the reason is reported in the “all orders” section of the HTML file);
- Added structure `properties` inside strategy file `.ts`. This greatly helps in adding or proliferating strategies; just rescan and you’re done;
- Ability to use `Node v18` or _higher_ (for this, we removed tulind and added technicalindicators, although both are old and tulind is undoubtedly a great choice. If you need it, you can still add it back in the fork).
- Decoupling of [Backtest Framework](https://github.com/backtestjs/framework) functionality from CLI commands exposed through this project.

What might come or be requested (f.e.):

- Ability to call it globally from the shell command line;
- Specify an external folders for strategies, especially useful if executed globally (see above point);
- A bit more structured documentation, including more specific and sophisticated examples.

Assumptions for the future:

- The product will remain accessible and usable for free;
- External collaborations or maintainers are always welcome.
- Possible funding options will be considered if needed to keep the product updated, but for now, it’s not necessary or useful to think about it;

## Thanks to ❤️

The original project is currently on hold. However, thanks to the permissive license, we aim to continue the author’s work. We express our gratitude and recognition for creating a usable product under a license that allows for external adoption and support.

So, our thanks to Andrew Baronick ( [GitHub](https://www.github.com/andrewbaronick) / [LinkedIn](https://www.linkedin.com/in/andrew-baronick/) )
