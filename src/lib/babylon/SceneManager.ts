import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { TreeManager } from './TreeManager';
import type { KGNode } from '$lib/data/buildKGGraph';


export class SceneManager {
  canvas: HTMLCanvasElement;
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  light: BABYLON.HemisphericLight;
  guiTexture: GUI.AdvancedDynamicTexture;

  enableCameraMove(enable: boolean) {
    if (enable) this.camera.attachControl(this.canvas, true);
    else this.camera.detachControl();
  }

  onPointerDown: Map<string, ((evt: BABYLON.IPointerEvent, pickInfo: BABYLON.PickingInfo) => void)> = new Map();
  onPointerMove: Map<string, ((evt: BABYLON.IPointerEvent, pickInfo: BABYLON.PickingInfo) => void)> = new Map();

  treeManager: TreeManager;

  constructor(canvas: HTMLCanvasElement, node: KGNode) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.constantlyUpdateMeshUnderPointer = true;
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      0,
      200,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    this.camera.setPosition(new BABYLON.Vector3(0, 0, -15));
    this.camera.attachControl(canvas, true);
    this.light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 3, 2),
      this.scene
    );
    this.light.intensity = 0;
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    this.scene.getEngine().setHardwareScalingLevel(1 / window.devicePixelRatio);
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
    this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // this.guiTexture.rootContainer.scaleX = 1 / window.devicePixelRatio;
    // this.guiTexture.rootContainer.scaleY = 1 / window.devicePixelRatio;
    this.scene.onPointerDown = (evt, pickInfo) => {
      [...this.onPointerDown.values()].forEach((f) => f(evt, pickInfo));
    }
    this.scene.onPointerMove = (evt, pickInfo) => {
      [...this.onPointerMove.values()].forEach((f) => f(evt, pickInfo));
    }

    this.treeManager = new TreeManager(this, node);
  }
}
