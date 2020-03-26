/*

ui.js

Html menu items and widgets

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-03-08

*/

import {_el, range, extendFunction} from './utils.js';
import {SvgIcon} from './SvgIcon.js';


let UI = {};

// State of the widgets akin to the datagui params structure
// for each component with ID, an element is created in this data structure
// each time a widget is updated, the value is updated here 
// and then it should trigger the update of the listeners...
UI.State = {
    /**
     * Use the Proxy paradigm to sync the components with the controls
     * maybe the mutation observer too...
     */
};

// Widgets factory
UI.Widget = function(name, opts) {
    /**
     * Wraps the construction of the elements:
     *  - adds padding to the element
     * 
     *  name: widget name in small caps
     *  opts: arguments for the element
     * 
     * TODO: replace with an option in opts... duh!
     */

    let elements = {
        dropdown: 'DropDown',
        slider: 'Slider',
        doubleslider: 'DoubleSlider',
        checkbox: 'CheckBox',
        tooltip: 'Tooltip'
    };

    let widget = UI[elements[name.toLowerCase()]](opts);
    widget.classList.add('container');

    return widget;
}

// BASIC ELEMENTS
UI.Button = function (opts) {
    /**
     * Creates a button with a svg before
     * 
     * opts:
     *  - innerText: string, button text
     *  - icon: string, icon before the button's text
     */
    // Defaults values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.label = opts.label || 'Button';
    opts.icon = opts.icon || '';
    opts.classes = opts.classes || [];

    let btn = _el({type: 'div', id: opts.id, classes: ['button', ...opts.classes]});
    if (opts.icon !== '') {
        btn.appendChild(SvgIcon.new({icon: opts.icon}));
    }
    let txt = _el({type: 'p', classes: ['button-text'], innerText: opts.label});
    btn.appendChild(txt);

    return btn;
};

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
    opts.tip_text = opts.tip_text || opts.state;
    
    let checkbox = _el({type: 'div', id: opts.id, classes: ['checkbox']});

    // The label
    //let label = _el({type: 'div', classes: ['label']});
    let label = _el({type: 'div', classes: ['t_label']});
    checkbox.appendChild(label);
    label.innerText = opts.label;
    
    // The Switch
    let icon_name = 'square_switch';
    if (opts.square === false) {
        icon_name = 'round_switch';
    }
    let icon = SvgIcon.new({icon: icon_name, tip_text: opts.tip_text});
    if (opts.state == 'on') {
        icon.classList.toggle('clicked');
    }
    checkbox.appendChild(icon);

    return checkbox;
};

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

    
    let div = _el({type: 'div', id: opts.id, classes: ['dropdown']});
    //div.setAttribute('index', opts.selected_index);

    // 1) label
    //let label = _el({type: 'div', classes: ['dropdown-label']});
    let label = _el({type: 'div', classes: ['t_label']});
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
            evt.target.nextElementSibling.classList.toggle('hidden'); // the list of items
            // hide all others 
            let dd_items = document.querySelectorAll('.dropdown-items');
            for (let i=0; i<dd_items.length; i++) {
                let dd_item = dd_items[i];
                if (dd_item !== evt.target.nextElementSibling) {
                    if (!dd_item.classList.contains('hidden')) {
                        dd_item.classList.toggle('hidden');
                    }
                }
            }
            evt.target.classList.toggle('active');// assuming hidden is the default state
        }
    };
    // 2.2) items
    let items = _el({type: 'div', classes: ['dropdown-items', 'hidden']});
    data.appendChild(items);
    // event for the selection of the items
    items.onclick = (evt) => {
        console.log('dropdown-items event');
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

    let div = _el({type: 'div', id: opts.id, classes: ['slider']});
    /*
    div.setAttribute('min', opts.min);
    div.setAttribute('max', opts.min);
    div.setAttribute('val', opts.value);
    */

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
    let nput = _el('input');
    row_2.appendChild(nput);
    nput.type = 'range';
    nput.min = opts.min;
    nput.max = opts.max;
    nput.value = opts.value;
    nput.oninput = (evt) => {
        let label = evt.target.parentElement.previousSibling.querySelectorAll('.label')[1];
        label.innerText = evt.target.value;
    };

    return div;
};

