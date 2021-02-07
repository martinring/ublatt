import './combine.css'
import { Exercise, ExerciseType, Eval } from '../Types';

export default class Combine implements ExerciseType<number[]> {
    public eval(elem_: Element, name: string, value: Eval<number[]>): Element {        
        const elem = elem_.cloneNode(true) as Element

        let lefts = Array.from(elem.querySelectorAll<HTMLLIElement>('ul:first-child>li')).map(left => {
            left.classList.add('left')
            let placeholder = document.createElement('li')
            placeholder.classList.add('placeholder')                        
            left.insertAdjacentElement("afterend",placeholder);
            return placeholder
        })        

        let rights = Array.from(elem.querySelectorAll<HTMLLIElement>('ul:last-child>li')).map((right,i) => {            
            right.draggable = true
            right.addEventListener('dragstart',function (e: DragEvent) {
                e.dataTransfer?.setData('row',i.toString())
            })
            return right;
        })
                
        value.submission.forEach((l,r) => {
            let right = document.createElement('div') 
            right.innerHTML = rights[r].innerHTML
            if (l != Number.NaN && l != null) {
                lefts[l].appendChild(right)
            }
        })

        elem.querySelector<HTMLUListElement>('ul:last-child')?.remove()

        return elem
    }

    public make(elem: Element, name: string): Exercise<number[]> {
        let lefts = Array.from(elem.querySelectorAll<HTMLLIElement>('ul:first-child>li')).map(left => {
            left.classList.add('left')
            let placeholder = document.createElement('li')
            placeholder.classList.add('placeholder')
            left.insertAdjacentElement("afterend",placeholder);
            return placeholder
        })

        const rightPanel = elem.querySelector<HTMLUListElement>('ul:last-child')        

        let rights = Array.from(elem.querySelectorAll<HTMLLIElement>('ul:last-child>li')).map((right,i) => {            
            right.draggable = true
            right.addEventListener('dragstart',function (e: DragEvent) {
                e.dataTransfer?.setData('row',i.toString())
            })
            return right;
        })        
        
        rightPanel?.addEventListener('dragover', function (e) {
            e.preventDefault();
        })
        rightPanel?.addEventListener('dragenter', function (e) {
            rightPanel.classList.add('drag-over');
        })
        rightPanel?.addEventListener('dragleave', function (e) {
            rightPanel.classList.remove('drag-over');
        })

        rightPanel?.addEventListener('drop', function (e: DragEvent) {
            let row = Number.parseInt(e.dataTransfer?.getData('row') || "-1");
            if (row >= 0) {
                let right = rights[row];
                right.parentElement?.removeChild(right);
                rightPanel.appendChild(right);
                right.dataset.left = undefined;    
                rightPanel.classList.remove('drag-over');
            }
        })
        
        lefts.forEach((left,i) => {            
            left.addEventListener('dragover', function (e) {
                e.preventDefault();
            })
            left.addEventListener('dragenter', function (e) {
                left.classList.add('drag-over');
            })
            left.addEventListener('dragleave', function (e) {
                left.classList.remove('drag-over');
            })
            left.addEventListener('drop', function (e: DragEvent) {
                let row = Number.parseInt(e.dataTransfer?.getData('row') || "-1");
                if (row >= 0) {
                    let right = rights[row];
                    right.parentElement?.removeChild(right);
                    left.appendChild(right);                
                    right.dataset.left = i.toString();
                    left.classList.remove('drag-over');
                }
            })
        })
        return {
            get() { return rights.map(right => Number.parseInt(right.dataset.left || "NaN")) },
            set(x: any) { (x as number[]).forEach((l,r) => {
                let right = rights[r]                                
                right.parentElement?.removeChild(right);
                if (l != Number.NaN && l != null) {
                    right.dataset.left = l.toString()
                    let left = lefts[l]
                    left.appendChild(right)
                } else {
                    right.dataset.left = undefined
                    elem.querySelector('ul:last-child')?.appendChild(right)
                }
            }) }
        }
    }
}