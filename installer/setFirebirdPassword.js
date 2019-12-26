const shell = require('shelljs')
const path = require("path")
const fs = require("fs")
const logger = require('./logger')



module.exports = async () => {
  const binFolderX64 = "C:/Program Files/Firebird/Firebird_2_5/bin/"
  const binFolderX86 = "C:/Program Files (x86)/Firebird/Firebird_2_5/bin/"
  let binPath = ''

  const user = 'SYSDBA'
  //*! Maximum of only 8 bytes can be used to avoid a warning in console
  const defaultPassword = 'masterke'
  const mbdPassword = 'sysdbamb'

  logger.info("setFirebirdPassword: Setting Firebird SYSDBA password.")
  // //** Check which path Firebird is installed (x86 or x64)
  logger.info("setFirebirdPassword: Getting path for installed Firebird")
  try {
    fs.accessSync(binFolderX64, fs.constants.R_OK | fs.constants.W_OK)
    binPath = binFolder
  } catch{
    fs.accessSync(binFolderX86, fs.constants.R_OK | fs.constants.W_OK)
    binPath = binFolderX86
  }
  finally {
    logger.info(`setFirebirdPassword: Firebird bin folder is located at: ${binPath}`)
  }

  logger.info("setFirebirdPassword: Trying to connect to Firebird with default values.")

  shell.cd(path.resolve(binPath))
  logger.info("setFirebirdPassword: Let's try to modify the password.")
  // modify SYSDBA from default password
  if (shell.exec(
    `gsec -user ${user} -password ${defaultPassword} -modify SYSDBA -pw ${mbdPassword}`
  ).code !== 0) {

    logger.info("setFirebirdPassword: Cannot change SYSDBA password! It may already be set up or it is needed to provide the correct credentials. ")

    logger.info("setFirebirdPassword: Let's check if our password is already set up.")
    // modify SYSDBA password
    if (shell.exec(
      `gsec -user ${user} -password ${mbdPassword} -modify SYSDBA -pw ${mbdPassword}`
    ).code !== 0) {
      logger.error("setFirebirdPassword: Sure, Firebird is NEITHER set up with MBD password NOR default. Verify the correct credential and modify it manually.")
      return false

    } else {
      logger.info("setFirebirdPassword: Yeah! The password was already set up! NOTHING TO CHANGE!")
      return true
    }

  }
  else {
    logger.info("setFirebirdPassword: SYSDBA password changed successfully.")
    return true
  }

}