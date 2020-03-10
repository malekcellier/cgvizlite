/*

ui.js

Html menu items and widgets

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-03-08
*/

// Base class
// does seem like an overkill. Maybe use as a container. IE all objects are methods of the class.
/*
class UI {
    constructor(opts) {
        this.opts = opts || {};

    }

    Panel(opts) {}

}
*/

// Widgets

// Panel
function Panel(opts) {
    /**
     * Creates a Panel component with optional elements
     * 
     * The Panel component has 2 parts:
     *  - head: contains title, subtitle and close button
     *      - description:
     *          - title
     *          - subtitle
     *      - close
     *  - body: contains whatever you need (add afterwards)
     * 
     * opts: json object with fields:
     *  - id: string
     *  - classes: array of strings
     *  - title: string
     *  - subtitle: string
     *  - closable: bool
     * 
     */
    // Default values handling
    opts = opts || {};
    let id = opts.id || '';
    let classes = opts.id || [];
    let title = opts.title || 'Panel Title';
    let subtitle = opts.subtitle || '';
    let closable = opts.closable || true;

    // The Panel is a div
    let panel = _el({type: 'div', classes: ['panel']});
    // ID is OPTIONAL
    if (id !== '') {
        panel.id = id;
    }
    // Classes array is OPTIONAL
    if (classes.length > 0) {
        for (let i=0; i<classes.length; i++) {
            panel.classList.add(classes[i]);
        }
    }

    // 1) The head
    let head = _el({type: 'div', classes: ['panel-head']});
    panel.appendChild(head);
    // Styling
    head.style.display = 'flex';
    head.style['justify-content'] = 'space-between';
    head.style.padding = '12px';

    // 1.1) the description
    let desc = _el({type: 'div', classes: ['description']});
    head.appendChild(desc);
    // 1.1.1) the title
    let title_ = _el({type: 'div', classes: ['title']});
    title_.innerText = title;
    desc.appendChild(title_);
    // 1.1.2) the sublabel is OPTIONAL
    if (subtitle !== '') {
        let subtitle_ = _el({type: 'div', classes: ['subtitle']});
        subtitle_.innerText = subtitle;
        desc.appendChild(subtitle_);
    }
    // 1.2) the controls (on the right hand side)
    let controls = _el({type: 'div', classes: ['controls']});
    head.appendChild(controls);
    
    // 1.2.1) the close button is OPTIONAL
    if (closable === true) {
        let close = _el({type: 'div', classes: ['panel-close']});
        controls.appendChild(close);
        close.appendChild(createSvg('close'));
        close.onclick = (evt) => {
            evt.target.parentElement.parentElement.nextElementSibling.classList.toggle('hidden');
        };
    }
    
    // 2) The body
    let body = _el({type: 'div', classes: ['panel-body']});
    panel.appendChild(body);
    // Styling
    body.style.padding = '12px';

    return panel;
}

function IconsShowCase() {
    let div = _el({type: 'div', classes: ['icons']});
    div.style.display = 'flex';
    div.style['flex-direction'] = 'row';
    div.style['flex-wrap'] = 'wrap';
    div.style['justify-content'] = 'space-evenly';
    div.style.width = '600px';
    div.style.height = '600px';
    div.style.padding = '20px';
    div.style.position = 'absolute';
    div.style.top = '100px';
    div.style.left = '400px';
    div.style['background-color'] = 'var(--color-bg-body)';
    div.style.border = '1px white solid';

    let icons = SvgIcon.getList();;

    for (let i=0; i<icons.length; i++) {
        let icon_name = icons[i];
        let span = document.createElement('span');
        span.innerText = icon_name;
        
        let svgIcon = SvgIcon.new({icon: icon_name});
        svgIcon.appendChild(span);

        div.appendChild(svgIcon);
    }
    
    return div;
}

