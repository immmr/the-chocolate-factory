import jsdoc2md from 'jsdoc-to-markdown'
import fs from 'fs'

import { version } from '../package.json'

let content = jsdoc2md.renderSync({
  files: [
    'index.js',
    'lib/*.js'
  ],
  version: version
})

fs.writeFileSync('README.md', content)
