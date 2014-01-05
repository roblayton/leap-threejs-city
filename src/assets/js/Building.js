define(['threejs'], function() {
    var Building = function(color) {
        geometry = new THREE.CubeGeometry(1, 1, 1);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
        geometry.faces.splice(3, 1);
        geometry.faceVertexUvs[0].splice(3, 1);
        geometry.faceVertexUvs[0][2][0].set(0, 0);
        geometry.faceVertexUvs[0][2][1].set(0, 0);
        geometry.faceVertexUvs[0][2][2].set(0, 0);
        geometry.faceVertexUvs[0][2][3].set(0, 0);
        //geometry = new THREE.CubeGeometry(set[j].w, set[j].h, set[j].d);
        material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: color
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.floor(Math.random() * 200 - 100) * 10;
        mesh.position.z = Math.floor(Math.random() * 200 - 100) * 10;
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.scale.x = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
        mesh.scale.z = mesh.scale.x;
        mesh.scale.y = (Math.random() * Math.random() * Math.random() * mesh.scale.x) * 8 + 8;
        return mesh;
    };

    return Building;
});
