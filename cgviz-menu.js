/*
cg-viz-menu

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
        this.menu = this.createMenuContainer();
    }

    createMenuContainer() {
        /**
         * This is the top level of the menu structure
         * The MenuContainer contains:
         *      - the menu
         *      - the control: 
         *          > when closed
         *          < when opened
         */
        let menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        menuContainer.classList.add('visible');
        
        let menu = document.createElement('div');
        menu.id = 'menu';
        menu.classList.add('visible');
        menuContainer.appendChild(menu);
        
        let control_icon = document.createElement('svg');
        control_icon.id = 'mc-svg';
        control_icon.setAttribute("viewBox", "0 0 64 64");
        control_icon.setAttribute("width", "12px");
        control_icon.setAttribute("height", "12px");
        control_icon.style = "transform: rotate(180deg)";        
        let path = '<path d="M26.7,54.7l-4.5-4.4c-0.4-0.4-0.4-1,0-1.4L38.6,33L22.2,17c-0.4-0.4-0.4-1,0-1.5l4.5-4.4c0.4-0.4,1.1-0.4,1.5,0 l17.1,16.7l4.5,4.4c0.4,0.4,0.4,1,0,1.4L45.2,38L28.2,54.7C27.8,55.1,27.1,55.1,26.7,54.7"></path>';
        control_icon.innerHTML = path;

        let control = document.createElement('div');
        control.id = 'menu-control'
        control.appendChild(control_icon);
        menuContainer.appendChild(control);

        document.body.appendChild(menuContainer);

        return menuContainer;
    }

    createMenuHeader() {
        /**
         * The MenuHeader contains:
         *      - the 
         */
        let menuContainer = document.createElement('div');
    }
}