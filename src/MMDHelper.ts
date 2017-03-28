import * as _THREE from 'three' // Type reference

import MMDPhysics from './MMDPhysics'
import MMDGrantSolver from './MMDGrantSolver'

export default class MMDHelper
{
    constructor()
    {
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

    add(mesh: _THREE.Mesh)
    {
        if (!(mesh instanceof THREE.SkinnedMesh))
        {
            throw new Error('THREE.MMDHelper.add() accepts only THREE.SkinnedMesh instance.');
        }

        if (mesh.mixer === undefined) mesh.mixer = null;
        if (mesh.ikSolver === undefined) mesh.ikSolver = null;
        if (mesh.grantSolver === undefined) mesh.grantSolver = null;
        if (mesh.physics === undefined) mesh.physics = null;
        if (mesh.looped === undefined) mesh.looped = false;

        this.meshes.push(mesh);

        // workaround until I make IK and Physics Animation plugin
        this.initBackupBones(mesh);
    }

    setAudio(audio, listener, params)
    {
        this.audioManager = new MMDAudioManager(audio, listener, params);
    }

    setCamera(camera)
    {
        camera.mixer = null;
        this.camera = camera;
    }

    setPhysicses(params)
    {
        for (var i = 0; i < this.meshes.length; i++)
        {
            this.setPhysics(this.meshes[i], params);
        }
    }

    setPhysics(mesh: _THREE.SkinnedMesh, params: {world?: any, warmup?: number, preventAnimationWarmup?: boolean} = {})
    {
        if (params.world === undefined && this.sharedPhysics)
        {
            var masterPhysics = this.getMasterPhysics();

            if (masterPhysics !== null) params.world = masterPhysics.world;
        }

        var warmup = params.warmup !== undefined ? params.warmup : 60;

        var physics = new MMDPhysics(mesh, params);

        if (mesh.mixer !== null && mesh.mixer !== undefined && params.preventAnimationWarmup !== true)
        {
            this.animateOneMesh(0, mesh);
            physics.reset();
        }

        physics.warmup(warmup);

        this.updateIKParametersDependingOnPhysicsEnabled(mesh, true);

        mesh.physics = physics;
    }

    getMasterPhysics()
    {
        if (this.masterPhysics !== null) return this.masterPhysics;

        for (var i = 0, il = this.meshes.length; i < il; i++)
        {
            var physics = this.meshes[i].physics;

            if (physics !== undefined && physics !== null)
            {
                this.masterPhysics = physics;
                return this.masterPhysics;
            }
        }

        return null;
    }

    enablePhysics(enabled)
    {
        if (enabled === true)
        {
            this.doPhysics = true;
        } else
        {
            this.doPhysics = false;
        }

        for (var i = 0, il = this.meshes.length; i < il; i++)
        {
            this.updateIKParametersDependingOnPhysicsEnabled(this.meshes[i], enabled);
        }
    }

    updateIKParametersDependingOnPhysicsEnabled(mesh, physicsEnabled)
    {
        var iks = mesh.geometry.iks;
        var bones = mesh.geometry.bones;

        for (var j = 0, jl = iks.length; j < jl; j++)
        {
            var ik = iks[j];
            var links = ik.links;

            for (var k = 0, kl = links.length; k < kl; k++)
            {
                var link = links[k];

                if (physicsEnabled === true)
                {
                    // disable IK of the bone the corresponding rigidBody type of which is 1 or 2
                    // because its rotation will be overriden by physics
                    link.enabled = bones[link.index].rigidBodyType > 0 ? false : true;

                } else
                {
                    link.enabled = true;
                }
            }
        }
    }

    setAnimations()
    {
        for (var i = 0; i < this.meshes.length; i++)
        {
            this.setAnimation(this.meshes[i]);
        }
    }

    setAnimation(mesh)
    {
        if (mesh.geometry.animations !== undefined)
        {
            mesh.mixer = new THREE.AnimationMixer(mesh);

            // TODO: find a workaround not to access (seems like) private properties
            //       the name of them begins with "_".
            mesh.mixer.addEventListener('loop', function (e)
            {
                if (e.action._clip.tracks[0].name.indexOf('.bones') !== 0) return;

                var mesh = e.target._root;
                mesh.looped = true;
            });

            var foundAnimation = false;
            var foundMorphAnimation = false;

            for (var i = 0; i < mesh.geometry.animations.length; i++)
            {
                var clip = mesh.geometry.animations[i];

                var action = mesh.mixer.clipAction(clip);

                if (clip.tracks[0].name.indexOf('.morphTargetInfluences') === 0)
                {
                    if (!foundMorphAnimation)
                    {
                        action.play();
                        foundMorphAnimation = true;
                    }
                } else
                {
                    if (!foundAnimation)
                    {
                        action.play();
                        foundAnimation = true;
                    }
                }
            }

            if (foundAnimation)
            {
                mesh.ikSolver = new THREE.CCDIKSolver(mesh);

                if (mesh.geometry.grants !== undefined)
                {
                    mesh.grantSolver = new MMDGrantSolver(mesh);
                }
            }
        }
    }

    setCameraAnimation(camera)
    {
        if (camera.animations !== undefined)
        {
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
    unifyAnimationDuration(params)
    {
        params = params === undefined ? {} : params;

        var max = 0.0;

        var camera = this.camera;
        var audioManager = this.audioManager;

        // check the longest duration
        for (var i = 0; i < this.meshes.length; i++)
        {
            var mesh = this.meshes[i];
            var mixer = mesh.mixer;

            if (mixer === null)
            {
                continue;
            }

            for (var j = 0; j < mixer._actions.length; j++)
            {
                var action = mixer._actions[j];
                max = Math.max(max, action._clip.duration);
            }
        }

        if (camera !== null && camera.mixer !== null)
        {
            var mixer = camera.mixer;

            for (var i = 0; i < mixer._actions.length; i++)
            {
                var action = mixer._actions[i];
                max = Math.max(max, action._clip.duration);
            }
        }

        if (audioManager !== null)
        {
            max = Math.max(max, audioManager.duration);
        }

        if (params.afterglow !== undefined)
        {
            max += params.afterglow;
        }

        // set the duration
        for (var i = 0; i < this.meshes.length; i++)
        {
            var mesh = this.meshes[i];
            var mixer = mesh.mixer;

            if (mixer === null)
            {
                continue;
            }

            for (var j = 0; j < mixer._actions.length; j++)
            {
                var action = mixer._actions[j];
                action._clip.duration = max;
            }
        }

        if (camera !== null && camera.mixer !== null)
        {
            var mixer = camera.mixer;

            for (var i = 0; i < mixer._actions.length; i++)
            {
                var action = mixer._actions[i];
                action._clip.duration = max;
            }
        }

        if (audioManager !== null)
        {
            audioManager.duration = max;
        }
    }

    controlAudio(delta)
    {
        if (this.audioManager === null)
        {
            return;
        }

        this.audioManager.control(delta);
    }

    animate(delta)
    {
        this.controlAudio(delta);

        for (var i = 0; i < this.meshes.length; i++)
        {
            this.animateOneMesh(delta, this.meshes[i]);
        }

        if (this.sharedPhysics) this.updateSharedPhysics(delta);

        this.animateCamera(delta);
    }

    animateOneMesh(delta, mesh: _THREE.SkinnedMesh)
    {
        var mixer = mesh.mixer;
        var ikSolver = mesh.ikSolver;
        var grantSolver = mesh.grantSolver;
        var physics = mesh.physics;

        if (mixer !== null && this.doAnimation === true)
        {
            // restore/backupBones are workaround
            // until I make IK, Grant, and Physics Animation plugin
            this.restoreBones(mesh);

            mixer.update(delta);

            this.backupBones(mesh);
        }

        if (ikSolver !== null && this.doIk === true)
        {
            ikSolver.update();
        }

        if (grantSolver !== null && this.doGrant === true)
        {
            grantSolver.update();
        }

        if (mesh.looped === true)
        {
            if (physics !== null) physics.reset();

            mesh.looped = false;
        }

        if (physics !== null && this.doPhysics && !this.sharedPhysics)
        {
            physics.update(delta);
        }
    }

    updateSharedPhysics(delta)
    {
        if (this.meshes.length === 0 || !this.doPhysics || !this.sharedPhysics) return;

        var physics = this.getMasterPhysics();

        if (physics === null) return;

        for (var i = 0, il = this.meshes.length; i < il; i++)
        {
            var p = this.meshes[i].physics;

            if (p !== null && p !== undefined)
            {
                p.updateRigidBodies();

            }
        }

        physics.stepSimulation(delta);

        for (var i = 0, il = this.meshes.length; i < il; i++)
        {
            var p = this.meshes[i].physics;

            if (p !== null && p !== undefined)
            {
                p.updateBones();
            }
        }
    }

    animateCamera(delta)
    {
        if (this.camera === null)
        {
            return;
        }

        var mixer = this.camera.mixer;

        if (mixer !== null && this.camera.center !== undefined && this.doCameraAnimation === true)
        {
            mixer.update(delta);

            // TODO: Let PerspectiveCamera automatically update?
            this.camera.updateProjectionMatrix();

            this.camera.up.set(0, 1, 0);
            this.camera.up.applyQuaternion(this.camera.quaternion);
            this.camera.lookAt(this.camera.center);
        }
    }

    poseAsVpd(mesh, vpd, params)
    {
        if (params === undefined) params = {};

        if (params.preventResetPose !== true) mesh.pose();

        var bones = mesh.skeleton.bones;
        var bones2 = vpd.bones;

        var table = {};

        for (var i = 0; i < bones.length; i++)
        {
            table[bones[i].name] = i;
        }

        var thV = new THREE.Vector3();
        var thQ = new THREE.Quaternion();

        for (var i = 0; i < bones2.length; i++)
        {
            var b = bones2[i];
            var index = table[b.name];

            if (index === undefined) continue;

            var b2 = bones[index];
            var t = b.translation;
            var q = b.quaternion;

            thV.set(t[0], t[1], t[2]);
            thQ.set(q[0], q[1], q[2], q[3]);

            b2.position.add(thV);
            b2.quaternion.multiply(thQ);
        }

        mesh.updateMatrixWorld(true);

        if (params.preventIk !== true)
        {
            var solver = new THREE.CCDIKSolver(mesh);
            solver.update(params.saveOriginalBonesBeforeIK);
        }

        if (params.preventGrant !== true && mesh.geometry.grants !== undefined)
        {
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
    initBackupBones(mesh)
    {
        mesh.skeleton.backupBones = [];

        for (var i = 0; i < mesh.skeleton.bones.length; i++)
        {
            mesh.skeleton.backupBones.push(mesh.skeleton.bones[i].clone());
        }
    }

    backupBones(mesh)
    {
        mesh.skeleton.backupBoneIsSaved = true;

        for (var i = 0; i < mesh.skeleton.bones.length; i++)
        {
            var b = mesh.skeleton.backupBones[i];
            var b2 = mesh.skeleton.bones[i];
            b.position.copy(b2.position);
            b.quaternion.copy(b2.quaternion);
        }
    }

    restoreBones(mesh)
    {
        if (mesh.skeleton.backupBoneIsSaved !== true)
        {
            return;
        }

        mesh.skeleton.backupBoneIsSaved = false;

        for (var i = 0; i < mesh.skeleton.bones.length; i++)
        {
            var b = mesh.skeleton.bones[i];
            var b2 = mesh.skeleton.backupBones[i];
            b.position.copy(b2.position);
            b.quaternion.copy(b2.quaternion);
        }
    }
}