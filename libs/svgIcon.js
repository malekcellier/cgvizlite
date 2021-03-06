/*

svgIcon.js

svg icon creator: from existing code

Requires: _el function (see ui.js)

The flow:
    > Only one function to use: SvgIcon.new('icon_name')
        > creates a div and puts a svg inside
        > the svg is created by calling _getSvg('icon_name')

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-03-10
*/

// We create a namespace instead of a class
let SvgIcon = {};

SvgIcon.getList = function () {
    /**
     * Returns the list of icons
     */
    let icons = [];
    let properties = Object.keys(this);
    for (let i=0; i<properties.length; i++) {
        if (properties[i].includes('_icon_')) {
            let icon_name_parts = properties[i].split('_');
            let icon_name = icon_name_parts.splice(2, icon_name_parts.length).join('_');
            icons.push(icon_name);
        }
    }
    return icons;
};

SvgIcon.elements = SvgIcon.getList();

SvgIcon.isIcon = function (icon) {
    // TODO check that icon is a string
    let elements = SvgIcon.getList();
    return elements.includes(icon);
}

SvgIcon.new = function (opts) {
    /**
     * Creates a new div containing a SVG Icon
     * 
     * opts: json object with fields:
     *  - icon: string, the name of the icon
     *  - attrs: json object containing {attribute: value} for the SVG customization
     *  - tip_pos: string, position of the tooltip
     * 
     */
    // Default values handling
    opts = opts || {};
    opts.icon = opts.icon || 'close';
    opts.attrs = opts.attrs || {};
    opts.tip_pos = opts.tip_pos || 'info-bottom';
    opts.tip_text = opts.tip_text || opts.icon;

    let svgIcon = document.createElement('div');
    svgIcon.classList.add('svg-icon');
    let svg = this._get(opts.icon); // defaults are applied in the _svgTemplate
    svgIcon.appendChild(svg);
    // The svg attributes are optional
    if (opts.attrs !== {}) {
        let attributes = Object.keys(opts.attrs);
        for (let i=0; i<attributes.length; i++) {
            let attr = attributes[i];
            let value = opts.attrs[attr];
            svg.setAttribute(attr, value);
        }
    }
    // add tooltip
    svgIcon.classList.add(opts.tip_pos);
    // add icon type as attribute
    svgIcon.setAttribute('type', opts.icon);
    // add tooltip text
    svgIcon.setAttribute('info-text', opts.tip_text);
    // add click event
    svgIcon.onclick = (evt) => {
        evt.target.classList.toggle('clicked');
        /**
         * Some icons have special behavior
         *  - down: becomes up with a 180deg rotation
         *  - right: becomes down with a 90deg rotation
         *  - eye-open <-> eye-closed
         *  - switch-open <-> switch-closed
         */
        // NOTE: this function will have to be extended in order to add extra behaviors
        // See https://stackoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically/54379923#54379923
        //let icon_name = evt.target.attributes['info-text'].value;
        let icon_name = evt.target.attributes['type'].value;
        //if (icon_name === 'down' || icon_name === 'switch_square' || icon_name === 'switch_square_rev') {
        if (['down', 'switch_square', 'switch_square_rev', 'square_switch', 'round_switch'].includes(icon_name)) {
            if (evt.target.classList.contains('rotated')) {
                evt.target.classList.remove('rotated');
                evt.target.querySelector('svg').style.transform = '';
            } else {
                evt.target.classList.add('rotated');
                evt.target.querySelector('svg').style.transform = 'rotate(180deg)';
            }
        } else if (icon_name === 'show_hide') {
            if (evt.target.classList.contains('rotated')) {
                evt.target.classList.remove('rotated');
                evt.target.querySelector('svg').style.transform = '';
            } else {
                evt.target.classList.add('rotated');
                evt.target.querySelector('svg').style.transform = 'rotate(180deg)';
            }
        } else if (icon_name === 'eye_open') {
            evt.target.removeChild(evt.target.querySelector('svg'));
            evt.target.appendChild(this._get('eye_closed'));
            evt.target.setAttribute('type', 'eye_closed');
        } else if (icon_name === 'eye_closed') {
            evt.target.removeChild(evt.target.querySelector('svg'));
            evt.target.appendChild(this._get('eye_open'));
            evt.target.setAttribute('type', 'eye_open');
        } else if (icon_name === 'switch_on') {
            evt.target.removeChild(evt.target.querySelector('svg'));
            evt.target.appendChild(this._get('switch_off'));
            evt.target.setAttribute('type', 'switch_off');
        } else if (icon_name === 'switch_off') {
            evt.target.removeChild(evt.target.querySelector('svg'));
            evt.target.appendChild(this._get('switch_on'));
            evt.target.setAttribute('type', 'switch_on');
        } else if (icon_name === '2d') {
            evt.target.removeChild(evt.target.querySelector('svg'));
            evt.target.appendChild(this._get('3d'));
            evt.target.setAttribute('type', '3d');
        } else if (icon_name === '3d') {
            evt.target.removeChild(evt.target.querySelector('svg'));
            evt.target.appendChild(this._get('2d'));
            evt.target.setAttribute('type', '2d');
        }
    };
    // Special processing: OBS does not work as intended, the tooltip is also rotated :-/
    /*
    if (opts.icon === 'pin') {
        svgIcon.style['transform'] = 'rotate(30deg)';
    }
    */

    return svgIcon;
};

