import { Renderer } from "./template";

export default function <T extends Renderer> (props: {
  buttons: string
}) {
  return (µ: T) => (
    µ('div', { class: 'submit' },      
      µ('h1', {}, 'Abgabe'),
      µ('div', { class: 'row' },
        µ('div', {},          
          µ('p',{},'Bitte gebt alle Autoren mit Matrikelnummer und Emailaddresse ' +
            'an und speichert dann eure Lösung. Die gespeicherte JSON Datei sendet ' +
            'ihr dann an beide Tutoren per E-Mail.')          
        ),
        µ('div', {},          
          µ('div', { class: 'authors' })
        )
      ),
      µ('div',{ class: 'buttons', id: props.buttons }
    )
  ))  
}