UI.DoubleSlider = function (opts) {
    /**
     * Creates a double slider component
     * 
     * Description:
     *  - has 3 rows:
     *      - label row
     *      - one for min
     *      - one for max
     *  - each min/max row has:
     *      - a regular slider (input range)
     *      - a left and right label
     *      - min: left label is min, right label is inter_min
     *      - max: left label is inter_max, right label is max
     *  - each slider is set from the kpi range (MIN and MAX)
     *      - in order to keep a minimum distance between min and max, we have separation
     *      - min slider goes from MIN to MAX - separation
     *      - max slider goes from MIN - separation to MAX
     *  - the draggable buttons are linked to each other
     *      - when max < min + separation => move min to min-separation
     *      - when min > max - separation => move max to max+separation
     * 
     * opts:
     *  - id: string
     *  - label: string, name of the kpi
     *  - min: number, kpi min value
     *  - inter_min: number, kpi intermediate min value >= min
     *  - max: number, kpi max value
     *  - inter_max: number, kpi intermediate max value <= max
     */
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.label = opts.label || 'filter';
    opts.min = opts.min || 0;
    opts.inter_min = opts.inter_min || opts.min;
    opts.max = opts.max || 100;
    opts.inter_max = opts.inter_max || opts.max;

    // Container is the div
    let div = _el({type: 'div', id: opts.id, classes: ['double-slider']});

    // 1) 1st row: label
    let row_1 = _el({type: 'div', classes: ['top']});
    div.appendChild(row_1);
    // 1.1) Label
    let label = _el({type: 'div', classes: ['label']});
    row_1.appendChild(label);
    label.innerText = opts.label;

    // 2) 2nd row: min value (fixed), slider,  inter_min value (dyn)
    let row_2 = _el({type: 'div', classes: ['middle']});
    div.appendChild(row_2);
    // 2.1) min & inter_min values
    let values = _el({type: 'div', classes: ['labels']});
    row_2.appendChild(values);    
    // 2.1.1)
    let min_value = _el({type: 'div', classes: ['label']});
    values.appendChild(min_value);
    min_value.innerText = opts.min;
    // 2.1.2) inter_min Value
    let inter_min_value = _el({type: 'div', classes: ['label', 'dyn']});
    values.appendChild(inter_min_value);
    inter_min_value.innerText = opts.inter_min;
    // 2.2) slider
    let nput_min = _el('input');
    row_2.appendChild(nput_min);
    nput_min.type = 'range';
    nput_min.min = opts.min;
    nput_min.max = opts.max;
    nput_min.value = opts.min;
    nput_min.oninput = (evt) => {
        let label = evt.target.previousSibling.querySelectorAll('.label')[1];        
        // If the value is greater than max, set min distance to max
        let delta = 1;
        let bottom = evt.target.parentElement.nextElementSibling;
        if ( Number(evt.target.value) >= Number(bottom.querySelector('input').value) - delta) {
            bottom.querySelector('input').value = Number(evt.target.value) + delta;
            bottom.querySelectorAll('.labels .label')[0].innerText = bottom.querySelector('input').value;
        }
        if (Number(evt.target.value) >= opts.max-delta) {
            evt.target.value = opts.max-delta;
        }
        // limit 
        label.innerText = evt.target.value;
    }

    // 3) 3rd row: inter_max value (dyn), slider,  max value (fixed)
    let row_3 = _el({type: 'div', classes: ['bottom']});
    div.appendChild(row_3);
    // 3.1) min & inter_min values
    let values_max = _el({type: 'div', classes: ['labels']});
    row_3.appendChild(values_max);    
    // 3.1.2) inter_max Value
    let inter_max_value = _el({type: 'div', classes: ['label', 'dyn']});
    values_max.appendChild(inter_max_value);
    inter_max_value.innerText = opts.inter_max;
    // 3.1.1)
    let max_value = _el({type: 'div', classes: ['label']});
    values_max.appendChild(max_value);
    max_value.innerText = opts.max;
    // 3.2) slider
    let nput_max = _el('input');
    row_3.appendChild(nput_max);
    nput_max.type = 'range';
    nput_max.min = opts.min;
    nput_max.max = opts.max;
    nput_max.value = opts.max;
    nput_max.oninput = (evt) => {
        let label = evt.target.previousSibling.querySelectorAll('.label')[0];
        let delta = 1;
        let middle = evt.target.parentElement.previousElementSibling;
        if ( Number(evt.target.value) <= Number(middle.querySelector('input').value) + delta) {
            middle.querySelector('input').value = Number(evt.target.value) - delta;
            middle.querySelectorAll('.labels .label')[1].innerText = middle.querySelector('input').value;
        }
        if (Number(evt.target.value) <= opts.min + delta) {
            evt.target.value = opts.min + delta;
        }
        // limit 
        label.innerText = evt.target.value;
    }

    return div;
};

UI.CustomSlider = function (opts) {
    /**
     * Creates a fully custom slider based off divs
     */
};

UI.CustomDoubleSlider = function (opts) {
    /**
     * Creates a fully custom double slider based off divs
     */
};

// COMPLEX ELEMENTS
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
    let panel = _el({type: 'div', id: opts.id, classes: ['panel']});

    // Classes array is OPTIONAL
    if (opts.classes.length > 0) {
        for (let i=0; i<opts.classes.length; i++) {
            panel.classList.add(opts.classes[i]);
        }
    }

    // 1) The head
    let head = _el({type: 'div', classes: ['container', 'panel-head']});
    panel.appendChild(head);
    // Styling
    head.style.display = 'flex';
    head.style['justify-content'] = 'space-between';

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
    let body = _el({type: 'div', classes: ['container', 'panel-body']});
    panel.appendChild(body);

    return panel;
}

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
    // Default values handling
    opts = opts || {};
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];
    opts.title = opts.title || 'Panel Title';
    opts.subtitle = opts.subtitle || '';
    opts.closable = opts.closable || false;

    opts.before = opts.before || [];
    opts.after = opts.after || [];
    
    let header = UI.Panel(opts);
    // remove the body

    // add the icons for the before category
    let before = header.querySelector('.controls.before');
    if (opts.before !== []) {
        for (let i=0; i<opts.before.length; i++) {
            let icon = opts.before[i];
            if (SvgIcon.isIcon(icon)) {
                let svg = SvgIcon.new({icon: icon});
                before.appendChild(svg);
            }
        }
    }

    // add the icons for the after category
    let after = header.querySelector('.controls.after');
    if (opts.after !== []) {
        for (let i=0; i<opts.after.length; i++) {
            let icon = opts.after[i];
            if (SvgIcon.isIcon(icon)) {
                let svg = SvgIcon.new({icon: icon});
                after.appendChild(svg);
            }
        }
    }

    return header;
}

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
     * 
     */
    // Default values
    opts = opts || {};
    opts.category = opts.category || 'diverging';
    opts.scheme = opts.scheme || 'Spectral';
    opts.n_colors = opts.n_colors || 7; // Pass the list of colors instead? or just recalculate it 
    opts.reverse = opts.reverse || false;
    if (opts.precision === null || opts.precision === undefined) {
        opts.precision = 2;
    }
    opts.inter_min = opts.inter_min || opts.min;
    opts.inter_max = opts.inter_max || opts.max;

    let colorbar = UI.Panel(opts);
    colorbar.classList.add('colorbar');
    let controls = colorbar.querySelector('.controls.after');
    let settings = SvgIcon.new({icon: 'settings'});
    controls.appendChild(settings);
    settings.setAttribute('opts', JSON.stringify(opts)); // save the data in order to pass it to the dcbs
    settings.onclick = (evt) => {
        if (evt.target.classList.contains('svg-icon')) {
            console.info('clicked the settings to configure the colorbar');
            // read the current values and pass a opts structure
            let opts = JSON.parse(evt.target.attributes.opts.value);
            // pass the ID of the ColorBar to the settings            
            opts.id = ''; // deleting it otherwise it gets passed..
            opts.title = '';
            opts.initiator = evt.target.closest('.panel.colorbar').id;
            opts.subtitle = evt.target.closest('.panel-head').querySelector('.description .title').innerText;

            let cbs = UI.DiscreteColorbarSettings(opts);
            // TODO: change this to modal!!!
            evt.target.parentElement.parentElement.parentElement.parentElement.appendChild(cbs);
        }
    };

    // The content
    let body = colorbar.querySelector('.panel-body');
    body.onlick = (evt) => {
        console.info(`clicked on ${evt.target}`);        
    };
    // Each colorbox has its own event listener? => better to attach one to the body
    
    // Get data from chroma
    let min = Number(opts.inter_min);
    let max = Number(opts.inter_max);
    let colors = chroma.scale(opts.scheme).domain([min, max]).classes(opts.n_colors);
    let values = chroma.limits([min, max], 'e', opts.n_colors);
    if (opts.edges) {
        // including the edges means that the intervals [min, inter_min] & [inter_max, max] 
        // will be allocated to 1 color regardless of their span
        let delta = (max-min)/opts.n_colors;
        opts.n_colors += 2; // NOTE: Here the n_colors widget should change (i.e. trigger UpdateCOlorPalette)
        document.querySelectorAll('.category .dropdown-selected')[2].innerText = `${opts.n_colors}`;
        document.querySelectorAll('.category .dropdown-selected')[2].click();
        colors = chroma.scale(opts.scheme).domain([min - delta, max + delta]).classes(opts.n_colors);
        values = [opts.min, ...values, opts.max];
    }
    if (opts.reverse === true) {
        values = chroma.limits([max, min], 'e', opts.n_colors);
    }
    // normalize text values
    let text_values = [];
    let max_length = 0;
    for (let i=0; i<values.length; i++) {
        let text_value = `${values[i].toFixed(opts.precision)}`;
        text_values.push(text_value);
        if (text_value.length > max_length) {
            max_length = text_value;
        }
    }
    for (let i=0; i<text_values.length; i++) {
        let text_value = text_values[i];
        if (text_value.length < max_length) {
            text_value = '&nbsp;'.repeat(max_length-text_value.length) + text_value;
        }
    }

    for (let i=0; i<opts.n_colors; i++) {
        // A row container for both the svg and the description
        let container = _el({type: 'div', classes: ['colorbar-item', `_${i}`]});
        body.appendChild(container);

        // 1) svg
        let span_svg = _el({type: 'span', classes: ['colorbar-item-svg']})
        container.appendChild(span_svg);
        let svg = SvgIcon._color_box(colors(values[i]).rgb());
        span_svg.appendChild(svg);
        
        // 2) description
        let desc = _el({type: 'span', classes: ['colorbar-item-desc']});
        container.appendChild(desc);
        // TODO: the first from value and the last to values are always the actual min/max
        // when changing the min/max through the double slider, the first and last color will cover wider range (it becomes heterogeneous)
        //desc.innerText = `${values[i].toFixed(opts.precision)} to ${values[i+1].toFixed(opts.precision)}`;
        desc.innerText = `${text_values[i]} to ${text_values[i+1]}`;
        /*
        desc.appendChild(_el({type: 'span', innerText: `${values[i].toFixed(opts.precision)} ` }));
        let to = _el({type: 'span', innerText: 'to' });
        to.style['padding-left'] = '0.5em';
        to.style['padding-right'] = '0.5em';
        desc.appendChild(to);
        desc.appendChild(_el({type: 'span', innerText: ` ${values[i+1].toFixed(opts.precision)}` }));
        */
    }

    return colorbar;
};

