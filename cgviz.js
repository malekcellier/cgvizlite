/*
CgVizJs Class 

WEBGL based visualizer for QCM output
Inspired from cg-viz from Markus Berglund

# Author: Malek Cellier
# 
# Email: malek.cellier@gmail.com
# Created: 2020-01-26
*/


class CgVizJs extends ThreejsWrapper {
    /**
     * CgVizJs subclasses ThreejsWrapper:
     *  - for better customization of the 3D part
     *      i.e adding methods to plot the pov, the rays, the kpis, etc..
     *  - color scales are created from chroma.js separately for pov, rays, kpis
     *  - for the menu interactivity part
     *      i.e. adding DOM elements to add/remove scenarios an
     */
    constructor({canvas: canvas, menu: menu}) {
        super(canvas);
        this.consoleWelcome();
        this.data = { // Data structure that will hold the data from the json files
            'selected': null,
            'scenarios': {},
            'ranges': {},
            'groups': {}
        };
        this.colors = {'qcmTrace': chroma.scale('Spectral')};
        this.reusables = this.createReusables(); // threejs objects
        menu.cgviz = this; // reference to the cgviz available in the menu
        this.menu = menu;
    }

    setupGroups(scenarioName) {
        /**
         * Setup groups in the scene. Group in this context is meant as a threejs concept.
         * 
         * Threejs Scene organization and Naming convention:
         *   1 Group per scenario, then for each such Group create subgroups:
         *      Helpers, a group for the helpers
         *      Universe, a group for the universe
         *      PoVs, a group for the povs
         *      Kpis, a group for the kpis, then create subgroups:
         *          1 Group per KPI..
         */
        scenarioName = scenarioName || this.data.selected;
        
        console.group('Setup the Scene Graph');
        console.time('Setup the Scene Graph');
        // Scenario group
        let grp_scenario = new THREE.Group();
        grp_scenario.name = scenarioName;
        console.info(`add group for scenario: ${scenarioName}`);
        // Ref to groups are kept in order to save time afterwards
        this.data.groups[scenarioName] = {};
        this.data.groups[scenarioName]['main'] = grp_scenario;
        
        // Subgroups
        let grp_universe = new THREE.Group();
        grp_universe.name = 'Universe';
        grp_scenario.add(grp_universe);
        console.info(`  add subgroup: ${grp_universe.name}`);
        this.data.groups[scenarioName]['universe'] = grp_universe;
        
        let grp_povs = new THREE.Group();
        grp_povs.name = 'PoVs';
        grp_scenario.add(grp_povs);
        console.info(`  add subgroup: ${grp_povs.name}`);
        this.data.groups[scenarioName]['povs'] = grp_povs;
        
        let grp_traces = new THREE.Group();
        grp_traces.name = 'Traces';
        grp_scenario.add(grp_traces);
        console.info(`  add subgroup:${grp_traces.name}`);
        this.data.groups[scenarioName]['traces'] = grp_traces;
        
        let grp_kpis = new THREE.Group();
        grp_kpis.name = 'Kpis';
        console.info(`  add subgroup:${grp_kpis.name}`);
        // Adding one sub-group per kpi
        let kpis = this.data.scenarios[scenarioName].qcmKpis.nfo.KPIS;
        for (let i=0; i<kpis.length; i++) {
            let sg = new THREE.Group();
            sg.name = kpis[i];
            grp_kpis.add(sg);
            console.info(`      add subsubgroup: ${kpis[i]}`);
        }
        grp_scenario.add(grp_kpis);
        this.data.groups[scenarioName]['kpis'] = grp_kpis;

        this.scene.add(grp_scenario);
        console.groupEnd('Setup the Scene Graph');
        console.timeEnd('Setup the Scene Graph');
    }

    removeGroup(scenarioName) {
        /**
         * Remove a scenario group and all its content
         */
        if (!this.isObjectInScene(scenarioName)) {
            return;
        }
        console.info(`RemoveGroup: ${scenarioName}`);
        this.scene.getObjectByName(scenarioName).traverse((child) => {
            if (child.isGroup) {
                this.removeGroup(child.name);
            } else {
                console.info(`Remove Child: ${child.name}`);
                child.geometry.dispose();
                child.material.dispose();
                this.scene.remove(child);
            }
        });
    }

