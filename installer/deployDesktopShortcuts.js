const ws = require("./assets/windows-shortcuts/lib/windows-shortcuts");
const path = require("path");
const fs = require("fs");
const logger = require("./logger");
const shell = require("shelljs");
const util = require("util");
// Requires the Windows Shortcut Maker module
const sm = require("./assets/windows-shortcut-maker");

module.exports = async data => {
  const { driverLetter, rootDir, kitPrograms, kitName } = data;

  const apps = {
    SIAC: [
      {
        parentFolder: "Sistemas/Retaguarda",
        name: "Retaguarda",
        execPath: "SIAC.exe"
      },
      {
        parentFolder: "Sistemas/Pre-Venda",
        name: "Pre-Venda",
        execPath: "PreVenda.exe"
      },
      {
        parentFolder: "Sistemas/Frente",
        name: "Frente",
        execPath: "Caixa.exe"
      },
      {
        parentFolder: "Sistemas/SAT Gerenciador",
        name: "SAT Gerenciador",
        execPath: "SatGerenciador.exe"
      }
    ],
    CARDAPIO: [
      {
        parentFolder: "Sistemas/Retaguarda",
        name: "Retaguarda",
        execPath: "Retaguarda.exe"
      },
      {
        parentFolder: "Sistemas/Lança-Touch",
        name: "Lança-Touch",
        execPath: "Touch.exe"
      },
      {
        parentFolder: "Sistemas/Frente",
        name: "Frente",
        execPath: "Caixa.exe"
      },
      {
        parentFolder: "Sistemas/Frente Touch",
        name: "Frente Touch",
        execPath: "FrenteTouch.exe"
      },
      {
        parentFolder: "Sistemas/SAT Gerenciador",
        name: "SAT Gerenciador",
        execPath: "SATGerenciador.exe"
      }
    ]
  };

  const remoteApps = [
    { parentFolder: "Acesso", name: "AnyDesk", execPath: "AnyDesk.exe" },
    { parentFolder: "Acesso", name: "TeamViewer", execPath: "TeamViewerQS.exe" }
  ];

  let selectedApps = [];

  for (const { name } of kitPrograms) {
    const [selectedApp] = apps[kitName].filter(app => app.name === name);
    selectedApps.push(selectedApp);
  }

  const allSelectedApps = [...selectedApps, ...remoteApps];
  /**
   * * resolves path to root directory of Installer scripts inside project
   */
  const rootInstaller = path.resolve(__dirname);
  logger.info(`deployDesktopShortcuts: rootInstaller ${rootInstaller}`);

  // const rootDir = path.resolve("C:\\MBD")
  const mbdDir = path.join(driverLetter, rootDir);
  logger.info(`deployDesktopShortcuts: rootDir ${mbdDir}`);

  const shortcutMakerFilename = "Shortcut.exe";

  const shortcutBuffer = fs.readFileSync(
    path.join(rootInstaller, "assets", "Shortcut.exe")
  );

  /*  const shortcutMakerFilename = "lnk.vbs";

  const shortcutBuffer = fs.readFileSync(
    path.join(
      rootInstaller,
      "assets",
      "windows-shortcut-maker",
      "scripts",
      "lnk.vbs"
    )
  ); */

  shell.cd(path.dirname(process.execPath));
  fs.writeFileSync(
    path.join(process.cwd(), shortcutMakerFilename),
    shortcutBuffer
  );

  const homedir = require("os").homedir();
  logger.info(`deployDesktopShortcuts: main -> homedir ${homedir}`);
  let fileBuffer = "";
  const shortcut = {};
  var done = 0;
  // denodeify transforms a node function into one that works with promises
  // const create = Q.denodeify(ws.create)

  for (const app of allSelectedApps) {
    shortcut[app.name] = `${homedir}\\Desktop\\${app.name}.lnk`;
    logger.info(
      `deployDesktopShortcuts: main -> shortcut ${shortcut[app.name]}`
    );
    const targetString = path.join(mbdDir, app.parentFolder, app.execPath);
    logger.info(`deployDesktopShortcuts: main -> targetString ${targetString}`);

    //=======================================================================
    // Creates an object to store any and all parameters to be passed to the Windows API
    const options = {
      filepath: targetString,
      lnkCwd: path.join(mbdDir, app.parentFolder),
      lnkIco: `${path.join(mbdDir, app.parentFolder, app.execPath)}`,
      lnkWin: 4
    };

    // It creates a "GIMP" shortcut file in the desktop
    /*     try {
      sm.makeSync(options);
      logger.info(`Shortcut of ${shortcut[app.name]} created!`);
    } catch (error) {
      logger.error(error);
    }
  } */

    //=================================================================

    // const array = [];
    // for (const app of allSelectedApps) {
    //   shortcut[app.name] = `${homedir}\\Desktop\\${app.name}.lnk`;
    //   logger.info(
    //     `deployDesktopShortcuts: main -> shortcut ${shortcut[app.name]}`
    //   );
    //   const targetString = path.join(mbdDir, app.parentFolder, app.execPath);
    //   logger.info(`deployDesktopShortcuts: main -> targetString ${targetString}`);

    // const shortcutPromise = (...args) => {
    //   return new Promise((resolve, reject) => {
    //     ws.create(...args, err => {
    //       // done++;
    //       if (err) {
    //         logger.error(Error(err));
    //         return reject(Error(err));
    //       } else {
    //         logger.info(`Shortcut of ${shortcut[app.name]} created!`);
    //         resolve(`Shortcut of ${shortcut[app.name]} created!`);
    //       }
    //       // if (done == allSelectedApps.length) shortcutCallback();
    //     });
    //   });
    // };

    const shortcutPromise = util.promisify(ws.create);

    await shortcutPromise(shortcut[app.name], {
      target: targetString,
      workingDir: path.join(mbdDir, app.parentFolder),
      icon: `${path.join(mbdDir, app.parentFolder, app.execPath)},0`,
      runStyle: ws.NORMAL
    })
      .then(data => {
        logger.info(`data: ${data}`);
        logger.info(`Shortcut of ${shortcut[app.name]} created!`);
      })
      .catch(err => {
        // done++;
        if (err) {
          logger.error(Error(err));
          throw Error(err);
        }
        // if (done == allSelectedApps.length) shortcutCallback();
      });
  }

  removeShortcutMaker(shortcutMakerFilename);

  function removeShortcutMaker(smFilename) {
    // remove original/source extracted file
    // const removedShortcutEXE = shell.rm(
    //   "-Rf",
    //   path.join(process.cwd(), "Shortcut.exe")
    // );

    // const smFilename = "Shortcut.exe";
    // const smFilename = "lnk.vbs";

    const removedShortcutMaker = shell.rm(
      "-Rf",
      path.join(process.cwd(), smFilename)
    );
    if (removedShortcutMaker.code !== 0) {
      // logger.warn("Delete Shortcut.exe manually.");
      logger.warn(`Please, Delete ${smFilename} manually.`);
    } else {
      // logger.info("Removed Shortcut.exe");
      logger.info(`Removed ${smFilename}`);
    }
  }

  return true;
};
