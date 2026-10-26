import * as THREE from 'three';

export interface ThreePackConfig {
  // 光影与材质 (Lighting & Shaders)
  holoPower: number;          // 全息彩虹微光强度 (0.0 ~ 1.0)
  specularPower: number;      // 高光聚光度/锐利度 (10 ~ 100)
  specularIntensity: number;  // 高光反光亮度 (0.0 ~ 1.0)
  ambientLight: number;       // 环境光基调 (0.2 ~ 2.0)
  directionalLight: number;   // 主定向光 (0.2 ~ 2.5)
  exposure: number;           // 色调映射曝光 (0.5 ~ 1.8)
  pointLightStrength: number; // 边缘彩色轮廓光 (0.0 ~ 2.0)

  // 物理与形变 (Physics & Morphing)
  waistPinch: number;         // 气压释放收腰幅度 (0.0 ~ 0.15)
  lipCurl: number;            // 袋口顶唇翻卷度 (0.0 ~ 0.35)
  bendZ: number;              // 撕条剥离拱起高度 (0.5 ~ 3.0)
  liftY: number;              // 撕条上翘抬升量 (0.2 ~ 2.0)
  twistZ: number;             // 撕条微扭曲度 (0.0 ~ 0.3)
  sparkEnabled: boolean;      // 金属撕裂火花 (true/false)

  // 视差与图层定位微调 (Parallax & Layer Positioning)
  tiltSensitivity: number;    // 3D 偏转灵敏度 (0.00 ~ 0.12, 默认 0.045 消除大角度黑线)
  stripOffsetY: number;       // 撕条垂直偏移 (-0.10 ~ 0.10)
  stripOffsetX: number;       // 撕条水平偏移 (-0.10 ~ 0.10)
  stripOverlap: number;       // 撕条咬合重叠量 (0.00 ~ 0.04, 消除仰视黑线)
  bodyOffsetY: number;        // 袋身垂直偏移 (-0.10 ~ 0.10)
  bodyOffsetX: number;        // 袋身水平偏移 (-0.10 ~ 0.10)
  layerGapZ: number;          // 撕条与袋身前后的初始 Z 间距 (0.000 ~ 0.020)
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
  tiltSensitivity: 0.045,
  stripOffsetY: 0.000,
  stripOffsetX: 0.000,
  stripOverlap: 0.018,
  bodyOffsetY: 0.000,
  bodyOffsetX: 0.000,
  layerGapZ: 0.003,
};

export const PACK_CONFIG_PRESETS: Record<
  string,
  { label: string; desc: string; icon: string; config: ThreePackConfig }
> = {
  naturalShimmer: {
    label: '✨ 自然微光 (推荐)',
    desc: '柔和金属微反光，微幅 3D 悬浮，撕条无缝咬合，适合高质感铝箔包装',
    icon: 'Sparkles',
    config: {
      ...DEFAULT_THREE_PACK_CONFIG,
    },
  },
  matteFoil: {
    label: '🛡️ 哑光厚铝箔',
    desc: '弱高光与极低虹彩，表现加厚磨砂袋与低应力释放微形变',
    icon: 'Shield',
    config: {
      ...DEFAULT_THREE_PACK_CONFIG,
      holoPower: 0.06,
      specularPower: 22,
      specularIntensity: 0.12,
      ambientLight: 0.95,
      directionalLight: 0.85,
      exposure: 0.95,
      pointLightStrength: 0.25,
      waistPinch: 0.022,
      lipCurl: 0.10,
      bendZ: 1.30,
      liftY: 0.80,
      twistZ: 0.08,
      sparkEnabled: false,
      tiltSensitivity: 0.035,
    },
  },
  prismRainbow: {
    label: '🌈 电镀极光镭射',
    desc: '强烈的衍射光栅色彩干涉与亮眼点光源，适合炫彩特装卡包',
    icon: 'Flame',
    config: {
      ...DEFAULT_THREE_PACK_CONFIG,
      holoPower: 0.68,
      specularPower: 34,
      specularIntensity: 0.45,
      ambientLight: 1.10,
      directionalLight: 1.35,
      exposure: 1.08,
      pointLightStrength: 1.20,
      waistPinch: 0.055,
      lipCurl: 0.20,
      bendZ: 1.80,
      liftY: 1.10,
      twistZ: 0.16,
      sparkEnabled: true,
      tiltSensitivity: 0.055,
    },
  },
  rigidMinimal: {
    label: '📐 挺拔硬质卡套',
    desc: '零收腰凹折，笔直挺括，适合硬卡套纸盒或加硬封包',
    icon: 'Maximize2',
    config: {
      ...DEFAULT_THREE_PACK_CONFIG,
      holoPower: 0.22,
      specularPower: 56,
      specularIntensity: 0.18,
      ambientLight: 0.90,
      directionalLight: 1.00,
      exposure: 1.00,
      pointLightStrength: 0.40,
      waistPinch: 0.000,
      lipCurl: 0.06,
      bendZ: 1.25,
      liftY: 0.70,
      twistZ: 0.05,
      sparkEnabled: true,
      tiltSensitivity: 0.025,
    },
  },
};

