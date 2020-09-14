const prompt = require("prompt");
const colors = require("colors/safe");
const logger = require("./logger");
const extractZip = require("./helpers/extractZip");
const path = require("path");
const fs = require("fs");
const start = require("./start");

(async () => {
  //
  // Setting these properties customizes the prompt.
  //
  prompt.message = colors.green("Kit Installer");
  prompt.delimiter = colors.green(":>");

  const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

  const ValidHostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

  var schema = {
    properties: {
      extractKit: {
        message: colors.red("Do you want only the compressed file?"),
        validator: /y[es]*|n[o]?/,
        warning: "Must respond Yes or No",
        default: "no",
        required: true
      },
      serverornot: {
        message: colors.red("Are you installing the Server or a Terminal?"),
        validator: /s[erver]*|t[erminal]?/,
        warning: "Must respond Server or Terminal",
        default: "server",
        required: true,
        ask: function() {
          return prompt.history("extractKit").value.slice(0, 1) !== "y";
        }
      },
      hostnameorip: {
        message: colors.red("Will you inform IP or Hostname (preferred)?"),
        validator: /i[p]*|h[ostname]?/,
        warning: "Must respond ip or hostname",
        required: true,
        default: "hostname",
        ask: function() {
          return (
            prompt.history("extractKit").value.slice(0, 1) !== "y" &&
            prompt.history("serverornot").value.slice(0, 1) !== "s"
          );
        }
      },
      ip: {
        message: colors.red("What is the IP of the server?"),
        validator: ValidIpAddressRegex,
        warning: "Must be a valid IP",
        required: true,
        ask: function() {
          // only ask for ip if hostnameorip was set to 'ip'
          return (
            prompt.history("extractKit").value.slice(0, 1) !== "y" &&
            prompt.history("serverornot").value.slice(0, 1) !== "s" &&
            prompt.history("hostnameorip") &&
            prompt.history("hostnameorip").value.slice(0, 1) === "i"
          );
        }
      },
      hostname: {
        message: "What is the Hostname of the server?",
        validator: ValidHostnameRegex,
        warning: "Must be a valid Hostname",
        required: true,
        ask: function() {
          // only ask for hostname if hostnameorip was set to 'hostname'
          return (
            prompt.history("extractKit").value.slice(0, 1) !== "y" &&
            prompt.history("serverornot").value.slice(0, 1) !== "s" &&
            prompt.history("hostnameorip") &&
            prompt.history("hostnameorip").value.slice(0, 1) === "h"
          );
        }
      },
      yesno: {
        message: "Are you sure about all your answers?",
        validator: /y[es]*|n[o]?/,
        warning: "Must respond yes or no",
        default: "no"
      }
    }
  };

  prompt.start();

  //
  // Get the prompts
  //
  prompt.get(schema, async function(err, result) {
    if (err) throw err;
    //
    // Log the results.
    //
    logger.info("Command-line input received:");
    logger.info(`  Only extract Kit?   ${result.extractKit}`);
    logger.info(`  Server?   ${result.serverornot}`);
    logger.info(`  Hostname?  ${result.hostnameorip}`);
    logger.info(`  IP  ${result.ip}`);
    logger.info(`  HOSTNAME:  ${result.hostname}`);
    logger.info(`  Yes or no?  ${result.yesno}`);

    if (result.yesno.slice(0, 1) === "n") {
      logger.warn(
        "So, be sure about your answers and restart the application."
      );
      process.exit(0);
    }

    if (result.extractKit.slice(0, 1) === "y") {
      // ** Compressed file of Customer Kit to be deployed
      // const zipFile = path.join(__dirname, 'assets', 'CLIENTE-SIAC-V19.09.30-4488-CR15-12-2019.zip')
      // logger.info(`extractKit: zipFile ${zipFile}`)
      const assetsFolder = path.join(__dirname, "assets");
      const files = fs.readdirSync(assetsFolder);
      if (!files) throw "Unable to scan assets folder";
      console.log("TCL: prompt -> files", files);

      const zipFile = files.filter(filename =>
        /^kit-((?![ .]+$)[a-zA-Z .]*)-(CARDAPIO|SIAC)-(V\d{2}\.\d{2}\.\d{2}(\-\d{4}.*?|\_\w+)?)-(CR\d{4}-\d{1,2}-\d{1,2})(\.zip)$/.test(
          filename
        )
      );
      console.log("TCL: zipFile", zipFile[0]);
      const zipFilePath = path.join(assetsFolder, zipFile[0]);

      logger.info(`extractKit: zipFilePath ${zipFilePath}`);

      // ** path to current directory for deployment
      const rootDir = path.resolve(process.cwd());
      logger.info(`extractKit: rootDir ${rootDir}`);
      const destinationFilePath = path.join(rootDir, zipFile[0]);

      try {
        fs.copyFileSync(zipFilePath, destinationFilePath);
        process.exit(0);
      } catch (error) {
        logger.info(`Failed to copy Zip File. Error: ${error}`);
      }

      // // ** checks existence and access of the directory
      // if (await trycatchFn(canAccess, rootDir)) {
      //   const extractedKit = await extractZip(zipFile, rootDir)
      //   logger.info(`extractKit: main -> extractedKit ${extractedKit}`)
      //   let code;
      //   !extractedKit ? code = 1 : code = 0
      //   process.exit(code)
      // }
    } else {
      if (result.serverornot.splice(0, 1) === "t") {
        const local = false;
        const server = result.hostname || result.ip;
        try {
          logger.info("=== Setup Server params into Config.ini ===");
          // return await modifyConfig(local, server)
          return await start();
        } catch (error) {
          logger.error("Failed to modify config.ini");
          throw error;
        }
      }
      return;
    }
  });

  // //
  // // Add two properties to the empty object: username and email
  // //
  // prompt.addProperties(setup, ['username', 'email'], function (err, result) {
  //   //
  //   // Log the results.
  //   //
  //   console.log(result.email)
  //   console.log('Updated object received:');
  //   console.dir(setup);
  // });
})();

// module.exports = promptMain
