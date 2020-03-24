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
- [ ] autozoom on scenewhen adding povs/rays etc
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
- X ] group colorbars by title => expand on-click
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
- [ ] make the extend function work
- [ ] item picker
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
- [ ] create resizable
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
- [ ] cleanup the weird classes like category...
- [ ] create item picker
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
- [ ] item-picker: add button to switch from searching categories/values OR allow both in the field
