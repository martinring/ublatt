if (!window.ublatt) {
  console.error("ublatt is undefined")
} else {
  window.ublatt.registerExerciseType('choice', function (elem,name) {
      let container = elem.children.item(0)       
      if (container) {              
          if (container.tagName == 'TABLE') {                            
            let groupElems: Array<Array<HTMLTableDataCellElement>> = [];
            if (elem.classList.contains('grouped')) {
              groupElems = Array.from(container.querySelectorAll('tbody tr')).map((row) => {
                return Array.from(row.querySelectorAll('td'))
              })
            } else {
              groupElems = [Array.from(container.querySelectorAll('tbody td'))]
            }
            groupElems = groupElems.map(group => group.filter((elem) => {
              if (elem.innerText == '-') {
                elem.classList.add('disabled')
                return false
              }
              return elem.innerText.trim() == ''
            }))
            let groups = groupElems.map((group,i) => {
              let groupName = name + '-' + i
              let choices = group.map((choice,i) => {
                let cb = document.createElement('input')          
                cb.type = elem.classList.contains('single') ? 'radio' : 'checkbox'
                cb.name = groupName
                cb.id = groupName + "-" + i
                let label = document.createElement('label')
                let description = document.createElement('div')
                description.classList.add('description')
                label.appendChild(description)
                label.htmlFor = cb.id
                description.innerHTML = choice.innerHTML
                choice.innerHTML = ""
                choice.appendChild(cb)
                choice.appendChild(label)
                return {
                  get: () => cb.checked,
                  set: (o: boolean) => cb.checked = o
                }                                          
              })
              return {
                get: () => choices.map((x) => x.get()),
                set: (x: Array<boolean>) => x.forEach((x,i) => choices[i].set(x))
              }
            })                  
            return {
              get: () => groups.map((x) => x.get()),
              set: (x: Array<Array<boolean>>) => x.forEach((x,i) => groups[i].set(x))
            }
          } else {
            // coice list                                 
            let choices = Array.from(container.querySelectorAll('li')).map((choice,i) => {                  
              let cb = document.createElement('input')                                    
              cb.type = elem.classList.contains('single') ? 'radio' : 'checkbox'
              cb.name = name
              cb.id = name + "-" + i
              let label = document.createElement('label')
              let description = document.createElement('div')
              description.classList.add('description')
              label.appendChild(description)
              label.htmlFor = cb.id
              description.innerHTML = choice.innerHTML
              choice.innerHTML = ""
              choice.appendChild(cb)
              choice.appendChild(label)                    
              return {
                get: () => cb.checked,
                set: (o: boolean) => cb.checked = o
              }
            })                  
            return {
              get: () => choices.map((x) => x.get()),
              set: (x: Array<boolean>) => x.forEach((x,i) => choices[i].set(x))
            }
        }
      } else {
        console.error("choice does not contain ul, ol or table element")
        return {
          get: () => undefined,
          set: (x) => {}
        }
      }
  })
}