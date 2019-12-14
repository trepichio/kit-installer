const config = require("config")

module.exports = () => {
  installFirebird()
  extractAndDeployDLLs()
  deployDesktopShortcuts()
}
