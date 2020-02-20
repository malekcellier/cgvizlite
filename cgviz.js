/*
cg-viz-lite

WEBGL based visualizer for QCM output
Based off cg-viz from Markus Berglund

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-01-26
*/

// 1) Create the THREEjs environment

// 2) Dynamic handling of json files
// - button to load the files from directory
// - save the files in a dict, using directory name as key
// - present those categories in a gui
// - allow the user to select the KPI to be shown through the heatmap
// 3) Load the files
// 4) Display the files through a heatmap object


class CgVizJs extends ThreejsWrapper {
    /**
     * Subclasses ThreejsWrapper
     *  1) for better customization of the 3D part
     *      i.e adding methods to plot the pov, the rays, the kpis, etc..
     *  color scales are created from chroma.js separately for pov, rays, kpis
     *  2) for the menu interactivity part
     *      i.e. adding DOM elements to add/remove scenarios an
     */
    constructor({canvas: canvas, menu: menu}) {
        super(canvas);
        this.data = {
            'selected': null,
            'scenarios': {},
            'ranges': {}, //{'qcmTrace': {'min': +Infinity, 'max': -Infinity,}}
            'groups': {}
        }; // Data structure that will hold the data from the json files
        this.colors = {'qcmTrace': chroma.scale('Spectral')};
        this.reusables = this.createReusables();
        menu.cgviz = this;
        this.menu = menu;
    }

    setupGroups(scenarioName) {
        /**
         * Setup groups in the scene:
         *  group for the scenario, then subgroups
         * 1 group per category: universe, pov, traces, kpis
         * 
         * if found, replace it
         */
        scenarioName = scenarioName || this.cgviz.data.selected;
        
        // Scenario group
        let grp_scenario = new THREE.Group();
        grp_scenario.name = scenarioName;
        // Ref to groups are kept in order to save time afterwards
        this.data.groups[scenarioName] = {};
        this.data.groups[scenarioName]['main'] = grp_scenario;
        
        // Subgroups
        let grp_universe = new THREE.Group();
        grp_universe.name = 'Universe';
        grp_scenario.add(grp_universe);
        this.data.groups[scenarioName]['universe'] = grp_universe;
        
        let grp_povs = new THREE.Group();
        grp_povs.name = 'PoVs';
        grp_scenario.add(grp_povs);
        this.data.groups[scenarioName]['povs'] = grp_povs;
        
        let grp_traces = new THREE.Group();
        grp_traces.name = 'Traces';
        grp_scenario.add(grp_traces);
        this.data.groups[scenarioName]['traces'] = grp_traces;
        
        let grp_kpis = new THREE.Group();
        grp_kpis.name = 'Kpis';
        grp_scenario.add(grp_kpis);
        this.data.groups[scenarioName]['kpis'] = grp_kpis;

        this.scene.add(grp_scenario);
    }

    removeGroup(scenarioName) {
        /**
         * Remove a scenarion group and all its content
         */
        if (!this.isObjectInScene(scenarioName)) {
            return;
        }
        console.log('Removing group:', scenarioName);
        this.scene.getObjectByName(scenarioName).traverse((child) => {
            if (child.isGroup) {
                this.removeGroup(child.name);
            } else {
                console.log('Removing chid: ', child.name);
                child.geometry.dispose();
                child.material.dispose();
                this.scene.remove(child);
            }
        });
    }

    createReusables() {        
        /**
         * Creates resuable materials and geometries to save on memory
         */
        let reusables = {
            tx_pov: {
                geometry: new THREE.CylinderGeometry(0.2, 1, 16, 32),
                material: new THREE.MeshPhongMaterial({ color: 0x804820 }),
                dy: 8
            },
            rx_pov: {
                geometry: new THREE.CylinderGeometry(0.2, 1, 8, 32),
                material: new THREE.MeshPhongMaterial({ color: 0x702080 }),
                dy: 4
            },
        };

        return reusables;
    }

    getData(scenario) {
        return this.data.scenarios[scenario];
    }

    getCurrentData() {
        // convenience function to return the current configuration
        return this.getData(this.data.selected);
    }

