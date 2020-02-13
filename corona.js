// This won't age well :)
// Fetches for 2019-nCoV info

const fetch = require('node-fetch')
const CSVStream = require('csv-reader')
const DecoderStream = require('autodetect-decoder-stream')

const directory = 'https://api.github.com/repos/CSSEGISandData/2019-nCoV/contents/daily_case_updates'
const start = 1579150800000

let lastFetch = 0
let files = null

module.exports.getCoronaStats = async () => {
  if (Date.now() - lastFetch > 60000 || !files) {
    const res1 = await fetch(directory)
    // console.log(res1.headers)
    files = await res1.json()
    lastFetch = Date.now()
  }

  const sheet = files
    .filter((file) => ![ '.DS_Store', '.gitignore' ].includes(file.name))
    .sort((a, b) => Date.parse(b.name.slice(0, 10)) - Date.parse(a.name.slice(0, 10)))
    [0].download_url

  let affectedRegions = 0
  let confirmedCases = 0
  let deaths = 0
  let recovered = 0

  const res2 = await fetch(sheet)
  await new Promise((resolve) => {
    res2.body
      .pipe(new DecoderStream({ defaultEncoding: '1255' }))
      .pipe(new CSVStream({
        asObject: true,
        parseNumbers: true,
        trim: true
      }))
      .on('data', (object) => {
        affectedRegions++
        confirmedCases += object['Confirmed'] || 0
        deaths += object['Deaths'] || 0
        recovered += object['Recovered'] || 0
      })
      .on('end', resolve)
  })

  const timeSinceStart = Date.now() - start
  return { affectedRegions, confirmedCases, deaths, timeSinceStart, recovered }
}