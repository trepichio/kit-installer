// const createDB = require("./createDatabase")
// const deployDesktopShortcuts = require("./deployDesktopShortcuts")
// const extractAndDeployDLLs = require("./extractAndDeployDLLs")
const shell = require('shelljs')
const checkRequirements = require('./checkRequirements.js')
const extractKit = require('./extractKit.js')

const main = () => {

  extractKit()
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
