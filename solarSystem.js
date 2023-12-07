"use strict";

// Sphere class
function sphere(numSubdivisions) {

    var subdivisions = 3;
    if(numSubdivisions) subdivisions = numSubdivisions;
    
    
    var data = {};
    
    //var radius = 0.5;
    
    var sphereVertexCoordinates = [];
    var sphereVertexCoordinatesNormals = [];
    var sphereVertexColors = [];
    var sphereTextureCoordinates = [];
    var sphereNormals = [];
    
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
    function triangle(a, b, c) {
    
         sphereVertexCoordinates.push([a[0],a[1], a[2], 1]);
         sphereVertexCoordinates.push([b[0],b[1], b[2], 1]);
         sphereVertexCoordinates.push([c[0],c[1], c[2], 1]);
    
         // normals are vectors
    
         sphereNormals.push([a[0],a[1], a[2]]);
         sphereNormals.push([b[0],b[1], b[2]]);
         sphereNormals.push([c[0],c[1], c[2]]);
    
         sphereVertexColors.push([(1+a[0])/2.0, (1+a[1])/2.0, (1+a[2])/2.0, 1.0]);
         sphereVertexColors.push([(1+b[0])/2.0, (1+b[1])/2.0, (1+b[2])/2.0, 1.0]);
         sphereVertexColors.push([(1+c[0])/2.0, (1+c[1])/2.0, (1+c[2])/2.0, 1.0]);
    
         sphereTextureCoordinates.push([0.5*Math.acos(a[0])/Math.PI, 0.5*Math.asin(a[1]/Math.sqrt(1.0-a[0]*a[0]))/Math.PI]);
         sphereTextureCoordinates.push([0.5*Math.acos(b[0])/Math.PI, 0.5*Math.asin(b[1]/Math.sqrt(1.0-b[0]*b[0]))/Math.PI]);
         sphereTextureCoordinates.push([0.5*Math.acos(c[0])/Math.PI, 0.5*Math.asin(c[1]/Math.sqrt(1.0-c[0]*c[0]))/Math.PI]);
    
         //sphereTextureCoordinates.push([0.5+Math.asin(a[0])/Math.PI, 0.5+Math.asin(a[1])/Math.PI]);
         //sphereTextureCoordinates.push([0.5+Math.asin(b[0])/Math.PI, 0.5+Math.asin(b[1])/Math.PI]);
         //sphereTextureCoordinates.push([0.5+Math.asin(c[0])/Math.PI, 0.5+Math.asin(c[1])/Math.PI]);
    
    }
    
    
    
    function divideTriangle(a, b, c, count) {
        if ( count > 0 ) {
    
            var ab = mix( a, b, 0.5);
            var ac = mix( a, c, 0.5);
            var bc = mix( b, c, 0.5);
    
            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);
    
            divideTriangle( a, ab, ac, count - 1 );
            divideTriangle( ab, b, bc, count - 1 );
            divideTriangle( bc, c, ac, count - 1 );
            divideTriangle( ab, bc, ac, count - 1 );
        }
        else {
            triangle( a, b, c );
        }
    }
    
    
    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }
    
    tetrahedron(va, vb, vc, vd, subdivisions);
    
    
    function translate(x, y, z){
       for(var i=0; i<sphereVertexCoordinates.length; i++) {
         sphereVertexCoordinates[i][0] += x;
         sphereVertexCoordinates[i][1] += y;
         sphereVertexCoordinates[i][2] += z;
       };
    }
    
    function scale(sx, sy, sz){
        for(var i=0; i<sphereVertexCoordinates.length; i++) {
            sphereVertexCoordinates[i][0] *= sx;
            sphereVertexCoordinates[i][1] *= sy;
            sphereVertexCoordinates[i][2] *= sz;
            sphereNormals[i][0] /= sx;
            sphereNormals[i][1] /= sy;
            sphereNormals[i][2] /= sz;
        };
    }
    
    function radians( degrees ) {
        return degrees * Math.PI / 180.0;
    }
    
    function rotate( angle, axis) {
    
        var d = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
    
        var x = axis[0]/d;
        var y = axis[1]/d;
        var z = axis[2]/d;
    
        var c = Math.cos( radians(angle) );
        var omc = 1.0 - c;
        var s = Math.sin( radians(angle) );
    
        var mat = [
            [ x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s ],
            [ x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s ],
            [ x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c ]
        ];
    
        for(var i=0; i<sphereVertexCoordinates.length; i++) {
              var u = [0, 0, 0];
              var v = [0, 0, 0];
              for( var j =0; j<3; j++)
               for( var k =0 ; k<3; k++) {
                  u[j] += mat[j][k]*sphereVertexCoordinates[i][k];
                  v[j] += mat[j][k]*sphereNormals[i][k];
                };
               for( var j =0; j<3; j++) {
                 sphereVertexCoordinates[i][j] = u[j];
                 sphereNormals[i][j] = v[j];
               };
        };
    }
    //for(var i =0; i<sphereVertexCoordinates.length; i++) console.log(sphereTextureCoordinates[i]);
    
    data.TriangleVertices = sphereVertexCoordinates;
    data.TriangleNormals = sphereNormals;
    data.TriangleVertexColors = sphereVertexColors;
    data.TextureCoordinates = sphereTextureCoordinates;
    data.rotate = rotate;
    data.translate = translate;
    data.scale = scale;
    return data;
    
    }

