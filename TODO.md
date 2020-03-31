2020-02-04
----------
- [X] div for pov
- [X] div for rays
    - [X] tx: collapsible
        - [ ] rx: group somehow
- [X] div for kpis
- [ ] load material and apply to obj file

2020-02-10
----------
- [X] menu creation
- [ ] legend: update the module. add settings to choose look
- [X] info
- [X] settings
- [ ] deferred rendering
- [ ] clean file list
- [ ] change "Upload" button to "Exit" if all ok
- [ ] change _finishedYet to using Promises instead

2020-02-15
-----------
- [X] save screenshots
- [ ] stats.js
- [ ] deferred rendering
- [X] scenario handling with groups
    - [X] 1 group per scenario
        - [X] 1 group per category:
            - [X] universe
            - [X] pov
            - [X] traces
            - [X] kpis
    - [?] show/hide vs add/remove? => show/hide seems better
- [ ] generic html headers of various categories
    - 
- [ ] objects disposal
- [ ] smart labels
- [X] kpis
- [X] heatmap
- [ ] colormaps

Scene organization and Naming convention:
> for each scenario create a group
> in the scenario group, create subgroups:
    > Helpers, a group for the helpers
    > Universe, a group for the universe
    > PoVs, a group for the povs
    > Kpis, a group for the kpis

2020-02-17
----------
- [X] python script to gather pov files and trace file per tx, respectively
- [ ] add id to sub-menu-content-pov that captures the povType_povID
- [ ] automatic zoom when adding povs etc

2020-02-19
----------
- [X] add option to show/hide a vertical line from ground to center of PoV
- [X] add autosize option to the grid settings
- [X] fix the modal window size (appearant when not in big screen)
- [ ] replace finished_yet with promises
- [X] remove the output from the json loading
- [X] bug toggle plane does not remove the plane
- [ ] toggle eyes in subcategories of Universe
- [ ] toggle eyes in subcategories of scenario
- [ ] bug: antenna position (probably due to rotations)
- [ ] feature: create buttons that depend on the state of other buttons
- [X] feature: kpi
- [ ] cleanup the names in the css. Make them more logical
- [X] XY, YZ, ZX views

> KPIs
------
> each kpi has the following inputs:
    > x, y, z translation (z is height as before)
    > display mode: 
        > ID
        > Best
        > Worst
        > Mean
        > Sum
    > Tx selector
        > Tx ID: as radio button
        > AA ID: as radio button
    > Rx selector
        > AA ID: as radio button
    > color scheme => update legend
    > tile size

2020-02-20
----------
- [X] auto-size grid => became fit to scene
- [ ] change fitgrid to button instead of a switch
- [X] PoV mast
- [ ] Feature/Bug pov mast display depends on the click order :-/
- [ ] pov mast colors => same as povs to start with (helps distinguish them)
- [ ] clear webgl contexts: https://stackoverflow.com/questions/54913836/how-to-properly-dispose-of-my-webgl-context-in-order-to-avoid-the-16-webgl-conte
- [ ] autozoom on scene when adding povs/rays etc
- [ ] BUG: .sub-menu.switch behaves differently in Settings vs Interactions. Why?
- [ ] Add height control to KPI (while maintaining it constant)
- [ ] Fix the range when plotting a given KPI so that the colors are the same from one graph to the next

2020-02-21
----------
- [X] overflow of KPIs content
- [ ] customize appearance of pov to make them more visible
- [ ] customize appearance of obj to make them sexy
- [ ] customize appearance of traces to make them sexy (bloom effect)

2020-02-22
-----------
- [ ] color range of sum is out of bounds
- [X] add id/value toggle next to the tx selector

2020-03-04
-----------
- [ ] make MAST option independent, maybe on a different row
- [ ] change the Coverage/Acoverage to BEST: id/value & WORST: id/value
- [ ] add extra KPI: some form of SINR => BEST - SUM(others)
- [ ] when clicking on eye: remove all if at least one is shown. Otherwise hide all
        which also implies that the state of the eye has to be changed as soon as 1 subelement is shown
- [X] add the container div + canvas when creating cgvizjs
- [ ] add the count of meshes, vertices, MB etc..
- [X] remove colorbar when all are unclicked
- [X] group colorbars by title => expand on-click
- [ ] colorbar for the traces
- [ ] category for KPI: composite/ID
- [ ] do not populate the kpis, instead provide a menu to add/remove
- [ ] alternative label implementation: https://github.com/jrtashjian/demo-threejs-object-labels

