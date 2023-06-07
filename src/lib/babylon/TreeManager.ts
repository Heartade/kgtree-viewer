import type { KGNode } from '$lib/data/buildKGGraph';
import type { SceneManager } from './SceneManager';
import { Tree } from './Tree';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

class Link {
	rect: GUI.Rectangle;
	textBlock: GUI.TextBlock;
	treeManager: TreeManager;
	constructor(treeManager: TreeManager) {
		const text = '_link';
		this.treeManager = treeManager;
		this.rect = new GUI.Rectangle(`rect:${text}`);
		this.rect.width = '36px';
		this.rect.height = '36px';
		this.rect.cornerRadius = 4;
		this.rect.color = 'white';
		this.rect.thickness = 2;
		this.rect.background = 'white';
		this.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.rect.left = '271px';
		this.rect.isPointerBlocker = true;
		this.textBlock = new GUI.TextBlock(`text:${text}`);
		this.textBlock.fontSize = 20;
		this.textBlock.width = '100%';
		this.textBlock.height = '100%';
		this.textBlock.color = 'black';
		this.textBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.textBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		this.textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.textBlock.left = '0px';
		this.textBlock.top = '0px';
		this.textBlock.text = '🔗';
		this.rect.addControl(this.textBlock);
		this.rect.isPointerBlocker = true;
		this.rect.hoverCursor = 'pointer';
		this.rect.onPointerClickObservable.add(() => {
			if (this.treeManager.selectedNode) {
				const uri = encodeURIComponent(this.treeManager.selectedNode);
				window.open(`https://en.wikipedia.org/wiki/${uri}`);
			}
		});
	}
}
class Search {
	rect: GUI.Rectangle;
	textBlock: GUI.TextBlock;
	treeManager: TreeManager;

	constructor(treeManager: TreeManager) {
		const text = '_search';
		this.treeManager = treeManager;
		this.rect = new GUI.Rectangle(`rect:${text}`);
		this.rect.width = '64px';
		this.rect.height = '64px';
		this.rect.cornerRadius = 8;
		this.rect.color = 'white';
		this.rect.thickness = 2;
		this.rect.background = 'white';
		this.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		this.rect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		this.rect.paddingRight = '8px';
		this.rect.paddingTop = '8px';
		this.rect.isPointerBlocker = true;
		this.textBlock = new GUI.TextBlock(`text:${text}`);
		this.textBlock.fontSize = 40;
		this.textBlock.width = '100%';
		this.textBlock.height = '100%';
		this.textBlock.color = 'black';
		this.textBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.textBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		this.textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.textBlock.left = '0px';
		this.textBlock.top = '0px';
		this.textBlock.text = '🔍';
		this.rect.addControl(this.textBlock);
		this.rect.isPointerBlocker = true;
		this.rect.hoverCursor = 'pointer';
		this.rect.onPointerClickObservable.add(() => {
			this.treeManager.searchBox.doSearch();
		});
	}
}
class SearchBox {
	panel: GUI.StackPanel;
	rect: GUI.Rectangle;
	inputBox: GUI.InputText;
	textBlock: GUI.TextBlock;
	textBlocks: GUI.Rectangle[] = [];
	treeManager: TreeManager;
	getCandidates() {
		const result = this.inputBox.text.length > 0 ? [...this.treeManager.treeMap.keys()].filter((key) =>
			key.toLowerCase().includes(this.inputBox.text.toLowerCase())
		) : [];
		return result;
	}
	doSearch() {
		if (this.inputBox.text.length > 0) {
			const result = this.getCandidates();
			if (result.length > 0) {
        this.treeManager.updateSelectedNode(result[0]);
			}
      this.inputBox.text = '';
		}
	}
	constructor(treeManager: TreeManager) {
		const text = '_search';
		this.treeManager = treeManager;
		this.panel = new GUI.StackPanel(`panel:${text}`);
		this.textBlock = new GUI.TextBlock(`text:${text}`);
		this.rect = new GUI.Rectangle(`rect:${text}`);
		this.panel.width = '384px';
		this.rect.width = '100%';
		this.rect.height = '64px';
		this.rect.cornerRadius = 8;
		this.rect.background = 'rgba(255, 255, 255, 1)';
		this.rect.setPaddingInPixels(4);
		this.panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		this.panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		this.panel.paddingRight = '72px';
		this.panel.paddingTop = '4px';
		this.panel.isVertical = true;
		// this.panel.background = 'rgba(255, 255, 255, 0.5)';

		this.rect.isPointerBlocker = true;
		this.inputBox = new GUI.InputText(`input:${text}`);
		this.inputBox.fontSize = 32;
		this.inputBox.width = '100%';
		this.inputBox.height = '100%';
		this.inputBox.background = 'white';
		this.inputBox.color = 'black';
		this.inputBox.focusedBackground = 'white';
		this.inputBox.placeholderColor = 'gray';
		this.inputBox.placeholderText = 'Search...';
		this.inputBox.thickness = 0;
		this.inputBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.inputBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.inputBox.left = '0px';
		this.inputBox.top = '0px';

		this.panel.addControl(this.rect);
		this.rect.addControl(this.inputBox);
		this.rect.isPointerBlocker = true;
		this.inputBox.onKeyboardEventProcessedObservable.add((eventData) => {
			if (eventData.key === 'Enter') {
				this.doSearch();
			}
		});
		this.inputBox.onTextChangedObservable.add(() => {
			this.textBlocks.forEach((textBlock) => {
				this.panel.removeControl(textBlock);
			});
			this.textBlocks = this.getCandidates().slice(0, 10).map((candidate) => {
        const blockRect = new GUI.Rectangle(`rect:${candidate}`);
        blockRect.width = '100%';
        blockRect.height = '28px';
        blockRect.paddingTop = '4px';
        blockRect.cornerRadius = 16;
        blockRect.background = 'rgba(255, 255, 255, 0.8)';
				const block = new GUI.TextBlock(`text:${candidate}`, candidate);
        blockRect.addControl(block);
				this.panel.addControl(blockRect);
        block.fontSize = 18;
        block.width = '100%';
        block.height = '28px';
        blockRect.isPointerBlocker = true;
        blockRect.hoverCursor = 'pointer';
        blockRect.onPointerEnterObservable.add(() => {
          blockRect.background = 'rgba(255, 255, 255, 0.9)';
        });
        blockRect.onPointerOutObservable.add(() => {
          blockRect.background = 'rgba(255, 255, 255, 0.8)';
        });
        blockRect.onPointerClickObservable.add(() => {
          this.inputBox.text = candidate;
          this.doSearch();
        });
				return blockRect;
			});
      this.textBlocks[0].children.forEach((v)=>(v.fontStyle = 'bold'));
		});
	}
}

