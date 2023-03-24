const BOX_SIZE = 1
 const BOX_DEPTH = 4
 const GROUND_SIZE = 30
 const colors = {
   seaFoam: BABYLON.Color3.FromHexString("#16a085"),
   green: BABYLON.Color3.FromHexString("#27ae60"),
   blue: BABYLON.Color3.FromHexString("#2980b9"),
   purple: BABYLON.Color3.FromHexString("#8e44ad"),
   navy: BABYLON.Color3.FromHexString("#2c3e50"),
   yellow: BABYLON.Color3.FromHexString("#f39c12"),
   orange: BABYLON.Color3.FromHexString("#d35400"),
   red: BABYLON.Color3.FromHexString("#c0392b"),
   white: BABYLON.Color3.FromHexString("#bdc3c7"),
   gray: BABYLON.Color3.FromHexString("#7f8c8d")
 }

 const SHAPES = ["I", "O", "S", "T", "L"]
 var BODIES = { "I": {}, "O": {}, "S": {}, "T": {}, "L": {} }
           
var canvas = document.getElementById("renderCanvas");
        var engine = null;
        var scene = null;
        var sceneToRender = null;
        var createDefaultEngine = ()=>{ 
          return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil:true}); };
       
        var createScene = async  ()=> {
            var scene = new BABYLON.Scene(engine);
            scene.clearColor = colors.navy;
          
                        await Ammo();

            scene.enablePhysics(null, new BABYLON.AmmoJSPlugin());
            //CAMERA
            var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 25, BABYLON.Vector3.Zero(), scene); 
            camera.attachControl(canvas, true);
            camera.setPosition(new BABYLON.Vector3(GROUND_SIZE / 2, GROUND_SIZE / 2, GROUND_SIZE / 2))
            //LIGHT
            var light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
            light.position = new BABYLON.Vector3(0, GROUND_SIZE, 0);
            light.intensity = 0.9
            shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
        
           //MATERIAL
            BODIES["O"].material = createMat(scene, colors.purple)
            BODIES["I"].material = createMat(scene, colors.red)
            BODIES["L"].material = createMat(scene, colors.yellow)
            BODIES["T"].material = createMat(scene, colors.green)
            BODIES["S"].material = createMat(scene, colors.orange)
        
            var grass = new BABYLON.StandardMaterial("grass", scene);
            grass.diffuseTexture = new BABYLON.Texture("https://images.pexels.com/photos/3038740/pexels-photo-3038740.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500");
            grass.diffuseTexture.uScale = 5;
            grass.diffuseTexture.vScale = 5;
        
            var ground = BABYLON.MeshBuilder.CreateBox("ground", { width: GROUND_SIZE, depth: GROUND_SIZE, height: 1 }, scene);
            ground.material = grass;
            ground.receiveShadows = true;
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0 }, scene);
      
              var ticker = 0;
        
                scene.registerBeforeRender(function() {
                    if((ticker++ % 60)) return;
                    for (var ii = 0; ii < 10; ii++) {
                     let nextChar = SHAPES[randomInteger(0, SHAPES.length)]
                                getBody(nextChar, scene, new BABYLON.Vector3(randomInteger(-GROUND_SIZE/2,GROUND_SIZE/2), 
                                GROUND_SIZE/2, 
                                randomInteger(-GROUND_SIZE/2,GROUND_SIZE/2)))
                    }
                });
                scene.registerBeforeRender( ()=> {
                    scene.meshes.forEach( (m)=> {
                        if (m.name=="s" && m.position.y < -10) {
                            m.dispose();
                        }
                    })
                });
          
            
          scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
              case BABYLON.KeyboardEventTypes.KEYDOWN:
                switch (kbInfo.event.keyCode) {
                  case 65:  //A
                    // nextShape.position.z -= 0.1;
                    break
                  case 68: //D
                    // nextShape.position.z += 0.1;
                    break
                  case 87://"W":
                    // nextShape.position.y += 0.1;
                    break
                  case 83: // "S":
                    // nextShape.position.y -= 0.1;
                    break
                  case 32: // "SPACE":
                    let nextChar = SHAPES[randomInteger(0, SHAPES.length)]
                    let nextShape = getBody(nextChar, scene, new BABYLON.Vector3(randomInteger(-GROUND_SIZE/4,GROUND_SIZE/4), 
                                                                                 50, randomInteger(-GROUND_SIZE/4,GROUND_SIZE/4)))
                    // nextShape.rotation.x += Math.PI / 2;
                    break
                }
                break;
            }
          });

            return scene;
        };
        
        var getBody = (nextChar, scene, position = new BABYLON.Vector3(0, 50, 0)) => {
        
            let body
            if (BODIES[nextChar].mesh) {
                body = BODIES[nextChar].mesh.clone("s")
            } else {
                let shape = getShape(nextChar, scene)
                BODIES[nextChar].mesh = shape
                body = BODIES[nextChar].mesh.clone("s")
                body.isVisible = true
            }
  
            body.position = position
            shadowGenerator.addShadowCaster(body);
            return body
        }
        
        var getShape = (shape, scene) => {
        
            switch (shape) {
                case "O":
                    var boxO = BABYLON.MeshBuilder.CreateBox("boxO", { height: BOX_DEPTH/2, width: BOX_SIZE, depth: BOX_DEPTH/2 }, scene);
                    boxO.physicsImpostor = new BABYLON.PhysicsImpostor(boxO, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                    boxO.material = BODIES[shape].material
                    return boxO
        
                case "I":
                    var boxI = BABYLON.MeshBuilder.CreateBox("boxI", { height: BOX_DEPTH, width: BOX_SIZE, depth: BOX_SIZE }, scene);
                    boxI.physicsImpostor = new BABYLON.PhysicsImpostor(boxI, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                    boxI.material = BODIES[shape].material
        
                    return boxI
        
                case "L":
        
                    var boxL = BABYLON.MeshBuilder.CreateBox("boxL", { height: BOX_SIZE, width: BOX_SIZE, depth: BOX_DEPTH }, scene);
                    var boxLTop = BABYLON.MeshBuilder.CreateBox("boxLTop", { height: BOX_SIZE, width: BOX_SIZE, depth: BOX_SIZE }, scene);
                    boxLTop.position.y = BOX_SIZE
                    boxLTop.position.z = BOX_SIZE * 2
                    boxLTop.parent = boxL
        
                    boxLTop.physicsImpostor = new BABYLON.PhysicsImpostor(boxLTop, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                    boxL.physicsImpostor = new BABYLON.PhysicsImpostor(boxL, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                    boxL.material = BODIES[shape].material
                    boxLTop.material = BODIES[shape].material
        
                    return boxL
                    /** 
                    return  BABYLON.Mesh.MergeMeshes([boxL, boxLTop])
                    */
        
                    var subCSG = BABYLON.CSG.FromMesh(boxL).subtract(BABYLON.CSG.FromMesh(boxLTop));
                    var newMesh = subCSG.toMesh("csg", materials[shape], scene);
                    newMesh.position = new BABYLON.Vector3(10, 0, 0);
                    return newMesh
        
                case "T":
                    var boxT = BABYLON.MeshBuilder.CreateBox("boxT", { height: BOX_SIZE, width: BOX_SIZE, depth: BOX_DEPTH }, scene);
                    var boxTBottom = BABYLON.MeshBuilder.CreateBox("box", { height: BOX_SIZE, width: BOX_SIZE, depth: BOX_SIZE }, scene);
                    boxTBottom.position.y = -BOX_SIZE
                    boxTBottom.parent = boxT
        
                    boxT.physicsImpostor = new BABYLON.PhysicsImpostor(boxT, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                    boxTBottom.physicsImpostor = new BABYLON.PhysicsImpostor(boxTBottom, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
        
                    boxT.material = BODIES[shape].material
                    boxTBottom.material = BODIES[shape].material
                    return boxT //BABYLON.Mesh.MergeMeshes([boxT, boxTBottom])
        
                case "S":
                    var boxS = BABYLON.MeshBuilder.CreateBox("boxS", { height: BOX_SIZE, width: BOX_SIZE, depth: BOX_DEPTH / 2 }, scene);
                    var boxSTop = BABYLON.MeshBuilder.CreateBox("boxS", { height: BOX_SIZE, width: BOX_SIZE, depth: BOX_DEPTH / 2 }, scene);
                    boxSTop.position.y = BOX_SIZE
                    boxSTop.position.z = BOX_SIZE
                    boxSTop.parent = boxS
        
                    boxS.physicsImpostor = new BABYLON.PhysicsImpostor(boxS, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
                    boxSTop.physicsImpostor = new BABYLON.PhysicsImpostor(boxSTop, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 }, scene);
        
                    boxS.material = BODIES[shape].material
                    boxSTop.material = BODIES[shape].material
                    return boxS
        
                //return BABYLON.Mesh.MergeMeshes([boxS, boxSTop])
            }
        }
        
         randomInteger=(min, max)=> {
            return Math.floor(Math.random() * (max-min)) + min
        }
        
        var createMat = (scene, color) => {
            var mat = new BABYLON.StandardMaterial("", scene);
            mat.diffuseColor = color;
            mat.specularColor = BABYLON.Color3.FromHexString("#555555");
            mat.specularPower = 1;
            mat.emissiveColor = color // color.clone().scale(0.7);
            mat.backFaceCulling = false;
            return mat;
        }
        
        
    var engine;
    try {
    engine = createDefaultEngine();
    } catch(e) {
    console.log("the available createEngine function failed. Creating the default engine instead");
    engine = createDefaultEngine();
    }
        if (!engine) throw 'engine should not be null.';
        scene = createScene();;
        scene.then(returnedScene => { sceneToRender = returnedScene; });
        

        engine.runRenderLoop(function () {
            if (sceneToRender && sceneToRender.activeCamera) {
                sceneToRender.render();
            }
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });