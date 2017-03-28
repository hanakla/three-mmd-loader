import THREE from '../three'

export default class MMDPhysicsHelper extends THREE.Object3D
{
    root: THREE.Mesh
    materials: THREE.Material[]

    constructor(mesh: THREE.SkinnedMesh)
    {
        super();

        if (mesh.physics === undefined || mesh.geometry.rigidBodies === undefined)
        {
            throw 'THREE.MMDPhysicsHelper requires physics in mesh and rigidBodies in mesh.geometry.';
        }

        this.root = mesh;

        this.matrix = mesh.matrixWorld;
        this.matrixAutoUpdate = false;

        this.materials = [];

        this.materials.push(
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xff8888),
                wireframe: true,
                depthTest: false,
                depthWrite: false,
                opacity: 0.25,
                transparent: true
            })
        );

        this.materials.push(
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x88ff88),
                wireframe: true,
                depthTest: false,
                depthWrite: false,
                opacity: 0.25,
                transparent: true
            })
        );

        this.materials.push(
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x8888ff),
                wireframe: true,
                depthTest: false,
                depthWrite: false,
                opacity: 0.25,
                transparent: true
            })
        );

        this._init();
        this.update();
    }

    _init()
    {
        var mesh = this.root;
        var rigidBodies = mesh.geometry.rigidBodies;

        for (var i = 0, il = rigidBodies.length; i < il; i++)
        {
            var param = rigidBodies[i];
            this.add(new THREE.Mesh(this._createGeometry(param), this.materials[param.type]));
        }

    }

    private _createGeometry(param: {shapeType:0|1|2, width: number, height: number, depth: number}): THREE.BufferGeometry
    {
        switch (param.shapeType)
        {
            case 0:
                return new THREE.SphereBufferGeometry(param.width, 16, 8);

            case 1:
                return new THREE.BoxBufferGeometry(param.width * 2, param.height * 2, param.depth * 2, 8, 8, 8);

            case 2:
                return this._createCapsuleGeometry(param.width, param.height, 16, 8);

            default:
                return null;
        }
    }

    // copy from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mytest37.js?ver=20160815
    private _createCapsuleGeometry(radius, cylinderHeight, segmentsRadius, segmentsHeight): THREE.CylinderBufferGeometry
    {
        var geometry = new THREE.CylinderBufferGeometry(radius, radius, cylinderHeight, segmentsRadius, segmentsHeight, true);
        var upperSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, 0, Math.PI / 2));
        var lowerSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));

        upperSphere.position.set(0, cylinderHeight / 2, 0);
        lowerSphere.position.set(0, -cylinderHeight / 2, 0);

        upperSphere.updateMatrix();
        lowerSphere.updateMatrix();

        geometry.merge(upperSphere.geometry as THREE.BufferGeometry, upperSphere.matrix);
        geometry.merge(lowerSphere.geometry as THREE.BufferGeometry, lowerSphere.matrix);

        return geometry;
    }

    update()
    {
        var mesh = this.root;
        var rigidBodies = mesh.geometry.rigidBodies;
        var bodies = mesh.physics.bodies;

        var matrixWorldInv = new THREE.Matrix4().getInverse(mesh.matrixWorld);
        var vector = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();
        var quaternion2 = new THREE.Quaternion();

        function getPosition(origin)
        {
            vector.set(origin.x(), origin.y(), origin.z());
            vector.applyMatrix4(matrixWorldInv);

            return vector;
        }

        function getQuaternion(rotation)
        {
            quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
            quaternion2.setFromRotationMatrix(matrixWorldInv);
            quaternion2.multiply(quaternion);

            return quaternion2;
        }

        for (var i = 0, il = rigidBodies.length; i < il; i++)
        {
            var body = bodies[i].body;
            var mesh = this.children[i];

            var tr = body.getCenterOfMassTransform();

            mesh.position.copy(getPosition(tr.getOrigin()));
            mesh.quaternion.copy(getQuaternion(tr.getRotation()));
        }

    }
}