import * as _THREE from 'three' // Type reference
const THREE: typeof _THREE = (((function () { return this || {} })()).THREE || require('three')) as typeof _THREE

import * as Ammo from 'ammo.js'

/**
 * This helper class responsibilies are
 *
 * 1. manage Ammo.js and Three.js object resources and
 *    improve the performance and the memory consumption by
 *    reusing objects.
 *
 * 2. provide simple Ammo object operations.
 */
export default class ResourceHelper
{
    threeVector3s: _THREE.Vector3[]
    threeMatrix4s: _THREE.Matrix4[]
    threeQuaternions: _THREE.Quaternion[]
    threeEulers: _THREE.Euler[]

    transforms: any[]
    quaternions: any[]
    vector3s: any[]

    constructor()
    {
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

    allocThreeVector3()
    {
        return (this.threeVector3s.length > 0) ? this.threeVector3s.pop() : new THREE.Vector3();
    }

    freeThreeVector3(v)
    {
        this.threeVector3s.push(v);
    }

    allocThreeMatrix4()
    {
        return (this.threeMatrix4s.length > 0) ? this.threeMatrix4s.pop() : new THREE.Matrix4();
    }

    freeThreeMatrix4(m)
    {
        this.threeMatrix4s.push(m);
    }

    allocThreeQuaternion()
    {
        return (this.threeQuaternions.length > 0) ? this.threeQuaternions.pop() : new THREE.Quaternion();
    }

    freeThreeQuaternion(q)
    {
        this.threeQuaternions.push(q);
    }

    allocThreeEuler()
    {
        return (this.threeEulers.length > 0) ? this.threeEulers.pop() : new THREE.Euler();
    }

    freeThreeEuler(e)
    {
        this.threeEulers.push(e);
    }

    allocTransform()
    {
        return (this.transforms.length > 0) ? this.transforms.pop() : new Ammo.btTransform();
    }

    freeTransform(t)
    {
        this.transforms.push(t);
    }

    allocQuaternion()
    {
        return (this.quaternions.length > 0) ? this.quaternions.pop() : new Ammo.btQuaternion();
    }

    freeQuaternion(q)
    {
        this.quaternions.push(q);
    }

    allocVector3()
    {
        return (this.vector3s.length > 0) ? this.vector3s.pop() : new Ammo.btVector3();
    }

    freeVector3(v)
    {
        this.vector3s.push(v);
    }

    setIdentity(t)
    {
        t.setIdentity();
    }

    getBasis(t)
    {
        var q = this.allocQuaternion();
        t.getBasis().getRotation(q);
        return q;
    }

    getBasisAsMatrix3(t)
    {
        var q = this.getBasis(t);
        var m = this.quaternionToMatrix3(q);
        this.freeQuaternion(q);
        return m;
    }

    getOrigin(t)
    {
        return t.getOrigin();
    }

    setOrigin(t, v)
    {
        t.getOrigin().setValue(v.x(), v.y(), v.z());
    }

    copyOrigin(t1, t2)
    {
        var o = t2.getOrigin();
        this.setOrigin(t1, o);
    }

    setBasis(t, q)
    {
        t.setRotation(q);
    }

    setBasisFromMatrix3(t, m)
    {
        var q = this.matrix3ToQuaternion(m);
        this.setBasis(t, q);
        this.freeQuaternion(q);
    }

    setOriginFromArray3(t, a)
    {
        t.getOrigin().setValue(a[0], a[1], a[2]);
    }

    setBasisFromArray3(t, a)
    {
        var thQ = this.allocThreeQuaternion();
        var thE = this.allocThreeEuler();
        thE.set(a[0], a[1], a[2]);
        this.setBasisFromArray4(t, thQ.setFromEuler(thE).toArray());

        this.freeThreeEuler(thE);
        this.freeThreeQuaternion(thQ);
    }

    setBasisFromArray4(t, a)
    {
        var q = this.array4ToQuaternion(a);
        this.setBasis(t, q);
        this.freeQuaternion(q);
    }

    array4ToQuaternion(a)
    {
        var q = this.allocQuaternion();
        q.setX(a[0]);
        q.setY(a[1]);
        q.setZ(a[2]);
        q.setW(a[3]);
        return q;
    }

    multiplyTransforms(t1, t2)
    {
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

    inverseTransform(t)
    {
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

    multiplyMatrices3(m1, m2)
    {
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

    addVector3(v1, v2)
    {
        var v = this.allocVector3();
        v.setValue(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z());
        return v;
    }

    dotVectors3(v1, v2)
    {
        return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();
    }

    rowOfMatrix3(m, i)
    {
        var v = this.allocVector3();
        v.setValue(m[i * 3 + 0], m[i * 3 + 1], m[i * 3 + 2]);
        return v;
    }

    columnOfMatrix3(m, i)
    {
        var v = this.allocVector3();
        v.setValue(m[i + 0], m[i + 3], m[i + 6]);
        return v;
    }

    negativeVector3(v)
    {
        var v2 = this.allocVector3();
        v2.setValue(-v.x(), -v.y(), -v.z());
        return v2;
    }

    multiplyMatrix3ByVector3(m, v)
    {
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

    transposeMatrix3(m)
    {
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

    quaternionToMatrix3(q)
    {
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

    matrix3ToQuaternion(m)
    {
        var t = m[0] + m[4] + m[8];
        var s, x, y, z, w;

        if (t > 0)
        {
            s = Math.sqrt(t + 1.0) * 2;
            w = 0.25 * s;
            x = (m[7] - m[5]) / s;
            y = (m[2] - m[6]) / s;
            z = (m[3] - m[1]) / s;
        } else if ((m[0] > m[4]) && (m[0] > m[8]))
        {
            s = Math.sqrt(1.0 + m[0] - m[4] - m[8]) * 2;
            w = (m[7] - m[5]) / s;
            x = 0.25 * s;
            y = (m[1] + m[3]) / s;
            z = (m[2] + m[6]) / s;
        } else if (m[4] > m[8])
        {
            s = Math.sqrt(1.0 + m[4] - m[0] - m[8]) * 2;
            w = (m[2] - m[6]) / s;
            x = (m[1] + m[3]) / s;
            y = 0.25 * s;
            z = (m[5] + m[7]) / s;
        } else
        {
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