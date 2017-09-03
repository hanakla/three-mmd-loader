/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - [x] mmd-parser https://github.com/takahirox/mmd-parser
 *  - [x] ammo.js https://github.com/kripken/ammo.js
 *  - [x] THREE.TGALoader
 *  - [x] THREE.MMDPhysics
 *  - [x] THREE.CCDIKSolver
 *  - [ ] THREE.OutlineEffect
 *
 *
 * This loader loads and parses PMD/PMX and VMD binary files
 * then creates mesh for Three.js.
 *
 * PMD/PMX is a model data format and VMD is a motion data format
 * used in MMD(Miku Miku Dance).
 *
 * MMD is a 3D CG animation tool which is popular in Japan.
 *
 *
 * MMD official site
 *  http://www.geocities.jp/higuchuu4/index_e.htm
 *
 * PMD, VMD format
 *  http://blog.goo.ne.jp/torisu_tetosuki/e/209ad341d3ece2b1b4df24abf619d6e4
 *
 * PMX format
 *  http://gulshan-i-raz.geo.jp/labs/2012/10/17/pmx-format1/
 *
 *
 * TODO
 *  - light motion in vmd support.
 *  - SDEF support.
 *  - uv/material/bone morphing support.
 *  - more precise grant skinning support.
 *  - shadow support.
 */

import THREE from './three'
import * as MMDParser from 'mmd-parser'
import TGALoader from './TGALoader'

import DataCreationHelper from './DataCreationHelper'
import MMDAudioManager from './MMDAudioManager'
import MMDGrantSolver from './MMDGrantSolver'
import VectorKeyframeTrackEx from './VectorKeyframeTrackEx'
import QuaternionKeyframeTrackEx from './QuaternionKeyframeTrackEx'
import NumberKeyframeTrackEx from './NumberKeyframeTrackEx'
import CubicBezierInterpolation from './CubicBezierInterpolation'

const KeyframeTrackers = {
    VectorKeyframeTrackEx,
    QuaternionKeyframeTrackEx,
    NumberKeyframeTrackEx,
}

export default class MMDLoader extends THREE.Loader
{
    manager: THREE.LoadingManager
    parser: MMDParser.Parser
    textureCrossOrigin: string

