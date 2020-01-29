# cg-viz-light
Visualizer for Coffe Grinder

# Getting started

* Install python (you can find instructions [here](http:///wikis/home))
* Maybe it is necessary to install the libs for cg-universe-osm. You can find the instructions in the readme file for cg-universe-osm [here](http://-universe-osm) (Running cg-viz without these libs have not been tested)
* Clone cg-viz-light repository
* cd &lt;cg-viz root>
* Run run "pip install --no-index --find-links ./py_libs/ -r requirements.txt "

## How to
Configure sys in QCM to enable the visualizer:

    enableViz             = true
    cgvizPath             = '../cg-viz'
    cgvizOutput           = 'd:/temp/outputQcm'

This will put output for the visualizer in the folder 'd:/temp/outputQcm'. You will need to manually empty the folder to make sure you dont have any left-overs from other simulations.

Launch the visualization server by running the command

    cg_viz.start

in Matlab.

This will launch a browser window for your default browser. **Note that the visualizer is only tested in Chrome.**
