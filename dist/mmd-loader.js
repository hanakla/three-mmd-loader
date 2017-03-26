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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require('three');

/***/ }),
/* 1 */
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const THREE = ((function () { return this; })().THREE || __webpack_require__(0));
class MMDGrantSolver {
    constructor(mesh) {
        this.update = (() => {
            var q = new THREE.Quaternion();
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
        if (!(mesh instanceof THREE.SkinnedMesh)) {
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
    setPhysics(mesh, params) {
        params = (params === undefined) ? {} : Object.assign({}, params);
        if (params.world === undefined && this.sharedPhysics) {
            var masterPhysics = this.getMasterPhysics();
            if (masterPhysics !== null)
                params.world = masterPhysics.world;
        }
        var warmup = params.warmup !== undefined ? params.warmup : 60;
        var physics = new THREE.MMDPhysics(mesh, params);
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
            mesh.mixer = new THREE.AnimationMixer(mesh);
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
                mesh.ikSolver = new THREE.CCDIKSolver(mesh);
                if (mesh.geometry.grants !== undefined) {
                    mesh.grantSolver = new MMDGrantSolver(mesh);
                }
            }
        }
    }
    setCameraAnimation(camera) {
        if (camera.animations !== undefined) {
            camera.mixer = new THREE.AnimationMixer(camera);
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
        var thV = new THREE.Vector3();
        var thQ = new THREE.Quaternion();
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
            var solver = new THREE.CCDIKSolver(mesh);
            solver.update(params.saveOriginalBonesBeforeIK);
        }
        if (params.preventGrant !== true && mesh.geometry.grants !== undefined) {
            var solver = new MMDGrantSolver(mesh);
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - [x] mmd-parser https://github.com/takahirox/mmd-parser
 *  - [ ] ammo.js https://github.com/kripken/ammo.js
 *  - [ ] THREE.TGALoader
 *  - [ ] THREE.MMDPhysics
 *  - [ ] THREE.CCDIKSolver
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
const MMDParser = __webpack_require__(11);
const DataCreationHelper_1 = __webpack_require__(6);
const VectorKeyframeTrackEx_1 = __webpack_require__(9);
const QuaternionKeyframeTrackEx_1 = __webpack_require__(8);
const NumberKeyframeTrackEx_1 = __webpack_require__(7);
const THREE = ((function () { return this; })().THREE || __webpack_require__(0));
const KeyframeTrackers = {
    VectorKeyframeTrackEx: VectorKeyframeTrackEx_1.default,
    QuaternionKeyframeTrackEx: QuaternionKeyframeTrackEx_1.default,
    NumberKeyframeTrackEx: NumberKeyframeTrackEx_1.default,
};
class MMDLoader extends THREE.Loader {
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
        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
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
            var listener = new THREE.AudioListener();
            var audio = new THREE.Audio(listener);
            var loader = new THREE.AudioLoader(this.manager);
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
            var quaternion = new THREE.Quaternion();
            var euler = new THREE.Euler();
            var position = new THREE.Vector3();
            var center = new THREE.Vector3();
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
            var clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name, -1, tracks);
            if (clip !== null) {
                if (camera.center === undefined)
                    camera.center = new THREE.Vector3(0, 0, 0);
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
            const loader = new THREE.FileLoader(this.manager);
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
        var geometry = new THREE.BufferGeometry();
        var material = new THREE.MultiMaterial();
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
                            link.limitation = new THREE.Vector3(1.0, 0.0, 0.0);
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
                var attribute = new THREE.Float32BufferAttribute(model.metadata.vertexCount * 3, 3);
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
            var textureLoader = new THREE.TextureLoader(scope.manager);
            var tgaLoader = new THREE.TGALoader(scope.manager);
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
                var loader = THREE.Loader.Handlers.get(fullPath);
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
                    t.wrapS = THREE.RepeatWrapping;
                    t.wrapT = THREE.RepeatWrapping;
                    if (params.sphericalReflectionMapping === true) {
                        t.mapping = THREE.SphericalReflectionMapping;
                    }
                    for (var i = 0; i < texture.readyCallbacks.length; i++) {
                        texture.readyCallbacks[i](texture);
                    }
                    delete texture.readyCallbacks;
                }, onProgress, onError);
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
                params.color = new THREE.Color(m.diffuse[0], m.diffuse[1], m.diffuse[2]);
                params.opacity = m.diffuse[3];
                params.specular = new THREE.Color(m.specular[0], m.specular[1], m.specular[2]);
                params.shininess = m.shininess;
                if (params.opacity === 1.0) {
                    params.side = THREE.FrontSide;
                    params.transparent = false;
                }
                else {
                    params.side = THREE.DoubleSide;
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
                                    params.envMapType = THREE.MultiplyOperation;
                                }
                                else {
                                    params.envMapType = THREE.AddOperation;
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
                            params.envMapType = THREE.MultiplyOperation;
                        }
                        else {
                            params.envMapType = THREE.AddOperation;
                        }
                    }
                }
                var coef = (params.map === undefined) ? 1.0 : 0.2;
                params.emissive = new THREE.Color(m.ambient[0] * coef, m.ambient[1] * coef, m.ambient[2] * coef);
                materialParams.push(params);
            }
            for (var i = 0; i < materialParams.length; i++) {
                var p = materialParams[i];
                var p2 = model.materials[i];
                var m = new THREE.MeshToonMaterial();
                geometry.addGroup(p.faceOffset * 3, p.faceNum * 3, i);
                if (p.name !== undefined)
                    m.name = p.name;
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
                        color: new THREE.Color(0.0, 0.0, 0.0),
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
                        color: new THREE.Color(p2.edgeColor[0], p2.edgeColor[1], p2.edgeColor[2]),
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
            var clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name, -1, tracks);
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
                tracks.push(new THREE.NumberKeyframeTrack('.morphTargetInfluences[' + i + ']', times, values, null));
            }
            var clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name + 'Morph', -1, tracks);
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const THREE = ((function () { return this; })().THREE || __webpack_require__(0));
class CubicBezierInterpolation extends THREE.Interpolant {
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
            THREE.Quaternion.slerpFlat(result, 0, values, offset0, values, offset1, ratio);
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
/* 6 */
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const THREE = ((function () { return this; })().THREE || __webpack_require__(0));
class NumberKeyframeTrackEx extends THREE.NumberKeyframeTrack {
    constructor(name, times, values, interpolationParameterArray) {
        super(name, times, values);
        this.TimeBufferType = Float64Array;
        this.interpolationParameters = new Float32Array(interpolationParameterArray);
    }
    InterpolantFactoryMethodCubicBezier(result) {
        return new THREE.MMDLoader.CubicBezierInterpolation(this.times, this.values, this.getValueSize(), result, this.interpolationParameters);
    }
    setInterpolation(interpolation) {
        this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;
    }
}
exports.default = NumberKeyframeTrackEx;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const THREE = ((function () { return this; })().THREE || __webpack_require__(0));
class QuaternionKeyframeTrackEx extends THREE.QuaternionKeyframeTrack {
    constructor(name, times, values, interpolationParameterArray) {
        super(name, times, values);
        this.TimeBufferType = Float64Array;
        this.interpolationParameters = new Float32Array(interpolationParameterArray);
    }
    InterpolantFactoryMethodCubicBezier(result) {
        return new THREE.MMDLoader.CubicBezierInterpolation(this.times, this.values, this.getValueSize(), result, this.interpolationParameters);
    }
    setInterpolation(interpolation) {
        this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;
    }
}
exports.default = QuaternionKeyframeTrackEx;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const THREE = ((function () { return this; })().THREE || __webpack_require__(0));
const CubicBezierInterpolation_1 = __webpack_require__(5);
/*
 * extends existing KeyframeTrack for bone and camera animation.
 *   - use Float64Array for times
 *   - use Cubic Bezier curves interpolation
 */
class VectorKeyframeTrackEx extends THREE.VectorKeyframeTrack {
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const MMDLoader_1 = __webpack_require__(4);
const MMDAudioManager_1 = __webpack_require__(1);
const MMDGrantSolver_1 = __webpack_require__(2);
const MMDHelper_1 = __webpack_require__(3);
var MMDLoader_2 = __webpack_require__(4);
exports.MMDLoader = MMDLoader_2.default;
var MMDAudioManager_2 = __webpack_require__(1);
exports.MMDAudioManager = MMDAudioManager_2.default;
var MMDGrantSolver_2 = __webpack_require__(2);
exports.MMDGrantSolver = MMDGrantSolver_2.default;
var MMDHelper_2 = __webpack_require__(3);
exports.MMDHelper = MMDHelper_2.default;
var DataCreationHelper_1 = __webpack_require__(6);
exports.DataCreationHelper = DataCreationHelper_1.default;
var VectorKeyframeTrackEx_1 = __webpack_require__(9);
exports.VectorKeyframeTrackEx = VectorKeyframeTrackEx_1.default;
var QuaternionKeyframeTrackEx_1 = __webpack_require__(8);
exports.QuaternionKeyframeTrackEx = QuaternionKeyframeTrackEx_1.default;
var NumberKeyframeTrackEx_1 = __webpack_require__(7);
exports.NumberKeyframeTrackEx = NumberKeyframeTrackEx_1.default;
var CubicBezierInterpolation_1 = __webpack_require__(5);
exports.CubicBezierInterpolation = CubicBezierInterpolation_1.default;
exports.mixin = (THREE) => {
    THREE.MMDLoader = MMDLoader_1.default;
    THREE.MMDAudioManager = MMDAudioManager_1.default;
    THREE.MMDGrantSolver = MMDGrantSolver_1.default;
    THREE.MMDHelper = MMDHelper_1.default;
};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require('mmd-parser');

/***/ })
/******/ ]);