    /**
     * base64 encoded defalut toon textures toon00.bmp - toon10.bmp
     * Users don't need to prepare default texture files.
     *
     * This idea is from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
     */
    defaultToonTextures = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/bWiiMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh8aBHZBl14e8wAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOUlEQVRYR+3WMREAMAwDsYY/yoDI7MLwIiP40+RJklfcCCBAgAABAgTqArfb/QMCCBAgQIAAgbbAB3z/e0F3js2cAAAAAElFTkSuQmCC',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/B5ilMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh81dWyx0gFwKAAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3WoREAMAwDsWb/UQtCy9wxTOQJ/oQ8SXKKGwEECBAgQIBAXeDt7f4BAQQIECBAgEBb4AOz8Hzx7WLY4wAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVRYR+1XwW7CMAy1+f9fZOMysSEOEweEOPRNdm3HbdOyIhAcklPrOs/PLy9RygBALxzcCDQFmgJNgaZAU6Ap0BR4PwX8gsRMVLssMRH5HcpzJEaWL7EVg9F1IHRlyqQohgVr4FGUlUcMJSjcUlDw0zvjeun70cLWmneoyf7NgBTQSniBTQQSuJAZsOnnaczjIMb5hCiuHKxokCrJfVnrctyZL0PkJAJe1HMil4nxeyi3Ypfn1kX51jpPvo/JeCNC4PhVdHdJw2XjBR8brF8PEIhNVn12AgP7uHsTBguBn53MUZCqv7Lp07Pn5k1Ro+uWmUNn7D+M57rtk7aG0Vo73xyF/fbFf0bPJjDXngnGocDTdFhygZjwUQrMNrDcmZlQT50VJ/g/UwNyHpu778+yW+/ksOz/BFo54P4AsUXMfRq7XWsAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACMElEQVRYR+2Xv4pTQRTGf2dubhLdICiii2KnYKHVolhauKWPoGAnNr6BD6CvIVaihYuI2i1ia0BY0MZGRHQXjZj/mSPnnskfNWiWZUlzJ5k7M2cm833nO5Mziej2DWWJRUoCpQKlAntSQCqgw39/iUWAGmh37jrRnVsKlgpiqmkoGVABA7E57fvY+pJDdgKqF6HzFCSADkDq+F6AHABtQ+UMVE5D7zXod7fFNhTEckTbj5XQgHzNN+5tQvc5NG7C6BNkp6D3EmpXHDR+dQAjFLchW3VS9rlw3JBh+B7ys5Cf9z0GW1C/7P32AyBAOAz1q4jGliIH3YPuBnSfQX4OGreTIgEYQb/pBDtPnEQ4CivXYPAWBk13oHrB54yA9QuSn2H4AcKRpEILDt0BUzj+RLR1V5EqjD66NPRBVpLcQwjHoHYJOhsQv6U4mnzmrIXJCFr4LDwm/xBUoboG9XX4cc9VKdYoSA2yk5NQLJaKDUjTBoveG3Z2TElTxwjNK4M3LEZgUdDdruvcXzKBpStgp2NPiWi3ks9ZXxIoFVi+AvHLdc9TqtjL3/aYjpPlrzOcEnK62Szhimdd7xX232zFDTgtxezOu3WNMRLjiKgjtOhHVMd1loynVHvOgjuIIJMaELEqhJAV/RCSLbWTcfPFakFgFlALTRRvx+ok6Hlp/Q+v3fmx90bMyUzaEAhmM3KvHlXTL5DxnbGf/1M8RNNACLL5MNtPxP/mypJAqcDSFfgFhpYqWUzhTEAAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII='
    ];

    constructor(manager?: THREE.LoadingManager)
    {
        super();
        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        this.parser = new MMDParser.Parser();
        this.textureCrossOrigin = null;
    }

    /**
     * Set 'anonymous' for the the texture image file in other domain
     * even if server responds with "Access-Control-Allow-Origin: *"
     * because some image operation fails in MMDLoader.
     */
    setTextureCrossOrigin(value: string)
    {
        this.textureCrossOrigin = value;
    }

    async load(this: MMDLoader, modelUrl: string, vmdUrls: string[], onProgress?: (e: ProgressEvent) => void)
    {
        const mesh = await this.loadModel(modelUrl, onProgress)
        const vmds = await this.loadVmds(vmdUrls, onProgress)
        this.pourVmdIntoModel(mesh, vmds);
    }

    async loadModel(url: string, onProgress?: (e: ProgressEvent) => void)
    {
        var scope = this;

        var texturePath = this.extractUrlBase(url);
        var modelExtension = this.extractExtension(url);

        const buffer = await this.loadFileAsBuffer(url, onProgress)
        return this.createModel(buffer, modelExtension, texturePath, onProgress)
    }

    createModel(buffer: ArrayBuffer, modelExtension: string, texturePath: string, onProgress?: (e: ProgressEvent) => void)
    {
        return this.createMesh(this.parseModel(buffer, modelExtension), texturePath, onProgress);
    }

    async loadVmd(url: string, onProgress?: (e: ProgressEvent) => void)
    {
        return this.parseVmd(await this.loadFileAsBuffer(url, onProgress))
    }

    async loadVmds(urls: string[], onProgress?: (e: ProgressEvent) => void): Promise<MMDParser.Vmd>
    {
        // TODO: handle onProgress
        const vmdLoaders = urls.map(url => this.loadVmd(url));
        return this.mergeVmds(await Promise.all(vmdLoaders));
    }

    async loadAudio(url: string, onProgress?: (e: ProgressEvent) => void): Promise<[THREE.Audio, THREE.AudioListener]>
    {
        var listener = new THREE.AudioListener();
        var audio = new THREE.Audio(listener);
        var loader = new THREE.AudioLoader(this.manager);

        return new Promise<[THREE.Audio, THREE.AudioListener]>((resolve, reject) => {
            loader.load(
                url,
                (buffer) => {
                    audio.setBuffer(buffer);
                    resolve([audio, listener]);
                },
                onProgress,
                (e: ErrorEvent) => reject(e.error)
            );
        });
    }

    async loadVpd(url: string, params: {charcode: 'unicode'|string}, onProgress?: (e: ProgressEvent) => void)
    {
        const func = ((params && params.charcode === 'unicode') ? this.loadFileAsText : this.loadFileAsShiftJISText).bind(this);

        return new Promise((resolve, reject) => {
            func(
                url,
                (text) => resolve(this.parseVpd(text)),
                onProgress,
                (e: ErrorEvent) => reject(e.error)
            );
        });
    }

    parseModel(buffer: ArrayBuffer, modelExtension: string): MMDParser.Pmd|MMDParser.Pmx
    {
        // Should I judge from model data header?
        switch (modelExtension.toLowerCase())
        {
            case 'pmd':
                return this.parsePmd(buffer);

            case 'pmx':
                return this.parsePmx(buffer);

            default:
                throw 'extension ' + modelExtension + ' is not supported.';
        }
    }

    parsePmd(buffer: ArrayBuffer)
    {
        return this.parser.parsePmd(buffer, true);
    }

    parsePmx(buffer: ArrayBuffer)
    {
        return this.parser.parsePmx(buffer, true);
    }

    parseVmd(buffer: ArrayBuffer)
    {
        return this.parser.parseVmd(buffer, true);
    }

    parseVpd(text: string)
    {
        return this.parser.parseVpd(text, true);
    }

    mergeVmds(vmds: MMDParser.Vmd[])
    {
        return this.parser.mergeVmds(vmds);
    }

    pourVmdIntoModel(mesh, vmd, name?)
    {
        this.createAnimation(mesh, vmd, name);
    }

    pourVmdIntoCamera(camera, vmd, name)
    {
        var helper = new DataCreationHelper();

        var initAnimation = function ()
        {
            var orderedMotions = helper.createOrderedMotionArray(vmd.cameras);

            var times = [];
            var centers = [];
            var quaternions = [];
            var positions = [];
            var fovs = [];

            var cInterpolations = [];
            var qInterpolations = [];
            var pInterpolations = [];
            var fInterpolations = [];

            var quaternion = new THREE.Quaternion();
            var euler = new THREE.Euler();
            var position = new THREE.Vector3();
            var center = new THREE.Vector3();

            var pushVector3 = function (array, vec)
            {
                array.push(vec.x);
                array.push(vec.y);
                array.push(vec.z);

            };

            var pushQuaternion = function (array, q)
            {
                array.push(q.x);
                array.push(q.y);
                array.push(q.z);
                array.push(q.w);

            };

            var pushInterpolation = function (array, interpolation, index)
            {
                array.push(interpolation[index * 4 + 0] / 127); // x1
                array.push(interpolation[index * 4 + 1] / 127); // x2
                array.push(interpolation[index * 4 + 2] / 127); // y1
                array.push(interpolation[index * 4 + 3] / 127); // y2

            };

            var createTrack = function (node, type, times, values, interpolations)
            {
                /*
                * optimizes here not to let KeyframeTrackPrototype optimize
                * because KeyframeTrackPrototype optimizes times and values but
                * doesn't optimize interpolations.
                */
                if (times.length > 2)
                {
                    times = times.slice();
                    values = values.slice();
                    interpolations = interpolations.slice();

                    let stride = values.length / times.length;
                    let interpolateStride = (stride === 3) ? 12 : 4;  // 3: Vector3, others: Quaternion or Number

                    let index = 1;

                    for (let aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex++)
                    {
                        for (let i = 0; i < stride; i++)
                        {
                            if (
                                values[index * stride + i] !== values[(index - 1) * stride + i] ||
                                values[index * stride + i] !== values[aheadIndex * stride + i]
                            ) {
                                index++;
                                break;
                            }

                        }

                        if (aheadIndex > index)
                        {
                            times[index] = times[aheadIndex];

                            for (var i = 0; i < stride; i++)
                            {
                                values[index * stride + i] = values[aheadIndex * stride + i];
                            }

                            for (var i = 0; i < interpolateStride; i++)
                            {
                                interpolations[index * interpolateStride + i] = interpolations[aheadIndex * interpolateStride + i];
                            }
                        }
                    }

                    times.length = index + 1;
                    values.length = (index + 1) * stride;
                    interpolations.length = (index + 1) * interpolateStride;
                }

                return new KeyframeTrackers[type](node, times, values, interpolations);
            };

            for (var i = 0; i < orderedMotions.length; i++)
            {
                var m = orderedMotions[i];

                var time = m.frameNum / 30;
                var pos = m.position;
                var rot = m.rotation;
                var distance = m.distance;
                var fov = m.fov;
                var interpolation = m.interpolation;

                position.set(0, 0, -distance);
                center.set(pos[0], pos[1], pos[2]);

                euler.set(-rot[0], -rot[1], -rot[2]);
                quaternion.setFromEuler(euler);

                position.add(center);
                position.applyQuaternion(quaternion);

                /*
                * Note: This is a workaround not to make Animation system calculate lerp
                *       if the diff from the last frame is 1 frame (in 30fps).
                */
                if (times.length > 0 && time < times[times.length - 1] + (1 / 30) * 1.5)
                {
                    times[times.length - 1] = time - 1e-13;

                }

                times.push(time);

                pushVector3(centers, center);
                pushQuaternion(quaternions, quaternion);
                pushVector3(positions, position);

                fovs.push(fov);

                for (var j = 0; j < 3; j++)
                {
                    pushInterpolation(cInterpolations, interpolation, j);

                }

                pushInterpolation(qInterpolations, interpolation, 3);

                // use same one parameter for x, y, z axis.
                for (var j = 0; j < 3; j++)
                {
                    pushInterpolation(pInterpolations, interpolation, 4);

                }

                pushInterpolation(fInterpolations, interpolation, 5);

            }

            if (times.length === 0) return;

            var tracks = [];

            tracks.push(createTrack('.center', 'VectorKeyframeTrackEx', times, centers, cInterpolations));
            tracks.push(createTrack('.quaternion', 'QuaternionKeyframeTrackEx', times, quaternions, qInterpolations));
            tracks.push(createTrack('.position', 'VectorKeyframeTrackEx', times, positions, pInterpolations));
            tracks.push(createTrack('.fov', 'NumberKeyframeTrackEx', times, fovs, fInterpolations));

            var clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name, -1, tracks);

            if (clip !== null)
            {
                if (camera.center === undefined) camera.center = new THREE.Vector3(0, 0, 0);
                if (camera.animations === undefined) camera.animations = [];
                camera.animations.push(clip);

            }

        };

        initAnimation();
    }

    extractExtension(url)
    {
        var index = url.lastIndexOf('.');

        if (index < 0)
        {
            return null;

        }

        return url.slice(index + 1);
    }

    loadFile(url: string, responseType: string, mimeType?: MimeType|string, onProgress?: (e: ProgressEvent) => void): Promise<ArrayBuffer|string>
    {
        return new Promise((resolve, reject) => {
            const loader = new THREE.FileLoader(this.manager);

            if (mimeType != null) loader.setMimeType(mimeType as MimeType);

            loader.setResponseType(responseType);

            loader.load(
                url,
                (result) => resolve(result),
                onProgress,
                (e) => reject(e.error)
            );
        });
    }

    async loadFileAsBuffer(url: string, onProgress?: (e: ProgressEvent) => void): Promise<ArrayBuffer>
    {
        return this.loadFile(url, 'arraybuffer', null, onProgress) as Promise<ArrayBuffer>;
    }

    async loadFileAsText(url: string, onProgress?: (e: ProgressEvent) => void): Promise<string>
    {
        return this.loadFile(url, 'text', null, onProgress) as Promise<string>;
    }

    async loadFileAsShiftJISText(url: string, onProgress?: (e: ProgressEvent) => void): Promise<string>
    {
        return this.loadFile(url, 'text', 'text/plain; charset=shift_jis', onProgress) as Promise<string>;
    }

    createMesh(model, texturePath: string, onProgress?: (e: ProgressEvent) => void)
    {
        var scope = this;
        var geometry = new THREE.BufferGeometry();
        var material = new THREE.MultiMaterial();
        var helper = new DataCreationHelper();

        var buffer: any = {};

        buffer.vertices = [];
        buffer.uvs = [];
        buffer.normals = [];
        buffer.skinIndices = [];
        buffer.skinWeights = [];
        buffer.indices = [];

        var initVartices = function ()
        {
            for (var i = 0; i < model.metadata.vertexCount; i++)
            {
                var v = model.vertices[i];

                for (var j = 0, jl = v.position.length; j < jl; j++)
                {
                    buffer.vertices.push(v.position[j]);

                }

                for (var j = 0, jl = v.normal.length; j < jl; j++)
                {
                    buffer.normals.push(v.normal[j]);

                }

                for (var j = 0, jl = v.uv.length; j < jl; j++)
                {
                    buffer.uvs.push(v.uv[j]);

                }

                for (var j = 0; j < 4; j++)
                {
                    buffer.skinIndices.push(v.skinIndices.length - 1 >= j ? v.skinIndices[j] : 0.0);

                }

                for (var j = 0; j < 4; j++)
                {
                    buffer.skinWeights.push(v.skinWeights.length - 1 >= j ? v.skinWeights[j] : 0.0);

                }

            }

        };

        var initFaces = function ()
        {
            for (var i = 0; i < model.metadata.faceCount; i++)
            {
                var f = model.faces[i];

                for (var j = 0, jl = f.indices.length; j < jl; j++)
                {
                    buffer.indices.push(f.indices[j]);

                }

            }

        };

        var initBones = function ()
        {
            var bones = [];

            var rigidBodies = model.rigidBodies;
            var dictionary = {};

            for (var i = 0, il = rigidBodies.length; i < il; i++)
            {
                var body = rigidBodies[i];
                var value = dictionary[body.boneIndex];

                // keeps greater number if already value is set without any special reasons
                value = value === undefined ? body.type : Math.max(body.type, value);

                dictionary[body.boneIndex] = value;

            }

            for (var i = 0; i < model.metadata.boneCount; i++)
            {
                var bone = {};
                var b = model.bones[i];

                bone.parent = b.parentIndex;
                bone.name = b.name;
                bone.pos = [b.position[0], b.position[1], b.position[2]];
                bone.rotq = [0, 0, 0, 1];
                bone.scl = [1, 1, 1];

                if (bone.parent !== -1)
                {
                    bone.pos[0] -= model.bones[bone.parent].position[0];
                    bone.pos[1] -= model.bones[bone.parent].position[1];
                    bone.pos[2] -= model.bones[bone.parent].position[2];

                }

                bone.rigidBodyType = dictionary[i] !== undefined ? dictionary[i] : -1;

                bones.push(bone);

            }

            geometry.bones = bones;

        };

        var initIKs = function ()
        {
            var iks = [];

            // TODO: remove duplicated codes between PMD and PMX
            if (model.metadata.format === 'pmd')
            {
                for (var i = 0; i < model.metadata.ikCount; i++)
                {
                    var ik = model.iks[i];
                    var param = {};

                    param.target = ik.target;
                    param.effector = ik.effector;
                    param.iteration = ik.iteration;
                    param.maxAngle = ik.maxAngle * 4;
                    param.links = [];

                    for (var j = 0; j < ik.links.length; j++)
                    {
                        var link = {};
                        link.index = ik.links[j].index;

                        if (model.bones[link.index].name.indexOf('ひざ') >= 0)
                        {
                            link.limitation = new THREE.Vector3(1.0, 0.0, 0.0);

                        }

                        param.links.push(link);

                    }

                    iks.push(param);

                }

            } else
            {
                for (var i = 0; i < model.metadata.boneCount; i++)
                {
                    var b = model.bones[i];
                    var ik = b.ik;

                    if (ik === undefined)
                    {
                        continue;

                    }

                    var param = {};

                    param.target = i;
                    param.effector = ik.effector;
                    param.iteration = ik.iteration;
                    param.maxAngle = ik.maxAngle;
                    param.links = [];

                    for (var j = 0; j < ik.links.length; j++)
                    {
                        var link = {};
                        link.index = ik.links[j].index;
                        link.enabled = true;

                        if (ik.links[j].angleLimitation === 1)
                        {
                            link.limitation = new THREE.Vector3(1.0, 0.0, 0.0);
                            // TODO: use limitation angles
                            // link.lowerLimitationAngle;
                            // link.upperLimitationAngle;

                        }

                        param.links.push(link);

                    }

                    iks.push(param);

                }

            }

            geometry.iks = iks;

        };

        var initGrants = function ()
        {
            if (model.metadata.format === 'pmd')
            {
                return;

            }

            var grants = [];

            for (var i = 0; i < model.metadata.boneCount; i++)
            {
                var b = model.bones[i];
                var grant = b.grant;

                if (grant === undefined)
                {
                    continue;

                }

                var param = {};

                param.index = i;
                param.parentIndex = grant.parentIndex;
                param.ratio = grant.ratio;
                param.isLocal = grant.isLocal;
                param.affectRotation = grant.affectRotation;
                param.affectPosition = grant.affectPosition;
                param.transformationClass = b.transformationClass;

                grants.push(param);

            }

            grants.sort(function (a, b)
            {
                return a.transformationClass - b.transformationClass;

            });

            geometry.grants = grants;

        };

        var initMorphs = function ()
        {
            function updateVertex(attribute, index, v, ratio)
            {
                attribute.array[index * 3 + 0] += v.position[0] * ratio;
                attribute.array[index * 3 + 1] += v.position[1] * ratio;
                attribute.array[index * 3 + 2] += v.position[2] * ratio;

            }

            function updateVertices(attribute, m, ratio)
            {
                for (var i = 0; i < m.elementCount; i++)
                {
                    var v = m.elements[i];

                    var index;

                    if (model.metadata.format === 'pmd')
                    {
                        index = model.morphs[0].elements[v.index].index;

                    } else
                    {
                        index = v.index;

                    }

                    updateVertex(attribute, index, v, ratio);

                }

            }

            var morphTargets = [];
            var attributes = [];

            for (var i = 0; i < model.metadata.morphCount; i++)
            {
                var m = model.morphs[i];
                var params = { name: m.name };

                var attribute = new THREE.Float32BufferAttribute(model.metadata.vertexCount * 3, 3);

                for (var j = 0; j < model.metadata.vertexCount * 3; j++)
                {
                    attribute.array[j] = buffer.vertices[j];

                }

                if (model.metadata.format === 'pmd')
                {
                    if (i !== 0)
                    {
                        updateVertices(attribute, m, 1.0);

                    }

                } else
                {
                    if (m.type === 0)
                    {    // group

                        for (var j = 0; j < m.elementCount; j++)
                        {
                            var m2 = model.morphs[m.elements[j].index];
                            var ratio = m.elements[j].ratio;

                            if (m2.type === 1)
                            {
                                updateVertices(attribute, m2, ratio);

                            } else
                            {
                                // TODO: implement

                            }

                        }

                    } else if (m.type === 1)
                    {    // vertex

                        updateVertices(attribute, m, 1.0);

                    } else if (m.type === 2)
                    {    // bone

                        // TODO: implement

                    } else if (m.type === 3)
                    {    // uv

                        // TODO: implement

                    } else if (m.type === 4)
                    {    // additional uv1

                        // TODO: implement

                    } else if (m.type === 5)
                    {    // additional uv2

                        // TODO: implement

                    } else if (m.type === 6)
                    {    // additional uv3

                        // TODO: implement

                    } else if (m.type === 7)
                    {    // additional uv4

                        // TODO: implement

                    } else if (m.type === 8)
                    {    // material

                        // TODO: implement

                    }

                }

                morphTargets.push(params);
                attributes.push(attribute);

            }

            geometry.morphTargets = morphTargets;
            geometry.morphAttributes.position = attributes;

        };

        var initMaterials = function ()
        {
            var textures = {};
            var textureLoader = new THREE.TextureLoader(scope.manager);
            var tgaLoader = new TGALoader(scope.manager);
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var offset = 0;
            var materialParams = [];

            if (scope.textureCrossOrigin !== null) textureLoader.setCrossOrigin(scope.textureCrossOrigin);

            function loadTexture(filePath, params)
            {
                if (params === undefined)
                {
                    params = {};

                }

                var fullPath;

                if (params.defaultTexturePath === true)
                {
                    try
                    {
                        fullPath = scope.defaultToonTextures[parseInt(filePath.match('toon([0-9]{2})\.bmp$')[1])];

                    } catch (e)
                    {
                        console.warn('THREE.MMDLoader: ' + filePath + ' seems like not right default texture path. Using toon00.bmp instead.');
                        fullPath = scope.defaultToonTextures[0];

                    }

                } else
                {
                    fullPath = texturePath + filePath;

                }

                if (textures[fullPath] !== undefined) return fullPath;

                var loader = THREE.Loader.Handlers.get(fullPath);

                if (loader === null)
                {
                    loader = (filePath.indexOf('.tga') >= 0) ? tgaLoader : textureLoader;

                }

                var texture = loader.load(fullPath, function (t)
                {
                    // MMD toon texture is Axis-Y oriented
                    // but Three.js gradient map is Axis-X oriented.
                    // So here replaces the toon texture image with the rotated one.
                    if (params.isToonTexture === true)
                    {
                        var image = t.image;
                        var width = image.width;
                        var height = image.height;

                        canvas.width = width;
                        canvas.height = height;

                        context.clearRect(0, 0, width, height);
                        context.translate(width / 2.0, height / 2.0);
                        context.rotate(0.5 * Math.PI);  // 90.0 * Math.PI / 180.0
                        context.translate(-width / 2.0, -height / 2.0);
                        context.drawImage(image, 0, 0);

                        t.image = context.getImageData(0, 0, width, height);

                    }

                    t.flipY = false;
                    t.wrapS = THREE.RepeatWrapping;
                    t.wrapT = THREE.RepeatWrapping;

                    if (params.sphericalReflectionMapping === true)
                    {
                        t.mapping = THREE.SphericalReflectionMapping;

                    }

                    for (var i = 0; i < texture.readyCallbacks.length; i++)
                    {
                        texture.readyCallbacks[i](texture);

                    }

                    delete texture.readyCallbacks;

                }, onProgress, (e: ErrorEvent) => { throw e.error });

                texture.readyCallbacks = [];

                textures[fullPath] = texture;

                return fullPath;

            }

            function getTexture(name, textures)
            {
                if (textures[name] === undefined)
                {
                    console.warn('THREE.MMDLoader: Undefined texture', name);

                }

                return textures[name];

            }

            for (var i = 0; i < model.metadata.materialCount; i++)
            {
                var m = model.materials[i];
                var params = {};

                params.faceOffset = offset;
                params.faceNum = m.faceCount;

                offset += m.faceCount;

                params.name = m.name;

                /*
                * Color
                *
                * MMD         MeshToonMaterial
                * diffuse  -  color
                * specular -  specular
                * ambient  -  emissive * a
                *               (a = 1.0 without map texture or 0.2 with map texture)
                *
                * MeshToonMaterial doesn't have ambient. Set it to emissive instead.
                * It'll be too bright if material has map texture so using coef 0.2.
                */
                params.color = new THREE.Color(m.diffuse[0], m.diffuse[1], m.diffuse[2]);
                params.opacity = m.diffuse[3];
                params.specular = new THREE.Color(m.specular[0], m.specular[1], m.specular[2]);
                params.shininess = m.shininess;

                if (params.opacity === 1.0)
                {
                    params.side = THREE.FrontSide;
                    params.transparent = false;

                } else
                {
                    params.side = THREE.DoubleSide;
                    params.transparent = true;

                }

                if (model.metadata.format === 'pmd')
                {
                    if (m.fileName)
                    {
                        var fileName = m.fileName;
                        var fileNames = [];

                        var index = fileName.lastIndexOf('*');

                        if (index >= 0)
                        {
                            fileNames.push(fileName.slice(0, index));
                            fileNames.push(fileName.slice(index + 1));

                        } else
                        {
                            fileNames.push(fileName);

                        }

                        for (var j = 0; j < fileNames.length; j++)
                        {
                            var n = fileNames[j];

                            if (n.indexOf('.sph') >= 0 || n.indexOf('.spa') >= 0)
                            {
                                params.envMap = loadTexture(n, { sphericalReflectionMapping: true });

                                if (n.indexOf('.sph') >= 0)
                                {
                                    params.envMapType = THREE.MultiplyOperation;

                                } else
                                {
                                    params.envMapType = THREE.AddOperation;

                                }

                            } else
                            {
                                params.map = loadTexture(n);

                            }

                        }

                    }

                } else
                {
                    if (m.textureIndex !== -1)
                    {
                        var n = model.textures[m.textureIndex];
                        params.map = loadTexture(n);

                    }

                    // TODO: support m.envFlag === 3
                    if (m.envTextureIndex !== -1 && (m.envFlag === 1 || m.envFlag == 2))
                    {
                        var n = model.textures[m.envTextureIndex];
                        params.envMap = loadTexture(n, { sphericalReflectionMapping: true });

                        if (m.envFlag === 1)
                        {
                            params.envMapType = THREE.MultiplyOperation;

                        } else
                        {
                            params.envMapType = THREE.AddOperation;

                        }

                    }

                }

                var coef = (params.map === undefined) ? 1.0 : 0.2;
                params.emissive = new THREE.Color(m.ambient[0] * coef, m.ambient[1] * coef, m.ambient[2] * coef);

                materialParams.push(params);

            }

            for (var i = 0; i < materialParams.length; i++)
            {
                var p = materialParams[i];
                var p2 = model.materials[i];
                var m = new THREE.MeshToonMaterial();

                geometry.addGroup(p.faceOffset * 3, p.faceNum * 3, i);

                if (p.name !== undefined) m.name = p.name;

                m.skinning = geometry.bones.length > 0 ? true : false;
                m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
                m.lights = true;
                m.side = (model.metadata.format === 'pmx' && (p2.flag & 0x1) === 1) ? THREE.DoubleSide : p.side;
                m.transparent = p.transparent;
                m.fog = true;

                m.blending = THREE.CustomBlending;
                m.blendSrc = THREE.SrcAlphaFactor;
                m.blendDst = THREE.OneMinusSrcAlphaFactor;
                m.blendSrcAlpha = THREE.SrcAlphaFactor;
                m.blendDstAlpha = THREE.DstAlphaFactor;

                if (p.map !== undefined)
                {
                    m.faceOffset = p.faceOffset;
                    m.faceNum = p.faceNum;

                    // Check if this part of the texture image the material uses requires transparency
                    function checkTextureTransparency(m)
                    {
                        m.map.readyCallbacks.push(function (t)
                        {
                            // Is there any efficient ways?
                            function createImageData(image)
                            {
                                var c = document.createElement('canvas');
                                c.width = image.width;
                                c.height = image.height;

                                var ctx = c.getContext('2d');
                                ctx.drawImage(image, 0, 0);

                                return ctx.getImageData(0, 0, c.width, c.height);

                            }

                            function detectTextureTransparency(image, uvs, indices)
                            {
                                var width = image.width;
                                var height = image.height;
                                var data = image.data;
                                var threshold = 253;

                                if (data.length / (width * height) !== 4)
                                {
                                    return false;

                                }

                                for (var i = 0; i < indices.length; i += 3)
                                {
                                    var centerUV = { x: 0.0, y: 0.0 };

                                    for (var j = 0; j < 3; j++)
                                    {
                                        var index = indices[i * 3 + j];
                                        var uv = { x: uvs[index * 2 + 0], y: uvs[index * 2 + 1] };

                                        if (getAlphaByUv(image, uv) < threshold)
                                        {
                                            return true;

                                        }

                                        centerUV.x += uv.x;
                                        centerUV.y += uv.y;

                                    }

                                    centerUV.x /= 3;
                                    centerUV.y /= 3;

                                    if (getAlphaByUv(image, centerUV) < threshold)
                                    {
                                        return true;

                                    }

                                }

                                return false;

                            }

                            /*
                            * This method expects
                            *   t.flipY = false
                            *   t.wrapS = THREE.RepeatWrapping
                            *   t.wrapT = THREE.RepeatWrapping
                            * TODO: more precise
                            */
                            function getAlphaByUv(image, uv)
                            {
                                var width = image.width;
                                var height = image.height;

                                var x = Math.round(uv.x * width) % width;
                                var y = Math.round(uv.y * height) % height;

                                if (x < 0)
                                {
                                    x += width;

                                }

                                if (y < 0)
                                {
                                    y += height;

                                }

                                var index = y * width + x;

                                return image.data[index * 4 + 3];

                            }

                            var imageData = t.image.data !== undefined ? t.image : createImageData(t.image);
                            var indices = geometry.index.array.slice(m.faceOffset * 3, m.faceOffset * 3 + m.faceNum * 3);

                            if (detectTextureTransparency(imageData, geometry.attributes.uv.array, indices)) m.transparent = true;

                            delete m.faceOffset;
                            delete m.faceNum;

                        });

                    }

                    m.map = getTexture(p.map, textures);
                    checkTextureTransparency(m);

                }

                if (p.envMap !== undefined)
                {
                    m.envMap = getTexture(p.envMap, textures);
                    m.combine = p.envMapType;

                    // TODO: WebGLRenderer should automatically update?
                    m.envMap.readyCallbacks.push(function (t)
                    {
                        m.needsUpdate = true;

                    });

                }

                m.opacity = p.opacity;
                m.color = p.color;

                if (p.emissive !== undefined)
                {
                    m.emissive = p.emissive;

                }

                m.specular = p.specular;
                m.shininess = Math.max(p.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )

                if (model.metadata.format === 'pmd')
                {
                    function isDefaultToonTexture(n)
                    {
                        if (n.length !== 10)
                        {
                            return false;

                        }

                        return n.match(/toon(10|0[0-9]).bmp/) === null ? false : true;

                    }

                    // parameters for OutlineEffect
                    m.outlineParameters = {
                        thickness: p2.edgeFlag === 1 ? 0.003 : 0.0,
                        color: new THREE.Color(0.0, 0.0, 0.0),
                        alpha: 1.0
                    };

                    if (m.outlineParameters.thickness === 0.0) m.outlineParameters.visible = false;

                    var toonFileName = (p2.toonIndex === -1) ? 'toon00.bmp' : model.toonTextures[p2.toonIndex].fileName;
                    var uuid = loadTexture(toonFileName, { isToonTexture: true, defaultTexturePath: isDefaultToonTexture(toonFileName) });
                    m.gradientMap = getTexture(uuid, textures);

                } else
                {
                    // parameters for OutlineEffect
                    m.outlineParameters = {
                        thickness: p2.edgeSize / 300,
                        color: new THREE.Color(p2.edgeColor[0], p2.edgeColor[1], p2.edgeColor[2]),
                        alpha: p2.edgeColor[3]
                    };

                    if ((p2.flag & 0x10) === 0 || m.outlineParameters.thickness === 0.0) m.outlineParameters.visible = false;

                    var toonFileName, isDefaultToon;

                    if (p2.toonIndex === -1 || p2.toonFlag !== 0)
                    {
                        var num = p2.toonIndex + 1;
                        toonFileName = 'toon' + (num < 10 ? '0' + num : num) + '.bmp';
                        isDefaultToon = true;

                    } else
                    {
                        toonFileName = model.textures[p2.toonIndex];
                        isDefaultToon = false;

                    }

                    var uuid = loadTexture(toonFileName, { isToonTexture: true, defaultTexturePath: isDefaultToon });
                    m.gradientMap = getTexture(uuid, textures);

                }

                material.materials.push(m);

            }

            if (model.metadata.format === 'pmx')
            {
                function checkAlphaMorph(morph, elements)
                {
                    if (morph.type !== 8)
                    {
                        return;

                    }

                    for (var i = 0; i < elements.length; i++)
                    {
                        var e = elements[i];

                        if (e.index === -1)
                        {
                            continue;

                        }

                        var m = material.materials[e.index];

                        if (m.opacity !== e.diffuse[3])
                        {
                            m.transparent = true;

                        }

                    }

                }

                for (var i = 0; i < model.morphs.length; i++)
                {
                    var morph = model.morphs[i];
                    var elements = morph.elements;

                    if (morph.type === 0)
                    {
                        for (var j = 0; j < elements.length; j++)
                        {
                            var morph2 = model.morphs[elements[j].index];
                            var elements2 = morph2.elements;

                            checkAlphaMorph(morph2, elements2);

                        }

                    } else
                    {
                        checkAlphaMorph(morph, elements);

                    }

                }

            }

        };

        var initPhysics = function ()
        {
            var rigidBodies = [];
            var constraints = [];

            for (var i = 0; i < model.metadata.rigidBodyCount; i++)
            {
                var b = model.rigidBodies[i];
                var keys = Object.keys(b);

                var p = {};

                for (var j = 0; j < keys.length; j++)
                {
                    var key = keys[j];
                    p[key] = b[key];

                }

                /*
                * RigidBody position parameter in PMX seems global position
                * while the one in PMD seems offset from corresponding bone.
                * So unify being offset.
                */
                if (model.metadata.format === 'pmx')
                {
                    if (p.boneIndex !== -1)
                    {
                        var bone = model.bones[p.boneIndex];
                        p.position[0] -= bone.position[0];
                        p.position[1] -= bone.position[1];
                        p.position[2] -= bone.position[2];

                    }

                }

                rigidBodies.push(p);

            }

            for (var i = 0; i < model.metadata.constraintCount; i++)
            {
                var c = model.constraints[i];
                var keys = Object.keys(c);

                var p = {};

                for (var j = 0; j < keys.length; j++)
                {
                    var key = keys[j];
                    p[key] = c[key];

                }

                var bodyA = rigidBodies[p.rigidBodyIndex1];
                var bodyB = rigidBodies[p.rigidBodyIndex2];

                /*
                * Refer to http://www20.atpages.jp/katwat/wp/?p=4135
                */
                if (bodyA.type !== 0 && bodyB.type === 2)
                {
                    if (bodyA.boneIndex !== -1 && bodyB.boneIndex !== -1 &&
                        model.bones[bodyB.boneIndex].parentIndex === bodyA.boneIndex)
                    {
                        bodyB.type = 1;

                    }

                }

                constraints.push(p);

            }

            geometry.rigidBodies = rigidBodies;
            geometry.constraints = constraints;

        };

        var initGeometry = function ()
        {
            geometry.setIndex(new (buffer.indices.length > 65535 ? THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute)(buffer.indices, 1));
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(buffer.vertices, 3));
            geometry.addAttribute('normal', new THREE.Float32BufferAttribute(buffer.normals, 3));
            geometry.addAttribute('uv', new THREE.Float32BufferAttribute(buffer.uvs, 2));
            geometry.addAttribute('skinIndex', new THREE.Float32BufferAttribute(buffer.skinIndices, 4));
            geometry.addAttribute('skinWeight', new THREE.Float32BufferAttribute(buffer.skinWeights, 4));

            geometry.computeBoundingSphere();
            geometry.mmdFormat = model.metadata.format;

        };

        initVartices();
        initFaces();
        initBones();
        initIKs();
        initGrants();
        initMorphs();
        initMaterials();
        initPhysics();
        initGeometry();

        var mesh = new THREE.SkinnedMesh(geometry, material);

        return mesh;
    }

    createAnimation(mesh, vmd, name)
    {
        var helper = new DataCreationHelper();

        var initMotionAnimations = function ()
        {
            if (vmd.metadata.motionCount === 0)
            {
                return;

            }

            var bones = mesh.geometry.bones;
            var orderedMotions = helper.createOrderedMotionArrays(bones, vmd.motions, 'boneName');

            var tracks = [];

            var pushInterpolation = function (array, interpolation, index)
            {
                array.push(interpolation[index + 0] / 127);  // x1
                array.push(interpolation[index + 8] / 127);  // x2
                array.push(interpolation[index + 4] / 127);  // y1
                array.push(interpolation[index + 12] / 127); // y2

            };

            for (var i = 0; i < orderedMotions.length; i++)
            {
                var times = [];
                var positions = [];
                var rotations = [];
                var pInterpolations = [];
                var rInterpolations = [];

                var bone = bones[i];
                var array = orderedMotions[i];

                for (var j = 0; j < array.length; j++)
                {
                    var time = array[j].frameNum / 30;
                    var pos = array[j].position;
                    var rot = array[j].rotation;
                    var interpolation = array[j].interpolation;

                    times.push(time);

                    for (var k = 0; k < 3; k++)
                    {
                        positions.push(bone.pos[k] + pos[k]);

                    }

                    for (var k = 0; k < 4; k++)
                    {
                        rotations.push(rot[k]);

                    }

                    for (var k = 0; k < 3; k++)
                    {
                        pushInterpolation(pInterpolations, interpolation, k);

                    }

                    pushInterpolation(rInterpolations, interpolation, 3);

                }

                if (times.length === 0) continue;

                var boneName = '.bones[' + bone.name + ']';

                tracks.push(new VectorKeyframeTrackEx(boneName + '.position', times, positions, pInterpolations));
                tracks.push(new QuaternionKeyframeTrackEx(boneName + '.quaternion', times, rotations, rInterpolations));

            }

            var clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name, -1, tracks);

            if (clip !== null)
            {
                if (mesh.geometry.animations === undefined) mesh.geometry.animations = [];
                mesh.geometry.animations.push(clip);

            }

        };

        var initMorphAnimations = function ()
        {
            if (vmd.metadata.morphCount === 0)
            {
                return;

            }

            var orderedMorphs = helper.createOrderedMotionArrays(mesh.geometry.morphTargets, vmd.morphs, 'morphName');

            var tracks = [];

            for (var i = 0; i < orderedMorphs.length; i++)
            {
                var times = [];
                var values = [];
                var array = orderedMorphs[i];

                for (var j = 0; j < array.length; j++)
                {
                    times.push(array[j].frameNum / 30);
                    values.push(array[j].weight);

                }

                if (times.length === 0) continue;

                tracks.push(new THREE.NumberKeyframeTrack('.morphTargetInfluences[' + i + ']', times, values, null));

            }

            var clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name + 'Morph', -1, tracks);

            if (clip !== null)
            {
                if (mesh.geometry.animations === undefined) mesh.geometry.animations = [];
                mesh.geometry.animations.push(clip);

            }

        };

        initMotionAnimations();
        initMorphAnimations();
    }
}
