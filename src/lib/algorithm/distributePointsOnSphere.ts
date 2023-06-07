import * as BABYLON from 'babylonjs';

export default function distributePointsOnSphere(numPoints: number, radius: number, segmentAngle: number = Math.PI) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < numPoints; i++) {
    const z = 1 - ((i / (numPoints - 1)) * 2) * (segmentAngle / Math.PI); // Ranges from 1 to -1
    const theta = goldenAngle * i;

    const radiusAtZ = Math.sqrt(1 - z * z);
    const x = Math.cos(theta) * radiusAtZ;
    const y = Math.sin(theta) * radiusAtZ;

    points.push(new BABYLON.Vector3(x * radius, y * radius, z * radius ));
  }

  return points;
}