SvgIcon._get = function(name) {
    /**
     * Returns svg. Works as a wrapper to all the functions named _icon_{icon_name}
     */
    let func_name = `_icon_${name}`; 
    let svg;
    if (this.hasOwnProperty(func_name)) {
        svg = this[func_name]();
        svg.appendChild(this._createInvisibleRect());
    } else {
        console.error(`SvgIcon has no icon named ${name}`);
    }
    return svg;
}

SvgIcon._svgTemplate = function (opts) {
    /**
     * Creates a default svg file based off the commonly used values
     */
    // Default values
    opts = opts || {};  
    opts.id = opts.id || '';
    opts.view_box = opts.view_box || '0 0 64 64';
    //opts.width = opts.width || '100%';
    opts.height = opts.height || '100%';
    opts.style = opts.style || 'fill: currentcolor';
  
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
    if (opts.id !== '') {
      svg.setAttribute('id', opts.id);
    }
    svg.setAttribute('viewBox', opts.view_box);
    //svg.setAttribute('width', opts.width);
    svg.setAttribute('height', opts.height);
    svg.setAttribute('style', opts.style);
  
    return svg;
};
  
SvgIcon._createInvisibleRect = function () {
    /**
     * Used to make sure the click on the svg registers. It seems that it should work using pointer-events: bounding-box but it doesnt...
     */
    let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
  
    rect.setAttribute('x', "0");
    rect.setAttribute('y', "0");
    rect.setAttribute('width', "100%");
    rect.setAttribute('height', "100%");
    rect.setAttribute('fill', "transparent");
  
    return rect;
};

SvgIcon._icon_cgviz = function() {    
    let svg = this._svgTemplate();

    let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    svg.appendChild(circle);
    circle.setAttribute('style', "fill: #1FBAD6");
    circle.setAttribute('cx', "32");
    circle.setAttribute('cy', "20");
    circle.setAttribute('r', "16");

    let circle1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    svg.appendChild(circle1);
    circle1.setAttribute('style', "fill: #535C6C");
    circle1.setAttribute('cx', "32");
    circle1.setAttribute('cy', "62");
    circle1.setAttribute('r', "10");    

    return svg;
};

SvgIcon._icon_layers = function() {
    let svg = this._svgTemplate();
        
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M50.88,43.52a3.2,3.2,0,0,1,0,5.86L34.56,56.52a6.42,6.42,0,0,1-5.13,0L13.12,49.37a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05,16.32,7.14a3.19,3.19,0,0,0,2.56,0L49.6,46.44l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95Zm0-14.39a3.2,3.2,0,0,1,0,5.86L34.56,42.13a6.42,6.42,0,0,1-5.13,0L13.12,35a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05L30.72,39.2a3.19,3.19,0,0,0,2.56,0L49.6,32.06l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95ZM13.12,20.6a3.2,3.2,0,0,1,0-5.86L29.44,7.6a6.39,6.39,0,0,1,5.13,0l16.32,7.14a3.2,3.2,0,0,1,0,5.86L34.56,27.74a6.39,6.39,0,0,1-5.13,0Z');
    
    return svg;
};

SvgIcon._icon_filters = function() {
    let svg = this._svgTemplate();
        
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M52.5,19.67l-16,20h0a6.24,6.24,0,0,0-1.37,3.9V57L30.6,54.74a3.12,3.12,0,0,1-1.73-2.79V43.58h0a6.24,6.24,0,0,0-1.37-3.9l-16-20a5,5,0,0,1-1.35-3.24c0-5.17,9.78-9.36,21.85-9.36s21.85,4.19,21.85,9.36A5,5,0,0,1,52.5,19.67Zm-20.5,3c8.62,0,15.61-2.79,15.61-6.24s-7-6.24-15.61-6.24S16.39,13,16.39,16.43,23.38,22.67,32,22.67Z');
    
    return svg;
};

SvgIcon._icon_interactions = function() {
    let svg = this._svgTemplate();
        
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);  
    g.setAttribute('transform', "scale(1.2, 1.2) translate(0, 2)");
    
    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    g.appendChild(polygon);
    polygon.setAttribute('points', '22.5,11.1 27.6,43.9 35.3,37.3 43,49 48.8,45 41,33.2 49,28.3');
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    g.appendChild(path);
    path.setAttribute('d', 'M21.2,27.8C14.5,26.6,9.8,20.7,9.8,14c0-7.7,6.3-14,14-14s14,6.3,14,14c0,0.8-0.1,1.5-0.2,2.3l-2.5-0.4 c0.1-0.6,0.2-1.3,0.2-1.8c0-6.4-5.2-11.5-11.5-11.5S12.3,7.7,12.3,14c0,5.5,3.9,10.3,9.4,11.4L21.2,27.8z');
    
    return svg;
};

