// This won't age well :)
// Fetches for 2019-nCoV info

const fetch = require('node-fetch')
const CSVStream = require('csv-reader')
const DecoderStream = require('autodetect-decoder-stream')

const sheet = 'https://docs.google.com/spreadsheets/d/1wQVypefm946ch4XDp37uZ-wartW4V7ILdg-qYiDXUHM/export?usp=sharing&format=csv'
const start = 1579150800000

module.exports.getCoronaStats = () => fetch(sheet).then((res) => new Promise((resolve) => {
  const timeSinceStart = Date.now() - start
  let affectedRegions = 0
  let confirmedCases = 0
  let deaths = 0
  let recovered = 0

  res.body
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
    .on('end', () => resolve({
      timeSinceStart,
      affectedRegions,
      confirmedCases,
      deaths,
      recovered
    }))
}))