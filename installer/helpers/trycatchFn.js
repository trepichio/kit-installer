module.exports = async (fn, ...params) => {
  try {
    return await fn(...params)
  } catch (err) {
    console.log(err)
    return undefined // or whatever you want
  }
}
