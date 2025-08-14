/**
 * Full-screen textured quad shader
 * Compatible with Three.js EffectComposer
 */

// Direct assignment to THREE.CopyShader for browser script inclusion
THREE.CopyShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "opacity": { value: 1.0 }
  },
  vertexShader: /* glsl */`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: /* glsl */`
uniform float opacity;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
  vec4 texel = texture2D(tDiffuse, vUv);
  gl_FragColor = opacity * texel;
}
`
};