SvgIcon._icon_settings = function() {
    let svg = this._svgTemplate();
        
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g); 
    g.setAttribute('transform', "translate(3, 4) scale(0.9, 0.9)");
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    g.appendChild(path);
    path.setAttribute('d', 'M32.2,52.32a6.24,6.24,0,0,0,12.09,0h9.56a1.56,1.56,0,0,0,0-3.12H44.29a6.24,6.24,0,0,0-12.09,0h-22a1.56,1.56,0,0,0,0,3.12ZM16.59,33.59a6.24,6.24,0,0,0,12.09,0H53.85a1.56,1.56,0,0,0,0-3.12H28.68a6.24,6.24,0,0,0-12.09,0H10.15a1.56,1.56,0,1,0,0,3.12ZM35.32,11.74H10.15a1.56,1.56,0,1,0,0,3.12H35.32a6.24,6.24,0,0,0,12.09,0h6.44a1.56,1.56,0,0,0,0-3.12H47.41a6.24,6.24,0,0,0-12.09,0Z');
    
    return svg;
};

SvgIcon._icon_bug = function() {
    let svg = this._svgTemplate();
        
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    g.appendChild(path);
    path.setAttribute('d', 'M32 8.333C26.698 8.333 22.4 13 22.4 19h19.2c0-6-4.298-10.667-9.6-10.667z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    g.appendChild(path1);
    path1.setAttribute('d', 'M53.6 32H46v-6.506c0-.074.184-.142.18-.215l5.417-5.907c.937-1.042.987-2.73.05-3.772-.937-1.041-2.432-1.041-3.369 0l-5.304 5.664c-.066-.004-.115-.264-.181-.264H21.207c-.066 0-.128.26-.193.264l-5.317-5.785c-.937-1.042-2.457-.981-3.394.06-.937 1.042-.937 2.76 0 3.802l5.516 5.923c-.003.072.181.156.181.23V32h-7.6C9.075 32 8 33.027 8 34.5S9.075 37 10.4 37h7.2c0 3 .375 4.299 1.025 6.12-.105.084-.227.253-.322.359l-6.788 7.603c-.937 1.041-.937 2.76 0 3.802.937 1.04 2.457 1.056 3.394.015l6.443-6.93C23.494 50.693 26 52.619 30 53.246V27h4v26.246c4-.626 6.506-2.545 8.648-5.27l6.343 6.938a2.29 2.29 0 0 0 3.444 0c.937-1.041.962-2.73.025-3.771L45.684 43.6c-.094-.105-.21-.396-.316-.48C46.018 41.298 46.4 40 46.4 37h7.2c1.325 0 2.4-1.027 2.4-2.5S54.925 32 53.6 32z');
  
    return svg;
};

SvgIcon._icon_share = function() {
    let svg = this._svgTemplate();
        
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M49.26,56.17H14.74a6.91,6.91,0,0,1-6.91-6.91V32a3.45,3.45,0,1,1,6.91,0V49.26H49.26V32a3.45,3.45,0,1,1,6.91,0V49.26A6.91,6.91,0,0,1,49.26,56.17Z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path1);
    path1.setAttribute('d', 'M44.81,24.08a3.5,3.5,0,0,1-4.9,0l-4.45-4.45V35.44a3.45,3.45,0,0,1-6.91,0V19.62l-4.45,4.45a3.5,3.5,0,0,1-4.9,0,3.44,3.44,0,0,1,0-4.87L29.55,8.85a6,6,0,0,1,.52-.45,2.61,2.61,0,0,1,.62-.31,3.45,3.45,0,0,1,2.62,0,2.61,2.61,0,0,1,.62.31,6,6,0,0,1,.52.45L44.81,19.21A3.44,3.44,0,0,1,44.81,24.08Z');

    return svg;
};
  
SvgIcon._icon_screenshot = function() {    
    let svg = this._svgTemplate({view_box: '0 0 512 512'});
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M60,150.5c0,11.046,8.954,20,20,20s20-8.954,20-20v-50h49c11.046,0,20-8.954,20-20s-8.954-20-20-20h-49v-40c0-11.046-8.954-20-20-20s-20,8.954-20,20v40H20c-11.046,0-20,8.954-20,20s8.954,20,20,20h40V150.5z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path1);
    path1.setAttribute('d', 'M432,210.5c-11.046,0-20,8.954-20,20v52c0,11.046,8.954,20,20,20c11.046,0,20-8.954,20-20v-52C452,219.454,443.046,210.5,432,210.5z');
    
    let path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path2);
    path2.setAttribute('d', 'M362,100.5h10c22.056,0,40,17.944,40,40v10c0,11.046,8.954,20,20,20c11.046,0,20-8.954,20-20v-10c0-44.112-35.888-80-80-80h-10c-11.046,0-20,8.954-20,20S350.954,100.5,362,100.5z');
    
    let path3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path3);
    path3.setAttribute('d', 'M80,210.5c-11.046,0-20,8.954-20,20v52c0,11.046,8.954,20,20,20s20-8.954,20-20v-52C100,219.454,91.046,210.5,80,210.5z');
    
    let path4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path4);
    path4.setAttribute('d', 'M150,411.5h-10c-22.056,0-40-17.944-40-40v-9c0-11.046-8.954-20-20-20s-20,8.954-20,20v9c0,44.112,35.888,80,80,80h10c11.046,0,20-8.954,20-20C170,420.454,161.046,411.5,150,411.5z');
    
    let path5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path5);
    path5.setAttribute('d', 'M492,411.5h-40v-49c0-11.046-8.954-20-20-20c-11.046,0-20,8.954-20,20v49h-50c-11.046,0-20,8.954-20,20c0,11.046,8.954,20,20,20h50v40c0,11.046,8.954,20,20,20c11.046,0,20-8.954,20-20v-40h40c11.046,0,20-8.954,20-20C512,420.454,503.046,411.5,492,411.5z');
    
    let path6 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path6);
    path6.setAttribute('d', 'M282,60.5h-52c-11.046,0-20,8.954-20,20s8.954,20,20,20h52c11.046,0,20-8.954,20-20S293.046,60.5,282,60.5z');
    
    let path7 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path7);
    path7.setAttribute('d', 'M282,411.5h-52c-11.046,0-20,8.954-20,20c0,11.046,8.954,20,20,20h52c11.046,0,20-8.954,20-20C302,420.454,293.046,411.5,282,411.5z');

    return svg;
};
  
