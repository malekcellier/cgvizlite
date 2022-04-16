# cg-viz-lite
Visualizer for QCM raytracer

# Getting started

* Install python (you can find instructions [here](http:///wikis/home))
* Clone cg-viz-lite repository

## How to get results
In order to get simulation results to display, configure sys in QCM to enable the visualizer:

    enableViz             = true
    cgvizPath             = '../cg-viz'
    cgvizOutput           = 'd:/temp/outputQcm'

This will put output for the visualizer in the folder 'd:/temp/outputQcm'. You will need to manually empty the folder to make sure you dont have any left-overs from other simulations.

Launch the visualization server by running the command

    ./start.bat

in a command line editor inside the cloned folder.

This may or may not launch a browser window. Otherwise open one tab and navigate to the address: localhost:8011

**Note that the visualizer is tested in Chrome & FIrefox.**


# Features
- multiple scenes
- deferred rendering
- object life cycle
- heatmaps
- filters
- screenshot
