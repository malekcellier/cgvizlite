/**
 * Author: Malek Cellier
 * Email: malek.cellier@gmail.com
 * Creation Date: 2020-01-23
 * Context:
 *  Threejs Wrapper class, requires three.js, OrbitControls.js
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
        this.data = null;  // data needed by the application
        this.gui = null;  // gui object (dat.GUI library)
        this.params = {  // parameters for all the objects. This is also used by the dat.GUI library for live changes
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
        canvas = canvas || document.querySelector('canvas');  // tries to find existing canvas
        if (canvas == null) {
            // If canvas is not found, then create one
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
        }
        this.canvas = canvas;  // html canvas object
    }

    start() {
        this.createScene();
        this.createRenderer();
        this.createCamera();
        this.createLights();
        this.createControls();
        this.createHelpers();
        this.createObjects();
        this.animate();

        // BUG with the resizing => elevator bars are always there :-/
        window.addEventListener('resize', () => this.onWindowResize(), false);
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
        this.camera.lookAt(c.lookAt.x, c.lookAt.y, c.lookAt.z);
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
        obj.geometry.computeBoundingSphere();
        let c = obj.geometry.boundingSphere.center;
        this.params.camera.lookAt = {x: c.x, y: c.y, z: c.z};
        this.createCamera();
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
            
            let xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, h.size, 0xaa0000);
            axesHelper.add(xAxis);
            
            let yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, h.size, 0x00aa00);
            axesHelper.add(yAxis);
            
            let zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, h.size, 0x0000aa);
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
        Threejs.prototype.create_default = this.createCube;
        Threejs.prototype.animate_default = this.animateCube;
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

    removeFromScene(objectName) {
        if (this.isObjectInScene(objectName)) {
            this.scene.remove(this.scene.getObjectByName(objectName));
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

    animate() {
        //requestAnimationFrame(this.animate);
        
        // BUG with the resizing
        //this.resizeCanvasToDisplaySize();
        requestAnimationFrame(() => this.animate());

        this.render();
        this.animateObjects();
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        // BUG with the resizing
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resizeCanvasToDisplaySize() {
        // BUG with the resizing
        const canvas = this.renderer.domElement;
        // look up the size the canvas is being displayed
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
      
        // adjust displayBuffer size to match
        if (canvas.width !== width || canvas.height !== height) {
          // you must pass false here or three.js sadly fights the browser
          this.renderer.setSize(width, height);
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
      
          // update any render target sizes here
        }
      }
}