    createReusables() {        
        /**
         * Creates resuable materials and geometries to save on memory
         * The PoV are represented by cone-like cylinders
         * an alternative would be a rectangle for the array together with an arrow for the bearing in space
         */
        let alpha = 1;
        let beta = 1;
        let gamma = 0.8;
        let diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 )
        let mat = new THREE.MeshStandardMaterial( {
            color: diffuseColor,
            metalness: beta,
            roughness: 1.0 - alpha,
        } );

        // specify the size of the antenna direction
        let params = {
            tx: {
                radiusTop : 0.4,
                radiusBottom : 2, 
                height: 24,
                radialSegments: 32
            },
            rx: {
                radiusTop : 0.4,
                radiusBottom : 2, 
                height: 16,
                radialSegments: 32
            }
        };

        let reusables = {
            tx_pov: {
                geometry: new THREE.CylinderGeometry(params.tx.radiusTop, params.tx.radiusBottom, params.tx.height, params.tx.radialSegments),
                material: new THREE.MeshPhongMaterial({color: 0xEE0000, shininess: 100, emissive: 0x0 })
            },
            rx_pov: {
                geometry: new THREE.CylinderGeometry(params.rx.radiusTop, params.rx.radiusBottom, params.rx.height, params.rx.radialSegments),
                material: new THREE.MeshPhongMaterial({color: 0x0000EE, shininess: 100, emissive: 0x0  })
            },
        };

        // Modify the position so that the rotation gives the right result
        reusables.tx_pov.geometry.translate(0, params.tx.height/2, 0);
        reusables.rx_pov.geometry.translate(0, params.rx.height/2, 0);

