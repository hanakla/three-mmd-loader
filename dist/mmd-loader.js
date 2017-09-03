module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
let t;
if (typeof window !== 'undefined' && window.THREE) {
    t = window.THREE;
}
else if (true) {
    t = __webpack_require__(16);
}
else {
    throw new Error('Can\'t resolve THREE');
}
exports.default = t;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
class CubicBezierInterpolation extends three_1.default.Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer, params) {
        super(parameterPositions, sampleValues, sampleSize, resultBuffer);
        this.params = params;
    }
    interpolate_(i1, t0, t, t1) {
        var result = this.resultBuffer;
        var values = this.sampleValues;
        var stride = this.valueSize;
        var offset1 = i1 * stride;
        var offset0 = offset1 - stride;
        var weight1 = (t - t0) / (t1 - t0);
        if (stride === 4) {
            var x1 = this.params[i1 * 4 + 0];
            var x2 = this.params[i1 * 4 + 1];
            var y1 = this.params[i1 * 4 + 2];
            var y2 = this.params[i1 * 4 + 3];
            var ratio = this._calculate(x1, x2, y1, y2, weight1);
            three_1.default.Quaternion.slerpFlat(result, 0, values, offset0, values, offset1, ratio);
        }
        else if (stride === 3) {
            for (var i = 0; i !== stride; ++i) {
                var x1 = this.params[i1 * 12 + i * 4 + 0];
                var x2 = this.params[i1 * 12 + i * 4 + 1];
                var y1 = this.params[i1 * 12 + i * 4 + 2];
                var y2 = this.params[i1 * 12 + i * 4 + 3];
                var ratio = this._calculate(x1, x2, y1, y2, weight1);
                result[i] = values[offset0 + i] * (1 - ratio) + values[offset1 + i] * ratio;
            }
        }
        else {
            var x1 = this.params[i1 * 4 + 0];
            var x2 = this.params[i1 * 4 + 1];
            var y1 = this.params[i1 * 4 + 2];
            var y2 = this.params[i1 * 4 + 3];
            var ratio = this._calculate(x1, x2, y1, y2, weight1);
            result[0] = values[offset0] * (1 - ratio) + values[offset1] * ratio;
        }
        return result;
    }
    _calculate(x1, x2, y1, y2, x) {
        /*
        * Cubic Bezier curves
        *   https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
        *
        * B(t) = ( 1 - t ) ^ 3 * P0
        *      + 3 * ( 1 - t ) ^ 2 * t * P1
        *      + 3 * ( 1 - t ) * t^2 * P2
        *      + t ^ 3 * P3
        *      ( 0 <= t <= 1 )
        *
        * MMD uses Cubic Bezier curves for bone and camera animation interpolation.
        *   http://d.hatena.ne.jp/edvakf/20111016/1318716097
        *
        *    x = ( 1 - t ) ^ 3 * x0
        *      + 3 * ( 1 - t ) ^ 2 * t * x1
        *      + 3 * ( 1 - t ) * t^2 * x2
        *      + t ^ 3 * x3
        *    y = ( 1 - t ) ^ 3 * y0
        *      + 3 * ( 1 - t ) ^ 2 * t * y1
        *      + 3 * ( 1 - t ) * t^2 * y2
        *      + t ^ 3 * y3
        *      ( x0 = 0, y0 = 0 )
        *      ( x3 = 1, y3 = 1 )
        *      ( 0 <= t, x1, x2, y1, y2 <= 1 )
        *
        * Here solves this equation with Bisection method,
        *   https://en.wikipedia.org/wiki/Bisection_method
        * gets t, and then calculate y.
        *
        * f(t) = 3 * ( 1 - t ) ^ 2 * t * x1
        *      + 3 * ( 1 - t ) * t^2 * x2
        *      + t ^ 3 - x = 0
        *
        * (Another option: Newton's method
        *    https://en.wikipedia.org/wiki/Newton%27s_method)
        */
        var c = 0.5;
        var t = c;
        var s = 1.0 - t;
        var loop = 15;
        var eps = 1e-5;
        var math = Math;
        var sst3, stt3, ttt;
        for (var i = 0; i < loop; i++) {
            sst3 = 3.0 * s * s * t;
            stt3 = 3.0 * s * t * t;
            ttt = t * t * t;
            var ft = (sst3 * x1) + (stt3 * x2) + (ttt) - x;
            if (math.abs(ft) < eps)
                break;
            c /= 2.0;
            t += (ft < 0) ? c : -c;
            s = 1.0 - t;
        }
        return (sst3 * y1) + (stt3 * y2) + ttt;
    }
}
exports.default = CubicBezierInterpolation;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
class MMDGrantSolver {
    constructor(mesh) {
        this.update = (() => {
            var q = new three_1.default.Quaternion();
            return function () {
                for (var i = 0; i < this.mesh.geometry.grants.length; i++) {
                    var g = this.mesh.geometry.grants[i];
                    var b = this.mesh.skeleton.bones[g.index];
                    var pb = this.mesh.skeleton.bones[g.parentIndex];
                    if (g.isLocal) {
                        // TODO: implement
                        if (g.affectPosition) {
                        }
                        // TODO: implement
                        if (g.affectRotation) {
                        }
                    }
                    else {
                        // TODO: implement
                        if (g.affectPosition) {
                        }
                        if (g.affectRotation) {
                            q.set(0, 0, 0, 1);
                            q.slerp(pb.quaternion, g.ratio);
                            b.quaternion.multiply(q);
                        }
                    }
                }
            };
        })();
        this.mesh = mesh;
    }
}
exports.default = MMDGrantSolver;
;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constraint_1 = __webpack_require__(13);
exports.Constraint = Constraint_1.default;
var PhysicsHelper_1 = __webpack_require__(20);
exports.PhysicsHelper = PhysicsHelper_1.default;
var ResourceHelper_1 = __webpack_require__(14);
exports.ResourceHelper = ResourceHelper_1.default;
var RigidBody_1 = __webpack_require__(15);
exports.RigidBody = RigidBody_1.default;
var MMDPhysics_1 = __webpack_require__(19);
exports.default = MMDPhysics_1.default;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require('ammo.js');

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class MMDAudioManager {
    constructor(audio, listener, p) {
        var params = (p === null || p === undefined) ? {} : p;
        this.audio = audio;
        this.listener = listener;
        this.elapsedTime = 0.0;
        this.currentTime = 0.0;
        this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;
        this.audioDuration = this.audio.buffer.duration;
        this.duration = this.audioDuration + this.delayTime;
    }
    control(delta) {
        this.elapsed += delta;
        this.currentTime += delta;
        if (this.checkIfStopAudio()) {
            this.audio.stop();
        }
        if (this.checkIfStartAudio()) {
            this.audio.play();
        }
    }
    checkIfStartAudio() {
        if (this.audio.isPlaying) {
            return false;
        }
        while (this.currentTime >= this.duration) {
            this.currentTime -= this.duration;
        }
        if (this.currentTime < this.delayTime) {
            return false;
        }
        this.audio.startTime = this.currentTime - this.delayTime;
        return true;
    }
    checkIfStopAudio() {
        if (!this.audio.isPlaying) {
            return false;
        }
        if (this.currentTime >= this.duration) {
            return true;
        }
        return false;
    }
}
exports.default = MMDAudioManager;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
const MMDPhysics_1 = __webpack_require__(3);
const CCDIKSolver_1 = __webpack_require__(8);
const MMDGrantSolver_1 = __webpack_require__(2);
class MMDHelper {
    constructor() {
        this.meshes = [];
        this.doAnimation = true;
        this.doIk = true;
        this.doGrant = true;
        this.doPhysics = true;
        this.doCameraAnimation = true;
        this.sharedPhysics = false;
        this.masterPhysics = null;
        this.audioManager = null;
        this.camera = null;
    }
    add(mesh) {
        if (!(mesh instanceof three_1.default.SkinnedMesh)) {
            throw new Error('THREE.MMDHelper.add() accepts only THREE.SkinnedMesh instance.');
        }
        if (mesh.mixer === undefined)
            mesh.mixer = null;
        if (mesh.ikSolver === undefined)
            mesh.ikSolver = null;
        if (mesh.grantSolver === undefined)
            mesh.grantSolver = null;
        if (mesh.physics === undefined)
            mesh.physics = null;
        if (mesh.looped === undefined)
            mesh.looped = false;
        this.meshes.push(mesh);
        // workaround until I make IK and Physics Animation plugin
        this.initBackupBones(mesh);
    }
    setAudio(audio, listener, params) {
        this.audioManager = new MMDAudioManager(audio, listener, params);
    }
    setCamera(camera) {
        camera.mixer = null;
        this.camera = camera;
    }
    setPhysicses(params) {
        for (var i = 0; i < this.meshes.length; i++) {
            this.setPhysics(this.meshes[i], params);
        }
    }
    setPhysics(mesh, params = {}) {
        if (params.world === undefined && this.sharedPhysics) {
            var masterPhysics = this.getMasterPhysics();
            if (masterPhysics !== null)
                params.world = masterPhysics.world;
        }
        var warmup = params.warmup !== undefined ? params.warmup : 60;
        var physics = new MMDPhysics_1.default(mesh, params);
        if (mesh.mixer !== null && mesh.mixer !== undefined && params.preventAnimationWarmup !== true) {
            this.animateOneMesh(0, mesh);
            physics.reset();
        }
        physics.warmup(warmup);
        this.updateIKParametersDependingOnPhysicsEnabled(mesh, true);
        mesh.physics = physics;
    }
    getMasterPhysics() {
        if (this.masterPhysics !== null)
            return this.masterPhysics;
        for (var i = 0, il = this.meshes.length; i < il; i++) {
            var physics = this.meshes[i].physics;
            if (physics !== undefined && physics !== null) {
                this.masterPhysics = physics;
                return this.masterPhysics;
            }
        }
        return null;
    }
    enablePhysics(enabled) {
        if (enabled === true) {
            this.doPhysics = true;
        }
        else {
            this.doPhysics = false;
        }
        for (var i = 0, il = this.meshes.length; i < il; i++) {
            this.updateIKParametersDependingOnPhysicsEnabled(this.meshes[i], enabled);
        }
    }
    updateIKParametersDependingOnPhysicsEnabled(mesh, physicsEnabled) {
        var iks = mesh.geometry.iks;
        var bones = mesh.geometry.bones;
        for (var j = 0, jl = iks.length; j < jl; j++) {
            var ik = iks[j];
            var links = ik.links;
            for (var k = 0, kl = links.length; k < kl; k++) {
                var link = links[k];
                if (physicsEnabled === true) {
                    // disable IK of the bone the corresponding rigidBody type of which is 1 or 2
                    // because its rotation will be overriden by physics
                    link.enabled = bones[link.index].rigidBodyType > 0 ? false : true;
                }
                else {
                    link.enabled = true;
                }
            }
        }
    }
    setAnimations() {
        for (var i = 0; i < this.meshes.length; i++) {
            this.setAnimation(this.meshes[i]);
        }
    }
    setAnimation(mesh) {
        if (mesh.geometry.animations !== undefined) {
            mesh.mixer = new three_1.default.AnimationMixer(mesh);
            // TODO: find a workaround not to access (seems like) private properties
            //       the name of them begins with "_".
            mesh.mixer.addEventListener('loop', function (e) {
                if (e.action._clip.tracks[0].name.indexOf('.bones') !== 0)
                    return;
                var mesh = e.target._root;
                mesh.looped = true;
            });
            var foundAnimation = false;
            var foundMorphAnimation = false;
            for (var i = 0; i < mesh.geometry.animations.length; i++) {
                var clip = mesh.geometry.animations[i];
                var action = mesh.mixer.clipAction(clip);
                if (clip.tracks[0].name.indexOf('.morphTargetInfluences') === 0) {
                    if (!foundMorphAnimation) {
                        action.play();
                        foundMorphAnimation = true;
                    }
                }
                else {
                    if (!foundAnimation) {
                        action.play();
                        foundAnimation = true;
                    }
                }
            }
            if (foundAnimation) {
                mesh.ikSolver = new CCDIKSolver_1.default(mesh);
                if (mesh.geometry.grants !== undefined) {
                    mesh.grantSolver = new MMDGrantSolver_1.default(mesh);
                }
            }
        }
    }
    setCameraAnimation(camera) {
        if (camera.animations !== undefined) {
            camera.mixer = new three_1.default.AnimationMixer(camera);
            camera.mixer.clipAction(camera.animations[0]).play();
        }
    }
    /*
     * detect the longest duration among model, camera, and audio animations and then
     * set it to them to sync.
     * TODO: touching private properties ( ._actions and ._clip ) so consider better way
     *       to access them for safe and modularity.
     */
    unifyAnimationDuration(params) {
        params = params === undefined ? {} : params;
        var max = 0.0;
        var camera = this.camera;
        var audioManager = this.audioManager;
        // check the longest duration
        for (var i = 0; i < this.meshes.length; i++) {
            var mesh = this.meshes[i];
            var mixer = mesh.mixer;
            if (mixer === null) {
                continue;
            }
            for (var j = 0; j < mixer._actions.length; j++) {
                var action = mixer._actions[j];
                max = Math.max(max, action._clip.duration);
            }
        }
        if (camera !== null && camera.mixer !== null) {
            var mixer = camera.mixer;
            for (var i = 0; i < mixer._actions.length; i++) {
                var action = mixer._actions[i];
                max = Math.max(max, action._clip.duration);
            }
        }
        if (audioManager !== null) {
            max = Math.max(max, audioManager.duration);
        }
        if (params.afterglow !== undefined) {
            max += params.afterglow;
        }
        // set the duration
        for (var i = 0; i < this.meshes.length; i++) {
            var mesh = this.meshes[i];
            var mixer = mesh.mixer;
            if (mixer === null) {
                continue;
            }
            for (var j = 0; j < mixer._actions.length; j++) {
                var action = mixer._actions[j];
                action._clip.duration = max;
            }
        }
        if (camera !== null && camera.mixer !== null) {
            var mixer = camera.mixer;
            for (var i = 0; i < mixer._actions.length; i++) {
                var action = mixer._actions[i];
                action._clip.duration = max;
            }
        }
        if (audioManager !== null) {
            audioManager.duration = max;
        }
    }
    controlAudio(delta) {
        if (this.audioManager === null) {
            return;
        }
        this.audioManager.control(delta);
    }
    animate(delta) {
        this.controlAudio(delta);
        for (var i = 0; i < this.meshes.length; i++) {
            this.animateOneMesh(delta, this.meshes[i]);
        }
        if (this.sharedPhysics)
            this.updateSharedPhysics(delta);
        this.animateCamera(delta);
    }
    animateOneMesh(delta, mesh) {
        var mixer = mesh.mixer;
        var ikSolver = mesh.ikSolver;
        var grantSolver = mesh.grantSolver;
        var physics = mesh.physics;
        if (mixer !== null && this.doAnimation === true) {
            // restore/backupBones are workaround
            // until I make IK, Grant, and Physics Animation plugin
            this.restoreBones(mesh);
            mixer.update(delta);
            this.backupBones(mesh);
        }
        if (ikSolver !== null && this.doIk === true) {
            ikSolver.update();
        }
        if (grantSolver !== null && this.doGrant === true) {
            grantSolver.update();
        }
        if (mesh.looped === true) {
            if (physics !== null)
                physics.reset();
            mesh.looped = false;
        }
        if (physics !== null && this.doPhysics && !this.sharedPhysics) {
            physics.update(delta);
        }
    }
    updateSharedPhysics(delta) {
        if (this.meshes.length === 0 || !this.doPhysics || !this.sharedPhysics)
            return;
        var physics = this.getMasterPhysics();
        if (physics === null)
            return;
        for (var i = 0, il = this.meshes.length; i < il; i++) {
            var p = this.meshes[i].physics;
            if (p !== null && p !== undefined) {
                p.updateRigidBodies();
            }
        }
        physics.stepSimulation(delta);
        for (var i = 0, il = this.meshes.length; i < il; i++) {
            var p = this.meshes[i].physics;
            if (p !== null && p !== undefined) {
                p.updateBones();
            }
        }
    }
    animateCamera(delta) {
        if (this.camera === null) {
            return;
        }
        var mixer = this.camera.mixer;
        if (mixer !== null && this.camera.center !== undefined && this.doCameraAnimation === true) {
            mixer.update(delta);
            // TODO: Let PerspectiveCamera automatically update?
            this.camera.updateProjectionMatrix();
            this.camera.up.set(0, 1, 0);
            this.camera.up.applyQuaternion(this.camera.quaternion);
            this.camera.lookAt(this.camera.center);
        }
    }
    poseAsVpd(mesh, vpd, params) {
        if (params === undefined)
            params = {};
        if (params.preventResetPose !== true)
            mesh.pose();
        var bones = mesh.skeleton.bones;
        var bones2 = vpd.bones;
        var table = {};
        for (var i = 0; i < bones.length; i++) {
            table[bones[i].name] = i;
        }
        var thV = new three_1.default.Vector3();
        var thQ = new three_1.default.Quaternion();
        for (var i = 0; i < bones2.length; i++) {
            var b = bones2[i];
            var index = table[b.name];
            if (index === undefined)
                continue;
            var b2 = bones[index];
            var t = b.translation;
            var q = b.quaternion;
            thV.set(t[0], t[1], t[2]);
            thQ.set(q[0], q[1], q[2], q[3]);
            b2.position.add(thV);
            b2.quaternion.multiply(thQ);
        }
        mesh.updateMatrixWorld(true);
        if (params.preventIk !== true) {
            var solver = new CCDIKSolver_1.default(mesh);
            solver.update(params.saveOriginalBonesBeforeIK);
        }
        if (params.preventGrant !== true && mesh.geometry.grants !== undefined) {
            var solver = new MMDGrantSolver_1.default(mesh);
            solver.update();
        }
    }
    /**
     * Note: These following three functions are workaround for r74dev.
     *       THREE.PropertyMixer.apply() seems to save values into buffer cache
     *       when mixer.update() is called.
     *       ikSolver.update() and physics.update() change bone position/quaternion
     *       without mixer.update() then buffer cache will be inconsistent.
     *       So trying to avoid buffer cache inconsistency by doing
     *       backup bones position/quaternion right after mixer.update() call
     *       and then restore them after rendering.
     */
    initBackupBones(mesh) {
        mesh.skeleton.backupBones = [];
        for (var i = 0; i < mesh.skeleton.bones.length; i++) {
            mesh.skeleton.backupBones.push(mesh.skeleton.bones[i].clone());
        }
    }
    backupBones(mesh) {
        mesh.skeleton.backupBoneIsSaved = true;
        for (var i = 0; i < mesh.skeleton.bones.length; i++) {
            var b = mesh.skeleton.backupBones[i];
            var b2 = mesh.skeleton.bones[i];
            b.position.copy(b2.position);
            b.quaternion.copy(b2.quaternion);
        }
    }
    restoreBones(mesh) {
        if (mesh.skeleton.backupBoneIsSaved !== true) {
            return;
        }
        mesh.skeleton.backupBoneIsSaved = false;
        for (var i = 0; i < mesh.skeleton.bones.length; i++) {
            var b = mesh.skeleton.bones[i];
            var b2 = mesh.skeleton.backupBones[i];
            b.position.copy(b2.position);
            b.quaternion.copy(b2.quaternion);
        }
    }
}
exports.default = MMDHelper;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
const MMDParser = __webpack_require__(23);
const TGALoader_1 = __webpack_require__(21);
const DataCreationHelper_1 = __webpack_require__(9);
const VectorKeyframeTrackEx_1 = __webpack_require__(12);
const QuaternionKeyframeTrackEx_1 = __webpack_require__(11);
const NumberKeyframeTrackEx_1 = __webpack_require__(10);
const KeyframeTrackers = {
    VectorKeyframeTrackEx: VectorKeyframeTrackEx_1.default,
    QuaternionKeyframeTrackEx: QuaternionKeyframeTrackEx_1.default,
    NumberKeyframeTrackEx: NumberKeyframeTrackEx_1.default,
};
class MMDLoader extends three_1.default.Loader {
    constructor(manager) {
        super();
        /**
         * base64 encoded defalut toon textures toon00.bmp - toon10.bmp
         * Users don't need to prepare default texture files.
         *
         * This idea is from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
         */
        this.defaultToonTextures = [
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
        this.manager = (manager !== undefined) ? manager : three_1.default.DefaultLoadingManager;
        this.parser = new MMDParser.Parser();
        this.textureCrossOrigin = null;
    }
    /**
     * Set 'anonymous' for the the texture image file in other domain
     * even if server responds with "Access-Control-Allow-Origin: *"
     * because some image operation fails in MMDLoader.
     */
    setTextureCrossOrigin(value) {
        this.textureCrossOrigin = value;
    }
    load(modelUrl, vmdUrls, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const mesh = yield this.loadModel(modelUrl, onProgress);
            const vmds = yield this.loadVmds(vmdUrls, onProgress);
            this.pourVmdIntoModel(mesh, vmds);
        });
    }
    loadModel(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            var scope = this;
            var texturePath = this.extractUrlBase(url);
            var modelExtension = this.extractExtension(url);
            const buffer = yield this.loadFileAsBuffer(url, onProgress);
            return this.createModel(buffer, modelExtension, texturePath, onProgress);
        });
    }
    createModel(buffer, modelExtension, texturePath, onProgress) {
        return this.createMesh(this.parseModel(buffer, modelExtension), texturePath, onProgress);
    }
    loadVmd(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parseVmd(yield this.loadFileAsBuffer(url, onProgress));
        });
    }
    loadVmds(urls, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: handle onProgress
            const vmdLoaders = urls.map(url => this.loadVmd(url));
            return this.mergeVmds(yield Promise.all(vmdLoaders));
        });
    }
    loadAudio(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            var listener = new three_1.default.AudioListener();
            var audio = new three_1.default.Audio(listener);
            var loader = new three_1.default.AudioLoader(this.manager);
            return new Promise((resolve, reject) => {
                loader.load(url, (buffer) => {
                    audio.setBuffer(buffer);
                    resolve([audio, listener]);
                }, onProgress, (e) => reject(e.error));
            });
        });
    }
    loadVpd(url, params, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = ((params && params.charcode === 'unicode') ? this.loadFileAsText : this.loadFileAsShiftJISText).bind(this);
            return new Promise((resolve, reject) => {
                func(url, (text) => resolve(this.parseVpd(text)), onProgress, (e) => reject(e.error));
            });
        });
    }
    parseModel(buffer, modelExtension) {
        // Should I judge from model data header?
        switch (modelExtension.toLowerCase()) {
            case 'pmd':
                return this.parsePmd(buffer);
            case 'pmx':
                return this.parsePmx(buffer);
            default:
                throw 'extension ' + modelExtension + ' is not supported.';
        }
    }
    parsePmd(buffer) {
        return this.parser.parsePmd(buffer, true);
    }
    parsePmx(buffer) {
        return this.parser.parsePmx(buffer, true);
    }
    parseVmd(buffer) {
        return this.parser.parseVmd(buffer, true);
    }
    parseVpd(text) {
        return this.parser.parseVpd(text, true);
    }
    mergeVmds(vmds) {
        return this.parser.mergeVmds(vmds);
    }
    pourVmdIntoModel(mesh, vmd, name) {
        this.createAnimation(mesh, vmd, name);
    }
    pourVmdIntoCamera(camera, vmd, name) {
        var helper = new DataCreationHelper_1.default();
        var initAnimation = function () {
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
            var quaternion = new three_1.default.Quaternion();
            var euler = new three_1.default.Euler();
            var position = new three_1.default.Vector3();
            var center = new three_1.default.Vector3();
            var pushVector3 = function (array, vec) {
                array.push(vec.x);
                array.push(vec.y);
                array.push(vec.z);
            };
            var pushQuaternion = function (array, q) {
                array.push(q.x);
                array.push(q.y);
                array.push(q.z);
                array.push(q.w);
            };
            var pushInterpolation = function (array, interpolation, index) {
                array.push(interpolation[index * 4 + 0] / 127); // x1
                array.push(interpolation[index * 4 + 1] / 127); // x2
                array.push(interpolation[index * 4 + 2] / 127); // y1
                array.push(interpolation[index * 4 + 3] / 127); // y2
            };
            var createTrack = function (node, type, times, values, interpolations) {
                /*
                * optimizes here not to let KeyframeTrackPrototype optimize
                * because KeyframeTrackPrototype optimizes times and values but
                * doesn't optimize interpolations.
                */
                if (times.length > 2) {
                    times = times.slice();
                    values = values.slice();
                    interpolations = interpolations.slice();
                    let stride = values.length / times.length;
                    let interpolateStride = (stride === 3) ? 12 : 4; // 3: Vector3, others: Quaternion or Number
                    let index = 1;
                    for (let aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex++) {
                        for (let i = 0; i < stride; i++) {
                            if (values[index * stride + i] !== values[(index - 1) * stride + i] ||
                                values[index * stride + i] !== values[aheadIndex * stride + i]) {
                                index++;
                                break;
                            }
                        }
                        if (aheadIndex > index) {
                            times[index] = times[aheadIndex];
                            for (var i = 0; i < stride; i++) {
                                values[index * stride + i] = values[aheadIndex * stride + i];
                            }
                            for (var i = 0; i < interpolateStride; i++) {
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
            for (var i = 0; i < orderedMotions.length; i++) {
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
                if (times.length > 0 && time < times[times.length - 1] + (1 / 30) * 1.5) {
                    times[times.length - 1] = time - 1e-13;
                }
                times.push(time);
                pushVector3(centers, center);
                pushQuaternion(quaternions, quaternion);
                pushVector3(positions, position);
                fovs.push(fov);
                for (var j = 0; j < 3; j++) {
                    pushInterpolation(cInterpolations, interpolation, j);
                }
                pushInterpolation(qInterpolations, interpolation, 3);
                // use same one parameter for x, y, z axis.
                for (var j = 0; j < 3; j++) {
                    pushInterpolation(pInterpolations, interpolation, 4);
                }
                pushInterpolation(fInterpolations, interpolation, 5);
            }
            if (times.length === 0)
                return;
            var tracks = [];
            tracks.push(createTrack('.center', 'VectorKeyframeTrackEx', times, centers, cInterpolations));
            tracks.push(createTrack('.quaternion', 'QuaternionKeyframeTrackEx', times, quaternions, qInterpolations));
            tracks.push(createTrack('.position', 'VectorKeyframeTrackEx', times, positions, pInterpolations));
            tracks.push(createTrack('.fov', 'NumberKeyframeTrackEx', times, fovs, fInterpolations));
            var clip = new three_1.default.AnimationClip(name === undefined ? three_1.default.Math.generateUUID() : name, -1, tracks);
            if (clip !== null) {
                if (camera.center === undefined)
                    camera.center = new three_1.default.Vector3(0, 0, 0);
                if (camera.animations === undefined)
                    camera.animations = [];
                camera.animations.push(clip);
            }
        };
        initAnimation();
    }
    extractExtension(url) {
        var index = url.lastIndexOf('.');
        if (index < 0) {
            return null;
        }
        return url.slice(index + 1);
    }
    loadFile(url, responseType, mimeType, onProgress) {
        return new Promise((resolve, reject) => {
            const loader = new three_1.default.FileLoader(this.manager);
            if (mimeType != null)
                loader.setMimeType(mimeType);
            loader.setResponseType(responseType);
            loader.load(url, (result) => resolve(result), onProgress, (e) => reject(e.error));
        });
    }
    loadFileAsBuffer(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loadFile(url, 'arraybuffer', null, onProgress);
        });
    }
    loadFileAsText(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loadFile(url, 'text', null, onProgress);
        });
    }
    loadFileAsShiftJISText(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loadFile(url, 'text', 'text/plain; charset=shift_jis', onProgress);
        });
    }
    createMesh(model, texturePath, onProgress) {
        var scope = this;
        var geometry = new three_1.default.BufferGeometry();
        var material = new three_1.default.MultiMaterial();
        var helper = new DataCreationHelper_1.default();
        var buffer = {};
        buffer.vertices = [];
        buffer.uvs = [];
        buffer.normals = [];
        buffer.skinIndices = [];
        buffer.skinWeights = [];
        buffer.indices = [];
        var initVartices = function () {
            for (var i = 0; i < model.metadata.vertexCount; i++) {
                var v = model.vertices[i];
                for (var j = 0, jl = v.position.length; j < jl; j++) {
                    buffer.vertices.push(v.position[j]);
                }
                for (var j = 0, jl = v.normal.length; j < jl; j++) {
                    buffer.normals.push(v.normal[j]);
                }
                for (var j = 0, jl = v.uv.length; j < jl; j++) {
                    buffer.uvs.push(v.uv[j]);
                }
                for (var j = 0; j < 4; j++) {
                    buffer.skinIndices.push(v.skinIndices.length - 1 >= j ? v.skinIndices[j] : 0.0);
                }
                for (var j = 0; j < 4; j++) {
                    buffer.skinWeights.push(v.skinWeights.length - 1 >= j ? v.skinWeights[j] : 0.0);
                }
            }
        };
        var initFaces = function () {
            for (var i = 0; i < model.metadata.faceCount; i++) {
                var f = model.faces[i];
                for (var j = 0, jl = f.indices.length; j < jl; j++) {
                    buffer.indices.push(f.indices[j]);
                }
            }
        };
        var initBones = function () {
            var bones = [];
            var rigidBodies = model.rigidBodies;
            var dictionary = {};
            for (var i = 0, il = rigidBodies.length; i < il; i++) {
                var body = rigidBodies[i];
                var value = dictionary[body.boneIndex];
                // keeps greater number if already value is set without any special reasons
                value = value === undefined ? body.type : Math.max(body.type, value);
                dictionary[body.boneIndex] = value;
            }
            for (var i = 0; i < model.metadata.boneCount; i++) {
                var bone = {};
                var b = model.bones[i];
                bone.parent = b.parentIndex;
                bone.name = b.name;
                bone.pos = [b.position[0], b.position[1], b.position[2]];
                bone.rotq = [0, 0, 0, 1];
                bone.scl = [1, 1, 1];
                if (bone.parent !== -1) {
                    bone.pos[0] -= model.bones[bone.parent].position[0];
                    bone.pos[1] -= model.bones[bone.parent].position[1];
                    bone.pos[2] -= model.bones[bone.parent].position[2];
                }
                bone.rigidBodyType = dictionary[i] !== undefined ? dictionary[i] : -1;
                bones.push(bone);
            }
            geometry.bones = bones;
        };
        var initIKs = function () {
            var iks = [];
            // TODO: remove duplicated codes between PMD and PMX
            if (model.metadata.format === 'pmd') {
                for (var i = 0; i < model.metadata.ikCount; i++) {
                    var ik = model.iks[i];
                    var param = {};
                    param.target = ik.target;
                    param.effector = ik.effector;
                    param.iteration = ik.iteration;
                    param.maxAngle = ik.maxAngle * 4;
                    param.links = [];
                    for (var j = 0; j < ik.links.length; j++) {
                        var link = {};
                        link.index = ik.links[j].index;
                        if (model.bones[link.index].name.indexOf('ひざ') >= 0) {
                            link.limitation = new three_1.default.Vector3(1.0, 0.0, 0.0);
                        }
                        param.links.push(link);
                    }
                    iks.push(param);
                }
            }
            else {
                for (var i = 0; i < model.metadata.boneCount; i++) {
                    var b = model.bones[i];
                    var ik = b.ik;
                    if (ik === undefined) {
                        continue;
                    }
                    var param = {};
                    param.target = i;
                    param.effector = ik.effector;
                    param.iteration = ik.iteration;
                    param.maxAngle = ik.maxAngle;
                    param.links = [];
                    for (var j = 0; j < ik.links.length; j++) {
                        var link = {};
                        link.index = ik.links[j].index;
                        link.enabled = true;
                        if (ik.links[j].angleLimitation === 1) {
                            link.limitation = new three_1.default.Vector3(1.0, 0.0, 0.0);
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
        var initGrants = function () {
            if (model.metadata.format === 'pmd') {
                return;
            }
            var grants = [];
            for (var i = 0; i < model.metadata.boneCount; i++) {
                var b = model.bones[i];
                var grant = b.grant;
                if (grant === undefined) {
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
            grants.sort(function (a, b) {
                return a.transformationClass - b.transformationClass;
            });
            geometry.grants = grants;
        };
        var initMorphs = function () {
            function updateVertex(attribute, index, v, ratio) {
                attribute.array[index * 3 + 0] += v.position[0] * ratio;
                attribute.array[index * 3 + 1] += v.position[1] * ratio;
                attribute.array[index * 3 + 2] += v.position[2] * ratio;
            }
            function updateVertices(attribute, m, ratio) {
                for (var i = 0; i < m.elementCount; i++) {
                    var v = m.elements[i];
                    var index;
                    if (model.metadata.format === 'pmd') {
                        index = model.morphs[0].elements[v.index].index;
                    }
                    else {
                        index = v.index;
                    }
                    updateVertex(attribute, index, v, ratio);
                }
            }
            var morphTargets = [];
            var attributes = [];
            for (var i = 0; i < model.metadata.morphCount; i++) {
                var m = model.morphs[i];
                var params = { name: m.name };
                var attribute = new three_1.default.Float32BufferAttribute(model.metadata.vertexCount * 3, 3);
                for (var j = 0; j < model.metadata.vertexCount * 3; j++) {
                    attribute.array[j] = buffer.vertices[j];
                }
                if (model.metadata.format === 'pmd') {
                    if (i !== 0) {
                        updateVertices(attribute, m, 1.0);
                    }
                }
                else {
                    if (m.type === 0) {
                        for (var j = 0; j < m.elementCount; j++) {
                            var m2 = model.morphs[m.elements[j].index];
                            var ratio = m.elements[j].ratio;
                            if (m2.type === 1) {
                                updateVertices(attribute, m2, ratio);
                            }
                            else {
                                // TODO: implement
                            }
                        }
                    }
                    else if (m.type === 1) {
                        updateVertices(attribute, m, 1.0);
                    }
                    else if (m.type === 2) {
                        // TODO: implement
                    }
                    else if (m.type === 3) {
                        // TODO: implement
                    }
                    else if (m.type === 4) {
                        // TODO: implement
                    }
                    else if (m.type === 5) {
                        // TODO: implement
                    }
                    else if (m.type === 6) {
                        // TODO: implement
                    }
                    else if (m.type === 7) {
                        // TODO: implement
                    }
                    else if (m.type === 8) {
                        // TODO: implement
                    }
                }
                morphTargets.push(params);
                attributes.push(attribute);
            }
            geometry.morphTargets = morphTargets;
            geometry.morphAttributes.position = attributes;
        };
        var initMaterials = function () {
            var textures = {};
            var textureLoader = new three_1.default.TextureLoader(scope.manager);
            var tgaLoader = new TGALoader_1.default(scope.manager);
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var offset = 0;
            var materialParams = [];
            if (scope.textureCrossOrigin !== null)
                textureLoader.setCrossOrigin(scope.textureCrossOrigin);
            function loadTexture(filePath, params) {
                if (params === undefined) {
                    params = {};
                }
                var fullPath;
                if (params.defaultTexturePath === true) {
                    try {
                        fullPath = scope.defaultToonTextures[parseInt(filePath.match('toon([0-9]{2})\.bmp$')[1])];
                    }
                    catch (e) {
                        console.warn('THREE.MMDLoader: ' + filePath + ' seems like not right default texture path. Using toon00.bmp instead.');
                        fullPath = scope.defaultToonTextures[0];
                    }
                }
                else {
                    fullPath = texturePath + filePath;
                }
                if (textures[fullPath] !== undefined)
                    return fullPath;
                var loader = three_1.default.Loader.Handlers.get(fullPath);
                if (loader === null) {
                    loader = (filePath.indexOf('.tga') >= 0) ? tgaLoader : textureLoader;
                }
                var texture = loader.load(fullPath, function (t) {
                    // MMD toon texture is Axis-Y oriented
                    // but Three.js gradient map is Axis-X oriented.
                    // So here replaces the toon texture image with the rotated one.
                    if (params.isToonTexture === true) {
                        var image = t.image;
                        var width = image.width;
                        var height = image.height;
                        canvas.width = width;
                        canvas.height = height;
                        context.clearRect(0, 0, width, height);
                        context.translate(width / 2.0, height / 2.0);
                        context.rotate(0.5 * Math.PI); // 90.0 * Math.PI / 180.0
                        context.translate(-width / 2.0, -height / 2.0);
                        context.drawImage(image, 0, 0);
                        t.image = context.getImageData(0, 0, width, height);
                    }
                    t.flipY = false;
                    t.wrapS = three_1.default.RepeatWrapping;
                    t.wrapT = three_1.default.RepeatWrapping;
                    if (params.sphericalReflectionMapping === true) {
                        t.mapping = three_1.default.SphericalReflectionMapping;
                    }
                    for (var i = 0; i < texture.readyCallbacks.length; i++) {
                        texture.readyCallbacks[i](texture);
                    }
                    delete texture.readyCallbacks;
                }, onProgress, (e) => { throw e.error; });
                texture.readyCallbacks = [];
                textures[fullPath] = texture;
                return fullPath;
            }
            function getTexture(name, textures) {
                if (textures[name] === undefined) {
                    console.warn('THREE.MMDLoader: Undefined texture', name);
                }
                return textures[name];
            }
            for (var i = 0; i < model.metadata.materialCount; i++) {
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
                params.color = new three_1.default.Color(m.diffuse[0], m.diffuse[1], m.diffuse[2]);
                params.opacity = m.diffuse[3];
                params.specular = new three_1.default.Color(m.specular[0], m.specular[1], m.specular[2]);
                params.shininess = m.shininess;
                if (params.opacity === 1.0) {
                    params.side = three_1.default.FrontSide;
                    params.transparent = false;
                }
                else {
                    params.side = three_1.default.DoubleSide;
                    params.transparent = true;
                }
                if (model.metadata.format === 'pmd') {
                    if (m.fileName) {
                        var fileName = m.fileName;
                        var fileNames = [];
                        var index = fileName.lastIndexOf('*');
                        if (index >= 0) {
                            fileNames.push(fileName.slice(0, index));
                            fileNames.push(fileName.slice(index + 1));
                        }
                        else {
                            fileNames.push(fileName);
                        }
                        for (var j = 0; j < fileNames.length; j++) {
                            var n = fileNames[j];
                            if (n.indexOf('.sph') >= 0 || n.indexOf('.spa') >= 0) {
                                params.envMap = loadTexture(n, { sphericalReflectionMapping: true });
                                if (n.indexOf('.sph') >= 0) {
                                    params.envMapType = three_1.default.MultiplyOperation;
                                }
                                else {
                                    params.envMapType = three_1.default.AddOperation;
                                }
                            }
                            else {
                                params.map = loadTexture(n);
                            }
                        }
                    }
                }
                else {
                    if (m.textureIndex !== -1) {
                        var n = model.textures[m.textureIndex];
                        params.map = loadTexture(n);
                    }
                    // TODO: support m.envFlag === 3
                    if (m.envTextureIndex !== -1 && (m.envFlag === 1 || m.envFlag == 2)) {
                        var n = model.textures[m.envTextureIndex];
                        params.envMap = loadTexture(n, { sphericalReflectionMapping: true });
                        if (m.envFlag === 1) {
                            params.envMapType = three_1.default.MultiplyOperation;
                        }
                        else {
                            params.envMapType = three_1.default.AddOperation;
                        }
                    }
                }
                var coef = (params.map === undefined) ? 1.0 : 0.2;
                params.emissive = new three_1.default.Color(m.ambient[0] * coef, m.ambient[1] * coef, m.ambient[2] * coef);
                materialParams.push(params);
            }
            for (var i = 0; i < materialParams.length; i++) {
                var p = materialParams[i];
                var p2 = model.materials[i];
                var m = new three_1.default.MeshToonMaterial();
                geometry.addGroup(p.faceOffset * 3, p.faceNum * 3, i);
                if (p.name !== undefined)
                    m.name = p.name;
                m.skinning = geometry.bones.length > 0 ? true : false;
                m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
                m.lights = true;
                m.side = (model.metadata.format === 'pmx' && (p2.flag & 0x1) === 1) ? three_1.default.DoubleSide : p.side;
                m.transparent = p.transparent;
                m.fog = true;
                m.blending = three_1.default.CustomBlending;
                m.blendSrc = three_1.default.SrcAlphaFactor;
                m.blendDst = three_1.default.OneMinusSrcAlphaFactor;
                m.blendSrcAlpha = three_1.default.SrcAlphaFactor;
                m.blendDstAlpha = three_1.default.DstAlphaFactor;
                if (p.map !== undefined) {
                    m.faceOffset = p.faceOffset;
                    m.faceNum = p.faceNum;
                    // Check if this part of the texture image the material uses requires transparency
                    function checkTextureTransparency(m) {
                        m.map.readyCallbacks.push(function (t) {
                            // Is there any efficient ways?
                            function createImageData(image) {
                                var c = document.createElement('canvas');
                                c.width = image.width;
                                c.height = image.height;
                                var ctx = c.getContext('2d');
                                ctx.drawImage(image, 0, 0);
                                return ctx.getImageData(0, 0, c.width, c.height);
                            }
                            function detectTextureTransparency(image, uvs, indices) {
                                var width = image.width;
                                var height = image.height;
                                var data = image.data;
                                var threshold = 253;
                                if (data.length / (width * height) !== 4) {
                                    return false;
                                }
                                for (var i = 0; i < indices.length; i += 3) {
                                    var centerUV = { x: 0.0, y: 0.0 };
                                    for (var j = 0; j < 3; j++) {
                                        var index = indices[i * 3 + j];
                                        var uv = { x: uvs[index * 2 + 0], y: uvs[index * 2 + 1] };
                                        if (getAlphaByUv(image, uv) < threshold) {
                                            return true;
                                        }
                                        centerUV.x += uv.x;
                                        centerUV.y += uv.y;
                                    }
                                    centerUV.x /= 3;
                                    centerUV.y /= 3;
                                    if (getAlphaByUv(image, centerUV) < threshold) {
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
                            function getAlphaByUv(image, uv) {
                                var width = image.width;
                                var height = image.height;
                                var x = Math.round(uv.x * width) % width;
                                var y = Math.round(uv.y * height) % height;
                                if (x < 0) {
                                    x += width;
                                }
                                if (y < 0) {
                                    y += height;
                                }
                                var index = y * width + x;
                                return image.data[index * 4 + 3];
                            }
                            var imageData = t.image.data !== undefined ? t.image : createImageData(t.image);
                            var indices = geometry.index.array.slice(m.faceOffset * 3, m.faceOffset * 3 + m.faceNum * 3);
                            if (detectTextureTransparency(imageData, geometry.attributes.uv.array, indices))
                                m.transparent = true;
                            delete m.faceOffset;
                            delete m.faceNum;
                        });
                    }
                    m.map = getTexture(p.map, textures);
                    checkTextureTransparency(m);
                }
                if (p.envMap !== undefined) {
                    m.envMap = getTexture(p.envMap, textures);
                    m.combine = p.envMapType;
                    // TODO: WebGLRenderer should automatically update?
                    m.envMap.readyCallbacks.push(function (t) {
                        m.needsUpdate = true;
                    });
                }
                m.opacity = p.opacity;
                m.color = p.color;
                if (p.emissive !== undefined) {
                    m.emissive = p.emissive;
                }
                m.specular = p.specular;
                m.shininess = Math.max(p.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )
                if (model.metadata.format === 'pmd') {
                    function isDefaultToonTexture(n) {
                        if (n.length !== 10) {
                            return false;
                        }
                        return n.match(/toon(10|0[0-9]).bmp/) === null ? false : true;
                    }
                    // parameters for OutlineEffect
                    m.outlineParameters = {
                        thickness: p2.edgeFlag === 1 ? 0.003 : 0.0,
                        color: new three_1.default.Color(0.0, 0.0, 0.0),
                        alpha: 1.0
                    };
                    if (m.outlineParameters.thickness === 0.0)
                        m.outlineParameters.visible = false;
                    var toonFileName = (p2.toonIndex === -1) ? 'toon00.bmp' : model.toonTextures[p2.toonIndex].fileName;
                    var uuid = loadTexture(toonFileName, { isToonTexture: true, defaultTexturePath: isDefaultToonTexture(toonFileName) });
                    m.gradientMap = getTexture(uuid, textures);
                }
                else {
                    // parameters for OutlineEffect
                    m.outlineParameters = {
                        thickness: p2.edgeSize / 300,
                        color: new three_1.default.Color(p2.edgeColor[0], p2.edgeColor[1], p2.edgeColor[2]),
                        alpha: p2.edgeColor[3]
                    };
                    if ((p2.flag & 0x10) === 0 || m.outlineParameters.thickness === 0.0)
                        m.outlineParameters.visible = false;
                    var toonFileName, isDefaultToon;
                    if (p2.toonIndex === -1 || p2.toonFlag !== 0) {
                        var num = p2.toonIndex + 1;
                        toonFileName = 'toon' + (num < 10 ? '0' + num : num) + '.bmp';
                        isDefaultToon = true;
                    }
                    else {
                        toonFileName = model.textures[p2.toonIndex];
                        isDefaultToon = false;
                    }
                    var uuid = loadTexture(toonFileName, { isToonTexture: true, defaultTexturePath: isDefaultToon });
                    m.gradientMap = getTexture(uuid, textures);
                }
                material.materials.push(m);
            }
            if (model.metadata.format === 'pmx') {
                function checkAlphaMorph(morph, elements) {
                    if (morph.type !== 8) {
                        return;
                    }
                    for (var i = 0; i < elements.length; i++) {
                        var e = elements[i];
                        if (e.index === -1) {
                            continue;
                        }
                        var m = material.materials[e.index];
                        if (m.opacity !== e.diffuse[3]) {
                            m.transparent = true;
                        }
                    }
                }
                for (var i = 0; i < model.morphs.length; i++) {
                    var morph = model.morphs[i];
                    var elements = morph.elements;
                    if (morph.type === 0) {
                        for (var j = 0; j < elements.length; j++) {
                            var morph2 = model.morphs[elements[j].index];
                            var elements2 = morph2.elements;
                            checkAlphaMorph(morph2, elements2);
                        }
                    }
                    else {
                        checkAlphaMorph(morph, elements);
                    }
                }
            }
        };
        var initPhysics = function () {
            var rigidBodies = [];
            var constraints = [];
            for (var i = 0; i < model.metadata.rigidBodyCount; i++) {
                var b = model.rigidBodies[i];
                var keys = Object.keys(b);
                var p = {};
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    p[key] = b[key];
                }
                /*
                * RigidBody position parameter in PMX seems global position
                * while the one in PMD seems offset from corresponding bone.
                * So unify being offset.
                */
                if (model.metadata.format === 'pmx') {
                    if (p.boneIndex !== -1) {
                        var bone = model.bones[p.boneIndex];
                        p.position[0] -= bone.position[0];
                        p.position[1] -= bone.position[1];
                        p.position[2] -= bone.position[2];
                    }
                }
                rigidBodies.push(p);
            }
            for (var i = 0; i < model.metadata.constraintCount; i++) {
                var c = model.constraints[i];
                var keys = Object.keys(c);
                var p = {};
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    p[key] = c[key];
                }
                var bodyA = rigidBodies[p.rigidBodyIndex1];
                var bodyB = rigidBodies[p.rigidBodyIndex2];
                /*
                * Refer to http://www20.atpages.jp/katwat/wp/?p=4135
                */
                if (bodyA.type !== 0 && bodyB.type === 2) {
                    if (bodyA.boneIndex !== -1 && bodyB.boneIndex !== -1 &&
                        model.bones[bodyB.boneIndex].parentIndex === bodyA.boneIndex) {
                        bodyB.type = 1;
                    }
                }
                constraints.push(p);
            }
            geometry.rigidBodies = rigidBodies;
            geometry.constraints = constraints;
        };
        var initGeometry = function () {
            geometry.setIndex(new (buffer.indices.length > 65535 ? three_1.default.Uint32BufferAttribute : three_1.default.Uint16BufferAttribute)(buffer.indices, 1));
            geometry.addAttribute('position', new three_1.default.Float32BufferAttribute(buffer.vertices, 3));
            geometry.addAttribute('normal', new three_1.default.Float32BufferAttribute(buffer.normals, 3));
            geometry.addAttribute('uv', new three_1.default.Float32BufferAttribute(buffer.uvs, 2));
            geometry.addAttribute('skinIndex', new three_1.default.Float32BufferAttribute(buffer.skinIndices, 4));
            geometry.addAttribute('skinWeight', new three_1.default.Float32BufferAttribute(buffer.skinWeights, 4));
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
        var mesh = new three_1.default.SkinnedMesh(geometry, material);
        return mesh;
    }
    createAnimation(mesh, vmd, name) {
        var helper = new DataCreationHelper_1.default();
        var initMotionAnimations = function () {
            if (vmd.metadata.motionCount === 0) {
                return;
            }
            var bones = mesh.geometry.bones;
            var orderedMotions = helper.createOrderedMotionArrays(bones, vmd.motions, 'boneName');
            var tracks = [];
            var pushInterpolation = function (array, interpolation, index) {
                array.push(interpolation[index + 0] / 127); // x1
                array.push(interpolation[index + 8] / 127); // x2
                array.push(interpolation[index + 4] / 127); // y1
                array.push(interpolation[index + 12] / 127); // y2
            };
            for (var i = 0; i < orderedMotions.length; i++) {
                var times = [];
                var positions = [];
                var rotations = [];
                var pInterpolations = [];
                var rInterpolations = [];
                var bone = bones[i];
                var array = orderedMotions[i];
                for (var j = 0; j < array.length; j++) {
                    var time = array[j].frameNum / 30;
                    var pos = array[j].position;
                    var rot = array[j].rotation;
                    var interpolation = array[j].interpolation;
                    times.push(time);
                    for (var k = 0; k < 3; k++) {
                        positions.push(bone.pos[k] + pos[k]);
                    }
                    for (var k = 0; k < 4; k++) {
                        rotations.push(rot[k]);
                    }
                    for (var k = 0; k < 3; k++) {
                        pushInterpolation(pInterpolations, interpolation, k);
                    }
                    pushInterpolation(rInterpolations, interpolation, 3);
                }
                if (times.length === 0)
                    continue;
                var boneName = '.bones[' + bone.name + ']';
                tracks.push(new VectorKeyframeTrackEx_1.default(boneName + '.position', times, positions, pInterpolations));
                tracks.push(new QuaternionKeyframeTrackEx_1.default(boneName + '.quaternion', times, rotations, rInterpolations));
            }
            var clip = new three_1.default.AnimationClip(name === undefined ? three_1.default.Math.generateUUID() : name, -1, tracks);
            if (clip !== null) {
                if (mesh.geometry.animations === undefined)
                    mesh.geometry.animations = [];
                mesh.geometry.animations.push(clip);
            }
        };
        var initMorphAnimations = function () {
            if (vmd.metadata.morphCount === 0) {
                return;
            }
            var orderedMorphs = helper.createOrderedMotionArrays(mesh.geometry.morphTargets, vmd.morphs, 'morphName');
            var tracks = [];
            for (var i = 0; i < orderedMorphs.length; i++) {
                var times = [];
                var values = [];
                var array = orderedMorphs[i];
                for (var j = 0; j < array.length; j++) {
                    times.push(array[j].frameNum / 30);
                    values.push(array[j].weight);
                }
                if (times.length === 0)
                    continue;
                tracks.push(new three_1.default.NumberKeyframeTrack('.morphTargetInfluences[' + i + ']', times, values, null));
            }
            var clip = new three_1.default.AnimationClip(name === undefined ? three_1.default.Math.generateUUID() : name + 'Morph', -1, tracks);
            if (clip !== null) {
                if (mesh.geometry.animations === undefined)
                    mesh.geometry.animations = [];
                mesh.geometry.animations.push(clip);
            }
        };
        initMotionAnimations();
        initMorphAnimations();
    }
}
exports.default = MMDLoader;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CCDIKHelper_1 = __webpack_require__(17);
exports.CCDIKHelper = CCDIKHelper_1.default;
var CCDIKSolver_1 = __webpack_require__(18);
exports.default = CCDIKSolver_1.default;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class DataCreationHelper {
    /**
     * Note: Sometimes to use Japanese Unicode characters runs into problems in Three.js.
     *       In such a case, use this method to convert it to Unicode hex charcode strings,
     *       like 'あいう' -> '0x30420x30440x3046'
     */
    toCharcodeStrings(s) {
        var str = '';
        for (var i = 0; i < s.length; i++) {
            str += '0x' + ('0000' + s[i].charCodeAt().toString(16)).substr(-4);
        }
        return str;
    }
    createDictionary(array) {
        var dict = {};
        for (var i = 0; i < array.length; i++) {
            dict[array[i].name] = i;
        }
        return dict;
    }
    initializeMotionArrays(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            result[i] = [];
        }
        return result;
    }
    sortMotionArray(array) {
        array.sort(function (a, b) {
            return a.frameNum - b.frameNum;
        });
    }
    sortMotionArrays(arrays) {
        for (var i = 0; i < arrays.length; i++) {
            this.sortMotionArray(arrays[i]);
        }
    }
    createMotionArray(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(array[i]);
        }
        return result;
    }
    createMotionArrays(array, result, dict, key) {
        for (var i = 0; i < array.length; i++) {
            var a = array[i];
            var num = dict[a[key]];
            if (num === undefined) {
                continue;
            }
            result[num].push(a);
        }
    }
    createOrderedMotionArray(array) {
        var result = this.createMotionArray(array);
        this.sortMotionArray(result);
        return result;
    }
    createOrderedMotionArrays(targetArray, motionArray, key) {
        var dict = this.createDictionary(targetArray);
        var result = this.initializeMotionArrays(targetArray);
        this.createMotionArrays(motionArray, result, dict, key);
        this.sortMotionArrays(result);
        return result;
    }
}
exports.default = DataCreationHelper;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
const CubicBezierInterpolation_1 = __webpack_require__(1);
class NumberKeyframeTrackEx extends three_1.default.NumberKeyframeTrack {
    constructor(name, times, values, interpolationParameterArray) {
        super(name, times, values);
        this.TimeBufferType = Float64Array;
        this.interpolationParameters = new Float32Array(interpolationParameterArray);
    }
    InterpolantFactoryMethodCubicBezier(result) {
        return new CubicBezierInterpolation_1.default(this.times, this.values, this.getValueSize(), result, this.interpolationParameters);
    }
    setInterpolation(interpolation) {
        this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;
    }
}
exports.default = NumberKeyframeTrackEx;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
const CubicBezierInterpolation_1 = __webpack_require__(1);
class QuaternionKeyframeTrackEx extends three_1.default.QuaternionKeyframeTrack {
    constructor(name, times, values, interpolationParameterArray) {
        super(name, times, values);
        this.TimeBufferType = Float64Array;
        this.interpolationParameters = new Float32Array(interpolationParameterArray);
    }
    InterpolantFactoryMethodCubicBezier(result) {
        return new CubicBezierInterpolation_1.default(this.times, this.values, this.getValueSize(), result, this.interpolationParameters);
    }
    setInterpolation(interpolation) {
        this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;
    }
}
exports.default = QuaternionKeyframeTrackEx;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
const CubicBezierInterpolation_1 = __webpack_require__(1);
/*
 * extends existing KeyframeTrack for bone and camera animation.
 *   - use Float64Array for times
 *   - use Cubic Bezier curves interpolation
 */
class VectorKeyframeTrackEx extends three_1.default.VectorKeyframeTrack {
    constructor(name, times, values, interpolationParameterArray) {
        super(name, times, values);
        this.TimeBufferType = Float64Array;
        this.interpolationParameters = new Float32Array(interpolationParameterArray);
    }
    InterpolantFactoryMethodCubicBezier(result) {
        return new CubicBezierInterpolation_1.default(this.times, this.values, this.getValueSize(), result, this.interpolationParameters);
    }
    setInterpolation(interpolation) {
        this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;
    }
}
exports.default = VectorKeyframeTrackEx;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Ammo = __webpack_require__(4);
class Constraint {
    constructor(mesh, world, bodyA, bodyB, params, helper) {
        this.mesh = mesh;
        this.world = world;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.params = params;
        this.helper = helper;
        this.constraint = null;
        this.init();
    }
    init() {
        var helper = this.helper;
        var params = this.params;
        var bodyA = this.bodyA;
        var bodyB = this.bodyB;
        var form = helper.allocTransform();
        helper.setIdentity(form);
        helper.setOriginFromArray3(form, params.position);
        helper.setBasisFromArray3(form, params.rotation);
        var formA = helper.allocTransform();
        var formB = helper.allocTransform();
        bodyA.body.getMotionState().getWorldTransform(formA);
        bodyB.body.getMotionState().getWorldTransform(formB);
        var formInverseA = helper.inverseTransform(formA);
        var formInverseB = helper.inverseTransform(formB);
        var formA2 = helper.multiplyTransforms(formInverseA, form);
        var formB2 = helper.multiplyTransforms(formInverseB, form);
        var constraint = new Ammo.btGeneric6DofSpringConstraint(bodyA.body, bodyB.body, formA2, formB2, true);
        var lll = helper.allocVector3();
        var lul = helper.allocVector3();
        var all = helper.allocVector3();
        var aul = helper.allocVector3();
        lll.setValue(params.translationLimitation1[0], params.translationLimitation1[1], params.translationLimitation1[2]);
        lul.setValue(params.translationLimitation2[0], params.translationLimitation2[1], params.translationLimitation2[2]);
        all.setValue(params.rotationLimitation1[0], params.rotationLimitation1[1], params.rotationLimitation1[2]);
        aul.setValue(params.rotationLimitation2[0], params.rotationLimitation2[1], params.rotationLimitation2[2]);
        constraint.setLinearLowerLimit(lll);
        constraint.setLinearUpperLimit(lul);
        constraint.setAngularLowerLimit(all);
        constraint.setAngularUpperLimit(aul);
        for (var i = 0; i < 3; i++) {
            if (params.springPosition[i] !== 0) {
                constraint.enableSpring(i, true);
                constraint.setStiffness(i, params.springPosition[i]);
            }
        }
        for (var i = 0; i < 3; i++) {
            if (params.springRotation[i] !== 0) {
                constraint.enableSpring(i + 3, true);
                constraint.setStiffness(i + 3, params.springRotation[i]);
            }
        }
        /*
         * Currently(10/31/2016) official ammo.js doesn't support
         * btGeneric6DofSpringConstraint.setParam method.
         * You need custom ammo.js (add the method into idl) if you wanna use.
         * By setting this parameter, physics will be more like MMD's
         */
        if (constraint.setParam !== undefined) {
            for (var i = 0; i < 6; i++) {
                // this parameter is from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
                constraint.setParam(2, 0.475, i);
            }
        }
        this.world.addConstraint(constraint, true);
        this.constraint = constraint;
        helper.freeTransform(form);
        helper.freeTransform(formA);
        helper.freeTransform(formB);
        helper.freeTransform(formInverseA);
        helper.freeTransform(formInverseB);
        helper.freeTransform(formA2);
        helper.freeTransform(formB2);
        helper.freeVector3(lll);
        helper.freeVector3(lul);
        helper.freeVector3(all);
        helper.freeVector3(aul);
    }
}
exports.default = Constraint;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
const Ammo = __webpack_require__(4);
/**
 * This helper class responsibilies are
 *
 * 1. manage Ammo.js and Three.js object resources and
 *    improve the performance and the memory consumption by
 *    reusing objects.
 *
 * 2. provide simple Ammo object operations.
 */
class ResourceHelper {
    constructor() {
        // for Three.js
        this.threeVector3s = [];
        this.threeMatrix4s = [];
        this.threeQuaternions = [];
        this.threeEulers = [];
        // for Ammo.js
        this.transforms = [];
        this.quaternions = [];
        this.vector3s = [];
    }
    allocThreeVector3() {
        return (this.threeVector3s.length > 0) ? this.threeVector3s.pop() : new three_1.default.Vector3();
    }
    freeThreeVector3(v) {
        this.threeVector3s.push(v);
    }
    allocThreeMatrix4() {
        return (this.threeMatrix4s.length > 0) ? this.threeMatrix4s.pop() : new three_1.default.Matrix4();
    }
    freeThreeMatrix4(m) {
        this.threeMatrix4s.push(m);
    }
    allocThreeQuaternion() {
        return (this.threeQuaternions.length > 0) ? this.threeQuaternions.pop() : new three_1.default.Quaternion();
    }
    freeThreeQuaternion(q) {
        this.threeQuaternions.push(q);
    }
    allocThreeEuler() {
        return (this.threeEulers.length > 0) ? this.threeEulers.pop() : new three_1.default.Euler();
    }
    freeThreeEuler(e) {
        this.threeEulers.push(e);
    }
    allocTransform() {
        return (this.transforms.length > 0) ? this.transforms.pop() : new Ammo.btTransform();
    }
    freeTransform(t) {
        this.transforms.push(t);
    }
    allocQuaternion() {
        return (this.quaternions.length > 0) ? this.quaternions.pop() : new Ammo.btQuaternion();
    }
    freeQuaternion(q) {
        this.quaternions.push(q);
    }
    allocVector3() {
        return (this.vector3s.length > 0) ? this.vector3s.pop() : new Ammo.btVector3();
    }
    freeVector3(v) {
        this.vector3s.push(v);
    }
    setIdentity(t) {
        t.setIdentity();
    }
    getBasis(t) {
        var q = this.allocQuaternion();
        t.getBasis().getRotation(q);
        return q;
    }
    getBasisAsMatrix3(t) {
        var q = this.getBasis(t);
        var m = this.quaternionToMatrix3(q);
        this.freeQuaternion(q);
        return m;
    }
    getOrigin(t) {
        return t.getOrigin();
    }
    setOrigin(t, v) {
        t.getOrigin().setValue(v.x(), v.y(), v.z());
    }
    copyOrigin(t1, t2) {
        var o = t2.getOrigin();
        this.setOrigin(t1, o);
    }
    setBasis(t, q) {
        t.setRotation(q);
    }
    setBasisFromMatrix3(t, m) {
        var q = this.matrix3ToQuaternion(m);
        this.setBasis(t, q);
        this.freeQuaternion(q);
    }
    setOriginFromArray3(t, a) {
        t.getOrigin().setValue(a[0], a[1], a[2]);
    }
    setBasisFromArray3(t, a) {
        var thQ = this.allocThreeQuaternion();
        var thE = this.allocThreeEuler();
        thE.set(a[0], a[1], a[2]);
        this.setBasisFromArray4(t, thQ.setFromEuler(thE).toArray());
        this.freeThreeEuler(thE);
        this.freeThreeQuaternion(thQ);
    }
    setBasisFromArray4(t, a) {
        var q = this.array4ToQuaternion(a);
        this.setBasis(t, q);
        this.freeQuaternion(q);
    }
    array4ToQuaternion(a) {
        var q = this.allocQuaternion();
        q.setX(a[0]);
        q.setY(a[1]);
        q.setZ(a[2]);
        q.setW(a[3]);
        return q;
    }
    multiplyTransforms(t1, t2) {
        var t = this.allocTransform();
        this.setIdentity(t);
        var m1 = this.getBasisAsMatrix3(t1);
        var m2 = this.getBasisAsMatrix3(t2);
        var o1 = this.getOrigin(t1);
        var o2 = this.getOrigin(t2);
        var v1 = this.multiplyMatrix3ByVector3(m1, o2);
        var v2 = this.addVector3(v1, o1);
        this.setOrigin(t, v2);
        var m3 = this.multiplyMatrices3(m1, m2);
        this.setBasisFromMatrix3(t, m3);
        this.freeVector3(v1);
        this.freeVector3(v2);
        return t;
    }
    inverseTransform(t) {
        var t2 = this.allocTransform();
        var m1 = this.getBasisAsMatrix3(t);
        var o = this.getOrigin(t);
        var m2 = this.transposeMatrix3(m1);
        var v1 = this.negativeVector3(o);
        var v2 = this.multiplyMatrix3ByVector3(m2, v1);
        this.setOrigin(t2, v2);
        this.setBasisFromMatrix3(t2, m2);
        this.freeVector3(v1);
        this.freeVector3(v2);
        return t2;
    }
    multiplyMatrices3(m1, m2) {
        var m3 = [];
        var v10 = this.rowOfMatrix3(m1, 0);
        var v11 = this.rowOfMatrix3(m1, 1);
        var v12 = this.rowOfMatrix3(m1, 2);
        var v20 = this.columnOfMatrix3(m2, 0);
        var v21 = this.columnOfMatrix3(m2, 1);
        var v22 = this.columnOfMatrix3(m2, 2);
        m3[0] = this.dotVectors3(v10, v20);
        m3[1] = this.dotVectors3(v10, v21);
        m3[2] = this.dotVectors3(v10, v22);
        m3[3] = this.dotVectors3(v11, v20);
        m3[4] = this.dotVectors3(v11, v21);
        m3[5] = this.dotVectors3(v11, v22);
        m3[6] = this.dotVectors3(v12, v20);
        m3[7] = this.dotVectors3(v12, v21);
        m3[8] = this.dotVectors3(v12, v22);
        this.freeVector3(v10);
        this.freeVector3(v11);
        this.freeVector3(v12);
        this.freeVector3(v20);
        this.freeVector3(v21);
        this.freeVector3(v22);
        return m3;
    }
    addVector3(v1, v2) {
        var v = this.allocVector3();
        v.setValue(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z());
        return v;
    }
    dotVectors3(v1, v2) {
        return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();
    }
    rowOfMatrix3(m, i) {
        var v = this.allocVector3();
        v.setValue(m[i * 3 + 0], m[i * 3 + 1], m[i * 3 + 2]);
        return v;
    }
    columnOfMatrix3(m, i) {
        var v = this.allocVector3();
        v.setValue(m[i + 0], m[i + 3], m[i + 6]);
        return v;
    }
    negativeVector3(v) {
        var v2 = this.allocVector3();
        v2.setValue(-v.x(), -v.y(), -v.z());
        return v2;
    }
    multiplyMatrix3ByVector3(m, v) {
        var v4 = this.allocVector3();
        var v0 = this.rowOfMatrix3(m, 0);
        var v1 = this.rowOfMatrix3(m, 1);
        var v2 = this.rowOfMatrix3(m, 2);
        var x = this.dotVectors3(v0, v);
        var y = this.dotVectors3(v1, v);
        var z = this.dotVectors3(v2, v);
        v4.setValue(x, y, z);
        this.freeVector3(v0);
        this.freeVector3(v1);
        this.freeVector3(v2);
        return v4;
    }
    transposeMatrix3(m) {
        var m2 = [];
        m2[0] = m[0];
        m2[1] = m[3];
        m2[2] = m[6];
        m2[3] = m[1];
        m2[4] = m[4];
        m2[5] = m[7];
        m2[6] = m[2];
        m2[7] = m[5];
        m2[8] = m[8];
        return m2;
    }
    quaternionToMatrix3(q) {
        var m = [];
        var x = q.x();
        var y = q.y();
        var z = q.z();
        var w = q.w();
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var xy = x * y;
        var yz = y * z;
        var zx = z * x;
        var xw = x * w;
        var yw = y * w;
        var zw = z * w;
        m[0] = 1 - 2 * (yy + zz);
        m[1] = 2 * (xy - zw);
        m[2] = 2 * (zx + yw);
        m[3] = 2 * (xy + zw);
        m[4] = 1 - 2 * (zz + xx);
        m[5] = 2 * (yz - xw);
        m[6] = 2 * (zx - yw);
        m[7] = 2 * (yz + xw);
        m[8] = 1 - 2 * (xx + yy);
        return m;
    }
    matrix3ToQuaternion(m) {
        var t = m[0] + m[4] + m[8];
        var s, x, y, z, w;
        if (t > 0) {
            s = Math.sqrt(t + 1.0) * 2;
            w = 0.25 * s;
            x = (m[7] - m[5]) / s;
            y = (m[2] - m[6]) / s;
            z = (m[3] - m[1]) / s;
        }
        else if ((m[0] > m[4]) && (m[0] > m[8])) {
            s = Math.sqrt(1.0 + m[0] - m[4] - m[8]) * 2;
            w = (m[7] - m[5]) / s;
            x = 0.25 * s;
            y = (m[1] + m[3]) / s;
            z = (m[2] + m[6]) / s;
        }
        else if (m[4] > m[8]) {
            s = Math.sqrt(1.0 + m[4] - m[0] - m[8]) * 2;
            w = (m[2] - m[6]) / s;
            x = (m[1] + m[3]) / s;
            y = 0.25 * s;
            z = (m[5] + m[7]) / s;
        }
        else {
            s = Math.sqrt(1.0 + m[8] - m[0] - m[4]) * 2;
            w = (m[3] - m[1]) / s;
            x = (m[2] + m[6]) / s;
            y = (m[5] + m[7]) / s;
            z = 0.25 * s;
        }
        var q = this.allocQuaternion();
        q.setX(x);
        q.setY(y);
        q.setZ(z);
        q.setW(w);
        return q;
    }
}
exports.default = ResourceHelper;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Ammo = __webpack_require__(4);
class RigidBody {
    constructor(mesh, world, params, helper) {
        this.mesh = mesh;
        this.world = world;
        this.params = params;
        this.helper = helper;
        this.body = null;
        this.bone = null;
        this.boneOffsetForm = null;
        this.boneOffsetFormInverse = null;
        this.init();
    }
    init() {
        function generateShape(p) {
            switch (p.shapeType) {
                case 0:
                    return new Ammo.btSphereShape(p.width);
                case 1:
                    return new Ammo.btBoxShape(new Ammo.btVector3(p.width, p.height, p.depth));
                case 2:
                    return new Ammo.btCapsuleShape(p.width, p.height);
                default:
                    throw 'unknown shape type ' + p.shapeType;
            }
        }
        var helper = this.helper;
        var params = this.params;
        var bones = this.mesh.skeleton.bones;
        var bone = (params.boneIndex === -1) ? new THREE.Bone() : bones[params.boneIndex];
        var shape = generateShape(params);
        var weight = (params.type === 0) ? 0 : params.weight;
        var localInertia = helper.allocVector3();
        localInertia.setValue(0, 0, 0);
        if (weight !== 0) {
            shape.calculateLocalInertia(weight, localInertia);
        }
        var boneOffsetForm = helper.allocTransform();
        helper.setIdentity(boneOffsetForm);
        helper.setOriginFromArray3(boneOffsetForm, params.position);
        helper.setBasisFromArray3(boneOffsetForm, params.rotation);
        var boneForm = helper.allocTransform();
        helper.setIdentity(boneForm);
        helper.setOriginFromArray3(boneForm, bone.getWorldPosition().toArray());
        var form = helper.multiplyTransforms(boneForm, boneOffsetForm);
        var state = new Ammo.btDefaultMotionState(form);
        var info = new Ammo.btRigidBodyConstructionInfo(weight, state, shape, localInertia);
        info.set_m_friction(params.friction);
        info.set_m_restitution(params.restitution);
        var body = new Ammo.btRigidBody(info);
        if (params.type === 0) {
            body.setCollisionFlags(body.getCollisionFlags() | 2);
            /*
             * It'd be better to comment out this line though in general I should call this method
             * because I'm not sure why but physics will be more like MMD's
             * if I comment out.
             */
            body.setActivationState(4);
        }
        body.setDamping(params.positionDamping, params.rotationDamping);
        body.setSleepingThresholds(0, 0);
        this.world.addRigidBody(body, 1 << params.groupIndex, params.groupTarget);
        this.body = body;
        this.bone = bone;
        this.boneOffsetForm = boneOffsetForm;
        this.boneOffsetFormInverse = helper.inverseTransform(boneOffsetForm);
        helper.freeVector3(localInertia);
        helper.freeTransform(form);
        helper.freeTransform(boneForm);
    }
    reset() {
        this.setTransformFromBone();
    }
    updateFromBone() {
        if (this.params.boneIndex === -1) {
            return;
        }
        if (this.params.type === 0) {
            this.setTransformFromBone();
        }
    }
    updateBone() {
        if (this.params.type === 0 || this.params.boneIndex === -1) {
            return;
        }
        this.updateBoneRotation();
        if (this.params.type === 1) {
            this.updateBonePosition();
        }
        this.bone.updateMatrixWorld(true);
        if (this.params.type === 2) {
            this.setPositionFromBone();
        }
    }
    getBoneTransform() {
        var helper = this.helper;
        var p = this.bone.getWorldPosition();
        var q = this.bone.getWorldQuaternion();
        var tr = helper.allocTransform();
        helper.setOriginFromArray3(tr, p.toArray());
        helper.setBasisFromArray4(tr, q.toArray());
        var form = helper.multiplyTransforms(tr, this.boneOffsetForm);
        helper.freeTransform(tr);
        return form;
    }
    getWorldTransformForBone() {
        var helper = this.helper;
        var tr = helper.allocTransform();
        this.body.getMotionState().getWorldTransform(tr);
        var tr2 = helper.multiplyTransforms(tr, this.boneOffsetFormInverse);
        helper.freeTransform(tr);
        return tr2;
    }
    setTransformFromBone() {
        var helper = this.helper;
        var form = this.getBoneTransform();
        // TODO: check the most appropriate way to set
        //this.body.setWorldTransform( form );
        this.body.setCenterOfMassTransform(form);
        this.body.getMotionState().setWorldTransform(form);
        helper.freeTransform(form);
    }
    setPositionFromBone() {
        var helper = this.helper;
        var form = this.getBoneTransform();
        var tr = helper.allocTransform();
        this.body.getMotionState().getWorldTransform(tr);
        helper.copyOrigin(tr, form);
        // TODO: check the most appropriate way to set
        //this.body.setWorldTransform( tr );
        this.body.setCenterOfMassTransform(tr);
        this.body.getMotionState().setWorldTransform(tr);
        helper.freeTransform(tr);
        helper.freeTransform(form);
    }
    updateBoneRotation() {
        this.bone.updateMatrixWorld(true);
        var helper = this.helper;
        var tr = this.getWorldTransformForBone();
        var q = helper.getBasis(tr);
        var thQ = helper.allocThreeQuaternion();
        var thQ2 = helper.allocThreeQuaternion();
        var thQ3 = helper.allocThreeQuaternion();
        thQ.set(q.x(), q.y(), q.z(), q.w());
        thQ2.setFromRotationMatrix(this.bone.matrixWorld);
        thQ2.conjugate();
        thQ2.multiply(thQ);
        //this.bone.quaternion.multiply( thQ2 );
        thQ3.setFromRotationMatrix(this.bone.matrix);
        this.bone.quaternion.copy(thQ2.multiply(thQ3));
        helper.freeThreeQuaternion(thQ);
        helper.freeThreeQuaternion(thQ2);
        helper.freeThreeQuaternion(thQ3);
        helper.freeQuaternion(q);
        helper.freeTransform(tr);
    }
    updateBonePosition() {
        var helper = this.helper;
        var tr = this.getWorldTransformForBone();
        var thV = helper.allocThreeVector3();
        var o = helper.getOrigin(tr);
        thV.set(o.x(), o.y(), o.z());
        var v = this.bone.worldToLocal(thV);
        this.bone.position.add(v);
        helper.freeThreeVector3(thV);
        helper.freeTransform(tr);
    }
}
exports.default = RigidBody;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require('three');

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
class CCDIKHelper extends three_1.default.Object3D {
    constructor(mesh) {
        super();
        if (mesh.geometry.iks === undefined || mesh.skeleton === undefined) {
            throw 'THREE.CCDIKHelper requires iks in mesh.geometry and skeleton in mesh.';
        }
        three_1.default.Object3D.call(this);
        this.root = mesh;
        this.matrix = mesh.matrixWorld;
        this.matrixAutoUpdate = false;
        this.sphereGeometry = new three_1.default.SphereBufferGeometry(0.25, 16, 8);
        this.targetSphereMaterial = new three_1.default.MeshBasicMaterial({
            color: new three_1.default.Color(0xff8888),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this.effectorSphereMaterial = new three_1.default.MeshBasicMaterial({
            color: new three_1.default.Color(0x88ff88),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this.linkSphereMaterial = new three_1.default.MeshBasicMaterial({
            color: new three_1.default.Color(0x8888ff),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this.lineMaterial = new three_1.default.LineBasicMaterial({
            color: new three_1.default.Color(0xff0000),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this._init();
        this.update();
    }
    _init() {
        var self = this;
        var mesh = this.root;
        var iks = mesh.geometry.iks;
        function createLineGeometry(ik) {
            var geometry = new three_1.default.BufferGeometry();
            var vertices = new Float32Array((2 + ik.links.length) * 3);
            geometry.addAttribute('position', new three_1.default.BufferAttribute(vertices, 3));
            return geometry;
        }
        function createTargetMesh() {
            return new three_1.default.Mesh(self.sphereGeometry, self.targetSphereMaterial);
        }
        function createEffectorMesh() {
            return new three_1.default.Mesh(self.sphereGeometry, self.effectorSphereMaterial);
        }
        function createLinkMesh() {
            return new three_1.default.Mesh(self.sphereGeometry, self.linkSphereMaterial);
        }
        function createLine(ik) {
            return new three_1.default.Line(createLineGeometry(ik), self.lineMaterial);
        }
        for (var i = 0, il = iks.length; i < il; i++) {
            var ik = iks[i];
            this.add(createTargetMesh());
            this.add(createEffectorMesh());
            for (var j = 0, jl = ik.links.length; j < jl; j++) {
                this.add(createLinkMesh());
            }
            this.add(createLine(ik));
        }
    }
    update() {
        var offset = 0;
        var mesh = this.root;
        var iks = mesh.geometry.iks;
        var bones = mesh.skeleton.bones;
        var matrixWorldInv = new three_1.default.Matrix4().getInverse(mesh.matrixWorld);
        var vector = new three_1.default.Vector3();
        function getPosition(bone) {
            vector.setFromMatrixPosition(bone.matrixWorld);
            vector.applyMatrix4(matrixWorldInv);
            return vector;
        }
        function setPositionOfBoneToAttributeArray(array, index, bone) {
            var v = getPosition(bone);
            array[index * 3 + 0] = v.x;
            array[index * 3 + 1] = v.y;
            array[index * 3 + 2] = v.z;
        }
        for (var i = 0, il = iks.length; i < il; i++) {
            var ik = iks[i];
            var targetBone = bones[ik.target];
            var effectorBone = bones[ik.effector];
            var targetMesh = this.children[offset++];
            var effectorMesh = this.children[offset++];
            targetMesh.position.copy(getPosition(targetBone));
            effectorMesh.position.copy(getPosition(effectorBone));
            for (var j = 0, jl = ik.links.length; j < jl; j++) {
                var link = ik.links[j];
                var linkBone = bones[link.index];
                var linkMesh = this.children[offset++];
                linkMesh.position.copy(getPosition(linkBone));
            }
            var line = this.children[offset++];
            var array = line.geometry.attributes.position.array;
            setPositionOfBoneToAttributeArray(array, 0, targetBone);
            setPositionOfBoneToAttributeArray(array, 1, effectorBone);
            for (var j = 0, jl = ik.links.length; j < jl; j++) {
                var link = ik.links[j];
                var linkBone = bones[link.index];
                setPositionOfBoneToAttributeArray(array, j + 2, linkBone);
            }
            line.geometry.attributes.position.needsUpdate = true;
        }
    }
}
exports.default = CCDIKHelper;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
/**
 * @author takahiro / https://github.com/takahirox
 *
 * CCD Algorithm
 *  https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * mesh.geometry needs to have iks array.
 *
 * // ik parameter example
 * //
 * // target, effector, index in links are bone index in skeleton.
 * // the bones relation should be
 * // <-- parent                                  child -->
 * // links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
 * ik = {
 *    target: 1,
 *    effector: 2,
 *    links: [ { index: 5, limitation: new THREE.Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
 *    iteration: 10,
 *    minAngle: 0.0,
 *    maxAngle: 1.0,
 * };
 */
class CCDIKSolver {
    constructor(mesh) {
        this.mesh = mesh;
        this._valid();
    }
    _valid() {
        var iks = this.mesh.geometry.iks;
        var bones = this.mesh.skeleton.bones;
        for (var i = 0, il = iks.length; i < il; i++) {
            var ik = iks[i];
            var effector = bones[ik.effector];
            var links = ik.links;
            var link0, link1;
            link0 = effector;
            for (var j = 0, jl = links.length; j < jl; j++) {
                link1 = bones[links[j].index];
                if (link0.parent !== link1) {
                    console.warn('THREE.CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name);
                }
                link0 = link1;
            }
        }
    }
    /**
     * save the bone matrices before solving IK.
     * they're used for generating VMD and VPD.
     */
    _saveOriginalBonesInfo() {
        var bones = this.mesh.skeleton.bones;
        for (var i = 0, il = bones.length; i < il; i++) {
            var bone = bones[i];
            if (bone.userData.ik === undefined)
                bone.userData.ik = {};
            bone.userData.ik.originalMatrix = bone.matrix.toArray();
        }
    }
    update(saveOriginalBones) {
        var q = new three_1.default.Quaternion();
        var targetPos = new three_1.default.Vector3();
        var targetVec = new three_1.default.Vector3();
        var effectorPos = new three_1.default.Vector3();
        var effectorVec = new three_1.default.Vector3();
        var linkPos = new three_1.default.Vector3();
        var invLinkQ = new three_1.default.Quaternion();
        var linkScale = new three_1.default.Vector3();
        var axis = new three_1.default.Vector3();
        var bones = this.mesh.skeleton.bones;
        var iks = this.mesh.geometry.iks;
        var boneParams = this.mesh.geometry.bones;
        // for reference overhead reduction in loop
        var math = Math;
        this.mesh.updateMatrixWorld(true);
        if (saveOriginalBones === true)
            this._saveOriginalBonesInfo();
        for (var i = 0, il = iks.length; i < il; i++) {
            var ik = iks[i];
            var effector = bones[ik.effector];
            var target = bones[ik.target];
            // don't use getWorldPosition() here for the performance
            // because it calls updateMatrixWorld( true ) inside.
            targetPos.setFromMatrixPosition(target.matrixWorld);
            var links = ik.links;
            var iteration = ik.iteration !== undefined ? ik.iteration : 1;
            for (var j = 0; j < iteration; j++) {
                var rotated = false;
                for (var k = 0, kl = links.length; k < kl; k++) {
                    var link = bones[links[k].index];
                    // skip this link and following links.
                    // this skip is used for MMD performance optimization.
                    if (links[k].enabled === false)
                        break;
                    var limitation = links[k].limitation;
                    // don't use getWorldPosition/Quaternion() here for the performance
                    // because they call updateMatrixWorld( true ) inside.
                    link.matrixWorld.decompose(linkPos, invLinkQ, linkScale);
                    invLinkQ.inverse();
                    effectorPos.setFromMatrixPosition(effector.matrixWorld);
                    // work in link world
                    effectorVec.subVectors(effectorPos, linkPos);
                    effectorVec.applyQuaternion(invLinkQ);
                    effectorVec.normalize();
                    targetVec.subVectors(targetPos, linkPos);
                    targetVec.applyQuaternion(invLinkQ);
                    targetVec.normalize();
                    var angle = targetVec.dot(effectorVec);
                    if (angle > 1.0) {
                        angle = 1.0;
                    }
                    else if (angle < -1.0) {
                        angle = -1.0;
                    }
                    angle = math.acos(angle);
                    // skip if changing angle is too small to prevent vibration of bone
                    // Refer to http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
                    if (angle < 1e-5)
                        continue;
                    if (ik.minAngle !== undefined && angle < ik.minAngle) {
                        angle = ik.minAngle;
                    }
                    if (ik.maxAngle !== undefined && angle > ik.maxAngle) {
                        angle = ik.maxAngle;
                    }
                    axis.crossVectors(effectorVec, targetVec);
                    axis.normalize();
                    q.setFromAxisAngle(axis, angle);
                    link.quaternion.multiply(q);
                    // TODO: re-consider the limitation specification
                    if (limitation !== undefined) {
                        var c = link.quaternion.w;
                        if (c > 1.0) {
                            c = 1.0;
                        }
                        var c2 = math.sqrt(1 - c * c);
                        link.quaternion.set(limitation.x * c2, limitation.y * c2, limitation.z * c2, c);
                    }
                    link.updateMatrixWorld(true);
                    rotated = true;
                }
                if (!rotated)
                    break;
            }
        }
        // just in case
        this.mesh.updateMatrixWorld(true);
    }
}
exports.default = CCDIKSolver;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - Ammo.js https://github.com/kripken/ammo.js
 *
 * MMD specific Physics class.
 *
 * See THREE.MMDLoader for the passed parameter list of RigidBody/Constraint.
 *
 * Requirement:
 *  - don't change object's scale from (1,1,1) after setting physics to object
 *
 * TODO
 *  - optimize for the performance
 *  - use Physijs http://chandlerprall.github.io/Physijs/
 *    and improve the performance by making use of Web worker.
 *  - if possible, make this class being non-MMD specific.
 *  - object scale change support
 */

Object.defineProperty(exports, "__esModule", { value: true });
const Ammo = __webpack_require__(4);
const RigidBody_1 = __webpack_require__(15);
exports.RigidBody = RigidBody_1.default;
const Constraint_1 = __webpack_require__(13);
exports.Constraint = Constraint_1.default;
const ResourceHelper_1 = __webpack_require__(14);
exports.ResourceHelper = ResourceHelper_1.default;
class MMDPhysics {
    constructor(mesh, params = {}) {
        this.mesh = mesh;
        this.helper = new ResourceHelper_1.default();
        /*
         * I don't know why but 1/60 unitStep easily breaks models
         * so I set it 1/65 so far.
         * Don't set too small unitStep because
         * the smaller unitStep can make the performance worse.
         */
        this.unitStep = (params.unitStep !== undefined) ? params.unitStep : 1 / 65;
        this.maxStepNum = (params.maxStepNum !== undefined) ? params.maxStepNum : 3;
        this.world = params.world !== undefined ? params.world : null;
        this.bodies = [];
        this.constraints = [];
        this.init(mesh);
    }
    init(mesh) {
        const parent = mesh.parent;
        if (parent !== null) {
            parent.remove(mesh);
        }
        const currentPosition = mesh.position.clone();
        const currentRotation = mesh.rotation.clone();
        const currentScale = mesh.scale.clone();
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
        mesh.updateMatrixWorld(true);
        if (this.world === null)
            this.initWorld();
        this.initRigidBodies();
        this.initConstraints();
        if (parent !== null) {
            parent.add(mesh);
        }
        mesh.position.copy(currentPosition);
        mesh.rotation.copy(currentRotation);
        mesh.scale.copy(currentScale);
        mesh.updateMatrixWorld(true);
        this.reset();
    }
    initWorld() {
        var config = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(config);
        var cache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        var world = new Ammo.btDiscreteDynamicsWorld(dispatcher, cache, solver, config);
        world.setGravity(new Ammo.btVector3(0, -9.8 * 10, 0));
        this.world = world;
    }
    initRigidBodies() {
        var bodies = this.mesh.geometry.rigidBodies;
        for (var i = 0; i < bodies.length; i++) {
            var b = new RigidBody_1.default(this.mesh, this.world, bodies[i], this.helper);
            this.bodies.push(b);
        }
    }
    initConstraints() {
        var constraints = this.mesh.geometry.constraints;
        for (var i = 0; i < constraints.length; i++) {
            var params = constraints[i];
            var bodyA = this.bodies[params.rigidBodyIndex1];
            var bodyB = this.bodies[params.rigidBodyIndex2];
            var c = new Constraint_1.default(this.mesh, this.world, bodyA, bodyB, params, this.helper);
            this.constraints.push(c);
        }
    }
    update(delta) {
        this.updateRigidBodies();
        this.stepSimulation(delta);
        this.updateBones();
    }
    stepSimulation(delta) {
        var unitStep = this.unitStep;
        var stepTime = delta;
        var maxStepNum = ((delta / unitStep) | 0) + 1;
        if (stepTime < unitStep) {
            stepTime = unitStep;
            maxStepNum = 1;
        }
        if (maxStepNum > this.maxStepNum) {
            maxStepNum = this.maxStepNum;
        }
        this.world.stepSimulation(stepTime, maxStepNum, unitStep);
    }
    updateRigidBodies() {
        for (var i = 0; i < this.bodies.length; i++) {
            this.bodies[i].updateFromBone();
        }
    }
    updateBones() {
        for (var i = 0; i < this.bodies.length; i++) {
            this.bodies[i].updateBone();
        }
    }
    reset() {
        for (var i = 0; i < this.bodies.length; i++) {
            this.bodies[i].reset();
        }
    }
    warmup(cycles) {
        for (var i = 0; i < cycles; i++) {
            this.update(1 / 60);
        }
    }
}
exports.default = MMDPhysics;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(0);
class MMDPhysicsHelper extends three_1.default.Object3D {
    constructor(mesh) {
        super();
        if (mesh.physics === undefined || mesh.geometry.rigidBodies === undefined) {
            throw 'THREE.MMDPhysicsHelper requires physics in mesh and rigidBodies in mesh.geometry.';
        }
        this.root = mesh;
        this.matrix = mesh.matrixWorld;
        this.matrixAutoUpdate = false;
        this.materials = [];
        this.materials.push(new three_1.default.MeshBasicMaterial({
            color: new three_1.default.Color(0xff8888),
            wireframe: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.25,
            transparent: true
        }));
        this.materials.push(new three_1.default.MeshBasicMaterial({
            color: new three_1.default.Color(0x88ff88),
            wireframe: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.25,
            transparent: true
        }));
        this.materials.push(new three_1.default.MeshBasicMaterial({
            color: new three_1.default.Color(0x8888ff),
            wireframe: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.25,
            transparent: true
        }));
        this._init();
        this.update();
    }
    _init() {
        var mesh = this.root;
        var rigidBodies = mesh.geometry.rigidBodies;
        for (var i = 0, il = rigidBodies.length; i < il; i++) {
            var param = rigidBodies[i];
            this.add(new three_1.default.Mesh(this._createGeometry(param), this.materials[param.type]));
        }
    }
    _createGeometry(param) {
        switch (param.shapeType) {
            case 0:
                return new three_1.default.SphereBufferGeometry(param.width, 16, 8);
            case 1:
                return new three_1.default.BoxBufferGeometry(param.width * 2, param.height * 2, param.depth * 2, 8, 8, 8);
            case 2:
                return this._createCapsuleGeometry(param.width, param.height, 16, 8);
            default:
                return null;
        }
    }
    // copy from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mytest37.js?ver=20160815
    _createCapsuleGeometry(radius, cylinderHeight, segmentsRadius, segmentsHeight) {
        var geometry = new three_1.default.CylinderBufferGeometry(radius, radius, cylinderHeight, segmentsRadius, segmentsHeight, true);
        var upperSphere = new three_1.default.Mesh(new three_1.default.SphereBufferGeometry(radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, 0, Math.PI / 2));
        var lowerSphere = new three_1.default.Mesh(new three_1.default.SphereBufferGeometry(radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));
        upperSphere.position.set(0, cylinderHeight / 2, 0);
        lowerSphere.position.set(0, -cylinderHeight / 2, 0);
        upperSphere.updateMatrix();
        lowerSphere.updateMatrix();
        geometry.merge(upperSphere.geometry, upperSphere.matrix);
        geometry.merge(lowerSphere.geometry, lowerSphere.matrix);
        return geometry;
    }
    update() {
        var mesh = this.root;
        var rigidBodies = mesh.geometry.rigidBodies;
        var bodies = mesh.physics.bodies;
        var matrixWorldInv = new three_1.default.Matrix4().getInverse(mesh.matrixWorld);
        var vector = new three_1.default.Vector3();
        var quaternion = new three_1.default.Quaternion();
        var quaternion2 = new three_1.default.Quaternion();
        function getPosition(origin) {
            vector.set(origin.x(), origin.y(), origin.z());
            vector.applyMatrix4(matrixWorldInv);
            return vector;
        }
        function getQuaternion(rotation) {
            quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
            quaternion2.setFromRotationMatrix(matrixWorldInv);
            quaternion2.multiply(quaternion);
            return quaternion2;
        }
        for (var i = 0, il = rigidBodies.length; i < il; i++) {
            var body = bodies[i].body;
            var mesh = this.children[i];
            var tr = body.getCenterOfMassTransform();
            mesh.position.copy(getPosition(tr.getOrigin()));
            mesh.quaternion.copy(getQuaternion(tr.getRotation()));
        }
    }
}
exports.default = MMDPhysicsHelper;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 * @author mrdoob / http://mrdoob.com/
 * @author takahirox / https://github.com/takahirox/
 */
const THREE = __webpack_require__(16);
class TGALoader {
    constructor(manager) {
        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    }
    load(url, onLoad, onProgress, onError) {
        var texture = new THREE.Texture();
        var loader = new THREE.FileLoader(this.manager);
        loader.setResponseType('arraybuffer');
        loader.load(url, (buffer) => {
            texture.image = this.parse(buffer);
            texture.needsUpdate = true;
            if (onLoad !== undefined) {
                onLoad(texture);
            }
        }, onProgress, onError);
        return texture;
    }
    parse(buffer) {
        // reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js
        function tgaCheckHeader(header) {
            switch (header.image_type) {
                // check indexed type
                case TGA_TYPE_INDEXED:
                case TGA_TYPE_RLE_INDEXED:
                    if (header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1) {
                        console.error('TGALoader: Invalid type colormap data for indexed type.');
                    }
                    break;
                // check colormap type
                case TGA_TYPE_RGB:
                case TGA_TYPE_GREY:
                case TGA_TYPE_RLE_RGB:
                case TGA_TYPE_RLE_GREY:
                    if (header.colormap_type) {
                        console.error('TGALoader: Invalid type colormap data for colormap type.');
                    }
                    break;
                // What the need of a file without data ?
                case TGA_TYPE_NO_DATA:
                    console.error('TGALoader: No data.');
                // Invalid type ?
                default:
                    console.error('TGALoader: Invalid type "%s".', header.image_type);
            }
            // check image width and height
            if (header.width <= 0 || header.height <= 0) {
                console.error('TGALoader: Invalid image size.');
            }
            // check image pixel size
            if (header.pixel_size !== 8 && header.pixel_size !== 16 &&
                header.pixel_size !== 24 && header.pixel_size !== 32) {
                console.error('TGALoader: Invalid pixel size "%s".', header.pixel_size);
            }
        }
        // parse tga image buffer
        function tgaParse(use_rle, use_pal, header, offset, data) {
            var pixel_data, pixel_size, pixel_total, palettes;
            pixel_size = header.pixel_size >> 3;
            pixel_total = header.width * header.height * pixel_size;
            // read palettes
            if (use_pal) {
                palettes = data.subarray(offset, offset += header.colormap_length * (header.colormap_size >> 3));
            }
            // read RLE
            if (use_rle) {
                pixel_data = new Uint8Array(pixel_total);
                var c, count, i;
                var shift = 0;
                var pixels = new Uint8Array(pixel_size);
                while (shift < pixel_total) {
                    c = data[offset++];
                    count = (c & 0x7f) + 1;
                    // RLE pixels
                    if (c & 0x80) {
                        // bind pixel tmp array
                        for (i = 0; i < pixel_size; ++i) {
                            pixels[i] = data[offset++];
                        }
                        // copy pixel array
                        for (i = 0; i < count; ++i) {
                            pixel_data.set(pixels, shift + i * pixel_size);
                        }
                        shift += pixel_size * count;
                    }
                    else {
                        // raw pixels
                        count *= pixel_size;
                        for (i = 0; i < count; ++i) {
                            pixel_data[shift + i] = data[offset++];
                        }
                        shift += count;
                    }
                }
            }
            else {
                // raw pixels
                pixel_data = data.subarray(offset, offset += (use_pal ? header.width * header.height : pixel_total));
            }
            return {
                pixel_data: pixel_data,
                palettes: palettes
            };
        }
        function tgaGetImageData8bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes) {
            var colormap = palettes;
            var color, i = 0, x, y;
            var width = header.width;
            for (y = y_start; y !== y_end; y += y_step) {
                for (x = x_start; x !== x_end; x += x_step, i++) {
                    color = image[i];
                    imageData[(x + width * y) * 4 + 3] = 255;
                    imageData[(x + width * y) * 4 + 2] = colormap[(color * 3) + 0];
                    imageData[(x + width * y) * 4 + 1] = colormap[(color * 3) + 1];
                    imageData[(x + width * y) * 4 + 0] = colormap[(color * 3) + 2];
                }
            }
            return imageData;
        }
        function tgaGetImageData16bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {
            var color, i = 0, x, y;
            var width = header.width;
            for (y = y_start; y !== y_end; y += y_step) {
                for (x = x_start; x !== x_end; x += x_step, i += 2) {
                    color = image[i + 0] + (image[i + 1] << 8); // Inversed ?
                    imageData[(x + width * y) * 4 + 0] = (color & 0x7C00) >> 7;
                    imageData[(x + width * y) * 4 + 1] = (color & 0x03E0) >> 2;
                    imageData[(x + width * y) * 4 + 2] = (color & 0x001F) >> 3;
                    imageData[(x + width * y) * 4 + 3] = (color & 0x8000) ? 0 : 255;
                }
            }
            return imageData;
        }
        function tgaGetImageData24bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {
            var i = 0, x, y;
            var width = header.width;
            for (y = y_start; y !== y_end; y += y_step) {
                for (x = x_start; x !== x_end; x += x_step, i += 3) {
                    imageData[(x + width * y) * 4 + 3] = 255;
                    imageData[(x + width * y) * 4 + 2] = image[i + 0];
                    imageData[(x + width * y) * 4 + 1] = image[i + 1];
                    imageData[(x + width * y) * 4 + 0] = image[i + 2];
                }
            }
            return imageData;
        }
        function tgaGetImageData32bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {
            var i = 0, x, y;
            var width = header.width;
            for (y = y_start; y !== y_end; y += y_step) {
                for (x = x_start; x !== x_end; x += x_step, i += 4) {
                    imageData[(x + width * y) * 4 + 2] = image[i + 0];
                    imageData[(x + width * y) * 4 + 1] = image[i + 1];
                    imageData[(x + width * y) * 4 + 0] = image[i + 2];
                    imageData[(x + width * y) * 4 + 3] = image[i + 3];
                }
            }
            return imageData;
        }
        function tgaGetImageDataGrey8bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {
            var color, i = 0, x, y;
            var width = header.width;
            for (y = y_start; y !== y_end; y += y_step) {
                for (x = x_start; x !== x_end; x += x_step, i++) {
                    color = image[i];
                    imageData[(x + width * y) * 4 + 0] = color;
                    imageData[(x + width * y) * 4 + 1] = color;
                    imageData[(x + width * y) * 4 + 2] = color;
                    imageData[(x + width * y) * 4 + 3] = 255;
                }
            }
            return imageData;
        }
        function tgaGetImageDataGrey16bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {
            var i = 0, x, y;
            var width = header.width;
            for (y = y_start; y !== y_end; y += y_step) {
                for (x = x_start; x !== x_end; x += x_step, i += 2) {
                    imageData[(x + width * y) * 4 + 0] = image[i + 0];
                    imageData[(x + width * y) * 4 + 1] = image[i + 0];
                    imageData[(x + width * y) * 4 + 2] = image[i + 0];
                    imageData[(x + width * y) * 4 + 3] = image[i + 1];
                }
            }
            return imageData;
        }
        function getTgaRGBA(data, width, height, image, palette) {
            var x_start, y_start, x_step, y_step, x_end, y_end;
            switch ((header.flags & TGA_ORIGIN_MASK) >> TGA_ORIGIN_SHIFT) {
                default:
                case TGA_ORIGIN_UL:
                    x_start = 0;
                    x_step = 1;
                    x_end = width;
                    y_start = 0;
                    y_step = 1;
                    y_end = height;
                    break;
                case TGA_ORIGIN_BL:
                    x_start = 0;
                    x_step = 1;
                    x_end = width;
                    y_start = height - 1;
                    y_step = -1;
                    y_end = -1;
                    break;
                case TGA_ORIGIN_UR:
                    x_start = width - 1;
                    x_step = -1;
                    x_end = -1;
                    y_start = 0;
                    y_step = 1;
                    y_end = height;
                    break;
                case TGA_ORIGIN_BR:
                    x_start = width - 1;
                    x_step = -1;
                    x_end = -1;
                    y_start = height - 1;
                    y_step = -1;
                    y_end = -1;
                    break;
            }
            if (use_grey) {
                switch (header.pixel_size) {
                    case 8:
                        tgaGetImageDataGrey8bits(data, y_start, y_step, y_end, x_start, x_step, x_end, image);
                        break;
                    case 16:
                        tgaGetImageDataGrey16bits(data, y_start, y_step, y_end, x_start, x_step, x_end, image);
                        break;
                    default:
                        console.error('TGALoader: Format not supported.');
                        break;
                }
            }
            else {
                switch (header.pixel_size) {
                    case 8:
                        tgaGetImageData8bits(data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette);
                        break;
                    case 16:
                        tgaGetImageData16bits(data, y_start, y_step, y_end, x_start, x_step, x_end, image);
                        break;
                    case 24:
                        tgaGetImageData24bits(data, y_start, y_step, y_end, x_start, x_step, x_end, image);
                        break;
                    case 32:
                        tgaGetImageData32bits(data, y_start, y_step, y_end, x_start, x_step, x_end, image);
                        break;
                    default:
                        console.error('TGALoader: Format not supported.');
                        break;
                }
            }
            // Load image data according to specific method
            // var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
            // func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette);
            return data;
        }
        // TGA constants
        var TGA_TYPE_NO_DATA = 0, TGA_TYPE_INDEXED = 1, TGA_TYPE_RGB = 2, TGA_TYPE_GREY = 3, TGA_TYPE_RLE_INDEXED = 9, TGA_TYPE_RLE_RGB = 10, TGA_TYPE_RLE_GREY = 11, TGA_ORIGIN_MASK = 0x30, TGA_ORIGIN_SHIFT = 0x04, TGA_ORIGIN_BL = 0x00, TGA_ORIGIN_BR = 0x01, TGA_ORIGIN_UL = 0x02, TGA_ORIGIN_UR = 0x03;
        if (buffer.length < 19)
            console.error('TGALoader: Not enough data to contain header.');
        var content = new Uint8Array(buffer), offset = 0, header = {
            id_length: content[offset++],
            colormap_type: content[offset++],
            image_type: content[offset++],
            colormap_index: content[offset++] | content[offset++] << 8,
            colormap_length: content[offset++] | content[offset++] << 8,
            colormap_size: content[offset++],
            origin: [
                content[offset++] | content[offset++] << 8,
                content[offset++] | content[offset++] << 8
            ],
            width: content[offset++] | content[offset++] << 8,
            height: content[offset++] | content[offset++] << 8,
            pixel_size: content[offset++],
            flags: content[offset++]
        };
        // check tga if it is valid format
        tgaCheckHeader(header);
        if (header.id_length + offset > buffer.length) {
            console.error('TGALoader: No data.');
        }
        // skip the needn't data
        offset += header.id_length;
        // get targa information about RLE compression and palette
        var use_rle = false, use_pal = false, use_grey = false;
        switch (header.image_type) {
            case TGA_TYPE_RLE_INDEXED:
                use_rle = true;
                use_pal = true;
                break;
            case TGA_TYPE_INDEXED:
                use_pal = true;
                break;
            case TGA_TYPE_RLE_RGB:
                use_rle = true;
                break;
            case TGA_TYPE_RGB:
                break;
            case TGA_TYPE_RLE_GREY:
                use_rle = true;
                use_grey = true;
                break;
            case TGA_TYPE_GREY:
                use_grey = true;
                break;
        }
        //
        var canvas = document.createElement('canvas');
        canvas.width = header.width;
        canvas.height = header.height;
        var context = canvas.getContext('2d');
        var imageData = context.createImageData(header.width, header.height);
        var result = tgaParse(use_rle, use_pal, header, offset, content);
        var rgbaData = getTgaRGBA(imageData.data, header.width, header.height, result.pixel_data, result.palettes);
        context.putImageData(imageData, 0, 0);
        return canvas;
    }
}
exports.default = TGALoader;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const MMDLoader_1 = __webpack_require__(7);
const MMDAudioManager_1 = __webpack_require__(5);
const MMDGrantSolver_1 = __webpack_require__(2);
const MMDHelper_1 = __webpack_require__(6);
const MMDPhysics_1 = __webpack_require__(3);
var MMDLoader_2 = __webpack_require__(7);
exports.MMDLoader = MMDLoader_2.default;
var MMDAudioManager_2 = __webpack_require__(5);
exports.MMDAudioManager = MMDAudioManager_2.default;
var MMDGrantSolver_2 = __webpack_require__(2);
exports.MMDGrantSolver = MMDGrantSolver_2.default;
var MMDHelper_2 = __webpack_require__(6);
exports.MMDHelper = MMDHelper_2.default;
var DataCreationHelper_1 = __webpack_require__(9);
exports.DataCreationHelper = DataCreationHelper_1.default;
var VectorKeyframeTrackEx_1 = __webpack_require__(12);
exports.VectorKeyframeTrackEx = VectorKeyframeTrackEx_1.default;
var QuaternionKeyframeTrackEx_1 = __webpack_require__(11);
exports.QuaternionKeyframeTrackEx = QuaternionKeyframeTrackEx_1.default;
var NumberKeyframeTrackEx_1 = __webpack_require__(10);
exports.NumberKeyframeTrackEx = NumberKeyframeTrackEx_1.default;
var CubicBezierInterpolation_1 = __webpack_require__(1);
exports.CubicBezierInterpolation = CubicBezierInterpolation_1.default;
var MMDPhysics_2 = __webpack_require__(3);
exports.MMDPhysics = MMDPhysics_2.default;
var CCDIKSolver_1 = __webpack_require__(8);
exports.CCDIKSolver = CCDIKSolver_1.default;
exports.mixin = (THREE) => {
    THREE.MMDLoader = MMDLoader_1.default;
    THREE.MMDAudioManager = MMDAudioManager_1.default;
    THREE.MMDGrantSolver = MMDGrantSolver_1.default;
    THREE.MMDHelper = MMDHelper_1.default;
    THREE.MMDPhysics = MMDPhysics_1.default;
    THREE.CCDIKSolver = CCDIKSolver;
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require('mmd-parser');

/***/ })
/******/ ]);