// Needed by DiscreteColorBar
UI.DiscreteColorbarSettings = function (opts) {
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
     *  - scheme category: dropdown
     *  - n_colors (steps): dropdown
     *  - reverse: checkbox
     *  - scheme: colorpalette
     */
    opts = opts || {};
    opts.title = 'Settings';
    opts.closable = true;
    opts.initiator = opts.initiator || {}; // the DiscreteColorBar that initiated the ColorBarSettings
    if (opts.precision === null || opts.precision === undefined) {
        opts.precision = 4;
    }

    let div = UI.Panel(opts);
    div.classList.add('colorbar-settings');
    if (opts.initiator !== '') {
        div.setAttribute('initiator', opts.initiator);
    }

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
    let double_slider = new UI.DoubleSlider(opts);
    range_settings.appendChild(double_slider);
    double_slider.querySelectorAll('input[type=range]')[0].oninput = extendFunction(
        double_slider.querySelectorAll('input[type=range]')[0].oninput,
        null,
        UI.UpdateColorPalette
    );    
    double_slider.querySelectorAll('input[type=range]')[1].oninput = extendFunction(
        double_slider.querySelectorAll('input[type=range]')[1].oninput,
        null,
        UI.UpdateColorPalette
    );
    // 1.3) include edges
    let edges = UI.CheckBox({label: 'include edges'});
    range_settings.appendChild(edges);
    if (opts.edges === true) {
        let svg = edges.querySelector('.svg-icon');
        svg.classList.add('rotated');
        svg.querySelector('svg').style.transform = 'rotate(180deg)';
    }
    edges.querySelector('.svg-icon').onclick = extendFunction(
        edges.querySelector('.svg-icon').onclick,
        null,
        UI.UpdateColorPalette
    )
    // 1.3) precision: dropdown
    let precision = UI.DropDown({
        label: 'decimals',
        selected_index: opts.precision,
        items: range(0, 6)
    });
    range_settings.appendChild(precision);
    precision.querySelector('.dropdown-items').onclick = extendFunction(
        precision.querySelector('.dropdown-items').onclick,
        null,
        UI.UpdateColorPalette
    );
    
    // 2) Color related settings
    let color_settings = _el({type: 'div', classes: ['category']});
    body.appendChild(color_settings);

    // 2.1) Title
    let color_title = _el({type: 'div', classes: ['title']});
    color_settings.appendChild(color_title);
    color_title.innerText = 'Color';

    // 2.2) scheme category TODO: read that from the color definition
    let cat_items = ['sequential', 'diverging', 'singlehue', 'qualitative', 'all'];
    let categories = UI.DropDown({
        label: 'category',
        items: cat_items,       
        selected_index: cat_items.indexOf(opts.category)
    });
    color_settings.appendChild(categories);
    // each time the category is changed (i.e. an item of items):
    //   n_colors items needs to be changed
    //   the palette needs to be changed
    // Extend the onclick function which was already defined    
    categories.querySelector('.dropdown-items').onclick = extendFunction(
        categories.querySelector('.dropdown-items').onclick,
        null,
        UI.UpdateColorPalette
    );

    // 2.3) n_colors
    let clr_items = range(3, 12);
    let n_colors = UI.DropDown({
        label: 'steps',
        selected_index: clr_items.indexOf(opts.n_colors),
        items: clr_items
    });
    color_settings.appendChild(n_colors);
    // Each time the n_colors is changed:
    // the palette needs to be redrawn
    n_colors.querySelector('.dropdown-items').onclick = extendFunction(
        n_colors.querySelector('.dropdown-items').onclick,
        null,
        UI.UpdateColorPalette
    );

    // 2.4) reversed
    let rev = UI.CheckBox({label: 'reversed'});
    color_settings.appendChild(rev);
    if (opts.reverse === true) {
        let svg = rev.querySelector('.svg-icon');
        svg.classList.add('rotated');
        svg.querySelector('svg').style.transform = 'rotate(180deg)';
    }
    rev.querySelector('.svg-icon').onclick = extendFunction(
        rev.querySelector('.svg-icon').onclick,
        null,
        UI.UpdateColorPalette
    )
    
    // 2.5) colormaps (result of category + n_colors) + picker
    // here the default is handled by the ColorPalette itself
    opts.scheme_index = UI.ColorDefinitions.brewer()[opts.category].indexOf(opts.scheme);
    if (opts.scheme_index === null || opts.scheme_index === undefined) {
        opts.scheme_index = 0;
    }
    let palette = UI.ColorPalette(opts);
    color_settings.appendChild(palette);
    // TODO: Trigger a click that will update the ColorPalette
    // through the UpdateCOlorPalette interface
    precision.click();

    return div;
};
// Needed by DiscreteColorbarSettings
UI.ColorPalette = function (opts) {
    /**
     * 
     * Component of DiscreteColorbarSettings
     * 
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
    opts.category = opts.category || 'sequential';
    opts.n_colors = opts.n_colors || 7;
    if (opts.reverse === undefined || opts.reverse === null) {
        opts.reverse = false;
    }
    opts.min_n_colors = opts.min_n_colors || 3;    
    if (opts.scheme_index === undefined || opts.scheme_index === null) {
        opts.scheme_index = 0;
    } 

    let palette = _el({type: 'div', id: opts.id, classes: ['color-palette']});
    palette.onclick = (evt) => {
        /**
         * The click is handlede at the level of the colormap
         */
        if (evt.target.classList.contains('colormap')) {
            console.info('Clicked on colormap');
            //let self = document.querySelector('.color-palette');
            let self = evt.target.closest('.color-palette');
            let colormaps = self.querySelectorAll('.colormap');
            // Remove the selected class
            for (let i=0; i<colormaps.length; i++) {
                colormaps[i].classList.remove('selected');            
            }
            // Add it for the clicked div
            evt.target.classList.add('selected');
            // get the settings
            let cbs = evt.target.closest('.colorbar-settings');
            let opts = UI._getColorPaletteOpts(cbs)
            // get the DiscreteColorBar
            let cb = document.querySelector('#' + cbs.attributes.initiator.value);
            // Replace the DCB
            cb.parentElement.replaceChild(new UI.DiscreteColorBar(opts), cb);
        }
    };
    // loop the schemes in that category (sequential, diverging, singlehue, qualitative...)
    // and then for each scheme, loop the colors    
    let brewer = UI.ColorDefinitions.brewer();

    // Cap the number of colors to the min the scheme supports
    let n_colors = Math.max(opts.min_n_colors, opts.n_colors);
    let schemes = brewer[opts.category];
    opts.scheme_index = Math.min(opts.scheme_index, schemes.length);
    for (let i=0; i<schemes.length; i++) {
        let scheme = schemes[i];
        // The colormap
        let clrmap = _el({type: 'div', classes: ['colormap', 'info-colormap']});
        palette.appendChild(clrmap);
        clrmap.setAttribute('info-text', scheme);
        if (i>=schemes.length-2) { // that's a fix for the y-overflow
            clrmap.classList.remove('info-colormap');
            clrmap.classList.add('info-colormap-above');
        }
        // first in the list is the default
        if (i === opts.scheme_index) {
            clrmap.classList.add('selected');
        };
        
        // Inner-container needed for the flex to work
        let clrmap_inner = _el({type: 'div', classes: ['colormap-inner']});
        clrmap.appendChild(clrmap_inner);
        if (opts.reverse === true) {
            clrmap_inner.classList.add('reverse');
        }
        // Cap the number of colors to the max the scheme supports
        n_colors = Math.min(n_colors, chroma.brewer[scheme].length);
        // All the colors
        let colors = chroma.scale(scheme).classes(n_colors);
        for (let j=0; j<n_colors; j++) {
            let clrel = _el({type: 'div', classes: ['colormap-item']});
            clrel.style['background-color'] = colors(j/(n_colors-1));
            clrmap_inner.appendChild(clrel);
        }
    }

    return palette;
};
// Needed by DiscreteColorbarSettings
UI.UpdateColorPalette = function (evt) {
    /**
     * Recreates the ColorPalette based on the inputs of the colors category
     */
    // The specific DiscreteColorBarSettings
    let cbs = evt.target.closest('.colorbar-settings');
    
    // Inputs for the ColorPalette
    let opts = UI._getColorPaletteOpts(cbs);

    // Update the ColorPalette
    let palette = cbs.querySelector('.color-palette');
    palette.parentElement.replaceChild(
        new UI.ColorPalette(opts),
        palette
    );

    // Update the DiscreteColorBar
    let cb = document.querySelector('#' + opts.id);
    cb.parentElement.replaceChild(new UI.DiscreteColorBar(opts), cb);
};
// Needed by UpdateColorPalette and ColorPalette
UI._getColorPaletteOpts = function (cbs) {
    /**
     * Reads the DiscreteColorBarSettings 
     * and gathers the parameters needed to produce the colorpalette
     * 
     * input:
     *  - cbs_id: id of the ColorBarSetting element
     * 
     * Will be called from:
     *  - UI.ColorPalette => onclick of:
     *      - 'color-palette'
     *      in ths case, use evt.target.closest('.panel .colorbar-settings')
     *  - UI.UpdateColorPalette => called with evt from within DiscreteColorBarSettings onclick of:
     *      - .dropdown-items: precision, category, n_colors
     *      - .svg-icon: reversed 
     *      in this case, use evt.target.closest('.panel .colorbar-settings')
     */
    
    // The DiscreteColorBarSettings
    // Get the DiscreteColorBarSettings panel that contains all the data
    // the document can potentially contain several DiscreteColorBar, so the ID is important
    // it is assumed that the ID is contained in the custom attribute 'initiator' of the created DiscreteColorBarSettings
    //let cbs = document.querySelector('#' + cbs_id);
    
    // Range settings
    let range_settings = cbs.querySelectorAll('.category')[0];
    // There is 1 dropdown with the precision
    let rng_dd = range_settings.querySelectorAll('.dropdown-selected');
    // The 1 double slider with min/max
    let rng_mm = range_settings.querySelectorAll('input[type=range]');
    // 1 checkbox with ise edges
    let eng_cb = range_settings.querySelector('.checkbox .svg-icon');
    
    // Color settings
    let color_settings = cbs.querySelectorAll('.category')[1];
    // There are 2 dropdowns in the colors settings: category and n_colors
    let clr_dd = color_settings.querySelectorAll('.dropdown-selected');
    // 1 checkbox with reversed
    let clr_cb = color_settings.querySelector('.checkbox .svg-icon');
    // 1 class for the selected scheme (of the category)
    let clr_sc = color_settings.querySelector('.colormap.selected');
    // get the index
    let clrmaps = color_settings.querySelectorAll('.colormap');
    let scheme_index = 0;
    for (let i=0; i<clrmaps.length;i++ ) {
        if (clrmaps[i].classList.contains('selected')) {
            scheme_index = i;
            break;
        }
    }

    // Get the DiscreteColorBar from the embedded ID as initiator
    let cb_id = cbs.attributes.initiator.value;
    let cb = document.querySelector('#' + cb_id);
    
    let opts = {
        id: cb_id, // of the DSB
        title: cb.querySelector('.description .title').innerText, // of the DSB
        // Range
        precision: Number(rng_dd[0].innerText),
        min: Number(rng_mm[0].min),
        max: Number(rng_mm[0].max),
        inter_min: Number(rng_mm[0].value),
        inter_max: Number(rng_mm[1].value),
        edges: eng_cb.classList.contains('rotated'),
        // Colors
        category: clr_dd[0].innerText,
        n_colors: Number(clr_dd[1].innerText),
        reverse: clr_cb.classList.contains('rotated'),
        // Clicked scheme
        scheme: clr_sc.attributes['info-text'].value,
        scheme_index: scheme_index
    };

    return opts;
};

