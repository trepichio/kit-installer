const AdmZip = require('adm-zip');
const logger = require('../logger')


/**
 *
 * @param {String} zipFile : a path to compressed file
 * @param {String} rootDir : a path to where files will be extracted
 */
module.exports = async (zipFile, rootDir, override = false) => {
  logger.info(`extractZip: Extracting contents of zip file ${zipFile}... wait a moment, please! It could take a while.`)

  // reading archives
  const zipApp = new AdmZip(zipFile);

  try {
    zipApp.extractAllTo(/*target path*/ rootDir, /*overwrite*/ override);
    logger.info(`extractZip: Files extracted from "${zipFile}" successfully into ${rootDir}.`)
    return true

  } catch (error) {
    logger.info(`extractZip: extraction of ${zipApp} failed`, error);
    return undefined
  }
}