SvgIcon._icon_info = function() {
    let svg = this._svgTemplate();
        
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M23.62,23.41a1,1,0,0,1,.39.08,1,1,0,0,0-.78,0A1,1,0,0,1,23.62,23.41Z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path1);
    path1.setAttribute('d', 'M32,57.5A24.83,24.83,0,1,1,56.83,32.67,24.86,24.86,0,0,1,32,57.5Zm0-44.86a20,20,0,1,0,20,20A20,20,0,0,0,32,12.64Z');
    
    let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.appendChild(rect1);
    rect1.setAttribute('x', "28.8");
    rect1.setAttribute('y', "29.46");
    rect1.setAttribute('width', "6.41");
    rect1.setAttribute('height', "16.02");
    rect1.setAttribute('rx', "1.6");
    rect1.setAttribute('ry', "1.6");
    
    let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.appendChild(rect2);
    rect2.setAttribute('x', "28.8");
    rect2.setAttribute('y', "19.85");
    rect2.setAttribute('width', "6.41");
    rect2.setAttribute('height', "6.41");
    rect2.setAttribute('rx', "1.6");
    rect2.setAttribute('ry', "1.6");
    
    return svg;
};

SvgIcon._icon_tooltip = function () {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M52 10H12a8 8 0 0 0-8 8v20a8 8 0 0 0 8 8h4v7c0 .567.455 1 .964 1 .17 0 .345-.031.512-.121L32 46h20a8 8 0 0 0 8-8V18a8 8 0 0 0-8-8zm-8 24H20v-4h24v4zm4-8H16v-4h32v4z');    

    return svg;
};

SvgIcon._icon_pin = function () {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M36 35.476V59a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V35.476C21.103 33.696 16 27.453 16 20c0-8.836 7.163-16 16-16s16 7.164 16 16c0 7.453-5.103 13.697-12 15.476z');
    
    return svg;
};

SvgIcon._icon_legend = function() {
    let svg = this._svgTemplate();
        
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);
    path.setAttribute('d', 'M29.78,45.89v5.56H46.44V45.89Zm-11.11,0v5.56h5.56V45.89ZM29.78,34.78v5.56H46.44V34.78Zm-11.11,0v5.56h5.56V34.78ZM29.78,23.67v5.56H46.44V23.67Zm-11.11,0v5.56h5.56V23.67ZM29.78,12.56v5.56H46.44V12.56Zm-11.11,0v5.56h5.56V12.56ZM15.89,7H49.22A2.78,2.78,0,0,1,52,9.78V54.22A2.78,2.78,0,0,1,49.22,57H15.89a2.78,2.78,0,0,1-2.78-2.78V9.78A2.78,2.78,0,0,1,15.89,7Z');

    return svg;
};
  
SvgIcon._icon_dual_canvas = function() {
    let svg = this._svgTemplate();

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    g.setAttribute('transform', "translate(7.500000, 7.500000)");    
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    g.appendChild(path);
    path.setAttribute('d', 'M19.5,47.4137931 C19.5,48.8421157 20.6192881,50 22,50 C23.3807119,50 24.5,48.8421157 24.5,47.4137931 L24.5,2.5862069 C24.5,1.15788427 23.3807119,0 22,0 C20.6192881,0 19.5,1.15788427 19.5,2.5862069 L19.5,47.4137931 Z');
    
    let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    g.appendChild(rect1);
    rect1.setAttribute('x', '0');
    rect1.setAttribute('y', '4');
    rect1.setAttribute('width', '44');
    rect1.setAttribute('height', '5');
    rect1.setAttribute('rx', '2.5');
    
    let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    g.appendChild(rect2);
    rect2.setAttribute('transform', "translate(2.500000, 24.500000) rotate(90.000000) translate(-2.500000, -24.500000)");
    rect2.setAttribute('x', '-18');
    rect2.setAttribute('y', '22');
    rect2.setAttribute('width', '41');
    rect2.setAttribute('height', '5');
    rect2.setAttribute('rx', '2.5');
    
    let rect3 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    g.appendChild(rect3);
    rect3.setAttribute('transform', "translate(41.500000, 25.000000) rotate(90.000000) translate(-41.500000, -25.000000)");
    rect3.setAttribute('x', '20.5');
    rect3.setAttribute('y', '22.5');
    rect3.setAttribute('width', '42');
    rect3.setAttribute('height', '5');
    rect3.setAttribute('rx', '2.5');
    
    let rect4 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    g.appendChild(rect4);    
    rect4.setAttribute('x', '0');
    rect4.setAttribute('y', '41');
    rect4.setAttribute('width', '44');
    rect4.setAttribute('height', '5');
    rect4.setAttribute('rx', '2.5');
  
    return svg;
};
  
