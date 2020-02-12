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
            'json': {},
            'current_dir': null,
            'ranges': {'qcmTrace': {'min': +Infinity, 'max': -Infinity,}}
        }; // Data structure that will hold the data from the json files
        this.colors = {'qcmTrace': chroma.scale('Spectral')};
        this.reusables = this.createReusables();
        menu.cgviz = this;
        this.menu = menu;
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

    getCurrentData() {
        // convenience function to return the current configuration
        return this.data.json[this.data.current_dir];
    }

    getRanges() {
        /**
         * The ranges of:
         *      povs: number of IDs combined with categories
         *      rays: from lowest to highest power
         *      kpis: for each kpi, the min and max values
         */
        let data = this.getCurrentData();
        let cdir = this.data.current_dir;
        this.data.ranges[cdir] = {};
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
        const name = this.data.current_dir;
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
            //this.centerCamera(name);
            console.log(' > added object: ', name);
        }
    }

    toggleGroundPlane() {
        const name = 'GroundPlane_' + this.data.current_dir;
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

    togglePov(povId) {
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

    getPovCategory(povId) {
        /**
         * Returns the pov category in order to customize the mesh
         */
        let tx_type = ['bs', 'enb', 'nb', 'tx', 'polearray'];
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
         *          this also means greying the slider and adding a kind of load button that actually creates the objec
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

    getRaysRange() {
        /**
         * Find the min/max rx power for all the rays in the scenario
         */
        let scenarios = Object.keys(this.data.json);
        if (scenarios.length === 0) {
            console.log('no scenarios loaded');
            return;
        }
        for (let i=0; i<scenarios.length; i++) {
            let scenario = scenarios[i];
            let data = this.data.json[scenario].qcmTrace;
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

    getColor(val) {
        this.colors.qcmTrace.domain([this.data.ranges.qcmTrace.min, this.data.ranges.qcmTrace.max]);
        let color = this.colors.qcmTrace(val);
        color.rgb();
        color = new THREE.Color(color.toString());

        return color;
    }

    toggleHeatmap() {
    }

    // Methods that handle the DOM interaction
    createMenu() {
        /**
         * Creates the floating menu on the left hand side
         * Structure:
         *  
         */
    }


}

// 1) Create the THREEjs environment
var cgviz = new CgVizJs({menu: new CgVizMenu()});
cgviz.start();
cgviz.updateBackgroundColor(0x102030);
