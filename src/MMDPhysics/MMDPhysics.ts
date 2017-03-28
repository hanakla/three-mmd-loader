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

import THREE from './three'

import * as Ammo from 'ammo.js';

import RigidBody from './RigidBody';
import Constraint from './Constraint';
import ResourceHelper from './ResourceHelper';

type MMDPhysicsConfigure = Partial<{
    unitStep: number
    maxStepNum: number
    world: Ammo
}>

export {
    RigidBody,
    Constraint,
    ResourceHelper
};

export default class MMDPhysics
{
    mesh: THREE.SkinnedMesh
    helper: ResourceHelper

    unitStep; number
    maxStepNum: number

    world: Ammo
    bodies: any[]
    constraints: Constraint[]

    constructor(mesh, params: MMDPhysicsConfigure = {})
    {
        this.mesh = mesh;
        this.helper = new ResourceHelper();

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

    init(mesh: THREE.SkinnedMesh)
    {
        const parent = mesh.parent;

        if (parent !== null)
        {
            parent.remove(mesh);
        }

        const currentPosition = mesh.position.clone();
        const currentRotation = mesh.rotation.clone();
        const currentScale = mesh.scale.clone();

        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);

        mesh.updateMatrixWorld(true);

        if (this.world === null) this.initWorld();
        this.initRigidBodies();
        this.initConstraints();

        if (parent !== null)
        {
            parent.add(mesh);
        }

        mesh.position.copy(currentPosition);
        mesh.rotation.copy(currentRotation);
        mesh.scale.copy(currentScale);

        mesh.updateMatrixWorld(true);

        this.reset();
    }

    initWorld()
    {
        var config = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(config);
        var cache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        var world = new Ammo.btDiscreteDynamicsWorld(dispatcher, cache, solver, config);
        world.setGravity(new Ammo.btVector3(0, -9.8 * 10, 0));
        this.world = world;
    }

    initRigidBodies()
    {
        var bodies = this.mesh.geometry.rigidBodies;

        for (var i = 0; i < bodies.length; i++)
        {
            var b = new RigidBody(this.mesh, this.world, bodies[i], this.helper);
            this.bodies.push(b);
        }
    }

    initConstraints()
    {
        var constraints = this.mesh.geometry.constraints;

        for (var i = 0; i < constraints.length; i++)
        {
            var params = constraints[i];
            var bodyA = this.bodies[params.rigidBodyIndex1];
            var bodyB = this.bodies[params.rigidBodyIndex2];
            var c = new Constraint(this.mesh, this.world, bodyA, bodyB, params, this.helper);
            this.constraints.push(c);
        }
    }

    update(delta)
    {
        this.updateRigidBodies();
        this.stepSimulation(delta);
        this.updateBones();
    }

    stepSimulation(delta)
    {
        var unitStep = this.unitStep;
        var stepTime = delta;
        var maxStepNum = ((delta / unitStep) | 0) + 1;

        if (stepTime < unitStep)
        {
            stepTime = unitStep;
            maxStepNum = 1;
        }

        if (maxStepNum > this.maxStepNum)
        {
            maxStepNum = this.maxStepNum;
        }

        this.world.stepSimulation(stepTime, maxStepNum, unitStep);
    }

    updateRigidBodies()
    {
        for (var i = 0; i < this.bodies.length; i++)
        {
            this.bodies[i].updateFromBone();
        }
    }

    updateBones()
    {
        for (var i = 0; i < this.bodies.length; i++)
        {
            this.bodies[i].updateBone();
        }
    }

    reset()
    {
        for (var i = 0; i < this.bodies.length; i++)
        {
            this.bodies[i].reset();
        }
    }

    warmup(cycles)
    {
        for (var i = 0; i < cycles; i++)
        {
            this.update(1 / 60);
        }
    }
}