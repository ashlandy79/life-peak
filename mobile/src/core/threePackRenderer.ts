import * as THREE from 'three';

export interface ThreePackConfig {
  holoPower: number;          // 全息彩虹微光强度 (0.0 ~ 1.0)
  specularPower: number;      // 高光聚光度/锐利度 (10 ~ 100)
  specularIntensity: number;  // 高光反光亮度 (0.0 ~ 1.0)
  ambientLight: number;       // 环境光基调 (0.2 ~ 2.0)
  directionalLight: number;   // 主定向光 (0.2 ~ 2.5)
  exposure: number;           // 色调映射曝光 (0.5 ~ 1.8)
  pointLightStrength: number; // 边缘彩色轮廓光 (0.0 ~ 2.0)

  waistPinch: number;         // 气压释放收腰幅度 (0.0 ~ 0.15)
  lipCurl: number;            // 袋口顶唇翻卷度 (0.0 ~ 0.35)
  bendZ: number;              // 撕条剥离拱起高度 (0.5 ~ 3.0)
  liftY: number;              // 撕条上翘抬升量 (0.2 ~ 2.0)
  twistZ: number;             // 撕条微扭曲度 (0.0 ~ 0.3)
  sparkEnabled: boolean;      // 金属撕裂火花 (true/false)

  tiltSensitivity: number;    // 3D 偏转灵敏度 (0.00 ~ 0.12)
  stripOffsetY: number;
  stripOffsetX: number;
  stripOverlap: number;
  bodyOffsetY: number;
  bodyOffsetX: number;
  layerGapZ: number;
}

export const DEFAULT_THREE_PACK_CONFIG: ThreePackConfig = {
  holoPower: 0.28,
  specularPower: 48,
  specularIntensity: 0.20,
  ambientLight: 0.85,
  directionalLight: 1.00,
  exposure: 1.00,
  pointLightStrength: 0.60,
  waistPinch: 0.038,
  lipCurl: 0.15,
  bendZ: 1.55,
  liftY: 0.95,
  twistZ: 0.12,
  sparkEnabled: true,
  tiltSensitivity: 0.000, // 移动端专属：视角完全静置，杜绝触控偏转抖动
  stripOffsetY: 0.000,
  stripOffsetX: 0.000,
  stripOverlap: 0.018,
  bodyOffsetY: 0.000,
  bodyOffsetX: 0.000,
  layerGapZ: 0.003,
};

export interface ThreePackInstance {
  setProgress: (p: number) => void;
  getProgress: () => number;
  setMouse: (normX: number, normY: number) => void;
  setCardProgress: (cp: number) => void;
  updateConfig: (cfg: Partial<ThreePackConfig>) => void;
  getConfig: () => ThreePackConfig;
  recenter: () => void;
  dispose: () => void;
}

export interface MountThreePackOptions {
  sealedTextureUrl?: string;
  openedTextureUrl?: string;
  stripTextureUrl?: string;
  cardBackTextureUrl?: string;
  initialConfig?: Partial<ThreePackConfig>;
  onTearProgress?: (progress: number) => void;
}

/**
 * 创建卡包即时底色贴图画布（彻底杜绝图片网络加载未完成时的黑屏）
 */
function createPackPlaceholderCanvas(width: number, height: number, isStrip = false): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (isStrip) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.3, '#f1f5f9');
    grad.addColorStop(0.7, '#ec4899');
    grad.addColorStop(1, '#67e8f9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  } else {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.4, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);
  }
  return canvas;
}

/**
 * 绘制卡包内部实体卡片贴图（闪卡工坊母版同款 Life Seal 卡片）
 */
