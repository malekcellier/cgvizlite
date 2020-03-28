/**
 * utils.js
 * 
 * Useful functions
 * 
 * # Author: Malek Cellier
 * # 
 * # Email: malek.cellier@gmail.com
 * # Created: 2020-03-11
 */

function randInt(min, max) {
    /**
     * randInt: generate one value between min and max
     */
    return Math.round(Math.random()*(max-min) + min);
}

function extendFunction(func, before, after) {
    /**
     * simpler function
     */
    return function(){
        if (before) before.apply(this, arguments);
      //func(evt);
      func.apply(this, arguments);
      if (after) after.apply(this, arguments);
    };
  }

function extendFunc(container, func, before, after) {
    /**
     * extendFunc: modifies an existing function with extra steps before and/or after
     *  
     */
    (function() {
        let proxied = container[func];
        container[func] = function() {
            if (before) before.apply(this);
            let result = proxied.apply(this, arguments);
            if (after) after.apply(this);
            return result;
        };
    })();

}

function range(start, end, step = 1) {
    /**
     * Range of numbers from start till end, both included, with step of step
     */
    const len = Math.floor((end - start) / step) + 1
    return Array(len).fill().map((_, idx) => start + (idx * step))
  }

function randRGB() {
    let r = randInt(0, 255);
    let g = randInt(0, 255);
    let b = randInt(0, 255);

    return [r, g, b];
}

const percentToHex = (p) => {
    const percent = Math.max(0, Math.min(100, p)); // bound percent from 0 to 100
    const intValue = Math.round(percent / 100 * 255); // map percent to nearest integer (0 - 255)
    const hexValue = intValue.toString(16); // get hexadecimal representation
    return hexValue.padStart(2, '0').toUpperCase(); // format with leading 0 and upper case characters
}

function makeResizableDiv(div) {
    /**
     * Make a div resizable
     */
    // get the element
    const element = document.querySelector(div);
    // add the resizers to it
    element.appendChild(createResizers());
    const resizers = document.querySelectorAll(div + ' .resizer')
    // definitions
    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_x = 0;
    let original_y = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
    for (let i = 0;i < resizers.length; i++) {
      const currentResizer = resizers[i];
      currentResizer.addEventListener('mousedown', function(evt) {
        evt.preventDefault();        
        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
        original_x = element.getBoundingClientRect().left;
        original_y = element.getBoundingClientRect().top;
        original_mouse_x = evt.pageX;
        original_mouse_y = evt.pageY;
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
      });
    
      function resize(evt) {        
        let width;
        let height;        
        if (currentResizer.classList.contains('bottom-right')) {
          width = original_width + (evt.pageX - original_mouse_x);
          height = original_height + (evt.pageY - original_mouse_y)
          if (width > minimum_size) {
            element.style.width = width + 'px'
          }
          if (height > minimum_size) {
            element.style.height = height + 'px'
          }
        }
        else if (currentResizer.classList.contains('bottom-left')) {
          height = original_height + (evt.pageY - original_mouse_y)
          width = original_width - (evt.pageX - original_mouse_x)
          if (height > minimum_size) {
            element.style.height = height + 'px'
          }
          if (width > minimum_size) {
            element.style.width = width + 'px'
            element.style.left = original_x + (evt.pageX - original_mouse_x) + 'px'
          }
        }
        else if (currentResizer.classList.contains('top-right')) {
          width = original_width + (evt.pageX - original_mouse_x)
          height = original_height - (evt.pageY - original_mouse_y)
          if (width > minimum_size) {
            element.style.width = width + 'px'
          }
          if (height > minimum_size) {
            element.style.height = height + 'px'
            element.style.top = original_y + (evt.pageY - original_mouse_y) + 'px'
          }
        } else if (currentResizer.classList.contains('top-middle')){
          height = original_height - (evt.pageY - original_mouse_y)
          if (height > minimum_size) {
            element.style.height = height + 'px'
            element.style.top = original_y + (evt.pageY - original_mouse_y) + 'px'
          }
          
        } else if (currentResizer.classList.contains('bottom-middle')){
          height = original_height + (evt.pageY - original_mouse_y)
          if (height > minimum_size) {
            element.style.height = height + 'px'
          }
        } else if (currentResizer.classList.contains('left-middle')){
          width = original_width - (evt.pageX - original_mouse_x)
          if (width > minimum_size) {
            element.style.width = width + 'px'
            element.style.left = original_x + (evt.pageX - original_mouse_x) + 'px'
          }          
        } else if (currentResizer.classList.contains('right-middle')){
          width = original_width + (evt.pageX - original_mouse_x);
         if (width > minimum_size) {
            element.style.width = width + 'px'
          }
        }
        else {
          width = original_width - (evt.pageX - original_mouse_x)
          height = original_height - (evt.pageY - original_mouse_y)
          if (width > minimum_size) {
            element.style.width = width + 'px'
            element.style.left = original_x + (evt.pageX - original_mouse_x) + 'px'
          }
          if (height > minimum_size) {
            element.style.height = height + 'px'
            element.style.top = original_y + (evt.pageY - original_mouse_y) + 'px'
          }
        }
      }      
    
      function stopResize() {
        window.removeEventListener('mousemove', resize)
      }
    }

    function createResizers(mode) {
        /**
         * creates structured dom element that will implement the edges to grab and resize a div
         * mode: how many resizer handles
         *  - 'one' for bottom-right
         *  - 'middles' for all 4 middles
         *  - 'corners', 
         *  - 'all': 'middles' and corners
         */
        mode = mode || 'all'; // options are 'one
        let resizer = document.createElement('div');
        resizer.classList.add('resizers');
        
        let positions = {
            'one': 'bottom-right',
            'middles': ['top-middle', 'bottom-middle', 'left-middle', 'right-middle'],
            'corners': ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        };
        
        if (mode === 'one') {
            let el = document.createElement('div');
            el.classList.add('resizer')
            el.classList.add(positions[mode])
            resizer.appendChild(el);
        } else {
            if (mode === 'all' || mode === 'corners') {
                for (let i=0; i<positions['corners'].length; i++) {
                    let el = document.createElement('div');
                    el.classList.add('resizer')
                    el.classList.add(positions['corners'][i])
                }
            }
            if (mode === 'all' || mode === 'middles') {
                for (let i=0; i<positions['middles'].length; i++) {
                    let el = document.createElement('div');
                    el.classList.add('resizer')
                    el.classList.add(positions['middles'][i])
                }
            }
        }
    }

  }



export {randInt, extendFunction, range, randRGB, percentToHex};