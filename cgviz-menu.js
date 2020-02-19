/*
cgviz-menu

Html menu handling

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-02-02
*/

class CgVizMenu {
    /**
     * Hierarchy
     *  menu: left hand side menu. main 
     *  panel: right hand side menu with colorbar etc
     *  modal: file loading
     *  info: renderer info
     */
    constructor() {
        this.cgviz = null;  // reference to the cgviz instance
        this._directory = null;
        this.setup();
        //this.AddToolTips(); // Has to be the last one called
    } 
    
    setup() {
        this.createMenu();
        this.createPanel();
        this.createModal();
    }

    createMenu() {
        /**
         * The menu has a container which in turn has:
         *  the main menu
         *      head
         *      body
         *  the menu control
         */
        // The menu container
        let menu = _el('div', 'menu-container', ['hidden']);
        
        // The main menu
        let menu_main = _el('div', 'menu-main', ['hidden']);
        // The main menus's head
        menu_main.appendChild(this._createMenu_Head());        
        // The main menu's body        
        menu_main.appendChild(this._createMenu_Body());
        
        // The menu control
        let menu_ctrl = _el('div', 'menu-control');
        menu_ctrl.appendChild(this.createSvg('show_hide')); // The svg logo
        menu_ctrl.addEventListener('click', () => this._eventShowHideMainMenu());
        
        // Append children to the menu container
        menu.appendChild(menu_main);
        menu.appendChild(menu_ctrl);
        // Append the menu container to the body
        document.body.appendChild(menu);
    }
    
    _createMenu_Head() {
        /**
         * The menu head has 2 parts:
         *      the logo
         *      the tabs selector
         */
        let head_container = _el('div', 'menu-main-head-container');

        head_container.appendChild(this.__createMenu_MainHead());
        
        head_container.appendChild(this.__createMenu_MainHeadTabs());

        return head_container;
    }

    __createMenu_MainHead() {
        let head = _el('div', 'menu-main-head');

        // Head left contains the LOGO and Titles
        let head_left = _el('div', 'menu-main-head-left');
        head.appendChild(head_left);
        // Head right contains the icons for bug report, share, info
        let head_right = _el('div', 'menu-main-head-right');
        head.appendChild(head_right);

        // HEad LEFT
        // The cgviz logo with 2 circles
        let logo = _el('div', 'menu-main-head-logo-svg');
        logo.appendChild(this.createSvg('cgviz'));
        head_left.appendChild(logo);
        // The title and subtitle
        let title = _el('div', 'menu-main-head-logo');
        title.innerText = 'cg-viz';
        let subtitle = _el('div', 'menu-main-head-logo-subtitle');
        subtitle.appendChild(document.createTextNode('lite'));
        title.appendChild(subtitle);        
        head_left.append(title);

        // HEAD RIGHT
        // Create a new issue in GitLab
        let bug = _el('div', '', ['top-icon']);
        bug.appendChild(this.createSvg('bug'));
        bug.addEventListener('click', () => { window.open('http://rnd-gitlab-eu.gmail.com/ransystem-eu/cg-viz-lite/issues/new', '_blank'); });
        addTooltip(bug, 'bottom', 'File an issue in the gitlab');
        head_right.appendChild(bug);
        // Open the Wiki in Gitlab
        let info = _el('div', '', ['top-icon']);
        info.appendChild(this.createSvg('info'));
        info.addEventListener('click', () => { window.open('http://rnd-gitlab-eu.gmail.com/ransystem-eu/cg-viz-lite/wikis/home', '_blank'); });
        addTooltip(info, 'left', 'Wiki access');
        head_right.appendChild(info);
        // Take a screenshot of the screen
        let share = _el('div', '', ['top-icon']);
        share.appendChild(this.createSvg('share'));
        share.addEventListener('click', () => this._eventCaptureScreen());
        head_right.appendChild(share);

        return head;
    }

    __createMenu_MainHeadTabs() {
        /**
         *  One tab per menu category:
         *      scenarios
         *      filters
         *      interactions
         *      settings
         */
        let head_tabs = _el('div', 'menu-main-head-tabs');

        let tab_scenario = _el('div', 'tab-Scenarios', ['tab', 'current-tab']);
        tab_scenario.appendChild(this.createSvg('scenarios'));
        tab_scenario.addEventListener('click', (evt) => this._eventTabSelection(evt));
        head_tabs.appendChild(tab_scenario);
        
        let tab_filter = _el('div', 'tab-Filters', ['tab']);
        tab_filter.appendChild(this.createSvg('filters'));
        tab_filter.addEventListener('click', (evt) => this._eventTabSelection(evt));
        head_tabs.appendChild(tab_filter);
        
        let tab_interaction = _el('div', 'tab-Interactions', ['tab']);
        tab_interaction.appendChild(this.createSvg('interactions'));
        tab_interaction.addEventListener('click', (evt) => this._eventTabSelection(evt));
        head_tabs.appendChild(tab_interaction);
        
        let tab_setting = _el('div', 'tab-Settings', ['tab']);
        tab_setting.appendChild(this.createSvg('settings'));
        tab_setting.addEventListener('click', (evt) => this._eventTabSelection(evt));
        head_tabs.appendChild(tab_setting);

        return head_tabs;
    }

    _createMenu_Body() {
        /**
         * The menu body contains as many divs as there are categories:
         *      scenarios
         *      filters
         *      interactions
         *      settings
         * Only one of them is visible at any time
         */
        let main_body = _el('div', 'menu-main-body');

        main_body.appendChild(this.__createMenu_Scenarios());
        main_body.appendChild(this.__createMenuFilters());
        main_body.appendChild(this.__createMenuInteractions());
        main_body.appendChild(this.__createMenuSettings());

        return main_body;

    }

    __createMenu_Scenarios() {
        let scenarios = _el('div', 'Scenarios', ['container-tab-content', 'visible']);
        
        let title = _el('div', '', ['menu-title']);
        title.innerText = 'Scenarios';
        scenarios.appendChild(title);

        // A visiual separator
        scenarios.appendChild(_el('hr', '', ['title-body-separator']));

        // A container for the scenario data
        scenarios.appendChild(_el('div', 'div-scenarios'));

        // A button to laod a scenario
        let btn = _el('div', '', ['div-button']);
        btn.appendChild(this.createSvg('add'));
        let txt = _el('p', '', ['menu-text']);
        txt.innerText = 'Add Scenario';
        btn.addEventListener('click', () => this._eventShowModal());
        btn.appendChild(txt)
        
        scenarios.appendChild(btn);

        return scenarios;
    }

    __populateMenuScenariosContent() {
        /**
         * The scenarios div contains:
         *  A box with the name of the scenario, under which
         *      a smaller box for each category: obj, pov, rays, kpis
         *          a smaller box for elements of each category
         * 
         * Example:
         *  HongKong:
         *      Object
         *          {list of obj files?}
         *      Point of View
         *          {list of simple boxes with eye and color}
         *      Traces
         *          {2 levels: tx level and then rx level}
         *      Kpis
         *          {...}
         */
        console.log(' Populating scenarios content....');

        let div = _get('#div-scenarios');

        // The ID of the scenario is contained in this.cgviz.data.selected
        // in case the ID already exists, it is removed and built anew
        let div_scenario = _get('#' + this.cgviz.data.selected);
        if (div_scenario !== null) {
            div.removeChild(div_scenario);
        }

        // 1) THE HEADER
        div_scenario = this.HeaderMenu(this.cgviz.data.selected, 'scenario-header', '', false, true);
        // attach en event to the click on the expand element
        div_scenario.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        div.appendChild(div_scenario);

        // 2) THE CONTENT
        let sce_content = _el('div', '', ['scenario-content', 'hidden']);
        div.appendChild(sce_content);
        
        // 2.1) The universe
        // 2.1.1) the header
        let obj_header = this.HeaderMenu('Universe', 'obj-header'); 
        obj_header.querySelector('.eye').addEventListener('click', (evt) => this._eventToggleEntireUniverse(evt));
        sce_content.appendChild(obj_header);
        // 2.1.2 the content
        let obj_content = this.__populateUniverseContent();
        if (obj_content !== undefined) {
            sce_content.appendChild(obj_content);
            obj_header.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        }
        
        // 2.2) The Point of Views
        // 2.2.1) the header
        let pov_header = this.HeaderMenu('PoV', 'pov-header'); 
        pov_header.querySelector('.eye').addEventListener('click', (evt) => this._eventToggleAllPovs(evt));
        sce_content.appendChild(pov_header);
        // 2.2.2) the content
        //let pov_content = _el('div', '', ['pov-content', 'hidden']);
        let pov_content = this.__populatePovContent();
        if (pov_content !== undefined) {
            sce_content.appendChild(pov_content);
            pov_header.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        }        
        // The point of view are:
        // - grouped by name
        // - represented by small boxes the size of up to 4 digits, for the POV ID
        // TODO: general module to group the boxes by 50s for ex
        //this.__populatePovContent(pov_content);
        
        // 2.3) The traces:
        // 2.3.1) the header
        let trace_header = this.HeaderMenu('Traces', 'trace-header'); 
        trace_header.querySelector('.eye').addEventListener('click', (evt) => this._eventToggleAllRays(evt));
        sce_content.appendChild(trace_header);
        // 2.3.2) the content
        let trace_content = this.__populateTraceContent();
        if (trace_content !== undefined) {
            sce_content.appendChild(trace_content);
            trace_header.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        }        
        // The Traces are:
        // - grouped by Tx name, then by Rx name
        // - represented by small boxes the size of up to 4 digits, for the Rx ID
        
        
        // 2.4) The kpis
        // 2.4.1) the header
        let kpis_header = this.HeaderMenu('Kpis', 'kpis-header'); 
        sce_content.appendChild(kpis_header);        
        // 2.4.2) the content
        let kpis_content = _el('div', '', ['kpis-content', 'hidden']);        
        sce_content.appendChild(kpis_content);
        // The kpis are:
        //  -
    }