    getRanges() {
        /**
         * The ranges of:
         *      povs: number of IDs combined with categories
         *      rays: from lowest to highest power
         *      kpis: for each kpi, the min and max values
         */
        let data = this.getCurrentData();
        let cdir = this.data.selected;
        this.data.ranges[cdir] = {};
    }

    getUniverseBounds(scenarioName) {
        /**
         * Calculates the bounds for each obj in the universe and finds the overall bounding box
         */
        scenarioName = scenarioName || this.data.selected; // fallback to currently selected
        let qcmUniverse = this.getData(scenarioName).qcmUniverse.objs;
        // Find the limits of the scene in order to display a plane..
        let objects = Object.keys(qcmUniverse);
        let limits = {
            center: {x: 0, y: 0, z: 0},
            min: {x: Infinity, y: Infinity, z: Infinity}, 
            max: {x: -Infinity, y: -Infinity, z: -Infinity}
        };
        for (let i=0; i<objects.length; i++) {
            let lims = this.findGroupCenter(qcmUniverse[objects[i]]);
            limits.max.x = Math.max(limits.max.x, lims.max.x);
            limits.min.x = Math.min(limits.min.x, lims.min.x);
            limits.max.y = Math.max(limits.max.y, lims.max.y);
            limits.min.y = Math.min(limits.min.y, lims.min.y);
            limits.max.z = Math.max(limits.max.z, lims.max.z);
            limits.min.z = Math.min(limits.min.z, lims.min.z);
            limits.center.x += lims.center.x/objects.length;
            limits.center.y += lims.center.y/objects.length;
            limits.center.z += lims.center.z/objects.length;
        }

        this.data.scenarios[scenarioName].limits = limits;
    }

    fitGridToScenario(scenarioName) {
        scenarioName = scenarioName || this.data.selected; // fallback to currently selected
        let limits = this.data.scenarios[scenarioName].limits;
        this.params.helpers.grid.size = Math.max(limits.max.x-limits.min.x, limits.max.y-limits.min.y);
        this.createHelpers();
    }

    createColorScales() {
        /**
         * Each group has its own color scale
         * this step is only possible once the ranges are known
         */
        this.colors.povs = chroma();
        this.colors.rays = chroma();
        this.colors.kpis = chroma.scale('Spectral');
        this.colors.qcmTrace = chroma.scale('Spectral');
    }

    toggleObjScript() {
        /**
         * NOT to be used. Just here for reference
         */
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('/qcm/api/qcmObj/' + folder + "/");
        mtlLoader.setMaterialOptions({ side: THREE.DoubleSide });
        mtlLoader.load('mtl', function (materials) {
            materials.preload();
    
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('/qcm/api/qcmObj/' + folder + "/");
            objLoader.load('obj', function (object) {
                object.children.forEach(function (mesh) {
                    console.log('Loading mesh: ', mesh);
                    var edges;
                    mesh.material.polygonOffset = true;
                    mesh.material.polygonOffsetFactor = 1;
                    mesh.material.polygonOffsetUnits = 1;
                    edges = new THREE.EdgesHelper(mesh, 0x333333);
                    edges.material.lineWidth = 2;
                    return scene.add(edges);
                });
                //object.position.set(0, -60, 0);
                scene.add(object);
            });
    
        });
        console.log('Done loading mesh');        
    }

    toggleObj() {
        /**
         * Adds the obj file with mtl
         */
        const name = this.data.selected;
        if (this.isObjectInScene(name)) {
            this.removeFromScene(name);
            console.log(' > removed object: ', name);
        } else {

            /*
            // Load the obj and the mtl files
            // use the ambient occlusion postprocessing as well as alternate coloring
            let mtlLoader = new THREE.MTLLoader();
            //mtlLoader.setPath(this.getCurrentData().obj.mtl);
            mtlLoader.setMaterialOptions({side: THREE.DoubleSide});
            //mtlLoader.load(json_data[selected_dir_name].obj.mtl.webkitRelativePath, function (materials) {
            mtlLoader.load(this.getCurrentData().obj.mtl, function (materials) {
                materials.preload();

                let objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                //objLoader.setPath();
                //objLoader.load(json_data[selected_dir_name].obj.obj, function (object) {
                objLoader.load(this.getCurrentData().obj.obj, function (object) {
                    console.log('Loading mesh');
                    let mesh = object;
                    this.scene.add( mesh );
                });
            });
            */
            let group = this.getCurrentData().obj.obj;
            let mesh = group; //.children[0];
            //let mesh = new THREE.Mesh(group, material);
            mesh.name = name;
            this.scene.add(mesh);
            //this.centerCamera();
            console.log(' > added object: ', name);
            this.findCenter();
        }
    }

