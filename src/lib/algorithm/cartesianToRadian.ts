import * as BABYLON from 'babylonjs';

export default function cartesianToRadian({x, y, z}: BABYLON.Vector3) {
    const radius = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.acos(y / radius);
    const phi = Math.atan2(z, x);
    return new BABYLON.Vector3(radius, theta, phi).toQuaternion();
}