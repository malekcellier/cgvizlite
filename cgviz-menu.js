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
     *      menu-container
     *          menu-main
     *          menu-control
     */
    constructor() {
        this.cgviz = null;  // reference to the cgviz instance
        this.setup();
    } 
    
    setup() {
        this.createMenuContainer();
        this.createMenuHead();
        this.createMenuBody();
        this.createTopRightMenu();
        this.createModal();
        this.addEventListeners();
    }

    createMenuContainer() {
        /**
         * This is the top level of the left handside menu structure
         * The MenuContainer comprises:
         *      - the menu:
         *          series of cascaded submenus to interact with povs, traces, kpis...
         *      - the control: 
         *          a widget to show/hide the menu. It changes appearance:
         *              - it is '>' when the menu is shown
         *              - it is '<' when the menu is hidden
         * 
         * menu-container
         *      menu-main
         *      menu-control
         *          svg-mc
         */

        // 1) Creating the top level as a div: the menucontainer
        let menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        menuContainer.classList.add('visible');
        
        // 2)
        // 2.1) the actual menu
        let menu = document.createElement('div');
        menu.id = 'menu-main';
        menu.classList.add('visible');
        // add the menu in the menuContainer
        menuContainer.appendChild(menu);
        // 2.2) the svg widget to control the show/hide cycle
        // this is put inside a div and placed on the right hand side of the menu-main
        let control = document.createElement('div');
        control.id = 'menu-control'
        // add the svg to the control div
        control.appendChild(this.createLogoShowHide());
        // add the control in the menuContainer
        menuContainer.appendChild(control);        

        // 3) the menuContainer is appended to the document body
        document.body.appendChild(menuContainer);
    }

    createLogoShowHide() {
        /**
         * the widget is a simple > that get drawn using svg
         */
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("aria-hidden","true");
        svg.setAttribute('id','svg-mc');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '12px');
        svg.setAttribute('style', 'transform: rotate(180deg)');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M26.7,54.7l-4.5-4.4c-0.4-0.4-0.4-1,0-1.4L38.6,33L22.2,17c-0.4-0.4-0.4-1,0-1.5l4.5-4.4c0.4-0.4,1.1-0.4,1.5,0 l17.1,16.7l4.5,4.4c0.4,0.4,0.4,1,0,1.4L45.2,38L28.2,54.7C27.8,55.1,27.1,55.1,26.7,54.7');
        svg.appendChild(path);
        
        return svg;
    }

    createMenuHead() {
        /**
         * This is the head of the menu-main part
         * The MenuHead contains:
         *      - the logo on top
         *      - a list of icons for changing the content of the menu body
         *          - scenarios
         *          - settings
         * 
         *  menu-main
         *      menu-main-head-container
         *          menu-main-head
         *              menu-main-head-logo
         *                  menu-main-head-logo-subtitle
         *              menu-main-head-logo-svg
         *          menu-main-head-tabs
         */

        // 1) Div container for the menu-main-head
        let mmHeadContainer = document.createElement('div');
        mmHeadContainer.id = 'menu-main-head-container';
        // 2) The head contains the logo
        let mmHead = document.createElement('div');
        mmHead.id = 'menu-main-head';
        
        // 2.1 the logo text
        let mmHeadLogo = document.createElement('div');
        mmHeadLogo.id = 'menu-main-head-logo';
        mmHeadLogo.innerText = 'cgviz';
        // Alternative to innterText
        /* TODO: change the color of a so that it matches the one used above
        let a = document.createElement('a');
        let linkText = document.createTextNode("cgviz-lite");
        a.appendChild(linkText);
        a.title = "cgviz-lite";
        a.href = 'https://rnd-gitlab-eu.gmail.com/'
        a.terget = '_blank';
        mmHeadLogo.append(a);
        */
        // 2.2 the logo svg
        let mmHeadLogoSvgDiv = document.createElement('div');
        mmHeadLogoSvgDiv.id = 'menu-main-head-logo-svg';
        mmHeadLogoSvgDiv.appendChild(this.createLogo());
        mmHead.appendChild(mmHeadLogoSvgDiv);
 
        // 2.3 the subtitle
        let mhls = document.createElement('div');
        mhls.id = 'menu-main-head-logo-subtitle';
        mhls.appendChild(document.createTextNode('lite'));
        
        // appending the divs
        mmHeadLogo.appendChild(mhls);
        mmHead.appendChild(mmHeadLogo);

        //2.4 The extra action
        /*
        let div_actions = document.createElement('div');
        div_actions.classList.add('menu-head-actions');
        div_actions.id = 'menu-head-actions';
        let svg = this.createLogoBug();
        div_actions.appendChild(svg);
        mmHead.append(div_actions);
        */

        mmHeadContainer.appendChild(mmHead);

        // 3) The lower part of the head has a tab menu
        let mmHeadTabs = document.createElement('div');
        mmHeadTabs.id = 'menu-main-head-tabs';
        // There are 4 tabs: scenarios, filters, interactions and settings
        let svg_scenarios = this.createLogoLayers();
        svg_scenarios.id = 'Scenarios';
        svg_scenarios.classList.add('current-tab');
        mmHeadTabs.appendChild(svg_scenarios);

        let svg_filters = this.createLogoFilters();
        svg_filters.id = 'Filters';
        mmHeadTabs.appendChild(svg_filters);

        let svg_interactions = this.createLogoInteractions();
        svg_interactions.id = 'Interactions';
        mmHeadTabs.appendChild(svg_interactions);

        let svg_settings = this.createLogoSettings();
        svg_settings.id = 'Settings';
        mmHeadTabs.appendChild(svg_settings);
       
        mmHeadContainer.appendChild(mmHeadTabs);

        // finally appending the main-menu-head-container to the menu-main
        document.getElementById('menu-main').appendChild(mmHeadContainer);
    }

    createLogo() {
        /**
         * A simple logo made of circles
         */
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '32px');
        svg.setAttribute('height', '32px');
        
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

    createLogoLayers() {
        /**
         * svg that produces a layer icon to be used to represent the scenarios
         */
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('id','svg-scenarios');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '20px');
        svg.setAttribute('height', '20px');
        svg.setAttribute('style', 'fill: currentcolor');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M50.88,43.52a3.2,3.2,0,0,1,0,5.86L34.56,56.52a6.42,6.42,0,0,1-5.13,0L13.12,49.37a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05,16.32,7.14a3.19,3.19,0,0,0,2.56,0L49.6,46.44l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95Zm0-14.39a3.2,3.2,0,0,1,0,5.86L34.56,42.13a6.42,6.42,0,0,1-5.13,0L13.12,35a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05L30.72,39.2a3.19,3.19,0,0,0,2.56,0L49.6,32.06l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95ZM13.12,20.6a3.2,3.2,0,0,1,0-5.86L29.44,7.6a6.39,6.39,0,0,1,5.13,0l16.32,7.14a3.2,3.2,0,0,1,0,5.86L34.56,27.74a6.39,6.39,0,0,1-5.13,0Z');
        svg.appendChild(path);

        return svg;
    }

    createLogoFilters() {
        /**
         * svg that produces a settings icon to be used to represent the filters
         */        
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('id','svg-settings');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '20px');
        svg.setAttribute('height', '20px');
        svg.setAttribute('style', 'fill: currentcolor');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M52.5,19.67l-16,20h0a6.24,6.24,0,0,0-1.37,3.9V57L30.6,54.74a3.12,3.12,0,0,1-1.73-2.79V43.58h0a6.24,6.24,0,0,0-1.37-3.9l-16-20a5,5,0,0,1-1.35-3.24c0-5.17,9.78-9.36,21.85-9.36s21.85,4.19,21.85,9.36A5,5,0,0,1,52.5,19.67Zm-20.5,3c8.62,0,15.61-2.79,15.61-6.24s-7-6.24-15.61-6.24S16.39,13,16.39,16.43,23.38,22.67,32,22.67Z');
        svg.appendChild(path);

        return svg;
    }

    createLogoInteractions() {
        /**
         * svg that produces a settings icon to be used to represent the mouse interactions
         */        
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('id','svg-settings');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '20px');
        svg.setAttribute('height', '20px');
        svg.setAttribute('style', 'fill: currentcolor');
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

    createLogoSettings() {
        /**
         * svg that produces a settings icon to be used to represent the system settings
         */        
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('id','svg-settings');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '20px');
        svg.setAttribute('height', '20px');
        svg.setAttribute('style', 'fill: currentcolor');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path.setAttribute('d', 'M32.2,52.32a6.24,6.24,0,0,0,12.09,0h9.56a1.56,1.56,0,0,0,0-3.12H44.29a6.24,6.24,0,0,0-12.09,0h-22a1.56,1.56,0,0,0,0,3.12ZM16.59,33.59a6.24,6.24,0,0,0,12.09,0H53.85a1.56,1.56,0,0,0,0-3.12H28.68a6.24,6.24,0,0,0-12.09,0H10.15a1.56,1.56,0,1,0,0,3.12ZM35.32,11.74H10.15a1.56,1.56,0,1,0,0,3.12H35.32a6.24,6.24,0,0,0,12.09,0h6.44a1.56,1.56,0,0,0,0-3.12H47.41a6.24,6.24,0,0,0-12.09,0Z');
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "translate(3, 4) scale(0.9, 0.9)");
        g.appendChild(path);
        svg.appendChild(g);

        return svg;
    }

    createLogoBug() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo-action');
        svg.setAttribute('id','svg-bug');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '20px');
        svg.setAttribute('height', '20px');
        svg.setAttribute('style', 'fill: currentcolor');
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

    createMenuBody() {
        /**
         * This menu is below the menu-head
         * The MenuBody's content depends on what icon is activated in the menu head
         * it contains:
         *      scenarios:
         *          - a button to add a new scenario         *  
         *          - a separator
         *          - a list of boxes, one for each loaded scenarios
         * 
         *      settings:
         * 
         * menu-container
         *   menu-main
         *     menu-main-head-container   
         *     menu-main-body   
         */
        // 1) Div container for the menu-main-body
        let mmBody = document.createElement('div');
        mmBody.id = 'menu-main-body';        

        // Scenarios menu
        let div_container_scenarios = document.createElement('div');
        div_container_scenarios.id = 'Scenarios';
        div_container_scenarios.classList.add('container-tab-content');
        // Add title
        let div = document.createElement('div');
        div.id = 'tab-name';
        div.innerText = 'Scenarios';
        div.classList.add('menu-title');
        //mmBody.appendChild(div);        
        div_container_scenarios.appendChild(div);
        // Add button
        let btn = this.createAddButton();
        btn.classList.add('div-button');
        let text = document.createElement('p');
        text.classList.add('menu-text');
        text.innerText = 'Add Scenario';
        btn.appendChild(text);
        btn.onclick = function() {
            let modal = document.getElementById('modal');
            modal.style.display = "block";
        }
        div_container_scenarios.appendChild(btn);
        div_container_scenarios.appendChild(document.createElement('hr'));
        //mmBody.appendChild(btn);
        //mmBody.appendChild(document.createElement('hr'));
        // div for the scenarios
        let div_scenarios = document.createElement('div');
        div_scenarios.id = 'div-scenarios';
        div_container_scenarios.appendChild(div_scenarios);
        
        mmBody.appendChild(div_container_scenarios);
        //mmBody.appendChild(div_scenarios);
        
        // Filters menu
        let div_container_filters = document.createElement('div');
        div_container_filters.classList.add('container-tab-content');
        div_container_filters.id = 'Filters';
        div = document.createElement('div');
        div.innerText = 'Filters';
        div.classList.add('menu-title');
        div_container_filters.appendChild(div);
        mmBody.appendChild(div_container_filters);

        // Interactions menu
        let div_container_interactions = document.createElement('div');
        div_container_interactions.classList.add('container-tab-content');
        div_container_interactions.id = 'Interactions';
        div = document.createElement('div');
        div.innerText = 'Interactions';
        div.classList.add('menu-title');
        div_container_interactions.appendChild(div);
        mmBody.appendChild(div_container_interactions);

        // Settings menu
        // TODO: handle the camera, scene etc.. basically all that is already handled by the dagui
        let div_container_settings = document.createElement('div');
        div_container_settings.classList.add('container-tab-content');
        div_container_settings.id = 'Settings';
        div = document.createElement('div');
        div.innerText = 'Settings';
        div.classList.add('menu-title');
        div_container_settings.appendChild(div);
        mmBody.appendChild(div_container_settings);

       document.getElementById('menu-main').appendChild(mmBody);
    }

    createAddButton() {
        /**
         * Create a nice button with a plus sign
         */
        let btn = document.createElement('div');

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '12px');
        svg.setAttribute('height', '12px');
        svg.setAttribute('fill', 'currentcolor');
        svg.setAttribute('margin-right', '8px');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M35.93,28.57V9.89a1,1,0,0,0-1-1h-5.9a1,1,0,0,0-1,1V28.57H9.39a1,1,0,0,0-1,1v5.9a1,1,0,0,0,1,1H28.07V55.11a1,1,0,0,0,1,1h5.9a1,1,0,0,0,1-1V36.43H54.61a1,1,0,0,0,1-1v-5.9a1,1,0,0,0-1-1Z');
        svg.appendChild(path);
        btn.appendChild(svg);

        return btn;
    }

    createTopRightMenu() {
        /**
         * Used for displaying direct access controls:
         *      - info about the scene
         *      - legend
         */
        let m = document.createElement('div');
        m.id = 'menu-top-right'

        document.body.appendChild(m);
    }

    createModal() {
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
        span.classList.add('close');
        span.appendChild(this.createLogoClose());
        // When the user clicks on <span> (x), close the modal
        span.onclick = function() { 
            container.style.display = "none";
            document.getElementById('div-button-upload').style.display = 'none';
        };
        content.appendChild(span);
        
        // Create a header, body in this div
        let subcontent = document.createElement('div');
        subcontent.id = 'subcontent';
        // HEAD
        let sc_head = document.createElement('div');
        sc_head.id = 'subcontent-head';
        
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
            //
            let div = this.createScenarioDiv();
            document.getElementById('div-scenarios').appendChild(div);
        });
        div_btn.appendChild(document.createTextNode('Upload'));
        div_nput_btn_container.appendChild(div_btn);

        // BROWSE button
        let div_nput = document.createElement('div');
        div_nput.id = 'div-picker';        
        let nput = document.createElement('input');
        nput.setAttribute('type', 'file');
        nput.setAttribute('id', 'filepicker');
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

    createLogoClose() {
        /**
         * A simple cross to show where to click
         */
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('viewBox', '0 0 18 18');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '18px');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); 
        path.setAttribute('d', 'M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z');
        svg.appendChild(path);

        return svg;
    }

    createScenarioDiv() {
        /**
         * Each scenario has:
         *      - a title
         *      - json data: pov, trace, kpis, etc..
         * 
         * This data is used to populate a list of widget on the menu-body
         */
        // 1) the main container for this scenario, which includes the header and submenus
        let div_main = document.createElement('div');
        
        // 2) the horizontal part that contains the controls like eye/trash/expand
        let div_scenario = document.createElement('div');
        div_scenario.classList.add('div-scenario');
        // 2.1) The name of the scenario along with the eye
        let div_content = document.createElement('div');
        div_content.classList.add('div-scenario-content');
        div_scenario.innerText = 'Scenario1';
        // 2.2) The actions: trash, expand
        let div_actions = document.createElement('div');
        div_actions.classList.add('div-scenario-actions');       

        div_scenario.appendChild(div_content);
        div_scenario.appendChild(div_actions);
        div_main.appendChild(div_scenario);

        // 3) The categories are listed below
        // PoV, Paths, Kpis
        let div_categories_container = document.createElement('div');
        div_categories_container.classList.add('div-scenario-cat-container');
        // PoV
        let div_cat_pov = this.createScenarioCat('PoVs');
        div_cat_pov.id = 'div-scenario-pov';
        div_categories_container.appendChild(div_cat_pov);
        
        // Paths
        let div_cat_path = this.createScenarioCat('Paths');
        div_cat_path.id = 'div-scenario-path';
        div_categories_container.appendChild(div_cat_path);
        
        // Kpis
        let div_cat_kpis = this.createScenarioCat('KPIs');
        div_cat_kpis.id = 'div-scenario-kpis';
        div_categories_container.appendChild(div_cat_kpis);

        div_main.appendChild(div_categories_container);

        return div_main;
    }

    createLogoEye() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '18px');
        svg.setAttribute('style', 'fill: currentcolor');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M55.25,35v-.09a1.86,1.86,0,0,0-.49-1,36.15,36.15,0,0,0-5.05-5,31.92,31.92,0,0,0-13.19-7A21.09,21.09,0,0,0,28,21.8a26.07,26.07,0,0,0-7.4,2.73,40.33,40.33,0,0,0-9.88,7.63c-.54.56-1.07,1.12-1.56,1.73a1.92,1.92,0,0,0,0,2.56,36.09,36.09,0,0,0,5.05,5,31.89,31.89,0,0,0,13.19,7,21.05,21.05,0,0,0,8.51.12,26.06,26.06,0,0,0,7.41-2.73,40.37,40.37,0,0,0,9.88-7.63c.54-.56,1.07-1.12,1.56-1.73a1.84,1.84,0,0,0,.49-1v-.19s0-.06,0-.09,0-.06,0-.09,0-.08,0-.09M32,44.51a9.35,9.35,0,1,1,9.28-9.35A9.31,9.31,0,0,1,32,44.51');
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path1.setAttribute('d', 'M32,32.07a3.1,3.1,0,1,1-3.07,3.1A3.08,3.08,0,0,1,32,32.07');
        svg.appendChild(path);
        svg.appendChild(path1);

        return svg;
    }

    createLogoDelete() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('id','svg-settings');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '18px');
        svg.setAttribute('style', 'fill: currentcolor');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M51.4,13.9v1.6c0,0.9-0.7,1.6-1.6,1.6H13.6c-0.9,0-1.6-0.7-1.6-1.6v-1.6c0-0.9,0.7-1.6,1.6-1.6h9 c0.9,0,1.6-0.7,1.6-1.6C24.3,9.7,25.1,9,26,9h11.5c0.9,0,1.6,0.7,1.6,1.6c0,0.9,0.7,1.6,1.6,1.6h9C50.7,12.3,51.4,13,51.4,13.9z');
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path1.setAttribute('d', 'M40.8,50.1l0.8-25.4h-3.3l-0.8,25.4H40.8z M30.1,50.1h3.3V24.7h-3.3V50.1z M26,50.1l-0.8-25.4h-3.3l0.8,25.4H26 z M44.9,55H18.5c-0.9,0-1.6-0.7-1.6-1.6l-1.5-31.2c0-0.9,0.7-1.7,1.6-1.7h29.4c0.9,0,1.7,0.8,1.6,1.7l-1.5,31.2 C46.5,54.3,45.8,55,44.9,55z');
        svg.appendChild(path);
        svg.appendChild(path1);

        return svg;
    }

    createLogoExpandDown() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('svg-logo');
        svg.setAttribute('id','svg-settings');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '18px');
        svg.setAttribute('style', 'fill: currentcolor');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', 'M53,26.21l-4.2-4.3a1,1,0,0,0-1.4,0L32,37.67,16.61,21.92a1,1,0,0,0-1.4,0L11,26.21a1,1,0,0,0,0,1.43L27.1,44.11l4.2,4.3a1,1,0,0,0,1.4,0l4.2-4.3L53,27.65a1,1,0,0,0,0-1.43');
        svg.appendChild(path)
        
        return svg;
    }

    createLogoDots() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '18px');
        svg.setAttribute('style', 'fill: currentcolor');
        
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

    addEventListeners() {
        /**
         * Convenience function to add all events handling functions.
         */

        this.event_ShowHideMainMenu();
        this.event_ShowFilesFromDirectory();
        this.event_TabSelection();
    }

    event_ShowHideMainMenu() {
        /**
         * This event toggle the visibility of the main menu
         * hence providing more space to interact with the 3D view when hidden
         *  - collapse/expand
         *  - add/remove scenario data (through modal screen with progress bars)
         */
        document.getElementById('menu-control').addEventListener('click', _ => {
            let m = document.getElementById('menu-main');
            m.classList.toggle('collapsed');
            m.classList.toggle('visible');
            let mct = document.getElementById('menu-container');
            mct.classList.toggle('collapsed');
            mct.classList.toggle('visible');
            let mcsvg = document.getElementById('svg-mc');
            if (m.classList.contains('visible')) {
                mcsvg.style.transform = 'rotate(180deg)';
            } else {
                mcsvg.style.transform = 'rotate(0deg)';
            }
        });
    }

    event_ShowFilesFromDirectory() {
        /**
         * This event reads and lists the content of the passed directory
         *      NOTE: should return a dictionary with name: content so that it can be referenced
         */
        let modal_list = document.getElementById("modal-list");
        document.getElementById("filepicker").addEventListener('change', e => {
            for (let file of Array.from(e.target.files)) {
              let item = document.createElement('li');
              item.textContent = file.webkitRelativePath;
              modal_list.appendChild(item);
            };
            // Add a upload button or make it visible
            document.getElementById('div-button-upload').style.display = 'inline-block';
          });
    }

    event_TabSelection() {
        /**
         * Change the color of the selected tab by adding the class current-tab and remove it from the others
         * Also, change the content of the menu
         */
        let svg_logos = document.getElementsByClassName('svg-logo');
        for (let i=0; i<svg_logos.length; i++) {
            svg_logos[i].addEventListener('click', (evt) => {
                let svgs = document.getElementsByClassName('svg-logo');
                // Loop all the tab items and remove the class
                for (let j=0; j<svgs.length; j++) {
                    svgs[j].classList.remove('current-tab');
                }
                // add the class for that index
                evt.target.classList.add('current-tab');
                // Show the select category using a classname
                let div_containers = document.getElementsByClassName('container-tab-content');
                for (let j=0; j<div_containers.length; j++) {
                    div_containers[j].classList.remove('visible');
                    if (div_containers[j].id == evt.target.id) {
                        div_containers[j].classList.add('visible');
                    }
                }
            });
        }
    }
}