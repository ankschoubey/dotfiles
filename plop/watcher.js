import chokidar from 'chokidar'
import path from 'path'
import { fileURLToPath } from 'url'
import nodePlop from 'node-plop'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plopfilePath = path.join(__dirname, 'plopfile.js')
const watchDir = path.resolve(process.cwd(), 'src', 'components')

const plop = await nodePlop(plopfilePath)
const generator = plop.getGenerator('component')

const debounceTimers = new Map()

chokidar.watch(watchDir, {
  ignoreInitial: true,
  ignored: /(^|[/\\])\../,
}).on('addDir', (dirPath) => {
  if (dirPath === watchDir) return

  const name = path.basename(dirPath)

  if (debounceTimers.has(dirPath)) clearTimeout(debounceTimers.get(dirPath))

  debounceTimers.set(dirPath, setTimeout(async () => {
    debounceTimers.delete(dirPath)

    try {
      await generator.runActions({ name, directory: dirPath })
      console.log(`✓ Scaffolded ${name} at ${dirPath}`)
    } catch (err) {
      console.error(`✗ Failed to scaffold ${name}: ${err.message}`)
    }
  }, 300))
})

console.log(`Watching ${watchDir} for new component folders...`)
console.log('Press Ctrl+C to stop.')
