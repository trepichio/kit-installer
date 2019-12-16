const fs = require("fs")


module.exports = (dirname) => {
  console.log("TCL: dirname", dirname)


  const files = fs.readdirSync(dirname)
  console.log("TCL: files", files)
  if (!files.length) {
    // directory appeas to be empty
    console.log(`${dirname} appears to be empty`)
    return true
  }
  console.log(`${dirname} appears to have files`)
  return false
}
