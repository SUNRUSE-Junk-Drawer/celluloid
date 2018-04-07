import glob from "glob"
import concat from "concat"

glob("src/**.js", (err, matches) => {
  if (err) throw err
  matches = matches.filter(match => !/^src(\/|\\)header.js$/.test(match))
  matches.unshift("src/header.js")
  concat(matches, "dist/jshint.js")
})