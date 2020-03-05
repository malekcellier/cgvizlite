2020-02-04
----------
- [X] div for pov
- [X] div for rays
    - [X] tx: collapsible
        - [ ] rx: group somehow
- [ ] div for kpis
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
- [ ] python script to gather pov files and trace file per tx, respectively
- [ ] add id to sub-menu-content-pov that captures the povType_povID
- [ ] automatic zoom when adding povs etc

2020-02-19
----------
- [X] add option to show/hide a vertical line from ground to center of PoV
- [X] add autosize option to the grid settings
- [ ] fix the modal window size (appearant when not in big screen)
- [ ] replace finished_yet with promises
- [X] remove the output from the json loading
- [ ] bug toggle plane does not remove the plane
- [ ] toggle eyes in subcategories of Universe
- [ ] toggle eyes in subcategories of scenario
- [ ] bug: antenna position (probably due to rotations)
- [ ] feature: create buttons that depend on the state of other buttons
- [ ] feature: kpi
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