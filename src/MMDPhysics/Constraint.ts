import * as Ammo from 'ammo.js'

export default class Constraint
{
    constructor(mesh, world, bodyA, bodyB, params, helper)
    {
        this.mesh = mesh;
        this.world = world;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.params = params;
        this.helper = helper;

        this.constraint = null;

        this.init();
    }

    init()
    {
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

        lll.setValue(params.translationLimitation1[0],
            params.translationLimitation1[1],
            params.translationLimitation1[2]);
        lul.setValue(params.translationLimitation2[0],
            params.translationLimitation2[1],
            params.translationLimitation2[2]);
        all.setValue(params.rotationLimitation1[0],
            params.rotationLimitation1[1],
            params.rotationLimitation1[2]);
        aul.setValue(params.rotationLimitation2[0],
            params.rotationLimitation2[1],
            params.rotationLimitation2[2]);

        constraint.setLinearLowerLimit(lll);
        constraint.setLinearUpperLimit(lul);
        constraint.setAngularLowerLimit(all);
        constraint.setAngularUpperLimit(aul);

        for (var i = 0; i < 3; i++)
        {
            if (params.springPosition[i] !== 0)
            {
                constraint.enableSpring(i, true);
                constraint.setStiffness(i, params.springPosition[i]);
            }
        }

        for (var i = 0; i < 3; i++)
        {
            if (params.springRotation[i] !== 0)
            {
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
        if (constraint.setParam !== undefined)
        {
            for (var i = 0; i < 6; i++)
            {
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