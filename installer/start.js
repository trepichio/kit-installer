// const createDB = require("./createDatabase")
// const deployDesktopShortcuts = require("./deployDesktopShortcuts")
// const extractAndDeployDLLs = require("./extractAndDeployDLLs")
const shell = require('shelljs')
const checkRequirements = require('./checkRequirements.js')
const setFirebirdPassword = require('./setFirebirdPassword.js')
const extractKit = require('./extractKit.js')
const extractAndDeployDLLs = require('./extractAndDeployDLLs.js')
const deployDesktopShortcuts = require('./deployDesktopShortcuts.js')
const trycatchFn = require('./helpers/trycatchFn.js')

const main = async () => {

  // await trycatchFn(extractKit)
  // await trycatchFn(setFirebirdPassword)
  // await trycatchFn(extractAndDeployDLLs)
  await trycatchFn(deployDesktopShortcuts)
}

(async () => {
  try {
    await checkRequirements()
    if (!shell.which('7z') || !shell.which('fbserver')) {
      shell.echo('Sorry, this script requires 7zip and Firebird')
      shell.exit(1);
    }
    else {
      main()
    }
  } catch (error) {
    console.log("TCL: error", error)
  }

})()
