import * as BABYLON from 'babylonjs';

export default function distributePointsInSphericalSegment(numPoints: number, radius: number, segmentAngle: number) {
  const points = [];
  const segmentRadius = radius * Math.sin(segmentAngle);

  for (let i = 0; i < numPoints; i++) {
    const phi = (2 * Math.PI * i) / numPoints;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let j = 0; j < numPoints; j++) {
      const theta = segmentAngle * (j / (numPoints - 1));
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const x = radius * sinTheta;
      const y = segmentRadius * cosTheta * cosPhi;
      const z = segmentRadius * cosTheta * sinPhi;

      points.push(new BABYLON.Vector3(x, y, z));
    }
  }

  return points;
}