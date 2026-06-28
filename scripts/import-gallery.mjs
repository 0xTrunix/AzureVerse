import fs from 'node:fs'
import path from 'node:path'

const workspaceRoot = '/Users/trunix/Azurejewelry'
const sourceCsv = path.join(
  workspaceRoot,
  '各种素材图收集_已编号分类/00_清单/image_classification_results.csv',
)
const sourceLogo = path.join(workspaceRoot, '视频LOGO/AZ_monogram.png')
const sourceTextLogo = path.join(workspaceRoot, '视频LOGO/AzureJewelry_Text.png')
const sourceFavicon = path.join(workspaceRoot, '相关图片/azurejewelry-favicon-192.png')

const projectRoot = path.join(workspaceRoot, 'AzureVerse')
const publicDir = path.join(projectRoot, 'public')
const imageDir = path.join(publicDir, 'gallery-images')
const dataDir = path.join(projectRoot, 'src/data')
const dataPath = path.join(dataDir, 'gallery.json')

fs.mkdirSync(imageDir, { recursive: true })
fs.mkdirSync(dataDir, { recursive: true })
fs.rmSync(imageDir, { recursive: true, force: true })
fs.mkdirSync(imageDir, { recursive: true })

if (fs.existsSync(sourceLogo)) {
  fs.copyFileSync(sourceLogo, path.join(publicDir, 'az-monogram.png'))
}

if (fs.existsSync(sourceTextLogo)) {
  fs.copyFileSync(sourceTextLogo, path.join(publicDir, 'azure-jewelry-text.png'))
}

if (fs.existsSync(sourceFavicon)) {
  fs.copyFileSync(sourceFavicon, path.join(publicDir, 'favicon.png'))
}

const parseCsv = (source) => {
  const lines = source.replace(/^\uFEFF/, '').trim().split(/\r?\n/)
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      const next = line[i + 1]

      if (char === '"' && next === '"') {
        current += '"'
        i += 1
        continue
      }

      if (char === '"') {
        inQuotes = !inQuotes
        continue
      }

      if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
        continue
      }

      current += char
    }

    values.push(current)

    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

const records = parseCsv(fs.readFileSync(sourceCsv, 'utf-8'))

const colorMoodMap = {
  蓝色: 'Deep Ocean',
  黄色: 'Solar Glow',
  绿色: 'Emerald Garden',
  红色: 'Rouge Flame',
  粉色: 'Rose Blush',
  白钻: 'Diamond Light',
}

const categoryOrder = ['戒指', '项链', '耳饰', '手链', '套装_组合图', '胸针_别针', '裸石_宝石']
const colorOrder = ['蓝色', '黄色', '绿色', '红色', '粉色', '白钻']

const output = records.map((row) => {
  const sourceFile = row.final_path
  const ext = path.extname(sourceFile).toLowerCase() || '.jpg'
  const fileName = `${row.image_id}${ext}`
  const targetFile = path.join(imageDir, fileName)

  fs.copyFileSync(sourceFile, targetFile)

  return {
    id: row.image_id,
    title: row.image_id,
    category: row.category,
    color: row.stone_color,
    suggestedColor: row.suggested_color,
    originalFilename: row.original_filename,
    image: `/gallery-images/${fileName}`,
    mood: colorMoodMap[row.stone_color] ?? 'Curated Selection',
  }
})

output.sort((a, b) => {
  const categoryDelta = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  if (categoryDelta !== 0) return categoryDelta
  const colorDelta = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
  if (colorDelta !== 0) return colorDelta
  return a.id.localeCompare(b.id)
})

fs.writeFileSync(dataPath, `${JSON.stringify(output, null, 2)}\n`)

console.log(`Imported ${output.length} gallery items into ${dataPath}`)
