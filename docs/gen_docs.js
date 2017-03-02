import jsdoc2md from 'jsdoc-to-markdown'
import fs from 'fs'

import { version } from '../package.json'

let content = jsdoc2md.renderSync({
  files: [
    'lib/*.js'
  ],
  version: version
})

fs.writeFileSync('docs/README.md', content)