// Panel-based elements: Dummy heatmap to demonstrate the colorbar feature
UI.Heatmap = function (opts) {
    /**
     * Creates a div with colors inside
     * 
     * opts:
     *  - n_rows: number, how many rows
     *  - n_cols: number, how many columns
     *  - mode: string, how to generate the data (random, x, y, xy, xy-center)
     * 
     */
    // Default
    opts = opts || {};
    opts.title = opts.title || 'Heatmap';
    opts.n_rows = opts.n_rows || 20;
    opts.n_cols = opts.n_cols || 10;
    opts.mode = opts.mode || 'random';
    // maybe not needed
    opts.scheme = opts.scheme || 'Spectral';
    opts.n_colors = opts.n_colors || 6;

    let heatmap = UI.Panel(opts);
    let colors = chroma.scale(opts.scheme).domain([0, 1]).classes(opts.n_colors);

    // Values
    let values = [];
    let min;
    let max;

    let body = heatmap.querySelector('.panel-body');
    body.style['display'] = 'flex';
    body.style['flex-direction'] = 'column';

    for (let i=0; i<opts.n_rows; i++) {
        let row = _el({type: 'div', classes: ['heatmap-row']});
        body.appendChild(row);
        let data = [];
        body.appendChild(row);
        for (let j=0; j<opts.n_cols; j++) {
            let col = _el({type: 'div', classes: ['heatmap-item']});
            row.appendChild(col);
            let value = getData(opts.mode, i, j);
            let rgb = colors(value).rgb();
            col.style['width'] = `${500/opts.n_cols}px`;
            col.style['background-color'] = `rgb(${rgb.join(',')})`;
            data.push(value);
        }
        values.push(data);
    }

    function getData(mode, i, j) {
        let value;
        if (mode === 'random') {            
            value = Math.random();
        }

        return value;
    }

    return heatmap;
};

