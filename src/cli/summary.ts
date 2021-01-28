import { Solution, Student } from '../shared/Types'
import * as fs from 'fs';
import * as path from 'path'

type SummaryOptions = {
  dir: string
}

export default function summary(options: SummaryOptions) {
    let course: string | null = null
    const sheets: { [id: string]: Solution[] } = {}
    const students: { [id: string]: Student } = {}
    const handins: { [id: string]: { [id: string]: Solution }} = {}
    fs.readdirSync(options.dir).filter(x => path.parse(x).ext == '.json').map(x => {        
      const src = fs.readFileSync(options.dir + x).toString('utf-8')
      const obj = JSON.parse(src) as Solution
      if (course == null) {
        course = obj.course
      } else if (course != obj.course) {
        console.error(`- found submissions to multiple courses (${course} and ${obj.course})`)
      }
      obj.authors.forEach(a => {        
        students[a.matriculation_number] = students[a.matriculation_number] || a
        if (!handins[a.matriculation_number]) handins[a.matriculation_number] = {}
        if (handins[a.matriculation_number][obj.sheet])
          console.warn(`- multiple submissions for sheet ${obj.sheet} from ${a.name} (${a.matriculation_number})`)
        else
          handins[a.matriculation_number][obj.sheet] = obj
      })
      if (!sheets[obj.sheet]) sheets[obj.sheet] = []
      sheets[obj.sheet].push(obj)
    })
    console.log("## Sheets\n")
    Object.entries(sheets).forEach(([x,y]) => {
      console.log(`- sheet ${x}: ${y.length} handins from ${y.map(x => x.authors.length).reduce((x,y) => x + y)} students`)
    })    
    console.log("\n## Missing handins\n")
    Object.entries(students).forEach(([x,y]) => {
      const e = handins[y.matriculation_number]
      const missing = Object.keys(sheets).filter(x => e[x] === undefined)    
      if (missing.length > 0) 
        console.log(`- ${y.name} (${x}): ${missing.join(", ")}`)
    })
    console.log("\n")
    
}