    toggleGroundPlane_Old() {
        /**
         * Add a ground place for the given scenario
         */
        const name = 'GroundPlane_' + this.data.selected;
        if (this.isObjectInScene(name)) {
            this.removeFromScene(name);
            console.log(' > removed object: ', name);
        } else {
            let spans = this.getCurrentData().limits;
            let x_span = spans.max.x - spans.min.x;
            let y_span = spans.max.y - spans.min.y;
            let geometry = new THREE.PlaneBufferGeometry(x_span, y_span);
            // move the plane
            geometry.translate(spans.min.x + x_span/2, spans.min.y + y_span/2, 0);
            let material = new THREE.MeshPhongMaterial({color: 0x29323C, side: THREE.DoubleSide});
            let plane = new THREE.Mesh(geometry, material);
            plane.name = name;
            this.scene.add(plane);
        }        
    }
  
    toggleGroundPlane(scenarioName) {        
        let planeName = 'GroundPlane';
        if (this.isObjectInGroup(scenarioName, planeName)) {
            this.removeFromGroup(scenarioName, planeName, 'universe');
            log.info(`Removed ground plane from ${scenarioName}`);
        } else {
            let limits = this.getData(scenarioName).limits;
            let x_span = limits.max.x - limits.min.x;
            let y_span = limits.max.y - limits.min.y;
            let geometry = new THREE.PlaneBufferGeometry(x_span, y_span);
            // move the plane
            geometry.translate(limits.min.x + x_span/2, limits.min.y + y_span/2, 0);
            let material = new THREE.MeshPhongMaterial({color: 0x29323C, side: THREE.DoubleSide});
            let plane = new THREE.Mesh(geometry, material); 
            this.data.groups[scenarioName].universe.add(plane);
        }
    }

    toggleUniverse(scenarioName, objName) {
        /**
         * Add/remove all the objects from the Universe 
         */
        let qcmUniverse = this.getData(scenarioName).qcmUniverse.objs;
        if (this.isObjectInGroup(scenarioName, objName)) {
            this.removeFromGroup(scenarioName, objName, 'universe');            
        } else {
            let universeObject = qcmUniverse[objName];
            // Add the object to the correct subgroup, using the references
            this.data.groups[scenarioName].universe.add(universeObject);
            log.info(`Added object ${objName} in ${scenarioName}`); 
        }        
    } 

    toggleEntireUniverse(scenarioName) {
        let qcmUniverse = this.getData(scenarioName).qcmUniverse.objs;
        let objects = Object.keys(qcmUniverse);
        for (let i=0; i<objects.length; i++) {
            this.toggleUniverse(scenarioName, objects[i]);
        }
        this.toggleGroundPlane();
    }

    togglePovOld(povId) {
        /**
         * If already visible, remove, otherwise show in the scene
         */
        let pov_type = povId.replace(/[0-9]/g, '');
        let pov_id = povId.replace(/\D/g,'');
        const name = povId + ".pov";
        if (this.isObjectInScene(name)) {
            this.removeFromScene(name);
            console.log(' > removed object: ', name);
        } else {
            //let data = this.getCurrentData().qcmPov[povId];
            let data = this.getCurrentData().qcmPov[pov_type][pov_id];
            // Use the reusables
            //let povType = this.getPovCategory(povId);
            let povType = this.getPovCategory(pov_type);
            const geometry = this.reusables[povType].geometry;            
            const material = this.reusables[povType].material;            
            const povObject = new THREE.Mesh(geometry, material);
            povObject.name = name;            
            povObject.rotateY(-data.elevation); // BUG: not working due the order of the rotations?
            povObject.rotateZ((data.azimuth) - (Math.PI / 2));
            povObject.position.set(data.position[0]+this.reusables[povType].dy, data.position[1], data.position[2]);
            this.scene.add(povObject);
            console.log(' > added object: ', name);
        }
    }

