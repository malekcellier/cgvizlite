/*

ui.js

Html menu items and widgets

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-03-08
*/

let UI = {};

// Widgets

// Panel
UI.Panel = function (opts) {
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
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];
    opts.title = opts.title || 'Panel Title';
    opts.subtitle = opts.subtitle || '';
    opts.closable = opts.closable || false;

    // The Panel is a div
    let panel = _el({type: 'div', classes: ['panel']});
    // ID is OPTIONAL
    if (opts.id !== '') {
        panel.id = opts.id;
    }
    // Classes array is OPTIONAL
    if (opts.classes.length > 0) {
        for (let i=0; i<opts.classes.length; i++) {
            panel.classList.add(opts.classes[i]);
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
    let title = _el({type: 'div', classes: ['title']});
    desc.appendChild(title);
    title.innerText = opts.title;
    title.onclick = (evt) => {
        evt.target.parentElement.parentElement.nextElementSibling.classList.toggle('hidden');
    };
    // 1.1.2) the sublabel is OPTIONAL
    if (opts.subtitle !== '' || opts.subtitle) {
        let subtitle = _el({type: 'div', classes: ['subtitle']});
        subtitle.innerText = opts.subtitle;
        desc.appendChild(subtitle);
    }

    // 1.2) the controls (on the right hand side)
    let controls = _el({type: 'div', classes: ['controls', 'after']});
    head.appendChild(controls);    
    // 1.2.1) the close button is OPTIONAL
    if (opts.closable === true) {
        let close = SvgIcon.new({icon: 'close'});
        controls.appendChild(close);
        close.onclick = (evt) => {
            // TODO: should it be hidden or removed when the x is clicked?
            //evt.target.parentElement.parentElement.nextElementSibling.classList.toggle('hidden');
            let panel = evt.target.parentElement.parentElement.parentElement;
            panel.parentElement.removeChild(panel);
        };
    }
    
    // 2) The body
    let body = _el({type: 'div', classes: ['panel-body']});
    panel.appendChild(body);
    // Styling
    body.style.padding = '12px';

    return panel;
}

// Dropdown WIP
UI.DropDown = function (opts) {
    /**
     * DropDown
     * 
     * dropdown
     * - dropdown-label
     * - dropdown-data
     *      - dropdown-selected
     *      - dropdown-items
     *          - dropdown-item (list)
     */

    // Default values    
    opts = opts || {};
    opts.id = opts.id || '';
    opts.label = opts.label || 'Label';
    opts.items = opts.items || ['item 1', 'item 2', 'item 3', 'item 4', 'item 5'];
    opts.selected_index = opts.selected_index || 0; // how to keep track of the actual element?

    
    let div = _el({type: 'div', classes: ['dropdown']});
    //div.setAttribute('index', opts.selected_index);
    if (opts.id !== '') {
        div.id = opts.id;
    }

    // 1) label
    let label = _el({type: 'div', classes: ['dropdown-label']});
    div.appendChild(label);
    label.innerText = opts.label;

    // 2) data
    let data = _el({type: 'div', classes: ['dropdown-data']});
    div.appendChild(data);
    // 2.1) current selection
    let selected = _el({type: 'div', classes: ['dropdown-selected']});
    data.appendChild(selected);
    // default element
    selected.innerText = opts.items[opts.selected_index];
    // onclick show the items
    selected.onclick = (evt) => {
        if (evt.target.classList.contains('dropdown-selected')) {
            evt.target.nextElementSibling.classList.toggle('hidden')
            evt.target.classList.toggle('active');// assuming hidden is the default state
        }
    };
    // 2.2) items
    let items = _el({type: 'div', classes: ['dropdown-items', 'hidden']});
    data.appendChild(items);
    // event for the selection of the items
    items.onclick = (evt) => {
        if (evt.target.classList.contains('dropdown-item')) {
            evt.target.parentElement.previousElementSibling.innerText = evt.target.innerText;
            evt.target.parentElement.previousElementSibling.classList.toggle('active');
            evt.target.parentElement.classList.toggle('hidden');
        }
    };
    // 2.2.1) add all item
    for (let i=0; i<opts.items.length; i++) {
        let item = _el({type: 'div', classes: ['dropdown-item']});
        item.innerText = opts.items[i];
        items.appendChild(item);
    }

    return div;
};

// Slider
UI.Slider = function (opts) {
    /**
     * Creates a Slider component
     * 
     * Top row: Name and value
     * Bottom row: slider widget
     * 
     * opts:
     *  - id: string
     *  - classes: array of strings
     *  - min: number
     *  - max: number
     *  - value: number between min and max, current value
     */
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.label = opts.label || 'slider';
    opts.min = opts.min || 0;
    opts.max = opts.max || 100;
    opts.value = opts.value || 75;

    let div = _el({type: 'div', classes: ['slider']});
    if (opts.id !== '') {
        div.id = opts.id;
    }
    div.setAttribute('min', opts.min);
    div.setAttribute('max', opts.min);
    div.setAttribute('val', opts.value);

    // 1) First row: label and current value
    let row_1 = _el({type: 'div', classes: ['top']});
    div.appendChild(row_1);
    // 1.1) Label
    let label = _el({type: 'div', classes: ['label']});
    row_1.appendChild(label);
    label.innerText = opts.label;
    // 1.2) value
    let value = _el({type: 'div', classes: ['label']});
    row_1.appendChild(value);
    value.innerText = opts.value;
    
    // Second row: slider widget
    let row_2 = _el({type: 'div', classes: ['bottom']});
    div.appendChild(row_2);
    row_2.innerText = 'slider bar';

    return div;
};

// DoubleSlider

// Checkbox
UI.CheckBox = function (opts) {
    /**
     * Creates a CheckBox with a label and a switch (square or not)
     * 
     * opts:
     *  - id: string
     *  - classes: array of strings
     *  - label: string
     *  - square: bool, indicates whether the switch is of the square type
     */
    
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.label = opts.label || 'checkbox';
    opts.state = opts.state || 'off'; // switches are turned off by default
    
    if (opts.square === undefined) {
        opts.square = true;
    }
    
    let checkbox = _el({type: 'div', classes: ['checkbox']});
    if (opts.id !== '') {
        checkbox.id = opts.id;
    }

    // The label
    let label = _el({type: 'div', classes: ['label']});
    checkbox.appendChild(label);
    label.innerText = opts.label;
    
    // The Switch
    let icon_name;
    if (opts.square === true) {
        icon_name = 'square_switch';
    } else {
        icon_name = 'round_switch';
    }
    let icon = SvgIcon.new({icon: icon_name});
    if (opts.state == 'on') {
        icon.classList.toggle('clicked');
    }
    checkbox.appendChild(icon);

    return checkbox;
};

// Header
UI.Header = function (opts) {
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
    let header = this.Panel(opts);

    return header;
}

// Discrete ColorBar
UI.DiscreteColorBar = function (opts) {
    /**
     * Discrete Colorbar
     * 
     * Panel with settings button for the colorbar configuration
     * Head:
     *  - .description:
     *      - title: name of the represented quantity
     *  - .controls.after
     *      - settings: allows to set the #colors, scheme, min/max
     * Body:
     *  - list of divs with color and range next to it
     */
    // Default values
    opts = opts || {};
    opts.scheme = opts.scheme || 'Spectral';
    opts.n_colors = opts.n_colors || 7;
    opts.reverse = opts.reverse || false;
    opts.precision = opts.precision || 4;

    let colorbar = UI.Panel(opts);
    colorbar.classList.add('colorbar');
    let controls = colorbar.querySelector('.controls.after');
    let settings = SvgIcon.new({icon: 'settings'});
    controls.appendChild(settings);
    settings.onclick = (evt) => {
        console.info('clicked the settings to configure the colorbar');
        let cbs = UI.ColorbarSettings();
        evt.target.parentElement.parentElement.parentElement.parentElement.appendChild(cbs);
    };

    // The content
    let body = colorbar.querySelector('.panel-body');
    body.onlick = (evt) => {
        console.info(`clicked on ${evt.target}`);        
    };
    // Each colorbox has its own event listener? => better to attach one to the body
    // Get data from chroma
    let colors = chroma.scale(opts.scheme).domain([opts.min, opts.max]).classes(opts.n_colors);
    let values = chroma.limits([opts.min, opts.max], 'e', opts.n_colors);
    if (opts.reverse === true) {
        //values = chroma.limits([opts.min, opts.max], 'e', opts.n_colors);
    }
    for (let i=0; i<opts.n_colors; i++) {
        // A row container for both the svg and the description
        let container = _el({type: 'div', classes: ['colorbar-item', `_${i}`]});
        body.appendChild(container);

        // 1) svg
        let svg = SvgIcon._color_box(colors(values[i]).rgb());
        container.appendChild(svg);
        
        // 2) description
        let desc = _el({type: 'div', classes: ['colorbar-item-desc']});
        container.appendChild(desc);
        desc.innerText = `${values[i].toPrecision(opts.precision)} to ${values[i+1].toPrecision(opts.precision)}`;
    }

    return colorbar;
};

// Colorpalette
UI.ColorPalette = function (opts) {
    /**
     * Creates colorpalette based off:
     *  - a color category: sequencing, diverging, qualitative
     *  - a color scheme
     *  - a number of colors
     * 
     * Requires chroma.js
     * 
     */
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.category = opts.category || 'diverging';
    opts.n_colors = opts.n_colors || 4;
    opts.min_n_colors = opts.min_n_colors || 3;

    let palette = _el({type: 'div', classes: ['color-palette']});
    if (opts.id !== '') {
        palette.id = opts.id;
    }
    palette.onclick = (evt) => {
        /**
         * The click is only for the colormap
         */
        if (evt.target.classList.contains('colormap')) {
            console.info('Clicked on colormap');
            let self = document.querySelector('.color-palette');
            let colormaps = self.querySelectorAll('.colormap');
            for (let i=0; i<colormaps.length; i++) {
                colormaps[i].classList.remove('selected');            
            }
            evt.target.classList.add('selected');
            self.setAttribute('scheme', evt.target.getAttribute('tip-text'));
        }
    };
    // loop the schemes in that category (sequential, diverging, singlehue, qualitative...)
    // and then for each scheme, loop the colors
    let brewer = {
        sequential: ["BuGn","BuPu","GnBu","OrRd","PuBu","PuBuGn","PuRd","RdPu","YlGn","YlGnBu","YlOrBr","YlOrRd"],
		diverging: ["BrBG","PiYG","PRGn","PuOr","RdBu","RdGy","RdYlBu","RdYlGn","Spectral"],
		singlehue:["Blues","Greens","Greys","Oranges","Purples","Reds"],
        qualitative: ["Accent","Dark2","Paired","Pastel1","Pastel2","Set1","Set2","Set3"] 
    };

    // Cap the number of colors to the min the scheme supports
    let n_colors = Math.max(opts.min_n_colors, opts.n_colors);
    let schemes = brewer[opts.category];
    for (let i=0; i<schemes.length; i++) {
        let scheme = schemes[i];
        // The colormap
        let clrmap = _el({type: 'div', classes: ['colormap', 'tip-colormap']});
        palette.appendChild(clrmap);
        clrmap.setAttribute('tip-text', scheme);
        // first in the list is the default
        if (i === 0) {
            clrmap.classList.add('selected');
            palette.setAttribute('scheme', scheme);
        };
        
        // Innercontainer for the flex to work
        let clrmap_inner = _el({type: 'div', classes: ['colormap-inner']});
        clrmap.appendChild(clrmap_inner);
        // Cap the number of colors to the max the scheme supports
        n_colors = Math.max(n_colors, chroma.brewer[scheme].length);
        // All the colors
        for (let j=0; j<n_colors; j++) {
            let clrel = _el({type: 'div', classes: ['colormap-item']});
            clrel.style['background-color'] = chroma.brewer[scheme][j];
            clrmap_inner.appendChild(clrel);
        }
    }

    return palette;
};

UI.ColorbarSettings = function (opts) {
    /**
     * Colorbar settings
     * 
     * Should be inside a Modal so as to prevent unwanted user actions
     * 
     * Provides a way to set the values:
     * Range related: 
     *  - min, max: double-slider
     *  - precision: dropdown
     * Color related
     *  - reverse: checkbox
     *  - n_colors: dropdown
     *  - scheme: colorpicker
     */
    opts = opts || {};
    opts.title = 'Settings';
    opts.closable = true;

    let div = UI.Panel(opts);
    div.classList.add('colorbar-settings');

    // The elements are put in the body
    let body = div.querySelector('.panel-body');    

    // 1) Range related settings
    let range_settings = _el({type: 'div', classes: ['category']});
    body.appendChild(range_settings);
    // 1.1) Title
    let range_title = _el({type: 'div', classes: ['title']});
    range_settings.appendChild(range_title);
    range_title.innerText = 'Range';
    // 1.2) min, max: double-slider
    // 1.3) precision: dropdown
    
    // 2) Color related settings
    let color_settings = _el({type: 'div', classes: ['category']});
    body.appendChild(color_settings);
    // 2.1) Title
    let color_title = _el({type: 'div', classes: ['title']});
    color_settings.appendChild(color_title);
    color_title.innerText = 'Color';
    // 2.2) scheme category
    let categories = UI.DropDown({
        label: 'category',
        items: ['sequential', 'diverging', 'singlehue', 'qualitative']        
    });
    color_settings.appendChild(categories);
    categories.onclick = (evt) => {
        // each time the category is changed:
        //   n_colors items needs to be changed
        //   the palette needs to be changed

    };
    // 2.3) n_colors
    let n_colors = UI.DropDown({
        label: 'steps',
        items: range(3, 9)
    });
    color_settings.appendChild(n_colors);
    n_colors.onclick = (evt) => {
        // Each time the n_colors is changed:
        // the palette needs to be redrawn
    };
    // 2.4) reversed
    let rev = UI.CheckBox({label: 'reversed'});
    color_settings.appendChild(rev);
    rev.onclick = (evt) => {

    };
    // 2.5) colormaps (result of category + n_colors) + picker
    let palette = UI.ColorPalette();
    color_settings.appendChild(palette);

    return div;
};

// Demo
UI.Demo = function () {
    /**
     * Simple component to demo the ui
     * 
     * Structure:
     *  - lefthand side for the list of components
     *  - righthand side for the components
     * 
     * Components
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
    let demo_container = _el({type: 'div', id: 'demo-container'});
    
    // 1) the demo head has the title and subtitle
    let demo_head = _el({type: 'div', id: 'demo-head'});
    demo_container.appendChild(demo_head);
    let demo_title = _el({type: 'div', id: 'demo-title'});
    demo_head.appendChild(demo_title);
    demo_title.innerText = 'Custom ui components demo';
    let demo_subtitle = _el({type: 'div', id: 'demo-subtitle'});
    demo_head.appendChild(demo_subtitle);
    demo_subtitle.innerText = 'by Malek Cellier';

    // 2) The demo content has the menu and the components
    let demo_content = _el({type: 'div', id: 'demo-content'});
    demo_container.appendChild(demo_content);

    let menu = _el({type: 'div', id: 'demo-menu'});
    demo_content.appendChild(menu);

    let components = _el({type: 'div', id: 'demo-components'});
    demo_content.appendChild(components);
    
    return demo_container;
}

// Icons showcase
UI.IconsShowCase = function () {
    /**
     * Shows all the implemented icons
     */
    let div = _el({type: 'div', id: 'icon-demo', classes: ['icons']});
    div.style.display = 'flex';
    div.style['flex-direction'] = 'row';
    div.style['flex-wrap'] = 'wrap';
    div.style['justify-content'] = 'flex-start';
    div.style.padding = '20px';
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