SvgIcon._icon_add = function() {
    let svg = this._svgTemplate();
    svg.setAttribute('margin-right', '8px');
        
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path);
    path.setAttribute('d', 'M35.93,28.57V9.89a1,1,0,0,0-1-1h-5.9a1,1,0,0,0-1,1V28.57H9.39a1,1,0,0,0-1,1v5.9a1,1,0,0,0,1,1H28.07V55.11a1,1,0,0,0,1,1h5.9a1,1,0,0,0,1-1V36.43H54.61a1,1,0,0,0,1-1v-5.9a1,1,0,0,0-1-1Z');
    
    return svg;
};
  
SvgIcon._icon_delete = function() {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path);
    path.setAttribute('d', 'M51.4,13.9v1.6c0,0.9-0.7,1.6-1.6,1.6H13.6c-0.9,0-1.6-0.7-1.6-1.6v-1.6c0-0.9,0.7-1.6,1.6-1.6h9 c0.9,0,1.6-0.7,1.6-1.6C24.3,9.7,25.1,9,26,9h11.5c0.9,0,1.6,0.7,1.6,1.6c0,0.9,0.7,1.6,1.6,1.6h9C50.7,12.3,51.4,13,51.4,13.9z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path1);        
    path1.setAttribute('d', 'M40.8,50.1l0.8-25.4h-3.3l-0.8,25.4H40.8z M30.1,50.1h3.3V24.7h-3.3V50.1z M26,50.1l-0.8-25.4h-3.3l0.8,25.4H26 z M44.9,55H18.5c-0.9,0-1.6-0.7-1.6-1.6l-1.5-31.2c0-0.9,0.7-1.7,1.6-1.7h29.4c0.9,0,1.7,0.8,1.6,1.7l-1.5,31.2 C46.5,54.3,45.8,55,44.9,55z');
    
    return svg;
};

SvgIcon._icon_close = function () {
    /**
     * A cross to symbolize the close action
     */
    let svg = this._svgTemplate();
  
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);    
    g.setAttribute('transform', "translate(8, 8)");
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M31.5059707,24 L47.5987718,7.90719891 C48.1337427,7.37222791 48.1337427,6.50972364 47.5987718,5.97475264 L42.0252474,0.40122825 C41.4902764,-0.13374275 40.6277721,-0.13374275 40.0928011,0.40122825 L24,16.4940293 L7.90719891,0.40122825 C7.37222791,-0.13374275 6.50972364,-0.13374275 5.97475264,0.40122825 L0.40122825,5.97475264 C-0.13374275,6.50972364 -0.13374275,7.37222791 0.40122825,7.90719891 L16.4940293,24 L0.40122825,40.0928011 C-0.13374275,40.6277721 -0.13374275,41.4902764 0.40122825,42.0252474 L5.97475264,47.5987718 C6.50972364,48.1337427 7.37222791,48.1337427 7.90719891,47.5987718 L24,31.5059707 L40.0928011,47.5987718 C40.6277721,48.1337427 41.4902764,48.1337427 42.0252474,47.5987718 L47.5987718,42.0252474 C48.1337427,41.4902764 48.1337427,40.6277721 47.5987718,40.0928011 L31.5059707,24 Z');
  
    return svg;
};

SvgIcon._icon_reduce = function() {
    let svg = this._svgTemplate();

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    g.setAttribute('transform', "translate(8, 8)");
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M16.127688,49.4434399 L0.686714703,34.0024666 C-0.228904901,33.086847 -0.228904901,31.6023343 0.686714703,30.6867147 C1.12641074,30.2470187 1.72276655,30 2.34459065,30 L17.785564,30 C19.0804456,30 20.1301546,31.049709 20.1301546,32.3445907 L20.1301546,47.785564 C20.1301546,49.0804456 19.0804456,50.1301546 17.785564,50.1301546 C17.1637399,50.1301546 16.5673841,49.883136 16.127688,49.4434399 Z');

    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path1);
    path1.setAttribute('d', 'M45.127688,19.4434399 L29.6867147,4.0024666 C28.7710951,3.086847 28.7710951,1.60233431 29.6867147,0.686714703 C30.1264107,0.247018663 30.7227665,-8.17124146e-14 31.3445907,-8.17124146e-14 L46.785564,-7.7547585e-14 C48.0804456,-7.7547585e-14 49.1301546,1.04970899 49.1301546,2.34459065 L49.1301546,17.785564 C49.1301546,19.0804456 48.0804456,20.1301546 46.785564,20.1301546 C46.1637399,20.1301546 45.5673841,19.883136 45.127688,19.4434399 Z');
    path1.setAttribute('transform', 'translate(39.065077, 10.065077) rotate(-180.000000) translate(-39.065077, -10.065077)');

    return svg;
};
  
