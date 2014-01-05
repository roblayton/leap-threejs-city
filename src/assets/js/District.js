define(['proj/Building'], function(Building) {
    var District = function(count, color) {
        var geometry = new THREE.Geometry();
        for (var i = 0, len = count; i < len; i++) {
            THREE.GeometryUtils.merge(geometry, new Building(color));
		}

        var material  = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true
        });

        var mesh = new THREE.Mesh(geometry, material );
        return mesh;
    };

    return District;
});