        return reusables;
    }

    getData(scenario) {
        return this.data.scenarios[scenario];
    }

    getCurrentData() {
        // convenience function to return the current configuration
        return this.getData(this.data.selected);
    }

    getRanges(scenarioName) {
        /**
         * The ranges of:
         *      povs: number of IDs combined with categories
         *      rays: from lowest to highest power
         *      kpis: for each kpi, the min and max values
         */
        console.group('Get ranges');
        this.data.ranges[scenarioName] = {};
        this.getRaysRange(scenarioName);
        this.getKpisRange(scenarioName);
        this.getPovsRange(scenarioName);
        console.groupEnd('Get ranges');
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
         * NOT TO BE USED
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
  
    toggleGroundPlane(scenarioName) {     
        /**
         * Toggle the ground plane which dimensions match the boundingbox of the group
         */   
        let planeName = 'GroundPlane';
        if (this.isObjectInGroup(scenarioName, planeName)) {
            console.info(`ToggleGroundPlane: remove ${planeName} from ${scenarioName}`);
            this.removeFromGroup(scenarioName, planeName, 'universe');
        } else {
            console.info(`ToggleGroundPlane: add ${planeName} from ${scenarioName}`);
            let limits = this.getData(scenarioName).limits;
            let x_span = limits.max.x - limits.min.x;
            let y_span = limits.max.y - limits.min.y;
            let geometry = new THREE.PlaneBufferGeometry(x_span, y_span);
            // Move the plane to the appropriate location
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
            console.info(`ToggleUniverse: object ${objName} in ${scenarioName}`); 
        }        
    } 

    toggleEntireUniverse(scenarioName) {
        let qcmUniverse = this.getData(scenarioName).qcmUniverse.objs;
        let objects = Object.keys(qcmUniverse);
        console.info(`ToggleEntireUniverse: ${scenarioName}`); 
        for (let i=0; i<objects.length; i++) {
            this.toggleUniverse(scenarioName, objects[i]);
        }
        this.toggleGroundPlane();
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
            this.removeLabel(scenarioName, povName);
        } else {
            let data = qcmPov[povType][povId];
            let povCat = this.getPovCategory(povType);
            const povObject = new THREE.Mesh(this.reusables[povCat].geometry, this.reusables[povCat].material);
            povObject.name = povName;            
            povObject.rotateY(-data.elevation); // BUG: not working due the order of the rotations?
            povObject.rotateZ((data.azimuth) - (Math.PI / 2));
            povObject.position.set(data.position[0], data.position[1], data.position[2]);
            // Add the object to the correct subgroup, using the references
            this.data.groups[scenarioName].povs.add(povObject);
            this.addLabel(scenarioName, povName);
            console.info(`Added object ${povName} in ${scenarioName}`); 
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

    getPovsRange(scenarioName) {
        /**
         * For the passed scenarioName, find the number of Povs of each category
         */
        // Reset the ranges container
        console.group('Get povs ranges');
        console.time('Get povs ranges');
        
        this.data.ranges[scenarioName].qcmPovs = {'min': +Infinity, 'max': -Infinity};
        
        console.groupEnd('Get povs ranges');
        console.timeEnd('Get povs ranges');
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
            console.info(`Added object ${traceName} in ${scenarioName}`);
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
        console.group('Get rays ranges');
        console.time('Get rays ranges');
        // Reset the ranges container
        this.data.ranges[scenarioName].qcmTrace = {'min': +Infinity, 'max': -Infinity};
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
        console.groupEnd('Get rays ranges');
        console.timeEnd('Get rays ranges');        
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

    processKpis(scenarioName) {
        /**
         * process the kpis data
         */
        scenarioName = scenarioName || this.data.selected;

        console.group('Process the KPIs');
        console.time('Process the KPIs');
        let processedKpis = {
            coords: {x: [], y: [], z: []},
            tx: {}
        };
        let qcmKpis = this.getData(scenarioName).qcmKpis;
        let kpiNames = qcmKpis.nfo.KPIS;
        // the coords are the same for all the tx
        console.info('Copies the coordinates');
        let n_values = qcmKpis['Tx01'].length;
        for (let i=0; i<qcmKpis['Tx01'].length ; i++) {
            let xyz = qcmKpis['Tx01'][i].XYZ;
            processedKpis.coords.x.push(xyz[0]);
            processedKpis.coords.y.push(xyz[1]);
            processedKpis.coords.z.push(xyz[2]);
        }
        // Collect the data per TX
        console.info('Copies the data');
        let txIds = Object.keys(qcmKpis);
        for (let i=0; i<txIds.length; i++) {
            if (txIds[i] === 'nfo') {
                continue;
            }
            let txId = txIds[i].replace(/\D/g,''); // stripping the letters
            processedKpis.tx[txId] = {};
            // init the KPIs array
            for (let j=0; j<kpiNames.length; j++) {
                processedKpis.tx[txId][kpiNames[j]] = [];
            }
            for (let k=0; k<qcmKpis[txIds[i]].length ; k++) {
                let data = qcmKpis[txIds[i]][k].KPIS;
                for (let m=0; m<kpiNames.length; m++) {
                    let kpiName = kpiNames[m];
                    let value = data[kpiName][0];
                    processedKpis.tx[txId][kpiName].push(value);
                }
            }
        }
        console.info('Initializes the extras');
        // Add the extra categories: min, max, mean, sum
        let extras = ['Best', 'Worst', 'Mean', 'Sum'];
        for (let i=0; i<extras.length; i++) {
            processedKpis[extras[i]] = {};
            for (let j=0; j<kpiNames.length; j++) {
                //processedKpis[extras[i]][qcmKpis.nfo.KPIS[j]] = {id: [], val: []};
                if (extras[i] === 'Worst') {
                    processedKpis.Worst[kpiNames[j]] = {
                        id: Array(n_values).fill(null),
                        val: Array(n_values).fill(Infinity)
                    };
                }
                if (extras[i] === 'Best') {
                    processedKpis.Best[kpiNames[j]] = {
                        id: Array(n_values).fill(null),
                        val: Array(n_values).fill(-Infinity)
                    };
                }
                if (extras[i] === 'Mean') {
                    processedKpis.Mean[kpiNames[j]] = Array(n_values).fill(0);
                }
                if (extras[i] === 'Sum') {
                    processedKpis.Sum[kpiNames[j]] = Array(n_values).fill(0);
                }
            }
        }
        console.info('Populates the extras');
        // add te data to the extra categories
        let nTx = txIds.length - 1;
        for (let i=0; i<kpiNames.length; i++) {
            for (let j=0; j<n_values; j++) {
                for (let k=0; k<txIds.length; k++) {
                    if (txIds[k] === 'nfo') {continue;}
                    let txId = txIds[k].replace(/\D/g,'');
                    let val = processedKpis.tx[txId][kpiNames[i]][j];
                    if ((val > processedKpis.Best[kpiNames[i]].val[j]) && (val !== null)) {
                        processedKpis.Best[kpiNames[i]].val[j] = val;
                        processedKpis.Best[kpiNames[i]].id[j] = txId;
                    }
                    if ((val < processedKpis.Worst[kpiNames[i]].val[j]) && (val !== null)) {
                        processedKpis.Worst[kpiNames[i]].val[j] = val;
                        processedKpis.Worst[kpiNames[i]].id[j] = txId;
                    }
                    processedKpis.Mean[kpiNames[i]][j] += val/nTx;
                    processedKpis.Sum[kpiNames[i]][j] += val;

                }
            }
        }
        

        // Save the post processed data
        this.data.scenarios[scenarioName].processedKpis = processedKpis;
        console.groupEnd('Process the KPIs');
        console.timeEnd('Process the KPIs');
    }

    toggleHeatmap(scenarioName, kpiName, txPovType, txPovIds, ids, n_colors, scheme, reverse) {
        /**
         * TODO: when clicked away, all other heatmap have to be removed!!!
         */
        let qcmKpis = this.getData(scenarioName).processedKpis;

        // Remove all the heatmaps
        for (let i=0; i<txPovIds.length; i++) {
            let heatMapName = kpiName + '_' + txPovType + '_' + txPovIds[i];    
            if (ids[i] === false) { // remove if present
                if (this.isObjectInGroup(scenarioName, heatMapName)) {
                    this.removeFromGroup(scenarioName, heatMapName, 'kpis');
                }
            } else {
                if (this.isObjectInGroup(scenarioName, heatMapName)) {
                    this.removeFromGroup(scenarioName, heatMapName, 'kpis');
                } else {
                    let xyz = qcmKpis.coords;
                    let values;
                    if (['Best', 'Worst'].includes(txPovIds[i])) {
                        values = qcmKpis[txPovIds[i]][kpiName].val;
                    } else if (['Mean', 'Sum'].includes(txPovIds[i])) {
                        values = qcmKpis[txPovIds[i]][kpiName];
                    } else if (['Coverage', 'Acoverage'].includes(txPovIds[i])) {
                        // coverage and anti-coverage are just nick names for the best/worst id
                        let x = {
                            'Coverage': 'Best', 
                            'Acoverage': 'Worst' 
                        };
                        let cat = x[txPovIds[i]];
                        values = qcmKpis[cat][kpiName].id;
                    }
                    else {
                        values = qcmKpis.tx[txPovIds[i]][kpiName];
                    }
                    let heatMap = new Heatmap();
                    let range = this.data.ranges[scenarioName].qcmKpis[kpiName];
                    heatMap.forceColors(range.min, range.max, n_colors, scheme, reverse);
                    console.info(`Range: [${range.min} to ${range.max}] - Values: [${Math.min(...values)} to ${Math.max(...values)}]`);
                    heatMap.updateData({x: xyz.x, y: xyz.y, val: values, size: 5});
                    heatMap.mesh.name = heatMapName;
                    this.data.groups[scenarioName].kpis.add(heatMap.mesh);
                    console.info(`Added object ${heatMapName} in ${scenarioName}`);
                }                
            }
        }
    }

    getKpisRange(scenarioName) {
        console.group('Get kpis ranges');
        console.time('Get kpis ranges');
        // Reset the ranges container
        this.data.ranges[scenarioName].qcmKpis = {};
        // Each KPI has its own range obviously
        let kpiNames = this.data.scenarios[scenarioName].qcmKpis.nfo.KPIS;
        for (let i=0; i<kpiNames.length; i++) {
            this.data.ranges[scenarioName].qcmKpis[kpiNames[i]] = {'min': +Infinity, 'max': -Infinity};
        }
        // Probably the above is not needed
        for (let i=0; i<kpiNames.length; i++) {
            this.data.ranges[scenarioName].qcmKpis[kpiNames[i]].min = Math.min.apply(Math, this.data.scenarios[scenarioName].processedKpis.Worst[kpiNames[i]].val)
            this.data.ranges[scenarioName].qcmKpis[kpiNames[i]].max = Math.max.apply(Math, this.data.scenarios[scenarioName].processedKpis.Best[kpiNames[i]].val)
        }

        console.groupEnd('Get kpis ranges');
        console.timeEnd('Get kpis ranges');
    }

    consoleWelcome() {
        /**
         * Prints some info in the console
         */
        //console.group('cg-viz lite');
        let text = `
        ___________________________________________________________________________
                                                                                   
        ██████╗ ██████╗        ██╗   ██╗██╗███████╗    ██╗     ██╗████████╗███████╗
        ██╔════╝██╔════╝       ██║   ██║██║╚══███╔╝    ██║     ██║╚══██╔══╝██╔════╝
        ██║     ██║  ███╗█████╗██║   ██║██║  ███╔╝     ██║     ██║   ██║   █████╗
        ██║     ██║   ██║╚════╝╚██╗ ██╔╝██║ ███╔╝      ██║     ██║   ██║   ██╔══╝
        ╚██████╗╚██████╔╝       ╚████╔╝ ██║███████╗    ███████╗██║   ██║   ███████╗
         ╚═════╝ ╚═════╝         ╚═══╝  ╚═╝╚══════╝    ╚══════╝╚═╝   ╚═╝   ╚══════╝
         __________________________________________________________________________
                                                                                   
           by malek.cellier@gmail.com                                             
           last updated: 2020-03-08                                                
         __________________________________________________________________________`;

        console.log(text);
        //console.groupEnd('cg-viz lite');
    }

    addLabel(scenarioName, elementName) {
        /**
         * For each eligible element (PoV) of the 3d scene,
         * adds a label to be updated later on in the rendering process
         * Each element is named afet the group (scenario name) and the actual name
         * which in case of the pov is a pov_type and a pov_id
         * Ex: dummy_Tx03 is a possible ID for the label
         * Then those labels are placed and moved during the rendering process
         */
        let name = scenarioName + '__' + elementName;
        let labelsContainer = document.querySelector('#labels-container');
        let label = document.createElement('div');
        label.textContent = elementName;
        label.id = name;
        labelsContainer.appendChild(label);
    }

    removeLabel(scenarioName, elementName) {
        let name = scenarioName + '__' + elementName;
        let labelsContainer = document.querySelector('#labels-container');
        let labelToRemove = labelsContainer.querySelector('#' + name);
        if (labelToRemove === undefined) {
            console.warn(`Element ${elementName} not found!`);
        } else {
            labelsContainer.removeChild(labelToRemove);
            console.info(`Element ${elementName} removed successfully!`);
        }
    }    

    animate_labels() {
        /**
         * moves the labels together with the underlying object
         */
        // Get the list of objects from the div
        let labels_list = document.querySelector('#labels-container');
        if (labels_list.classList.contains('hidden')) {
            return;
        }
        const tempV = new THREE.Vector3();
        const canvas = document.querySelector('canvas');
        for (let i=0; i<labels_list.childElementCount; i++) {
            let [scenarioName, elementName] = labels_list.childNodes[i].id.split('__');
            let pov = this.scene.getObjectByName(scenarioName).getObjectByName('PoVs').getObjectByName(elementName);
            // get the position of the center of the pov
            pov.updateWorldMatrix(true, false);
            pov.getWorldPosition(tempV);
            
            // get the normalized screen coordinate of that position
            // x and y will be in the -1 to +1 range with x = -1 being
            // on the left and y = -1 being on the bottom
            tempV.project(this.camera);
            
            // convert the normalized position to CSS coordinates
            const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
            
            // move the elem to that position
            labels_list.childNodes[i].style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        }
    }

}

// 1) Create the THREEjs environment
var cgviz = new CgVizJs({menu: new CgVizMenu()});
ThreejsWrapper.prototype.animate_labels = CgVizJs.animate_labels;
cgviz.start();
cgviz.updateBackgroundColor(0x102030);