SvgIcon._icon_down = function() {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path)        
    path.setAttribute('d', 'M53,26.21l-4.2-4.3a1,1,0,0,0-1.4,0L32,37.67,16.61,21.92a1,1,0,0,0-1.4,0L11,26.21a1,1,0,0,0,0,1.43L27.1,44.11l4.2,4.3a1,1,0,0,0,1.4,0l4.2-4.3L53,27.65a1,1,0,0,0,0-1.43');
    
    return svg;
};
  
SvgIcon._icon_dots = function() {
    let svg = this._svgTemplate();

    let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.appendChild(rect1);
    rect1.setAttribute('x', "28");
    rect1.setAttribute('y', "44");
    rect1.setAttribute('width', "8");
    rect1.setAttribute('height', "8");
    
    let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.appendChild(rect2);
    rect2.setAttribute('x', "28");
    rect2.setAttribute('y', "28");
    rect2.setAttribute('width', "8");
    rect2.setAttribute('height', "8");
    
    let rect3 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.appendChild(rect3);        
    rect3.setAttribute('x', "28");
    rect3.setAttribute('y', "12");
    rect3.setAttribute('width', "8");
    rect3.setAttribute('height', "8");
    
    return svg;      
};
  
SvgIcon._icon_folder = function() {
    let svg = this._svgTemplate({'view_box': '0 0 1024 1024'});       

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path)        
    path.setAttribute('d', 'M928.6,349.4h-13.4v-97.8c0-33.9-27.5-61.4-61.4-61.4H470.3v-55.6c0-33.9-27.5-61.4-61.4-61.4H71.4c-33.9,0-61.4,27.5-61.4,61.4v730.7c0,33.9,27.5,61.4,61.4,61.4h782.5c4.4,0,50.9-18.6,61.4-61.4L990,410.8C990,376.9,962.5,349.4,928.6,349.4L928.6,349.4z M74.8,194.4c0-33.9,12.1-46,46-46h257.4c33.9,0,46,12.1,46,46v71h1.9h44.1h325.6c33.9,0,46,12.1,46,46v38.1h-677c-33.9,0-55.3,16.7-61.4,61.4L74.8,597.4V194.4z M841.9,821.3c-11.9,35.9-12.1,46-46,46H120.8c-33.9,0-46-12.1-46-46L149.6,463c9.3-34.6,12.1-46,46-46h675.1c33.9,0,53.2,11.2,46,46L841.9,821.3L841.9,821.3z');
    
    return svg;
};
  
SvgIcon._icon_show_hide = function() {
    let svg = this._svgTemplate();
    svg.setAttribute('style', 'fill: currentColor'); // if starts closed

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
    svg.appendChild(path);        
    path.setAttribute('d', 'M26.7,54.7l-4.5-4.4c-0.4-0.4-0.4-1,0-1.4L38.6,33L22.2,17c-0.4-0.4-0.4-1,0-1.5l4.5-4.4c0.4-0.4,1.1-0.4,1.5,0 l17.1,16.7l4.5,4.4c0.4,0.4,0.4,1,0,1.4L45.2,38L28.2,54.7C27.8,55.1,27.1,55.1,26.7,54.7');
    
    return svg;
};
  
SvgIcon._icon_eye_open = function() {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path);
    path.setAttribute('d', 'M55.25,35v-.09a1.86,1.86,0,0,0-.49-1,36.15,36.15,0,0,0-5.05-5,31.92,31.92,0,0,0-13.19-7A21.09,21.09,0,0,0,28,21.8a26.07,26.07,0,0,0-7.4,2.73,40.33,40.33,0,0,0-9.88,7.63c-.54.56-1.07,1.12-1.56,1.73a1.92,1.92,0,0,0,0,2.56,36.09,36.09,0,0,0,5.05,5,31.89,31.89,0,0,0,13.19,7,21.05,21.05,0,0,0,8.51.12,26.06,26.06,0,0,0,7.41-2.73,40.37,40.37,0,0,0,9.88-7.63c.54-.56,1.07-1.12,1.56-1.73a1.84,1.84,0,0,0,.49-1v-.19s0-.06,0-.09,0-.06,0-.09,0-.08,0-.09M32,44.51a9.35,9.35,0,1,1,9.28-9.35A9.31,9.31,0,0,1,32,44.51');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path1);
    path1.setAttribute('d', 'M32,32.07a3.1,3.1,0,1,1-3.07,3.1A3.08,3.08,0,0,1,32,32.07');
    
    return svg;
};
  
SvgIcon._icon_eye_closed = function() {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path);
    path.setAttribute('d', 'M17.55,44.49a42.79,42.79,0,0,1-4.18-3.08,36.09,36.09,0,0,1-5.05-5,1.92,1.92,0,0,1,0-2.56c.49-.6,1-1.17,1.56-1.73a40.33,40.33,0,0,1,9.88-7.63,26.07,26.07,0,0,1,7.4-2.73,21.09,21.09,0,0,1,8.51.12,24.12,24.12,0,0,1,3.41,1L34.34,27.7a7.49,7.49,0,0,0-9.59,9.59Z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path1);        
    path1.setAttribute('d', 'M23.14,47.37l5.73-5.73a7.49,7.49,0,0,0,9.82-9.82l6-6a42.78,42.78,0,0,1,4.18,3.09,36.15,36.15,0,0,1,5.05,5,1.86,1.86,0,0,1,.49,1V35s0,0,0,.09,0,.06,0,.09,0,.06,0,.09v.19a1.84,1.84,0,0,1-.49,1c-.49.6-1,1.17-1.56,1.73a40.37,40.37,0,0,1-9.88,7.63,26.06,26.06,0,0,1-7.41,2.73,21.05,21.05,0,0,1-8.51-.12A24.09,24.09,0,0,1,23.14,47.37Z');
    
    return svg;
};
  
