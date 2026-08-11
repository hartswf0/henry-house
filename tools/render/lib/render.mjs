// HENRY HOUSE — progressive accumulation renderer.
//
// SwiftShader gives us WebGL2 with float render targets but no GPU. That is
// fine for stills: instead of one fast frame we integrate many slow ones.
//
// Each pass jitters
//   (a) the camera by a sub-pixel offset          -> clean antialiasing
//   (b) the sun direction inside its angular size -> true penumbra, not a
//                                                    blurred shadow-map edge
//   (c) one extra light sampled over the sky dome -> stochastic skylight, so
//                                                    contact shadows and
//                                                    ambient occlusion fall out
//                                                    of the integration itself
// Averaged over N passes this converges toward a real lighting solution.
//
// SHIFT LENS: architectural photography keeps vertical lines vertical. The
// camera is therefore held perfectly level and the frame is moved by shifting
// the projection matrix, exactly like a tilt-shift lens — never by pitching
// the camera, which splays the verticals and reads as a video-game screenshot.

import * as THREE from 'three';

const ACES = `
vec3 aces(vec3 x){
  const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);
}`;

export function makeShiftCamera({ focalMm = 32, aspect = 1.6, position, target, shift = 0, near = 0.5, far = 6000 }) {
  // 35mm-format vertical FOV from focal length (24mm sensor height)
  const vfov = 2 * Math.atan(24 / (2 * focalMm)) * 180 / Math.PI;
  const cam = new THREE.PerspectiveCamera(vfov, aspect, near, far);
  cam.position.copy(position);
  // Look at a point at the SAME HEIGHT as the camera -> zero pitch -> plumb verticals
  cam.lookAt(new THREE.Vector3(target.x, position.y, target.z));
  cam.updateProjectionMatrix();
  cam.userData.shift = shift;
  applyShift(cam);
  return cam;
}

export function applyShift(cam) {
  cam.updateProjectionMatrix();
  cam.projectionMatrix.elements[9] += cam.userData.shift ?? 0;
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
}

/** Uniform point on a hemisphere oriented +Y, cosine weighted. */
function cosineHemisphere(out) {
  const r = Math.sqrt(Math.random());
  const t = 2 * Math.PI * Math.random();
  out.set(r * Math.cos(t), Math.sqrt(Math.max(0, 1 - r * r)), r * Math.sin(t));
  return out;
}

export class Accumulator {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.w = width; this.h = height;
    const opts = {
      type: THREE.FloatType, format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
      depthBuffer: true, stencilBuffer: false,
    };
    this.frameRT = new THREE.WebGLRenderTarget(width, height, opts);
    this.accumRT = new THREE.WebGLRenderTarget(width, height, { ...opts, depthBuffer: false });

