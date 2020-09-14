const fs = require("fs");
const logger = require("./logger");
const { trueCasePathSync } = require("true-case-path");
/**
 ** Create .BAK file for provided filepath
 *
 * @author João Trepichio
 * @param  {PathLike} path - a path to a directory
 * @param  {String} filename - a filename with extension
 */
module.exports = async (path, filename) => {
  try {
    const truepath = trueCasePathSync(`${path}\\${filename}`);
    logger.info(`Backing up original file as ${truepath}.bak`);
    // fs.renameSync(`${path}/Config.ini`, `${path}/Config.ini.bak`)
    fs.copyFileSync(truepath, `${truepath}.bak`);
    // fs.renameSync(truepath, `${truepath}.bak`)
    logger.info(`Backup of ${truepath} created successfully.`);
  } catch (error) {
    logger.error(`Failed to backup Config.ini. Error: ${error}`);
    throw error;
  }
};