2020-03-08
-----------
- [ ] decouple view from model (for ex, the css contains references to pov and other model elements. Instead, a set of widgets should be defined and used for the relevant parts. That's the same idea I have had for a while: defining a hierarchy of component. This will simplify the css as well as the building of the spa)
- [ ] labels rendering seems slow (higher than normal CUP usage even in the absence of interaction)
- [ ] make legend and legend settings height relative to the window height 

2020-03-09
----------
- [ ] add the name of the currently visible heatmap somewhere visible on the canvas

2020-03-10
----------
- [X] create test home page to show and test the ui components
- [X] refactor svg icon code to make it independent
- [X] implement tooltips for icons

2020-03-11
----------
- [X] make icon change color on click 
- [X] make icon change shape on click 
    - [X] down/up
    - [X] switch-on/switch-off
    - [X] 3d/2d
- [X] implement method to extend any function (to be used to avoid repeating code in the eventListeners)
- [X] create a demo page to showcase and test the ui components
- [X] create ui component: discrete legend (based on colormap)
- [X] create ui component: switch (square)?
- [X] create ui component: checkbox (= label + square_switch)
    - [X] make switches only one svg + rotation + label update
- [X] create ui component: dropdown
- [X] create ui component: slider
- [X] create ui component: double slider
- [X] create ui component: colormap editor
    - [X] create ui component: color-palette
- [ ] rebuild cgviz-menu using ui.js instead
    - [ ]

2020-03-15
----------
- [X] update the colorpalette with each n_steps/category/reverse change
- [X] apply colorpalette changes to colorbar
- [ ] dropdown: hide the list of items when mouse is leaving the list (in order to avoid several panels open at the same time)
- [X] make the extend function work
- [X] item picker
    - categories of KPIS => 1 color per category (power, time)
- [ ] group similar items (RX) => requires a way to group them
- [ ] color definition, all brewer + uber? see also https://www.groundai.com/project/colorspace-a-toolbox-for-manipulating-and-assessing-colors-and-palettes/1
    - [X] brewer color definitions
- [ ] bug: reversed settings does not work correctly. The colormap is updated in a wrong way
- [X] bug: the border is not updated
- [X] bug: the border causes the container to trigger overflow => fixed by  moving the tootip above...
- [ ] when changing the category, the DSC is not updated immediately. do it a second time, and it updates!
- [X] reversed does not update the DCB
- [X] precision has no effect...
- [X] double slider with min/max is missing
- [ ] align numbers in DCB. See https://stackoverflow.com/questions/1363239/aligning-decimal-points-in-html
    See also https://devhints.io/css-flexbox the Table-like category, uses flexbox

2020-03-16
----------
- [X] change precision to fixed decimal precision in the legend
- [X] text in legend gets wrapped to the next line. Make sure it stays in its line
- [ ] colorbarsettings: 'reversed' changes the palette but the DCB is not updated
- [X] default precision value is not applied
- [X] precision 0 is not applied (looks like 4 is applied instead)
- [ ] default 'category' and 'scheme' are not applied in the colorpalette
- [X] remove id in dropdown under color category
- [X] do not change the selected when the n_colors and reversed is activated
- [X] make sure the CBS panel reads the values from the DCB
- [ ] reversed icon is reset each time the panel is reopened
- [ ] some bug with selected that disappears again when changing the settings around

2020-03-18
----------
- [X] double slider using 2 actual sliders
- [X] redesign slider to make it look like it belongs with the rest of the components


2020-03-22
-----------
- [ ] create movable
- [X] create resizable
- [X] create tooltip
- [X] restructure ui.js by category of widget
- [X] restructure ui.css by category of widget
- [X] organize demo
- [X] create button
- [X] create cancel button
- [X] adjust svg size
- [X] create generic header
- [ ] create slider from divs (using the window events I didnot want to use)
- [ ] create double slider from divs (using the window events I didnot want to use)
- [ ] cleanup the label/title/subtitle styling and usage
- [ ] cleanup the weird classes like 'category'...
- [X] create item picker
- [ ] style input range for chrome & IE..
- [ ] check if there is a better way to handle the default parameters opts (there is a lot of repeating going on)

2020-03-23
-----------
- [ ] create a hierarchy of headers and content (maybe 3 levels are enough, style so that the progression is obvious)
- [ ] remove "edges" settings from the colorbar
- [ ] review the naming conventions, colorbar, colormap etc
- [X] processKpis copy existing files automatically
- [X] handle compact json files in cgviz-menu.js
- [X] make sure the old json files are saved and zipped under "old" directory

2020-03-24
----------
- [X] item-picker: populate items list based on key search
- [ ] item-picker: create config categories for cgviz kpis
- [ ] item-picker: close on click
- [ ] item-picker: select on click (in case multi is allowed)
- [X] item-picker: create 3 new colors for the items: orange, indigo, violet
- [X] item-picker: ~~add button to switch from searching categories/values OR~~ allow both in the field
- [X] item-picker: search-items hidden on start
- [X] item-picker: search-items should appear upon click in the field
- [ ] item-picker: search-items should disappear when losing items focus
- [X] item-griper: connect the picker to the grouper
- [X] item-grouper: populate dynamically
- [ ] item-griper: hide the search bar initially, show it when the user clicks in the area of the grouper:content
- [X] makeResizable: reuse component from the web

2020-03-25
----------
- [X] makeResizable: does not work with Panel. it doesn't seem to get the right parent size
- [ ] loading a scenario with 5000+ povs makes the qcmTrace display impossibly slow. Maybe process the eye-toggle in a different way.
        i.e. when toggled one by one, keep the same strategy but when all are wanted at the same time, then used a merge geometry or a buffer geometry like we did in the heatmap.
- [ ] image comparer for the KPIs heatmap: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_image_compare THis can also be used to understand how to create own slider...
- [ ] div expander/collapser: group divs (like the ones representing the pov) under a div with a range
    click on range.
        OR use a search field to add items with a x to remove them (as in the "Grouper")
- [ ] file reader component for the UI
- [X] contextmenu component
- [X] using modules instead of including in html => does not work for chroma.min.js

2020-03-26
----------
- [ ] Headers definition for cgviz
- [X] padding and embedded components: consider adding a parameter in opts like opts.embedded that toggles the padding 
- [X] Component: simple context menu
- [ ] consider using mutation observer to sync the innerText for ex (see solution used in DropDown implementation)
- [ ] review all components and homogenize the code, check the labels, check the way other items are accessed
        try to use el.closet instead of a chain of parentElement
- [ ] use the obj paradigm to control the components values like in datgui. Maybe a Proxy can be used for that.
    this means having a json object inside the UI 
- [ ] turn UI into a set of classes? all would inherit from a basic component that controls the way the input is passed
    plus extra functions for the common operations.
- [X] make the categories in the demo clickable=> collapse examples. Since now there are quite numerous.
- [ ] try resizable with an invisible border around the window
- [X] Component: modal
- [X] Component: fixed
- [X] remove the Wigdet and replace with 'embded' option in opts
- [X] component DiscreteColorbar: fix reverse
- [ ] component DiscreteColorbar: add option to reverse the list of values
- [ ] component DiscreteColorbar: add option for cotinuous colormap =>colorbar becomes continuous too
- [X] component: progressbar
- [ ] component: proxy for value/component syncing. to hold the states of all components
        ech time a change is made to the state json, then the corresponding modules should be updated
- [ ] component: svg-based heatmap

2020-03-27
----------
- [ ] use the encapsulation paradigm for all complex components like DiscreteColorBar, ItemGriper (as done with FileHandler, ContextMenu, Modal)
- [X] component: progressbar
- [X] component: progressbar group
- [ ] create simple svg heatmap in order to demonstrate the DCB settings

2020-03-28
----------
- [X] move demo.html style to demo.css
- [X] refactor demo.html js to provide simpler API to add items to the demo
- [X] modal with click outside to remove it from dom
- [X] bug fix: resizable not targeting right part of the element
- [X] component: movable
- [ ] rewrite resizable to make it the same as movable?
- [ ] component: tab module
- [ ] legend filtering: click on svg w/ color to toggle that color

2020-03-30
----------
- [ ] LOW: add a resize icon in the header of a panel in order to toggle resizable,movable
- [ ] LOW: make borders flash and show the resizbale controls in case the resizabel has been choosen
- [ ] BUG: heatmap does not resize correctly and is greyed out. maybe due to z-index?
- [X] component: finish FileHandler (DirectoryReader + FileReader + ProgressBarGroup)
- [ ] FEATURE: create svg based heatmap
- [X] include ff-clan-web-pro font in demo
- [ ] BUG: resizable should probe the container min-width/height
- [ ] FEATURE: title/subtitle component. 
- [ ] tooltip following mouse
- [ ] item picker + tooltip (with fake values)
- [ ] rename poorly chosen class names for label value, label description
- [ ] clean input in case operation is cancelled (either by clicking x or outisde the area)
- [ ] when all files are loaded successfully => alert
- [ ] change the color to red for files with problems
- [ ] for each successful file, change the italic to normal font

2020-03-31
-----------
- [ ] DSC settings: add option to reverse the colorbar labels
