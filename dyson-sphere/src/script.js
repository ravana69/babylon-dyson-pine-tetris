const TEXTURE_FOLDER = "https://www.babylonjs-playground.com/textures/"

const GROUND_SIZE = 50
const SKYBOX_SIZE = GROUND_SIZE * 5.0

var quality = 10;
const FUR_TEXTURE =
  "https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

const DOME_TEXTURE =
  "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

const SKYBOX =
  "https://images.pexels.com/photos/3279307/pexels-photo-3279307.jpeg";

// States
var g_timer = null
var animateCamera = true
var shouldAnimate = false

createHemisphere = (scene, outerRadi = 10, innerRadi = 8) =>{
  let detail = 16;
  let outerSphere = BABYLON.MeshBuilder.CreateSphere("outerSphere", {
    diameter: outerRadi * 2,
    segments: detail,
  });
  let innerSphere = BABYLON.MeshBuilder.CreateSphere("innerSphere", {
    diameter: innerRadi * 2,
    segments: detail,
  });
  let box = BABYLON.MeshBuilder.CreateBox(
    "box",
    { size: outerRadi * 2 },
    scene
  );
  box.position.y = outerRadi;

  let hole1 = BABYLON.CSG.FromMesh(outerSphere);
  let hole2 = BABYLON.CSG.FromMesh(innerSphere);
  let hole3 = BABYLON.CSG.FromMesh(box);
  let newHolePlate = hole1.subtract(hole2).subtract(hole3);

  box.dispose();
  innerSphere.dispose();
  outerSphere.dispose();

  let hemiSphere = newHolePlate.toMesh("hemiSphere", null, scene);
  return hemiSphere;
};

// Views
const divFps = document.getElementById("fps");
const canvas = document.getElementById("renderCanvas");

// Essential
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, -10, 0));
scene.clearColor = new BABYLON.Color3.Black()

var ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, -1, 0), scene);
ambientLight.diffuse = new BABYLON.Color3.FromHexString("#F96229"); //(1, 1, 1);
ambientLight.specular = new BABYLON.Color3.FromHexString("#FCE13D");
ambientLight.intensity = 5

var camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
camera.setTarget(new BABYLON.Vector3(0, GROUND_SIZE * .15, 0));
camera.attachControl(canvas, true);
camera.setPosition(new BABYLON.Vector3(-GROUND_SIZE / 2, GROUND_SIZE / 4, -GROUND_SIZE / 2));

camera.upperRadiusLimit = SKYBOX_SIZE / 2;