    __populateUniverseContent() {
        /**
         * The Universe is a list of .obj files with show/hide option
         */
        let qcmUniverse = this.cgviz.data.scenarios[this.cgviz.data.selected].qcmUniverse;
        let objects = Object.keys(qcmUniverse.objs);
        if (objects.length === 0) {
            log.warn('no universe objects found');
            return;
        }
        let obj_content = _el('div', '', ['obj-content', 'hidden']);
        // Add the .obj files
        for (let i=0; i<objects.length; i++) {
            let submenu = this.HeaderSubMenu(objects[i]);
            submenu.querySelector('.eye').addEventListener('click', (evt) => this._eventToggleUniverse(evt));
            obj_content.appendChild(submenu);            
        }
        // Add a ground plane
        let submenu = this.HeaderSubMenu('ground plane');
        submenu.querySelector('.eye').addEventListener('click', (evt) => this._eventToggleGroundPlane(evt));
        obj_content.appendChild(submenu);

        return obj_content;
    }

    __populatePovContent() {
        /**
         *  The point of view are:
         *      - grouped by name
         *      - represented by small boxes the size of up to 4 digits, for the POV ID
         *  TODO: general module to group the boxes by 50s for ex
         */
        // pov_content is the div
        // TODO: change the key
        let qcmPov = this.cgviz.data.scenarios[this.cgviz.data.selected].qcmPov;
        let pov_types = Object.keys(qcmPov);
        if (pov_types.length === 0) {
            console.log('No data in qcmPov');
            return;
        }
        let pov_content = _el('div', '', ['pov-content', 'hidden']);

        let pov_type;
        for (let i=0; i<pov_types.length; i++) {
            pov_type = pov_types[i];
            let submenu = this.HeaderSubMenu(pov_type, '', true);
            pov_content.appendChild(submenu);
            // show/hide all the pov of this type in the scene
            submenu.querySelector('.eye').addEventListener('click', (evt) => this._eventTogglePovs(evt));
            // show/hide the submenu content i.e. the list of povs
            submenu.querySelector('.expand').addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
            // The povs are shown in sub-menu-content
            let submenu_content = _el('div', '', ['sub-menu-content', 'hidden']);            
            let pov_ids = Object.keys(qcmPov[pov_type]).sort();
            for (let j=0; j<pov_ids.length; j++) {
                let item = _el('div', '', ['sub-menu-content-pov']);
                submenu_content.appendChild(item);
                let span = _el('span');
                span.innerText = pov_ids[j];
                item.appendChild(span);
                //item.addEventListener('click', (evt) => {evt.target.classList.toggle('clicked');});
                item.addEventListener('click', (evt) => this._eventTogglePov(evt));
            }
            pov_content.appendChild(submenu_content);
        }

        return pov_content;

    }

    __populateTraceContent() {
        // The Traces are:
        // - grouped by Tx name, then by Rx name
        // - represented by small boxes the size of up to 4 digits, for the Rx ID
        let qcmTrace = this.cgviz.data.scenarios[this.cgviz.data.selected].qcmTrace;
        let tx_ids = Object.keys(qcmTrace).sort();
        if (tx_ids.length === 0) {
            console.log('No data in qcmTrace');
            return;
        }

        let trace_content = _el('div', '', ['trace-content', 'hidden']);
        
        let tx_id;        
        for (let i=0; i<tx_ids.length; i++) {
            tx_id = tx_ids[i];
            let submenu = this.HeaderSubMenu(tx_id, '', true);
            trace_content.appendChild(submenu);
            // show/hide all the traces from this txpovid in the scene
            submenu.querySelector('.eye').addEventListener('click', (evt) => this._eventToggleAllRaysFromPovId(evt));
            // show/hide the submenu content i.e. the list of traces
            submenu.querySelector('.expand').addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
            // The traces are shown in sub-menu-content
            let submenu_content = _el('div', '', ['sub-menu-content', 'hidden']);  
            let rx_ids = Object.keys(qcmTrace[tx_id]).sort();
            for (let j=0; j<rx_ids.length; j++) {
                let item = _el('div', '', ['sub-menu-content-trace']);
                submenu_content.appendChild(item);
                let span = _el('span');
                span.innerText = rx_ids[j];
                item.appendChild(span);
                //item.addEventListener('click', (evt) => {evt.target.classList.toggle('clicked');});
                //item.addEventListener('click', (evt) => this._eventToggleTrace(evt));
                item.addEventListener('click', (evt) => this._eventToggleRaysBetweenPovs(evt));
            }
            trace_content.appendChild(submenu_content);
        }

        return trace_content;
    }

    HeaderMenu(id_, className, innerText, grab, bin, eye) {
        /**
         * Header for Menu, used for example in:
         *  - the scenario level (the actual simulation name)
         *  - the categories below it, qcmpov, qcmobj, qcmtrace, qcmkpis
         * It has:
         *  - an id_
         *  - a class: div-scenario
         * It contains:
         *  - a grab icon: move scenario up/down to reorganize
         *  - an eye icon: click and everything is HIDDEN in the view
         *  - a name bar: name of the scenario (same as folder where data was loaded from)
         *  - a bin icon: click and the scenario is deleted, along with all the related data and meshes
         *  - an expand icon: click and it shows the categories under (obj, pov, trace, kpis)
         */
        if (innerText === '') {
            innerText = undefined;
        }
        innerText = innerText || id_;
        grab = grab || false;
        bin = bin || false;
        if (eye === undefined) {
            eye = true;
        }

        let div = _el('div', id_, [className]);

        if (grab === true) {
            let grab = _el('div', '', ['header-svg', 'weak']);
            grab.appendChild(this.createSvg('grab'));
            div.appendChild(grab);
        }
        
        if (eye === true) {
            let eye_ = _el('div', '', ['header-svg', 'eye']);
            eye_.appendChild(this.createSvg('eye_open'));
            div.appendChild(eye_);
        }
        
        let name = _el('div', '', ['header-text']);
        name.innerText = innerText;
        div.appendChild(name);
        
        if (bin === true) {
            let bin = _el('div', '', ['header-svg', 'delete']);
            bin.appendChild(this.createSvg('delete'));
            div.appendChild(bin);
        }
        
        let expand = _el('div', '', ['header-svg', 'expand']);
        expand.appendChild(this.createSvg('down'));
        div.appendChild(expand);

        return div;
    }

    HeaderSubMenu(innerText, id_, expand) {
        /**
         * A simpler Header
         * Contains a title and an eye
         */
        expand = expand || false;
        if (id_ === '') {
            id_ = null;
        }

        let div = _el('div', id_, ['sub-menu']);

        let eye = _el('div', '', ['header-svg', 'eye']);
        eye.appendChild(this.createSvg('eye_open'));
        div.appendChild(eye);
        
        let name = _el('div', '', ['header-text']);
        name.innerText = innerText;
        div.appendChild(name);

        if (expand == true) {
            let expand = _el('div', '', ['header-svg', 'expand']);
            expand.appendChild(this.createSvg('down'));
            div.appendChild(expand);            
        }
        
        return div;
    }

    HeaderSwitch(innerText, id_, default_on) {
        if (id_ === '') {
            id_ = null;
        }

        if (default_on === undefined) {
            default_on = true;
        }

        let div = _el('div', id_, ['sub-menu', 'switch']);

        let name = _el('div', '', ['header-text']);
        name.innerText = innerText;
        div.appendChild(name);

        let svg = this.createSvg('switch-off');
        if (default_on) {
            svg = this.createSvg('switch-on');
        }

        let icon =_el('div', '', ['switch-svg']);
        icon.appendChild(svg);
        div.appendChild(icon);

        return div;
    }

    __createMenuFilters() {
        /**
         * Filters
         *  allow users to filter data from the heatmap
         */
        let filters = _el('div', 'Filters', ['container-tab-content']);

        let title = _el('div', '', ['menu-title']);
        title.innerText = 'Filters';
        filters.appendChild(title);        
        
        // A visiual separator
        filters.appendChild(_el('hr', '', ['title-body-separator']));

        return filters;
    }