class TextBox {
	rect: GUI.Rectangle;
	textBlock: GUI.TextBlock;
	treeManager: TreeManager;
	constructor(text: string | undefined, treeManager: TreeManager) {
		const renderedText = text ?? 'Select node...';
		this.treeManager = treeManager;
		this.rect = new GUI.Rectangle(`rect:${renderedText}`);
		this.rect.width = '256px';
		this.rect.height = '32px';
		this.rect.cornerRadius = 4;
		this.rect.color = 'white';
		this.rect.thickness = 2;
		this.rect.background = 'white';
		this.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.rect.left = '10px';
		this.rect.isPointerBlocker = true;
		this.textBlock = new GUI.TextBlock(`text:${renderedText}`);
		this.textBlock.fontSize = 16;
		this.textBlock.width = '100%';
		this.textBlock.height = '100%';
		this.textBlock.color = 'black';
		this.textBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.textBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		this.textBlock.left = '0px';
		this.textBlock.top = '0px';
		this.textBlock.text = renderedText;
		this.rect.addControl(this.textBlock);
		if (text) {
			this.rect.onPointerClickObservable.add(() => {
				this.treeManager.updateSelectedNode(renderedText);
			});
			this.rect.hoverCursor = 'pointer';
		}
	}
}

export class TreeManager {
	root: Tree;
	treeMap: Map<string, Tree>;
	sceneManager: SceneManager;
	hoverNode: string | undefined = undefined;
	selectedNode: string | undefined = undefined;
	nodeRects: TextBox[] = [];
	hoverRect: TextBox;
	// selectedNodeInfo: GUI.TextBlock;
	scrollerView: GUI.ScrollViewer;
	scrollerPanel: GUI.Container;
	link: Link;
	search: Search;
	searchBox: SearchBox;

