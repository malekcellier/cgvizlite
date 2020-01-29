/**
 * Date: 2019-11-12
 * Author: Malek Cellier
 * Email: malek.cellier@gmail.com
 * Heatmap class, requires THREE.js, colorbar.js and chroma.js
 */


class Heatmap {
    constructor({scene=undefined, x=undefined, y=undefined, val=undefined, size=undefined}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.val = val;
        this.size = size || 10;
        this.n = undefined;
        this.colormap = {  // TODO: better handling og n_colors and min/max
            name: 'Spectral',
            n_colors: 9,
            min: undefined,
            max: undefined
        }
        this.colors = undefined;
        this.shape = {
            name: 'square',
            n_segments: 16,
            radius: 0.5
        };
    }

    init() {

        this._checkInput();
    }

    updateData({x=undefined, y=undefined, val=undefined, size=undefined}) {
        /**
         * Updates the heatmap data: x, y vectors as well as data and size
         */
        this.x = x;
        this.y = y;
        this.val = val;
        this.size = size;
        this._checkInput();
        this.clear();
        this.show();
    }

    clear() {
        /**
         * Removes the heatmap from the scene
         */
        let obj = this.scene.getObjectByName('heatmap');
        if (obj!=undefined) {
            this.scene.remove(obj);
        }        
    }

    _checkInput() {
        /**
         * Make sure the data has the same size
         * A proper way to check for wrong data is needed here
         * Also, handling the NaN, null etc
         */
        if (this.x.length != this.y.length) {
            console.log('vectors x and y are of different length');
            return;
        }
        
        if (this.x.length != this.val.length) {
            console.log('vectors x and val are of different length');
            return;
        }
        
        this.n = this.x.length;
        this.updateColors();     
    }

    updateColors() {
        /**
         * updates the chroma object with a new range for the domain
         * the range is given by the values contained in this.val
         */
        this.colormap.min = Math.min(...this.val);
        this.colormap.max = Math.max(...this.val);
        this.colors = chroma.scale(this.colormap.name).domain([this.colormap.min, this.colormap.max]);
    }

    getColor(val) {
        if (val == null) {
            return new THREE.Color(0.75, 0.75, 0.75); // an alpha of 0.5 was used in ranlab.scheduler.show
        }
        let clr = this.colors(val);
        clr.rgb();
        return new THREE.Color(clr.toString());
    }

    getShape() {
        /**
         * Shapes to be used to plot the heatmap/scatterplot
         * TODO: use the input parameters to build the shape
         * NOTE: misc_hexagon.js has a more generic formulation
         */
        const SQRT3_2 = Math.sqrt(3)/2;

        const shapes = {
            'triangle': [
                new THREE.Vector3(+0.0, +0.5, +0.0),
                new THREE.Vector3(+0.5*SQRT3_2, -0.5, +0.0),
                new THREE.Vector3(-0.5*SQRT3_2, -0.5, +0.0)
            ],
            'square': [
                new THREE.Vector3(-0.5, +0.5, +0.0),
                new THREE.Vector3(+0.5, -0.5, +0.0),
                new THREE.Vector3(-0.5, -0.5, +0.0),
                new THREE.Vector3(-0.5, +0.5, +0.0),
                new THREE.Vector3(+0.5, +0.5, +0.0),
                new THREE.Vector3(+0.5, -0.5, +0.0)
            ],
            'hexagon': [
                new THREE.Vector3(+0.0, +0.0, +0.0),
                new THREE.Vector3(+0.5*0.5, 0.5*SQRT3_2, +0.0),
                new THREE.Vector3(+0.5, +0.0, +0.0),
                new THREE.Vector3(+0.0, +0.0, +0.0),
                new THREE.Vector3(-0.5*0.5, +0.5*SQRT3_2, +0.0),
                new THREE.Vector3(+0.5*0.5, +0.5*SQRT3_2, +0.0),
                new THREE.Vector3(+0.0, +0.0, +0.0),
                new THREE.Vector3(-0.5, +0.0, +0.0),
                new THREE.Vector3(-0.5*0.5, +0.5*SQRT3_2, +0.0),
                new THREE.Vector3(+0.0, +0.0, +0.0),
                new THREE.Vector3(-0.5*0.5, -0.5*SQRT3_2, +0.0),
                new THREE.Vector3(-0.5, +0.0, +0.0),
                new THREE.Vector3(+0.0, +0.0, +0.0),
                new THREE.Vector3(+0.5*0.5, -0.5*SQRT3_2, +0.0),
                new THREE.Vector3(-0.5*0.5, -0.5*SQRT3_2, +0.0),
                new THREE.Vector3(+0.0, +0.0, +0.0),
                new THREE.Vector3(+0.5, +0.0, +0.0),
                new THREE.Vector3(+0.5*0.5, -0.5*SQRT3_2, +0.0),
            ],
            'circle': [ ],
         };

        // Create a circle of radius this.radius using cos/sin
        let circle = [];
        for (let i=0; i<this.shape.n_segments; i++) {
            let angle = 2*Math.PI/this.shape.n_segments*i;
            circle.push([this.shape.radius*Math.cos(angle), this.shape.radius*Math.sin(angle)]);
        }         

        for (let i=0; i<this.shape.n_segments; i++) {
            let next = (i + 1) % this.shape.n_segments;
            shapes.circle.push(new THREE.Vector3(0, 0, 0));
            shapes.circle.push(new THREE.Vector3(circle[next][0], circle[next][1], 0));
            shapes.circle.push(new THREE.Vector3(circle[i][0], circle[i][1], 0));
        }

        return shapes[this.shape.name];
    }

    show() {
        /**
         * Creates the buffer geometry and adds it to the scene
         */
        this.clear();
        this.updateColors();
        // A custom geometry
        const geometry = new THREE.BufferGeometry();
        const baseTile = this.getShape();
        const positions = [];
        const colors = [];

        for (let i=0; i<this.n; i++) {
            let vertices = baseTile.map(p => p.clone());
            // Scale the tile
            vertices = vertices.map(p => p.multiplyScalar(this.size));
            // Move the vertices to the position of the point
            const offset = new THREE.Vector3(this.x[i], this.y[i], 0);
            vertices = vertices.map(p => p.add(offset));
            // And now turn this into an array of arrays
            vertices = vertices.map(p => p.toArray());
            // And lastly 'flatten' it so its just a list of xyz numbers
            vertices = vertices.flat();
            // Concat those into the final array of positions
            positions.push(...vertices);
            // And give this face (3 vertices) a color
            const color = this.getColor(this.val[i]);
            for (let c = 0; c < baseTile.length; c++) {
                colors.push(color.r, color.g, color.b);
            }
        }
        const positionAttribute = new THREE.BufferAttribute(new Float32Array(positions), 3);
        geometry.addAttribute("position", positionAttribute);

        const colorAttribute = new THREE.BufferAttribute(new Float32Array(colors), 3);
        geometry.addAttribute("color", colorAttribute);

        // Enable vertex colors on the material
        const material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, side: THREE.DoubleSide});

        // Create a mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'heatmap';

        this.scene.add(mesh);
    }
}