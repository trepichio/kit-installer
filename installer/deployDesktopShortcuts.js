const ws = require("windows-shortcuts")
const path = require("path")
const fs = require("fs")
const canAccess = require("./helpers/canAccess")
const trycatchFn = require("./helpers/trycatchFn")
// const sleep = require("./helpers/sleep")

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;


const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    format.splat(),
    format.simple(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ],
  // Enable exception handling when you create your logger.
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })
  ],
  exitOnError: false
});

// Call exceptions.handle with a transport to handle exceptions
logger.exceptions.handle(
  new transports.File({ filename: 'exceptions.log' })
);



const apps = [
  { parentFolder: "Sistemas/Retaguarda", name: "Retaguarda", execPath: "Retaguarda.exe" },
  { parentFolder: "Sistemas/Pre-venda", name: "Pre-venda", execPath: "PreVenda.exe" },
  { parentFolder: "Sistemas/Frente", name: "Frente", execPath: "Caixa.exe" },
  { parentFolder: "Sistemas/SAT Gerenciador", name: "SAT Gerenciador", execPath: "SATGerenciador.exe" },
  { parentFolder: "Acesso", name: "AnyDesk", execPath: "AnyDesk.exe" },
  { parentFolder: "Acesso", name: "TeamViewer", execPath: "TeamViewerQS.exe" }
]

/**
* * resolves path to root directory of Installer scripts inside project
*/
const rootInstaller = path.resolve(__dirname)
logger.info(`TCL: rootInstaller ${rootInstaller}`)


const rootDir = path.resolve("C:\\MBD")
logger.info(`TCL: rootDir ${rootDir}`)

const shortcutBuffer = fs.readFileSync(path.join(rootInstaller, 'assets', 'Shortcut.exe'))
fs.writeFileSync(path.join(process.cwd(), 'Shortcut.exe'), shortcutBuffer)

module.exports = () => {
  const homedir = require('os').homedir();
  logger.info(`TCL: main -> homedir ${homedir}`)
  let fileBuffer = ''
  const shortcut = {}

  for (const app of apps) {


    shortcut[app.name] = `${homedir}\\Desktop\\${app.name}.lnk`
    logger.info(`TCL: main -> shortcut ${shortcut[app.name]}`)
    const targetString = path.join(rootDir, app.parentFolder, app.execPath)
    logger.info(`TCL: main -> targetString ${targetString}`)

    ws.create(
      shortcut[app.name],
      {
        target: targetString,
        workingDir: path.join(rootDir, app.parentFolder),
        icon: `${path.join(rootDir, app.parentFolder, app.execPath)},0`,
        runStyle: ws.MAX,
      }, (err) => {
        if (err) {
          logger.error(Error(err));
          throw Error(err)
        }
        else {
          logger.info(`Shortcut of ${shortcut[app.name]} created!`);
        }
      }
    )
  }
}

function sleep(mili) {
  setInterval(() => {
    return Promise.resolve()
  }, mili);
}
