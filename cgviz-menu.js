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
     *          menu
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
        // the widget is a simple > that get drawn using svg
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
        // add the svg to the control div
        control.appendChild(svg);
        // add the control in the menuContainer
        menuContainer.appendChild(control);        

        // 3) the menuContainer is appended to the document body
        document.body.appendChild(menuContainer);
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
         *      menu-head
         */
        let menuHeadContainer = document.createElement('div');
        menuHeadContainer.id = 'menu-head-container';
        
        let menuHead = document.createElement('div');
        //menuHead.innerText = 'MenuHead';
        menuHead.id = 'menu-head';
        
        let menuHeadLogoSvg = this.createLogo();
        let menuHeadLogoSvgDiv = document.createElement('div');
        menuHeadLogoSvgDiv.id = 'menu-head-logo-svg';
        menuHeadLogoSvgDiv.appendChild(menuHeadLogoSvg);
        menuHead.appendChild(menuHeadLogoSvgDiv);

        let menuHeadLogo = document.createElement('div');
        menuHeadLogo.id = 'menu-head-logo';
        menuHeadLogo.innerText = 'cgviz';
        /* TODO: change the color of a so that it matches the one used above
        let a = document.createElement('a');
        let linkText = document.createTextNode("cgviz-lite");
        a.appendChild(linkText);
        a.title = "cgviz-lite";
        a.href = 'https://rnd-gitlab-eu.gmail.com/'
        a.terget = '_blank';
        menuHeadLogo.append(a);
        */

        let mhls = document.createElement('div');
        mhls.id = 'menu-head-logo-subtitle';
        mhls.appendChild(document.createTextNode('lite'));
        menuHeadLogo.append(mhls);

        menuHead.appendChild(menuHeadLogo);        
        
        menuHeadContainer.appendChild(menuHead);

        let menuHeadTabs = document.createElement('div');
        menuHeadTabs.id = 'div-tab';
        // 2 submenus: scenarios and settings
        // 1) Scenario
        let svg_sce = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg_sce.setAttribute('id','svg-scenarios');
        svg_sce.setAttribute('viewBox', '0 0 64 64');
        svg_sce.setAttribute('width', '20px');
        svg_sce.setAttribute('height', '20px');
        svg_sce.setAttribute('style', 'fill: currentcolor');
        let path_sce = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path_sce.setAttribute('d', 'M50.88,43.52a3.2,3.2,0,0,1,0,5.86L34.56,56.52a6.42,6.42,0,0,1-5.13,0L13.12,49.37a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05,16.32,7.14a3.19,3.19,0,0,0,2.56,0L49.6,46.44l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95Zm0-14.39a3.2,3.2,0,0,1,0,5.86L34.56,42.13a6.42,6.42,0,0,1-5.13,0L13.12,35a3.2,3.2,0,0,1,0-5.86l4.62-2a6,6,0,0,0,1.48,1l2.16.95-7,3.05L30.72,39.2a3.19,3.19,0,0,0,2.56,0L49.6,32.06l-7-3.05,2.16-.95a6,6,0,0,0,1.48-.95ZM13.12,20.6a3.2,3.2,0,0,1,0-5.86L29.44,7.6a6.39,6.39,0,0,1,5.13,0l16.32,7.14a3.2,3.2,0,0,1,0,5.86L34.56,27.74a6.39,6.39,0,0,1-5.13,0Z');
        svg_sce.appendChild(path_sce);
        menuHeadTabs.appendChild(svg_sce);
        // 2) settings
        let svg_set = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg_set.setAttribute('id','svg-settings');
        svg_set.setAttribute('viewBox', '0 0 64 64');
        svg_set.setAttribute('width', '20px');
        svg_set.setAttribute('height', '20px');
        svg_set.setAttribute('style', 'fill: currentcolor');
        let path_set = document.createElementNS("http://www.w3.org/2000/svg", 'path');        
        path_set.setAttribute('d', 'M32.2,52.32a6.24,6.24,0,0,0,12.09,0h9.56a1.56,1.56,0,0,0,0-3.12H44.29a6.24,6.24,0,0,0-12.09,0h-22a1.56,1.56,0,0,0,0,3.12ZM16.59,33.59a6.24,6.24,0,0,0,12.09,0H53.85a1.56,1.56,0,0,0,0-3.12H28.68a6.24,6.24,0,0,0-12.09,0H10.15a1.56,1.56,0,1,0,0,3.12ZM35.32,11.74H10.15a1.56,1.56,0,1,0,0,3.12H35.32a6.24,6.24,0,0,0,12.09,0h6.44a1.56,1.56,0,0,0,0-3.12H47.41a6.24,6.24,0,0,0-12.09,0Z');
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('transform', "translate(3, 4) scale(0.9, 0.9)");
        g.appendChild(path_set);
        svg_set.appendChild(g);
        menuHeadTabs.appendChild(svg_set);
       
        menuHeadContainer.appendChild(menuHeadTabs);

        document.getElementById('menu-main').appendChild(menuHeadContainer);
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

    createMenuBody() {
        /**
         * The MenuBody content depends on what icon is activate in the menu head
         * it contains:
         *      scenarios:
         *          - a button to add a new scenario         *  
         *          - a separator
         *          - a list of boxes, one for each loaded scenarios
         * 
         *      settings:
         */
        let menuBody = document.createElement('div');
        menuBody.id = 'menu-body';
        document.getElementById('menu-main').appendChild(menuBody);

        /**
         * Scenarios menu
         */
        // Add Name
        let div = document.createElement('div');
        div.innerText = 'Scenarios';
        div.style.color = 'rgb(255, 255, 255)';
        div.style.fontSize = '20px';
        div.style.fontWeight = '400';
        div.style.letterSpacing = '1.25px';
        div.style.marginBottom = '14px';
        menuBody.appendChild(div);
        
        // Add button
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

        btn.classList.add('div-button');
        let text = document.createTextNode('Add Scenario');
        text.id = 'text-button';
        btn.appendChild(text);
        //btn.onclick = this.createModal();
        btn.onclick = function() {
            let modal = document.getElementById('modal');
            modal.style.display = "block";
        }
        menuBody.appendChild(btn);
        menuBody.appendChild(document.createElement('hr'));

        let div_scenarios = document.createElement('div');
        div_scenarios.id = 'div-scenarios';
        menuBody.appendChild(div_scenarios);

        /**
         * Settings menu
        */
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
         */
        let container = document.createElement('div');
        container.classList.add('modal');
        container.id = 'modal';

        let content = document.createElement('div');
        content.classList.add('modal-content');

        let x = document.createElement('span');
        x.classList.add('close');
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('viewBox', '0 0 18 18');
        svg.setAttribute('width', '18px');
        svg.setAttribute('height', '18px');
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); 
        path.setAttribute('d', 'M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z');
        //x.innerText = 'x';
        svg.appendChild(path);
        x.appendChild(svg);
        // When the user clicks on <span> (x), close the modal
        x.onclick = function() { 
            container.style.display = "none";
            document.getElementById('div-button-upload').style.display = 'none';
        };
        content.appendChild(x);
        
        // Create a header, body in this div
        let subcontent = document.createElement('div');
        subcontent.id = 'subcontent';
        let sc_head = document.createElement('div');
        sc_head.id = 'subcontent-head';
        
        //let div = document.createTextNode('Add Scenario');
        let div = document.createElement('div');
        div.innerText = 'Add Scenario';
        div.style.color = 'rgb(25, 25, 25)';
        div.style.fontSize = '20px';
        div.style.fontWeight = '400';
        div.style.letterSpacing = '1.25px';
        //div.style.marginBottom = '14px';
        sc_head.appendChild(div);
        let div_under = document.createTextNode('select a directory below, then press the Upload button');
        sc_head.appendChild(div_under);

        subcontent.appendChild(sc_head);
        subcontent.appendChild(document.createElement('hr'));

        /**
         * BODY
         */
        let sc_body = document.createElement('div');
        sc_body.id = 'subcontent-body';

        // Add progressbar

        // update list of files as they are loaded
        let div_ul = document.createElement('div');
        div_ul.style.overflow = 'auto';
        div_ul.style.height = '100%';
        div_ul.style.border = '1px dotted black';
        let ul = document.createElement('ul');
        ul.id = 'listing';
        div_ul.appendChild(ul);
        sc_body.appendChild(div_ul);
        //sc_body.appendChild(ul);

        // Add input
        let div_nput_btn_container = document.createElement('div');
        div_nput_btn_container.id = 'div-input-btn-container';
        
        // UPLOAD button hidden to start with
        let div_btn = document.createElement('div');
        div_btn.id = 'div-button-upload';
        div_btn.classList.add('div-button');
        div_btn.addEventListener('click', () => {
            //alert('clicked Upload');
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
        //nput.addEventListener('change', (event) => this.loadDirectory(event));
        div_nput.appendChild(nput);
        div_nput_btn_container.appendChild(div_nput);
        //sc_body.appendChild(div_nput);
        //sc_body.appendChild(nput);        
        
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
         */
        let div = document.createElement('div');
        div.classList.add('div-scenario');
        div.innerText = 'Scenario1';

        return div;
    }

    addEventListeners() {
        /**
         * Adds Events handling:
         *  Left Menu
         *  - collapse/expand
         *  - add/remove scenario data (through modal screen with progress bars)
         *  - 
         *  Right menu
         *  - info icon
         *  - legend icon
         *  - other icon??
         *  
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
        this.showFilesInDirectory();
    }

    showFilesInDirectory() {
        /**
         * Reads and lists the content of the passed directory
         *      should return a dictionary with name: content so that it can be referenced
         */
        let listing = document.getElementById("listing");
        document.getElementById("filepicker").addEventListener('change', e => {
            for (let file of Array.from(e.target.files)) {
              let item = document.createElement('li');
              item.textContent = file.webkitRelativePath;
              listing.appendChild(item);
            };
            // Add a upload button or make it visible
            document.getElementById('div-button-upload').style.display = 'inline-block';
          });
    }
}