UI.Tooltip = function (opts) {
    /**
     * Creates a tooltip overlay on the webgl, content of overlay is configured from panel
     * 
     * Has 2 components:
     *  - Configuration Panel
     *      - checkbox: to turn on/off
     *      - List Panel; when the checkbox is on, a panel appears under
     *          - dropdown with search: upon click inside the panel, the dd appears. Several items can be selected
     *  - Tooltip window
     *      - 1st row: Title + icon of pin
     *      - list of kpis with name: value
     *      - possibility to 
     * 
     * TODO: make the position follow the zoom & pan from threejs by calculating and passing the left/top position to the style
     * 
     */
    // Default handling
    opts = opts || {};
    opts.id = opts.id || '';
    opts.label = opts.label || 'some scenario';
    opts.items = opts.items || {'item 1': 123, 'item 2': 'abc', 'something': 0.198, 'anything': 'O_O', 'something else': 3.141592};

    let tooltip = _el({type: 'div', id: opts.id, classes: ['tooltip']});
    
    // The head has a layers icon and the name of the scenario
    let head = _el({type: 'div', classes: ['head']});
    tooltip.appendChild(head);
    head.appendChild(SvgIcon.new({icon: 'layers'}));
    head.appendChild(_el({type: 'div', classes: ['label'], innerText: opts.label}));

    // The body has a table with the key/values
    let body = _el({type: 'div', classes: ['body']});
    tooltip.appendChild(body);
    // The table that contains the items
    let table = _el({type: 'table', classes: ['table']});
    body.appendChild(table);
    let tbody = _el({type: 'tbody', classes: ['tbody']});
    table.appendChild(tbody);
    let keys = Object.keys(opts.items);
    for (let i=0; i<keys.length; i++) {
        let row = _el({type: 'tr'});
        tbody.appendChild(row);
        row.appendChild(_el({type: 'td', innerText: keys[i]}));
        row.appendChild(_el({type: 'td', classes: ['value'], innerText: opts.items[keys[i]]}));
    }

    return tooltip; 
};

