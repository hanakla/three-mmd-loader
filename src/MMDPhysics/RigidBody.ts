import * as Ammo from 'ammo.js'
import ResourceHelper from './ResourceHelper'

export default class RigidBody
{
    helper: ResourceHelper

    constructor(mesh, world, params, helper: ResourceHelper)
    {
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

    init()
    {
        function generateShape(p)
        {
            switch (p.shapeType)
            {
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

        if (weight !== 0)
        {
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

        if (params.type === 0)
        {
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

    reset()
    {
        this.setTransformFromBone();
    }

    updateFromBone()
    {
        if (this.params.boneIndex === -1)
        {
            return;
        }

        if (this.params.type === 0)
        {
            this.setTransformFromBone();
        }
    }

    updateBone()
    {
        if (this.params.type === 0 || this.params.boneIndex === -1)
        {
            return;
        }

        this.updateBoneRotation();

        if (this.params.type === 1)
        {
            this.updateBonePosition();
        }

        this.bone.updateMatrixWorld(true);

        if (this.params.type === 2)
        {
            this.setPositionFromBone();
        }
    }

    getBoneTransform()
    {
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

    getWorldTransformForBone()
    {
        var helper = this.helper;

        var tr = helper.allocTransform();
        this.body.getMotionState().getWorldTransform(tr);
        var tr2 = helper.multiplyTransforms(tr, this.boneOffsetFormInverse);

        helper.freeTransform(tr);

        return tr2;
    }

    setTransformFromBone()
    {
        var helper = this.helper;
        var form = this.getBoneTransform();

        // TODO: check the most appropriate way to set
        //this.body.setWorldTransform( form );
        this.body.setCenterOfMassTransform(form);
        this.body.getMotionState().setWorldTransform(form);

        helper.freeTransform(form);
    }

    setPositionFromBone()
    {
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

    updateBoneRotation()
    {
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

    updateBonePosition()
    {
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