function createCardCanvas(isFront = true): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 540;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  if (isFront) {
    // 1. 底板与微暗角
    const bgGrad = ctx.createLinearGradient(0, 0, 540, 720);
    bgGrad.addColorStop(0, '#0a1d13');
    bgGrad.addColorStop(0.5, '#0e2419');
    bgGrad.addColorStop(1, '#07150d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 540, 720);

    // 2. 珍珠蓝流光双层外框
    const borderGrad = ctx.createLinearGradient(0, 0, 540, 720);
    borderGrad.addColorStop(0, '#67e8f9');
    borderGrad.addColorStop(0.35, '#818cf8');
    borderGrad.addColorStop(0.7, '#ec4899');
    borderGrad.addColorStop(1, '#67e8f9');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 14;
    ctx.strokeRect(12, 12, 516, 696);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 492, 672);

    // 3. 左上角圆形属性徽章
    ctx.beginPath();
    ctx.arc(68, 68, 28, 0, Math.PI * 2);
    const badgeGrad = ctx.createLinearGradient(40, 40, 96, 96);
    badgeGrad.addColorStop(0, '#ec4899');
    badgeGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍴', 68, 73);
    ctx.fillText('食物', 68, 114);

    // 4. 右上角卡号
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('#027', 496, 70);

    // 5. 中央 LIFE SEAL 封印罗盘徽章
    ctx.save();
    ctx.translate(270, 240);
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.lineTo(48, 0);
    ctx.lineTo(0, 68);
    ctx.lineTo(-48, 0);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIFE SEAL', 0, 5);
    ctx.restore();

    // 6. 任务详情内容
    ctx.textAlign = 'left';
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('今日奇遇 #027', 48, 430);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('去楼下便利店，', 48, 470);
    ctx.fillText('买一瓶你没喝过的饮料。', 48, 506);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText('不准研究配料表。', 48, 542);

    // 7. 标签组
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(48, 574, 130, 36);
    ctx.fillRect(190, 574, 130, 36);
    ctx.fillRect(332, 574, 145, 36);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('出门 ★★★★', 58, 598);
    ctx.fillText('社交 ★★', 200, 598);
    ctx.fillText('荒谬 ★★★★★', 340, 598);

    // 8. 底部状态
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('已封印', 48, 664);

    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('RARE · LIFE EVENT', 496, 664);
  } else {
    // 背面：典雅暗金复古纹样
    const bgGrad = ctx.createLinearGradient(0, 0, 540, 720);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 540, 720);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 12;
    ctx.strokeRect(16, 16, 508, 688);

    ctx.save();
    ctx.translate(270, 360);
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIFE PACK', 0, 0);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('MEMORY ARCHIVE', 0, 32);
    ctx.restore();
  }

  return canvas;
}