UI.ItemGrouper = function (opts) {
    /**
     * Creates an grouper i.e. a container with a list of elements
     * 
     * TODO: rename to something else. Grouper should be instead a way to group similar divs.
     */
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];
    opts.selected = opts.selected || [];
    if (opts.fake === null) {
        opts.fake = false;
    }

    if (opts.fake) {
        opts.selected = ['item 1', 'item 2', 'item 3', 'item 4', 'item 5', 'item 6', 'item 7'];
    }

    let div = _el({type: 'div', id: opts.id, classes: ['item-grouper']});
    // content
    let content = _el({type: 'div', classes: ['content']});
    div.appendChild(content);
    // items TODO: it does not make sense to populate this element
    if (opts.selected.length > 0) {
        for (let i=0; i<opts.selected.length; i++) {
            addItem(opts.selected[i]);
        }
    }

    function addItem(name) {
        let item = _el({type: 'div', classes: ['item']});
        let span = _el({type: 'span', innerText: name});
        item.appendChild(span);
        let svg = SvgIcon.new({icon: 'close'})
        item.appendChild(svg);
        svg.onclick = (evt) => {
            if (evt.target.classList.contains('svg-icon')) {
                evt.target.parentElement.parentElement.removeChild(evt.target.parentElement);
            }
        };

        content.appendChild(item);
    }

    return div;
}

UI.ItemPicker = function (opts) {
    /**
     * Creates a container where the items are listed. Upon clicking within the container, a list with a search bar appears below.
     * Items have a close button to remove them from the container.
     * 
     * There should be 2 cases: allow multiple or not
     * 
     */

    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];
    if (opts.multiple === null) {
        opts.multiple = true;
    }
    if (opts.fake === null) {
        opts.fake = false;
    }
    let fake_items = {
        'item 1': 'int',
        'element 2 ': 'float',
        'component 3': 'string',
        'row 4': 'geo',
        'level 5': 'int',
        'section 5a': 'obj',
        'category 6': 'int',
        'channel 7': 'string',
        'subchannel 7z': 'mtl',
        'group 8': 'geo',
        'section 9': 'float',
        'subsection 9': 'json',
        'row 10': 'geo',
    };
    // same as above but with the kpis names we care about
    let fake_kpis = {
        power: ['P'],
        time: ['Delay', 'Doppler'],
        angle: ['AoA0', 'AoA1', 'EoA0', 'EoA1'],
        count: ['Nr'],
        ratio: ['SNR', 'SNR0', 'SINR', 'SU-SINR', 'MU-SINR'],
        unitless: ['Rank', 'Kfactor'],
        vector: ['position', 'velocity'],
    };
    // reformat fake_kpis so that it looks like fake_items
    if (opts.fake) {
        fake_items = {};
        let categories = Object.keys(fake_kpis);
        for (let i=0; i<categories.length; i++) {
            let elements = fake_kpis[categories[i]];
            for (let j=0; j<elements.length; j++) {
                fake_items[elements[j]] = categories[i];
            }
        }
    }
    //opts.items = opts.items || fake_items;
    opts.items = opts.items || {};
    if (Object.keys(opts.items).length === 0) {
        opts.items = fake_items;
    }
    opts.filtered_items = opts.filtered_items || fake_items;

    let div = _el({type: 'div', id: opts.id, classes: ['item-picker', ...opts.classes]});

    // The search bar is made of an input field and a search icon
    let bar = _el({type: 'div', classes: ['search-bar']});
    div.appendChild(bar);
    // input field
    let input = _el('input');    
    bar.appendChild(input);
    input.type = 'text';
    input.placeholder = 'Search...';
    // icon
    bar.appendChild(SvgIcon.new({icon: 'search'}));
    // When entering keys, the filtered_items list reduces to a smaller list
    input.onkeyup = (evt) => {
        if (evt.target.type === 'text') {
            evt.target.parentElement.nextElementSibling.classList.remove('hidden');
            let list_items = filterJson(evt.target.value, opts.items);
            let div = evt.target.parentElement.parentElement;
            populateSearchItems(div, list_items)
        }
    };
    input.onclick = (evt) => {
        if (evt.target.type === 'text') {
            evt.target.parentElement.nextElementSibling.classList.toggle('hidden');
        }
    };

    // Category mapping. TODO: this should somehow be configurable, for ex cgviz needs a similar mapping for the kpis
    let mapping_config = {
        red: ['float', 'power'],
        orange: ['int', 'time'],
        yellow: ['string', 'angle'],
        green: ['geo', 'count'],
        blue: ['obj', 'ratio'],
        indigo: ['mtl', 'unitless'],
        violet: ['json', 'vector'],
    };
    // form the mapping from the mapping_config
    let mapping = {};
    let colors = Object.keys(mapping_config);
    for (let i=0; i<colors.length; i++) {
        let elements = mapping_config[colors[i]];
        for (let j=0; j<elements.length; j++) {
            mapping[elements[j]] = colors[i];
        }
    }

    // The list of items
    let items = _el({type: 'div', classes: ['search-items', 'hidden']});
    div.appendChild(items);
    populateSearchItems(div, opts.items);

    // Function to build the list below the search field
    // this is needed since the input in the search bar impacts the list
    function populateSearchItems(div, list_items) {
        let items = div.querySelector('.search-items');
        // remove all children
        while (items.lastChild) {
            items.removeChild(items.lastChild);
        }
        let inputs = Object.keys(list_items);
        for (let i=0; i<inputs.length;i++) {
            let key = inputs[i];
            let val = list_items[key];
            let item = _el({type: 'div', classes: ['search-item']})
            items.appendChild(item);
            // Each item has a (not unique) category icon (float, int, string or kpi type)
            let cat = _el({type: 'div', classes: ['category']});
            item.appendChild(cat);
            let el = _el({type: 'div', classes: ['element'], innerText: val});
            cat.appendChild(el);
            el.classList.add(mapping[val]);
            // and a span for the actual name
            let span = _el({type: 'span', innerText: key});
            item.appendChild(span);
        }
    }

    function filterJson(keyword, json_items) {
        /**
         * Filters the json object entries that include the keyword in either key:value
         * TODO: move to utils
         */
        let output = {};

        let keys = Object.keys(json_items);
        let values = Object.values(json_items);
        keyword = keyword.toLowerCase();
        for (let i=0; i<keys.length; i++) {
            let key = keys[i];
            let val = values[i];
            if (key.toLowerCase().includes(keyword) || val.toLowerCase().includes(keyword)) {
                output[key] = val;
            }
        }

        return output;
    }

    return div;
};

