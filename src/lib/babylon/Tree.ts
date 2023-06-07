import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import type { SceneManager } from './SceneManager';
import distributePointsOnSphere from '$lib/algorithm/distributePointsOnSphere';

export class Tree {
	sceneManager: SceneManager;
	depth: number;
	parent: Tree | undefined;
	children: Tree[] = [];
	radius = Math.PI;
	nodeMesh: BABYLON.Mesh;
	pathMesh: BABYLON.Mesh;
	pathMaterial: BABYLON.StandardMaterial;
	center: BABYLON.TransformNode;
	nameText: GUI.TextBlock;
	textContainer: GUI.Rectangle;
	pointContainer: GUI.Rectangle;
	length = 1;
	name: string;

	private getPathMaterial() {
		const material = new BABYLON.StandardMaterial(
			`${this.name}::path-mat`,
			this.sceneManager.scene
		);
		material.emissiveColor = BABYLON.Color3.Gray();
		this.pathMesh.material = material;
		return material;
	}
	private getPathMesh() {
		const mesh = BABYLON.MeshBuilder.CreateBox(
			`${this.name}::path-mesh`,
			{
				size: 1,
				updatable: true
			},
			this.sceneManager.scene
		);
		mesh.parent = this.center;
		mesh.scaling = new BABYLON.Vector3(0.1, 0.1, this.center.position.length());
		mesh.position = new BABYLON.Vector3(0, 0, this.center.position.length() / 2);
		mesh.lookAt(BABYLON.Vector3.Zero());
		mesh.isPickable = true;
		// mesh.addLODLevel(100, null);
		return mesh;
	}

	hoverUiColor: string;
	selectedUiColor: string;
	parentSelectedUiColor: string;
	childSelectedUiColor: string;

	private updateColor() {
		this.pathMaterial.alpha = 1;
		this.nameText.color = 'black';
		this.textContainer.background = 'white';
		this.textContainer.color = 'white';
		this.pointContainer.background = 'rgba(0,0,0,0)';
		this.pointContainer.color = 'white';
		if (this._hover) {
			this.pathMaterial.emissiveColor = new BABYLON.Color3(
				0.5 + this.depth / 10,
				1 - this.depth / 10,
				0.5
			);
			this.textContainer.background = this.hoverUiColor;
			this.nameText.color = 'black';
		} else if (this._selected) {
			this.pathMaterial.emissiveColor = new BABYLON.Color3(this.depth / 5, 1 - this.depth / 5, 0.5);
			this.textContainer.background = this.selectedUiColor;
			this.nameText.color = 'white';
		} else if (this._parentSelected) {
			this.pathMaterial.emissiveColor = new BABYLON.Color3(this.depth / 5, 1 - this.depth / 5, 0.5);
			this.pathMaterial.alpha = 0.5;
			this.textContainer.background = this.parentSelectedUiColor;
			this.nameText.color = 'white';
		} else if (this._childSelected) {
			this.pathMaterial.emissiveColor = new BABYLON.Color3(this.depth / 5, 1 - this.depth / 5, 0.5);
			this.textContainer.background = this.childSelectedUiColor;
			this.nameText.color = 'black';
		} else {
			this.pathMaterial.emissiveColor = BABYLON.Color3.Gray();
		}
	}
	private _hover = false;
	private _childHover = false;
	private _parentHover = false;
	setHover(value: boolean) {
		this._hover = value;
		this.updateColor();
		this.children.forEach((child) => child.setParentHover(value));
		this.parent?.setChildHover(value);
	}
	setChildHover(value: boolean) {
		this._childHover = value;
		this.updateColor();
		this.parent?.setChildHover(value);
	}
	setParentHover(value: boolean) {
		this._parentHover = value;
		this.updateColor();
		this.children.forEach((child) => child.setParentHover(value));
	}
	private _selected = false;
	private _childSelected = false;
	private _parentSelected = false;
	setChildSelected(value: boolean) {
		this._childSelected = value;
		this.updateColor();
		this.parent?.setChildSelected(value);
	}
	setParentSelected(value: boolean) {
		this._parentSelected = value;
		this.updateColor();
		this.children.forEach((child) => child.setParentSelected(value));
	}
	setSelected(value: boolean) {
		this._selected = value;
		this.updateColor();
		this.children.forEach((child) => child.setParentSelected(value));
		this.parent?.setChildSelected(value);
	}

