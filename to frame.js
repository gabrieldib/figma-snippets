console.clear()

function log(...args) {
    args.forEach(arg => {
        console.log(arg);
    });
}
function clone(val) {
  const type = typeof val;

  if (val === null) {
    return null;
  } else if (type === 'undefined' || type === 'number' ||
             type === 'string' || type === 'boolean') {
    return val;
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x));
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val);
    } else if (val.type === 'FRAME') {
      // Use Figma's clone method for FrameNode
      const cloned_frame = val.clone();

      return cloned_frame;
    }  else if (val.type === 'GROUP') {
      const cloned_group = val.clone();

      return cloned_group;
    
    } else {
      let o = {};
      for (const key in val) {
        o[key] = clone(val[key]);
      }
      return o;
    }
  }


  throw 'unknown';
}

let sel = figma.currentPage.selection
let og_settings = figma.currentPage.findAll(node => node.name === "settings" && node.parent.name === 'reference')[0]


const RUN = true

if (RUN) {
    sel.forEach( element => {
        // create a frame for our ui control and insert the settings node in it        
        const ui_control = figma.createFrame()
        ui_control.fills = []
        const settings = clone(og_settings)
        
        ui_control.appendChild(settings)
        settings.visible = false
        settings.x = 0
        settings.y = 0
        
        // setup the ui control in the selected element's parent, set its name, coords, size
        ui_control.name = element.name
        element.parent.appendChild(ui_control)
        ui_control.x = element.x
        ui_control.y = element.y
        ui_control.resize(element.width, element. height)
        
        const contents = clone(element)
        
        const contents_frame = figma.createFrame()
        ui_control.appendChild(contents_frame)
        contents_frame.name = 'contents'
        contents_frame.x = 0
        contents_frame.y = 0
        contents_frame.resize(element.width, element. height)
        
        contents_frame.fills = []

        contents.children.forEach(child => {
            
        contents_frame.appendChild(child);
            
            if (element.type == 'FRAME') {
                log(child.name, "parent is a frame")
            }
            if (element.type == 'GROUP') {
                child.x = child.x - element.x
                child.y = child.y - element.y
                log(`p_x:${child.parent.x} p_y:${child.parent.y},  x:${child.x} y:${child.y}`)
            }
        })
              
        if (contents.type !== 'GROUP') {
          log("removing contents aux variable, it was a group...")
          contents.remove()  
        }

        const settings_PNG = settings.findAll(node => node.name.includes('PNG'))[0]
        const picture = element.findAll(node => node.name.includes("PNG"))[0].name
        settings_PNG.name = picture
        
        element.remove()
    })
}