    togglePovTypeMast(scenarioName, povType) {
        /**
         * Loop the povs using the ID
         *  for each pov
         *      if it is in the scene
         *      then check if the nast is there
         *          if the mast is there
         *          then remove it
         *          else add it
         * if there are no povs
         * then remove all masts
         */
        let qcmPov = this.getData(scenarioName).qcmPov;
        let povIds = Object.keys(qcmPov[povType]);
        for (let i=0; i<povIds.length; i++) {
            // The Pov
            let povName = povType + '_' + povIds[i];
            // The mast
            let mastName = 'mast_' + povType + '_' + povIds[i];
            // IF the pov is shown
            if (this.isObjectInGroup(scenarioName, povName)) {
                // Remove the mast
                if (this.isObjectInGroup(scenarioName, mastName)) {
                    this.removeFromGroup(scenarioName, mastName, 'povs');
                } else {
                    let data = qcmPov[povType][povIds[i]];
                    let material = new THREE.LineDashedMaterial({color: 0xffffff});
                    let geometry = new THREE.Geometry();
                    geometry.vertices.push(new THREE.Vector3(data.position[0], data.position[1], 0));
                    geometry.vertices.push(new THREE.Vector3(data.position[0], data.position[1], data.position[2]));
                    let mastObject = new THREE.Line(geometry, material);
                    mastObject.name = mastName;
                    this.data.groups[scenarioName].povs.add(mastObject);                    
                }
                // 
            } else { // if the pov is not shown, we remove the mast
                // Remove the mst
                if (this.isObjectInGroup(scenarioName, mastName)) {
                    this.removeFromGroup(scenarioName, mastName, 'povs');
                }                
            }
        }

    }

    togglePov(scenarioName, povType, povId) {
        /**
         * 
         */
        let qcmPov = this.getData(scenarioName).qcmPov;
        let povName = povType + '_' + povId;
        if (this.isObjectInGroup(scenarioName, povName)) {
            this.removeFromGroup(scenarioName, povName, 'povs');            
        } else {
            let data = qcmPov[povType][povId];
            let povCat = this.getPovCategory(povType);
            const geometry = this.reusables[povCat].geometry;            
            const material = this.reusables[povCat].material;            
            const povObject = new THREE.Mesh(geometry, material);
            povObject.name = povName;            
            povObject.rotateY(-data.elevation); // BUG: not working due the order of the rotations?
            povObject.rotateZ((data.azimuth) - (Math.PI / 2));
            povObject.position.set(data.position[0]+this.reusables[povCat].dy, data.position[1], data.position[2]);
            // Add the object to the correct subgroup, using the references
            this.data.groups[scenarioName].povs.add(povObject);
            log.info(`Added object ${povName} in ${scenarioName}`); 
        }
    }

    togglePovs(scenarioName, povType) {
        /**
         * AdD/remove all povs from the given type
         */
        let qcmPov = this.getData(scenarioName).qcmPov;
        let povIds = Object.keys(qcmPov[povType]).sort();
        for (let i=0; i<povIds.length; i++) {
            this.togglePov(scenarioName, povType, povIds[i]);
        }
    }

    toggleAllPovs(scenarioName) {
        /**
         * Add/remove the povs from all types
         *  if at least 1 is shown => show all
         *  if all are hidden => show all
         *  if at least 1 is hidden => show all
         *  if all are shown => hide all
         */
        let qcmPov = this.getData(scenarioName).qcmPov;
        let povTypes = Object.keys(qcmPov);
        for (let i=0; i<povTypes.length; i++) {
            this.togglePovs(scenarioName, povTypes[i]);
        }
    }

    getPovCategory(povId) {
        /**
         * Returns the pov category in order to customize the mesh
         */
        let tx_type = ['bs', 'enb', 'nb', 'tx', 'polearray', 'gnb', 'enodeb', 'gnodeb'];
        for (let i=0; i<tx_type.length; i++) {
            if(povId.toLowerCase().includes(tx_type[i])) {
                return 'tx_pov';
            }
        }
        
        let rx_type = ['ms', 'ue', 'rx'];
        for (let i=0; i<rx_type.length; i++) {
            if(povId.toLowerCase().includes(rx_type[i])) {
                return 'rx_pov';
            }
        }
        
        console.log('Using default pov since povId:', povId, ' was not found');
        return 'rx_pov';
    }

    toggleRays(txId, rxId) {
        /**
         * For the time being shows all rays
         * The rays needs to be sorted according to their strength
         * The min/max of all the rays for all the TX/RX combinations is needed in order to set the color range
         * 2020-01-31
         * The strategy should be to add objects in a pool as soon as they are created
         * then retrieve them directly when needed
         * allow the user to actually delete them
         *      - delete all
         *      - add a cross in front of a the dom representation of the trace obj 
         *          this also means greying the slider and adding a kind of load button that actually creates the object
         *          this button (once the object3d is create) will turn into a x :-)
         *      - use a buffergeometry for the lines a
         */
        const name = txId + '-' + rxId + '.trace';
        if (this.isObjectInScene(name)) {
            this.removeFromScene(name);
            console.log(' > removed object: ', name);
        } else { 
            if (this.getCurrentData().qcmTrace[txId].length == 0) {
                console.log('No trace data!!!!');
                return;
            }
            let data = this.getCurrentData().qcmTrace[txId][rxId];
            let raysObject = new THREE.Group();
            raysObject.name = name;
            
            for (let i=0; i<data.length; i++) { // this is the number of paths (each one consists in a seuqnce of rays that lead from pov a to povb)
                let material = new THREE.LineBasicMaterial({color: this.getColor(data[i].P)});
                let geometry = new THREE.Geometry();
                let rays = data[i];
                for (let j=0; j<rays.XData.length; j++) {
                    geometry.vertices.push(new THREE.Vector3(rays.XData[j], rays.YData[j], rays.ZData[j]));
                }
                let pathObject = new THREE.Line(geometry, material);
                raysObject.add(pathObject);
            }
            this.scene.add(raysObject);
            console.log(' > added object: ', name);
        }

    }

    toggleRaysBetweenPovs(scenarioName, txPovId, rxPovId) {
        /**
         * Toggle all rays between the txPov and the rxPov
         */
        let qcmTrace = this.getData(scenarioName).qcmTrace;
        let traceName = txPovId + '_' + rxPovId;
        if (this.isObjectInGroup(scenarioName, traceName)) {
            this.removeFromGroup(scenarioName, traceName, 'traces');
        } else {
            let data = qcmTrace[txPovId][rxPovId];
            let raysObject = new THREE.Group(); // All the rays inside a group
            raysObject.name = traceName;
            for (let i=0; i<data.length ; i++) {
                let material = new THREE.LineBasicMaterial({color: this.getColor(scenarioName, data[i].P)});
                let geometry = new THREE.Geometry();
                let rays = data[i];
                for (let j=0; j<rays.XData.length; j++) {
                    geometry.vertices.push(new THREE.Vector3(rays.XData[j], rays.YData[j], rays.ZData[j]));
                }
                raysObject.add(new THREE.Line(geometry, material));
            }
            this.data.groups[scenarioName].traces.add(raysObject);
            log.info(`Added object ${traceName} in ${scenarioName}`);
        }
    }

    toggleAllRaysFromPovId(scenarioName, txPovId) {
        /**
         * Toggle all rays from the given txPoV to all other rxPovs
         */
        let qcmTrace = this.getData(scenarioName).qcmTrace;
        let rxPovIds = Object.keys(qcmTrace[txPovId]);
        for (let i=0; i<rxPovIds.length; i++) {
            this.toggleRaysBetweenPovs(scenarioName, txPovId, rxPovIds[i]);
        }
    }

    toggleAllRays(scenarioName) {
        /**
         * Toggle all rays from all txPoVs to all corresponding rxPovs
         */
        let qcmTrace = this.getData(scenarioName).qcmTrace;
        let txPovIds = Object.keys(qcmTrace);
        for (let i=0; i<txPovIds.length; i++) {
            this.toggleAllRaysFromPovId(scenarioName, txPovIds[i]);
        }
    }

