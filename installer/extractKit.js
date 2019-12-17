const canAccess = require('./helpers/canAccess')
const trycatchFn = require('./helpers/trycatchFn')
const isEmptyDir = require('./helpers/isEmptyDir')
const extractZip = require('./helpers/extractZip')
const path = require('path')
const shell = require('shelljs')


module.exports = async () => {
  // ** Compressed file of Customer Kit to be deployed
  const zipFile = path.join(__dirname, 'assets', 'CLIENTE-SIAC-V19.09.30-4488-CR15-12-2019.zip')
  console.log("TCL: zipFile", zipFile)

  // ** path to root directory for deployment
  const driverLetter = 'C:'
  const rootDir = path.join(driverLetter, 'MBD')
  console.log("TCL: rootDir", rootDir)

  // ** checks existence and access of the directory
  if (await trycatchFn(canAccess, rootDir)) {
    console.log(`check if ${rootDir} is empty`);

    // ** verify if folder is empty for extraction of files
    const isEmpty = await trycatchFn(isEmptyDir, rootDir)

    if (isEmpty) {
      console.log("It's empty! Let's extract files!");
      extractZip(zipFile, rootDir)
    }
    else {
      //**  Otherwise, it must not override an existent  */
      console.log("TCL: main -> isEmpty", isEmpty)
      console.log("Cannot override existing MBD folder. It must be empty to perform a fresh clean Kit deploy!");
    }

  }
  else {
    //** if the folder doesn't already exist, try to create it. */
    const mbdDirSh = await trycatchFn(shell.mkdir, "-p", rootDir)

    // ** if cannot create the folder, something is wrong and should be fixed by user before trying again.
    if (mbdDirSh.code !== 0) {
      console.log("TCL: extractKit -> mbdDirSh.error", mbdDirSh.stderr)
      console.log(`Cannot create ${rootDir} folder.`);
      console.log(`Not possible to extract KIT without being able to access or create ${rootDir}. Fix that and try again!`);
      process.exit(1)

    }
    else {
      //** successful folder creation. It can extract files now. */
      console.log("TCL: extractKit -> mbdDirSh.output", mbdDirSh.stdout)
      console.log(`${rootDir} folder created.`)
      console.log("Let's extract files!");
      extractZip(zipFile, rootDir)
    }

  }
}
