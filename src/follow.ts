import https from 'node:https'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface Followee {
  id: string
  name: string
  url: string
  url_token: string
}

interface Followees {
  data: Followee[]
  paging: {
    is_end: boolean
    is_start: boolean
    totals: number
  }
}

function getOnePageFollower(pageIndex: number) {
  const limit = 20
  const offset = (pageIndex - 1) * limit
  return new Promise<Followees>((resolve, reject) => {
    https.get(`https://www.zhihu.com/api/v4/members/82-59-64-85/followees?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F%28type%3Dbest_answerer%29%5D.topics&offset=${offset}&limit=${limit}`, (res) => {
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

async function getAllFollower() {
  let totals = 100
  const followee: Followee[] = []
  let pageIndex = 1
  while (followee.length < totals) {
    const response = await getOnePageFollower(pageIndex)
    totals = response.paging.totals
    followee.push(...response.data)
    pageIndex++
  }
  return followee
}
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

getAllFollower().then((res) => {
  const folderPath = path.join(__dirname, `../data/follow.json`)

  fs.writeFileSync(folderPath, JSON.stringify(res, null, 4), 'utf-8')
})