// SVG container
function SvgIcon_(opts) {
    /**
     * Creates a div containing a SVG Icon
     * 
     * opts: json object with fields:
     *  - icon: string with the name of the icon
     *  - attr: json object containing {attribute: value} for the SVG customization
     * 
     */
    // Default values handling
    opts = opts || {};
    let icon = opts.icon || 'close';
    let attrs = opts.attrs || {};

    let svgIcon = _el({type: 'div', classes: ['svg-icon']});
    let svg = createSvg(icon); // defaults are applied in the _svgTemplate
    // The svg attributes are optional
    if (attributes !== {}) {
        let attributes = Object.keys(attrs);
        for (let i=0; i<attributes.length; i++) {
            let attr = attributes[i];
            let value = attrs[attr];
            svg.setAttribute(attr, value);
        }
    }

    return svgIcon;
}

function createSvg(name) {        
    let svg;

    switch (name) {
        case 'close':
            svg = logoClose();
            break;
    }
    svg.appendChild(createInvisibleRect());

    return svg;
}

function logoClose() {
    /**
     * overwrites the above since it rocks!
     */
    let svg = svgTemplate();
  
    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute('transform', "translate(8, 8)");
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', 'M31.5059707,24 L47.5987718,7.90719891 C48.1337427,7.37222791 48.1337427,6.50972364 47.5987718,5.97475264 L42.0252474,0.40122825 C41.4902764,-0.13374275 40.6277721,-0.13374275 40.0928011,0.40122825 L24,16.4940293 L7.90719891,0.40122825 C7.37222791,-0.13374275 6.50972364,-0.13374275 5.97475264,0.40122825 L0.40122825,5.97475264 C-0.13374275,6.50972364 -0.13374275,7.37222791 0.40122825,7.90719891 L16.4940293,24 L0.40122825,40.0928011 C-0.13374275,40.6277721 -0.13374275,41.4902764 0.40122825,42.0252474 L5.97475264,47.5987718 C6.50972364,48.1337427 7.37222791,48.1337427 7.90719891,47.5987718 L24,31.5059707 L40.0928011,47.5987718 C40.6277721,48.1337427 41.4902764,48.1337427 42.0252474,47.5987718 L47.5987718,42.0252474 C48.1337427,41.4902764 48.1337427,40.6277721 47.5987718,40.0928011 L31.5059707,24 Z');
    g.appendChild(path);
    svg.appendChild(g);
  
    return svg;
  }
    
  function svgTemplate(opts) {
    /**
     * Creates a default svg file based off the commonly used values
     */
  
    opts = opts || {};
  
    let id_ = opts.id_ === undefined ? '' : opts.id_;
    let view_box = opts.view_box === undefined ? '0 0 64 64' : opts.view_box;
    let width = opts.width === undefined ? '20px' : opts.width;
    let height = opts.height === undefined ? '20px' : opts.height;
    let style = opts.style === undefined ? 'fill: currentcolor' : opts.style;
  
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
    if (id_ !== '') {
      svg.setAttribute('id', id_);
    }
    svg.setAttribute('viewBox', view_box);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('style', style);
  
    return svg;
  }
  
  function createInvisibleRect() {
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
  }

// Header
function Header(opts) {
    /**
     * Creates a header menu with options
     * 
     * 
     */
}

// Dropdown
// Slider
// DoubleSlider
// Switch
// ColorPicker

// Helper functions

function _el(opts) {
    /**
     * Convenience function to create a dom element
     * opts is a json object that should contain the following:
     *  - type: string, standard dom element name (div, span, h1, p)
     *  - id: string, id in the html/css sense
     *  - classes: array of strings, class name in the html/css sense
    */
   // Default values handling
    opts = opts || {};
    let type = opts.type || 'div';
    let id = opts.id || '';
    let classes = opts.classes || [];

    // Create the html dom element
    let el = document.createElement(type);
    // Allocate an id only if not the empty string
    if (id!=='') {
        el.id = id;
    }
    // Populate the classList of the dom element only if the list is not empty
    if (classes.length > 0) {
        for (let i=0; i<classes.length; i++) {
            el.classList.add(classes[i]);
        }
    }

    return el;
}
