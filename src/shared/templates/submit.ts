import { Renderer } from "./template";

export default function <T extends Renderer> (props: {
  buttons: string
}) {
  return (µ: T) => (
    µ('div', { class: 'submit' },
      µ('div', {},
        µ('h1', {}, 'Autoren'),
        µ('div', { class: 'authors' })
      ),
      µ('div', {},
        µ('h1', {}, 'Abgabe'),
        µ('p',{},'Bitte gebt alle Autoren mit Matrikelnummer und Emailaddresse ' +
          'an und speichert dann eure Lösung. Die gespeicherte JSON Datei sendet ' +
          'ihr dann an beide Tutoren per E-Mail.'),
        µ('div',{ class: 'buttons', id: props.buttons },
        )        
      )
    )
  )
}