var canvas;
var gl;

var modelViewMatrix, projectionMatrix;
var viewerPos;
var program1, program2, program3;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1; // start rotating on y axis first
var theta =vec3(0, 0, 0);
var speed = 0.25; // speed of rotation

var flag = true; // controls toggle of rotation

var points = [];
var normals = [];
var colors = [];
var texCoord = [];

// planet objects
var mercury, venus, earth, mars, jupiter, saturn, rings, uranus, neptune, skyBox;
// planet vertices count
var ncube, nsun, nmercury, nvenus, nearth, nmars, njupiter, nsaturn, nuranus, nneptune, nskybox, nrings;
// texture of each planet
var suntex, mercurytex, venustex, earthtex, marstex, jupitertex, saturntex, uranustex, neptunetex, skyboxtex, ringstex;

function configureTexture( image ) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

function createPlanet(planet) {
    points = points.concat(planet.TriangleVertices);
    normals = normals.concat(planet.TriangleNormals);
    colors = colors.concat(planet.TriangleVertexColors);
    texCoord = texCoord.concat(planet.TextureCoordinates);
}

function light() {
    var data = {};
    data.lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );;
    data.lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
    data.lightDiffuse = vec4( 2.0, 2.0, 2.0, 1.0 );
    data.lightSpecular = vec4(2.0, 2.0, 2.0, 1.0 );
    data.lightShineness = 10;
    return data;
  }

  function material() {
    var data  = {};
    data.materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
    data.materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
    data.materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
    data.materialShininess = 100.0;
    return data;
  }

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

// declare planets, relative sizes and distance from sun

    var sun = sphere(5);
    sun.scale(0.18, 0.18, 0.18);
    sun.translate(0.0, 0.0, 0.0);

    mercury = sphere(5);
    mercury.scale(0.02, 0.02, 0.02);
    mercury.translate(-0.2, -0.0, 0.2);

    venus = sphere(5);
    venus.scale(0.03, 0.03, 0.03);
    venus.translate(-0.27, 0.0, 0.27);
    venus.rotate(-90.0, [ 0, 1, 0]);

    earth = sphere(5);
    earth.scale(0.035, 0.035, 0.035);
    earth.translate(-0.35, 0.0, 0.35);
    earth.rotate(60.0, [ 0, 1, 0]);

    mars = sphere(5);
    mars.scale(0.02, 0.02, 0.02);
    mars.translate(-0.43, 0.0, 0.43);
    mars.rotate(15.0, [ 0, 1, 0]);

    jupiter = sphere(5);
    jupiter.scale(0.08, 0.08, 0.08);
    jupiter.translate(-0.54, 0.0, 0.54);
    jupiter.rotate(180.0, [ 0, 1, 0]);

    saturn = sphere(5);
    saturn.scale(0.07, 0.07, 0.07);
    saturn.translate(-0.69, 0.0, 0.69);
    saturn.rotate(-120.0, [ 0, 1, 0]);

    rings = sphere(5);
    rings.scale(0.1, 0.01, 0.1);
    rings.rotate(45.0, [ 1, 1, 1]);
    rings.translate(-0.69, 0.0, 0.69);
    rings.rotate(-120.0, [ 0, 1, 0]);

    uranus = sphere(5);
    uranus.scale(0.05, 0.05, 0.05);
    uranus.translate(-0.8, 0.0, 0.8);
    uranus.rotate(-245.0, [ 0, 1, 0]);

    neptune = sphere(5);
    neptune.scale(0.048, 0.048, 0.048);
    neptune.translate(-0.9, 0.0, 0.9);
    neptune.rotate(295.0, [ 0, 1, 0]);

    skyBox = sphere(5);
    skyBox.scale(2, 2, 2);
    skyBox.translate(0.0, 0.0, 0.0);

