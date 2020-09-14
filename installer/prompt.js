const prompts = require("prompts");
const logger = require("./logger");
const path = require("path");
const fs = require("fs");
const start = require("./start");
const admZip = require("adm-zip");

const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const ValidHostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

const assetsFolder = path.join(__dirname, "assets");
const jobFile = path.join(assetsFolder, "thisJob.json");

try {
  var thisJob = JSON.parse(fs.readFileSync(jobFile));
  logger.info(`TCL: thisJob: ${JSON.stringify(thisJob)}`);
} catch (error) {
  logger.error("Cannot read taskFile in assets folder");
  throw error;
}

const { server } = thisJob;

const questions = [
  {
    type: "confirm",
    name: "extractKit",
    message: "Do you want only the compressed file?",
    initial: false
  },
  {
    type: prev => (prev == false ? "select" : null),
    name: "serverornot",
    message: "Are you installing the Server or a Terminal?",
    choices: [
      { title: "Server", value: "s" },
      { title: "Terminal", value: "t" }
    ],
    initial: 0
  },
  {
    type: (prev, values) => (prev == "t" ? "confirm" : null),
    name: "confirmIncludedServer",
    message: `Do you want to use the already configured Server Path ${server}?`,
    initial: true
  },

  {
    type: (prev, values) =>
      !values.extractKit &&
      values.serverornot == "t" &&
      !values.confirmIncludedServer
        ? "select"
        : null,
    name: "hostnameorip",
    message: "Will you inform IP or Hostname (preferred)?",
    choices: [
      { title: "Hostname", value: "h" },
      { title: "IP", value: "i" }
    ],
    initial: 0
  },
  {
    type: (prev, values) =>
      !values.extractKit &&
      values.serverornot == "t" &&
      values.hostnameorip == "i"
        ? "text"
        : null,
    name: "ip",
    message: "What is the IP of the server?",
    validate: text => (ValidIpAddressRegex.test(text) ? true : "Invalid IP")
  },
  {
    type: (prev, values) =>
      !values.extractKit &&
      values.serverornot == "t" &&
      values.hostnameorip == "h"
        ? "text"
        : null,
    name: "hostname",
    message: "What is the Hostname of the server?",
    validate: text =>
      ValidHostnameRegex.test(text) ? true : "Invalid HOSTNAME"
  },
  {
    type: "confirm",
    name: "confirmAnswers",
    message: "Are you sure about all your answers?",
    initial: false
  }
];

(async () => {
  const response = await prompts(questions);

  console.log(response);

  if (!response.confirmAnswers) {
    logger.warn("So, be sure about your answers and restart the application.");
    process.exit(0);
  }

  if (response.extractKit) {
    // ** Compressed file of Customer Kit to be deployed
    // const zipFile = path.join(__dirname, 'assets', 'CLIENTE-SIAC-V19.09.30-4488-CR15-12-2019.zip')
    // logger.info(`extractKit: zipFile ${zipFile}`)
    const assetsFolder = path.join(__dirname, "assets");
    const files = fs.readdirSync(assetsFolder);
    if (!files) throw "Unable to scan assets folder";
    logger.info(`TCL: prompt -> files ${files}`);

    const zipFile = files.filter(filename =>
      /^kit-((?![ .]+$)[a-zA-Z .]*)-(CARDAPIO|SIAC)-(V\d{2}\.\d{2}\.\d{2}(\-\d{4}.*?|\_\w+)?)-(CR\d{4}-\d{1,2}-\d{1,2})(\.zip)$/.test(
        filename
      )
    );
    logger.info(`TCL: zipFile ${zipFile[0]}`);
    const zipFilePath = path.join(assetsFolder, zipFile[0]);

    logger.info(`extractKit: zipFilePath ${zipFilePath}`);

    // ** path to current directory for deployment
    // const rootDir = path.resolve(path.dirname(process.execPath))
    const rootDir = path.resolve(process.cwd());
    logger.info(`extractKit: rootDir ${rootDir}`);
    const destinationFilePath = path.join(rootDir, zipFile[0]);

    try {
      const zipKit = new admZip(zipFilePath);
      const zipBuffer = zipKit.toBuffer();
      // fs.copyFileSync(zipFilePath, destinationFilePath)
      fs.writeFileSync(destinationFilePath, zipBuffer);
      logger.info("Copied Zip file from Kit Installer");
      process.exit(0);
    } catch (error) {
      logger.info(`Failed to copy Zip File. Error: ${error}`);
      process.exit(1);
    }
  } else {
    let payload = {};

    if (response.serverornot === "t") {
      // if (response.confirmIncludedServer)
      payload = {
        local: response.confirmIncludedServer,
        server: response.hostname || response.ip || server
      };
      // else payload = { local: false, server: response.hostname || response.ip };

      // const task = Object.assign({}, thisJob, payload)

      // await start(task)
      // await start(payload)
    } else {
      payload = { local: true, server };
    }
    const task = Object.assign({}, thisJob, payload);
    await start(task);
  }
})();

// async function main() {
//   logger.info("=== Kit Deployement started ===")
//   logger.info("=== Checking Requirements before starting ===")
//   try {
//     await checkRequirements()
//     if (!shell.which('7z') || !shell.which('fbserver')) {
//       logger.error('Sorry, this script requires 7zip and Firebird')
//       shell.echo('Sorry, this script requires 7zip and Firebird')
//       shell.exit(1);
//     }
//     else {
//       const kitExtracted = await trycatchFn(extractKit)
//       if (kitExtracted) {
//         logger.info("Kit extracted. Initiating the rest of installation.")
//         const firebirdPasswordSetup = await trycatchFn(setFirebirdPassword)
//         logger.warn(`Firebird password setup: ${firebirdPasswordSetup} `)

//         const dllsExtracted = await trycatchFn(extractAndDeployDLLs)
//         logger.warn(`DLLs extracted and registered: ${dllsExtracted} `)

//         const shortcutsDeployed = await trycatchFn(deployDesktopShortcuts)
//         logger.warn(`Shortcuts deployed: ${shortcutsDeployed} `)

//       }
//       else {
//         logger.error("Cannot complete installation without extracting KIT. Check log for further details.")
//       }
//     }
//   } catch (error) {
//     logger.error(`start: error ${error}`)
//     throw error
//   }

// }
