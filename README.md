# three-mmd-loader
MMD pmd/pmx/vmd loader for Three.js (based on [MMDLoader](https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/MMDLoader.js))

## difference from MMDLoader
- Rewritten by TypeScript
- Support ES2015 modules (without force mixin to three.js)
- Bundle dependencies (MMDPhysics / CCDIKResolver)
- Managed depnedencies by package.json (mmd-parser / ammo.js)
  - `three.js` is registered as peerDependencies
- Promise API for Asset loading
  ```javascript
  import {MMDLoader} from 'three-mmd-loader';

  const loader = new MMDLoader();
  const mesh = await loader.load('miku.pmx', ['motion.vmd'])
  const [audio, audioListener] = await loader.loadAudio('audio.mp4')
  ```

## Links
- [MMDLoader.js](https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/MMDLoader.js)
- [takahirox/three.js](https://github.com/takahirox/three.js)