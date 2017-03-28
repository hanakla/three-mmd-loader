import THREE from './three'

export default class MMDGrantSolver {
    constructor( mesh ) {
        this.mesh = mesh;
    }

    update = (() => {
        var q = new THREE.Quaternion();

        return function () {

            for ( var i = 0; i < this.mesh.geometry.grants.length; i ++ ) {

                var g = this.mesh.geometry.grants[ i ];
                var b = this.mesh.skeleton.bones[ g.index ];
                var pb = this.mesh.skeleton.bones[ g.parentIndex ];

                if ( g.isLocal ) {

                    // TODO: implement
                    if ( g.affectPosition ) {

                    }

                    // TODO: implement
                    if ( g.affectRotation ) {

                    }

                } else {

                    // TODO: implement
                    if ( g.affectPosition ) {

                    }

                    if ( g.affectRotation ) {

                        q.set( 0, 0, 0, 1 );
                        q.slerp( pb.quaternion, g.ratio );
                        b.quaternion.multiply( q );

                    }

                }

            }

        };

    })()

};