UI.ItemGriper = function (opts) {
    /**
     * Creates an item picker and grouper
     * combines the UI.ItemGrouper & UI.ItemPicker
     */
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];
    if (opts.multiple === null) {
        opts.multiple = true;
    }
    opts.items = opts.items || {};
    opts.selected = opts.selected || [];
    if (opts.fake === null) {
        opts.fake = false;
    }

    let div = _el({type: 'div', id: opts.id, classes: ['item-picker', ...opts.classes]});

    // the output of the selection
    let output = UI.ItemGrouper();
    div.appendChild(output);
    
    // the search bar
    let input = UI.ItemPicker({items: opts.items, fake: opts.fake});
    div.appendChild(input);
    // a click on the individual item returns the element's name and adds it to the grouper
    // the event listerner is placed on the parent i.e. the div with class .search-items
    let dom_items = input.querySelector('.search-items');
    dom_items.onclick = (evt) => {
        if (evt.target.classList.contains('search-item')) {
            let name = evt.target.querySelector('span').innerText;
            console.log(name);
            // add to grouper
            let content = output.querySelector('.content');
            // get list of existing items
            let alreadyThere = false;
            let spans = content.querySelectorAll('span');
            for (let i=0; i<spans.length; i++) {
                if (spans[i].innerText === name) {
                    alreadyThere = true;
                    break;
                }
            }
            if (!alreadyThere) {
                // create new item
                let item = newItem(name)
                // check here whether it is already in the content
                content.appendChild(item);
            }
        }
    };

    function newItem(name) {
        let item = _el({type: 'div', classes: ['item']});
        let span = _el({type: 'span', innerText: name});
        item.appendChild(span);
        let svg = SvgIcon.new({icon: 'close'})
        item.appendChild(svg);
        svg.onclick = (evt) => {
            if (evt.target.classList.contains('svg-icon')) {
                evt.target.parentElement.parentElement.removeChild(evt.target.parentElement);
            }
        };
        return item;
    }

    return div;    
};

UI.FileReader = function (opts) {
    /**
     * Creates a file reader based on promises
     */
};

UI.ProgressBar = function (opts) {
    /**
     * Creates a progress bar (set?)
     */
};

// OTHER
UI.Resizer = function (opts) {
    /**
     * Creates Resizers structure and adds it to existing div
     * makes it possible to resize any div
     * 
     * opts: 
     *  - id, string. Id of the target div
     * 
     */
    // Default values
    opts = opts || {};
    opts.pos = opts.pos || 'one'; // can be 'one' for bottom-right, 'middles', 'corners', 'all'

    let target = document.querySelector(`#${opts.id}`);
    if (target === null) {
        let demo_components = document.querySelector(`#${opts.parent}`);
        target = _el({type: 'div', id: 'resizer-demo'});
        target.style['width'] = '200px';
        target.style['height'] = '100px';
        target.style['background-color'] = 'white';
        demo_components.appendChild(target);
    }

    target.classList.toggle('resizable');

    let resizer = _el({type: 'div', classes: ['resizers']});
    target.appendChild(resizer);

    if (opts.pos === 'one') {
        resizer.appendChild(_el({type: 'div', classes: ['resizer', 'bottom-right']}));
    } else {
        if (opts.pos === 'all' || opts.pos === 'middles') {
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'top-middle']}));
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'bottom-middle']}));
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'left-middle']}));
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'right-middle']}));
        }
        if (opts.pos === 'all' || opts.pos === 'corners') {
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'top-left']}));
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'top-right']}));
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'bottom-left']}));
            resizer.appendChild(_el({type: 'div', classes: ['resizer', 'bottom-right']}));
        }
    }


    let min_width = 100;
    let min_height = 50;

    makeResizable(`#${opts.id}`);

    function makeResizable(id) {
        const element = document.querySelector(id);
        const resizers = document.querySelectorAll(id + ' .resizer')
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
                evt.preventDefault()
                original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                original_x = element.getBoundingClientRect().left;
                original_y = element.getBoundingClientRect().top;
                original_mouse_x = evt.pageX;
                original_mouse_y = evt.pageY;
                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);
            });
        }

        function resize(evt) {
            let currentResizer = evt.target;
            if (currentResizer.classList.contains('resizer')) {
                let width;
                let height;
                if (currentResizer.classList.contains('bottom-right')) {
                    width = original_width + (evt.pageX - original_mouse_x);
                    height = original_height + (evt.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        element.style.width = width + 'px';
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                    }
                }
                else if (currentResizer.classList.contains('bottom-left')) {
                    height = original_height + (evt.pageY - original_mouse_y);
                    width = original_width - (evt.pageX - original_mouse_x);
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                    }
                    if (width > minimum_size) {
                        element.style.width = width + 'px';
                        element.style.left = original_x + (evt.pageX - original_mouse_x) + 'px';
                    }
                }
                else if (currentResizer.classList.contains('top-right')) {
                    width = original_width + (evt.pageX - original_mouse_x);
                    height = original_height - (evt.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        element.style.width = width + 'px';
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                        element.style.top = original_y + (evt.pageY - original_mouse_y) + 'px';
                    }
                }
                else {
                    width = original_width - (evt.pageX - original_mouse_x);
                    height = original_height - (evt.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        element.style.width = width + 'px';
                        element.style.left = original_x + (evt.pageX - original_mouse_x) + 'px';
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                        element.style.top = original_y + (evt.pageY - original_mouse_y) + 'px';
                    }
                }
            }
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
        }
    }

};

