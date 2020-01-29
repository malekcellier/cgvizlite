/*
WEBGL based heatmap from class using json data

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
     *  2) for the menu interactivity part
     *      i.e. adding DOM elements to add/remove scenarios an
     */
    constructor(canvas) {
        super(canvas);
        this.data = {
            'json': {},
            'current_dir': null
        }; // Data structure that will hold the data from the json files
    }

    getCurrentData() {
        return this.data.json[this.data.current_dir];
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
            let mesh = group.children[0];
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
            const geometry = new THREE.CylinderGeometry(0.2, 1, 8, 32);
            const material = new THREE.MeshPhongMaterial({ color: 0xAA00AA });
            const povObject = new THREE.Mesh(geometry, material);
            povObject.name = name;
            
            geometry.translate(0, 4, 0);
            
            povObject.rotateZ((data.azimuth) - (Math.PI / 2));
            // TODO: handle the elevation
            povObject.position.set(data.position[0], data.position[1], data.position[2]);
            this.scene.add(povObject);
            console.log(' > added object: ', name);
        }
    }

    toggleRays(txId, rxId) {
        /**
         * For the time being shows all rays
         * The rays needs to be sorted according to their strength
         * The min/max of all the rays for all the TX/RX combinations is needed in order to set the color range
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
            for (let i=0; i<data.length; i++) {
                let material = new THREE.LineBasicMaterial({color: 0xdd0000});
                let geometry = new THREE.Geometry();
                let rays = data[i];
                for (let j=0; j<=rays.XData.length; j++) {
                    geometry.vertices.push(new THREE.Vector3(rays.XData[j], rays.YData[j], rays.ZData[j]));
                }
                let pathObject = new THREE.Line(geometry, material);
                raysObject.add(pathObject);
            }
            this.scene.add(raysObject);
            console.log(' > added object: ', name);
        }

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
//var obj = new Threejs();
var obj = new CgVizJs();
obj.start();


// Add an event to the directory selector
document.getElementById("filepicker").addEventListener("change", function(event) {
    let output = document.getElementById("listing");
    let files = event.target.files;
    if (files.length==0) {
        return;
    }
  
    let dir_name = files[0].webkitRelativePath.split('/')[0];
    obj.data.current_dir = dir_name;
    obj.data.json[dir_name] = {
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
                    obj.data.json[dir_name].qcmPov[this_file.tag] = this_file;

                } else if (parts[1].includes('qcmKpis')) {
                    // handling the nfo case first
                    obj.data.json[dir_name].qcmKpis[name_parts[1]] = this_file;                    

                } else if (parts[1].includes('qcmTrace')) {
                    // the file name is built like so: qcmTrace.Tx01-Rx17.json
                    // there are 2 levels: Tx01 / Rx17
                    let ids = name_parts[1].split('-');
                    if (!obj.data.json[dir_name].qcmTrace.hasOwnProperty(ids[0])) {
                        obj.data.json[dir_name].qcmTrace[ids[0]] = {};
                    }
                    obj.data.json[dir_name].qcmTrace[ids[0]][ids[1]] = this_file;                        
                }
            };
            fileread.readAsText(file);

        } else if (file.name.includes('.obj')) {
            const fileread = new FileReader();
            fileread.onload = function(event) {
                /*
                let name_parts = parts[1].split('.');
                let this_file = JSON.parse(fileread.result);
                obj.data.json[dir_name].obj.obj = this_file;
                */
                
                //let objFileContent = fileread.result;
                //objFileContent = objFileContent.replace('data:;base64,', '');
                //objFileContent = window.atob(objFileContent);
                //obj.data.json[dir_name].obj.obj = objFileContent;
                let contents = event.target.result;

                let object = new THREE.OBJLoader().parse( contents );
                
                obj.data.json[dir_name].obj.obj = object;
            };

            fileread.readAsText(file);

            //obj.data.json[dir_name].obj.obj = files[i];

        } else if (file.name.includes('.mtl')) {
            const fileread = new FileReader();
            fileread.onload = function(event) {
                //let mtlFileContent = fileread.result;
                //mtlFileContent = mtlFileContent.replace('data:;base64,', '');
                //mtlFileContent = window.atob(mtlFileContent);
                //obj.data.json[dir_name].obj.mtl = mtlFileContent;
                //obj.data.json[dir_name].obj.mtl = URL.createObjectURL(mtlFileContent);
                let contents = event.target.result;

                let object = new THREE.MTLLoader().parse( contents );
                
                obj.data.json[dir_name].obj.mtl = object;
            }
            fileread.readAsText(file);

            //obj.data.json[dir_name].obj.mtl = file;

        }

        obj.data.json[dir_name].files.push(file);

        console.log('file ', i, ' of ', files.length);
        
    }
    // Build a simple menu structure
    let menu = document.getElementById('menu');
    // First level is that of the directories
    let categories = Object.keys(obj.data.json); 
    for (let i=0; i<categories.length; i++) {
     // Second level is that of the categories qcmPov, qcmKpis, qcmTrace..  
        // Adding name of the category
        let category = document.createElement('li');
        category.innerHTML = categories[i];
        output.appendChild(category);          
        for (let j=0; j<obj.data.json[dir_name].files.length; j++) {
            let name = obj.data.json[dir_name].files[j].name;
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
                    obj.togglePov(name.split('.')[1]);
                } else if (text.includes('qcmKpis')) {
                    // toggle heatmap of kpi
                } else if (text.includes('qcmTrace')) {
                    // toggle trace
                    let tx_rx = name.split('.')[1].split('-');
                    obj.toggleRays(tx_rx[0], tx_rx[1]);
                } else if (text.includes('obj')) {
                    obj.toggleObj();
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