export function mountThreePack(
  container: HTMLElement,
  options: MountThreePackOptions = {}
): ThreePackInstance {
  const width = container.clientWidth || 340;
  const height = container.clientHeight || 540;

  const currentConfig: ThreePackConfig = {
    ...DEFAULT_THREE_PACK_CONFIG,
    ...options.initialConfig,
  };

  // 1. Three.js 场景基础配置
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = currentConfig.exposure;
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.userSelect = 'none';
  container.appendChild(renderer.domElement);

  // 2. 灯光系统
  const ambientLight = new THREE.AmbientLight(0xffffff, currentConfig.ambientLight);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, currentConfig.directionalLight);
  dirLight.position.set(2, 3, 4);
  scene.add(dirLight);

  const blueLight = new THREE.PointLight(0x67e8f9, currentConfig.pointLightStrength, 8);
  blueLight.position.set(-2, 1.5, 2.5);
  scene.add(blueLight);

  const goldLight = new THREE.PointLight(0xf59e0b, currentConfig.pointLightStrength * 0.8, 8);
  goldLight.position.set(2, -1, 2.5);
  scene.add(goldLight);

  // 3. 根旋转组与分层组
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const packGroup = new THREE.Group();
  rootGroup.add(packGroup);

  // 4. 材质贴图加载（支持跨域与容灾底板，彻底杜绝黑屏）
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  // 创建备用底板
  const stripFallbackCanvas = createPackPlaceholderCanvas(565, 58, true);
  const openedFallbackCanvas = createPackPlaceholderCanvas(565, 924, false);

  const stripTex = textureLoader.load(
    options.stripTextureUrl || '/packs/pack_strip_norm.png',
    undefined,
    undefined,
    () => {
      // 容灾处理
      (stripTex as any).image = stripFallbackCanvas;
      stripTex.needsUpdate = true;
    }
  );
  stripTex.colorSpace = THREE.SRGBColorSpace;

  const openedTex = textureLoader.load(
    options.openedTextureUrl || '/packs/pack_opened_norm.png',
    undefined,
    undefined,
    () => {
      // 容灾处理
      (openedTex as any).image = openedFallbackCanvas;
      openedTex.needsUpdate = true;
    }
  );
  openedTex.colorSpace = THREE.SRGBColorSpace;

  // 内衬深绿花纹贴图
  const liningCanvas = document.createElement('canvas');
  liningCanvas.width = 512;
  liningCanvas.height = 512;
  const lctx = liningCanvas.getContext('2d')!;
  const lgrad = lctx.createLinearGradient(0, 0, 512, 512);
  lgrad.addColorStop(0, '#11291b');
  lgrad.addColorStop(0.5, '#173c26');
  lgrad.addColorStop(1, '#0b1d13');
  lctx.fillStyle = lgrad;
  lctx.fillRect(0, 0, 512, 512);
  lctx.fillStyle = 'rgba(234, 179, 8, 0.22)';
  for (let i = 0; i < 40; i++) {
    const rx = (i * 73) % 480 + 16;
    const ry = (i * 97) % 480 + 16;
    lctx.beginPath();
    lctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
    lctx.fill();
  }
  const liningTex = new THREE.CanvasTexture(liningCanvas);
  liningTex.colorSpace = THREE.SRGBColorSpace;

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHoloPower: { value: currentConfig.holoPower },
    uSpecularPower: { value: currentConfig.specularPower },
    uSpecularIntensity: { value: currentConfig.specularIntensity },
    uOpacity: { value: 1.0 },
  };

  const createHoloMaterial = (tex: THREE.Texture, transparent = true) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uMouse: uniforms.uMouse,
        uHoloPower: uniforms.uHoloPower,
        uSpecularPower: uniforms.uSpecularPower,
        uSpecularIntensity: uniforms.uSpecularIntensity,
        uOpacity: uniforms.uOpacity,
        map: { value: tex },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uHoloPower;
        uniform float uSpecularPower;
        uniform float uSpecularIntensity;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        vec3 rainbow(float t) {
          return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
        }

        void main() {
          vec4 texColor = texture2D(map, vUv);
          if (texColor.a < 0.05) discard;

          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float phase = vUv.x * 1.6 + vUv.y * 0.9 + uMouse.x * 1.3 + uMouse.y * 0.7;
          vec3 holo = rainbow(phase);

          vec3 lightDir = normalize(vec3(uMouse.x * 2.5, uMouse.y * 2.5 + 1.2, 2.5));
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), uSpecularPower);

          vec3 rgb = texColor.rgb;
          rgb = mix(rgb, rgb * (0.85 + holo * 0.35) + holo * 0.08, uHoloPower);
          rgb += vec3(spec * uSpecularIntensity);

          gl_FragColor = vec4(rgb, texColor.a * uOpacity);
        }
      `,
      transparent,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  };

  const packW = 1.84;
  const packH = 3.01;
  const stripH = packH * (58 / 924);
  const stripBaseY = packH * 0.5 - stripH * 0.5;

  // 5.1 后背板 (Back Shell)
  const backGeo = new THREE.PlaneGeometry(packW, packH, 16, 24);
  const backMat = new THREE.MeshStandardMaterial({
    map: liningTex,
    roughness: 0.45,
    metalness: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.set(0, 0, -0.12);
  packGroup.add(backMesh);

  // 5.2 实体卡片 (Card inside pocket) - 采用真实卡背贴图，消除粗糙假卡旋转中转
  const cardW = 1.34;
  const cardH = 1.88;
  const cardGeo = new THREE.PlaneGeometry(cardW, cardH);

  const cardBackTex = textureLoader.load(
    options.cardBackTextureUrl || '/back.png'
  );
  cardBackTex.colorSpace = THREE.SRGBColorSpace;

  const cardMat = new THREE.MeshStandardMaterial({
    map: cardBackTex,
    roughness: 0.35,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });

  const cardGroup = new THREE.Group();
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardGroup.add(cardMesh);

  const cardBaseY = -0.42;
  cardGroup.position.set(0, cardBaseY, -0.04);
  cardGroup.rotation.y = 0;
  rootGroup.add(cardGroup);

  // 5.3 袋身前膜 (Front Pouch Body)
  const frontGeo = new THREE.PlaneGeometry(packW, packH, 32, 48);
  const frontMat = createHoloMaterial(openedTex, true);
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.position.set(currentConfig.bodyOffsetX, currentConfig.bodyOffsetY, 0.04);
  packGroup.add(frontMesh);

  const frontBasePositions = frontGeo.attributes.position.array.slice();

  // 5.4 参数化连续撕裂剥离带 (Continuous Bending Tear Strip Mesh)
  const stripSegmentsX = 48;
  const stripSegmentsY = 6;
  const stripEffectiveH = stripH + currentConfig.stripOverlap;
  const stripGeo = new THREE.PlaneGeometry(
    packW,
    stripEffectiveH,
    stripSegmentsX,
    stripSegmentsY
  );
  const stripMat = createHoloMaterial(stripTex, true);
  const stripMesh = new THREE.Mesh(stripGeo, stripMat);

  const calcStripPos = () => ({
    x: currentConfig.stripOffsetX,
    y: stripBaseY + currentConfig.stripOffsetY - currentConfig.stripOverlap * 0.5,
    z: 0.04 + currentConfig.layerGapZ,
  });

  const initStripP = calcStripPos();
  stripMesh.position.set(initStripP.x, initStripP.y, initStripP.z);
  packGroup.add(stripMesh);

  const stripBasePositions = stripGeo.attributes.position.array.slice();

  // 撕裂金属火花光点
  const sparkGeo = new THREE.SphereGeometry(0.035, 12, 12);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  });
  const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
  sparkMesh.position.set(-packW * 0.5, stripBaseY, 0.1);
  packGroup.add(sparkMesh);

  // 6. 核心物理形变更新循环
  let currentProgress = 0;
  let targetProgress = 0;
  let currentCardProgress = 0;
  let targetCardProgress = 0;
  const mouse = new THREE.Vector2(0, 0);

  function updateMeshes() {
    currentProgress += (targetProgress - currentProgress) * 0.18;
    currentCardProgress += (targetCardProgress - currentCardProgress) * 0.12;
    const p = Math.min(1.0, Math.max(0.0, currentProgress));
    const cp = Math.min(1.0, Math.max(0.0, currentCardProgress));

    const sPos = calcStripPos();

    // 6.1 撕条顶点连续弯折 (细分网格贝塞尔受力曲线)
    const stripPos = stripGeo.attributes.position.array as Float32Array;
    const tearX = -packW * 0.5 + p * packW;

    for (let i = 0; i < stripPos.length; i += 3) {
      const bx = stripBasePositions[i];
      const by = stripBasePositions[i + 1];
      const bz = stripBasePositions[i + 2];

      const u = (bx + packW * 0.5) / packW;

      if (u >= p) {
        stripPos[i] = bx;
        stripPos[i + 1] = by;
        stripPos[i + 2] = bz;
      } else {
        const dist = p - u;
        const t = Math.min(1.0, dist / Math.max(0.001, p));
        const bendZ = dist * currentConfig.bendZ * (1.0 + 0.5 * Math.sin(t * Math.PI));
        const liftY = dist * currentConfig.liftY * (1.0 + 0.3 * t);
        const shiftX = dist * 0.14;
        const twistZ = (by / stripH) * currentConfig.twistZ * Math.sin(t * Math.PI);

        stripPos[i] = bx + shiftX;
        stripPos[i + 1] = by + liftY;
        stripPos[i + 2] = bz + bendZ + twistZ;
      }
    }
    stripGeo.attributes.position.needsUpdate = true;
    stripGeo.computeVertexNormals();

    if (p > 0.94) {
      const flyFactor = (p - 0.94) / 0.06;
      stripMesh.position.x = sPos.x + flyFactor * 1.8;
      stripMesh.position.y = sPos.y + flyFactor * 0.9;
      stripMesh.rotation.z = flyFactor * 0.5;
      stripMat.opacity = Math.max(0.0, (1.0 - flyFactor) * uniforms.uOpacity.value);
    } else {
      stripMesh.position.set(sPos.x, sPos.y, sPos.z);
      stripMesh.rotation.z = 0;
      stripMat.opacity = uniforms.uOpacity.value;
    }

    if (currentConfig.sparkEnabled && p > 0.02 && p < 0.96) {
      sparkMesh.position.set(tearX + sPos.x, sPos.y, 0.12);
      sparkMat.opacity = 0.9 * uniforms.uOpacity.value;
      sparkMesh.scale.setScalar(1.0 + Math.sin(uniforms.uTime.value * 20.0) * 0.3);
    } else {
      sparkMat.opacity = 0;
    }

    // 6.2 袋身收腰与前唇外翻
    const frontPos = frontGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < frontPos.length; i += 3) {
      const bx = frontBasePositions[i];
      const by = frontBasePositions[i + 1];
      const bz = frontBasePositions[i + 2];

      const v = (by + packH * 0.5) / packH;
      const pinchFactor = Math.sin(v * Math.PI) * currentConfig.waistPinch * p;
      const nx = bx * (1.0 - pinchFactor);

      const isTopLip = Math.max(0.0, (v - 0.82) / 0.18);
      const curlZ = Math.pow(isTopLip, 2.0) * currentConfig.lipCurl * p;
      const curlY = -Math.pow(isTopLip, 2.0) * (currentConfig.lipCurl * 0.35) * p;
      const puffZ = Math.sin(v * Math.PI) * 0.04;

      frontPos[i] = nx;
      frontPos[i + 1] = by + curlY;
      frontPos[i + 2] = bz + curlZ + puffZ;
    }
    frontGeo.attributes.position.needsUpdate = true;
    frontGeo.computeVertexNormals();

    // 6.3 卡包向下滑落移出视口 + 卡片破袋升起并 360° 翻转至正面
    if (cp <= 0.001) {
      packGroup.position.set(0, 0, 0);
      uniforms.uOpacity.value = 1.0;
      backMat.opacity = 1.0;

      cardGroup.position.set(0, cardBaseY, -0.04);
      cardGroup.scale.set(1.0, 1.0, 1.0);
      cardGroup.rotation.set(0, 0, 0);
    } else {
      const dropT = Math.min(1.0, Math.max(0.0, (cp - 0.10) / 0.90));
      const dropY = -Math.pow(dropT, 1.6) * 4.4;
      packGroup.position.y = dropY;
      packGroup.position.z = -dropT * 0.3;

      const fadeOpacity = Math.max(0.0, 1.0 - Math.pow(dropT, 1.6));
      uniforms.uOpacity.value = fadeOpacity;
      backMat.opacity = fadeOpacity;

      // 卡片顺势破袋升起并居中
      let targetCardY = cardBaseY;
      let targetCardZ = -0.04;
      let targetScale = 1.0;

      if (cp <= 0.45) {
        const t1 = cp / 0.45;
        targetCardY = THREE.MathUtils.lerp(cardBaseY, 0.25, t1);
        targetCardZ = THREE.MathUtils.lerp(-0.04, 0.15, Math.pow(t1, 1.3));
        targetScale = 1.0;
      } else {
        const t2 = (cp - 0.45) / 0.55;
        targetCardY = THREE.MathUtils.lerp(0.25, 0.0, t2);
        targetCardZ = THREE.MathUtils.lerp(0.15, 0.45, t2);
        targetScale = THREE.MathUtils.lerp(1.0, 1.25, t2);
      }

      cardGroup.scale.set(targetScale, targetScale, 1.0);
      cardGroup.position.set(0, targetCardY, targetCardZ);

      // 卡片顺畅升起，保持真实的卡背朝向，不再执行扭曲粗糙的假卡自转
      cardGroup.rotation.y = 0;
    }

    // 6.4 移动端专属纯净静置视角（保持正面正对用户，杜绝手势滑动时卡包视角晃动）
    rootGroup.rotation.set(0, 0, 0);
  }

  // 7. 渲染时钟循环
  let reqId = 0;
  let lastTime = performance.now();

  function animate(now: number) {
    reqId = requestAnimationFrame(animate);
    const delta = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    uniforms.uTime.value += delta;
    updateMeshes();
    renderer.render(scene, camera);
  }
  reqId = requestAnimationFrame(animate);

  // 8. 窗口尺寸自适应
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cr = entry.contentRect;
      if (cr.width > 0 && cr.height > 0) {
        camera.aspect = cr.width / cr.height;
        camera.updateProjectionMatrix();
        renderer.setSize(cr.width, cr.height);
      }
    }
  });
  resizeObserver.observe(container);

  return {
    setProgress: (p: number) => {
      targetProgress = Math.min(1.0, Math.max(0.0, p));
      options.onTearProgress?.(targetProgress);
    },
    getProgress: () => currentProgress,
    setMouse: (normX: number, normY: number) => {
      mouse.set(normX, normY);
      uniforms.uMouse.value.set(normX, normY);
    },
    setCardProgress: (cp: number) => {
      targetCardProgress = Math.min(1.0, Math.max(0.0, cp));
    },
    updateConfig: (newCfg: Partial<ThreePackConfig>) => {
      Object.assign(currentConfig, newCfg);
      if (newCfg.holoPower !== undefined) uniforms.uHoloPower.value = newCfg.holoPower;
      if (newCfg.specularPower !== undefined) uniforms.uSpecularPower.value = newCfg.specularPower;
      if (newCfg.specularIntensity !== undefined) uniforms.uSpecularIntensity.value = newCfg.specularIntensity;
      if (newCfg.ambientLight !== undefined) ambientLight.intensity = newCfg.ambientLight;
      if (newCfg.directionalLight !== undefined) dirLight.intensity = newCfg.directionalLight;
      if (newCfg.pointLightStrength !== undefined) {
        blueLight.intensity = newCfg.pointLightStrength;
        goldLight.intensity = newCfg.pointLightStrength * 0.8;
      }
      if (newCfg.exposure !== undefined) renderer.toneMappingExposure = newCfg.exposure;
      if (newCfg.bodyOffsetX !== undefined || newCfg.bodyOffsetY !== undefined) {
        frontMesh.position.set(currentConfig.bodyOffsetX, currentConfig.bodyOffsetY, 0.04);
      }
      if (
        newCfg.stripOffsetX !== undefined ||
        newCfg.stripOffsetY !== undefined ||
        newCfg.layerGapZ !== undefined ||
        newCfg.stripOverlap !== undefined
      ) {
        const sp = calcStripPos();
        stripMesh.position.set(sp.x, sp.y, sp.z);
      }
    },
    getConfig: () => ({ ...currentConfig }),
    recenter: () => {
      mouse.set(0, 0);
      uniforms.uMouse.value.set(0, 0);
      rootGroup.rotation.set(0, 0, 0);
      packGroup.position.set(0, 0, 0);
      packGroup.scale.set(1, 1, 1);
      uniforms.uOpacity.value = 1.0;
      backMat.opacity = 1.0;
      cardGroup.position.set(0, cardBaseY, -0.04);
      cardGroup.scale.set(1.0, 1.0, 1.0);
      cardGroup.rotation.set(0, 0, 0);
    },
    dispose: () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      renderer.dispose();
      backGeo.dispose();
      frontGeo.dispose();
      stripGeo.dispose();
      cardGeo.dispose();
      sparkGeo.dispose();
      frontMat.dispose();
      stripMat.dispose();
      backMat.dispose();
      cardMat.dispose();
      cardBackTex.dispose();
      sparkMat.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    },
  };
}
