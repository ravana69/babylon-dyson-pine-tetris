const cubeSize= 500;
       var canvas = document.getElementById("renderCanvas");
       var engine = new BABYLON.Engine(canvas, true,  { 
         preserveDrawingBuffer: true,  stencil: true, disableWebGL2Support: true});
       var scene = new BABYLON.Scene(engine);
        
        //Create light
       var light2 = new BABYLON.HemisphericLight('light1', 
                      new BABYLON.Vector3(0, 1, 0), scene);
       var light2 = new BABYLON.HemisphericLight('light1', 
                      new BABYLON.Vector3(0, -1, 0), scene);
        
      //Create an Arc Rotate Camera
           var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI , 1.0, 110,                             BABYLON.Vector3.Zero(), scene);
               camera.attachControl(canvas, true);
        	
            var skyBox = BABYLON.Mesh.CreateBox("skyBox", cubeSize, scene);
            var cubeMaterial = new BABYLON.StandardMaterial("skyBoxMat", scene);
            skyBox.material=cubeMaterial;
            cubeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            cubeMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        
        	let images =[
    "https://assets.codepen.io/222599/image+107.jpg", //Front
    "https://assets.codepen.io/222599/image+108.jpg", //Left
    "https://assets.codepen.io/222599/image+109.jpg", //top
    "https://assets.codepen.io/222599/image+110.jpg", //bottom
    "https://assets.codepen.io/222599/image+112.jpg", //back
    "https://assets.codepen.io/222599/image+111.jpg"] //right

        	//front
        	var frontMaterial=new BABYLON.StandardMaterial("frontMaterial",scene);
        	frontMaterial.diffuseTexture=new BABYLON.Texture(images[0], scene);
        	frontMaterial.diffuseTexture.uScale = 	frontMaterial.diffuseTexture.vScale = -1;
            frontMaterial.backFaceCulling = false
        
        	//back
        var backMaterial=new BABYLON.StandardMaterial("backMaterial",scene);
        backMaterial.diffuseTexture=new BABYLON.Texture(images[4], scene);
        backMaterial.diffuseTexture.uScale = backMaterial.diffuseTexture.vScale = 1;
            backMaterial.backFaceCulling = false
        
           //left
        var leftMaterial=new BABYLON.StandardMaterial("leftMaterial",scene);
        leftMaterial.diffuseTexture=new BABYLON.Texture(images[1], scene);
        leftMaterial.diffuseTexture.wAng = 0.5*Math.PI;
        leftMaterial.backFaceCulling = false
        
        var rightMaterial=new BABYLON.StandardMaterial("rightMaterial",scene);
        rightMaterial.diffuseTexture=new BABYLON.Texture(images[5], scene);
        rightMaterial.diffuseTexture.wAng = 0.5*Math.PI;
        rightMaterial.backFaceCulling = false
        
        	//top
        var topMaterial=new BABYLON.StandardMaterial("topMaterial",scene);
        topMaterial.diffuseTexture = new BABYLON.Texture(images[2], scene);
        topMaterial.diffuseTexture.wAng = -0.5 * Math.PI;
        topMaterial.backFaceCulling = false
        	
        	//bottom
        var bottomMaterial=new BABYLON.StandardMaterial("bottomMaterial",scene);
        bottomMaterial.diffuseTexture = new BABYLON.Texture(images[3], scene);
        bottomMaterial.diffuseTexture.wAng = 0.5 * Math.PI;
        bottomMaterial.diffuseTexture.uScale = 1;
        bottomMaterial.backFaceCulling = false
        
        	//put into one
        var multiMaterial =new BABYLON.MultiMaterial("cubetexture",scene);
        multiMaterial.subMaterials.push(
                frontMaterial, backMaterial ,
                leftMaterial , rightMaterial ,
                topMaterial, bottomMaterial);
        
        	//apply material
        skyBox.subMeshes=[];
        var verticesCount=skyBox.getTotalVertices();
        skyBox.subMeshes.push(
          new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, skyBox) ,
          new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, skyBox),
        	new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, skyBox),
        	new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, skyBox),
        	new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, skyBox),
        	new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, skyBox));
        skyBox.material = multiMaterial;
        
      engine.runRenderLoop( ()=> {
        if (scene && scene.activeCamera) {
          scene.render();
        }
      });
        
      // Resize
      window.addEventListener("resize",  ()=> {
        engine.resize();
      });