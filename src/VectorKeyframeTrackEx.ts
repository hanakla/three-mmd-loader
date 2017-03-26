import * as _THREE from 'three' // Type reference
const THREE: typeof _THREE = (((function () { return this || {} })()).THREE || require('three')) as typeof _THREE

import CubicBezierInterpolation from './CubicBezierInterpolation'

/*
 * extends existing KeyframeTrack for bone and camera animation.
 *   - use Float64Array for times
 *   - use Cubic Bezier curves interpolation
 */
export default class VectorKeyframeTrackEx extends THREE.VectorKeyframeTrack
{
    TimeBufferType: typeof Float64Array = Float64Array

    constructor(name, times, values, interpolationParameterArray)
    {
        super(name, times, values);

        this.interpolationParameters = new Float32Array(interpolationParameterArray);
    }

    InterpolantFactoryMethodCubicBezier(result)
    {
        return new CubicBezierInterpolation(this.times, this.values, this.getValueSize(), result, this.interpolationParameters);
    }

    setInterpolation(interpolation)
    {
        this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;
    }
}