// Limit camera rotation
// camera.lowerAlphaLimit = -Math.PI / 2;
// camera.upperAlphaLimit = Math.PI / 2;
//camera.upperBetaLimit = Math.PI * .5;

  var gl = new BABYLON.GlowLayer("glow", scene);

  // UNIVERSE
  var universeDome = new BABYLON.PhotoDome(
    "universe",
    SKYBOX,{
      resolution: 64,
      size: SKYBOX_SIZE,
      useDirectMapping: false,
    },
    scene
  );

  // SUN
  BABYLON.ParticleHelper.CreateAsync("sun", scene, true).then((set) => {
    set.systems.forEach((system) => {
      system.maxScaleX = 8;
      system.minScaleX = 5;
      system.updateSpeed = 0.01;
    });
    set.start();
  });

  // Cosmic Ray Material
  let cosRayMaterial = new BABYLON.FurMaterial("CosmicRayMat", scene);
  cosRayMaterial.furLength = 0.1;
  cosRayMaterial.furAngle = 0;
  cosRayMaterial.furColor = new BABYLON.Color3(1, 1, 1);
  cosRayMaterial.diffuseTexture = cosRayMaterial.emissiveTexture =
    new BABYLON.Texture(FUR_TEXTURE, scene);
  cosRayMaterial.furTexture = BABYLON.FurMaterial.GenerateTexture(
    "furTexture",
    scene
  );
  cosRayMaterial.furSpacing = 4;
  cosRayMaterial.furDensity = 3;
  cosRayMaterial.furSpeed = 1500;
  cosRayMaterial.furGravity = new BABYLON.Vector3(0, 0, 0);

  let cosmicRayHS = createHemisphere(scene, 15, 10);
  cosmicRayHS.material = cosRayMaterial;
  BABYLON.FurMaterial.FurifyMesh(cosmicRayHS, quality);
  cosmicRayHS.rotation.x = Math.PI / 4;

  // DYSON HS
  let mirrorMat = new BABYLON.StandardMaterial("mirrorMat", scene);
  mirrorMat.diffuseColor = mirrorMat.emissiveColor = new BABYLON.Color3(
    1,
    1,
    1
  );
  mirrorMat.diffuseTexture = mirrorMat.emissiveTexture = new BABYLON.Texture(
    DOME_TEXTURE,
    scene
  );
  mirrorMat.specularColor = new BABYLON.Color3(0, 0.01, 0);
  mirrorMat.backFaceCulling = false;

  let dysonrHS = createHemisphere(scene, 8, 5);
  dysonrHS.rotation = new BABYLON.Vector3(0, 0, 1);
  dysonrHS.material = mirrorMat;

  // Create the "God Rays" effect (volumetric light scattering)
  var godrays = new BABYLON.VolumetricLightScatteringPostProcess(
    "godrays",
    1.0,
    camera,
    dysonrHS,
    100,
    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
    engine,
    false
  );
  godrays._volumetricLightScatteringRTT.renderParticles = true;
  godrays.exposure = 0.5;
  godrays.decay = 0.96815;
  godrays.weight = 0.98767;
  godrays.density = 0.996;

  // set the godrays texture to be the image.
  godrays.mesh.material.diffuseTexture = new BABYLON.Texture(
    DOME_TEXTURE,
    scene
  );
  godrays.mesh.material.diffuseTexture.hasAlpha = true;

var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

var panel = new BABYLON.GUI.StackPanel();
panel.width = "220px";
panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
advancedTexture.addControl(panel);

var header = new BABYLON.GUI.TextBlock();
header.height = "30px";
header.color = "red";
header.text = "Control";
panel.addControl(header);

var rotateCameraHeader = new BABYLON.GUI.TextBlock();
rotateCameraHeader.height = "19px";
rotateCameraHeader.color = "white";
rotateCameraHeader.text = "Animate Camera: ";
panel.addControl(rotateCameraHeader)

var checkbox = new BABYLON.GUI.Checkbox();
checkbox.width = "20px";
checkbox.height = "20px";
checkbox.isChecked = shouldAnimate;
checkbox.color = "green";
checkbox.onIsCheckedChangedObservable.add((value) => {
    shouldAnimate = value
});
panel.addControl(checkbox);

let time = 0;
scene.registerBeforeRender(() => {
    if (animateCamera && shouldAnimate) {
        camera.alpha += 0.0016
    }
  
    time += 0.005;
    dysonrHS.rotation.x = time / 70;
    dysonrHS.rotation.y = (2 * time) / 3;
    mirrorMat.diffuseTexture.uOffset = time / 20;
    cosmicRayHS.rotation.x = -time / 70;
    cosmicRayHS.rotation.z = -(2 * time) / 3;

});

scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
            if(shouldAnimate) resetTimer();
            break;
        case BABYLON.PointerEventTypes.POINTERUP:
            if(shouldAnimate) startTimer();
            break;
        case BABYLON.PointerEventTypes.POINTERMOVE:
            break;
        default:
            break;
    }
});

engine.runRenderLoop(() => {
    if (scene) scene.render();
    divFps.innerHTML = engine.getFps().toFixed() + " fps";
});

window.addEventListener("resize", () => {
    engine.resize();
});

startTimer = () => {
    g_timer = window.setTimeout(() => {
        animateCamera = true;
    }, 5000);
};

resetTimer = () => {
    clearTimeout(g_timer);
    animateCamera = false;
};

randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
