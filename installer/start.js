// const createDB = require("./createDatabase")
// const deployDesktopShortcuts = require("./deployDesktopShortcuts")
// const extractAndDeployDLLs = require("./extractAndDeployDLLs")
// const promptSorT = require('./promptServerOrTerminal')

// var setup = {}
module.exports = async data => {
  const shell = require("shelljs");
  const checkRequirements = require("./checkRequirements");
  const setFirebirdPassword = require("./setFirebirdPassword");
  const extractKit = require("./extractKit");
  const extractAndDeployDLLs = require("./extractAndDeployDLLs");
  const deployDesktopShortcuts = require("./deployDesktopShortcuts");
  const trycatchFn = require("./helpers/trycatchFn");
  const logger = require("./logger");
  const modifyConfigIni = require("./modifyConfigIni");

  logger.info(`TCL: main -> data: ${data}`);
  // (async () => {
  logger.info("=== Kit Deployement started ===");
  logger.info("=== Checking Requirements before starting ===");
  try {
    await checkRequirements();
    if (!shell.which("7z") || !shell.which("fbserver")) {
      logger.error("Sorry, this script requires 7zip and Firebird");
      shell.echo("Sorry, this script requires 7zip and Firebird");
      shell.exit(1);
    } else {
      logger.info("Let's try to extract files from Kit");
      const kitExtracted = await trycatchFn(extractKit, data);
      if (!!kitExtracted) {
        logger.info("Kit extracted. Initiating the rest of installation.");
        if (!data.local) await modifyConfigIni(data);

        const firebirdPasswordSetup = await trycatchFn(setFirebirdPassword);
        logger.warn(`Firebird password setup: ${firebirdPasswordSetup} `);

        const dllsExtracted = await trycatchFn(extractAndDeployDLLs, data);
        logger.warn(`DLLs extracted and registered: ${dllsExtracted} `);

        const shortcutsDeployed = await trycatchFn(
          deployDesktopShortcuts,
          data
        );
        logger.warn(`Shortcuts deployed: ${shortcutsDeployed} `);
      } else {
        logger.error(
          "Cannot complete installation without extracting KIT. Check log for further details."
        );
      }
    }
  } catch (error) {
    logger.error(`start: error ${error}`);
    throw error;
  }

  // })()
  process.stdin.resume(); //so the program will not close instantly
};
// (async () => {
