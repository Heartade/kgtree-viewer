import type { KGNode } from "$lib/data/buildKGGraph";
import { buildKGGraphStatic } from "$lib/data/buildKGGraphStatic";

let _kgNode: KGNode | undefined = undefined;

export async function load() {
  const kgNode = _kgNode ? _kgNode : await buildKGGraphStatic();
  _kgNode = kgNode;
  return {
    body: {
      kgNode
    }
  }
}