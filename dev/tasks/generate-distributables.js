const run = require('./utils/run-cli-cmd.js')
const fs = require('fs')
const UglifyJS = require('uglify-js')
const version = require('../../package.json').version

const distName = `base-query-${version}`

run([

  // build
  `npm run build`,
  // empty distribution folder
  'rm -f dist/*',
  // copy build files to distribution folder
  `cp build/base-query.js dist/${distName}.js`,
  `cp build/base-query.js.map dist/${distName}.js.map`,
  // uglify
  () => {
    const code = fs.readFileSync(`dist/${distName}.js`, `utf8`)
    const map  = fs.readFileSync(`dist/${distName}.js.map`, `utf8`)
    const ugly = UglifyJS.minify(code, {
      warnings: true,
      ie8: false,
      compress: { dead_code: true, toplevel: true, passes: 3},
      output: { preamble: extractPreamble(code) },
      sourceMap: { content: map, url: `${distName}.min.js.map` }
    })
    fs.writeFileSync(`dist/${distName}.min.js`, ugly.code)
    fs.writeFileSync(`dist/${distName}.min.js.map`, ugly.map)
  },
  // gzip uglified files
  `gzip -9 dist/${distName}.min.js dist/${distName}.min.js.map`,
  // remove .gz extension
  `mv dist/${distName}.min.js.gz dist/${distName}.min.js`,
  `mv dist/${distName}.min.js.map.gz dist/${distName}.min.js.map`

]).catch((err) => {
  console.error(err)
})


// helpers

function extractPreamble(code) {
  // extract preamble from code if present
  var p = /(^\/\/.*$|\/\*.*\n(.*\n)*.*\*\/.*\n)/m.exec(code)
  return p ? p[1] : null
}