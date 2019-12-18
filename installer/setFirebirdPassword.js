const shell = require('shelljs')
const path = require("path")
const fs = require("fs")

const binFolderX64 = "C:/Program Files/Firebird/Firebird_2_5/bin/"
const binFolderX86 = "C:/Program Files (x86)/Firebird/Firebird_2_5/bin/"
let binPath = ''

const user = 'SYSDBA'
//*! Maximum of only 8 bytes can be used to avoid a warning in console
const defaultPassword = 'masterke'
const mbdPassword = 'sysdbamb'

module.exports = () => {

  console.log("Setting Firebird SYSDBA password.");
  //** Check which path Firebird is installed (x86 or x64)
  try {
    fs.accessSync(binFolderX64, fs.constants.R_OK | fs.constants.W_OK)
    binPath = binFolder
  } catch{
    fs.accessSync(binFolderX86, fs.constants.R_OK | fs.constants.W_OK)
    binPath = binFolderX86
  }

  console.log("Trying to connect to database with default values.");

  shell.cd(path.resolve(binPath))
  console.log("Let's try to modify the password.");
  // modify SYSDBA from default password
  if (shell.exec(
    `gsec -user ${user} -password ${defaultPassword} -modify SYSDBA -pw ${mbdPassword}`
  ).code !== 0) {

    console.log("Cannot change SYSDBA password! It may already be set up or it is needed to provide the correct credentials. ");

    // modify SYSDBA password
    if (shell.exec(
      `gsec -user ${user} -password ${mbdPassword} -modify SYSDBA -pw ${mbdPassword}`
    ).code !== 0) {
      console.log("Sure, Firebird is NOT set up with MBD password. Verify the correct credential and modify it manually.");


    } else {
      console.log("Yeah! The password was already set up! NOTHING TO CHANGE!");
    }

  }
  else {
    console.log("SYSDBA password changed successfully.");
  }

}