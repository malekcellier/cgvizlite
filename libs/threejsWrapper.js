/**
 * Author: Malek Cellier
 * Email: malek.cellier@gmail.com
 * Creation Date: 2020-01-23
 * Context:
 *  Threejs Wrapper class, requires:
 *      three.js: that's the WebGL wrapper
 *      OrbitControls.js: that's a convenient function that allows to rotate the scene with the mouse
 *      chroma.js: that's a library that generates colors and colormaps
 *   allows the rapid creation of a threejs based scene
 * 
 * To use this class, I suggest to inherit from it and then add your extra methods
 */


class ThreejsWrapper {
    /**
     * ThreejsWrapper
     *  wraps the three.js library (see: https://threejs.org/)
     *  all the required components are member variables of the class
     * 
     * OBS: remember to call the start() function once you have create your object.
     * Usage:
     *  let my3d = ThreejsWrapper();
     *  my3d.start();
     * 
     */    
    constructor(canvas) {
        this.scene = null;  // scene object required by three.js
        this.camera = null;  // camera object required by three.js
        this.renderer = null;  // renderer object required by three.js
        this.composer = null;  // optional composer object for effects in three.js
        this.data = null;  // data needed by the application
        this.gui = null;  // gui object (dat.GUI library)
        this.params = this._getParams(); // parameters for all the objects. This is also used by the dat.GUI library for live changes
        canvas = canvas || document.querySelector('canvas');  // tries to find existing canvas
        if (canvas == null) {
            // If canvas is not found, then create one
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
        }
        canvas.style = 'position: absolute; top: 0px; left: 0px';
        this.canvas = canvas;  // html canvas object
        this.info = this._createRendererInfo(); // Renderer information
        this.colors = {};  // there can be several different color scales
    }

    _getParams() {
        /**
         * all the parameters needed to configure the various objects and other aspects of this class
         * are created here in order to reduce clutter in the constructor
         * The categories:
         *  - background
         *  - camera
         *  - light
         *  - helpers
         *  - helpers
         *  - effects
         *  - cube
         */
        let params = {  
            background: {
                color: 0x204060
            },
            camera: {
                fov: 45,
                near: 1,
                far: 10000,
                x: 250,
                y: 250,
                z: 250,
                up: 'z',
                lookAt: {x: 0, y:0, z: 0}
            },
            light: {
                color: 0xffffff,
                intensity: 1,
                x: 0,
                y: 300,
                z: 100,
                shadow: true
            },
            helpers: {
                axes: {
                    show: true,
                    use_arrows: true,
                    size: 150
                },
                grid: {
                    show: true,
                    size: 200,
                    division: 20
                },
                cube: {
                    show: false,
                    color: 0xaa0000
                },
                renderer_info: {
                    show: false,
                    data: {
                        memory: {
                            geometries: 0,
                            textures: 0
                        },
                        render: {
                            calls: 0,
                            frame: 0,
                            lines: 0,
                            points: 0,
                            triangles: 0
                        }
                    }
                }
            },
            effects: {
                composer: false
            },
            cube: {
                width: 50,
                height: 50,
                depth: 50,
                widthSegments: 1,
                heightSegments : 1,
                depthSegments : 1,
                x: 0,
                y: 0,
                z: 0,
                material: 'normal',
                color: 0x156289,
                wireframe: true,
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                }
            },            
        }; 