	initHoverRect() {
		const hoverRect = new TextBox(undefined, this);
		hoverRect.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		hoverRect.rect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		hoverRect.rect.top = '-150px';
		hoverRect.rect.background = 'rgba(255, 255, 255, 0)';
		hoverRect.rect.thickness = 0;
		hoverRect.rect.height = '28px';
		hoverRect.rect.cornerRadius = 50;
		hoverRect.rect.isPointerBlocker = false;
		hoverRect.textBlock.fontStyle = 'italic';
		hoverRect.textBlock.text = '';
		return hoverRect;
	}

	onPointerMove(evt: BABYLON.IPointerEvent, pickInfo: BABYLON.PickingInfo) {
		if (pickInfo.hit) {
			const mesh = pickInfo.pickedMesh;
			if (mesh) {
				const nodeName = mesh.name.split('::')[0];
				if (nodeName !== this.hoverNode) {
					this.hoverRect.rect.top = `${evt.offsetY * window.devicePixelRatio - 40}px`;
					this.hoverRect.rect.left = `${
						evt.offsetX * window.devicePixelRatio - this.hoverRect.rect.widthInPixels / 2
					}px`;
					this.updateHoverNode(nodeName);
				}
			} else {
				this.updateHoverNode(undefined);
			}
		} else {
			this.updateHoverNode(undefined);
		}
	}

	onPointerDown(evt: BABYLON.IPointerEvent, pickInfo: BABYLON.PickingInfo) {
		if (pickInfo.hit) {
			const mesh = pickInfo.pickedMesh;
			if (mesh) {
				const nodeName = mesh.name.split('::')[0];
				if (nodeName !== this.selectedNode) {
					this.updateSelectedNode(nodeName);
				}
			}
		}
	}

	private updateHoverNode(nodeName: string | undefined) {
		if (this.hoverNode !== undefined) {
			this.treeMap.get(this.hoverNode)?.setHover(false);
		}
		if (nodeName !== undefined) {
			const node = this.treeMap.get(nodeName);
			if (node) {
				this.hoverNode = nodeName;
				node.setHover(true);
				this.hoverRect.rect.background = 'rgba(255, 255, 255, 0.85)';
				this.hoverRect.textBlock.text = node.name;
			} else {
				this.hoverRect.rect.background = 'rgba(255, 255, 255, 0)';
				this.hoverRect.textBlock.text = '';
			}
		} else {
			this.hoverRect.rect.background = 'rgba(255, 255, 255, 0)';
			this.hoverRect.textBlock.text = '';
		}
	}

	private initSelectedNode() {
		this.nodeRects = [];
		const rect = new TextBox(undefined, this);
		this.sceneManager.guiTexture.addControl(rect.rect);
		rect.rect.top = '0px';
		rect.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		rect.textBlock.fontSize = 17;
		rect.textBlock.fontStyle = 'italic';
		rect.rect.height = '36px';
		// rect.rect.background = node.hoverUiColor;
		rect.textBlock.color = 'black';
		this.nodeRects.push(rect);
	}

	private displaySelectedNode(node: Tree) {
		const parents: Tree[] = [];
		const children = node.children;
		const traverseParent = (node: Tree) => {
			parents.push(node);
			if (node.parent) {
				traverseParent(node.parent);
			}
		};
		traverseParent(node);

		this.nodeRects.forEach((rect) => {
			rect.rect.dispose();
			rect.textBlock.dispose();
		});
		this.nodeRects = [];
		const rect = new TextBox(node.name, this);
		this.sceneManager.guiTexture.addControl(rect.rect);
		rect.rect.top = '0px';
		rect.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		rect.textBlock.fontSize = 17;
		rect.textBlock.fontStyle = 'bold';
		rect.rect.height = '36px';
		rect.rect.background = node.hoverUiColor;
		rect.textBlock.color = 'black';
		this.nodeRects.push(rect);

		parents.slice(1).forEach((parent, index) => {
			const rect = new TextBox(parent.name, this);
			this.sceneManager.guiTexture.addControl(rect.rect);
			rect.rect.top = `-${(index + 1) * 36 + 2}px`;
			rect.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			rect.textBlock.fontSize = 16;
			rect.textBlock.fontStyle = 'bold';
			rect.rect.background = parent.parentSelectedUiColor;
			rect.textBlock.color = 'white';
			this.nodeRects.push(rect);
		});
		const scrollerHeight = Math.min(256, children.length * 36);
		this.scrollerView.height = `${scrollerHeight}px`;
		this.scrollerView.top = `${scrollerHeight * 0.5 + 20}px`;
		children.forEach((child, index) => {
			const rect = new TextBox(child.name, this);
			this.scrollerPanel.addControl(rect.rect);
			rect.rect.left = '5px';
			rect.rect.top = `${index * 36 + 5}px`;
			rect.rect.paddingTopInPixels = 2;
			rect.rect.paddingBottomInPixels = 2;
			rect.rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			rect.textBlock.fontSize = 16;
			rect.textBlock.fontStyle = 'bold';
			rect.rect.background = child.parentSelectedUiColor;
			rect.textBlock.color = 'white';
			this.nodeRects.push(rect);
		});
	}

