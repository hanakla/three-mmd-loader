import THREE from '../three'

export default class CCDIKHelper extends THREE.Object3D
{
    constructor(mesh)
    {
        super();

        if (mesh.geometry.iks === undefined || mesh.skeleton === undefined)
        {
            throw 'THREE.CCDIKHelper requires iks in mesh.geometry and skeleton in mesh.';
        }

        THREE.Object3D.call(this);

        this.root = mesh;

        this.matrix = mesh.matrixWorld;
        this.matrixAutoUpdate = false;

        this.sphereGeometry = new THREE.SphereBufferGeometry(0.25, 16, 8);

        this.targetSphereMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xff8888),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });

        this.effectorSphereMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x88ff88),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });

        this.linkSphereMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x8888ff),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });

        this.lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(0xff0000),
            depthTest: false,
            depthWrite: false,
            transparent: true
        });

        this._init();
        this.update();

    }

    _init()
    {
        var self = this;
        var mesh = this.root;
        var iks = mesh.geometry.iks;

        function createLineGeometry(ik)
        {
            var geometry = new THREE.BufferGeometry();
            var vertices = new Float32Array((2 + ik.links.length) * 3);
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

            return geometry;
        }

        function createTargetMesh()
        {
            return new THREE.Mesh(self.sphereGeometry, self.targetSphereMaterial);
        }

        function createEffectorMesh()
        {
            return new THREE.Mesh(self.sphereGeometry, self.effectorSphereMaterial);
        }

        function createLinkMesh()
        {
            return new THREE.Mesh(self.sphereGeometry, self.linkSphereMaterial);
        }

        function createLine(ik)
        {
            return new THREE.Line(createLineGeometry(ik), self.lineMaterial);
        }

        for (var i = 0, il = iks.length; i < il; i++)
        {
            var ik = iks[i];

            this.add(createTargetMesh());
            this.add(createEffectorMesh());

            for (var j = 0, jl = ik.links.length; j < jl; j++)
            {
                this.add(createLinkMesh());
            }

            this.add(createLine(ik));
        }
    }

    update()
    {
        var offset = 0;

        var mesh = this.root;
        var iks = mesh.geometry.iks;
        var bones = mesh.skeleton.bones;

        var matrixWorldInv = new THREE.Matrix4().getInverse(mesh.matrixWorld);
        var vector = new THREE.Vector3();

        function getPosition(bone)
        {
            vector.setFromMatrixPosition(bone.matrixWorld);
            vector.applyMatrix4(matrixWorldInv);

            return vector;
        }

        function setPositionOfBoneToAttributeArray(array, index, bone)
        {
            var v = getPosition(bone);

            array[index * 3 + 0] = v.x;
            array[index * 3 + 1] = v.y;
            array[index * 3 + 2] = v.z;
        }

        for (var i = 0, il = iks.length; i < il; i++)
        {
            var ik = iks[i];

            var targetBone = bones[ik.target];
            var effectorBone = bones[ik.effector];

            var targetMesh = this.children[offset++];
            var effectorMesh = this.children[offset++];

            targetMesh.position.copy(getPosition(targetBone));
            effectorMesh.position.copy(getPosition(effectorBone));

            for (var j = 0, jl = ik.links.length; j < jl; j++)
            {
                var link = ik.links[j];
                var linkBone = bones[link.index];

                var linkMesh = this.children[offset++];

                linkMesh.position.copy(getPosition(linkBone));
            }

            var line = this.children[offset++];
            var array = line.geometry.attributes.position.array;

            setPositionOfBoneToAttributeArray(array, 0, targetBone);
            setPositionOfBoneToAttributeArray(array, 1, effectorBone);

            for (var j = 0, jl = ik.links.length; j < jl; j++)
            {
                var link = ik.links[j];
                var linkBone = bones[link.index];
                setPositionOfBoneToAttributeArray(array, j + 2, linkBone);
            }

            line.geometry.attributes.position.needsUpdate = true;
        }

    }
}