UI.makeResizableDiv = function(div) {
    /**
     * Make a div resizable
     */
    // get the element
    const element = document.querySelector('#' + div);
    element.classList.add('resizable');
    // add the resizers to it
    element.appendChild(createResizers());
    const resizers = document.querySelectorAll('#' + div + ' .resizer')
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
        mode = mode || 'simple'; // options are 'one
        let resizer = document.createElement('div');
        resizer.classList.add('resizers');
        
        let positions = {
            'simple': ['bottom-right', 'right-middle', 'bottom-middle'],
            'middles': ['top-middle', 'bottom-middle', 'left-middle', 'right-middle'],
            'corners': ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        };
        
        if (mode === 'simple') {
            for (let i=0; i<positions[mode].length; i++) {
                let el = document.createElement('div');
                el.classList.add('resizer');
                el.classList.add(positions[mode][i]);
                resizer.appendChild(el);
            }
        } else {
            if (mode === 'all' || mode === 'corners') {
                for (let i=0; i<positions['corners'].length; i++) {
                    let el = document.createElement('div');
                    el.classList.add('resizer');
                    el.classList.add(positions['corners'][i]);
                    resizer.appendChild(el);
                }
            }
            if (mode === 'all' || mode === 'middles') {
                for (let i=0; i<positions['middles'].length; i++) {
                    let el = document.createElement('div');
                    el.classList.add('resizer');
                    el.classList.add(positions['middles'][i]);
                    resizer.appendChild(el);
                }
            }
        }

        return resizer;
    }

  }

UI.ColorDefinitions = {
    brewer: function() {
        let brewer = {
            sequential: ["BuGn","BuPu","GnBu","OrRd","PuBu","PuBuGn","PuRd","RdPu","YlGn","YlGnBu","YlOrBr","YlOrRd"],
            diverging: ["BrBG","PiYG","PRGn","PuOr","RdBu","RdGy","RdYlBu","RdYlGn","Spectral"],
            singlehue:["Blues","Greens","Greys","Oranges","Purples","Reds"],
            qualitative: ["Accent","Dark2","Paired","Pastel1","Pastel2","Set1","Set2","Set3"] 
        };
        brewer.all = [...brewer.sequential, ...brewer.diverging, ...brewer.singlehue, ...brewer.qualitative];

        return brewer;
    }
};

UI.IconsShowCase = function (opts) {
    /**
     * Shows all the implemented icons
     */
    opts = opts || {};
    opts.id = opts.id || 'icon-demo';
    let div = _el({type: 'div', id: opts.id, classes: ['icons', 'container']});
    div.style.display = 'flex';
    div.style['flex-direction'] = 'row';
    div.style['flex-wrap'] = 'wrap';
    div.style['justify-content'] = 'flex-start';    
    div.style['background-color'] = 'var(--color-bg-body)';
    div.style.border = '1px white solid';

    let icons = SvgIcon.getList();;

    for (let i=0; i<icons.length; i++) {
        // Shuffle the positions just to test
        let pos = ['top', 'bottom', 'left', 'right'];
        let j = Math.round(Math.random() * (pos.length-1));

        let svgIcon = SvgIcon.new({icon: icons[i], tip_pos: `info-${pos[j]}`});
        svgIcon.style['padding-right'] = '10px';
        div.appendChild(svgIcon);
    }
    
    return div;
}

UI.ContextMenu = {
    /**
     * Intercepts the right-click and provides options
     * 
     * TODO: since this is a single event for the entire page,
     * we can add special cases and use different action depending on the evt.target
     * for ex:
     *  - a right click on an item could give extra options
     * 
     */

    on: false,

    toggle: () => {
        if (UI.ContextMenu.on) {
            window.removeEventListener('contextmenu', UI.ContextMenu.simple)
            window.removeEventListener('click', UI.ContextMenu.click);            
        } else {
            window.addEventListener('contextmenu', UI.ContextMenu.simple);            
            window.addEventListener('click', UI.ContextMenu.click);            
        }
        UI.ContextMenu.on = !UI.ContextMenu.on;
    },

    simple: function (evt) {
        evt.preventDefault();
        console.log(`Context menu: x=${evt.clientX} - y=${evt.clientY}`);
        // remove the context-menu if already there
        let cmenu = document.querySelector('.context-menu');
        if (cmenu) {
            document.body.removeChild(cmenu);
        }
        // recreate the context-menu
        cmenu = _el({type: 'div', id: 'context-menu', classes: ['context-menu']});
        document.body.appendChild(cmenu);
        let oHeight = document.querySelector('#context-menu').offsetHeight;
        let oWidth = document.querySelector('#context-menu').offsetWidth;
        let top = (evt.clientY + oHeight) > window.innerHeight ? (window.innerHeight - oHeight) : evt.clientY;
        let left = (evt.clientX + oWidth) > window.innerWidth ? (window.innerWidth - oWidth) : evt.clientX;
        console.log(`H: ${oHeight} - W: ${oWidth}`)
        cmenu.style.top = `${top}px`;
        cmenu.style.left = `${left}px`;
        //cmenu.style.left = `${evt.clientX}px`;
        //cmenu.style.top = `${evt.clientY}px`;
        // Add items to the menu
        let head = _el({type: 'div', classes: ['cm-head'], innerText: 'Context menu'});
        cmenu.appendChild(head);
        let body = _el({type: 'div', classes: ['cm-body']});
        cmenu.appendChild(body);
        body.appendChild(_el({type: 'div', classes: ['cm-divider']}));
        body.appendChild(_el({type: 'div', classes: ['cm-item'], innerText: `x: ${evt.clientX}`}));
        body.appendChild(_el({type: 'div', classes: ['cm-item'], innerText: `y: ${evt.clientY}`}));
    },

    click: function (evt) {
        console.log(`clicked: ${evt.target.innerText}`);
        let cmenu = document.querySelector('.context-menu');
        if (cmenu) {
            document.body.removeChild(cmenu);
        }
    },

    main: null

};

UI.Modal = {
    activate: () => {window.addEventListener('click', UI.Modal.handleModal)},
    handleModal: function (evt) {
        if (evt.target !== null) {

        }
    }
};

UI.Fixed = function (opts) {
    /**
     * Create an element with fixed position in the document (useful for cgviz current heatmap info)
     */
    // Default values
    opts = opts || {};
    opts.id = opts.id || '';
    opts.classes = opts.classes || [];
    opts.title = opts.title || 'Fixed element';
    opts.top = opts.top || '0px';
    opts.left = opts.left || '50%';

    let div = _el({type: 'div', id: opts.id, classes: ['fixed', ...opts.classes], innerText: opts.title});
    div.style.position = 'fixed';
    div.style.top = opts.top;
    div.style.left = opts.left;

    return div;
}

// Demo of all elements and widgets
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


export {UI, _el};