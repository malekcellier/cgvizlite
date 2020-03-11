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
     *      - .controls.before: for controls before the description
     *      - .description:
     *          - title
     *          - subtitle
     *      - .controls.after: for controls after the description
     *          - close button ...
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
    let subtitle = opts.subtitle || 'Panel subtitle';
    let closable = opts.closable || false;

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

    // 1.0) the controls (on the left hand side)
    let controls_before = _el({type: 'div', classes: ['controls', 'before']});
    head.appendChild(controls_before);

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
    let controls = _el({type: 'div', classes: ['controls', 'after']});
    head.appendChild(controls);    
    // 1.2.1) the close button is OPTIONAL
    if (closable === true) {
        let close = SvgIcon.new({icon: 'close'});
        controls.appendChild(close);
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

function Demo() {
    /**
     * Simple component to demo the ui
     * 
     * Structure:
     *  - lefthand side for the list of components
     *  - righthan side for the components
     * 
     *  - Panels:
     *      - simple
     *      - level_1
     *      - level_2
     *      - level_3
     *  - Icons
     *  - Dropdown
     *  - Slider
     *  - DoubleSlider
     *  - Switch (square)
     *  - ColorPicker
     */
    let demo = _el({type: 'div', id: 'demo'});

    let menu = _el({type: 'div', id: 'demo-menu'});
    demo.appendChild(menu);

    let components = _el({type: 'div', id: 'demo-components'});
    demo.appendChild(components);
    
    return demo;
}

function IconsShowCase() {
    /**
     * Just to see them
     */
    let div = _el({type: 'div', id: 'icon-demo', classes: ['icons']});
    div.style.display = 'flex';
    div.style['flex-direction'] = 'row';
    div.style['flex-wrap'] = 'wrap';
    div.style['justify-content'] = 'space-evenly';
    div.style['justify-content'] = 'flex-start';
    //div.style.width = '600px';
    //div.style.height = '600px';
    div.style.padding = '20px';
    /*
    div.style.position = 'absolute';
    div.style.top = '100px';
    div.style.left = '400px';
    */
    div.style['background-color'] = 'var(--color-bg-body)';
    div.style.border = '1px white solid';

    let icons = SvgIcon.getList();;

    for (let i=0; i<icons.length; i++) {
        // Shuffle the positions just to test
        let pos = ['top', 'bottom', 'left', 'right'];
        let j = Math.round(Math.random() * (pos.length-1));

        let svgIcon = SvgIcon.new({icon: icons[i], tip_pos: `tip-${pos[j]}`});
        svgIcon.style['padding-right'] = '10px';
        div.appendChild(svgIcon);
    }
    
    return div;
}


// Header
function Header(opts) {
    /**
     * Creates a header menu with options
     * 
     * opts: json object with fields:
     *  - id: string
     *  - classes: array of strings
     *  - title: string
     *  - subtitle: string
     *  - closable: bool 
     */
    let header = Panel(opts);

    return header;
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
    // Allow to pass a string for the type, no more
    if (typeof opts === 'string') {
        //let type = opts;
        //opts = {type: type};
        opts = {type: opts}; // same as the 2 lines above?
    } else {
        opts = opts || {};
    }
    opts.type = opts.type || 'div';
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];

    // Create the html dom element
    let el = document.createElement(opts.type);
    // Allocate an id only if not the empty string
    if (opts.id !== '') {
        el.id = opts.id;
    }
    // Populate the classList of the dom element only if the list is not empty
    if (opts.classes.length > 0) {
        for (let i=0; i<opts.classes.length; i++) {
            el.classList.add(opts.classes[i]);
        }
    }

    return el;
}