// light, material, texture

    var myMaterial = material();
    var myLight = light();

// put object data in arrays that will be sent to shaders

    points = sun.TriangleVertices;
    normals = sun.TriangleNormals;
    colors = sun.TriangleVertexColors;
    texCoord = sun.TextureCoordinates;

    createPlanet(mercury);
    createPlanet(venus);
    createPlanet(earth);
    createPlanet(mars);
    createPlanet(jupiter);
    createPlanet(saturn);
    createPlanet(uranus);
    createPlanet(neptune);
    createPlanet(rings);
    createPlanet(skyBox);

// object sizes (number of vertices)

    nsun = sun.TriangleVertices.length;
    nmercury = mercury.TriangleVertices.length;
    nvenus = venus.TriangleVertices.length;
    nearth = earth.TriangleVertices.length;
    nmars = mars.TriangleVertices.length;
    njupiter = jupiter.TriangleVertices.length;
    nsaturn = saturn.TriangleVertices.length;
    nuranus = uranus.TriangleVertices.length;
    nneptune = neptune.TriangleVertices.length;
    nrings = rings.TriangleVertices.length;
    nskybox = skyBox.TriangleVertices.length;

    //
    //  Load shaders and initialize attribute buffers
    //
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    program3 = initShaders( gl, "vertex-shader3", "fragment-shader3" );

// program1: render with lighting
//    need position and normal attributes sent to shaders
// program2: render with vertex colors
//    need position and color attributes sent to shaders
// program3: render with texture and vertex colors
//    need position, color and texture coordinate attributes sent to shaders

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program2, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( colorLoc );

    var color2Loc = gl.getAttribLocation( program3, "aColor" );
    gl.vertexAttribPointer( color2Loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( color2Loc );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var normalLoc = gl.getAttribLocation( program1, "aNormal" );
    gl.vertexAttribPointer( normalLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var position2Loc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(position2Loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position2Loc);

    var position3Loc = gl.getAttribLocation(program3, "aPosition");
    gl.vertexAttribPointer(position3Loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position3Loc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW );

    var texCoordLoc = gl.getAttribLocation( program3, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var img1 = document.getElementById("Img1");
    suntex=configureTexture(img1);
    var img2 = document.getElementById("Img2");
    mercurytex = configureTexture(img2);
    var img3 = document.getElementById("Img3");
    venustex = configureTexture(img3);
    var img4 = document.getElementById("Img4");
    earthtex = configureTexture(img4);
    var img5 = document.getElementById("Img5");
    marstex = configureTexture(img5);
    var img6 = document.getElementById("Img6");
    jupitertex = configureTexture(img6);
    var img7 = document.getElementById("Img7");
    saturntex = configureTexture(img7);
    var img8 = document.getElementById("Img8");
    uranustex = configureTexture(img8);
    var img9 = document.getElementById("Img9");
    neptunetex = configureTexture(img9);
    var img10 = document.getElementById("Img10");
    skyboxtex = configureTexture(img10);
    var img11 = document.getElementById("Img11");
    ringstex = configureTexture(img11);

// set up projection matrix

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projectionMatrix = ortho(-1.35, 1.35, -1.35, 1.35, -1.3, 2);

// products of material and light properties

    var ambientProduct = mult(myLight.lightAmbient, myMaterial.materialAmbient);
    var diffuseProduct = mult(myLight.lightDiffuse, myMaterial.materialDiffuse);
    var specularProduct = mult(myLight.lightSpecular, myMaterial.materialSpecular);

// listeners

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonSlow").onclick = function(){if(speed>0.2) speed -= 0.1};
    document.getElementById("ButtonFast").onclick = function(){if(speed<2.0) speed += 0.1};

// uniforms for each program object

    gl.useProgram(program2);

    gl.uniformMatrix4fv( gl.getUniformLocation(program2, "projectionMatrix"),
       false, flatten(projectionMatrix));

    gl.useProgram(program3);

    gl.uniformMatrix4fv( gl.getUniformLocation(program3, "projectionMatrix"),
          false, flatten(projectionMatrix));


    gl.useProgram(program1);

    gl.uniform4fv(gl.getUniformLocation(program1, "ambientProduct"),
          flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program1, "diffuseProduct"),
          flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program1, "specularProduct"),
          flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program1, "lightPosition"),
          flatten(myLight.lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program1,
          "shininess"), myMaterial.materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program1, "projectionMatrix"),
          false, flatten(projectionMatrix));

    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//update rotation angles and form modelView matrix

    if(flag) theta[axis] += speed;

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0) ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0) ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1) ));