SvgIcon._icon_grab = function() {
    let svg = this._svgTemplate();
            
    let rectangles = [
        {x: '35.01', y:'48.31', width: '6.44', height: '6.44'},
        {x: '35.01', y:'35.43', width: '6.44', height: '6.44'},
        {x: '35.01', y:'22.55', width: '6.44', height: '6.44'},
        {x: '35.01', y:'9.67', width: '6.44', height: '6.44'},
        {x: '22.13', y:'48.31', width: '6.44', height: '6.44'},
        {x: '22.13', y:'35.43', width: '6.44', height: '6.44'},
        {x: '22.13', y:'22.55', width: '6.44', height: '6.44'},
        {x: '22.13', y:'9.67', width: '6.44', height: '6.44'}            ,
    ];

    for (let i=0; i<rectangles.length; i++) {            
        let rect = _getRect(rectangles[i]);
        svg.appendChild(rect);
    }

    function _getRect(opts) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        
        rect.setAttribute('x', opts.x);
        rect.setAttribute('y', opts.y);
        rect.setAttribute('width', opts.width);
        rect.setAttribute('height', opts.height);
        
        return rect; 
    }

    return svg;
};
  
SvgIcon._icon_switch_on = function() {
    let svg = this._svgTemplate({'view_box': '0 0 330 330'});
    svg.setAttribute('class', 'ON');

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M240,75H90c-49.626,0-90,40.374-90,90s40.374,90,90,90h150c49.626,0,90-40.374,90-90S289.626,75,240,75zM240,225c-33.084,0-60-26.916-60-60s26.916-60,60-60s60,26.916,60,60S273.084,225,240,225z');

    return svg;
};
  
SvgIcon._icon_switch_off = function() {
    let svg = this._svgTemplate({'view_box': '0 0 483.5 483.5'});
    //svg.setAttribute('style', 'enable-background:new 0 0 60 60');
    svg.setAttribute('class', 'OFF');

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M354.75,113h-227.5C56.946,113.827,0,171.258,0,241.75s56.946,127.923,127.25,128.731c0,0.019,227.5,0.019,227.5,0.019c70.993,0,128.75-57.757,128.75-128.75S425.743,113,354.75,113z M128.75,340.5C74.299,340.5,30,296.201,30,241.75S74.299,143,128.75,143s98.75,44.299,98.75,98.75S183.201,340.5,128.75,340.5z');

    return svg;
};
  
SvgIcon._icon_round_switch = function() {
    let svg = this._svgTemplate({'view_box': '0 0 483.5 483.5'});

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M354.75,113h-227.5C56.946,113.827,0,171.258,0,241.75s56.946,127.923,127.25,128.731c0,0.019,227.5,0.019,227.5,0.019c70.993,0,128.75-57.757,128.75-128.75S425.743,113,354.75,113z M128.75,340.5C74.299,340.5,30,296.201,30,241.75S74.299,143,128.75,143s98.75,44.299,98.75,98.75S183.201,340.5,128.75,340.5z');

    return svg;
};

SvgIcon._icon_square_switch = function() {
    let svg = this._svgTemplate({'view_box': '0 0 1000 1000'});

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M928.8,224.4H71.3c-33.8,0-61.3,27.4-61.3,61.3v428.8c0,33.8,27.4,61.3,61.3,61.3h857.5c33.8,0,61.3-27.4,61.3-61.3V285.6C990,251.8,962.6,224.4,928.8,224.4z M944.1,683.8c0,33.8-12.1,45.9-45.9,45.9H101.9c-33.8,0-45.9-12.1-45.9-45.9V316.3c0-33.8,12.1-45.9,45.9-45.9h796.3c33.8,0,45.9,12.1,45.9,45.9V683.8z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path1);
    path1.setAttribute('d', 'M423.4,300.9H147.8c-33.8,0-61.3,27.4-61.3,61.3v275.6c0,33.8,27.4,61.3,61.3,61.3h275.6c33.8,0,61.3-27.4,61.3-61.3V362.2C484.7,328.4,457.3,300.9,423.4,300.9z');

    return svg;   
};

SvgIcon._icon_switch_square = function() {
    let svg = this._svgTemplate({'view_box': '0 0 1000 1000'});

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M928.8,224.4H71.3c-33.8,0-61.3,27.4-61.3,61.3v428.8c0,33.8,27.4,61.3,61.3,61.3h857.5c33.8,0,61.3-27.4,61.3-61.3V285.6C990,251.8,962.6,224.4,928.8,224.4z M944.1,683.8c0,33.8-12.1,45.9-45.9,45.9H101.9c-33.8,0-45.9-12.1-45.9-45.9V316.3c0-33.8,12.1-45.9,45.9-45.9h796.3c33.8,0,45.9,12.1,45.9,45.9V683.8z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path1);
    path1.setAttribute('d', 'M423.4,300.9H147.8c-33.8,0-61.3,27.4-61.3,61.3v275.6c0,33.8,27.4,61.3,61.3,61.3h275.6c33.8,0,61.3-27.4,61.3-61.3V362.2C484.7,328.4,457.3,300.9,423.4,300.9z');

    return svg;   
};

SvgIcon._icon_switch_square_rev = function() {
    /**
     * Reverse the switch_square
     * 
     * Embed the paths within a mask, whihc is used in defs
     * Then overlay a rect using the defined mask
     */
    let svg = this._svgTemplate({'view_box': '0 0 1000 1000'});

    let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
    
    let mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    defs.appendChild(mask);
    mask.setAttribute('id', "SwitchMask");
    mask.setAttribute('x', "0");
    mask.setAttribute('y', "0");
    mask.setAttribute('width', "1000");
    mask.setAttribute('height', "1000");
    
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    mask.appendChild(g);
    
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path);
    path.setAttribute('d', 'M928.8,224.4H71.3c-33.8,0-61.3,27.4-61.3,61.3v428.8c0,33.8,27.4,61.3,61.3,61.3h857.5c33.8,0,61.3-27.4,61.3-61.3V285.6C990,251.8,962.6,224.4,928.8,224.4z M944.1,683.8c0,33.8-12.1,45.9-45.9,45.9H101.9c-33.8,0-45.9-12.1-45.9-45.9V316.3c0-33.8,12.1-45.9,45.9-45.9h796.3c33.8,0,45.9,12.1,45.9,45.9V683.8z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    g.appendChild(path1);
    path1.setAttribute('d', 'M423.4,300.9H147.8c-33.8,0-61.3,27.4-61.3,61.3v275.6c0,33.8,27.4,61.3,61.3,61.3h275.6c33.8,0,61.3-27.4,61.3-61.3V362.2C484.7,328.4,457.3,300.9,423.4,300.9z');

    let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    svg.appendChild(rect);
    rect.setAttribute('x', "0");
    rect.setAttribute('y', "0");
    rect.setAttribute('width', "1000");
    rect.setAttribute('height', "1000");
    rect.setAttribute('fill', "currentColor");
    rect.setAttribute('mask', "url(#SwitchMask)");

    return svg;   
};

SvgIcon._icon_cube_3d = function() {
    let svg = this._svgTemplate();

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path);
    path.setAttribute('d', 'M29.2,29.57,9.52,40.93V20a2.81,2.81,0,0,1,1.4-2.43L29.2,7.06Z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path1);
    path1.setAttribute('d', 'M32.08,34.38l21,10.82L33.4,56.56a2.78,2.78,0,0,1-2.8,0L12.12,45.91Z');
    
    let path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path2);
    path2.setAttribute('d', 'M54.48,20v19.6L34.8,29.49V7.06L53.09,17.61A2.81,2.81,0,0,1,54.48,20Z');

    return svg;
};

SvgIcon._icon_2d = function () {
    /**
     * sizing the font is tough: http://xahlee.info/js/svg_font_size.html
     */
    let svg = this._svgTemplate({'view_box': '0 0 32 16'});

    let txt = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    svg.appendChild(txt);
    txt.setAttribute('x', '0');
    txt.setAttribute('y', '12');
    txt.setAttribute('style','font-family: Consolas; font-weight: 900; fill: currentColor;');
    txt.textContent = '2D';

    return svg;
}

SvgIcon._icon_3d = function () {
    /**
     * sizing the font is tough: http://xahlee.info/js/svg_font_size.html
     */
    let svg = this._svgTemplate({'view_box': '0 0 32 16'});

    let txt = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    svg.appendChild(txt);
    txt.setAttribute('x', '0');
    txt.setAttribute('y', '12');
    txt.setAttribute('style','font-family: Consolas; font-weight: 900; fill: currentColor;');
    txt.textContent = '3D';

    return svg;
}

SvgIcon._icon_search = function() {
    let svg = this._svgTemplate({'view_box': '0 0 64 64'});

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path);
    path.setAttribute('d', 'M56.74,53.21l-3.53,3.53a1.67,1.67,0,0,1-2.35,0L40.21,46.09A24.32,24.32,0,0,0,46.1,40.2L56.74,50.85A1.66,1.66,0,0,1,56.74,53.21Z');
    
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    svg.appendChild(path1);
    path1.setAttribute('d', 'M26.22,6.78A19.46,19.46,0,1,0,42.6,36.7a19.18,19.18,0,0,0,3.08-10.47A19.45,19.45,0,0,0,26.22,6.78ZM11.64,26.22A14.58,14.58,0,1,1,26.22,40.81,14.6,14.6,0,0,1,11.64,26.22Z');

    return svg;
};

SvgIcon._color_box = function(rgb) {
    let svg = this._svgTemplate({'view_box': '0 0 30 15', 'width': '30px', 'height': '15px'});  

    let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');            
    svg.appendChild(rect);
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', 30);
    rect.setAttribute('height', 15);            
    rect.setAttribute('style', `fill: rgb(${rgb.join(',')})`);

    svg.appendChild(this._createInvisibleRect());

    return svg;
};

export {SvgIcon};