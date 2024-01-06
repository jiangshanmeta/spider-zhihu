import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

interface Collection {
  created: string
  content: {
    id: number
    title: string
    url: string
  }
}

interface CollectionRes {
  paging: {
    is_end: boolean
    is_start: boolean
    totals: number
  }
  data: Collection[]
}
function getOnePageCollection(collectonId: number, pageIndex: number) {
  const limit = 20
  const offset = (pageIndex - 1) * limit
  return new Promise<CollectionRes>((resolve, reject) => {
    https.get(`https://www.zhihu.com/api/v4/collections/${collectonId}/items?offset=${offset}&limit=${limit}`, (res) => {
      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData)
          resolve(parsedData)
        }
        catch (e) {
          reject(e)
        }
      })
    })
  })
}
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
async function getAllCollectionById(collectonId: number) {
  let is_end = false
  const collection: Collection[] = []
  let pageIndex = 1
  while (!is_end) {
    const response = await getOnePageCollection(collectonId, pageIndex)
    is_end = response.paging.is_end
    collection.push(...response.data)
    pageIndex++
  }

  const folderPath = path.join(__dirname, `../data/collection/${collectonId}.json`)

  fs.writeFileSync(folderPath, JSON.stringify(collection, null, 4), 'utf-8')
}

getAllCollectionById(789421139)
getAllCollectionById(854484629)
