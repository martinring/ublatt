document.addEventListener("DOMContentLoaded", function(e) {
  let inputs = document.getElementsByClassName("epart input");
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs.item(i)
    if (input.classList.contains("free")) {
      let rendered = document.createElement("div");
      rendered.classList.add("rendered");
      input.appendChild(rendered);
      let editor = document.createElement("textarea");
      editor.rows = 1;
      input.appendChild(editor);
      function resize() {
        if (editor.value.split("\n").pop().trim().length == 0) 
          rendered.innerText = editor.value + ".";        
        else 
          rendered.innerText = editor.value;
      }
      editor.oninput = resize;
      resize();
    }
    else if (input.classList.contains("code")) {      
      let editor = new CodeMirror(input,{
        mode: "text/x-stex",
        viewportMargin: Infinity,
        lineNumbers: true
      });     
    }
    else if (input.classList.contains("math")) {      
      let rendered = document.createElement("div");
      rendered.classList.add("rendered");            
      let editorWrapper = document.createElement("div");
      editorWrapper.classList.add("editor");      
      input.appendChild(rendered,input);
      input.appendChild(editorWrapper,input);
      let editor = new CodeMirror(editorWrapper,{
        mode: "text/x-stex",
        viewportMargin: Infinity        
      });      
      editorWrapper.addEventListener("transitionend",function() {
        if (input.classList.contains("editing")) {
          editor.focus();
          editor.refresh();
        }
      });
      editor.on("blur",function(e) {                                
        cursors = editor.getSelections();                      
        input.classList.remove("editing")
      })      
      let errorMarker = null;
      let timeout = null;
      editor.setCursor({line:0,ch:0});      
      editor.on("change",function(e) {            
        if (timeout) window.clearTimeout(timeout);
        timeout = null;
        if (errorMarker) errorMarker.clear();
        errorMarker = null;
        let before = rendered.innerHTML;
        try {
          katex.render(editor.getValue(),rendered);
          rendered.classList.remove("error");
        } catch(e) {   
          rendered.innerHTML = before;
          timeout = window.setTimeout(function() {
            let pos   = editor.posFromIndex(e.position + 1);
            let token = editor.getTokenAt(pos);
            console.log(e);
            errorMarker = editor.markText(
              {line:pos.line,ch:token.start},
              {line:pos.line,ch:token.end},
              {
                className: "error"
              });
            rendered.innerHTML = e.message;
            rendered.classList.add("error");
          }, 700);
        }
      })            
      input.addEventListener("click",function(e) { 
        {          
          input.classList.add("editing");          
      } })
    }
  }

  let combines = document.getElementsByClassName("epart combine");  
  for (let i = 0; i < combines.length; i++) {
    let combine = combines.item(i);
    let items = {};
    let lefts = combine.getElementsByClassName("placeholder");
    let rights = combine.getElementsByClassName("right");
    for (let row = 0; row < rights.length; row++) {      
      let right = rights.item(row);
      items[row] = right;
      right.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('row',row);
      })      
    }
    for (let row = 0; row < lefts.length; row++) {
      let left = lefts.item(row);
      left.addEventListener('dragover',function(e) {
        e.preventDefault();
      })
      left.addEventListener('dragenter',function(e) {
        left.classList.add('drag-over');
      })
      left.addEventListener('dragleave',function(e) {
        left.classList.remove('drag-over');
      })
      left.addEventListener('drop',function(e) {
        let row = e.dataTransfer.getData('row');
        let right = items[row];
        right.parentElement.removeChild(right);
        left.appendChild(right);
        left.classList.remove('drag-over');
      })
    }    
  }
})