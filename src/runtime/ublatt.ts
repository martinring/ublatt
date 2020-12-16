import { View } from './View';
import { Exercise, Solution, ExerciseType, Author, Ublatt } from '../shared/Types';
//import { Metadata } from '../shared/metadata';

export default class Main implements Ublatt {
  private nosave: boolean = false;

  private readonly exerciseTypes = new Map<string,ExerciseType<any>>()
  readonly exercises: { [id: string]: Exercise<any> } = { }
  private readonly authorTable: Element | undefined
  private authors: Array<View<Author>> = []
  private readonly sheet: Element
  private readonly metadata: { [id: string]: any }

  private author(n: number, author?: Author): View<Author> {
    const row = document.createElement('tr');
    const number = document.createElement('td');
    number.innerHTML = n.toString();  
    const name = document.createElement('td');  
    const nameField = document.createElement('span');
    nameField.contentEditable = "true";
    nameField.classList.add('field')
    nameField.classList.add("name")
    if (author) nameField.innerText = author.name
    name.appendChild(nameField);  
    const matnr = document.createElement('td');  
    const matnrField = document.createElement('span');
    matnrField.contentEditable = "true";
    matnrField.classList.add('field')
    matnrField.classList.add('matnr')
    if (author) matnrField.innerText = author.matriculation_number || ""
    matnr.appendChild(matnrField);
    const email = document.createElement('td');
    const emailField = document.createElement('span');
    emailField.contentEditable = "true";
    emailField.classList.add('field')
    matnrField.classList.add('email')
    if (author) emailField.innerText = author.email
    email.appendChild(emailField);
    row.append(number,name,matnr,email)
    return {
      elem: row,
      get() {
        return {
          name: nameField.innerText,
          matriculation_number: matnrField.innerText,
          email: emailField.innerText
        }
      },
      set(x) {
        nameField.innerText = x.name
        matnrField.innerText = x.matriculation_number || ""
        emailField.innerText = x.email
      }
    }
  }
  
  private write() {
    let res: Solution = {
      course: this.metadata.title,
      sheet: this.metadata.sheet,
      authors: this.authors.map(x => x.get()),
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
    if (this.authorTable) {
      this.authors = []
      this.authorTable.innerHTML = "" 
      if (value.authors.length == 0) {
        value.authors.push({
          name: "",
          matriculation_number: "",
          email: ""
        })
      }    
      value.authors.forEach((a: Author,i: number) => {        
        let view = this.author(i + 1, a)
        if (this.authorTable) this.authorTable.appendChild(view.elem)
        this.authors.push(view)
      })
    }
    for (const [x,y] of Object.entries(this.exercises)) {
      let v = value.solutions[x]
      if (v) y.set(v)
    }
  }
  

  constructor(sheet: Element, metadata: { [id: string]: any }) {
    this.metadata = metadata
    this.sheet = sheet    
    const at = sheet.querySelector("table#authors > tbody")
    if (!at) {
      console.warn("table with class authors was not found")
    } else {
      this.authorTable = at
    }    
  }

  init(submission?: Solution, solution?: Solution) {    
    if (this.exerciseTypes.size == 0) {
      console.warn("no exercise types were registerd before init")
      return
    }
    let selector = Array.from(this.exerciseTypes.keys()).map((x) => "." + x).join(', ')   
    var cnt = 1
    if (submission && solution) {
      document.querySelectorAll('div.info').forEach(x => x.remove())
    }
    this.sheet.querySelectorAll('.main > section').forEach((section) => {
      let sec = 'e' + cnt++      
      section.querySelectorAll(selector).forEach((part,n) => {
          let tpe = Array.from(this.exerciseTypes.entries()).find(([x,t]) => part.classList.contains(x))
          if (tpe) {            
            let name = n > 0 ? sec + '_' + (n + 1) : sec
            if (!submission || !solution) {
              this.exercises[name] = tpe[1].make(part,name)
            } else {
              let row = document.createElement('div')
              row.classList.add('solution','fail')
              let sub = document.createElement('div')
              sub.classList.add('submission')
              let feedback = document.createElement('div')
              feedback.classList.add('feedback')
              row.append(sub,feedback)

              let x: Element
              try {
                x = tpe[1].render(part,name,submission.solutions[name])                
              } catch(e) {
                x = document.createElement('div')
                x.textContent = "Kein Abgabe"
                x.classList.add('rendered','fail')
              }

              let y: Element
              try {
                y = tpe[1].render(part,name,solution.solutions[name])                
              } catch(e) {
                y = document.createElement('div')
                y.textContent = "Leider Falsch"
                y.classList.add('rendered','fail')
              }

              sub.appendChild(x)              
              sub.contentEditable = "true";
              feedback.appendChild(y)            
              feedback.contentEditable = "true";  
              part.replaceWith(row)

              const assess = document.createElement('div');              

              assess.classList.add('assess','fail');
              assess.addEventListener('click',() => {
                if (assess.classList.contains('fail')) {
                  assess.classList.remove('fail')
                  row.classList.remove('fail')
                } else {
                  assess.classList.add('fail')
                  row.classList.add('fail')
                }
              })
              row.insertAdjacentElement("beforeend",assess)              
            }
          }
      })
    })
    
    let partial = localStorage.getItem(this.metadata.title + "_" + this.metadata.sheet)
    if (partial) {
      this.read(JSON.parse(partial))
    } else this.read({
      authors: [],
      solutions: {}
    })

    window.addEventListener("beforeunload",() => {
      if (!this.nosave) {
        localStorage.setItem(this.metadata.title + "_" + this.metadata.sheet, JSON.stringify(this.write()))      
      }
    })

    window.addEventListener("keydown",(e) => {
      if (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) {
        if (e.key == "s") {
          e.preventDefault()
          this.save()
        } else if (e.key == "o") {
          e.preventDefault()
          this.load()
        }
      }

    },false)
  }

  public registerModule<T>(name: string, module: ExerciseType<T>) {    
    this.exerciseTypes.set(name, module)
  }

  public addAuthor() {
    if (this.authorTable) {
      let a = this.author(this.authors.length + 1)      
      this.authorTable.appendChild(a.elem)
      this.authors.push(a)
    }
  }

  public removeAuthor() {
    this.authors.pop()?.elem.remove()
  }

  public emailify() {
    for (const script of Array.from(document.getElementsByTagName('script'))) {
      script.remove()      
    }
    document.body.innerHTML = document.body.innerHTML;
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

