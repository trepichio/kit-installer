const fs = require("fs");
const ini = require("ini");
const path = require("path");
// const config = require('config')
const logger = require("./logger");
const backupConfigIniFiles = require("./backupConfigIniFiles");
const trycatchFn = require("./helpers/trycatchFn");
const { trueCasePathSync } = require("true-case-path");

/**
 ** Modifies some params in config.ini files for each program of Kit
 *
 * @author João Trepichio
 * @function modifyConfigIni
 * @param  {Object} data - task object from queue
 */

module.exports = async data => {
  // const { kitName, kitPrograms, server } = config.get('Builder').preparation
  const { kitName, kitPrograms, server, local, rootDir, driverLetter } = data;
  const dirSysName = "Sistemas";
  // const { dbPath } = config.get('Builder').dbConfig
  // const { dirRootName, dirSysName, driverLetter } = config.get('Builder').builderConfig
  // const { "RAZAO SOCIAL": RAZAOSOCIAL, FANTASIA, CNPJ, IE, ENDERECO, N, COMPLEMENTO, BAIRRO, CIDADE, UF, TELEFONE, IM, CONTATO, CEP } = config.get('Builder').CustomerRegistration

  const baseDir = path.join(driverLetter, rootDir, dirSysName);
  // const server = "localhost"
  // const shared_printer_path = "EPSON"
  // const database_folder = "C:\\MBD\\DB\\"
  // const database_folder = dbPath
  // const database_folder = `${driverLetter}:\\${rootDir}\\DB\\`

  logger.info("Setting up config files.");
  // const aFolders = ["Retaguarda", "Lança-Touch", "Frente Touch"]

  switch (kitName) {
    case "SIAC":
      for (const { name, version } of kitPrograms) {
        let pathProgram = path.join(baseDir, name);
        try {
          logger.info(
            `creating a backup file for Config.ini in ${pathProgram}`
          );
          await backupConfigIniFiles(pathProgram, "config.ini");
        } catch (error) {
          logger.error(
            `Cannot continue processing the job without doing backup of config.ini of ${pathProgram}`
          );
        }

        const iniFilePath = await trycatchFn(
          trueCasePathSync,
          `${pathProgram}\\config.ini`
        );
        logger.info("TCL: iniFilePath", iniFilePath);

        if (!iniFilePath)
          throw `modifyConfigIni -> iniFilePath for ${kitName}-${name} is undefined`;
        try {
          logger.info(`Reading Config file of folder ${name}`);
          //Windows is case insensitive when reading file but other plataforms are not
          const configIni = ini.parse(fs.readFileSync(iniFilePath, "utf-8"));

          if (configIni.CONFBASE) {
            configIni.CONFBASE.LOCAL = local;
            configIni.CONFBASE.SERVER = `${server}`;
            // configIni.CONFBASE.PATH = `${database_folder}`
          }
          if (configIni.MBDDOCS) {
            configIni.MBDDOCS.LOCAL = local;
            configIni.MBDDOCS.SERVER = `${server}`;
            // configIni.MBDDOCS.PATH = `${database_folder}`
          }

          logger.info(`Writing Modified Config file of folder ${name}`);
          fs.writeFileSync(
            `${pathProgram}/Config_modified.ini`,
            ini.stringify(configIni)
          );

          logger.info(`Renaming modified file for usage`);
          fs.renameSync(`${pathProgram}/Config_modified.ini`, iniFilePath);
        } catch (error) {
          logger.error(
            `Cannot modify config.ini from ${pathProgram} because of error: ${error}`
          );
        }
      }

      break;

    case "CARDAPIO":
      // aFolders.forEach(folder => {
      for (const { name, version } of kitPrograms) {
        // let path = `${baseDir}/${program}`
        let pathProgram = path.join(baseDir, name);
        try {
          logger.info(
            `creating a backup file for Config.ini in ${pathProgram}`
          );
          await backupConfigIniFiles(pathProgram, "config.ini");
        } catch (error) {
          logger.error(
            `Cannot continue processing the job without doing backup of config.ini of ${pathProgram}`
          );
        }
        const iniFilePath = await trycatchFn(
          trueCasePathSync,
          `${pathProgram}\\config.ini`
        );
        logger.info("TCL: iniFilePath", iniFilePath);

        if (!iniFilePath)
          throw `modifyConfigIni -> iniFilePath for ${kitName}-${name} is undefined`;
        try {
          logger.info(`Reading Config file of folder ${name}`);
          //Windows is case insensitive when reading file but other plataforms are not
          const configIni = ini.parse(fs.readFileSync(iniFilePath, "utf-8"));

          if (configIni.CONFBASE) {
            configIni.CONFBASE.LOCAL = local;
            configIni.CONFBASE.SERVER = `${server}`;
            // configIni.CONFBASE.PATH = `${database_folder}`
          }
          if (configIni.BASEFECHA) {
            configIni.BASEFECHA.LOCALF = local;
            configIni.BASEFECHA.SERVERF = `${server}`;
            // configIni.BASEFECHA.PATHF = `${database_folder}`
          }
          if (configIni.BASEOLD) {
            configIni.BASEOLD.LOCALO = local;
            configIni.BASEOLD.SERVERO = `${server}`;
            // configIni.BASEOLD.PATHO = `${database_folder}`
          }
          if (configIni.MBDDOCS) {
            configIni.MBDDOCS.LOCAL = local;
            configIni.MBDDOCS.SERVER = `${server}`;
            // configIni.MBDDOCS.PATH = `${database_folder}`
          }
          logger.info(`Writing Modified Config file of folder ${name}`);
          fs.writeFileSync(
            `${pathProgram}/Config_modified.ini`,
            ini.stringify(configIni)
          );

          logger.info(`Renaming modified file for usage`);
          fs.renameSync(`${pathProgram}/Config_modified.ini`, iniFilePath);
        } catch (error) {
          logger.error(
            `Cannot modify config.ini from ${pathProgram} because of error: ${error}`
          );
        }
      }
      break;
  }
};
