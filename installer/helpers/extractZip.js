const AdmZip = require('adm-zip');


/**
 *
 * @param {String} zipFile : a path to compressed file
 * @param {String} rootDir : a path to where files will be extracted
 */
module.exports = async (zipFile, rootDir) => {
  console.log(`Extracting contents of zip file ${zipFile}... wait a moment, please! It could take a while.`)

  // reading archives
  const zipApp = new AdmZip(zipFile);

  try {
    zipApp.extractAllTo(/*target path*/rootDir, /*overwrite*/false);
    console.log(`Files extracted from "${zipFile}" successfully into ${rootDir}.`)

  } catch (error) {
    console.log(`extraction of ${zipApp} failed`, error);

  }
}