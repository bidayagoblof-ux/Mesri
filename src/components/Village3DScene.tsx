import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sun, Moon, Sunset, RotateCw, RefreshCw, Layers, ShieldCheck, Eye } from 'lucide-react';

interface Village3DSceneProps {
  onExploreServices?: () => void;
  onApplyService?: () => void;
}

export const Village3DScene: React.FC<Village3DSceneProps> = ({
  onExploreServices,
  onApplyService
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [is2DFallback, setIs2DFallback] = useState(false);
  const [timeMode, setTimeMode] = useState<'day' | 'sunset' | 'night'>('day');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  // References for runtime animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const flagMeshRef = useRef<THREE.Mesh | null>(null);
  const floatingDocsRef = useRef<THREE.Group | null>(null);
  const energyRingRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (is2DFallback || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Scene & Camera setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xF4F7FB);
    scene.fog = new THREE.FogExp2(0xF4F7FB, 0.022);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    camera.position.set(16, 12, 22);

    // 3. Renderer with SRGB color space and ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below floor
    controls.minDistance = 8;
    controls.maxDistance = 45;
    controls.target.set(0, 2.5, 0);

    // 5. Studio Environment Reflection via RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('PMREM environment init note:', e);
    }

    // 6. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 0.85);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xfff8e7, 1.4);
    keyLight.position.set(18, 24, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    const d = 16;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // 7. Ground / Terrain (Greenish hill plateaus of Gomo)
    const groundGroup = new THREE.Group();

    // Base circular podium
    const basePodiumGeo = new THREE.CylinderGeometry(15, 16.5, 0.8, 64);
    const basePodiumMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.85,
      metalness: 0.05
    });
    const basePodium = new THREE.Mesh(basePodiumGeo, basePodiumMat);
    basePodium.position.y = -0.4;
    basePodium.receiveShadow = !isSoftwareGl;
    groundGroup.add(basePodium);

    // Stone paved plaza
    const plazaGeo = new THREE.CylinderGeometry(7.5, 7.8, 0.2, 48);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.45,
      metalness: 0.1
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 0.05;
    plaza.receiveShadow = !isSoftwareGl;
    groundGroup.add(plaza);

    // Ground contact shadow disc
    const shadowGeo = new THREE.RingGeometry(0.1, 16.8, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.81;
    groundGroup.add(contactShadow);

    scene.add(groundGroup);

    // 8. Composite 3D Building: Kantor Desa Lolosoni (Modern Digital Government with Nias Architecture Accents)
    const villageHall = new THREE.Group();

    // Main Hall Podium & Steps
    const foundationGeo = new THREE.BoxGeometry(7, 0.6, 5.5);
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.15
    });
    const foundation = new THREE.Mesh(foundationGeo, concreteMat);
    foundation.position.y = 0.3;
    foundation.castShadow = !isSoftwareGl;
    foundation.receiveShadow = !isSoftwareGl;
    villageHall.add(foundation);

    // Steps
    const stepsGeo = new THREE.BoxGeometry(3.5, 0.3, 1.2);
    const steps = new THREE.Mesh(stepsGeo, concreteMat);
    steps.position.set(0, 0.15, 3.2);
    steps.receiveShadow = !isSoftwareGl;
    villageHall.add(steps);

    // Glass & Navy Pillars Facade
    const glassGeo = new THREE.BoxGeometry(6.2, 2.6, 4.6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x102a43,
      roughness: 0.1,
      metalness: 0.2,
      transmission: isSoftwareGl ? 0 : 0.6,
      transparent: true,
      opacity: isSoftwareGl ? 0.85 : 0.95
    });
    const mainBuilding = new THREE.Mesh(glassGeo, glassMat);
    mainBuilding.position.y = 1.9;
    mainBuilding.castShadow = !isSoftwareGl;
    villageHall.add(mainBuilding);

    // Architectural Pillars (White Columns)
    const pillarGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.8, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const pillarPositions = [
      [-3.0, 1.9, 2.2],
      [-1.0, 1.9, 2.2],
      [1.0, 1.9, 2.2],
      [3.0, 1.9, 2.2],
      [-3.0, 1.9, -2.2],
      [3.0, 1.9, -2.2]
    ];
    pillarPositions.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, py, pz);
      p.castShadow = !isSoftwareGl;
      villageHall.add(p);
    });

    // Traditional Nias Elevated Tier Roof (Omo Sebua Inspired Silhouette)
    const roofTier1Geo = new THREE.ConeGeometry(4.8, 2.2, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e, // Warm timber / brown thatch
      roughness: 0.7,
      metalness: 0.15
    });
    const roofTier1 = new THREE.Mesh(roofTier1Geo, roofMat);
    roofTier1.rotation.y = Math.PI / 4;
    roofTier1.position.y = 4.3;
    roofTier1.scale.set(1.25, 0.9, 0.95);
    roofTier1.castShadow = !isSoftwareGl;
    villageHall.add(roofTier1);

    // Upper Roof Ridge Crown (Ornamen Mahkota Rumah Adat Nias)
    const ridgeGeo = new THREE.BoxGeometry(0.3, 0.35, 4.2);
    const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.2 });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.y = 5.25;
    villageHall.add(ridge);

    // Signboard "KANTOR DESA LOLOSONI"
    const signGeo = new THREE.BoxGeometry(3.2, 0.5, 0.1);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x102a43, roughness: 0.3 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 3.2, 2.35);
    villageHall.add(sign);

    // Indonesian Flag Pole (Tiang Bendera Merah Putih)
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 5, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(3.5, 2.5, 2.8);
    pole.castShadow = !isSoftwareGl;
    villageHall.add(pole);

    // Flag Mesh (Red & White cloth)
    const flagGeo = new THREE.PlaneGeometry(1.2, 0.8, 12, 8);
    // Procedural red-white texture
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128;
    flagCanvas.height = 80;
    const fctx = flagCanvas.getContext('2d')!;
    fctx.fillStyle = '#DC2626';
    fctx.fillRect(0, 0, 128, 40);
    fctx.fillStyle = '#FFFFFF';
    fctx.fillRect(0, 40, 128, 40);
    const flagTex = new THREE.CanvasTexture(flagCanvas);
    flagTex.colorSpace = THREE.SRGBColorSpace;
    const flagMat = new THREE.MeshStandardMaterial({
      map: flagTex,
      side: THREE.DoubleSide,
      roughness: 0.4
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(4.1, 4.4, 2.8);
    flagMeshRef.current = flagMesh;
    villageHall.add(flagMesh);

    scene.add(villageHall);

    // 9. Nias Heritage Megalith Stones (Batu Megalit Gomo / Darodaro)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, metalness: 0.05 });
    const stonePositions = [
      [-4.8, 0.6, 2.5, 0.7, 1.4, 0.5],
      [-5.6, 0.4, 1.5, 0.9, 0.9, 0.8],
      [4.8, 0.5, -2.0, 0.8, 1.2, 0.6]
    ];
    stonePositions.forEach(([sx, sy, sz, w, h, d]) => {
      const stoneGeo = new THREE.BoxGeometry(w, h, d);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(sx, sy, sz);
      stone.rotation.y = Math.random() * Math.PI;
      stone.castShadow = !isSoftwareGl;
      stone.receiveShadow = !isSoftwareGl;
      scene.add(stone);
    });

    // 10. Tropical Trees & Greenery of Gomo (InstancedMesh)
    const treeTrunkGeo = new THREE.CylinderGeometry(0.12, 0.22, 1.8, 8);
    const treeFoliageGeo = new THREE.DodecahedronGeometry(0.9, 1);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const treeLocations = [
      [-8.5, 0.9, -4.5],
      [-7.2, 0.9, 6.0],
      [-9.0, 0.9, 2.0],
      [8.0, 0.9, -6.0],
      [9.5, 0.9, 1.5],
      [7.5, 0.9, 6.5],
      [0.0, 0.9, -9.0],
      [-4.5, 0.9, -8.0],
      [4.5, 0.9, -8.0]
    ];

    treeLocations.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = !isSoftwareGl;
      tree.add(trunk);

      const foliage = new THREE.Mesh(treeFoliageGeo, foliageMat);
      foliage.position.y = 2.2;
      foliage.scale.set(1.1 + Math.random() * 0.3, 1.3, 1.1 + Math.random() * 0.3);
      foliage.castShadow = !isSoftwareGl;
      tree.add(foliage);

      tree.position.set(tx, 0, tz);
      scene.add(tree);
    });

    // 11. Floating Digital Service Nodes & Administrative Documents (Iconic Cyber Village Elements)
    const floatingDocs = new THREE.Group();
    floatingDocsRef.current = floatingDocs;

    const docGeo = new THREE.BoxGeometry(0.65, 0.85, 0.08);
    const docMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35
    });

    const docPositions = [
      [-3.2, 4.2, 0.5],
      [3.4, 4.5, -0.8],
      [0, 5.8, 1.2],
      [-2.5, 3.8, -2.8],
      [2.8, 3.6, 2.2]
    ];

    docPositions.forEach(([dx, dy, dz], i) => {
      const doc = new THREE.Mesh(docGeo, docMat);
      doc.position.set(dx, dy, dz);
      doc.rotation.set(0.2, i * 1.2, 0.1);
      floatingDocs.add(doc);
    });
    scene.add(floatingDocs);

    // Glowing Holographic Service Halo
    const ringGeo = new THREE.TorusGeometry(3.6, 0.04, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    const energyRing = new THREE.Mesh(ringGeo, ringMat);
    energyRing.rotation.x = Math.PI / 2;
    energyRing.position.set(0, 0.4, 0);
    energyRingRef.current = energyRing;
    scene.add(energyRing);

    // 12. Animation Loop
    let clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      const elapsed = clock.getElapsedTime();

      // Gentle flag flutter
      if (flagMeshRef.current) {
        const posAttr = flagMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = posAttr.getX(i);
          const wave = Math.sin(elapsed * 4.5 + u * 3.0) * 0.08 * (u + 0.6);
          posAttr.setZ(i, wave);
        }
        posAttr.needsUpdate = true;
      }

      // Gentle floating documents hover & slow rotation
      if (floatingDocsRef.current) {
        floatingDocsRef.current.position.y = Math.sin(elapsed * 1.6) * 0.15;
        floatingDocsRef.current.rotation.y = elapsed * 0.2;
      }

      // Energy Ring pulse
      if (energyRingRef.current) {
        energyRingRef.current.rotation.z = elapsed * 0.3;
        energyRingRef.current.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.03);
      }

      // Orbit controls damping & optional auto-rotate
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.6;
      controls.update();

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    tick();

    // 13. Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight || 560;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [is2DFallback, autoRotate]);

  // Adjust time of day lighting
  useEffect(() => {
    if (!sceneRef.current || !keyLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const key = keyLightRef.current;
    const hemi = hemiLightRef.current;

    if (timeMode === 'day') {
      scene.background = new THREE.Color(0xF4F7FB);
      scene.fog = new THREE.FogExp2(0xF4F7FB, 0.022);
      key.color.setHex(0xfff8e7);
      key.intensity = 1.4;
      hemi.color.setHex(0xffffff);
      hemi.groundColor.setHex(0xcfd8dc);
      hemi.intensity = 0.85;
    } else if (timeMode === 'sunset') {
      scene.background = new THREE.Color(0xffedd5);
      scene.fog = new THREE.FogExp2(0xffedd5, 0.025);
      key.color.setHex(0xf97316);
      key.intensity = 1.6;
      hemi.color.setHex(0xfde047);
      hemi.groundColor.setHex(0x7c2d12);
      hemi.intensity = 0.7;
    } else if (timeMode === 'night') {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.028);
      key.color.setHex(0x38bdf8);
      key.intensity = 0.8;
      hemi.color.setHex(0x1e293b);
      hemi.groundColor.setHex(0x020617);
      hemi.intensity = 0.5;
    }
  }, [timeMode]);

  // Reset camera view handler
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(16, 12, 22);
      controlsRef.current.target.set(0, 2.5, 0);
    }
  };

  return (
    <div className="relative w-full h-[580px] lg:h-[640px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-[#F4F7FB]">
      {/* 2D Fallback Mode */}
      {is2DFallback ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#102A43] to-blue-950 p-8 text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 max-w-lg text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 text-sky-400 border border-blue-400/30">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold">Desa Digital Lolosoni 2D Mode</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Mode visual hemat daya diaktifkan. Anda tetap dapat menikmati seluruh fitur pelayanan
              administrasi Desa Lolosoni secara cepat, responsif, dan optimal di semua perangkat.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIs2DFallback(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> Beralih ke 3D Interaktif
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Three.js Isolated Canvas Mount */
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      )}

      {/* Top Overlay Badge */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none flex items-center gap-2.5">
        <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-[#102A43]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Desa Digital 3D Experience</span>
        </div>
        <div className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-medium backdrop-blur-md">
          Geser & Putar untuk Melihat Kantor Desa
        </div>
      </div>

      {/* Hero Content Overlay (Text & CTA Buttons) */}
      <div className="absolute top-16 sm:top-20 left-6 sm:left-12 max-w-xl z-20 pointer-events-none space-y-4">
        <div className="inline-block px-3.5 py-1 rounded-lg bg-blue-600/10 text-blue-700 font-semibold text-xs tracking-wider uppercase border border-blue-200/50 backdrop-blur-sm">
          Pemerintah Desa Lolosoni – Kec. Gomo
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] tracking-tight leading-tight">
          Pelayanan Administrasi Desa Kini Lebih <span className="text-blue-600">Mudah</span>, <span className="text-sky-600">Cepat</span>, dan <span className="text-emerald-600">Transparan</span>.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed pointer-events-auto">
          Selamat datang di Sistem Informasi Pelayanan Administrasi Desa Lolosoni. Nikmati kemudahan mengajukan permohonan administrasi, memantau proses pelayanan secara real-time, dan mendapatkan informasi desa melalui satu platform terpadu.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-3 pointer-events-auto">
          <button
            onClick={onApplyService}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" /> Ajukan Layanan Online
          </button>
          <button
            onClick={onExploreServices}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] font-semibold text-sm shadow-md border border-slate-200 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Eye className="w-4 h-4 text-blue-600" /> Lihat Katalog Layanan
          </button>
        </div>
      </div>

      {/* Unified Ergonomic Bottom Control Dock (Following Three.js constitution: pinned bottom-center, zero center obstruction) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[94vw]">
        {/* Toggle Collapse Trigger */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsHudCollapsed(!isHudCollapsed)}
            className="px-3 py-1 text-[11px] font-medium rounded-full bg-white/90 text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
          >
            {isHudCollapsed ? '▴ Tampilkan Kontrol 3D' : '▾ Sembunyikan Kontrol 3D'}
          </button>
        </div>

        {/* Dock Controls */}
        {!isHudCollapsed && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 text-xs text-slate-700">
            {/* Lighting Modes */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
              <button
                onClick={() => setTimeMode('day')}
                title="Pencahayaan Siang"
                className={`p-1.5 rounded-lg transition ${
                  timeMode === 'day' ? 'bg-amber-100 text-amber-800 font-bold' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTimeMode('sunset')}
                title="Pencahayaan Senja"
                className={`p-1.5 rounded-lg transition ${
                  timeMode === 'sunset' ? 'bg-orange-100 text-orange-800 font-bold' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Sunset className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTimeMode('night')}
                title="Pencahayaan Malam Digital"
                className={`p-1.5 rounded-lg transition ${
                  timeMode === 'night' ? 'bg-slate-800 text-sky-400 font-bold' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Matikan Rotasi Otomatis' : 'Aktifkan Rotasi Otomatis'}
              className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                autoRotate ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rotasi</span>
            </button>

            {/* Reset Camera */}
            <button
              onClick={handleResetCamera}
              title="Kembalikan Posisi Kamera Awal"
              className="px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* 2D Fallback Switcher */}
            <div className="pl-2 border-l border-slate-200">
              <button
                onClick={() => setIs2DFallback(!is2DFallback)}
                className="px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-[11px] font-medium transition flex items-center gap-1"
                title="Mode Ringan 2D"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{is2DFallback ? 'Mode 3D' : 'Mode 2D'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
