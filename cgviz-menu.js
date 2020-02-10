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
        menu_main.appendChild(this._createMenuHead());        
        // The main menu's body        
        menu_main.appendChild(this._createMenuBody());
        
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
    
    _createMenuHead() {
        /**
         * The menu head has 2 parts:
         *      the logo
         *      the tabs selector
         */
        let head_container = _el('div', 'menu-main-head-container');

        head_container.appendChild(this.__createMenuMainHead());
        
        head_container.appendChild(this.__createMenuMainHeadTabs());

        return head_container;
    }

    __createMenuMainHead() {
        let head = _el('div', 'menu-main-head');

        // The cgviz logo with 2 circles
        let logo = _el('div', 'menu-main-head-logo-svg');
        logo.appendChild(this.createSvg('cgviz'));
        head.appendChild(logo);

        // The title and subtitle
        let title = _el('div', 'menu-main-head-logo');
        title.innerText = 'cg-viz';
        let subtitle = _el('div', 'menu-main-head-logo-subtitle');
        subtitle.appendChild(document.createTextNode('lite'));
        title.appendChild(subtitle);
        head.append(title);

        return head;
    }

    __createMenuMainHeadTabs() {
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

    _createMenuBody() {
        /**
         * The menu body contains as many divs as there are categories:
         *      scenarios
         *      filters
         *      interactions
         *      settings
         * Only one of them is visible at any time
         */
        let main_body = _el('div', 'menu-main-body');

        main_body.appendChild(this.__createMenuScenarios());
        main_body.appendChild(this.__createMenuFilters());
        main_body.appendChild(this.__createMenuInteractions());
        main_body.appendChild(this.__createMenuSettings());

        return main_body;

    }

    __createMenuScenarios() {
        let scenarios = _el('div', 'Scenarios', ['container-tab-content', 'visible']);
        
        let title = _el('div', '', ['menu-title']);
        title.innerText = 'Scenarios';
        scenarios.appendChild(title);

        // A visiual separator
        scenarios.appendChild(_el('hr', 'scenarios-title-body-separator'));

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

        // The ID of the scenario is contained in this.cgviz.data.current_dir
        // in case the ID already exists, it is removed and built anew
        let div_scenario = _get('#' + this.cgviz.data.current_dir);
        if (div_scenario !== null) {
            div.removeChild(div_scenario);
        }

        //
        div_scenario = this._createMenuScenarioHeader(this.cgviz.data.current_dir, 'scenario-header');
        div.appendChild(div_scenario);
        
        let div_obj = this._createMenuScenarioHeader('Universe', 'obj-header'); 
        div.appendChild(div_obj);
        
        let div_pov = this._createMenuScenarioHeader('PoV', 'pov-header'); 
        div.appendChild(div_pov);
        
        let div_trace = this._createMenuScenarioHeader('Traces', 'trace-header'); 
        div.appendChild(div_trace);
        
        let div_kpis = this._createMenuScenarioHeader('Kpis', 'kpis-header'); 
        div.appendChild(div_kpis);        
    }

    _createMenuScenarioHeader(id_, className, innerText) {
        /**
         * Generic header for:
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

        innerText = innerText || id_;

        let div = _el('div', id_, [className]);

        let grab = _el('div', '', ['header-svg', 'weak']);
        grab.appendChild(this.createSvg('grab'));
        div.appendChild(grab);
        
        let eye = _el('div', '', ['header-svg']);
        eye.appendChild(this.createSvg('eye_open'));
        div.appendChild(eye);
        
        let name = _el('div', '', ['header-text']);
        name.innerText = innerText;
        div.appendChild(name);
        
        let bin = _el('div', '', ['header-svg']);
        bin.appendChild(this.createSvg('delete'));
        div.appendChild(bin);
        
        let expand = _el('div', '', ['header-svg']);
        expand.appendChild(this.createSvg('down'));
        div.appendChild(expand);

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

        return settings;
    }

    createPanel() {

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
        svg.setAttribute('width', '64px');
        svg.setAttribute('height', '64px');
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
            this.cgviz.data.current_dir = files[0].webkitRelativePath.split('/')[0];
            this.cgviz.data.json[this.cgviz.data.current_dir] = {
                'qcmPov': {},
                'qcmKpis': {},
                'qcmTrace': {},
                'obj': {'obj': null, 'mtl': null},
                'tmp': {'objs': [], 'mtl': null},
                'files': []                
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
            mcsvg.style.transform = 'rotate(180deg)';
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
         */
        let self = this;
        console.log('loading data...');
        let files = this._directory.files;
        let threed = {'mtl': {}, 'obj': []};
        
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
                    let pcValue = ((i_files+1)/n_files*100);
                    totalProgressBar.style.width = pcValue + '%';
                    totalProgressVal.innerText = Math.round(pcValue*100)/100 + '%';
                    self._finishedYet(i_files, n_files);
                };
            } else if (ext === 'obj') {
                threed.obj = {'li': li, 'file': url};
            } else if (ext === 'mtl') {
                threed.mtl = {'li': li, 'file': url};
            }            
        } 
        // Handling the mtl and obj files separately
        // I assume there is only one mtl object
        let mtl_reader = new FileReader();
        mtl_reader.readAsText(threed.mtl.file);
        mtl_reader.onload = function(evt) {
            let mtl = new THREE.MTLLoader().parse(evt.target.result);
            //mtl.setMaterialOptions({side: THREE.DoubleSide});
            self.__handleMtl(mtl)
        };
        mtl_reader.onloadend = function() {
            i_files += 1;
            console.log(' from mtl: ', i_files);
            self._finishedYet(i_files, n_files);
        };
        // I assume there is only one obj object
        let obj_reader = new FileReader();
        obj_reader.readAsText(threed.obj.file);
        obj_reader.onload = function(evt) {
            let obj = new THREE.OBJLoader().parse(evt.target.result);
            self.__handleObj(obj)
        };
        obj_reader.onloadend = function() {
            i_files += 1;
            console.log(' from obj: ', i_files);
            self._finishedYet(i_files, n_files);
        };
    }

    _finishedYet(i_files, n_files) {
        if (i_files === n_files) {
            console.log('done');
            this.cgviz.getRaysRange();
            this.__populateMenuScenariosContent();
        }
    }

    __handleMtl(thisFile) {
        let qcmObjects = this.cgviz.data.json[this.cgviz.data.current_dir].obj;
        qcmObjects.mtl = thisFile;
    }

    __handleObj(thisFile) {
        let qcmObjects = this.cgviz.data.json[this.cgviz.data.current_dir].obj;
        qcmObjects.obj = thisFile;
    }

    __handleQcmPov(thisFile) {
        // the file name is typically built like so: qcmPov.Rx22.json but it has a tag with its name
        //data.json[dir_name].qcmPov[thisFile.tag] = thisFile;
        // split the name in 2 parts: pov type & id
        // ex Rx01 becomes 'Rx' & '01'  
        let qcmPov = this.cgviz.data.json[this.cgviz.data.current_dir].qcmPov;
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
        let qcmTrace = this.cgviz.data.json[this.cgviz.data.current_dir].qcmTrace;

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
            case 'add': 
                svg = this._logoAdd();
                break;
            case 'delete': 
                svg = this._logoDelete();
                break;
            case 'close': 
                svg = this._logoClose();
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

    // OLD
    createModal_old() {
        /**
         * Structure:
         *   container div
         *     content div
         *       close x span
         *       text p => replace with 
         * 
         * modal
         *   modal-content
         */
        let container = document.createElement('div');
        container.classList.add('modal');
        container.id = 'modal';

        let content = document.createElement('div');
        content.classList.add('modal-content');

        let span = document.createElement('span');
        span.id = 'span-close';
        span.classList.add('close');
        span.appendChild(this.createLogoClose());
        // When the user clicks on <span> (x), close the modal
        
        /*span.onclick = function() { 
            container.style.display = "none";
            document.getElementById('div-button-upload').style.display = 'none';
        };
        */
        content.appendChild(span);
        
        // Create a header, body in this div
        let subcontent = document.createElement('div');
        subcontent.id = 'subcontent';
        // HEAD
        let sc_head = document.createElement('div');
        sc_head.id = 'subcontent-head';

        //let svg = this.createLogoFolder();
        //sc_head.appendChild(svg);
        
        let div = document.createElement('div');
        div.classList.add('modal-title');
        div.innerText = 'Add Scenario';
        sc_head.appendChild(div);
        let div_under = document.createTextNode('select a directory below, then press the Upload button');
        sc_head.appendChild(div_under);        

        subcontent.appendChild(sc_head);
        subcontent.appendChild(document.createElement('hr'));

        // BODY
        let sc_body = document.createElement('div');
        sc_body.id = 'subcontent-body';

        // Add progressbar
        // ...

        // update list of files as they are loaded
        let div_ul = document.createElement('div');
        div_ul.classList.add('modal-list-container');
        let ul = document.createElement('ul');
        ul.id = 'modal-list';
        div_ul.appendChild(ul);
        sc_body.appendChild(div_ul);

        // Add input
        let div_nput_btn_container = document.createElement('div');
        div_nput_btn_container.id = 'div-input-btn-container';
        
        // UPLOAD button hidden to start with
        let div_btn = document.createElement('div');
        div_btn.id = 'div-button-upload';
        div_btn.classList.add('div-button');
        div_btn.addEventListener('click', () => {
            // add the data to the left hand side menu
            // this can be done by creating a div with all the subcategories using the inputs
            // Load the files
            this.loadScenarioFiles();
            // Create the dom object representing the ocntent of the loaded folder
            let div = this.createScenarioDiv();
            document.getElementById('div-scenarios').appendChild(div);           
           
        });
        div_btn.appendChild(document.createTextNode('Upload'));
        div_nput_btn_container.appendChild(div_btn);

        // BROWSE button
        let div_nput = document.createElement('div');
        div_nput.id = 'div-scenario-loader';        
        let nput = document.createElement('input');
        nput.setAttribute('type', 'file');
        nput.setAttribute('id', 'scenario-loader');
        nput.setAttribute('name', 'filelist');
        nput.setAttribute('webkitdirectory', '')
        nput.setAttribute('directory', '')
        nput.setAttribute('multiple', '')
        
        div_nput.appendChild(nput);
        div_nput_btn_container.appendChild(div_nput);        
        sc_body.appendChild(div_nput_btn_container);
        subcontent.appendChild(sc_body);        
        content.appendChild(subcontent);
        container.appendChild(content);

        document.body.appendChild(container);

    }

    createScenarioDiv() {
        /**
         * Each scenario has:
         *      - a title
         *      - json data: pov, trace, kpis, etc..
         * 
         * This data is used to populate a list of widget on the menu-body
         * 
         * // TODO: this id should be the scenario name
         */
        // The ID is contained in this.cgviz.data.current_dir
        // Remove the existing div with the same id
        let div = document.getElementById(this.cgviz.data.current_dir);
        // Put that in a function so that it can be called by the delte button
        if (div != null) {
            div.parentNode.removeChild(div);
        }
        
        // 1) the main container for this scenario, which includes the header and submenus
        let div_main = document.createElement('div');
        div_main.id = this.cgviz.data.current_dir;
        
        // 2) the horizontal part that contains the controls like eye/trash/expand
        let div_scenario = document.createElement('div');
        div_scenario.classList.add('div-scenario');
        // 2.1) The name of the scenario along with the eye
        let div_content = document.createElement('div');
        div_content.classList.add('div-scenario-content');
        //div_scenario.innerText = 'Scenario1';
        let p = document.createElement('p');
        p.innerText = div_main.id; //'Engelbrektshallen_details_ref_5m_bugfix';
        div_content.appendChild(p);
        // 2.2) The actions: trash, expand
        let div_actions = document.createElement('div');
        div_actions.classList.add('div-scenario-actions');
        let del_btn = this.createLogoDelete();
        del_btn.addEventListener('click', (evt) => {
            let containing_node = evt.target.parentNode.parentNode.parentNode;
            containing_node.parentNode.remove(containing_node);
            // Clean the data in cgviz
            delete this.cgviz.data.json[this.cgviz.data.current_dir];
            this.cgviz.data.current_dir = null;

        });
        div_actions.appendChild(del_btn);
        let svg_expand = this.createLogoExpandDown();
        svg_expand.addEventListener('click', () => {
            // TODO: this id should be the scenario name
            //document.getElementById('Engelbrektshallen_details_ref_5m_bugfix').classList.toggle('hidden');
            document.getElementById('cat-con-' + div_main.id).classList.toggle('hidden');
        });
        div_actions.appendChild(svg_expand);

        div_scenario.appendChild(div_content);
        div_scenario.appendChild(div_actions);
        div_main.appendChild(div_scenario);

        // 3) The categories are listed below
        // PoV, Paths, Kpis
        let div_categories_container = document.createElement('div');
        div_categories_container.classList.add('div-scenario-cat-container');
        div_categories_container.classList.add('hidden');
        //div_categories_container.id = 'Engelbrektshallen_details_ref_5m_bugfix'; // TODO: this id should be the scenario name
        div_categories_container.id = 'cat-con-' + div_main.id; // TODO: this id should be the scenario name
        // Universe
        let div_cat_uni = this.createScenarioCat('Universe');
        div_cat_uni.id = div_main.id.toLowerCase() + '-div-scenario-uni';
        div_categories_container.appendChild(div_cat_uni);

        // PoV
        let div_cat_pov = this.createScenarioCat('Point of Views');
        div_cat_pov.id = div_main.id.toLowerCase() + '-div-scenario-pov';
        let div_pov = this.createPovMenu(div_main.id);
        div_categories_container.appendChild(div_cat_pov);
        div_categories_container.appendChild(div_pov);
        
        // Paths
        let div_cat_path = this.createScenarioCat('Paths');
        div_cat_path.id = div_main.id.toLowerCase() + '-div-scenario-path';
        div_categories_container.appendChild(div_cat_path);
        
        // Kpis
        let div_cat_kpis = this.createScenarioCat('KPIs');
        div_cat_kpis.id = div_main.id.toLowerCase() + '-div-scenario-kpis';
        div_categories_container.appendChild(div_cat_kpis);

        div_main.appendChild(div_categories_container);

        return div_main;
    }

    createPovMenu(div_id) {
        /**
         * Create a div with 2 levels
         * 1st level is the name of the pov: Tx, Rx, TestRx, MS etc..
         * 2nd level is the list of ids with an eye to select/unselect
         */
        let div = document.createElement('div');
        let data = this.cgviz.data.json[div_id].qcmPov;
        // for each pov category, we create a pov-el-container
        let pov_types = Object.keys(data);
        if (pov_types.length==0) {
            console.log('No data in qcmpov');
            return;
        }
        let pov_type;
        for (let i=0; i<pov_types.length; i++) {
            pov_type = pov_types[i];
            // div for the pov type
            let div_type = document.createElement('div');            
            div_type.id = div_id + '-' + pov_type + '-pov-switch';
            div_type.classList.add('pov-switch');
            let span = document.createElement('span');
            //span.id = div_id + '-' + pov_type + '-pov-switch';
            span.innerText = pov_type;            
            let dspan = document.createElement('div');
            dspan.appendChild(span);
            dspan.classList.add('pov-switch-span');
            div_type.appendChild(dspan);
            // the down arrow
            let da = this.createLogoExpandDown();
            da.onclick = function(evt) {
                // put that among the event_ functions
                // toggle visible of the div_ids_container below
                console.log('1 clicked on: ', evt.target.parentNode.parentNode.id);
                let el_id = evt.target.parentNode.parentNode.id.replace('switch', 'content');
                let div = document.getElementById(el_id);
                if (div!==null) {
                    div.classList.toggle('hidden');
                }
            };
            let divda = document.createElement('div');
            divda.appendChild(da);
            divda.classList.add('pov-switch-svg');
            div_type.appendChild(divda);

            div.appendChild(div_type);

            // div for the container of povs
            let div_ids_container = document.createElement('div');
            div_ids_container.id = div_id + '-' + pov_type + '-pov-content';
            div_ids_container.classList.add('pov-el-container');
            //div_ids_container.classList.add('hidden');
            // add the elements
            let pov_ids = Object.keys(data[pov_type]);
            for (let j=0; j<pov_ids.length; j++) {
                let pov_id = pov_ids[j];
                let div_pov = document.createElement('div');
                div_pov.classList.add('pov-el');

                // an eye to control the show/hide on the threejs scene
                let svg = this.createLogoEyeClosed();
                svg.onclick = function(evt) {
                    console.log('clicked on: ', evt.target);
                    let node = evt.target;
                    if (node.tagName==='path') {
                        console.log('path gets the click instead of the svg...');
                        node = node.parentNode;
                    }
                    let povId = node.parentNode.nextSibling.childNodes[0].innerText;
                    cgviz.togglePov(povId);
                    console.log('2 clicked on: ', povId);                    
                };
                let div_svg = document.createElement('div');
                div_svg.classList.add('pov-el-svg');
                div_svg.appendChild(svg);
                div_pov.appendChild(div_svg);

                // the name as span
                let span = document.createElement('span');
                span.innerText = pov_type + pov_id;
                let div_span = document.createElement('div');
                div_span.classList.add('pov-el-span');
                div_span.appendChild(span);                
                div_pov.appendChild(div_span);

                div_ids_container.appendChild(div_pov);
            }
            div.appendChild(div_ids_container);
        }
        
        return div;

    }

    createScenarioCat(name) {
        /**
         * A div scenario category is made as so:
         *  a header:      Border Name Dots
         *   content:   depends on the category
         *      pov:
         *          list of povs grouped by type (tx/rx)
         *      path:
         *          list of sliders grouped by tx
         *      kpis:
         *          kpis selector:
         *          mode selector: horizontal ID | BEST | WORST | AVG | SUM 
         */

        let div = document.createElement('div');
        div.classList.add('div-scenario-cat');
        // The label
        let div_label = document.createElement('div');
        div_label.classList.add('div-scenario-span-container');
        let span = document.createElement('span');
        span.classList.add('div-scenario-span');
        span.innerText = name;
        div_label.appendChild(span);
        div.appendChild(div_label);
        
        // the dot icon used to signal for expansion
        let div_icon = document.createElement('div');
        div_icon.classList.add('div-scenario-icon');
        let svg = this.createLogoDots();
        div_icon.appendChild(svg);
        div.appendChild(div_icon);

        return div;
    }

    event_DeleteScenario() {
        // remove from DOM
        
        // remove from CGVIZ
    }

    AddToolTips() {
        /**
         * Add all the tooltips in one single step
         *  Build a dictionary containing the ids of all the elements for which a tooltip is needed
         *  loop the structure that contains the class/id/position for the tooltip
         *  Add the necessary class name that activate the tooltip
         *  Done!
         */

        let tooltips = {
           'Scenarios': {text: 'Scenarios', position: 'top'},
           'Filters': {text: 'Scenarios', position: 'top'},
           'Interactions': {text: 'Scenarios', position: 'top'},
           'Settings': {text: 'Scenarios', position: 'top'},
        };
        let el = document.getElementById('Scenarios'); 
        el.classList.add('tooltip');
        let span = document.createElement('span');
        span.className = 'tooltiptext';
        span.innerText = el.id;

    }

    loadScenarioFiles() {
        /**
         * The event target of the directory loader is saved in this._directory
         */
        if (this._directory.files.length == 0) {
            alert('No files were loaded');
            return;
        }   
        let files = this._directory.files;
        let dir_name = files[0].webkitRelativePath.split('/')[0];
        // Create the data structure that holds the data from the files processing
        let data = this.cgviz.data;
        data.current_dir = dir_name;
        // If the key already exist int he list of scenarios
        let scenarios = Object.keys(data.json);
        if (scenarios.length > 0 && scenarios.indexOf(dir_name) > -1) {            
            alert('Directory exits! It will be overwritten');
            console.log('This directory already exists. It will be overwritten.');
        }
        
        data.json[dir_name] = {
            'qcmPov': {},
            'qcmKpis': {},
            'qcmTrace': {},
            'obj': {'obj': null, 'mtl': null},
            'tmp': {'objs': [], 'mtl': null},
            'files': []
        };
        // Processing files depending on the extension and name
        for (let i=0; i<files.length; i++) {
            let file = files[i];
            let pathParts = file.webkitRelativePath.split('/');
            // We ignore the subdirectories
            if (pathParts.length > 2) {
                continue;
            }
            // The files jas one following extensions: json, obj, and mtl
            // TODO: deleguate the following to subfunction to make it leaner
            if (file.name.includes('.json')) {
                const fileread = new FileReader();
                fileread.onload = function() {
                    let filename = pathParts[1];
                    let filenameParts = filename.split('.');
                    let thisFile = JSON.parse(fileread.result);
                    // distinguish between the different files: qcmPov, qcmTrace, qcmTrace
                    if (filename.includes('qcmPov')) {
                        // the file name is typically built like so: qcmPov.Rx22.json but it has a tag with its name
                        //data.json[dir_name].qcmPov[thisFile.tag] = thisFile;
                        // split the name in 2 parts: pov type & id
                        // ex Rx01 becomes 'Rx' & '01'
                        let pov_type = thisFile.tag.replace(/[0-9]/g, '');
                        let pov_id = thisFile.tag.replace(/\D/g,'');
                        if (!data.json[dir_name].qcmPov.hasOwnProperty(pov_type)) {
                            data.json[dir_name].qcmPov[pov_type] = {};
                        }
                        data.json[dir_name].qcmPov[pov_type][pov_id] = thisFile;
                    } else if (filename.includes('qcmTrace')) {
                        // the file name can be built in various ways:
                        //      - qcmTrace.Tx01-Rx17.json
                        //      - qcmTrace.BS-1-UE-1.json
                        //      - qcmTrace.BS1-MS1.json
                        //      - qcmTrace.PoleArray-1-UE-1.json
                        // we count the number of parts separated by - of the 2nd element (the central part between qcmTrace and json)
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
                        // Save the data on 3 levels: txId then rxId
                        if (!data.json[dir_name].qcmTrace.hasOwnProperty(txId)) {
                            data.json[dir_name].qcmTrace[txId] = {};
                        }
                        data.json[dir_name].qcmTrace[txId][rxId] = thisFile;

                    } else if (filename.includes('qcmKpis')) {

                    }
                };
                fileread.readAsText(file);
            } else if (file.name.includes('.obj')) {
                data.json[dir_name].tmp.objs.push(file);
                
                const fileread = new FileReader();
                fileread.onload = function(event) {
                    let content = event.target.result;
                    let object = new THREE.OBJLoader().parse(content);
                    data.json[dir_name].obj.obj = object;
                };
                fileread.readAsText(file);
                

            } else if (file.name.includes('.mtl')) {
                data.json[dir_name].tmp.mtl = file;
                
                const fileread = new FileReader();
                fileread.onload = function(event) {
                    let content = event.target.result;
                    let mtl = new THREE.MTLLoader().parse(content);
                    data.json[dir_name].obj.mtl = mtl;
                };
                fileread.readAsText(file);
                
            }

            data.json[dir_name].files.push(file); // NOTE: probably useless
            console.log('> file ', i+1, ' of ', files.length);

            // Saving the objs and mtl files
            
        }

        /* 2020-02-08 that's the new one. Not finished yet though
        // Create the obj files with the material
        const fileread = new FileReader();
        fileread.onload = function(event) {
            let mtl = new THREE.MTLLoader().parse(event.target.result);
            mtl.setMaterialOptions({side: THREE.DoubleSide});
            mtl.load('mtl', function(materials){
                materials.preload();

                // Handle the Object
                let object = new THREE.OBJLoader().parse(data.json[dir_name].tmp.objs[0].file);
            });
        };
        fileread.readAsText(data.json[dir_name].tmp.mtl.file);
        */

        // TODO: remove the list of files otherwise the browse button still shows it...
        //document.getElementById('scenario-loader').files = '';
        this.cgviz.getRaysRange();
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