    getRaysRange(scenarioName) {
        /**
         * For the passed scenarioName, find the min/max values of the rays' rx power
         */
        // Reset the ranges container
        this.data.ranges[scenarioName] = {'qcmTrace': {'min': +Infinity, 'max': -Infinity}};
        // check if there is data in that scenario
        let qcmTrace = this.data.scenarios[scenarioName].qcmTrace;
        let txPovs = Object.keys(qcmTrace);
        for (let i=0; i<txPovs.length; i++) {
            let rxPovs = Object.keys(qcmTrace[txPovs[i]]);
            for (let j=0; j<rxPovs.length; j++) {
                let paths = qcmTrace[txPovs[i]][rxPovs[j]];
                for (let k=0; k<paths.length; k++) {
                    if (paths[k].P < this.data.ranges[scenarioName].qcmTrace.min) {
                        this.data.ranges[scenarioName].qcmTrace.min = paths[k].P;
                    } else if (paths[k].P > this.data.ranges[scenarioName].qcmTrace.max) {
                        this.data.ranges[scenarioName].qcmTrace.max = paths[k].P;
                    }
                }
            }
        }
    }

    getOverallRaysRange() {
        /**
         * Get the ranges across all the scenarios
         */
        let scenarios = Object.keys(this.data.scenarios);
        if (scenarios.length === 0) {
            console.log('no scenarios loaded');
            return;
        }
        this.data.ranges['overall'] = {'qcmTrace': {'min': +Infinity, 'max': -Infinity}};
        for (let i=0; i<scenarios.length; i++) {
            let scenarioName = scenarios[i];
            // Traces range
            this.getRaysRange(scenarioName);
            if (this.data.ranges[scenarioName].qcmTrace.min < this.data.ranges.overall.qcmTrace.min) {
                this.data.ranges.overall.qcmTrace.min = this.data.ranges[scenarioName].qcmTrace.min;
            } else if (this.data.ranges[scenarioName].qcmTrace.max > this.data.ranges.overall.qcmTrace.max) {
                this.data.ranges.overall.qcmTrace.max = this.data.ranges[scenarioName].qcmTrace.max;
            }
            // Others? KPIS?
        }
    }

    getRaysRange_() {
        /**
         * Find the min/max rx power values across all the rays in the scenario
         * This is mainly used to set a range for the colormap
         */
        let scenarios = Object.keys(this.data.scenarios);
        if (scenarios.length === 0) {
            console.log('no scenarios loaded');
            return;
        }
        for (let i=0; i<scenarios.length; i++) {
            let scenario = scenarios[i];
            let data = this.data.scenarios[scenario].qcmTrace;
            let TxPovs = Object.keys(data);
            for (let j=0; j<TxPovs.length; j++) {
                let RxPovs = Object.keys(data[TxPovs[j]]);
                for (let k=0; k<RxPovs.length; k++) {
                    let Paths = data[TxPovs[j]][RxPovs[k]];
                    for (let m=0; m<Paths.length;m++) {
                        if (Paths[m].P < this.data.ranges.qcmTrace.min) {
                            this.data.ranges.qcmTrace.min = Paths[m].P;
                        } else if (Paths[m].P > this.data.ranges.qcmTrace.max) {
                            this.data.ranges.qcmTrace.max = Paths[m].P;
                        }
                    }
                }
            }
        }
    }

    getColor(scenarioName, val) {
        scenarioName = scenarioName || 'overall';
        let min_ = this.data.ranges[scenarioName].qcmTrace.min;
        let max_ = this.data.ranges[scenarioName].qcmTrace.max;
        this.colors.qcmTrace.domain([min_, max_]);
        let color = this.colors.qcmTrace(val);
        color.rgb();
        color = new THREE.Color(color.toString());

        return color;
    }

    toggleHeatmap() {
    }

}

// 1) Create the THREEjs environment
var cgviz = new CgVizJs({menu: new CgVizMenu()});
cgviz.start();
cgviz.updateBackgroundColor(0x102030);
