import { Exercise, Solution, ExerciseType, Author, Student, Ublatt } from './Types';
import { Authors } from './authors'
import './ublatt.css'
import render from './render'

declare global {
  function execCommand(command: "foreColor", ui: boolean, value: string): void
}

export default class implements Ublatt {
  private nosave: boolean = false;

  private readonly exerciseTypes = new Map<string,ExerciseType<any>>()
  private readonly exercises: { [id: string]: Exercise<any> } = { }  
  private readonly authors?: ReturnType<typeof Authors>
  private readonly sheet: Element
  private readonly metadata: { [id: string]: any }  

  private write() {
    let res: Solution = {
      course: this.metadata.title,
      sheet: this.metadata.sheet,
      authors: this.authors?.get() || [],
      solutions: {}
    }    
    for (const [x,y] of Object.entries(this.exercises)) {
      if (y) {
        let v = y.get()
        if (v) res.solutions[x] = v
      }
    }
    return res
  }
  
  private read(value: Solution) {
    this.authors?.set(value.authors)
    for (const [x,y] of Object.entries(this.exercises)) {
      let v = value.solutions[x]
      if (v) y.set(v)
    }
  }
  

  constructor(sheet: Element, metadata: { [id: string]: any }) {
    this.metadata = metadata
    this.sheet = sheet    
    const at = sheet.querySelector('.submit .authors')
    if (!at) {
      console.warn("table with class authors was not found")
    } else {
      this.authors = Authors(at,[{name: "", email: "", matriculation_number: ""}])
    }
  }

  evalMode: boolean = false

  init(submission?: Solution, solution?: Solution) {
    const self = this
    render(µ => 
      document.getElementById('submit-buttons')?.append(
        µ('a',{ class: ['icon','large'], events: { click: () => self.save() } },µ('i',{}, '💾'), ' Speichern'),
        µ('a',{ class: ['icon','large'], events: { click: () => self.load() } },µ('i',{}, '📂'), ' Laden'),
        µ('a',{ class: ['icon','large'], events: { click: () => self.clearSheet() } },µ('i',{}, '🗑'), ' Leeren')
      )
    )
    if (this.exerciseTypes.size == 0) {
      console.warn("no exercise types were registerd before init")
      return
    }
    let selector = Array.from(this.exerciseTypes.keys()).map((x) => "." + x).join(', ')   
    var cnt = 0
    let sheetTotalPoints = 0
    let sheetReachedPoints = 0
    let totalPointsDiv = document.createElement('div')
    totalPointsDiv.contentEditable = 'true'
    totalPointsDiv.classList.add('points')        
    function updateSheetPoints() {
      totalPointsDiv.innerHTML = `Ihr habt ${sheetReachedPoints} von ${sheetTotalPoints} Punkten erreicht.`
    }
    if (submission && solution) {
      document.querySelectorAll('.ublatt div.main').forEach(x => x.insertAdjacentElement("afterbegin",totalPointsDiv))
      document.querySelectorAll('div.info').forEach(x => x.remove())
    }
    this.sheet.querySelectorAll('.main > section').forEach((section) => {      
      let sec = 'e' + ++cnt
      const secnum = document.createElement('span')
      secnum.classList.add('secnum')
      secnum.innerText = `${this.metadata.sheet}.${cnt}`
      section.firstElementChild?.insertAdjacentElement("afterbegin",secnum)
      let points = document.createElement('span')
      points.classList.add('points')
      points.contentEditable = 'true'      
      let totalPoints = 0
      let reachedPoints = 0
      points.addEventListener('input', () => {
        const ps = points.innerText.match(/([0-9]+([,\.][0-9]+)?) von/)
        if (ps) {
          reachedPoints = Number.parseFloat(ps[1].replace(',','.'))
        }
      })
      function updatePoints() {
        updateSheetPoints()
        points.innerHTML = `${reachedPoints} von ${totalPoints} Punkten`        
      }
      points.innerHTML = "0 %"
      if (submission || solution) {                
        section.firstElementChild?.appendChild(points)
      }
      section.querySelectorAll(selector).forEach((part,n) => {        
          const p = Number.parseInt((Array.from(part.classList).find(x => /^[0-9]+p$/g.test(x)) || "1p").slice(0,-1))
          totalPoints += p
          sheetTotalPoints += p
          let tpe = Array.from(this.exerciseTypes.entries()).find(([x,t]) => part.classList.contains(x))
          if (tpe) {            
            let name = n > 0 ? sec + '_' + (n + 1) : sec
            if (!submission || !solution) {
              this.exercises[name] = tpe[1].make(part,name)
            } else {
              this.evalMode = true
              
              const sub = document.createElement('div')
              sub.classList.add('submission')
              
              const feedback = document.createElement('div')
              feedback.classList.add('feedback')

              const row = document.createElement('div')
              row.classList.add('solution', 'fail')

              row.append(sub,feedback)              
              
              let x: Element
              try {
                x = tpe[1].eval(part,name,{
                  submission: submission.solutions[name],
                  solution: solution.solutions[name],
                  mark(elem: Element, feedback: DocumentFragment) {

                  }
                })
              } catch(e) {            
                const s = document.createElement('div')    
                s.classList.add('rendered','fail')
                s.innerText = 'Keine Angabe'
                x = s
              }

              let y: Element
              try {
                y = tpe[1].eval(part,name,{
                  submission: solution.solutions[name],
                  solution: solution.solutions[name],
                  mark(elem: Element, feedback: DocumentFragment) {

                  }
                })
              } catch(e) {                
                const s = document.createElement('div')    
                s.classList.add('rendered','fail')
                s.innerText = 'Leider Falsch'
                y = s
              }

              sub.append(x)
              sub.contentEditable = "true";
              feedback.append(y)
              feedback.contentEditable = "true";  
              part.replaceWith(row)
              
              const icon = document.createElement('span') 
              icon.classList.add('icon')
              icon.innerText = '✗'
                          
              const assess = document.createElement('div')
              assess.classList.add('assess','fail')
              assess.append(icon)
                            
              assess.classList.add('assess','fail');
              assess.addEventListener('click',() => {
                if (assess.classList.contains('fail')) {                  
                  assess.classList.remove('fail')
                  row.classList.remove('fail')
                  icon.innerText = '✓'
                  reachedPoints += p
                  sheetReachedPoints += p
                  updatePoints()
                } else if (assess.classList.contains('warn')) {
                  assess.classList.add('fail')
                  row.classList.add('fail')
                  assess.classList.remove('warn')
                  row.classList.remove('warn')
                  icon.innerText = '✗'
                  reachedPoints -= p
                  sheetReachedPoints -= p
                  updatePoints()
                } else {
                  assess.classList.add('warn')
                  row.classList.add('warn')
                  icon.innerText = '⚠'
                  updatePoints()
                }
              })
              row.insertAdjacentElement("beforeend",assess)
              updatePoints()          
            }
          }
      })
    })
    
    let authors_json = localStorage.getItem('authors')
    let authors = []
    if (authors_json) { authors = JSON.parse(authors_json) }    
    let partial_json = localStorage.getItem(this.metadata.title + "_" + this.metadata.sheet)    
    if (partial_json) {
      let partial: Solution = JSON.parse(partial_json)
      if (!partial.authors || partial.authors.length == 0) {
        partial.authors = authors
      }
      this.read(partial)
    } else this.read({
      course: "",
      sheet: "",
      authors: authors,
      solutions: {}
    })

    window.addEventListener("beforeunload",() => {
      if (!this.nosave) {
        if (this.authors) {          
          localStorage.setItem('authors',JSON.stringify(this.authors.get()))
        }        
        localStorage.setItem(this.metadata.title + "_" + this.metadata.sheet, JSON.stringify(this.write()))
      }
    })

    window.addEventListener("keydown",(e) => {
      if (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) {
        if (e.key == "s") {
          if (this.evalMode) {
            this.emailify()
            e.preventDefault()
          } else {
            e.preventDefault()
            this.save()
          }
        } else if (e.key == "o") {
          if (!this.evalMode) {
            e.preventDefault()
            this.load()
          }
        } else if (e.key == "r") {
          document.execCommand('foreColor',false,'red')
          e.preventDefault()
        } else if (e.key == "g") {
          document.execCommand('foreColor',false,'green')
          e.preventDefault()
        } else if (e.key == "y") {
          document.execCommand('foreColor',false,'darkorange')
          e.preventDefault()
        }
      }

    },false)
  }

