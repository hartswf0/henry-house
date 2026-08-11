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
        tBloom: { value: null },
        uInv: { value: 1 }, uExposure: { value: 1 },
        uVignette: { value: 0.26 }, uGrain: { value: 0.010 },
        uBloom: { value: 0.22 }, uSat: { value: 1.06 }, uContrast: { value: 1.07 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `
        uniform sampler2D tAccum, tBloom;
        uniform float uInv,uExposure,uVignette,uGrain,uBloom,uSat,uContrast;
        varying vec2 vUv;
        ${ACES}
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        void main(){
          vec3 c = texture2D(tAccum,vUv).rgb * uInv * uExposure;
          c += texture2D(tBloom,vUv).rgb * uBloom;               // halation on highlights
          c = aces(c);
          float l = dot(c, vec3(0.2126,0.7152,0.0722));
          c = mix(vec3(l), c, uSat);                             // saturation
          c = clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0);      // filmic contrast
          vec2 d = vUv - 0.5;
          c *= 1.0 - uVignette * dot(d,d) * 2.2;
          c += (hash(vUv*vec2(1024.,768.))-0.5) * uGrain;
          c = pow(max(c,0.0), vec3(1.0/2.2));
          gl_FragColor = vec4(c,1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.outQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.outMat);
    this.outQuad.frustumCulled = false;
    this.outScene.add(this.outQuad);

    // Bloom: half-res bright pass + separable blur. Cheap, and it is most of
    // the difference between "OpenGL screenshot" and "photograph".
    const bw = Math.max(2, Math.floor(width / 2)), bh = Math.max(2, Math.floor(height / 2));
    const bopt = { type: THREE.FloatType, format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    this.brightRT = new THREE.WebGLRenderTarget(bw, bh, bopt);
    this.blurRT = new THREE.WebGLRenderTarget(bw, bh, bopt);

    this.brightMat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: this.accumRT.texture }, uInv: { value: 1 }, uExposure: { value: 1 }, uThresh: { value: 1.05 } },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `uniform sampler2D tSrc; uniform float uInv,uExposure,uThresh; varying vec2 vUv;
        void main(){ vec3 c = texture2D(tSrc,vUv).rgb*uInv*uExposure;
          float l = dot(c, vec3(0.2126,0.7152,0.0722));
          gl_FragColor = vec4(c * smoothstep(uThresh, uThresh*2.0, l), 1.0); }`,
      depthTest: false, depthWrite: false,
    });
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2(1, 0) },
                  uTexel: { value: new THREE.Vector2(1 / bw, 1 / bh) } },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `uniform sampler2D tSrc; uniform vec2 uDir,uTexel; varying vec2 vUv;
        void main(){
          vec3 c = vec3(0.0);
          float w[5]; w[0]=0.227; w[1]=0.194; w[2]=0.121; w[3]=0.054; w[4]=0.016;
          c += texture2D(tSrc,vUv).rgb * w[0];
          for(int i=1;i<5;i++){
            vec2 o = uDir*uTexel*float(i)*2.0;
            c += texture2D(tSrc,vUv+o).rgb*w[i];
            c += texture2D(tSrc,vUv-o).rgb*w[i];
          }
          gl_FragColor = vec4(c,1.0); }`,
      depthTest: false, depthWrite: false,
    });
    this.fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.brightMat);
    this.fsQuad.frustumCulled = false;
    this.fsScene = new THREE.Scene().add(this.fsQuad);

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

  present({ exposure = 1, bloom = 0.22 } = {}) {
    const r = this.renderer;
    const inv = 1 / Math.max(1, this.samples);

    // bright pass -> blur H -> blur V
    this.brightMat.uniforms.uInv.value = inv;
    this.brightMat.uniforms.uExposure.value = exposure;
    this.fsQuad.material = this.brightMat;
    r.setRenderTarget(this.brightRT); r.clear(true, false, false);
    r.render(this.fsScene, this.quadCam);

    this.fsQuad.material = this.blurMat;
    this.blurMat.uniforms.tSrc.value = this.brightRT.texture;
    this.blurMat.uniforms.uDir.value.set(1, 0);
    r.setRenderTarget(this.blurRT); r.clear(true, false, false);
    r.render(this.fsScene, this.quadCam);

    this.blurMat.uniforms.tSrc.value = this.blurRT.texture;
    this.blurMat.uniforms.uDir.value.set(0, 1);
    r.setRenderTarget(this.brightRT); r.clear(true, false, false);
    r.render(this.fsScene, this.quadCam);

    this.outMat.uniforms.tBloom.value = this.brightRT.texture;
    this.outMat.uniforms.uInv.value = inv;
    this.outMat.uniforms.uExposure.value = exposure;
    this.outMat.uniforms.uBloom.value = bloom;
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