// by commenting and uncommenting gl.drawArrays we can choose which shaders to use for each object

    gl.useProgram(program1);
    gl.uniformMatrix4fv( gl.getUniformLocation(program1,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    // gl.drawArrays( gl.TRIANGLES, 0, nsun);
    // gl.drawArrays( gl.TRIANGLES, nsun, nmercury );
    // gl.drawArrays( gl.TRIANGLES, nsun + nmercury, nskybox );
    // gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nsphere, nskybox );


    // gl.useProgram(program2);
    // gl.uniformMatrix4fv( gl.getUniformLocation(program2,
    //         "modelViewMatrix"), false, flatten(modelViewMatrix) );

    // gl.drawArrays( gl.TRIANGLES, 0, nsun);
    // gl.drawArrays( gl.TRIANGLES, nsun, ncube );
    // gl.drawArrays( gl.TRIANGLES, nsun + ncube, nsphere );
    // gl.drawArrays( gl.TRIANGLES, nsun + ncube + nsphere, nskybox );



    // gl.useProgram(program3);
    // gl.uniformMatrix4fv( gl.getUniformLocation(program3,
    //         "modelViewMatrix"), false, flatten(modelViewMatrix) );

    gl.bindTexture(gl.TEXTURE_2D, suntex)
    gl.drawArrays( gl.TRIANGLES, 0, nsun);
    gl.bindTexture(gl.TEXTURE_2D, mercurytex);
    gl.drawArrays( gl.TRIANGLES, nsun, nmercury );
    gl.bindTexture(gl.TEXTURE_2D, venustex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury, nvenus );
    gl.bindTexture(gl.TEXTURE_2D, earthtex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus, nearth );
    gl.bindTexture(gl.TEXTURE_2D, marstex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth, nmars );
    gl.bindTexture(gl.TEXTURE_2D, jupitertex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth + nmars, njupiter );
    gl.bindTexture(gl.TEXTURE_2D, saturntex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth + nmars + njupiter, nsaturn );
    gl.bindTexture(gl.TEXTURE_2D, uranustex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth + nmars + njupiter + nsaturn, nuranus );
    gl.bindTexture(gl.TEXTURE_2D, neptunetex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth + nmars + njupiter + nsaturn + nuranus, nneptune );
    gl.bindTexture(gl.TEXTURE_2D, ringstex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth + nmars + njupiter + nsaturn + nuranus + nneptune, nrings );
    gl.bindTexture(gl.TEXTURE_2D, skyboxtex)
    gl.drawArrays( gl.TRIANGLES, nsun + nmercury + nvenus + nearth + nmars + njupiter + nsaturn + nuranus + nneptune + nrings, nskybox );


    requestAnimationFrame(render);
}