  public registerModule<T>(name: string, module: ExerciseType<T>) {    
    this.exerciseTypes.set(name, module)
  }

  public emailify() {    
    for (const script of Array.from(document.getElementsByTagName('script'))) {      
      script.remove()
    }
    document.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'))
    const link = document.createElement('a')
    const styles = Array.from(document.styleSheets).flatMap(x => Array.from(x.rules)).map(x => x.cssText).join("\n")
    console.log(this.metadata)
    const boundary = "a893q4h87hadsfg08gsdifuhgosdifg"
    const data =
      `To: ${(this.metadata.authors as Student[]).map(a => `"${a.name.trim()}" <${a.email.trim()}>`).join(', ')}\n` +
      `Subject: [${this.metadata.title}] Bewertung Blatt ${this.metadata.sheet}\n` +            
      `Content-Type: multipart/mixed; boundary="${boundary}"\n` +            
      `\r\n--${boundary}\n` +
      `Content-Type: text/plain;charset="utf-8"\n\n` +
      `Hallo,\n\n` +
      `Im Anhang kommt eure Bewertung für Übungsblatt ${this.metadata.sheet}. ${document.querySelector('.main .points')?.textContent}\n\n` +
      `Viele Grüße, Martin\n` +
      `\r\n--${boundary}\n` +
      `Content-Type: text/html; charset="utf-8"; name="eval${this.metadata.sheet}.html"\n` +
      `Content-Disposition: attachment; filename="eval${this.metadata.sheet}.html"\n\n` +
      `<html><head><style>${styles}</style></head><body class="email">${document.body.innerHTML}</body></html>\n` + 
      `\r\n--${boundary}--` 
    link.download = `sheet${this.metadata.sheet}.eml`
    const blob = new Blob([data],{type: "message/rfc822"})
    link.href = URL.createObjectURL(blob)
    link.click()    
  }

  public save() {
    let res = this.write()
    let a = document.createElement('a')
    a.download = "sheet" + this.metadata.sheet + ".json";
    var data = new Blob([JSON.stringify(res)], {type: 'application/json'});
    a.href = URL.createObjectURL(data)
    a.click()  
  }

  public clearSheet() {
    localStorage.removeItem(this.metadata.title + "_" + this.metadata.sheet)
    this.nosave = true;
    window.location.reload()
  }

  public load() {
    let x: HTMLInputElement = document.createElement('input')
    x.type = "file"
    x.accept = ".json"
    x.addEventListener("change",() => {
      const file = x.files?.item(0);      
      if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          try {                        
            if (reader.result) {
              let json = JSON.parse(              
                reader.result instanceof ArrayBuffer ? 
                String.fromCharCode.apply(null, Array.from(new Uint16Array(reader.result))) : 
                reader.result);
              if (typeof json.sheet == "string") json.sheet = Number.parseInt(json.sheet);
              if (typeof json.course != "string" || 
                  typeof json.authors != "object" || 
                  typeof json.sheet != "number" ||
                  typeof json.solutions != "object") {
                alert("Keine gültige JSON Datei!")           
              }
              else if (json.course != this.metadata.title) {
                alert(`Diese Abgabe ist für den Kurs '${json.course}.'`);
              } else if (json.sheet != this.metadata.sheet) {
                alert(`Diese Abgabe ist für Übungsblatt ${json.sheet}.`);            
              } else {
                this.read(json)
              }
            } else if (reader.error) throw reader.error
          } catch(e) {
            console.error(e)
            alert("Keine kompatible Abgabe!")          
          }
        });
        reader.readAsText(file);
      } 
    })
    x.click()  
  }
}

