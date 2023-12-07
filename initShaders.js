"use strict";

/*
    CS 435, Project #7, Alyssa Gabrielson, Our Solar System Interactive Program
    3D models of 8 planets and the Sun
    Uses 2D canvas to display labels accordingly with 3D world system
    Textures mapped onto all, including sky box texture, view adjusted to be within
    Uses sun as position for light source
    Model transformations with user interaction
*/

// Sphere class
function sphere(numSubdivisions) {

    var subdivisions = 3;
    if(numSubdivisions) subdivisions = numSubdivisions;
    
    var data = {};
    
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
var ctx; 

var modelViewMatrix, projectionMatrix;
var viewerPos;
var program1, program2, program3;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1; // start rotating on y axis first
var theta =vec3(0, 0, 0);
var speed = 0.25; // speed of rotation
var scaleFactor = 1.0; // Initial scale factor

var flag = true; // controls toggle of rotation
var flagLabels = true; // controls toggle of name labels

var points = [];
var normals = [];
var colors = [];
var texCoord = [];

// planet objects
var sun, mercury, venus, earth, mars, jupiter, saturn, rings, uranus, neptune, skyBox;
// planet vertices count
var ncube, nsun, nmercury, nvenus, nearth, nmars, njupiter, nsaturn, nuranus, nneptune, nskybox, nrings;
var skyboxScale = 2.2;
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

// Concatenate vertices, normals, colors, and texture coordinates to respective arrays
function createPlanet(planet) {
    points = points.concat(planet.TriangleVertices);
    normals = normals.concat(planet.TriangleNormals);
    colors = colors.concat(planet.TriangleVertexColors);
    texCoord = texCoord.concat(planet.TextureCoordinates);
}

// Set up light properties
function light() {
    var data = {};
    data.lightPosition = vec4(0.0, 0.0, 0.0, 1.0 ); // position light at sun
    data.lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
    data.lightDiffuse = vec4( 0.1, 0.1, 0.1, 1.0 );
    data.lightSpecular = vec4(0.1, 0.1, 0.1, 1.0 );
    data.lightShineness = 10;
    return data;
  }

  // Set up material properties
  function material() {
    var data  = {};
    data.materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
    data.materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
    data.materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
    data.materialShininess = 100.0;
    return data;
  }

  // Positions for planet labels
  const planetPositions =  [
    vec4(-0.18, -0.0, 0.2, 1.0), // Mercury's position
    vec4(-0.289, 0.0, 0.53, 1.0), // Venus's position
    vec4(0.16, 0.0, 0.48, 1.0), // Earth's position
    vec4(-0.24, 0.0, -0.28, 1.0), // mars
    vec4(0.62, 0.0, -0.54, 1.0), // jupiter
    vec4(-0.17, 0.0, -0.92, 1.0), // saturn
    vec4(1.11, 0.0, 0.4, 1.0), // uranus
    vec4(-1.15, 0.0, -0.44, 1.0) // neptune
  ];

  // Create each planet
  function initPlanets() { 
    sun = sphere(5);
    sun.scale(0.18 * scaleFactor, 0.18 * scaleFactor, 0.18 * scaleFactor);
    sun.translate(0.0, 0.0, 0.0);

    mercury = sphere(5);
    mercury.scale(0.02 * scaleFactor, 0.02 * scaleFactor, 0.02 * scaleFactor);
    mercury.translate(-0.2, -0.0, 0.2);

    venus = sphere(5);
    venus.scale(0.03 * scaleFactor, 0.03 * scaleFactor, 0.03 * scaleFactor);
    venus.translate(-0.27, 0.0, 0.27);
    venus.rotate(-90.0, [ 0, 1, 0]);

    earth = sphere(5);
    earth.scale(0.035 * scaleFactor, 0.035 * scaleFactor, 0.035 * scaleFactor);
    earth.translate(-0.35, 0.0, 0.35);
    earth.rotate(60.0, [ 0, 1, 0]);

    mars = sphere(5);
    mars.scale(0.02 * scaleFactor, 0.02 * scaleFactor, 0.02 * scaleFactor);
    mars.translate(-0.43, 0.0, 0.43);
    mars.rotate(15.0, [ 0, 1, 0]);

    jupiter = sphere(5);
    jupiter.scale(0.08 * scaleFactor, 0.08 * scaleFactor, 0.08 * scaleFactor);
    jupiter.translate(-0.54, 0.0, 0.54);
    jupiter.rotate(180.0, [ 0, 1, 0]);

    saturn = sphere(5);
    saturn.scale(0.07 * scaleFactor, 0.07 * scaleFactor, 0.07 * scaleFactor);
    saturn.translate(-0.69, 0.0, 0.69);
    saturn.rotate(-120.0, [ 0, 1, 0]);

    rings = sphere(5);
    rings.scale(0.1 * scaleFactor, 0.01 * scaleFactor, 0.1 * scaleFactor);
    rings.rotate(45.0, [ 1, 1, 1]);
    rings.translate(-0.69, 0.0, 0.69);
    rings.rotate(-120.0, [ 0, 1, 0]);

    uranus = sphere(5);
    uranus.scale(0.05 * scaleFactor, 0.05 * scaleFactor, 0.05 * scaleFactor);
    uranus.translate(-0.8, 0.0, 0.8);
    uranus.rotate(-245.0, [ 0, 1, 0]);

    neptune = sphere(5);
    neptune.scale(0.048 * scaleFactor, 0.048 * scaleFactor, 0.048 * scaleFactor);
    neptune.translate(-0.9, 0.0, 0.9);
    neptune.rotate(295.0, [ 0, 1, 0]);

    skyBox = sphere(5);
    skyBox.scale(skyboxScale, skyboxScale, skyboxScale);
    skyBox.translate(0.0, 0.0, 0.0);

// put object data in arrays that will be sent to shaders
    points = [];
    normals = [];
    colors = [];
    texCoord = [];
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
  }

  // initialize buffers with data
  function initBuffers() {
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW );

    var texCoordLoc = gl.getAttribLocation( program1, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
  }

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    // look up the text canvas and make a 2D context for canvas
    var textCanvas = document.querySelector("#text");
    ctx = textCanvas.getContext("2d");

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

// declare planets, relative sizes and distance from sun
    initPlanets();

// light, material, texture
    var myMaterial = material();
    var myLight = light();

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
    initBuffers();

    // Load texture images
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
    projectionMatrix = ortho(-1.35, 1.35, -1.35, 1.35, -1.3, skyboxScale);

// products of material and light properties
    var ambientProduct = mult(myLight.lightAmbient, myMaterial.materialAmbient);
    var diffuseProduct = mult(myLight.lightDiffuse, myMaterial.materialDiffuse);
    var specularProduct = mult(myLight.lightSpecular, myMaterial.materialSpecular);

// listeners
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonTLabels").onclick = function(){flagLabels = !flagLabels;};
    document.getElementById("ButtonSlow").onclick = function(){if(speed>0.2) speed -= 0.1};
    document.getElementById("ButtonFast").onclick = function(){if(speed<2.0) speed += 0.1};
    document.getElementById("ButtonScaleUp").onclick = function () {
        if(scaleFactor < 1.4) scaleFactor += 0.1; // Increase scale by 0.1
        initPlanets();
        initBuffers();
    };
    document.getElementById("ButtonScaleDown").onclick = function () {
        if (scaleFactor > 0.2) scaleFactor -= 0.1; // Decrease scale by 0.1
        initPlanets();
        initBuffers();
    };

// uniforms for each program object
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

var defaultScreenX, defaultScreenY = 1024;
function worldToScreenCoordinates(worldCoordinates) {
    // Apply the model-view matrix to the world coordinates
    var eyeCoordinates = mult(modelViewMatrix, worldCoordinates);
    // Apply the projection matrix
    var clipCoordinates = mult(projectionMatrix, eyeCoordinates);

    // Check if (clipCoordinates[3]) is zero
    if (clipCoordinates[3] !== 0) {
        // Perspective division (convert to normalized device coordinates)
        var normalizedDeviceCoordinates = vec3(
            clipCoordinates[0] / clipCoordinates[3],
            clipCoordinates[1] / clipCoordinates[3],
            clipCoordinates[2] / clipCoordinates[3]
        );

        // Convert to screen coordinates
        var screenX = ((normalizedDeviceCoordinates[0] + 1) / 2) * canvas.width;
        var screenY = ((1 - normalizedDeviceCoordinates[1]) / 2) * canvas.height;

        return [screenX, screenY];
    } else {
        // Return a default value incase divide by 0 happens
        return [defaultScreenX, defaultScreenY];
    }
}

// Function to draw name labels on 2D canvas
function drawLabels(planetPos, i) {
    // Save the current transformation matrix
    ctx.save();

    // Set the arrow position based on the initial position of Earth
    var planetScreenPos = worldToScreenCoordinates(planetPos);

    // Define an offset for the arrow from the Earth's position
    var arrowOffsetX = 0; // Adjust as needed
    var arrowOffsetY = 0; // Adjust as needed
    // console.log(planetScreenPos[0]);
    // console.log(planetScreenPos[1]);

    // Calculate the arrow position on 2D canvas
    var arrowX = planetScreenPos[0] + arrowOffsetX;
    var arrowY = planetScreenPos[1] + arrowOffsetY;

    // Translate to the arrow's position on 2D canvas
    ctx.translate(arrowX, arrowY);

    // Draw an arrow
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 5);
    ctx.lineTo(5, -5);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    // Draw the label for each planet
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    if (i === 0) ctx.fillText("Mercury", 15, 5);
    if (i === 1) ctx.fillText("Venus", 15, 5);
    if (i === 2) ctx.fillText("Earth", 15, 5);
    if (i === 3) ctx.fillText("Mars", 15, 5);
    if (i === 4) ctx.fillText("Jupiter", 15, 5);
    if (i === 5) ctx.fillText("Saturn", 15, 5);
    if (i === 6) ctx.fillText("Uranus", 15, 5);
    if (i === 7) ctx.fillText("Neptune", 15, 5);

    ctx.restore();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//update rotation angles and form modelView matrix

    if(flag) theta[axis] += speed;

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0) ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0) ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1) ));
    if (flagLabels) {
        for (let i = 0; i < planetPositions.length; i++) {
            drawLabels(planetPositions[i], i);
        }
    }

    // Apply scaling to the modelViewMatrix
    // Unused; don't want skybox to be affected
    // modelViewMatrix = mult(modelViewMatrix, scale(scaleFactor, scaleFactor, scaleFactor));

    gl.useProgram(program1);
    gl.uniformMatrix4fv( gl.getUniformLocation(program1,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    // Draw all planets with respective texture
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
