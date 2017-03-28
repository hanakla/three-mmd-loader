import MMDLoader from './MMDLoader';
import MMDAudioManager from './MMDAudioManager';
import MMDGrantSolver from './MMDGrantSolver';
import MMDHelper from './MMDHelper';
import MMDPhysics from './MMDPhysics';

export {default as MMDLoader} from './MMDLoader';
export {default as MMDAudioManager} from './MMDAudioManager';
export {default as MMDGrantSolver} from './MMDGrantSolver';
export {default as MMDHelper} from './MMDHelper';
export {default as DataCreationHelper} from './DataCreationHelper';

export {default as VectorKeyframeTrackEx} from './VectorKeyframeTrackEx';
export {default as QuaternionKeyframeTrackEx} from './QuaternionKeyframeTrackEx';
export {default as NumberKeyframeTrackEx} from './NumberKeyframeTrackEx';
export {default as CubicBezierInterpolation} from './CubicBezierInterpolation';

export {default as MMDPhysics} from './MMDPhysics'

export const mixin = (THREE: any) => {
    THREE.MMDLoader = MMDLoader;
    THREE.MMDAudioManager = MMDAudioManager;
    THREE.MMDGrantSolver = MMDGrantSolver;
    THREE.MMDHelper = MMDHelper;
    THREE.MMDPhysics = MMDPhysics;
}