    __createMenuInteractions() {
        /**
         * Interactions
         *  Allow users to toggle helpers tools like:
         *  - show GPS coordinates unders the mouse (per tile)
         *  - show tooltip with selectable list of KPIs
         */
        let interactions = _el('div', 'Interactions', ['container-tab-content']);

        let title = _el('div', '', ['menu-title']);
        title.innerText = 'Interactions';
        interactions.appendChild(title);
        
        // A visiual separator
        interactions.appendChild(_el('hr', '', ['title-body-separator']));

        // A container for the interaction data
        let div_interactions = _el('div', 'div-interactions');
        interactions.appendChild(div_interactions);

        // 1) Tooltips
        // The header
        let tooltip_header = this.HeaderMenu('Tooltips', 'scenario-header', '', false, false, false);
        tooltip_header.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        interactions.appendChild(tooltip_header);
        // The content
        let tooltip_content = _el('div', '', ['obj-content', 'hidden']);        
        // 1.1) Visibility
        let tooltip_visible = this.HeaderSwitch('Visible');
        tooltip_visible.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleTooltip(evt));
        tooltip_content.appendChild(tooltip_visible);
        // 1.2) Coordinates
        let tooltip_coord = this.HeaderSwitch('Coordinates');
        tooltip_coord.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleTooltip(evt));
        tooltip_content.appendChild(tooltip_coord);
        // 1.3) Pov ID
        let tooltip_povid = this.HeaderSwitch('PoV ID');
        tooltip_povid.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleTooltip(evt));
        tooltip_content.appendChild(tooltip_povid);
        // 1.4) KPIs => TODO: allow user to select which KPIs => offer a list
        let tooltip_kpis = this.HeaderSwitch('KPIs');
        tooltip_kpis.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleTooltip(evt));
        tooltip_content.appendChild(tooltip_kpis);

        interactions.appendChild(tooltip_content);

        return interactions;
    }

    __createMenuSettings() {
        /**
         * Settings
         *  Allow users to change the same settings as dat.gui allowed
         *  -   background color
         *  -   helpers
         *  -   show info
         */
        let settings = _el('div', 'Settings', ['container-tab-content']);

        let title = _el('div', '', ['menu-title']);
        title.innerText = 'Settings';
        settings.appendChild(title);        
        
        // A visiual separator
        settings.appendChild(_el('hr', '', ['title-body-separator']));

        // A container for the settings data
        let div_settings = _el('div', 'div-settings');
        settings.appendChild(div_settings);
        // 1) General
        let general_header = this.HeaderMenu('General', 'scenario-header', '', false, false, false);
        general_header.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        settings.appendChild(general_header);
        let general_content = _el('div', '', ['obj-content', 'hidden']);;
        settings.appendChild(general_content);
        //let general_content = this.HeaderSubMenu('Background');
        
        // 2) Helpers
        let helpers_header = this.HeaderMenu('Helpers', 'scenario-header', '', false, false, false);
        helpers_header.getElementsByClassName('expand')[0].addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        settings.appendChild(helpers_header);
        // Axes and Grid
        let helpers_content = _el('div', '', ['obj-content', 'hidden']);
        
        // 2.1) The axes: show/hide, use arrows, size
        let helpers_axes = this.HeaderMenu('Axes', 'obj-header', '', false, false, false);
        helpers_axes.querySelector('.expand').addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        helpers_content.appendChild(helpers_axes);
        let axes_content = _el('div', '', ['sub-menu-content', 'hidden'], true);
        helpers_content.appendChild(axes_content);
        
        let axes_visible = this.HeaderSwitch('Visible');
        axes_visible.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleAxes(evt));
        axes_content.appendChild(axes_visible);
        let axes_arrows = this.HeaderSwitch('Use arrows');
        axes_arrows.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleAxesArrows(evt));
        axes_content.appendChild(axes_arrows);
        axes_content.appendChild(this.HeaderSwitch('Size'));
        
        // 2.2) the grid: show/hide, size, divisions
        let helpers_grid = this.HeaderMenu('Grid', 'obj-header', '', false, false, false);
        helpers_grid.querySelector('.expand').addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        helpers_content.appendChild(helpers_grid);
        let grid_content = _el('div', '', ['sub-menu-content', 'hidden'], true);
        helpers_content.appendChild(grid_content);
        // Visibility
        let grid_visible = this.HeaderSwitch('Visible');
        grid_visible.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleGrid(evt));
        grid_content.appendChild(grid_visible);
        // Autosize
        let grid_autosize = this.HeaderSwitch('Auto-size');
        grid_autosize.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleAutoGrid(evt));
        grid_content.appendChild(grid_autosize);

        // 2.3) the controls: center
        let helpers_controls = this.HeaderMenu('Controls', 'obj-header', '', false, false, false);
        helpers_controls.querySelector('.expand').addEventListener('click', (evt) => this._eventToggleNextSibling(evt));
        helpers_content.appendChild(helpers_controls);
        let controls_content = _el('div', '', ['sub-menu-content', 'hidden'], true);
        helpers_content.appendChild(controls_content);
        
        let controls_centered = this.HeaderSwitch('Center on scene', '', false);
        controls_centered.querySelector('.switch-svg').addEventListener('click', (evt) => this._eventToggleCenteredControls(evt));
        controls_content.appendChild(controls_centered);

        settings.appendChild(helpers_content);

        return settings;
    }

    createPanel() {
        /**
         * The Panel has container which in turn has:
         *  the info icon 
         *      => provides desciption about the current scene
         *      => should be updated each time a new scenario is selected
         *  the dual screen icon
         *      => splits the screen in 2
         *      => one scenario per screen
         *  the legend icon
         *      => shows as many sublegends as are used in the main view
         */

        let panel = _el('div', 'panel');       

        let info = _el('div', 'panel-info', ['panel-icon']);
        info.addEventListener('click', (evt) => this._eventToggleInfo(evt));
        let svg_info = this.createSvg('info');
        svg_info.setAttribute('height', '22px');
        svg_info.setAttribute('width', '22px');
        info.appendChild(svg_info);
        panel.appendChild(info);
        
        let dual = _el('div', 'panel-dual', ['panel-icon']);
        let svg_dual = this.createSvg('dual');
        svg_dual.setAttribute('height', '20px');
        svg_dual.setAttribute('width', '20px');
        dual.appendChild(svg_dual);
        panel.appendChild(dual);

        let legend = _el('div', 'panel-legend', ['panel-icon']);
        let svg_legend = this.createSvg('legend');
        svg_legend.setAttribute('height', '22px');
        svg_legend.setAttribute('width', '22px');        
        legend.appendChild(svg_legend);
        legend.addEventListener('click', (evt) => {evt.target.classList.toggle('clicked');evt.target.querySelector('#legend-container').classList.toggle('hidden');});
        legend.appendChild(this.createLegend());
        panel.appendChild(legend);

        document.body.appendChild(panel);
    }

    createLegend() {
        /**
         * There are several categories of legend depending on the kpis:
         *  - rays
         *  - kpis of the heatmap
         */
        let container = _el('div', 'legend-container', ['hidden']);

        let head = _el('div', 'legend-head');
        head.innerText = 'Legend';
        container.appendChild(head);

        let body = _el('div', 'legend-body');
        // For each colormap, a title and a legendset. A loop here is in order :-)
        let title = _el('div','', ['title']);
        title.innerText = 'Body';
        body.appendChild(title);
        let clr_map = this._createLegendSet();
        /*
        let clr_map = _el('div', '', ['clrmap']);
        //clr_map.appendChild(this._SvgColormap());
        clr_map.appendChild(this._logoColorBox());
        */
        body.appendChild(clr_map);


        container.appendChild(body);

        return container;
    }    

    _createLegendSet() {
        /**
         * Inputs:
         *      - a color scheme 
         *      - a number of colors: n_colors 
         *      - a range of values => n_colors intervals
         */
        let clrmap = _el('div', '', ['clrmap']);

        let data = [
            {r: 12, g: 40, b: 80, txt: '0.127 to 0.291'},
            {r: 40, g: 12, b: 80, txt: '0.291 to 0.342'},
            {r: 12, g: 80, b: 40, txt: '0.342 to 0.572'},
            {r: 80, g: 40, b: 12, txt: '0.572 to 0.913'},
        ];
        for (let i=0; i<data.length; i++) {
            let d = data[i];
            let item = _el('div', '', ['clrmap-item-div']);
            let svg = this._logoColorBox(d.r, d.g, d.b);
            item.appendChild(svg);
            
            let text = _el('div', '', ['clrmap-text']);
            text.innerText = d.txt;
            item.appendChild(text);
    
            clrmap.appendChild(item);
        }

        return clrmap;
    }

    createModal() {
        /**
         * Handles loading the files and populating the menu-body
         */
        let modal = _el('div', '', ['modal']);

        let modal_content = _el('div', '', ['modal-content']);
        modal_content.appendChild(this._createModalHeader());
        modal_content.appendChild(this._createModalBody());
        modal_content.appendChild(this._createModalFooter());

        modal.appendChild(modal_content);
        document.body.appendChild(modal);
    }

    _createModalHeader() {
        /**
         * Modal header has the button to close it and the title with the description
         */
        let div = _el('div', '', ['modal-header']);
        // Close button
        let span = _el('span', '', ['close-button']);
        let svg = this.createSvg('close');        
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '32px');
        svg.setAttribute('height', '32px');
        span.appendChild(svg);
        span.addEventListener('click', () => this._eventCloseModal());
        div.appendChild(span);
        // Title
        let h2 = _el('h2', '', ['modal-title']);
        h2.innerText = 'Add Scenario';
        div.appendChild(h2);
        // Subitle
        let p = _el('p', '', []);
        p.innerText = 'select a directory below, then press the Upload button';
        div.appendChild(p);
        // Browser
        let browser = _el('div', 'div-scenario-loader');
        let input = _el('input', 'scenario-loader');
        input.setAttribute('type', 'file');
        input.setAttribute('name', 'filelist');
        input.setAttribute('webkitdirectory', '');
        input.setAttribute('directory', '');
        input.setAttribute('multiple', '');
        input.addEventListener('change', (evt) => this._eventShowFilesFromDirectory(evt));
        browser.appendChild(input);
        div.appendChild(browser);

        return div;
    }
    
    _createModalBody() {
        /**
         * This will contain the list of items representing the json files
         * and will be filled bu the _eventShowFilesFromDirectory
         */
        let div = _el('div', '', ['modal-body']);    
       
        return div;

    }

    __createModalBodyProgress() {
        /**
         * To be created just before the files are uploaded
         */
        let div = _get('.modal-body')[0];

        // clean up
        _cleanElement(div);

        // The total loading progress
        let container_total = _el('div', 'progress-total');
        /*
        // title
        let h = _el('h3');
        h.innerText = 'List of files to be loaded';
        container_total.appendChild(h);
        */
        // Create the ul with the total
        let ul_total = _el('ul');
        // and add a single li item
        let li_total = createProgressBarListItem('Total', 'h4');
        let span = li_total.getElementsByClassName('bar')[0];
        span.classList.add('bar-total');
        span.classList.remove('bar');
        ul_total.appendChild(li_total); 
        container_total.appendChild(ul_total);

        div.appendChild(container_total);

        // The per file loading progress, container for the files
        let container = _el('div', 'progress-group');
        // Create the ul with the individual parts but one at a time
        let ul = _el('ul', 'ul-files');
        container.appendChild(ul);

        let files = this._directory.files;
        if (this._directory.files.length > 0) {
            this.cgviz.data.selected = files[0].webkitRelativePath.split('/')[0];
            this.cgviz.data.scenarios[this.cgviz.data.selected] = {
                'qcmUniverse': {'objs': {}, 'mtl': null},
                'qcmPov': {},
                'qcmTrace': {},
                'qcmKpis': {}
            };
            let file_index = 0; // counts the files in the passed directory
            for (let i=0; i<files.length; i++) {
                let file = files[i];
                // ignoring the files in the subdirectories
                let pathParts = file.webkitRelativePath.split('/');
                if (pathParts.length > 2) {
                    continue;
                }
                let li = createProgressBarListItem(file.name, 'h4');
                li.id = file_index + '_' + file.name.split('.').pop(); // put the extension
                ul.appendChild(li);
                file_index += 1;
            }
        }

        div.appendChild(container);        
    }
    
    _createModalFooter() {
        /**
         * THis will contain the buttons
         */
        let div = _el('div', '', ['modal-footer']);
        
        // A button to cancel the operation
        let btn = _el('div', '', ['div-button', 'cancel']);
        let txt = _el('p', '', ['menu-text']);
        txt.innerText = 'Cancel';
        btn.addEventListener('click', () => this._eventCloseModal());
        btn.appendChild(txt)
        div.appendChild(btn);
        
        // A button to upload a scenario
        let upload = _el('div', '', ['div-button']);
        let txt_ul = _el('p', '', ['menu-text']);
        txt_ul.innerText = 'Upload';
        upload.addEventListener('click', () => this._eventUploadData());
        upload.appendChild(txt_ul)
        div.appendChild(upload);

        return div;

    }

    // EVENTS

    _eventShowHideMainMenu() {
        /**
         * This event toggle the visibility of the main menu
         * hence providing more space to interact with the 3D view when hidden
         */
        let m = _get('#menu-main');
        m.classList.toggle('hidden');
        
        let mct = _get('#menu-container');
        mct.classList.toggle('hidden');
        
        let mcsvg = _get('#svg-mc');
        if (m.classList.contains('hidden')) {
            mcsvg.style.transform = 'rotate(0deg)';
        } else {
            mcsvg.style.transform = 'rotate(180deg';
        }
    }

    _eventTabSelection(evt) {
        // Remove the current-tab from all except the click recipient
        let tabs = _get('.tab');
        for (let i=0; i<tabs.length; i++) {
            tabs[i].classList.remove('current-tab');            
        }
        // add it for the click target
        evt.target.classList.add('current-tab');
        // display the content of the corresponding menu
        let containers = _get('.container-tab-content');
        for (let i=0; i<containers.length; i++) {
            containers[i].classList.remove('visible');
            if (evt.target.id.includes(containers[i].id)) {
                containers[i].classList.add('visible');
            }
        }
    }

    _eventShowModal() {
        _get('.modal')[0].style.display = 'block';
        this._directory = null;
    }

    _eventCloseModal() {
        _get('.modal')[0].style.display = 'none';
        // TODO: clean the content
        let div = _get('.modal-body')[0];
        _cleanElement(div);        
    }

    _eventShowFilesFromDirectory(evt) {
        // Save the directory descriptor locally
        this._directory = evt.target;
        // Create a progress bar for each file
        this.__createModalBodyProgress();
    }

    _eventUploadData() {
        /**
         * This function is called when the upload button is pressed, 
         * after the list of files in the chosen directory has been read
         * 
         * Each file is loaded and processed by the appropriate handler
         * TODO: use promises instead of this _finishedYet solution
         */
        let self = this;
        console.log('loading data...');
        let files = this._directory.files;
        let threed = {'mtl': {}, 'objs': []}; // temporary structure to store the ref to obj files
        
        let li_total = document.getElementById('li_Total');
        let totalProgressVal = li_total.getElementsByClassName('value')[0];
        let totalProgressBar = li_total.getElementsByClassName('bar-total')[0].children[0];

        let ul = _get('#ul-files');
        let i_files = 0;
        let n_files = ul.children.length;
        for (let i=0; i<ul.children.length;i++) {
            let file = files[i];
            let li = ul.childNodes[i];
            let ext = li.id.split('_')[1];
            let url = files[li.id.split('_')[0]];
            if (ext === 'json') {                
                let file_reader = new FileReader();
                file_reader.readAsText(url);

                file_reader.onload = function(evt){
                    let this_file = JSON.parse(evt.target.result);
                    if (file.name.includes('qcmPov')) {
                        self.__handleQcmPov(this_file);
                    } else if (file.name.includes('qcmTrace')) {
                        self.__handleQcmTrace(this_file, file.webkitRelativePath);
                    } else if (file.name.includes('qcmKpis')) {
                        self.__handleQcmKpis(this_file);
                    }
                };
                
                file_reader.onprogress = function(xhr) {
                    let pCentValue = (xhr.loaded/xhr.total*100);
                    
                    li.getElementsByClassName('bar')[0].children[0].style.width = pCentValue + '%';
                    li.getElementsByClassName('value')[0].innerText = Math.round(pCentValue*100)/100 + '%';
                };
                
                file_reader.onloadend = function() {
                    li.getElementsByClassName('bar')[0].children[0].style.width = '100%';
                    li.getElementsByClassName('value')[0].innerText = '100%';
                    // update the total
                    i_files += 1;
                    console.log(' from json: ', i_files);
                    let pcValue = i_files/n_files*100;
                    totalProgressBar.style.width = pcValue + '%';
                    totalProgressVal.innerText = Math.round(pcValue*100)/100 + '%';
                    self._finishedYet(i_files, n_files);
                };
            } else if (ext === 'obj') {
                threed.objs.push({'li': li, 'file': url});
                self.cgviz.data.scenarios
            } else if (ext === 'mtl') {
                threed.mtl = {'li': li, 'file': url};
            }            
        } 
        // Handling the mtl and obj files separately
        // I assume there is only one mtl object
        if (threed.mtl.file !== undefined) {
            let mtl_reader = new FileReader();
            mtl_reader.readAsText(threed.mtl.file);
            let li = threed.mtl.li;
            mtl_reader.onload = function(evt) {
                let mtl = new THREE.MTLLoader().parse(evt.target.result);
                //mtl.setMaterialOptions({side: THREE.DoubleSide});
                self.__handleMtl(mtl)
            };
            mtl_reader.onprogress = function(xhr) {
                let pCentValue = (xhr.loaded/xhr.total*100);            
                threed.mtl.li.getElementsByClassName('bar')[0].children[0].style.width = pCentValue + '%';
                threed.mtl.li.getElementsByClassName('value')[0].innerText = Math.round(pCentValue*100)/100 + '%';
            };
            mtl_reader.onloadend = function() {
                threed.mtl.li.getElementsByClassName('bar')[0].children[0].style.width = '100%';
                threed.mtl.li.getElementsByClassName('value')[0].innerText = '100%';
                i_files += 1;
                console.log(' from mtl: ', i_files);
                let pcValue = i_files/n_files*100;
                totalProgressBar.style.width = pcValue + '%';
                totalProgressVal.innerText = Math.round(pcValue*100)/100 + '%';
                self._finishedYet(i_files, n_files);
            };
        }
        // I assume there is only one obj object
        for (let i=0; i<threed.objs.length; i++) {
            let obj_reader = new FileReader();
            obj_reader.readAsText(threed.objs[i].file);
            obj_reader.onload = function(evt) {
                let obj = new THREE.OBJLoader().parse(evt.target.result);
                obj.name = threed.objs[i].file.name;
                self.__handleObj(obj)
            };
            obj_reader.onprogress = function(xhr) {
                let pCentValue = (xhr.loaded/xhr.total*100);            
                threed.objs[i].li.getElementsByClassName('bar')[0].children[0].style.width = pCentValue + '%';
                threed.objs[i].li.getElementsByClassName('value')[0].innerText = Math.round(pCentValue*100)/100 + '%';
            };
            obj_reader.onloadend = function() {
                threed.objs[i].li.getElementsByClassName('bar')[0].children[0].style.width = '100%';
                threed.objs[i].li.getElementsByClassName('value')[0].innerText = '100%';
                i_files += 1;
                console.log(' from obj: ', i_files);
                let pcValue = i_files/n_files*100;
                totalProgressBar.style.width = pcValue + '%';
                totalProgressVal.innerText = Math.round(pcValue*100)/100 + '%';
                self._finishedYet(i_files, n_files);
            };
        }
    }

    _finishedYet(i_files, n_files) {
        /**
         * When all the loading is done, the menu and 3d structures can be created
         */
        if (i_files === n_files) {
            console.log('done');
            let scenarioName = this.cgviz.data.selected;
            this.cgviz.getRaysRange(scenarioName);
            this.cgviz.setupGroups(scenarioName);
            this.__populateMenuScenariosContent();
        }
    }

    __handleMtl(thisFile) {
        let qcmUniverse = this.cgviz.data.scenarios[this.cgviz.data.selected].qcmUniverse;
        qcmUniverse.mtl = thisFile;
    }

    __handleObj(thisFile) {
        let selected = this.cgviz.data.selected;
        let qcmUniverse = this.cgviz.data.scenarios[selected].qcmUniverse;
        qcmUniverse.objs[thisFile.name] = thisFile;
        // Find the limits of the scene in order to display a plane..
        this.cgviz.data.scenarios[selected].limits = this.cgviz.findCenter(selected);
    }

    __handleQcmPov(thisFile) {
        // the file name is typically built like so: qcmPov.Rx22.json but it has a tag with its name
        //data.scenarios[dir_name].qcmPov[thisFile.tag] = thisFile;
        // split the name in 2 parts: pov type & id
        // ex Rx01 becomes 'Rx' & '01'  
        let qcmPov = this.cgviz.data.scenarios[this.cgviz.data.selected].qcmPov;
        let pov_type = thisFile.tag.replace(/[0-9]/g, '');
        let pov_id = thisFile.tag.replace(/\D/g,'');
        if (!qcmPov.hasOwnProperty(pov_type)) {
            qcmPov[pov_type] = {};
        }
        qcmPov[pov_type][pov_id] = thisFile;
    }

    __handleQcmTrace(thisFile, fileParts) {
        // the file name can be built in various ways:
        //   - qcmTrace.Tx01-Rx17.json
        //   - qcmTrace.BS-1-UE-1.json
        //   - qcmTrace.BS1-MS1.json
        //   - qcmTrace.PoleArray-1-UE-1.json
        // we count the number of parts separated by - of the 2nd element (the central part between qcmTrace and json)
        let qcmTrace = this.cgviz.data.scenarios[this.cgviz.data.selected].qcmTrace;

        let pathParts = fileParts.split('/');
        let filename = pathParts[1];
        let filenameParts = filename.split('.');
        let centralPart = filenameParts[1].split('-');
        let txId, rxId;
        if (centralPart.length==2) {
            txId = centralPart[0];
            rxId = centralPart[1];
        } else if (centralPart.length==4) {
            txId = centralPart[0] + '-' + centralPart[1];
            rxId = centralPart[2] + '-' + centralPart[3];
        } else {
            alert('the number of components in the name is not as expected :-S')
        }
        // Save the data across 2 levels: txId then rxId
        if (!qcmTrace.hasOwnProperty(txId)) {
            qcmTrace[txId] = {};
        }
        qcmTrace[txId][rxId] = thisFile;
    }

    __handleQcmKpis(thisFile) {

    }

    _eventToggleNextSibling(evt) {
        // add/remove the hidden key word to the target's classList
        // the target is in the *-header
        // the element to hide is the following *-content
        evt.target.parentNode.nextSibling.classList.toggle('hidden');
        // Applying a rotation
        let svg = evt.target.querySelector('svg');
        if (evt.target.parentNode.nextSibling.classList.contains('hidden')) {
            svg.setAttribute('transform', 'rotate(0)');
        } else {
            svg.setAttribute('transform', 'rotate(180)');
        }
    }

    _eventToggleObj(evt) {
        // REMOVE as it is replaced by _eventToggleUniverse
        // toggle icon between eye-open to eye-closed
        // show object
        this.cgviz.toggleObj();
    }

    _eventToggleEntireUniverse(evt) {
        /**
         * Toggle all the obj included in the universe
         */
    }

    _eventToggleUniverse(evt) {
        evt.target.classList.toggle('clicked');
        let scenarioName = evt.target.parentNode.parentNode.parentNode.previousSibling.id;
        let objectName = evt.target.nextSibling.innerText;
        this.cgviz.toggleUniverse(scenarioName, objectName);
        log.info(`Scenario: ${scenario} - Object: ${objectName}`);
    }

    _eventTogglePov(evt) {
        /**
         * Toggle a specific pov
         */
        evt.target.classList.toggle('clicked');
        // Get the name components
        let scenario = evt.target.parentNode.parentNode.parentNode.previousSibling.id;
        let povType = evt.target.parentNode.previousSibling.querySelector('.header-text').innerText;
        let povId = evt.target.querySelector('span').innerText;
        this.cgviz.togglePov(scenario, povType, povId);
        log.info(`Scenario: ${scenario} - PoV type: ${povType} - PoV Id: ${povId}`);
    }

    _eventTogglePovs(evt) {
        /**
         * Toggle all the povs of a certain type
         */
        evt.target.classList.toggle('clicked'); // to let the eye colored
        // toggle all the povs in the scene
        let scenario = evt.target.parentNode.parentNode.parentNode.previousSibling.id;
        let povType = evt.target.parentNode.querySelector('.header-text').innerText;
        this.cgviz.togglePovs(scenario, povType);
        // mark the subcontent as clicked
        let children = evt.target.parentNode.nextSibling.childNodes;
        for (let i=0; i<children.length; i++) {
            children[i].classList.toggle('clicked');
        }
    }

    _eventToggleAllPovs(evt) {
        /**
         * Toggle all the povs
         */
        evt.target.classList.toggle('clicked'); // to let the eye colored
        let scenario = evt.target.parentNode.parentNode.previousSibling.id;
        this.cgviz.toggleAllPovs(scenario);
        // select all the povs types
        let eyesDom = evt.target.parentNode.nextSibling.querySelectorAll('.eye');
        for (let i=0; i<eyesDom.length; i++) {
            eyesDom[i].classList.toggle('clicked');
            // DRY warning!!! This is the same as in _eventTogglePovs !
            let children = eyesDom[i].parentNode.nextSibling.childNodes;
            for (let i=0; i<children.length; i++) {
                children[i].classList.toggle('clicked');
            }            
        }
    }

    _eventToggleTrace(evt) {
        evt.target.classList.toggle('clicked');
        let tx_pov = evt.target.parentNode.previousSibling.querySelector('.header-text').innerText;
        let rx_pov = evt.target.querySelector('span').innerText;
        this.cgviz.toggleRays(tx_pov, rx_pov);
    }

    _eventToggleRaysBetweenPovs(evt) {
        /**
         * Toggle all rays between the specific txpov and rxpov
         */
        evt.target.classList.toggle('clicked');
        let scenario = evt.target.parentNode.parentNode.parentNode.previousSibling.id;
        let tx_pov = evt.target.parentNode.previousSibling.querySelector('.header-text').innerText;
        let rx_pov = evt.target.querySelector('span').innerText;
        this.cgviz.toggleRaysBetweenPovs(scenario, tx_pov, rx_pov);
    }

    _eventToggleAllRaysFromPovId(evt) {
        /**
         * Toggle all rays strting from this txPovId
         */
        evt.target.classList.toggle('clicked');
        let scenario = evt.target.parentNode.parentNode.parentNode.previousSibling.id;
        let txPovId = evt.target.parentNode.querySelector('.header-text').innerText;
        this.cgviz.toggleAllRaysFromPovId(scenario, txPovId);
        // mark the subcontent as clicked
        let children = evt.target.parentNode.nextSibling.childNodes;
        for (let i=0; i<children.length; i++) {
            children[i].classList.toggle('clicked');
        }
    }

    _eventToggleAllRays(evt) {
        /**
         * Toggle all rays from all txpov to all rxpov
         */
        evt.target.classList.toggle('clicked');
        let scenario = evt.target.parentNode.parentNode.previousSibling.id;
        this.cgviz.toggleAllRays(scenario);
        // select all the povs types
        let eyesDom = evt.target.parentNode.nextSibling.querySelectorAll('.eye');
        for (let i=0; i<eyesDom.length; i++) {
            eyesDom[i].classList.toggle('clicked');
            // DRY warning!!! This is the same as in _eventTogglePovs !
            let children = eyesDom[i].parentNode.nextSibling.childNodes;
            for (let i=0; i<children.length; i++) {
                children[i].classList.toggle('clicked');
            }            
        }
    }

    _eventToggleGroundPlane(evt) {
        // Here we should find out the scenario name and pass it
        this.cgviz.toggleGroundPlane();
    }

    _eventCaptureScreen() {
        /**
         * from: https://stackoverflow.com/questions/26193702/three-js-how-can-i-make-a-2d-snapshot-of-a-scene-as-a-jpg-image
         * 
         * TODO: add on screen information about the scenario etc
         * 
         */
        let imgData, imgNode;
        let strDownloadMime = "image/octet-stream";

        let cdt = currentDateTime();

        try {
            var strMime = "image/jpeg";
            imgData = this.cgviz.renderer.domElement.toDataURL(strMime);
            //let filename = 'cg-viz-lite_screenshot_' + cdt + '.jpg';
            let filename = `cg-viz-lite_screenshot_${cdt}.jpg`;
            saveFile(imgData.replace(strMime, strDownloadMime), filename);
        } catch (e) {
            console.log(e);
            return;
        }

        function saveFile(strData, filename) {
            var link = document.createElement('a');
            if (typeof link.download === 'string') {
                document.body.appendChild(link); //Firefox requires the link to be in the body
                link.download = filename;
                link.href = strData;
                link.click();
                document.body.removeChild(link); //remove the link when done
            } else {
                location.replace(uri);
            }        
        }

        function currentDateTime() {
            let now = new Date();

            let year = now.getFullYear();
            let month = now.getMonth() + 1;
            let date = now.getDate();
            let hours = now.getHours();
            let min = now.getMinutes();
            let sec = now.getSeconds();

            let cdt = '';
            cdt += year + '-';
            cdt += (month<10 ? '0' : '') + month + '-';
            cdt += (date<10 ? '0' : '') + date + '_';
            cdt += (hours<10 ? '0' : '') + hours + '-';
            cdt += (min<10 ? '0' : '') + min + '-';
            cdt += (sec<10 ? '0' : '') + sec + '-';

            return cdt;
        }
    }

    _eventToggleInfo(evt) {
        // Removing style if found. This comes hidden from cgviz
        let info = document.getElementById('info');
        if (info.style.display !== null) {
            info.style.display = null;
        }
        if (info.style.left !== null) {
            info.style.left = null;
        }
        document.getElementById('info').classList.toggle('shown');
        evt.target.classList.toggle('clicked');
    }

    _eventToggleSwitch(evt) {
        /**
         * Change the switch svg icon from open to closed
         */
        let icon = evt.target;
        if (icon.querySelector('svg').classList.contains('ON')) {
            // remove the ON icon and replace it with the OFF
            icon.removeChild(icon.querySelector('svg'));
            icon.appendChild(this.createSvg('switch-off'));
        } else {
            // remove the OFF icon and replace it with the ON
            icon.removeChild(icon.querySelector('svg'));
            icon.appendChild(this.createSvg('switch-on'));
        }        
    }

    _eventToggleAxes(evt) {
        // change the svg
        this._eventToggleSwitch(evt);
        // toggle the axes visibility
        this.cgviz.params.helpers.axes.show = !this.cgviz.params.helpers.axes.show;
        // invoke the function
        this.cgviz.createHelpers();
    }

    _eventToggleAxesArrows(evt) {
        // change the svg
        this._eventToggleSwitch(evt);
        // toggle the axes visibility
        this.cgviz.params.helpers.axes.use_arrows = !this.cgviz.params.helpers.axes.use_arrows;
        // invoke the function
        this.cgviz.createHelpers();
    }

    _eventToggleGrid(evt) {
        // change the svg
        this._eventToggleSwitch(evt);
        // toggle the axes visibility
        this.cgviz.params.helpers.grid.show = !this.cgviz.params.helpers.grid.show;
        // invoke the function
        this.cgviz.createHelpers();
    }

    _eventToggleAutoGrid(evt) {
        // change the svg
        this._eventToggleSwitch(evt);
        // Adjust the size of the grid such that its footprint is 10% bigger than that of the group
        log.info('Autosizing the grid..TBD');
    }

    _eventToggleCenteredControls(evt) {
        // change the svg
        this._eventToggleSwitch(evt);
        // toggle the axes visibility
        this.cgviz.params.camera.center_on_scene = !this.cgviz.params.camera.center_on_scene;
        this.cgviz.centerOnScene();
        // invoke the function
        this.cgviz.createHelpers();
    }    

    _eventToggleTooltip(evt) {
        /**
         * Toggle mouse-based tooltip
         *  different levels of information can be shown
         */
        // change the svg
        this._eventToggleSwitch(evt);

    }

    // SVG and ICONS

    createSvg(name) {        
        let svg;

        switch (name) {
            case 'cgviz':
                svg = this._logoCgViz();
                break;
            case 'scenarios': 
                svg = this._logoScenarios();
                svg.classList.add('svg-logo');                
                break;
            case 'filters': 
                svg = this._logoFilters();
                svg.classList.add('svg-logo');
                break;
            case 'interactions': 
                svg = this._logoInteractions();
                svg.classList.add('svg-logo');
                break;
            case 'settings': 
                svg = this._logoSettings();
                svg.classList.add('svg-logo');
                break;
            case 'bug': 
                svg = this._logoBug();
                break;
            case 'share': 
                svg = this._logoShare();
                break;
            case 'camera': 
                svg = this._logoCamera();
                break;
            case 'info': 
                svg = this._logoInfo();
                break;
            case 'legend': 
                svg = this._logoLegend();
                break;
            case 'dual': 
                svg = this._logoDual();
                break;
            case 'add': 
                svg = this._logoAdd();
                break;
            case 'delete': 
                svg = this._logoDelete();
                break;
            case 'close': 
                svg = this._logoClose();
                break;
            case 'reduce': 
                svg = this._logoReduce();
                break;
            case 'down': 
                svg = this._logoDown();
                break;
            case 'dots': 
                svg = this._logoDots();
                break;
            case 'folder': 
                svg = this._logoFolder();
                break;
            case 'show_hide': 
                svg = this._logoShowHide();
                svg.setAttribute('id', 'svg-mc');
                break;
            case 'eye_open': 
                svg = this._logoEyeOpen();
                break;
            case 'eye_closed': 
                svg = this._logoEyeClosed();
                break;
            case 'grab': 
                svg = this._logoGrab();
                break;
            case 'switch-on': 
                svg = this._logoSwitchOn();
                break;
            case 'switch-off':
                svg = this._logoSwitchOff();
                break;
        }

        svg.appendChild(this._createInvisibleRect());

        return svg;
    }

    _logoCgViz() {
        let svg = this._svgTemplate({'width': '32px', 'height': '32px'});

        let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.setAttribute('style', "fill: #1FBAD6");
        circle.setAttribute('cx', "32");
        circle.setAttribute('cy', "20");
        circle.setAttribute('r', "16");

        let circle1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle1.setAttribute('style', "fill: #535C6C");
        circle1.setAttribute('cx', "32");
        circle1.setAttribute('cy', "62");
        circle1.setAttribute('r', "10");
        
        svg.appendChild(circle);
        svg.appendChild(circle1);        

        return svg;
    }

    _logoScenarios() {
        let svg = this._svgTemplate();
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M50.88,43.52a3.2,3.2,0,0,1,0,5.86L34.56,56.52a6.42,6.42,0,0,1-5.13,0L13.12,49.37a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05,16.32,7.14a3.19,3.19,0,0,0,2.56,0L49.6,46.44l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95Zm0-14.39a3.2,3.2,0,0,1,0,5.86L34.56,42.13a6.42,6.42,0,0,1-5.13,0L13.12,35a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05L30.72,39.2a3.19,3.19,0,0,0,2.56,0L49.6,32.06l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95ZM13.12,20.6a3.2,3.2,0,0,1,0-5.86L29.44,7.6a6.39,6.39,0,0,1,5.13,0l16.32,7.14a3.2,3.2,0,0,1,0,5.86L34.56,27.74a6.39,6.39,0,0,1-5.13,0Z');
        svg.appendChild(path);
        
        return svg;
    }

    _logoFilters() {
        let svg = this._svgTemplate();
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M52.5,19.67l-16,20h0a6.24,6.24,0,0,0-1.37,3.9V57L30.6,54.74a3.12,3.12,0,0,1-1.73-2.79V43.58h0a6.24,6.24,0,0,0-1.37-3.9l-16-20a5,5,0,0,1-1.35-3.24c0-5.17,9.78-9.36,21.85-9.36s21.85,4.19,21.85,9.36A5,5,0,0,1,52.5,19.67Zm-20.5,3c8.62,0,15.61-2.79,15.61-6.24s-7-6.24-15.61-6.24S16.39,13,16.39,16.43,23.38,22.67,32,22.67Z');
        svg.appendChild(path);
        
        return svg;
    }

    _logoInteractions() {
        let svg = this._svgTemplate();
        
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "scale(1.2, 1.2) translate(0, 2)");
        let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute('points', '22.5,11.1 27.6,43.9 35.3,37.3 43,49 48.8,45 41,33.2 49,28.3');
        g.appendChild(polygon);
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M21.2,27.8C14.5,26.6,9.8,20.7,9.8,14c0-7.7,6.3-14,14-14s14,6.3,14,14c0,0.8-0.1,1.5-0.2,2.3l-2.5-0.4 c0.1-0.6,0.2-1.3,0.2-1.8c0-6.4-5.2-11.5-11.5-11.5S12.3,7.7,12.3,14c0,5.5,3.9,10.3,9.4,11.4L21.2,27.8z');
        g.appendChild(path);
        svg.appendChild(g);  
        
        return svg;
    }

    _logoSettings() {
        let svg = this._svgTemplate();
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M32.2,52.32a6.24,6.24,0,0,0,12.09,0h9.56a1.56,1.56,0,0,0,0-3.12H44.29a6.24,6.24,0,0,0-12.09,0h-22a1.56,1.56,0,0,0,0,3.12ZM16.59,33.59a6.24,6.24,0,0,0,12.09,0H53.85a1.56,1.56,0,0,0,0-3.12H28.68a6.24,6.24,0,0,0-12.09,0H10.15a1.56,1.56,0,1,0,0,3.12ZM35.32,11.74H10.15a1.56,1.56,0,1,0,0,3.12H35.32a6.24,6.24,0,0,0,12.09,0h6.44a1.56,1.56,0,0,0,0-3.12H47.41a6.24,6.24,0,0,0-12.09,0Z');
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "translate(3, 4) scale(0.9, 0.9)");
        g.appendChild(path);
        svg.appendChild(g); 
        
        return svg;
    }

    _logoBug() {
        let svg = this._svgTemplate();
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M32 8.333C26.698 8.333 22.4 13 22.4 19h19.2c0-6-4.298-10.667-9.6-10.667z');
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path1.setAttribute('d', 'M53.6 32H46v-6.506c0-.074.184-.142.18-.215l5.417-5.907c.937-1.042.987-2.73.05-3.772-.937-1.041-2.432-1.041-3.369 0l-5.304 5.664c-.066-.004-.115-.264-.181-.264H21.207c-.066 0-.128.26-.193.264l-5.317-5.785c-.937-1.042-2.457-.981-3.394.06-.937 1.042-.937 2.76 0 3.802l5.516 5.923c-.003.072.181.156.181.23V32h-7.6C9.075 32 8 33.027 8 34.5S9.075 37 10.4 37h7.2c0 3 .375 4.299 1.025 6.12-.105.084-.227.253-.322.359l-6.788 7.603c-.937 1.041-.937 2.76 0 3.802.937 1.04 2.457 1.056 3.394.015l6.443-6.93C23.494 50.693 26 52.619 30 53.246V27h4v26.246c4-.626 6.506-2.545 8.648-5.27l6.343 6.938a2.29 2.29 0 0 0 3.444 0c.937-1.041.962-2.73.025-3.771L45.684 43.6c-.094-.105-.21-.396-.316-.48C46.018 41.298 46.4 40 46.4 37h7.2c1.325 0 2.4-1.027 2.4-2.5S54.925 32 53.6 32z');
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.appendChild(path);
        g.appendChild(path1);
        svg.appendChild(g);
        
        return svg;
    }

    _logoShare() {
        let svg = this._svgTemplate();
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M49.26,56.17H14.74a6.91,6.91,0,0,1-6.91-6.91V32a3.45,3.45,0,1,1,6.91,0V49.26H49.26V32a3.45,3.45,0,1,1,6.91,0V49.26A6.91,6.91,0,0,1,49.26,56.17Z');
        
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path1.setAttribute('d', 'M44.81,24.08a3.5,3.5,0,0,1-4.9,0l-4.45-4.45V35.44a3.45,3.45,0,0,1-6.91,0V19.62l-4.45,4.45a3.5,3.5,0,0,1-4.9,0,3.44,3.44,0,0,1,0-4.87L29.55,8.85a6,6,0,0,1,.52-.45,2.61,2.61,0,0,1,.62-.31,3.45,3.45,0,0,1,2.62,0,2.61,2.61,0,0,1,.62.31,6,6,0,0,1,.52.45L44.81,19.21A3.44,3.44,0,0,1,44.81,24.08Z');
        
        svg.appendChild(path);
        svg.appendChild(path1);

        return svg;
    }

    _logoCamera() {
        // Looks bad...
        let svg = this._svgTemplate({viewBox: '0 0 96 96'});
        
        let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.setAttribute('cx', '48');
        circle.setAttribute('cy', '50.8');
        circle.setAttribute('r', '38');

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M39.8,23.3l-5,5.5H26c-3,0-5.5,2.5-5.5,5.5v33c0,3,2.5,5.5,5.5,5.5h44c3,0,5.5-2.5,5.5-5.5v-33c0-3-2.5-5.5-5.5-5.5h-8.7l-5-5.5H39.8z M48,64.5c-7.6,0-13.8-6.2-13.8-13.8S40.4,37,48,37s13.8,6.2,13.8,13.8S55.6,64.5,48,64.5z');        
        svg.appendChild(path);

        return svg;
    }

    _logoInfo() {
        let svg = this._svgTemplate();
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M23.62,23.41a1,1,0,0,1,.39.08,1,1,0,0,0-.78,0A1,1,0,0,1,23.62,23.41Z');
        svg.appendChild(path);
        
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path1.setAttribute('d', 'M32,57.5A24.83,24.83,0,1,1,56.83,32.67,24.86,24.86,0,0,1,32,57.5Zm0-44.86a20,20,0,1,0,20,20A20,20,0,0,0,32,12.64Z');
        svg.appendChild(path1);
        
        let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect1.setAttribute('x', "28.8");
        rect1.setAttribute('y', "29.46");
        rect1.setAttribute('width', "6.41");
        rect1.setAttribute('height', "16.02");
        rect1.setAttribute('rx', "1.6");
        rect1.setAttribute('ry', "1.6");
        svg.appendChild(rect1);
        
        let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect2.setAttribute('x', "28.8");
        rect2.setAttribute('y', "19.85");
        rect2.setAttribute('width', "6.41");
        rect2.setAttribute('height', "6.41");
        rect2.setAttribute('rx', "1.6");
        rect2.setAttribute('ry', "1.6");
        svg.appendChild(rect2);
        
        return svg;
    }

    _logoLegend() {
        let svg = this._svgTemplate({'width': '22px', 'height': '22px'});
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M29.78,45.89v5.56H46.44V45.89Zm-11.11,0v5.56h5.56V45.89ZM29.78,34.78v5.56H46.44V34.78Zm-11.11,0v5.56h5.56V34.78ZM29.78,23.67v5.56H46.44V23.67Zm-11.11,0v5.56h5.56V23.67ZM29.78,12.56v5.56H46.44V12.56Zm-11.11,0v5.56h5.56V12.56ZM15.89,7H49.22A2.78,2.78,0,0,1,52,9.78V54.22A2.78,2.78,0,0,1,49.22,57H15.89a2.78,2.78,0,0,1-2.78-2.78V9.78A2.78,2.78,0,0,1,15.89,7Z');
        svg.appendChild(path);

        return svg;
    }

    _logoDual() {
        let svg = this._svgTemplate({'width': '18px', 'height': '18px'});
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M19.5,47.4137931 C19.5,48.8421157 20.6192881,50 22,50 C23.3807119,50 24.5,48.8421157 24.5,47.4137931 L24.5,2.5862069 C24.5,1.15788427 23.3807119,0 22,0 C20.6192881,0 19.5,1.15788427 19.5,2.5862069 L19.5,47.4137931 Z');
        
        let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect1.setAttribute('x', '0');
        rect1.setAttribute('y', '4');
        rect1.setAttribute('width', '44');
        rect1.setAttribute('height', '5');
        rect1.setAttribute('rx', '2.5');
        
        let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect2.setAttribute('transform', "translate(2.500000, 24.500000) rotate(90.000000) translate(-2.500000, -24.500000)");
        rect2.setAttribute('x', '-18');
        rect2.setAttribute('y', '22');
        rect2.setAttribute('width', '41');
        rect2.setAttribute('height', '5');
        rect2.setAttribute('rx', '2.5');
        
        let rect3 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect3.setAttribute('transform', "translate(41.500000, 25.000000) rotate(90.000000) translate(-41.500000, -25.000000)");
        rect3.setAttribute('x', '20.5');
        rect3.setAttribute('y', '22.5');
        rect3.setAttribute('width', '42');
        rect3.setAttribute('height', '5');
        rect3.setAttribute('rx', '2.5');
        
        let rect4 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect4.setAttribute('x', '0');
        rect4.setAttribute('y', '41');
        rect4.setAttribute('width', '44');
        rect4.setAttribute('height', '5');
        rect4.setAttribute('rx', '2.5');

        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "translate(7.500000, 7.500000)");
        g.appendChild(path);
        g.appendChild(rect1);
        g.appendChild(rect2);
        g.appendChild(rect3);
        g.appendChild(rect4);
        svg.appendChild(g);    
      
        return svg;
    }

    _logoAdd() {
        let svg = this._svgTemplate({'width': '12px', 'height': '12px'});
        
        svg.setAttribute('margin-right', '8px');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M35.93,28.57V9.89a1,1,0,0,0-1-1h-5.9a1,1,0,0,0-1,1V28.57H9.39a1,1,0,0,0-1,1v5.9a1,1,0,0,0,1,1H28.07V55.11a1,1,0,0,0,1,1h5.9a1,1,0,0,0,1-1V36.43H54.61a1,1,0,0,0,1-1v-5.9a1,1,0,0,0-1-1Z');
        svg.appendChild(path);
        
        return svg;
    }

    _logoDelete() {
        let svg = this._svgTemplate({'width': '18px', 'height': '18px'});       

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M51.4,13.9v1.6c0,0.9-0.7,1.6-1.6,1.6H13.6c-0.9,0-1.6-0.7-1.6-1.6v-1.6c0-0.9,0.7-1.6,1.6-1.6h9 c0.9,0,1.6-0.7,1.6-1.6C24.3,9.7,25.1,9,26,9h11.5c0.9,0,1.6,0.7,1.6,1.6c0,0.9,0.7,1.6,1.6,1.6h9C50.7,12.3,51.4,13,51.4,13.9z');
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path1.setAttribute('d', 'M40.8,50.1l0.8-25.4h-3.3l-0.8,25.4H40.8z M30.1,50.1h3.3V24.7h-3.3V50.1z M26,50.1l-0.8-25.4h-3.3l0.8,25.4H26 z M44.9,55H18.5c-0.9,0-1.6-0.7-1.6-1.6l-1.5-31.2c0-0.9,0.7-1.7,1.6-1.7h29.4c0.9,0,1.7,0.8,1.6,1.7l-1.5,31.2 C46.5,54.3,45.8,55,44.9,55z');
        svg.appendChild(path);
        svg.appendChild(path1);        
        
        return svg;
    }

    _logoClose() {
        let svg = this._svgTemplate();       

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); 
        path.setAttribute('d', 'M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z');
        svg.appendChild(path);        
        
        return svg;
    }

    _logoClose() {
        /**
         * overwrites the above since it rocks!
         */
        let svg = this._svgTemplate();  

        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "translate(8, 8)");
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M31.5059707,24 L47.5987718,7.90719891 C48.1337427,7.37222791 48.1337427,6.50972364 47.5987718,5.97475264 L42.0252474,0.40122825 C41.4902764,-0.13374275 40.6277721,-0.13374275 40.0928011,0.40122825 L24,16.4940293 L7.90719891,0.40122825 C7.37222791,-0.13374275 6.50972364,-0.13374275 5.97475264,0.40122825 L0.40122825,5.97475264 C-0.13374275,6.50972364 -0.13374275,7.37222791 0.40122825,7.90719891 L16.4940293,24 L0.40122825,40.0928011 C-0.13374275,40.6277721 -0.13374275,41.4902764 0.40122825,42.0252474 L5.97475264,47.5987718 C6.50972364,48.1337427 7.37222791,48.1337427 7.90719891,47.5987718 L24,31.5059707 L40.0928011,47.5987718 C40.6277721,48.1337427 41.4902764,48.1337427 42.0252474,47.5987718 L47.5987718,42.0252474 C48.1337427,41.4902764 48.1337427,40.6277721 47.5987718,40.0928011 L31.5059707,24 Z');
        g.appendChild(path);
        svg.appendChild(g);

        return svg;
    }

    _logoReduce() {
        let svg = this._svgTemplate({'width': '16px', 'height': '16px'});  

        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "translate(8, 8)");
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M16.127688,49.4434399 L0.686714703,34.0024666 C-0.228904901,33.086847 -0.228904901,31.6023343 0.686714703,30.6867147 C1.12641074,30.2470187 1.72276655,30 2.34459065,30 L17.785564,30 C19.0804456,30 20.1301546,31.049709 20.1301546,32.3445907 L20.1301546,47.785564 C20.1301546,49.0804456 19.0804456,50.1301546 17.785564,50.1301546 C17.1637399,50.1301546 16.5673841,49.883136 16.127688,49.4434399 Z');
        g.appendChild(path);

        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path1.setAttribute('d', 'M45.127688,19.4434399 L29.6867147,4.0024666 C28.7710951,3.086847 28.7710951,1.60233431 29.6867147,0.686714703 C30.1264107,0.247018663 30.7227665,-8.17124146e-14 31.3445907,-8.17124146e-14 L46.785564,-7.7547585e-14 C48.0804456,-7.7547585e-14 49.1301546,1.04970899 49.1301546,2.34459065 L49.1301546,17.785564 C49.1301546,19.0804456 48.0804456,20.1301546 46.785564,20.1301546 C46.1637399,20.1301546 45.5673841,19.883136 45.127688,19.4434399 Z');
        path1.setAttribute('transform', 'translate(39.065077, 10.065077) rotate(-180.000000) translate(-39.065077, -10.065077)');
        g.appendChild(path1);

        svg.appendChild(g);

        return svg;
    }

    _logoDown() {
        let svg = this._svgTemplate({'width': '18px', 'height': '18px'});       

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M53,26.21l-4.2-4.3a1,1,0,0,0-1.4,0L32,37.67,16.61,21.92a1,1,0,0,0-1.4,0L11,26.21a1,1,0,0,0,0,1.43L27.1,44.11l4.2,4.3a1,1,0,0,0,1.4,0l4.2-4.3L53,27.65a1,1,0,0,0,0-1.43');
        svg.appendChild(path)        
        
        return svg;
    }

    _logoDots() {
        let svg = this._svgTemplate({'width': '18px', 'height': '18px'});       

        let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect1.setAttribute('x', "28");
        rect1.setAttribute('y', "44");
        rect1.setAttribute('width', "8");
        rect1.setAttribute('height', "8");
        svg.appendChild(rect1);
        
        let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect2.setAttribute('x', "28");
        rect2.setAttribute('y', "28");
        rect2.setAttribute('width', "8");
        rect2.setAttribute('height', "8");
        svg.appendChild(rect2);
        
        let rect3 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect3.setAttribute('x', "28");
        rect3.setAttribute('y', "12");
        rect3.setAttribute('width', "8");
        rect3.setAttribute('height', "8");
        svg.appendChild(rect3);        
        
        return svg;
    }

    _logoFolder() {
        let svg = this._svgTemplate({'viewBox': '0 0 128 128', 'width': '32px', 'height': '32px'});       

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M928.6,349.4h-13.4v-97.8c0-33.9-27.5-61.4-61.4-61.4H470.3v-55.6c0-33.9-27.5-61.4-61.4-61.4H71.4c-33.9,0-61.4,27.5-61.4,61.4v730.7c0,33.9,27.5,61.4,61.4,61.4h782.5c4.4,0,50.9-18.6,61.4-61.4L990,410.8C990,376.9,962.5,349.4,928.6,349.4L928.6,349.4z M74.8,194.4c0-33.9,12.1-46,46-46h257.4c33.9,0,46,12.1,46,46v71h1.9h44.1h325.6c33.9,0,46,12.1,46,46v38.1h-677c-33.9,0-55.3,16.7-61.4,61.4L74.8,597.4V194.4z M841.9,821.3c-11.9,35.9-12.1,46-46,46H120.8c-33.9,0-46-12.1-46-46L149.6,463c9.3-34.6,12.1-46,46-46h675.1c33.9,0,53.2,11.2,46,46L841.9,821.3L841.9,821.3z');
        svg.appendChild(path)        
        
        return svg;
    }

    _logoShowHide() {
        let svg = this._svgTemplate({'width': '18px', 'height': '12px'});       

        //svg.setAttribute('style', 'transform: rotate(180deg)'); // if starts open
        svg.setAttribute('style', 'transform: rotate(0deg)'); // if starts closed
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M26.7,54.7l-4.5-4.4c-0.4-0.4-0.4-1,0-1.4L38.6,33L22.2,17c-0.4-0.4-0.4-1,0-1.5l4.5-4.4c0.4-0.4,1.1-0.4,1.5,0 l17.1,16.7l4.5,4.4c0.4,0.4,0.4,1,0,1.4L45.2,38L28.2,54.7C27.8,55.1,27.1,55.1,26.7,54.7');
        svg.appendChild(path);        
        
        return svg;
    }

    _logoEyeOpen() {
        let svg = this._svgTemplate({'width': '18px', 'height': '18px'});       

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M55.25,35v-.09a1.86,1.86,0,0,0-.49-1,36.15,36.15,0,0,0-5.05-5,31.92,31.92,0,0,0-13.19-7A21.09,21.09,0,0,0,28,21.8a26.07,26.07,0,0,0-7.4,2.73,40.33,40.33,0,0,0-9.88,7.63c-.54.56-1.07,1.12-1.56,1.73a1.92,1.92,0,0,0,0,2.56,36.09,36.09,0,0,0,5.05,5,31.89,31.89,0,0,0,13.19,7,21.05,21.05,0,0,0,8.51.12,26.06,26.06,0,0,0,7.41-2.73,40.37,40.37,0,0,0,9.88-7.63c.54-.56,1.07-1.12,1.56-1.73a1.84,1.84,0,0,0,.49-1v-.19s0-.06,0-.09,0-.06,0-.09,0-.08,0-.09M32,44.51a9.35,9.35,0,1,1,9.28-9.35A9.31,9.31,0,0,1,32,44.51');
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path1.setAttribute('d', 'M32,32.07a3.1,3.1,0,1,1-3.07,3.1A3.08,3.08,0,0,1,32,32.07');
        svg.appendChild(path);
        svg.appendChild(path1);
        
        return svg;
    }

    _logoEyeClosed() {
        let svg = this._svgTemplate({'width': '18px', 'height': '18px'});       

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M17.55,44.49a42.79,42.79,0,0,1-4.18-3.08,36.09,36.09,0,0,1-5.05-5,1.92,1.92,0,0,1,0-2.56c.49-.6,1-1.17,1.56-1.73a40.33,40.33,0,0,1,9.88-7.63,26.07,26.07,0,0,1,7.4-2.73,21.09,21.09,0,0,1,8.51.12,24.12,24.12,0,0,1,3.41,1L34.34,27.7a7.49,7.49,0,0,0-9.59,9.59Z');
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path1.setAttribute('d', 'M23.14,47.37l5.73-5.73a7.49,7.49,0,0,0,9.82-9.82l6-6a42.78,42.78,0,0,1,4.18,3.09,36.15,36.15,0,0,1,5.05,5,1.86,1.86,0,0,1,.49,1V35s0,0,0,.09,0,.06,0,.09,0,.06,0,.09v.19a1.84,1.84,0,0,1-.49,1c-.49.6-1,1.17-1.56,1.73a40.37,40.37,0,0,1-9.88,7.63,26.06,26.06,0,0,1-7.41,2.73,21.05,21.05,0,0,1-8.51-.12A24.09,24.09,0,0,1,23.14,47.37Z');
        svg.appendChild(path);
        svg.appendChild(path1);        
        
        return svg;
    }

    _logoGrab() {
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
    }

    _logoSwitchOn() {
        let svg = this._svgTemplate({'width': '32px', 'height': '32px', 'view_box': '0 0 330 330'});
        svg.setAttribute('style', 'enable-background:new 0 0 60 60');
        svg.setAttribute('class', 'ON');

        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M240,75H90c-49.626,0-90,40.374-90,90s40.374,90,90,90h150c49.626,0,90-40.374,90-90S289.626,75,240,75zM240,225c-33.084,0-60-26.916-60-60s26.916-60,60-60s60,26.916,60,60S273.084,225,240,225z');
        g.appendChild(path);
        svg.appendChild(g);

        return svg;
    }

    _logoSwitchOff() {
        let svg = this._svgTemplate({'width': '32px', 'height': '32px', 'view_box': '0 0 483.5 483.5'});
        svg.setAttribute('style', 'enable-background:new 0 0 60 60');
        svg.setAttribute('class', 'OFF');

        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M354.75,113h-227.5C56.946,113.827,0,171.258,0,241.75s56.946,127.923,127.25,128.731c0,0.019,227.5,0.019,227.5,0.019c70.993,0,128.75-57.757,128.75-128.75S425.743,113,354.75,113z M128.75,340.5C74.299,340.5,30,296.201,30,241.75S74.299,143,128.75,143s98.75,44.299,98.75,98.75S183.201,340.5,128.75,340.5z');
        g.appendChild(path);

        svg.appendChild(g);

        return svg;
    }

    _logoColorBox(r, g, b) {
        let svg = this._svgTemplate({'view_box': '0 0 40 20', 'width': '40px', 'height': '20px'});  

        let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');            
        rect.setAttribute('x', 0);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', 40);
        rect.setAttribute('height', 20);            
        rect.setAttribute('style', 'fill: rgb(' + r + ' ,' + g + ',' + b + ')');   

        /**
         * COnsider:
         *  const r = 192;
            const g = 255;
            const b = 64;
            const rgbCSSColor = `rgb(${r},${g},${b})`;

            OR 

            const color = [192, 255, 64];
            const rgbCSSColor = `rgb(${color.join(',')})`;
         */

        svg.appendChild(rect);

        return svg;
    }

    _SvgColormap(scheme, n_colors) {
        scheme = scheme || '';
        n_colors = n_colors || 10;
        let height = 14*(n_colors + 1);
        let svg = this._svgTemplate({'width': '156px', 'height': height + 'px'});
        //svg.setAttribute('viewBox', '');

        for (let i=0; i<n_colors; i++) {
            // left and right values are bogus for now
            let left_val = i;
            let right_val = i + 1;
            // RGB values, bogus too
            let r_ = Math.floor(Math.random()*256);
            let g_ = Math.floor(Math.random()*256);
            let b_ = Math.floor(Math.random()*256);
            //
            let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute('transform', 'translate(0, ' + 14*i + ')');
            let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            rect.setAttribute('width', "20");
            rect.setAttribute('height', "10");
            rect.setAttribute('style', 'fill: rgb(' + r_ + ', ' + g_ + ', ' + b_ + ')');
            g.appendChild(rect); 
            let text = document.createElementNS('ttp://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '28');
            text.setAttribute('y', '9');
            text.textContent = left_val + ' to ' + right_val;
            g.appendChild(text);
            svg.appendChild(g);
        }    

        return svg;
    }

    _svgTemplate(opts) {
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

    _createInvisibleRect() {
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

}

// Helper functions

function _el(type, id, classes) {
    /**
     * convenience function to create a dom element with the id and classes
    */
    type = type || 'div';
    id = id || '';
    classes = classes || [];
    
    let el = document.createElement(type);
    if (id!=='') {
        el.id = id;
    }            
    if (classes.length > 0) {
        for (let i=0; i<classes.length; i++) {
            el.classList.add(classes[i]);
        }
    }

    return el;
}

function _get(name) {
    /**
     * shorthand for retrieving dom elements with id and class
     */
    if (name.startsWith('#')) {
        let el = document.getElementById(name.split('#')[1]);

        return el;
    } else if (name.startsWith('.')) {
        let els = document.getElementsByClassName(name.split('.')[1]);

        return els;
    }
}

function _cleanElement(el) {
    while (el.lastChild) {
        el.removeChild(el.lastChild);
    };
}

function createProgressBarListItem(name, h) {
    /**
     * list item with:
     *      - a label: name of the file
     *      - a value: file loading progress
     *      - a span: visual representation of the file loading progress
     */
    h = h || 'h4';            
        
    // the name will typically be that of the file to be loaded
    let li = _el('li', 'li_' + name);

    // A span with the labels
    let span = _el('span', '', ['row']);
    // the label
    let h_label = _el(h, '', ['label']);
    h_label.innerText = name;
    // the value
    let h_value = _el(h, '', ['value']);
    h_value.innerText = '0%';
    
    span.appendChild(h_label);
    span.appendChild(h_value);
    li.appendChild(span);

    // A span with the bar
    let span_bar = _el('span', '', ['bar']);
    let span_width = _el('span', '', []);
    span_width.style = 'width: 0%';
    
    span_bar.appendChild(span_width);
    li.appendChild(span_bar);

    return li;
}

function addTooltip(el, position, tooltip_text) {
    /**
     *  Adds a tooltip to an existing div
     */
    if (!el.classList.contains('tooltip')) {
        el.classList.add('tooltip');        
        //el.classList.add('tooltip-' + position);
        let span = _el('span', '', ['tooltiptext-' + position]);
        span.innerText = tooltip_text;
        el.appendChild(span);
    }
}