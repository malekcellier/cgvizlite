/*
cg-viz-light

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
        this.menu = menu;
    }

    createReusables() {        
        /**
         * Creates resuable materials and geometries
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
            this.centerCamera(name);
            console.log(' > added object: ', name);
        }
    }

    togglePov(povId) {
        /**
         * If already visible, remove, otherwise show in the scene
         */
        const name = povId + ".pov";
        if (this.isObjectInScene(name)) {
            this.removeFromScene(name);
            console.log(' > removed object: ', name);
        } else {
            let data = this.getCurrentData().qcmPov[povId];
            // Use the reusables
            let povType = this.getPovCategory(povId);
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


// Add an event to the directory selector
document.getElementById("filepicker").addEventListener("change", function(event) {
    let output = document.getElementById("listing");
    let files = event.target.files;
    if (files.length==0) {
        return;
    }
  
    let dir_name = files[0].webkitRelativePath.split('/')[0];
    cgviz.data.current_dir = dir_name;
    cgviz.data.json[dir_name] = {
        'qcmPov': {},
        'qcmKpis': {},
        'qcmTrace': {},
        'obj': {'obj': null, 'mtl': null},
        'files': []
    };

    for (let i=0; i<files.length; i++) {
        let file = files[i];
        let parts = file.webkitRelativePath.split('/');
        // We ignore the subdirectories
        if (parts.length > 2) {
            continue;
        }
        // The files belong to the following categories: qcmPov, qcmKpis, qcmTrace, obj and mtl
        if (file.name.includes('.json')) {
            const fileread = new FileReader();
            fileread.onload = function() {
                // console.log("name: ", file.name, " type: ", typeof fileread.result);
                // console.log(fileread.result);
                let name_parts = parts[1].split('.');
                let this_file = JSON.parse(fileread.result);

                if (parts[1].includes('qcmPov')) {
                    // the file name is built like so: qcmPov.Rx22.json
                    cgviz.data.json[dir_name].qcmPov[this_file.tag] = this_file;

                } else if (parts[1].includes('qcmKpis')) {
                    // handling the nfo case first
                    cgviz.data.json[dir_name].qcmKpis[name_parts[1]] = this_file;                    

                } else if (parts[1].includes('qcmTrace')) {
                    // the file name can be built in various ways:
                    //      - qcmTrace.Tx01-Rx17.json
                    //      - qcmTrace.BS-1-UE-1.json
                    //      - qcmTrace.BS1-MS1.json
                    //      - qcmTrace.PoleArray-1-UE-1.json
                    // we count the levels
                    let all_parts = name_parts[1].split('-');
                    let n = all_parts.length;
                    let txId;
                    let rxId;
                    if (n==2) {
                        txId = all_parts[0];
                        rxId = all_parts[1];
                    } else if (n==4) {
                        txId = all_parts[0] + '-' + all_parts[1];
                        rxId = all_parts[2] + '-' + all_parts[3];
                    } else {
                        console.log('wtf');
                    }

                    if (!cgviz.data.json[dir_name].qcmTrace.hasOwnProperty(txId)) {
                        cgviz.data.json[dir_name].qcmTrace[txId] = {};
                    }
                    cgviz.data.json[dir_name].qcmTrace[txId][rxId] = this_file;

                    // Saving the min/max
                    // TODO: make seprate operation somewhere else
                    for (let i=0; i<this_file.length; i++) {
                        if (this_file[i].P < cgviz.data.ranges.qcmTrace.min) {
                            cgviz.data.ranges.qcmTrace.min = this_file[i].P;
                        } else if (this_file[i].P > cgviz.data.ranges.qcmTrace.max) {
                            cgviz.data.ranges.qcmTrace.max = this_file[i].P;
                        }
                    }

                    /*
                    let ids = name_parts[1].split('-');
                    */
                }
            };
            fileread.readAsText(file);

        } else if (file.name.includes('.obj')) {
            const fileread = new FileReader();
            fileread.onload = function(event) {
                /*
                let name_parts = parts[1].split('.');
                let this_file = JSON.parse(fileread.result);
                cgviz.data.json[dir_name].obj.obj = this_file;
                */
                
                //let objFileContent = fileread.result;
                //objFileContent = objFileContent.replace('data:;base64,', '');
                //objFileContent = window.atob(objFileContent);
                //cgviz.data.json[dir_name].obj.obj = objFileContent;
                let contents = event.target.result;

                let object = new THREE.OBJLoader().parse( contents );
                
                cgviz.data.json[dir_name].obj.obj = object;
            };

            fileread.readAsText(file);

            //cgviz.data.json[dir_name].obj.obj = files[i];

        } else if (file.name.includes('.mtl')) {
            const fileread = new FileReader();
            fileread.onload = function(event) {
                //let mtlFileContent = fileread.result;
                //mtlFileContent = mtlFileContent.replace('data:;base64,', '');
                //mtlFileContent = window.atob(mtlFileContent);
                //cgviz.data.json[dir_name].obj.mtl = mtlFileContent;
                //cgviz.data.json[dir_name].obj.mtl = URL.createObjectURL(mtlFileContent);
                let contents = event.target.result;

                let object = new THREE.MTLLoader().parse( contents );
                
                cgviz.data.json[dir_name].obj.mtl = object;
            }
            fileread.readAsText(file);

            //cgviz.data.json[dir_name].obj.mtl = file;

        }

        cgviz.data.json[dir_name].files.push(file);

        console.log('file ', i, ' of ', files.length);
        
    }
    // Build a simple menu structure
    let menu = document.getElementById('menu');
    // First level is that of the directories
    let categories = Object.keys(cgviz.data.json); 
    for (let i=0; i<categories.length; i++) {
     // Second level is that of the categories qcmPov, qcmKpis, qcmTrace..  
        // Adding name of the category
        let category = document.createElement('li');
        category.innerHTML = categories[i];
        output.appendChild(category);          
        for (let j=0; j<cgviz.data.json[dir_name].files.length; j++) {
            let name = cgviz.data.json[dir_name].files[j].name;
            console.log(name);
            
            if (name.includes('.mtl')) {
               continue; 
            }
            
            let div = document.createElement('div');
            
            let btn = document.createElement('button');
            btn.innerHTML = 'show: ' + name;
            btn.addEventListener('click', function(evt) {
                let text = evt.target.parentElement.lastElementChild.innerText;
                console.log(text);
                if (text.includes('qcmPov')) {
                    // toggle pov
                    cgviz.togglePov(name.split('.')[1]);
                } else if (text.includes('qcmKpis')) {
                    // toggle heatmap of kpi
                } else if (text.includes('qcmTrace')) {
                    // toggle trace
                    let tx_rx = name.split('.')[1].split('-');
                    if (tx_rx.length==2) {
                        cgviz.toggleRays(tx_rx[0], tx_rx[1]);
                    } else if (tx_rx.length==4) {
                        cgviz.toggleRays(tx_rx[0] + '-' + tx_rx[1], tx_rx[2] + '-' + tx_rx[3]);
                    }
                } else if (text.includes('obj')) {
                    cgviz.toggleObj();
                }
            }, true);

            //div.appendChild(btn);
            let item = document.createElement('li');
            item.appendChild(btn);
            output.appendChild(item);
            /*
            item.innerHTML = ' ' + name;
            div.appendChild(item);
            output.appendChild(div);
            */
        }
    };
  }, false);
