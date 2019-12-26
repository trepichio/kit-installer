const canAccess = require('./helpers/canAccess')
const trycatchFn = require('./helpers/trycatchFn')
const isEmptyDir = require('./helpers/isEmptyDir')
const extractZip = require('./helpers/extractZip')
const path = require('path')
const shell = require('shelljs')
const logger = require('./logger');



module.exports = async () => {
  // ** Compressed file of Customer Kit to be deployed
  const zipFile = path.join(__dirname, 'assets', 'CLIENTE-SIAC-V19.09.30-4488-CR15-12-2019.zip')
  logger.info(`extractKit: zipFile ${zipFile}`)

  // ** path to root directory for deployment
  const driverLetter = 'C:'
  const rootDir = path.join(driverLetter, 'MBD')
  logger.info(`extractKit: rootDir ${rootDir}`)

  // ** checks existence and access of the directory
  if (await trycatchFn(canAccess, rootDir)) {
    logger.info(`check if ${rootDir} is empty`);

    // ** verify if folder is empty for extraction of files
    const isEmpty = await trycatchFn(isEmptyDir, rootDir)

    if (isEmpty) {
      logger.info("It's empty! Let's extract files!");
      const extractedKit = await extractZip(zipFile, rootDir)
      logger.info(`extractKit: main -> extractedKit ${extractedKit}`)
      return extractedKit

    }
    else {
      //**  Otherwise, it must not override an existent  */
      logger.info(`extractKit: main -> isEmpty ${isEmpty}`)
      logger.error("Cannot override existing MBD folder. It must be empty to perform a fresh clean Kit deploy!");
    }

  }
  else {
    //** if the folder doesn't already exist, try to create it. */
    const mbdDirSh = await trycatchFn(shell.mkdir, "-p", rootDir)

    // ** if cannot create the folder, something is wrong and should be fixed by user before trying again.
    if (mbdDirSh.code !== 0) {
      logger.info(`extractKit: extractKit -> mbdDirSh.error ${mbdDirSh.stderr}`)
      logger.error(`Cannot create ${rootDir} folder.`);
      logger.error(`Not possible to extract KIT without being able to access or create ${rootDir}. Fix that and try again!`);
      process.exit(1)

    }
    else {
      //** successful folder creation. It can extract files now. */
      logger.info(`extractKit: extractKit -> mbdDirSh.output ${mbdDirSh.stdout}`)
      logger.info(`${rootDir} folder created.`)
      logger.info("Let's extract files!");
      const extractedKit = await extractZip(zipFile, rootDir)
      logger.info(`extractKit: main -> extractedKit ${extractedKit}`)
      return extractedKit
    }

  }
}
