/**
 * Date: 2019-10-17
 * Author: Malek Cellier
 * Email: malek.cellier@gmail.com
 * Colorbar class, needs chroma.js
 */


 class ColorBar {
    constructor({min=undefined, max=undefined, title='ColorBar', unit='N/A', n_colors=24, colorscheme='Spectral', canvas_id=undefined}) {
        this.min = min; // array with min and max
        this.max = max; // array with min and max
        this.data_range = undefined;
        this.title = title;
        this.unit = unit;
        this.n_colors = n_colors;
        this.boxes = undefined;
        this.colorscheme = colorscheme;
        this.colors = undefined;
        this.canvas = undefined;
        this.canvas_id = canvas_id;
        this.context = undefined;
        this.obj = {
            position: 'absolute',
            left: 100,
            left_clr: 100,
            top: 50,
            width: 150,
            height: 900,
        };
        this._evt = {
            r_clicked: Array(this.n_colors).fill(false),
            drag: {
                on: false,
                start: {x: undefined, y: undefined},
                end: {x: undefined, y: undefined},
            }
        };
        this._init();
    }
    
    _init() {
        this.updateColors();
        this._setRange();
        this._handleCanvas();
        this.draw();
        this._addEventListerners();
    }

    update(input) {
        /**
         * input is a json object with the properties
         */
        for (let key in input) {
            if (this.hasOwnProperty(key)) {
                this[key] = input[key];
            } else if (this.obj.hasOwnProperty(key)) {
                this.obj[key] = input[key];
            }
        }
        this.updateColors();
        this._setRange();
    }

    updateColors() {
        this.colors = chroma.scale(this.colorscheme).domain([0, this.n_colors]);
        this.boxes = Array(this.n_colors).fill(undefined);
    }

    _handleCanvas() {
        /**
         * Creates canvas with random id
         */
        this.canvas = document.createElement('canvas');
        if (this.canvas_id == undefined) {
            this.canvas.id = 'colorbar';
            this.canvas_id = 'colorbar';
        } else {
            this.canvas.id = 'colorbar_' + this.canvas_id;
        }
        document.body.appendChild(this.canvas);
        // set context
        this.context = this.canvas.getContext('2d');
    }

    _addEventListerners() {
        /**
         * Binding callbacks in classes requires special handling, see:
         * https://stackoverflow.com/questions/8154369/javascript-mouseevents-and-classes
         */
        this.canvas.addEventListener('mousemove', this._mouseMove.bind(this), false);
        this.canvas.addEventListener('mousedown', this._mouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this._mouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', this._mouseRightClick.bind(this));
    }

    draw() {
        // update the position and dimensions of the canvas
        this.canvas.width = this.obj.width;
        this.canvas.height = this.obj.height;
        this.canvas.style.position = this.obj.position;
        this.canvas.style.left = this.obj.left + 'px';
        this.canvas.style.top = this.obj.top + 'px';
        // clear the canvas
        this.context.clearRect(this.obj.left, this.obj.top, this.obj.width, this.obj.height);
        // draw each box individually from the number of colors
        // TODO: if there are too many colors, we should only see a subset of the labels and lines
        //for (let i=this.n_colors-1; i>=0; i--) {
        for (let i=0; i< this.n_colors; i++) {
            // each box's height is the total height divided by the number of colors
            let dh = this.obj.height/this.n_colors;
            let color = this.colors(i);
            let box = {left: this.obj.left_clr, top: i*dh, width: this.obj.width-this.obj.left_clr, height: dh};
            this.boxes[i] = box;
            // right click selection impacts the way the box is shown
            this.context.save();
            if (this._evt.r_clicked[i]) {
                color = color.alpha(0.8);
                this.context.strokeStyle = 'white';
                this.context.setLineDash([2, 8]);
                this.context.rect(box.left, box.top, box.width, box.height);
                this.context.stroke();
            }

            this.context.fillStyle = color;
            this.context.fillRect(box.left, box.top, box.width, box.height);
            // Labels with values
            this.context.beginPath();
            this.context.moveTo(this.obj.left_clr - 5, (i+0.5)*dh);
            this.context.lineTo(this.obj.left_clr + 5, (i+0.5)*dh);
            this.context.stroke();
            this.context.font = "14px Tahoma";
            this.context.fillStyle = "black";
            this.context.textAlign = "right";
            this.context.fillText(this.getDataValue(i), this.obj.left_clr - 10, (i+0.5)*dh + 6);
            this.context.restore();
        }
        // Add title and unit, see https://stackoverflow.com/questions/3167928/drawing-rotated-text-on-a-html5-canvas
        this.context.save();
        this.context.font = "20px Tahoma";
        this.context.textAlign = 'center';
        this.context.translate(this.obj.left_clr/2, this.obj.height/2);
        this.context.rotate(-Math.PI/2);
        this.context.fillText(this.title + ' [' + this.unit + ']', 0, 0);
        this.context.restore();
        
    }

    _setRange() {
        /**
         * If nothing has been passed, then it is the natural range from 0 to n_colors-1
         */
        this.data_range = Array(this.n_colors).fill(0);
        if (this.min==undefined || this.max==undefined) {
            this.min = 0;
            this.max = this.n_colors;
        }
        let delta = (this.max-this.min)/(this.n_colors-1);
        for (let i=0; i<this.n_colors; i++) {
            this.data_range[this.n_colors - 1 - i] = this.min + i*delta;
        }

    }

    getDataValue(index) {
        let value = this.data_range[index];
        // format the value
        
        return value.toFixed(2);
    }

    _mouseMove(evt) {
        if (this._evt.drag.on) {
            this._evt.drag.end.x = evt.clientX;
            this._evt.drag.end.y = evt.clientY;
            this.obj.left += this._evt.drag.end.x - this._evt.drag.start.x;
            this.obj.top += this._evt.drag.end.y - this._evt.drag.start.y;
            this._evt.drag.start.x = this._evt.drag.end.x;
            this._evt.drag.start.y = this._evt.drag.end.y;
        }
    }

    _mouseDown(evt) {
        this._evt.drag.start.x = evt.clientX;
        this._evt.drag.start.y = evt.clientY;
        this._evt.drag.on = true;
    }
    
    _mouseUp(evt) {
        this._evt.drag.on = false;
    }

    _mouseRightClick(evt) {
        evt.preventDefault();

        let bRect = this.canvas.getBoundingClientRect();
        let mouse_y = evt.clientY - bRect.y;
        
        for (let i=0; i<this.boxes.length; i++) {
            let dy = mouse_y - this.boxes[i].top;
            if (dy > 0 && dy < this.boxes[i].height) {
                this._evt.r_clicked[i] = !this._evt.r_clicked[i];
                /*
                console.log(this.canvas_id);
                console.log(this._evt.r_clicked);
                */
                return false;
            }
        }

        return false;
    }
 }