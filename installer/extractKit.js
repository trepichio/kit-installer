const canAccess = require("./helpers/canAccess");
const trycatchFn = require("./helpers/trycatchFn");
const isEmptyDir = require("./helpers/isEmptyDir");
const extractZip = require("./helpers/extractZip");
const path = require("path");
const shell = require("shelljs");
const logger = require("./logger");
const fs = require("fs");

module.exports = async data => {
  // ** Compressed file of Customer Kit to be deployed
  // const zipFile = path.join(__dirname, 'assets', 'CLIENTE-SIAC-V19.09.30-4488-CR15-12-2019.zip')
  const assetsFolder = path.join(__dirname, "assets");
  const files = fs.readdirSync(assetsFolder);
  if (!files) throw "Unable to scan assets folder";
  console.log("TCL: main -> files", files);

  const kitRegex = /^kit-((?![ .]+$)[a-zA-Z .]*)-(CARDAPIO|SIAC)-(V\d{2}\.\d{2}\.\d{2}(\-\d{4}.*?|\_\w+)?)-(CR\d{4}-\d{1,2}-\d{1,2})(\.zip)$/;

  const zipFile = files.filter(filename => kitRegex.test(filename));
  console.log("TCL: zipFile", zipFile[0]);

  const [kitFilename, razaoSocial, kitName, kitVersion] = zipFile[0].match(
    kitRegex
  );
  console.log(
    "TCL: [kitFilename, razaoSocial, kitName, kitVersion]",
    kitFilename,
    razaoSocial,
    kitName,
    kitVersion
  );

  const zipFilePath = path.join(assetsFolder, kitFilename);

  logger.info(`extractKit: zipFilePath ${zipFilePath}`);

  // ** path to root directory for deployment
  const { driverLetter, rootDir } = data;
  const installPath = path.join(driverLetter, rootDir);
  logger.info(`extractKit: installPath ${installPath}`);

  // ** checks existence and access of the directory
  logger.info(`check if ${installPath} exists`);
  if (await trycatchFn(canAccess, installPath)) {
    logger.info(`check if ${installPath} is empty`);
    // ** verify if folder is empty for extraction of files
    const isEmpty = await trycatchFn(isEmptyDir, installPath);

    if (isEmpty) {
      logger.info("It's empty! Let's extract files!");
      const extractedKit = await extractZip(zipFilePath, driverLetter + "\\");
      logger.info(`extractKit: main -> extractedKit ${extractedKit}`);
      return extractedKit;
    } else {
      //**  Otherwise, it must not override an existent  */
      logger.info(`extractKit: main -> isEmpty ${isEmpty}`);
      logger.error(
        "Cannot override existing MBD folder. It must be empty to perform a fresh clean Kit deploy!"
      );
      process.exit(1);
    }
  } else {
    logger.info(`${installPath} doesn't exists, so let's try to create it.`);
    //** if the folder doesn't already exist, try to create it. */
    const mbdDirSh = await trycatchFn(shell.mkdir, "-p", installPath);

    // ** if cannot create the folder, something is wrong and should be fixed by user before trying again.
    if (mbdDirSh.code !== 0) {
      logger.info(
        `extractKit: extractKit -> mbdDirSh.error ${mbdDirSh.stderr}`
      );
      logger.error(`Cannot create ${rootDir} folder.`);
      logger.error(
        `Not possible to extract KIT without being able to access or create ${installPath}. Fix that and try again!`
      );
      process.exit(1);
    } else {
      //** successful folder creation. It can extract files now. */
      logger.info(
        `extractKit: extractKit -> mbdDirSh.output ${mbdDirSh.stdout}`
      );
      logger.info(`${rootDir} folder created.`);
      logger.info("Let's extract files!");
      const extractedKit = await extractZip(zipFilePath, driverLetter + "\\");
      logger.info(`extractKit: main -> extractedKit ${extractedKit}`);
      return extractedKit;
    }
  }
};