    this.quadScene = new THREE.Scene();
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.addMat = new THREE.ShaderMaterial({
      uniforms: { tFrame: { value: this.frameRT.texture } },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `uniform sampler2D tFrame; varying vec2 vUv;
        void main(){ gl_FragColor = vec4(texture2D(tFrame,vUv).rgb, 1.0); }`,
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
    });
    this.addQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.addMat);
    this.addQuad.frustumCulled = false;
    this.quadScene.add(this.addQuad);

    this.outScene = new THREE.Scene();
    this.outMat = new THREE.ShaderMaterial({
      uniforms: {
        tAccum: { value: this.accumRT.texture },
        uInv: { value: 1 }, uExposure: { value: 1 },
        uVignette: { value: 0.22 }, uGrain: { value: 0.012 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `
        uniform sampler2D tAccum; uniform float uInv,uExposure,uVignette,uGrain;
        varying vec2 vUv;
        ${ACES}
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        void main(){
          vec3 c = texture2D(tAccum,vUv).rgb * uInv * uExposure;
          c = aces(c);
          vec2 d = vUv - 0.5;
          c *= 1.0 - uVignette * dot(d,d) * 2.2;                 // gentle falloff
          c += (hash(vUv*vec2(1024.,768.))-0.5) * uGrain;        // breaks banding
          c = pow(max(c,0.0), vec3(1.0/2.2));                    // to sRGB
          gl_FragColor = vec4(c,1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.outQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.outMat);
    this.outQuad.frustumCulled = false;
    this.outScene.add(this.outQuad);

    this.samples = 0;
    this._v = new THREE.Vector3();
  }

  reset() {
    const r = this.renderer;
    const prev = r.getRenderTarget();
    r.setRenderTarget(this.accumRT);
    r.setClearColor(0x000000, 1); r.clear(true, false, false);
    r.setRenderTarget(prev);
    this.samples = 0;
  }

  /**
   * One accumulation pass.
   * `rig` supplies the lights so they can be re-sampled each pass.
   */
  pass(scene, camera, rig) {
    const r = this.renderer;

    // (a) sub-pixel camera jitter
    const jx = (Math.random() - 0.5) / this.w * 2;
    const jy = (Math.random() - 0.5) / this.h * 2;
    applyShift(camera);
    camera.projectionMatrix.elements[8] += jx;
    camera.projectionMatrix.elements[9] += jy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

    // (b) sun jitter inside its angular diameter -> real penumbra
    if (rig?.sun) {
      const s = rig.sunDir.clone();
      const spread = rig.sunSpread ?? 0.012;
      s.x += (Math.random() - 0.5) * spread;
      s.y += (Math.random() - 0.5) * spread;
      s.z += (Math.random() - 0.5) * spread;
      s.normalize().multiplyScalar(rig.sunDistance ?? 900);
      rig.sun.position.copy(s);
      rig.sun.target.position.set(rig.focus.x, rig.focus.y, rig.focus.z);
      rig.sun.target.updateMatrixWorld();
      rig.sun.shadow.needsUpdate = true;
    }

    // (c) one sky sample -> stochastic skylight and ambient occlusion
    if (rig?.skyLight) {
      cosineHemisphere(this._v);
      this._v.multiplyScalar(rig.skyDistance ?? 700);
      rig.skyLight.position.set(
        rig.focus.x + this._v.x, rig.focus.y + Math.abs(this._v.y), rig.focus.z + this._v.z);
      rig.skyLight.target.position.copy(rig.focus);
      rig.skyLight.target.updateMatrixWorld();
      rig.skyLight.shadow.needsUpdate = true;
    }

    r.setRenderTarget(this.frameRT);
    r.setClearColor(0x000000, 0);
    r.clear(true, true, false);
    r.render(scene, camera);

    r.setRenderTarget(this.accumRT);
    r.autoClear = false;
    r.render(this.quadScene, this.quadCam);
    r.autoClear = true;

    this.samples++;
  }

  present({ exposure = 1 } = {}) {
    const r = this.renderer;
    this.outMat.uniforms.uInv.value = 1 / Math.max(1, this.samples);
    this.outMat.uniforms.uExposure.value = exposure;
    r.setRenderTarget(null);
    r.autoClear = true;
    r.render(this.outScene, this.quadCam);
  }
}

/**
 * Sun position from real solar geometry. Latitude defaults to Boone, NC.
 * ASSUMED coordinates — see docs/01-site-facts-register.md.
 */
export function sunDirection({ lat = 36.217, dayOfYear = 45, hour = 15.5 }) {
  const rad = Math.PI / 180;
  const decl = 23.45 * rad * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365);
  const H = (hour - 12) * 15 * rad;                       // hour angle
  const la = lat * rad;
  const alt = Math.asin(Math.sin(decl) * Math.sin(la) + Math.cos(decl) * Math.cos(la) * Math.cos(H));
  let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(la) - Math.tan(decl) * Math.cos(la));
  az = az + Math.PI;                                      // measured from north, clockwise
  // Model axes: three +X = azimuth 70 deg, three +Z = downhill = azimuth 160 deg.
  // A compass direction `az` projects onto those axes as
  //   x = cos(az - 70)      z = cos(az - 160) = sin(az - 70)
  // Both components are POSITIVE sine/cosine of the same relative angle; an
  // earlier negation here put the sun on the uphill side of the house and lit
  // nothing the camera could see.
  const rel = az - 70 * rad;
  return {
    altitude: alt, azimuth: az,
    dir: new THREE.Vector3(Math.cos(alt) * Math.cos(rel), Math.sin(alt), Math.cos(alt) * Math.sin(rel)).normalize(),
    altDeg: alt / rad, azDeg: (az / rad + 360) % 360,
  };
}