export interface ThreePackInstance {
  setProgress: (p: number) => void;
  getProgress: () => number;
  setMouse: (normX: number, normY: number) => void;
  setCardProgress: (cp: number) => void;
  updateCardTexture: (url: string) => void;
  updateConfig: (cfg: Partial<ThreePackConfig>) => void;
  getConfig: () => ThreePackConfig;
  recenter: () => void;
  dispose: () => void;
}

export interface MountThreePackOptions {
  sealedTextureUrl?: string;
  openedTextureUrl?: string;
  stripTextureUrl?: string;
  liningTextureUrl?: string;
  cardFrontUrl?: string;
  cardBackUrl?: string;
  initialConfig?: Partial<ThreePackConfig>;
  onTearProgress?: (progress: number) => void;
}

/**
 * Three.js 真实参数化薄膜撕袋引擎
 * - 物理细分网格连续贝塞尔剥离弯曲
 * - 袋身向下拉落退出，卡片居中放大展示 (Center Stage Drop Out)
 * - 接缝咬合重叠与微幅视差偏转 (消除仰角黑线)
 * - 撕条与袋身图层坐标可自定义微调
 */
export function mountThreePack(
  container: HTMLElement,
  options: MountThreePackOptions = {}
): ThreePackInstance {
  const width = container.clientWidth || 360;
  const height = container.clientHeight || 560;

  // 当前运行时配置
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = currentConfig.exposure;
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
  // rootGroup: 响应鼠标轻微偏转
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // packGroup: 包含包装袋前膜、撕条、背壳内衬；撕开完成后向下整体滑落退出视口
  const packGroup = new THREE.Group();
  rootGroup.add(packGroup);

  // 4. 材质与贴图加载
  const textureLoader = new THREE.TextureLoader();

  const stripTex = textureLoader.load(
    options.stripTextureUrl || '/packs/pack_strip_norm.png'
  );
  stripTex.colorSpace = THREE.SRGBColorSpace;

  const openedTex = textureLoader.load(
    options.openedTextureUrl || '/packs/pack_opened_norm.png'
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
  // 绘制暗金色微星芒防伪底纹
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

  // 全息着色器 Uniforms
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
        ...uniforms,
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

          // 物理全息彩色干涉相角
          float phase = vUv.x * 1.6 + vUv.y * 0.9 + uMouse.x * 1.3 + uMouse.y * 0.7;
          vec3 holo = rainbow(phase);

          // 动感聚光高光
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

  // 5. 尺寸与网格定义
  // 裁切素材尺寸: 565 × 924 (宽高比 0.6115)
  // 撕条实际高度: 58px / 924px ≈ 0.0628 (占总高 6.28%)
  const packW = 1.84;
  const packH = 3.01;
  const stripH = packH * (58 / 924); // ~0.189
  const stripBaseY = packH * 0.5 - stripH * 0.5;

  // ============================================================================
  // 5.1 后背板与袋内深绿内衬 (Back Shell)
  // ============================================================================
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

  // ============================================================================
  // 5.2 实体卡片 (Card inside pocket) - 破袋后升起并居中放大展示
  // ============================================================================
  const cardW = 1.34;
  const cardH = 1.88;
  const cardGeo = new THREE.PlaneGeometry(cardW, cardH);

  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = 540;
  cardCanvas.height = 720;
  const cctx = cardCanvas.getContext('2d')!;
  cctx.fillStyle = '#0f172a';
  cctx.fillRect(0, 0, 540, 720);
  cctx.strokeStyle = '#67e8f9';
  cctx.lineWidth = 14;
  cctx.strokeRect(16, 16, 508, 688);
  cctx.fillStyle = '#f8fafc';
  cctx.font = 'bold 36px sans-serif';
  cctx.fillText('LIFE PACK', 48, 80);
  cctx.fillStyle = '#38bdf8';
  cctx.font = 'bold 24px monospace';
  cctx.fillText('LP-0007 · RARE', 48, 120);

  cctx.fillStyle = '#1e293b';
  cctx.fillRect(48, 150, 444, 480);
  cctx.fillStyle = '#e2e8f0';
  cctx.font = '24px sans-serif';
  cctx.fillText('✨ 奇遇特饮 · 全息闪卡', 140, 400);

  const cardTex = new THREE.CanvasTexture(cardCanvas);
  cardTex.colorSpace = THREE.SRGBColorSpace;

  const cardMat = new THREE.MeshStandardMaterial({
    map: cardTex,
    roughness: 0.3,
    metalness: 0.4,
    side: THREE.FrontSide,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  const cardBaseY = -0.42;
  cardMesh.position.set(0, cardBaseY, -0.04);
  rootGroup.add(cardMesh);

  // ============================================================================
  // 5.3 袋身前膜 (Front Pouch Body) - 开口袋身主体
  // ============================================================================
  const frontGeo = new THREE.PlaneGeometry(packW, packH, 32, 48);
  const frontMat = createHoloMaterial(openedTex, true);
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.position.set(currentConfig.bodyOffsetX, currentConfig.bodyOffsetY, 0.04);
  packGroup.add(frontMesh);

  const frontBasePositions = frontGeo.attributes.position.array.slice();

  // ============================================================================
  // 5.4 参数化连续撕裂剥离带 (Continuous Bending Tear Strip Mesh)
  // 包含 stripOverlap 咬合量，稍微向下延展覆盖切口上沿，彻底杜绝仰视夹缝黑线
  // ============================================================================
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

  // 初始严丝合缝对齐在袋子顶部，并微量向下盖住袋身
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

  // ============================================================================
  // 6. 核心物理形变更新循环
  // ============================================================================
  let currentProgress = 0;
  let targetProgress = 0;
  let currentCardProgress = 0;
  let targetCardProgress = 0;
  let mouse = new THREE.Vector2(0, 0);

  function updateMeshes() {
    // 平滑进度缓动
    currentProgress += (targetProgress - currentProgress) * 0.16;
    currentCardProgress += (targetCardProgress - currentCardProgress) * 0.12;
    const p = Math.min(1.0, Math.max(0.0, currentProgress));
    const cp = Math.min(1.0, Math.max(0.0, currentCardProgress));

    const sPos = calcStripPos();

    // ------------------------------------------------------------------------
    // 6.1 撕条顶点连续弯折 (细分网格贝塞尔受力曲线)
    // ------------------------------------------------------------------------
    const stripPos = stripGeo.attributes.position.array as Float32Array;
    const tearX = -packW * 0.5 + p * packW;

    for (let i = 0; i < stripPos.length; i += 3) {
      const bx = stripBasePositions[i];
      const by = stripBasePositions[i + 1];
      const bz = stripBasePositions[i + 2];

      const u = (bx + packW * 0.5) / packW; // 0..1 从左到右

      if (u >= p) {
        // 未撕开部分：严格锁死共面，接缝为 0！
        stripPos[i] = bx;
        stripPos[i + 1] = by;
        stripPos[i + 2] = bz;
      } else {
        // 已撕开部分：以当前的撕裂点 tearX 为弯曲起点向左拱起
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

    // 当完全撕开时，撕条逐渐飞离或隐去
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

    // 撕裂金属火花光点
    if (currentConfig.sparkEnabled && p > 0.02 && p < 0.96) {
      sparkMesh.position.set(tearX + sPos.x, sPos.y, 0.12);
      sparkMat.opacity = 0.9 * uniforms.uOpacity.value;
      sparkMesh.scale.setScalar(1.0 + Math.sin(uniforms.uTime.value * 20.0) * 0.3);
    } else {
      sparkMat.opacity = 0;
    }

    // ------------------------------------------------------------------------
    // 6.2 袋身收腰与前唇外翻 (Hourglass Waist Pinch & Front Lip Curl)
    // ------------------------------------------------------------------------
    const frontPos = frontGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < frontPos.length; i += 3) {
      const bx = frontBasePositions[i];
      const by = frontBasePositions[i + 1];
      const bz = frontBasePositions[i + 2];

      const v = (by + packH * 0.5) / packH; // 0 (底) .. 1 (顶)

      // 1. 袋身侧边收腰 (气压释放微凹折，使用配置参数控制)
      const pinchFactor = Math.sin(v * Math.PI) * currentConfig.waistPinch * p;
      const nx = bx * (1.0 - pinchFactor);

      // 2. 撕开后，袋口顶唇向前轻微翻开 (Top Lip Curl)
      const isTopLip = Math.max(0.0, (v - 0.82) / 0.18);
      const curlZ = Math.pow(isTopLip, 2.0) * currentConfig.lipCurl * p;
      const curlY = -Math.pow(isTopLip, 2.0) * (currentConfig.lipCurl * 0.35) * p;

      // 3. 基础自然微膨度
      const puffZ = Math.sin(v * Math.PI) * 0.04;

      frontPos[i] = nx;
      frontPos[i + 1] = by + curlY;
      frontPos[i + 2] = bz + curlZ + puffZ;
    }
    frontGeo.attributes.position.needsUpdate = true;
    frontGeo.computeVertexNormals();

    // ------------------------------------------------------------------------
    // 6.3 卡片破袋升起并居中，同时卡包向下滑落退出视口 (Center Stage Drop Out)
    // ------------------------------------------------------------------------
    if (cp <= 0.001) {
      // 待机状态：卡包归位，卡片静置在袋腹深处
      packGroup.position.set(0, 0, 0);
      packGroup.scale.set(1, 1, 1);
      uniforms.uOpacity.value = 1.0;
      backMat.opacity = 1.0;

      cardMesh.position.set(0, cardBaseY, -0.04);
      cardMesh.scale.set(1.0, 1.0, 1.0);
      cardMesh.rotation.set(0, 0, 0);
    } else {
      // 1. 卡包平滑向下滑落移出视口 (Pack Slide Down Exit)
      // 在 cp >= 0.15 之后，卡包随着重力平滑加速下沉移出视口
      const dropT = Math.min(1.0, Math.max(0.0, (cp - 0.15) / 0.85));
      const dropY = -Math.pow(dropT, 1.6) * 4.2;
      packGroup.position.y = dropY;
      packGroup.position.z = -dropT * 0.3;

      const fadeOpacity = Math.max(0.0, 1.0 - Math.pow(dropT, 1.6));
      uniforms.uOpacity.value = fadeOpacity;
      backMat.opacity = fadeOpacity;

      // 2. 卡片顺势破袋升起，并精准移动到屏幕正中央 (Center Stage Display)
      let targetCardY = cardBaseY;
      let targetCardZ = -0.04;
      let targetScale = 1.0;

      if (cp <= 0.4) {
        const t1 = cp / 0.4;
        targetCardY = THREE.MathUtils.lerp(cardBaseY, 0.35, t1);
        targetCardZ = THREE.MathUtils.lerp(-0.04, 0.15, Math.pow(t1, 1.3));
        targetScale = 1.0;
      } else {
        const t2 = (cp - 0.4) / 0.6;
        targetCardY = THREE.MathUtils.lerp(0.35, 0.0, t2);
        targetCardZ = THREE.MathUtils.lerp(0.15, 0.45, t2);
        targetScale = THREE.MathUtils.lerp(1.0, 1.25, t2);
      }

      cardMesh.scale.set(targetScale, targetScale, 1.0);

      // 完全居中后，提供非常精致的微幅悬浮浮动
      if (cp >= 0.98) {
        const floatY = Math.sin(uniforms.uTime.value * 2.2) * 0.035;
        const floatRot = Math.sin(uniforms.uTime.value * 1.6) * 0.025;
        cardMesh.position.set(0, targetCardY + floatY, targetCardZ);
        cardMesh.rotation.set(0, floatRot, 0);
      } else {
        cardMesh.position.set(0, targetCardY, targetCardZ);
        cardMesh.rotation.set(0, 0, (1.0 - cp) * -0.04);
      }
    }

    // ------------------------------------------------------------------------
    // 6.4 视角 3D 偏转联动 (使用 tiltSensitivity，默认 0.045 极微幅动感，消除仰角黑线)
    // ------------------------------------------------------------------------
    const tilt = currentConfig.tiltSensitivity;
    rootGroup.rotation.y = THREE.MathUtils.lerp(
      rootGroup.rotation.y,
      mouse.x * tilt,
      0.1
    );
    rootGroup.rotation.x = THREE.MathUtils.lerp(
      rootGroup.rotation.x,
      -mouse.y * tilt,
      0.1
    );
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
    updateCardTexture: (url: string) => {
      textureLoader.load(url, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        cardMat.map = t;
        cardMat.needsUpdate = true;
      });
    },
    updateConfig: (newCfg: Partial<ThreePackConfig>) => {
      Object.assign(currentConfig, newCfg);
      if (newCfg.holoPower !== undefined) {
        uniforms.uHoloPower.value = newCfg.holoPower;
      }
      if (newCfg.specularPower !== undefined) {
        uniforms.uSpecularPower.value = newCfg.specularPower;
      }
      if (newCfg.specularIntensity !== undefined) {
        uniforms.uSpecularIntensity.value = newCfg.specularIntensity;
      }
      if (newCfg.ambientLight !== undefined) {
        ambientLight.intensity = newCfg.ambientLight;
      }
      if (newCfg.directionalLight !== undefined) {
        dirLight.intensity = newCfg.directionalLight;
      }
      if (newCfg.pointLightStrength !== undefined) {
        blueLight.intensity = newCfg.pointLightStrength;
        goldLight.intensity = newCfg.pointLightStrength * 0.8;
      }
      if (newCfg.exposure !== undefined) {
        renderer.toneMappingExposure = newCfg.exposure;
      }
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
      cardMesh.position.set(0, cardBaseY, -0.04);
      cardMesh.scale.set(1.0, 1.0, 1.0);
      cardMesh.rotation.set(0, 0, 0);
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
      sparkMat.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
