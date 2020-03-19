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
    let colors = chroma.scale(opts.scheme).domain([opts.min, opts.max]).classes(opts.n_colors);
    let values = chroma.limits([opts.min, opts.max], 'e', opts.n_colors);
    if (opts.reverse === true) {
        values = chroma.limits([opts.max, opts.min], 'e', opts.n_colors);
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

// Colorpalette
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

    let palette = _el({type: 'div', classes: ['color-palette']});
    if (opts.id !== '') {
        palette.id = opts.id;
    }
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
        let clrmap = _el({type: 'div', classes: ['colormap', 'tip-colormap']});
        palette.appendChild(clrmap);
        clrmap.setAttribute('tip-text', scheme);
        if (i>=schemes.length-2) { // that's a fix for the y-overflow
            clrmap.classList.remove('tip-colormap');
            clrmap.classList.add('tip-colormap-above');
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
        min: -25,
        max: +21,
        // Colors
        category: clr_dd[0].innerText,
        n_colors: Number(clr_dd[1].innerText),
        reverse: clr_cb.classList.contains('rotated'),
        // Clicked scheme
        scheme: clr_sc.attributes['tip-text'].value,
        scheme_index: scheme_index
    };

    return opts;
};

// Dummy heatmap to demonstrate the colorbar feature
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

// Tooltip
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
     */
};

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