	updateSelectedNode(nodeName: string) {
		this.link.rect.isEnabled = false;
		if (this.selectedNode !== undefined) {
			this.treeMap.get(this.selectedNode)?.setSelected(false);
		}
		const node = this.treeMap.get(nodeName);
		if (node) {
			this.selectedNode = nodeName;
			this.link.rect.isEnabled = true;
			this.link.rect.isVisible = true;
			node.setSelected(true);
			this.displaySelectedNode(node);
			const nodePosition = node.nodeMesh.absolutePosition.clone();
			const normalizedPosition = nodePosition.clone().normalize();
			BABYLON.Animation.CreateAndStartAnimation(
				'selected-node-info-animation',
				this.sceneManager.camera,
				'position',
				30,
				30,
				this.sceneManager.camera.position,
				normalizedPosition.scale(nodePosition.length() + 2),
				BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
				undefined,
				undefined,
				this.sceneManager.scene
			);
			BABYLON.Animation.CreateAndStartAnimation(
				'selected-node-info-animation-2',
				this.sceneManager.camera,
				'upVector',
				30,
				20,
				this.sceneManager.camera.upVector.clone(),
				node.nodeMesh.up,
				BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
				undefined,
				undefined,
				this.sceneManager.scene
			);
		}
	}

	constructor(sceneManager: SceneManager, rootNode: KGNode) {
		const treeMap: Map<string, Tree> = new Map();
		const traverse = (node: KGNode, parent: Tree | undefined) => {
			const tree = new Tree(sceneManager, parent, node.root);
			treeMap.set(node.root, tree);
			node.children.forEach((child) => {
				tree.children.push(traverse(child, tree));
			});
			return tree;
		};
		const root: Tree = traverse(rootNode, undefined);
		root.updatePositions();
		this.sceneManager = sceneManager;
		this.root = root;
		this.treeMap = treeMap;
		this.hoverRect = this.initHoverRect();
		this.link = new Link(this);
		this.link.rect.isEnabled = false;
		this.link.rect.isVisible = false;
		this.search = new Search(this);
		this.searchBox = new SearchBox(this);
		this.sceneManager.guiTexture.addControl(this.searchBox.panel);
		this.sceneManager.guiTexture.addControl(this.search.rect);
		this.sceneManager.guiTexture.addControl(this.link.rect);
		this.sceneManager.guiTexture.addControl(this.hoverRect.rect);
		const scroller = new GUI.ScrollViewer('scroll-viewer');
		this.scrollerView = scroller;
		scroller.width = '274px';
		scroller.height = 0;
		scroller.top = '134px';
		scroller.left = '5px';
		scroller.background = 'rgba(255, 255, 255, 0.2)';
		scroller.thickness = 0;
		scroller.barSize = 8;
		scroller.barColor = 'rgba(255, 255, 255, 1)';
		scroller.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		scroller.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		scroller.isPointerBlocker = true;
		const scrollerPanel = new GUI.StackPanel('scroller-panel');
		this.scrollerPanel = scrollerPanel;
		// scrollerPanel.padd = 5;

		scroller.addControl(this.scrollerPanel);
		this.sceneManager.guiTexture.addControl(scroller);
		this.initSelectedNode();

		// this.selectedNodeInfo = this.initSelectedNodeInfo();
		// guiBox.addControl(this.selectedNodeInfo);

		this.sceneManager.onPointerMove.set('tree-manager', (evt, pickInfo) =>
			this.onPointerMove(evt, pickInfo)
		);
		this.sceneManager.onPointerDown.set('tree-manager', (evt, pickInfo) =>
			this.onPointerDown(evt, pickInfo)
		);
	}
}
