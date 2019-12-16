const shell = require('shelljs')
const path = require("path")
const fs = require("fs")
const Firebird = require('node-firebird');

const binFolder = "C:/Program Files/Firebird/Firebird_2_5/bin/"
const binFolderX86 = "C:/Program Files (x86)/Firebird/Firebird_2_5/bin/"
let binPath = ''

var options = {};

options.host = '127.0.0.1';
options.port = 3050;
options.database = 'C:\\MBD\\DB\\ARCOIRIS.fdb';
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 4096;        // default when creating database


module.exports = (user = "SYSDBA", oldPwd = "masterkey", newPwd = "sysdbambd") => {

  console.log("Setting Firebird SYSDBA password.");
  //** Check which path Firebird is installed (x86 or x64)
  try {
    fs.accessSync(binFolder, fs.constants.R_OK | fs.constants.W_OK)
    binPath = binFolder
  } catch{
    fs.accessSync(binFolderX86, fs.constants.R_OK | fs.constants.W_OK)
    binPath = binFolderX86
  }

  // try {
  console.log("Trying to connect to database with default values.");
  Firebird.attach(options, function (err, db) {

    if (err) {
      console.log("Connection with Firebird SYSDBA default values failed. Error: ", err);

      console.log("trying with MBD values");
      options.password = 'sysdbambd'
      Firebird.attach(options, function (err, dbm) {

        if (err) {

          console.log("Connection with Firebird SYSDBA modifed values also failed. Probably there is another password defined by user. Error: ", err);


        } else {
          console.log("OK. DB connected with MBD values. NOTHING CHANGED!");
          //TODO: SCRIPT HANGING MAYBE BECAUSE DB IS STILL ATTACHED? WITH SHELL EXIT NO MORE. TEST EVERYTHING!
          //CLOSE CONNECTION
          console.log("connection closed");
          // dbm.detach((err) => shell.exit(0))
          dbm.detach((err) => err)

        }

      });

    }
    else {

      //success!
      console.log("OK. DB connected with default values.");
      db.detach((err) => console.log("detach err:", err));

      shell.cd(path.resolve(binPath))
      console.log("Let's try to modify the password.");
      // modify SYSDBA password
      if (shell.exec(
        `gsec -user ${user} -password ${oldPwd} -modify SYSDBA -pw ${newPwd}`
      ).code !== 0) {

        console.log("Cannot change SYSDBA password! It may already be set up or it is needed to provide the correct credentials. ");

      } else {
        console.log("SYSDBA password changed successfully.");
      }
    }

    // db.detach()
  });


}