        return params;
    }

    start() {
        // This function actually initialize and starts the render loop
        // MUST be called manually after creating the ThreejsWrapper object
        this.createScene();
        this.createRenderer();
        this.createCamera();
        this.createLights();
        this.createControls();
        this.createHelpers();
        this.createObjects();
        this.animate();

        this.windowResize();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.updateBackgroundColor();
    }

    updateBackgroundColor(color) {
        color = color || this.params.background.color;
        this.scene.background = new THREE.Color(color);
    }

    createCamera() {
        this.removeFromScene('Camera');
        let c = this.params.camera; // retrieve parameters
        this.camera = new THREE.PerspectiveCamera(c.fov, window.innerWidth / window.innerHeight, c.near, c.far);
        this.camera.position.set(c.x, c.y, c.z);
        this.camera.name = 'Camera';
        // Adjust the up direction
        let up;
        switch(c.up) {
            case 'x':
                up = new THREE.Vector3(1, 0, 0);
                break;
            case 'y':
                up = new THREE.Vector3(0, 1, 0);
                break;
            case 'z':
                up = new THREE.Vector3(0, 0, 1);
                break;
        }
        this.camera.up = up;
        //this.camera.lookAt(c.lookAt.x, c.lookAt.y, c.lookAt.z);
        this.scene.add(this.camera);
        this.createControls();
    }

    resetCamera() {
        // Make the camera look at the origin
        this.params.camera.lookAt = {x: 0, y: 0, z: 0};
        this.createCamera(); // TODO save the current camera position and restore it
    }

    centerCamera(name) {
        // Make the camera look at the center of the obj
        let obj = this.scene.getObjectByName(name);
        if (obj == null) {
            console.log('no object called: ', name);
            return;
        }
        return;
        obj.geometry.computeBoundingSphere();
        let c = obj.geometry.boundingSphere.center;
        this.params.camera.lookAt = {x: c.x, y: c.y, z: c.z};
        this.createCamera();
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.params.effects.composer == true) {
            this.composer = new THREE.EffectComposer(this.renderer);
            let ssaoPass = new THREE.SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
            ssaoPass.kernelRadius = 16;
            ssaoPass.output = THREE.SSAOPass.OUTPUT.Beauty; // Depth SSAO
			this.composer.addPass(ssaoPass);
        }
    }

    createLights() {
        this.scene.add(new THREE.AmbientLight(0xdddddd));
        let lgh = this.params.light;
        let light = new THREE.DirectionalLight(lgh.color, lgh.intensity);
        light.position.set(lgh.x, lgh.y, lgh.z);
        this.scene.add(light);    
    }

    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.rotateSpeed = 1.0;
    }

    createHelpers() {        
        this.removeFromScene('AxesHelper');
        if (this.params.helpers.axes.show) {
            let axesHelper = this._createAxes();
            axesHelper.name = 'AxesHelper'; 
            this.scene.add(axesHelper);
        }
        
        let grid = this.params.helpers.grid;
        this.removeFromScene('GridHelper');
        if (grid.show) {
            let gridHelper = new THREE.GridHelper(grid.size, grid.division);
            gridHelper.rotateX(Math.PI / 2);
            gridHelper.name = 'GridHelper'; 
            this.scene.add(gridHelper);
        }

        let kube = this.params.helpers.cube;
        this.removeFromScene('CubeHelper');
        if (this.isObjectInScene('cube') && kube.show) {
            let cube = this.scene.getObjectByName('cube');

            let cubeHelperGeometry = new THREE.EdgesGeometry(cube.geometry);
            let cubeHelperMaterial = new THREE.LineBasicMaterial({color: kube.color});
            let cubeHelper = new THREE.LineSegments(cubeHelperGeometry, cubeHelperMaterial);
            cubeHelper.name = 'CubeHelper'; 
            this.scene.add(cubeHelper);
        }
    }

    _createAxes() {
        /**
         * Using the axes helpers OR building arrows
         */
        let h = this.params.helpers.axes;

        let axesHelper;

        if (h.use_arrows) {
            axesHelper = new THREE.Object3D();            
            let origin = new THREE.Vector3(0, 0, 0);

            let headLength = 0.05*h.size;
            let headWidth = 0.03*h.size;
            
            let xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, h.size, 0xff2222, headLength, headWidth);
            axesHelper.add(xAxis);
            
            let yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, h.size, 0x22ff22, headLength, headWidth);
            axesHelper.add(yAxis);
            
            let zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, h.size, 0x2222ff, headLength, headWidth);
            axesHelper.add(zAxis);

        } else {
            axesHelper = new THREE.AxesHelper(h.size);
        }
        
        return axesHelper;

    }
    
    createDefaults() {
        /**
         * Create default functions to populate the scene with an animated cube
         */
        ThreejsWrapper.prototype.create_default = this.createCube;
        ThreejsWrapper.prototype.animate_default = this.animateCube;
    }

    _createRendererInfo() {
        /**
         * Creates a div showing the renderer info        
         */
        let info = document.createElement('div');
        info.id = 'info';
        info.style = 'position: absolute; left: 10px; bottom: 10px; font-size: 12px; color: rgb(255,255,255); display: none';

        let renderer_info = this.params.helpers.renderer_info.data;

        let span_text;
        let span_val;
        let cat_keys = Object.keys(renderer_info);
        for (let i=0; i<cat_keys.length; i++) {
            let cat_data = renderer_info[cat_keys[i]];
            let subcat_keys = Object.keys(cat_data);
            for (let j=0; j<subcat_keys.length; j++) {
                if (subcat_keys[j].includes('frame')) {
                    continue;
                }
                span_text = document.createElement('span');
                span_text.innerText = subcat_keys[j] + ': ';
                info.appendChild(span_text);

                span_val = document.createElement('span');
                span_val.innerText = cat_data[subcat_keys[j]].toString();
                span_val.id = cat_keys[i] + '_' + subcat_keys[j];
                info.appendChild(span_val);
                
                info.appendChild(document.createElement('br'));
            }
        }

        document.body.appendChild(info);

        return info
    }

    createObjects() {
        // Wrapper that executes all the functions prefixed with "create_"
        let propertyNames = Object.getOwnPropertyNames(ThreejsWrapper.prototype);
        for (let i=0; i<propertyNames.length; i++) {
            let funcName = propertyNames[i];
            if (funcName.includes('create_')) {
                console.log('executing:', funcName);
                this[funcName]();
            }
        }
    }

    createCube() {
        // A cube to populate the scene a little
        this.removeFromScene('cube');
        
        let c = this.params.cube;
        let geometry = new THREE.BoxGeometry(c.width, c.height, c.depth, c.widthSegments, c.heightSegments, c.depthSegments);
        geometry.translate(c.x, c.y, c.z);
        let material = new THREE.MeshBasicMaterial({color: c.color, wireframe: c.wireframe});
        //let material = new THREE.MeshNormalMaterial();
        let mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'cube';
        this.scene.add(mesh);
    }    

    animateObjects() {
        // Wrapper that executes all the functions prefixed with "animate_"
        let propertyNames = Object.getOwnPropertyNames(ThreejsWrapper.prototype);
        for (let i=0; i<propertyNames.length; i++) {
            let funcName = propertyNames[i];
            if (funcName.includes('animate_')) {
                this[funcName]();
            }
        }        
    }

    animateCube() {
        let obj = this.scene.getObjectByName('cube');
        let r = this.params.cube.rotation;
        const N_FPS = 60;
        const DEG2RAD = Math.PI/180; 
        const COEFF = DEG2RAD/N_FPS;
        obj.rotateX(COEFF*r.x);
        obj.rotateY(COEFF*r.y);
        obj.rotateZ(COEFF*r.z);
    }

    createDatGui() {
        /**
         * A default GUI to control settings from the main elements: lights, camera, helpers...
         */
        this.gui = new dat.GUI();
        let g_background = this.gui.addFolder('Background');
        g_background.addColor(this.params.background, 'color').onChange(() => this.updateBackgroundColor());
        
        let g_camera = this.gui.addFolder('Camera');
        g_camera.add(this.params.camera, 'fov').min(10).max(160).step(10).onChange(() => this.createCamera());
        g_camera.add(this.params.camera, 'near').min(1).max(1000).onChange(() => this.createCamera());
        g_camera.add(this.params.camera, 'far').min(1000).max(1000).step(1000).onChange(() => this.createCamera());
        g_camera.add(this.params.camera, 'x').min(-10000).max(10000).step(100).onChange(() => this.createCamera()).listen();
        g_camera.add(this.params.camera, 'y').min(-10000).max(10000).step(100).onChange(() => this.createCamera());
        g_camera.add(this.params.camera, 'z').min(-10000).max(10000).step(100).onChange(() => this.createCamera());
        g_camera.add(this.params.camera, 'up', ['x', 'y', 'z']).onChange(() => this.createCamera());
    
        let g_light = this.gui.addFolder('Light');
        g_light.addColor(this.params.light, 'color').onChange(() => this.createLights());
        g_light.add(this.params.light, 'intensity').min(0).max(5).onChange(() => this.createLights());
        g_light.add(this.params.light, 'x').min(-10000).max(10000).step(100).onChange(() => this.createLights());
        g_light.add(this.params.light, 'y').min(-10000).max(10000).step(100).onChange(() => this.createLights());
        g_light.add(this.params.light, 'z').min(-10000).max(10000).step(100).onChange(() => this.createLights());
        g_light.add(this.params.light, 'shadow').onChange(() => this.createLights());    
    
        let g_helpers = this.gui.addFolder('Helpers');
        let g_axes = g_helpers.addFolder('Axes');
        g_axes.add(this.params.helpers.axes, 'show').onChange(() => this.createHelpers());
        g_axes.add(this.params.helpers.axes, 'use_arrows').onChange(() => this.createHelpers());
        g_axes.add(this.params.helpers.axes, 'size').min(10).max(500).step(10).onChange(() => this.createHelpers());
        let g_grid = g_helpers.addFolder('Grid');
        g_grid.add(this.params.helpers.grid, 'show').onChange(() => this.createHelpers());
        g_grid.add(this.params.helpers.grid, 'size').min(10).max(500).step(10).onChange(() => this.createHelpers());
        g_grid.add(this.params.helpers.grid, 'division').min(5).max(100).step(5).onChange(() => this.createHelpers());
        let g_helpers_cube = g_helpers.addFolder('Cube');
        g_helpers_cube.add(this.params.helpers.cube, 'show').onChange(() => this.createHelpers());
        g_helpers_cube.addColor(this.params.helpers.cube, 'color').onChange(() => this.createHelpers());
        g_helpers.add(this.params.helpers.renderer_info, 'show').onChange(() => this.toggleRendererInfo());
    
    
        let g_cube = this.gui.addFolder('Cube');
        g_cube.add(this.params.cube, 'width').min(10).max(200).step(10).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'height').min(10).max(200).step(10).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'depth').min(10).max(200).step(10).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'widthSegments').min(1).max(50).step(1).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'heightSegments').min(1).max(50).step(1).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'depthSegments').min(1).max(50).step(1).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'x').min(-200).max(200).step(5).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'y').min(-200).max(200).step(5).onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'z').min(-200).max(200).step(5).onChange(() => this.createCube());
        g_cube.addColor(this.params.cube, 'color').onChange(() => this.createCube());
        g_cube.add(this.params.cube, 'wireframe').onChange(() => this.createCube());
        let g_cube_rotation = g_cube.addFolder('Rotation');
        g_cube_rotation.add(this.params.cube.rotation, 'x').min(0).max().onChange(() => this.createCube());
        g_cube_rotation.add(this.params.cube.rotation, 'y').onChange(() => this.createCube());
        g_cube_rotation.add(this.params.cube.rotation, 'z').onChange(() => this.createCube());

    }

    removeFromScene(objectName, dispose) {
        dispose = dispose || true;
        if (this.isObjectInScene(objectName)) {
            let object = this.scene.getObjectByName(objectName);
            this.scene.remove(object);
            if (dispose) {
                this.dispose(object);
            }
        }
    }

    isObjectInScene(objectName) {
        let obj = this.scene.getObjectByName(objectName);
        if (obj == undefined) {
            return false;
        } else {
            return true;
        }
    }

    dispose(object) {
        /**
         * Cleaning the object from memory
         * TODO: it is more complicated than that... see: https://github.com/infamous/infamous/blob/a16fc59473e11ac53e7fa67e1d3cb7e060fe1d72/src/utils/three.ts
         */
        if (object.hasOwnProperty('geometry')) {
            object.geometry.dispose();
        } 
        if (object.hasOwnProperty('material')) {
            object.material.dispose();
        }
    }

    animate() {
        //requestAnimationFrame(this.animate);
        
        requestAnimationFrame(() => this.animate());

        this.render();
        this.animateObjects();
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        if (this.composer != null) {
            this.composer.render();
        }
        if (this.params.helpers.renderer_info.show) {
            this.updateRendererInfo();
        }
    }

    windowResize(){
        /**
         * Update renderer and camera when the window is resized
        */
        let self = this;
        let callback = function(){
            // notify the renderer of the size change
            self.renderer.setSize( window.innerWidth, window.innerHeight );
            // update the camera
            self.camera.aspect	= window.innerWidth / window.innerHeight;
            self.camera.updateProjectionMatrix();
        }
        // bind the resize event
        window.addEventListener('resize', callback, false);
        // return .stop() the function to stop watching window resize
        return {
            /**
             * Stop watching window resize
            */
            stop: function(){
                window.removeEventListener('resize', callback);
            }
        };
    } 

    updateRendererInfo() {
        this.params.helpers.renderer_info.data.memory = this.renderer.info.memory;
        this.params.helpers.renderer_info.data.render = this.renderer.info.render;
        let renderer_info = this.params.helpers.renderer_info.data;

        let span_id;
        let span_val;
        let cat_keys = Object.keys(renderer_info);
        for (let i=0; i<cat_keys.length; i++) {
            let cat_data = renderer_info[cat_keys[i]];
            let subcat_keys = Object.keys(cat_data);
            for (let j=0; j<subcat_keys.length; j++) {
                if (subcat_keys[j].includes('frame')) {
                    continue;
                }
                span_id = cat_keys[i] + '_' + subcat_keys[j];
                span_val = document.getElementById(span_id);
                span_val.innerText = cat_data[subcat_keys[j]].toString();
            }
        }

    }

    toggleRendererInfo() {
        /**
         * toggleRendererInfo: shows statistics about the scene
         * see: https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.info
         * 
         * An object with a series of statistical information about the graphics board memory and the rendering process. 
         * Useful for debugging or just for the sake of curiosity. The object contains the following fields:
         * memory:
         *    geometries
         *    textures
         * render:
         *    calls
         *    triangles
         *    points
         *    lines
         *    frame => ignored
         * programs
         * 
         */
        let info = document.getElementById('info');
        if (this.params.helpers.renderer_info.show) {
            info.style.display = 'block';
        } else {
            info.style.display = 'none';

        }
    }
}