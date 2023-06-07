import type {KGNode} from './buildKGGraph';
import data from './meiosis.json';

const all_paths = data as {[key: string]: string[]};

function traverseTreeStatic(
  source: string
): KGNode {
  console.log(`traverse ${source}`);
  const paths = all_paths[source];
  return {
    root: source,
    children: paths.map((path) => traverseTreeStatic(path))
  };
}

function getRootNodeStatic(root: string): KGNode {
  return traverseTreeStatic(root);
}

export function buildKGGraphStatic() {
  return getRootNodeStatic('Meiosis');
}