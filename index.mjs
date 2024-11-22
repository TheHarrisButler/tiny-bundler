import JestHasteMap from "jest-haste-map";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import os from "os";
import yargs from "yargs";
import chalk from "chalk";
import Resolver from "jest-resolve";
import { DependencyResolver } from "jest-resolve-dependencies";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "src");

const hasteMap = new JestHasteMap.default({
  id: "js-bundler", //Used for caching.
  extensions: ["js"], // Tells jest-haste-map to only crawl .js files.
  maxWorkers: os.availableParallelism(), //Parallelizes across all available CPUs.
  platforms: [], // This is only used for React Native, you can leave it empty.
  roots: [root], // Can be used to only search a subset of files within `rootDir`
  retainAllFiles: true,
  rootDir: root, //The project root.
});

const { hasteFS, moduleMap } = await hasteMap.build();

const resolver = new Resolver.default(moduleMap, {
  extensions: [".js"],
  hasCoreModules: false,
  rootDir: root,
});

// Initialize Dependency Resolver
const dependencyResolver = new DependencyResolver(resolver, hasteFS);

const args = yargs(process.argv).argv;
const entryPoint = args.entryPoint;
const outputFile = args.output;

if (!hasteFS.exists(entryPoint)) {
  throw new Error(`${entryPoint} does not exist inside of target directory`);
}

console.log(chalk.blue(`-> BUIDLING ${chalk.green(entryPoint)}`));

const seen = new Set();
const queue = [entryPoint];

// Interate over file dirictory starting at the entry point.
// Check for any cycles
while (queue.length) {
  const module = queue.shift();

  if (seen.has(module)) {
    continue;
  }

  seen.add(module);

  queue.push(...dependencyResolver.resolve(module));
}

console.log(chalk.blue(`-> FOUND ${chalk.green(seen.size)} FILES`));

const moduleExports = new Map();

const allCode = [];

console.log(chalk.blue("-> CLEANING"));

Array.from(seen)
  .reverse()
  .map((file) => {
    const code = fs.readFileSync(file, { encoding: "utf8" });
    // Get the file name from the path
    const fileName = file.replace(/^.*[\\/]/, "");

    // extract everything a before the modules.exports
    const moduleBody = code.match(/^[\s\S]*?(?=\s*module\.exports)/);

    // extract everything after the module.exports
    const exports = code.match(/(?<=\s*module\.exports\s*=\s*)[\s\S]*$/);

    // Check if module has any exports
    // add module exports to the module exports map
    if (exports) moduleExports.set(fileName, exports[0]);

    // If there isn't a match that module doesn't have an export or its the entry point.
    allCode.push(!!moduleBody ? moduleBody[0] : code);
  });

console.log(chalk.blue("-> OPTIMIZING"));

const finalOutput = allCode.reduce((acc, moduleBody) => {
  const chunks = moduleBody.split("\n");

  const cleanedChunks = chunks.map((chunk) => {
    if (chunk.includes("require(")) {
      // get the local path from inside of the require
      const path = chunk.match(/require\s*\(\s*["'](.+?)["']\s*\)/)?.[1];
      // split path by "/"
      const pathArray = path.split("/");
      // get the last item in the array
      const lastItem = pathArray[pathArray.length - 1];
      // look up that last item use the moduleExports Map
      const foundExport = moduleExports.get(`${lastItem}.js`);
      // replace the export with the requre statement
      return chunk.replace(/\s*require\(['"](.*?)['"]\)\;/g, foundExport);
    }
    return chunk;
  });

  const joined = cleanedChunks.join("\n");

  acc.push(joined);

  return acc;
}, []);

console.log(chalk.green(`-> WRITING TO ${outputFile}`));

if (finalOutput.length) {
  fs.writeFileSync(outputFile, finalOutput.join("\n"), "utf8");
}
