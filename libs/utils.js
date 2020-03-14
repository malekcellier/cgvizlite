/**
 * utils.js
 * 
 * Useful functions
 * 
 * # Author: Malek Cellier
 * # 
 * # Email: malek.cellier@gmail.com
 * # Created: 2020-03-11
 */

function randInt(min, max) {
    /**
     * randInt: generate one value between min and max
     */
    return Math.round(Math.random()*(max-min) + min);
}

function extendFunc(container, func, before, after) {
    /**
     * extendFunc: modifies an existing function with extra steps before and/or after
     *  
     */
    (function() {
        let proxied = container[func];
        container[func] = function() {
            if (before) before.apply(this);
            let result = proxied.apply(this, arguments);
            if (after) after.apply(this);
            return result;
        };
    })();

}

function range(start, end, step = 1) {
    /**
     * Range of numbers from start till end, both included, with step of step
     */
    const len = Math.floor((end - start) / step) + 1
    return Array(len).fill().map((_, idx) => start + (idx * step))
  }