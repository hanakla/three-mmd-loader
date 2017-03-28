import * as _THREE from 'three' // Type reference

let t: typeof _THREE

if (typeof window !== 'undefined' && window.THREE) {
    t = window.THREE
} else if (typeof require === 'function') {
    t = require('three')
} else {
    throw new Error('Can\'t resolve THREE')
}

export default t