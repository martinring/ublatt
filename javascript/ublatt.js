document.addEventListener("DOMContentLoaded", function(e) {
  let inputs = document.getElementsByTagName("textarea");
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs.item(i)    
    if (input.classList.contains("math")) {      
      let row = document.createElement("div");
      row.classList.add("row")
      input.parentElement.replaceChild(row,input);
      let leftColumn = document.createElement("div");
      leftColumn.classList.add("column");
      let rightColumn = document.createElement("div");
      rightColumn.classList.add("column");      
      row.appendChild(leftColumn);
      row.appendChild(rightColumn);      
      leftColumn.appendChild(input);      
      let div = document.createElement("div");      
      div.classList.add("rendered", "math");
      rightColumn.appendChild(div);
      let editor = CodeMirror.fromTextArea(input, {
        mode: "text/x-stex",
        viewportMargin: Infinity
      })
      let textMarker;
      editor.on("change", function(cm) {
        if (textMarker) textMarker.clear();
        try {
          if (cm.getValue().trim().length == 0) {
            div.innerHTML = "";
            div.classList.add("placeholder");
            div.classList.remove("error");
          } else {
            katex.render(cm.getValue(),div);
            div.classList.remove("placeholder");
            div.classList.remove("error");
          }
        } catch (e) {
          div.classList.remove("placeholder");
          div.classList.add("error")
          if (e.position) {
            textMarker = cm.markText(
              cm.getDoc().posFromIndex(e.position),
              cm.getDoc().posFromIndex(e.position + 1),
              {
                className: "error"
              }
            ) 

          }
        }
      })
      div.classList.add("placeholder");
    }
  }
})