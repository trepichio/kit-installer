// const createDB = require("./createDatabase")
// const deployDesktopShortcuts = require("./deployDesktopShortcuts")
// const extractAndDeployDLLs = require("./extractAndDeployDLLs")
const shell = require('shelljs')
const checkRequirements = require('./checkRequirements')
const setFirebirdPassword = require('./setFirebirdPassword')
const extractKit = require('./extractKit')
const extractAndDeployDLLs = require('./extractAndDeployDLLs')
const deployDesktopShortcuts = require('./deployDesktopShortcuts')
const trycatchFn = require('./helpers/trycatchFn')
const logger = require('./logger')

const main = async () => {

  // Promise.all([setFirebirdPassword, extractKit]).then(extractAndDeployDLLs).then(deployDesktopShortcuts)

  const kitExtracted = await trycatchFn(extractKit)
  if (kitExtracted) {
    logger.info("Kit extracted. Initiating the rest of installation.")
    const firebirdPasswordSetup = await trycatchFn(setFirebirdPassword)
    logger.warn(`Firebird password setup: ${firebirdPasswordSetup} `)

    const dllsExtracted = await trycatchFn(extractAndDeployDLLs)
    logger.warn(`DLLs extracted and registered: ${dllsExtracted} `)

    const shortcutsDeployed = await trycatchFn(deployDesktopShortcuts)
    logger.warn(`Shortcuts deployed: ${shortcutsDeployed} `)

  }
  else {
    logger.error("Cannot complete installation without extracting KIT. Check log for further details.")
  }


}

(async () => {
  logger.info("=== Kit Deployement started ===")
  logger.info("=== Checking Requirements before starting ===")
  try {
    await checkRequirements()
    if (!shell.which('7z') || !shell.which('fbserver')) {
      logger.error('Sorry, this script requires 7zip and Firebird')
      shell.echo('Sorry, this script requires 7zip and Firebird')
      shell.exit(1);
    }
    else {
      main()
    }
  } catch (error) {
    logger.error(`start: error ${error}`)
  }

})()