	constructor(sceneManager: SceneManager, parent: Tree | undefined, name = '', length = 3) {
		this.sceneManager = sceneManager;
		this.depth = parent ? parent.depth + 1 : 0;
		this.parent = parent;
		this.name = name;
		this.children = [];
		this.center = new BABYLON.TransformNode(`${name}::center`, sceneManager.scene);
		// this.center.position = BABYLON.Vector3.Zero();

		this.hoverUiColor = `rgba(${128 + this.depth * 25}, ${255 - this.depth * 25}, 128, 1)`;
		this.selectedUiColor = `rgba(${this.depth * 50}, ${255 - this.depth * 50}, 100, 1)`;
		this.parentSelectedUiColor = `rgba(${this.depth * 50}, ${255 - this.depth * 50}, 200, 0.7)`;
		this.childSelectedUiColor = `rgba(${128 + this.depth * 25}, ${255 - this.depth * 25}, 200, 1)`;
		this.nodeMesh = BABYLON.MeshBuilder.CreatePlane(
			`${name}::node-mesh`,
			{ width: 1, height: 0.4, sideOrientation: BABYLON.Mesh.FRONTSIDE },
			sceneManager.scene
		);

		const textTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this.nodeMesh);
		const rect = new GUI.Rectangle(`${name}::rect2`);
		textTexture.addControl(rect);
		rect.width = '95%';
		rect.height = '12%';
		rect.top = '35%';
		rect.scaleY = 2.5;
		rect.thickness = 15;
		rect.background = 'white';
		rect.cornerRadius = 30;
		rect.isPointerBlocker = false;
		rect.alpha = 1;
		this.textContainer = rect;
		const point = new GUI.Rectangle(`${name}::rect3`);
		textTexture.addControl(point);
		point.thickness = 15;
		point.width = 0.18;
		point.height = 0.18;
		point.scaleY = 2.5;
		point.cornerRadius = 100;
		point.color = 'white';
		this.pointContainer = point;

		this.nameText = new GUI.TextBlock(
			`${name}::name-text`,
			name.replaceAll('_', ' ').replaceAll('\\', '')
		);
		rect.addControl(this.nameText);
		this.nameText.width = '100%';
		this.nameText.height = '100%';
		this.nameText.fontSize = 60;
		this.nameText.scaleY = 1;
		this.nameText.scaleX = 1;
		this.nameText.shadowBlur = 0;
		this.nameText.shadowOffsetX = 1;
		this.nameText.shadowOffsetY = 1;
		this.nameText.color = 'black';
		this.nameText.fontStyle = 'bold';
		this.pathMesh = this.getPathMesh();
		this.pathMaterial = this.getPathMaterial();
		if (this.parent === undefined) {
			this.pathMesh.setEnabled(false);
		}
		this.length = length;
		this.center.parent = this.parent?.center || null;
		this.nodeMesh.parent = this.center; //this.parent?.nodeMesh || null;

		this.nodeMesh.position = new BABYLON.Vector3(0, 0, 0.1);

		this.pathMesh.parent = this.parent?.center || null;
	}
	updatePositions() {
		const points = distributePointsOnSphere(this.children.length, this.length, this.radius);
		this.center.lookAt(BABYLON.Vector3.Zero());
		// this.nodeMesh.lookAt(BABYLON.Vector3.Zero());
		this.pathMesh = this.getPathMesh();
		this.pathMaterial = this.getPathMaterial();
		if (this.children.length > 0) {
			points.forEach((point, i) => {
				this.children[i].center.position = point.negate();
				this.children[i].radius = this.radius / this.children.length;
				this.children[i].length = 6 * Math.sqrt(1 + this.depth);
				this.children[i].updatePositions();
			});
		}
	}
}
