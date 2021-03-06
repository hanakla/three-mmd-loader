import THREE from './three'

import CubicBezierInterpolation from './CubicBezierInterpolation'

export default class QuaternionKeyframeTrackEx extends THREE.QuaternionKeyframeTrack
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