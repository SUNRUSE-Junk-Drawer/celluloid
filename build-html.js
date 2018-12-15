import favicons from "favicons"
import { unlink, writeFile } from "fs"
import { join } from "path"
import mkdirp from "mkdirp"
import imagemin from "imagemin"
import imageminPngcrush from "imagemin-pngcrush"
import { minify } from "html-minifier"

console.log("Creating \"dist/icons\"...")
mkdirp("dist/icons", err => {
  if (err) throw err

  console.log("Generating favicons...")
  favicons("src/favicon.svg", {
    appName: "Celluloid",
    appDescription: null,
    developerName: null,
    developerUrl: null,
    background: "#000",
    theme_color: "#000",
    path: "icons",
    display: "standalone",
    orientation: "landscape",
    start_url: "/",
    version: "1.0",
    logging: false,
    online: false,
    preferOnline: false,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: { offset: 25 },
      favicons: true,
      firefox: true,
      windows: true,
      yandex: true
    }
  }, (err, response) => {
    if (err) throw err

    let remainingFiles = response.images.length + response.files.length
    console.log(`Writing ${remainingFiles} files...`)

    const allPaths = []

    for (const image of response.images) write(image.name, image.contents)
    for (const file of response.files) write(file.name, file.contents)

    function write(name, contents) {
      const path = join("dist", "icons", name)
      allPaths.push(path)
      writeFile(path, contents, err => {
        if (err) throw err
        console.log(`${remainingFiles} files remaining...`)
        remainingFiles--
        if (remainingFiles) return

        console.log("Compressing...")
        imagemin(allPaths.filter(path => path.endsWith(".png")), "dist/icons", { plugins: [imageminPngcrush({ reduce: true })] })
          .catch(reason => { throw reason })
          .then(() => {
            console.log("Generating HTML for debugging...")
            const htmlForDebugging = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>Celluloid</title>
                <meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, height=device-height, user-scalable=no">
                ${response.html.join("")}
              </head>
              <body style="background: black; color: white; font-family: sans-serif; user-select: none; font-size: 0.5cm;">
                <div id="status" style="position: absolute; top: 50%; margin-top: -0.5em; line-height: 1em; left: 0; text-align: center; width: 100%;">Loading; please ensure that JavaScript is enabled.</div>
                <script src="debugger.js"></script>
              </body>
              </html>
            `

            console.log("Generating HTML for hosting...")
            const htmlForHost = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>Celluloid</title>
                <meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, height=device-height, user-scalable=no">
                ${response.html.join("")}
              </head>
              <body style="background: black; color: white; font-family: sans-serif; user-select: none; font-size: 0.5cm;">
                <div id="status" style="position: absolute; top: 50%; margin-top: -0.5em; line-height: 1em; left: 0; text-align: center; width: 100%;">Loading; please ensure that JavaScript is enabled.</div>
                <script src="index.min.js"></script>
              </body>
              </html>
            `

            console.log("Minifying HTML for hosting...")
            const minifiedHtml = minify(htmlForHost, {
              collapseInlineTagWhitespace: true,
              collapseWhitespace: true,
              minifyCSS: true,
              removeAttributeQuotes: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeEmptyElements: true,
              removeOptionalTags: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              removeTagWhitespace: true
            })

            console.log("Writing HTML for debugging...")
            writeFile("dist/debugger.html", htmlForDebugging, err => {
              if (err) throw err
              console.log("Writing HTML for hosting...")
              writeFile("dist/index.html", minifiedHtml, err => {
                if (err) throw err
                console.log("Done.")
              })
            })
          })
      })
    }
  })
})
