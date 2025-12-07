#!/usr/bin/env node
const fs = require('fs')
const zlib = require('zlib')
const https = require('https')
const path = require('path')

function encode64(data) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
  let res = ''
  let i = 0
  while (i < data.length) {
    const b1 = data[i++] & 0xff
    const b2 = i < data.length ? data[i++] & 0xff : 0
    const b3 = i < data.length ? data[i++] & 0xff : 0

    const c1 = b1 >> 2
    const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    const c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    const c4 = b3 & 0x3F

    res += chars.charAt(c1) + chars.charAt(c2) + chars.charAt(c3) + chars.charAt(c4)
  }
  return res
}

function plantumlEncode(text) {
  const deflated = zlib.deflateRawSync(Buffer.from(text, 'utf8'))
  return encode64(deflated)
}

async function fetchPng(url, outPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return fetchPng(res.headers.location, outPath).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        let body = ''
        res.on('data', (d) => (body += d.toString()))
        res.on('end', () => reject(new Error(`Status ${res.statusCode}: ${body}`)))
        return
      }
      const fileStream = fs.createWriteStream(outPath)
      res.pipe(fileStream)
      fileStream.on('finish', () => fileStream.close(() => resolve(outPath)))
      fileStream.on('error', reject)
    }).on('error', reject)
  })
}

async function render(filePath) {
  const abs = path.resolve(filePath)
  if (!fs.existsSync(abs)) {
    console.error('File not found:', abs)
    process.exitCode = 2
    return
  }
  const text = fs.readFileSync(abs, 'utf8')
  const code = plantumlEncode(text)
  const url = `https://www.plantuml.com/plantuml/png/${code}`
  const outPath = abs.replace(/\.puml?$/i, '.png')
  console.log('Rendering', filePath, '->', outPath)
  try {
    await fetchPng(url, outPath)
    console.log('Saved', outPath)
  } catch (err) {
    console.error('Failed to render', filePath, err)
    process.exitCode = 1
  }
}

async function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.error('Usage: node render_plantuml.js path/to/diagram.puml [more.puml]')
    process.exit(2)
  }
  for (const f of files) {
    await render(f)
  }
}

main()
