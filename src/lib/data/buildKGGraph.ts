import type { path } from '@prisma/client';
import prisma from '../prisma';

export type Path = {
	from: string;
	to: string[];
	distance: number;
};

export type KGNode = {
	root: string;
	children: KGNode[];
};

function filterPath(paths: path[]): path[] {
	return paths.filter((path) => {
		const lower = path.source.toLowerCase();
		return !([
			'award',
			'prize',
			'journ',
			'ists',
			'litera',
			'litera',
			'insti',
			'named',
			'organi',
			'departm',
			'educat',
			'stub',
			'century',
			'academy',
			'list',
			'franchise',
			'companies',
			'(',
			'_in_',
			'_on_',
			'_of_',
			'_by_',
			'_about_',
			'_after_'
		].some((v) => lower.includes(v)));
	});
}

async function traverseTree(
	source: string,
	pathId: number,
	depth: number,
	maxDepth: number
): Promise<KGNode> {
	console.log(`traverse ${source}`);
	if (depth >= maxDepth) {
		return {
			root: source,
			children: []
		};
	}
	return await prisma.path
		.findMany({
			where: {
				appendTo: pathId
			}
		})
		.then(async (paths) => {
			const children = await Promise.all(
				filterPath(paths)
					.map(async (path) => await traverseTree(path.source, path.id, depth + 1, maxDepth))
			);
			return {
				root: source,
				children
			};
		});
}

async function getRootNode(target: string, maxDepth: number): Promise<KGNode> {
	return await prisma.path
		.findMany({
			where: {
				target,
				distance: 1
			}
		})
		.then(async (paths) => {
			const children = await Promise.all(
				filterPath(paths).map(async (path) => await traverseTree(path.source, path.id, 1, maxDepth))
			);
			return {
				root: target,
				children
			};
		});
}

export async function buildKGGraph() {
	return await getRootNode('Computer_science', 3);
}