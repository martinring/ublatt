import { View } from './View';
import { Exercise, Solution, ExerciseType, Author, Ublatt } from './Types';

let nosave: boolean = false;

let exerciseTypes = new Map<string,ExerciseType<any>>()
let exercises: { [id: string]: Exercise<any> } = { }
let authorTable: Element | undefined
let authors: Array<View<Author>> = []

document.addEventListener("DOMContentLoaded",() => {
    var cnt = 1
    document.querySelectorAll('form.ublatt > .main > section').forEach((section) => {
        let sec = 'e' + cnt++
        let selector = Array.from(exerciseTypes.keys()).map((x) => "." + x).join(', ')
        console.log(selector)
        section.querySelectorAll(selector).forEach((part,n) => {
            let tpe = Array.from(exerciseTypes.entries()).find(([x,t]) => part.classList.contains(x))
            if (tpe) {            
              let name = n > 0 ? sec + '_' + (n + 1) : sec      
              exercises[name] = tpe[1](part,name)
            }
        })
    })
    
    window.addEventListener("beforeunload",() => {
      if (!nosave) {
        localStorage.setItem(window.metadata.title + "_" + window.metadata.sheet, JSON.stringify(write()))      
      }
    })

    const at = document.querySelector("table#authors > tbody")
    if (!at) {
      console.error("table with class authors was not found")
    } else {
      authorTable = at
    }

    let partial = localStorage.getItem(window.metadata.title + "_" + window.metadata.sheet)
    if (partial) {
      read(JSON.parse(partial))
    } else read({
      authors: [],
      solutions: {}
    })
})

function author(n: number, author?: Author): View<Author> {
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
  if (author) matnrField.innerText = author.matriculation_number
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
      matnrField.innerText = x.matriculation_number
      emailField.innerText = x.email
    }
  }
}



function write() {
  let res: Solution = {
    course: window.metadata.title,
    sheet: window.metadata.sheet,
    authors: authors.map(x => x.get()),
    solutions: {}
  }    
  for (const [x,y] of Object.entries(exercises)) {
    if (y) {
      let v = y.get()
      if (v) res.solutions[x] = v
    }
  }
  return res
}

function read(value: Solution) {
  if (authorTable) {
    authors = []
    authorTable.innerHTML = "" 
    if (value.authors.length == 0) {
      value.authors.push({
        name: "",
        matriculation_number: "",
        email: ""
      })
    }    
    value.authors.forEach((a,i) => {
      console.log(a)
      let view = author(i + 1, a)
      if (authorTable) authorTable.appendChild(view.elem)
      authors.push(view)
    })
  }
  for (const [x,y] of Object.entries(exercises)) {
    let v = value.solutions[x]
    if (v) y.set(v)
  }
}

declare global {
  var ublatt: Ublatt;
}

window.ublatt = {
  registerExerciseType: (name,c) => {
    exerciseTypes.set(name, c)
  },

  addAuthor: () => {
    if (authorTable) {
      let a = author(authors.length + 1)      
      authorTable.appendChild(a.elem)
      authors.push(a)
    }
  },

  removeAuthor: () =>  {
    authors.pop()?.elem.remove()
  },

  save: () => {
    let res = write()  
    let a = document.createElement('a')
    a.download = "sheet" + window.metadata.sheet + ".json";
    var data = new Blob([JSON.stringify(res)], {type: 'application/json'});
    a.href = URL.createObjectURL(data)
    a.click()  
  },

  clearSheet: () => {
    localStorage.removeItem(window.metadata.title + "_" + window.metadata.sheet)  
    nosave = true;
    window.location.reload()
  },

  load: () => {
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
              if (typeof json.course != "string" || 
                  typeof json.authors != "object" || 
                  typeof json.sheet != "string" ||
                  typeof json.solutions != "object") {
                alert("Keine gültige JSON Datei!")           
              }
              else if (json.course != window.metadata.title) {
                alert(`Diese Abgabe ist für den Kurs '${json.course}.'`);
              } else if (json.sheet != window.metadata.sheet) {
                alert(`Diese Abgabe ist für Übungsblatt ${json.sheet}.`);            
              } else {
                read(json)
              }
            } else if (reader.error) throw reader.error
          } catch(e) {
            console.error(e)
            alert("Keine gültige JSON Datei!")          
          }
        });
        reader.readAsText(file);
      } 
    })
    x.click()  
  }
}

