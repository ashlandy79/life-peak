import React, { useState } from 'react';
import {
  Download,
  FileJson,
  Archive,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  Globe,
} from 'lucide-react';
import JSZip from 'jszip';
import type {
  LifeSealCardMeta,
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TcgCardAssets,
  TcgCardHandle,
  TcgHoloParameters,
} from '../core/types';
import { urlToBlob } from '../utils/imageUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tcgCardHandle: TcgCardHandle | null;
  tcgAssets: TcgCardAssets;
  tcgParameters: TcgHoloParameters;
  lifeSealMeta: LifeSealCardMeta;
}

function rimColorToIndex(rim: RimColorType): number {
  switch (rim) {
    case 'pearl-blue':
      return 0;
    case 'rainbow':
      return 1;
    case 'gold':
      return 2;
    case 'purple':
      return 3;
    case 'silver':
      return 4;
  }
}

function opticalMaskToIndex(mask: OpticalMaskType): number {
  switch (mask) {
    case 'frosted-seal':
      return 0;
    case 'holo-rainbow':
      return 1;
    case 'sunbeam':
      return 2;
    case 'prism-dispersion':
      return 3;
    case 'cosmic-stardust':
      return 4;
    case 'etched-foil':
      return 5;
  }
}

function structureLightModeToIndex(mode: StructureLightMode): number {
  switch (mode) {
    case 'subtle-sun':
      return 0;
    case 'tyndall-gold':
      return 1;
    case 'holo-rainbow':
      return 2;
  }
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  tcgCardHandle,
  tcgAssets,
  tcgParameters,
  lifeSealMeta,
}) => {
  const [exportingPng, setExportingPng] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // 1. 导出当前合成 PNG
  const handleExportPng = async () => {
    try {
      setExportingPng(true);
      if (tcgCardHandle) {
        const blob = await tcgCardHandle.exportPng();
        triggerDownload(blob, 'life-seal-holo-card.png');
        setSuccessMsg('已成功导出 LIFE SEAL 全息闪卡 PNG！');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert(`导出 PNG 失败: ${(e as Error).message}`);
    } finally {
      setExportingPng(false);
    }
  };

  // 2. 导出 JSON 配置清单 (包含卡片属性与光学蒙版参数)
  const handleExportJson = () => {
    try {
      const manifest = {
        engine: 'holo-card-webgl-v3',
        width: tcgAssets.width,
        height: tcgAssets.height,
        lifeSealMeta,
        parameters: tcgParameters,
        assets: {
          background: 'background.png',
          character: 'subject.png',
          ui: 'ui.png',
          structure: 'structure.png',
          back: 'back.png',
        },
      };
      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: 'application/json',
      });
      triggerDownload(blob, 'life-seal-manifest.json');
      setSuccessMsg('已导出 life-seal-manifest.json 配置文件！');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert(`导出 JSON 失败: ${(e as Error).message}`);
    }
  };

  // 3. 导出完整闪卡资源包 ZIP
  const handleExportZip = async () => {
    try {
      setExportingZip(true);
      const zip = new JSZip();

      zip.file(
        'life-seal-manifest.json',
        JSON.stringify(
          {
            engine: 'holo-card-webgl-v3',
            width: tcgAssets.width,
            height: tcgAssets.height,
            lifeSealMeta,
            parameters: tcgParameters,
            assets: {
              background: 'background.png',
              character: 'subject.png',
              ui: 'ui.png',
              structure: 'structure.png',
              back: 'back.png',
            },
          },
          null,
          2
        )
      );

      // 写入各图层图片
      zip.file('background.png', await urlToBlob(tcgAssets.background));
      zip.file('subject.png', await urlToBlob(tcgAssets.character));
      if (tcgAssets.ui) {
        zip.file('ui.png', await urlToBlob(tcgAssets.ui));
      }
      if (tcgAssets.structure) {
        zip.file('structure.png', await urlToBlob(tcgAssets.structure));
      }
      if (tcgAssets.back) {
        try {
          zip.file('back.png', await urlToBlob(tcgAssets.back));
        } catch {
          // ignore if cross-origin back fails
        }
      }

      // 写入当前预览合成 PNG
      if (tcgCardHandle) {
        zip.file('final-holo-card.png', await tcgCardHandle.exportPng());
      }

      const content = await zip.generateAsync({ type: 'blob' });
      triggerDownload(content, 'life-seal-holo-bundle.zip');

      setSuccessMsg('整套 LIFE SEAL 闪卡资源包 ZIP 打包完成并开始下载！');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert(`打包失败: ${(e as Error).message}`);
    } finally {
      setExportingZip(false);
    }
  };

  // 4. 导出独立单文件交互式 HTML (内嵌 Base64 图层与 6 重光学蒙版 + 5 色流光内嵌框 WebGL 着色器)
  const handleExportStandaloneHtml = async () => {
    try {
      setExportingHtml(true);
      const blobToDataUrl = (b: Blob): Promise<string> =>
        new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(b);
        });

      const backBlob = await urlToBlob(tcgAssets.back || '/back.png');
      const backDataUrl = await blobToDataUrl(backBlob);

      const rimIdx = rimColorToIndex(tcgParameters.rimColor);
      const maskIdx = opticalMaskToIndex(tcgParameters.opticalMask);
      const structLightIdx = structureLightModeToIndex(tcgParameters.structureLightMode);

      const standaloneHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIFE SEAL Holo Card · Standalone Viewer</title>
<style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#0c0f17;color:#dfe6ee;font-family:system-ui,sans-serif;overflow:hidden}
.room{height:100svh;background:radial-gradient(ellipse at 50% 45%,#1e2638,#0c0f17 80%);display:flex;flex-direction:column;align-items:center;justify-content:center}
.stage{position:relative;width:100%;height:calc(100% - 110px);display:grid;place-items:center;perspective:1400px;isolation:isolate}
.card{position:relative;width:min(78vw,390px);aspect-ratio:${tcgAssets.width}/${tcgAssets.height};transform-style:preserve-3d;will-change:transform;cursor:grab;touch-action:none;user-select:none}
.card:active{cursor:grabbing}
.face{position:absolute;inset:0;border-radius:4.5%/3.2%;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.front{transform:translateZ(.2px);overflow:visible;background:transparent;box-shadow:0 30px 65px #000b}
.front canvas{position:absolute;width:160%;height:160%;left:-30%;top:-30%;display:block;pointer-events:none}
.back{visibility:hidden;transform:rotateY(180deg) translateZ(.2px);background:#13216a;overflow:hidden;box-shadow:0 30px 65px #000b}
.back img{width:100%;height:100%;object-fit:fill;display:block}
.controls{width:min(420px,92vw);display:grid;grid-template-columns:85px 1fr 52px;gap:10px;align-items:center;padding:14px 18px;background:#131722e8;border:1px solid #38bdf830;border-radius:16px;font-size:12px;margin-bottom:16px}
.controls input{width:100%;accent-color:#22d3ee}
.controls output{text-align:right;font-family:monospace;color:#67e8f9}
</style>
</head>
<body>
<main class="room">
  <div class="stage">
    <div class="card" tabindex="0">
      <div class="face front"><canvas></canvas></div>
      <div class="face back"><img alt="Card back" src="${backDataUrl}"></div>
    </div>
  </div>
  <section class="controls">
    <label for="depth">景深 Depth</label>
    <input id="depth" type="range" min="-3" max="3" step="0.05" value="${tcgParameters.depth}">
    <output for="depth">${tcgParameters.depth > 0 ? '+' : ''}${tcgParameters.depth.toFixed(2)}×</output>
    <label for="blur">磨砂 Blur</label>
    <input id="blur" type="range" min="0" max="1" step="0.02" value="${tcgParameters.frostedBlur}">
    <output for="blur">${Math.round(tcgParameters.frostedBlur * 100)}%</output>
  </section>
</main>
<script type="module">
const ASSETS = ${JSON.stringify({
        character: tcgAssets.character,
        background: tcgAssets.background,
        ui: tcgAssets.ui,
        structure: tcgAssets.structure,
      })};
const ASPECT = ${tcgAssets.height / tcgAssets.width};
const canvas = document.querySelector('canvas');
const card = document.querySelector('.card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');
let depth = ${tcgParameters.depth}, frostedBlur = ${tcgParameters.frostedBlur}, dirty = true;
document.querySelector('#depth').oninput = e => { depth = Number(e.target.value); e.target.nextElementSibling.value = (depth>0?'+':'')+depth.toFixed(2)+'×'; dirty = true; };
document.querySelector('#blur').oninput = e => { frostedBlur = Number(e.target.value); e.target.nextElementSibling.value = Math.round(frostedBlur*100)+'%'; dirty = true; };

const gl = canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true});
const vs = \`attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}\`;
const fs = \`precision highp float; varying vec2 uv; uniform sampler2D art,bg,uiTex,bloomNear,bloomWide,structureTex; uniform float extracted, cardAspect; uniform vec2 view; uniform float depth, contourBrightness, power, glowPass, pixelWidth, starIntensity, glareIntensity, rimColorMode, rimGlowIntensity, opticalMaskMode, maskIntensity, frostedBlur, structureLightMode;
vec4 encodeHDR(vec3 c){float m=clamp(ceil(max(max(c.r,c.g),c.b)/64.*255.)/255.,1./255.,1.);return vec4(c/(64.*m),m);}
vec3 decodeHDR(vec4 c){return c.rgb*c.a*64.;}
vec3 rainbow(float t){return .52+.48*cos(6.28318*(t+vec3(0.,.33,.67)));}
vec3 getRimColor(float mode,float phase){
  if(mode<0.5){vec3 c1=vec3(0.22,0.78,0.98);vec3 c2=vec3(0.45,0.62,1.0);vec3 c3=vec3(0.88,0.52,0.98);float w=0.5+0.5*sin(phase*6.28318);return mix(mix(c1,c2,w),c3,0.35+0.35*cos(phase*9.42));}
  else if(mode<1.5){return rainbow(phase*1.8);}
  else if(mode<2.5){vec3 g1=vec3(1.0,0.86,0.32);vec3 g2=vec3(0.96,0.58,0.08);vec3 g3=vec3(1.0,0.97,0.78);float w=0.5+0.5*sin(phase*6.28318);return mix(mix(g2,g1,w),g3,pow(w,3.0));}
  else if(mode<3.5){vec3 p1=vec3(0.75,0.32,0.98);vec3 p2=vec3(0.42,0.28,0.95);vec3 p3=vec3(0.96,0.48,0.86);float w=0.5+0.5*sin(phase*6.28318);return mix(mix(p2,p1,w),p3,0.5+0.5*cos(phase*6.28318));}
  else{vec3 s1=vec3(0.82,0.88,0.95);vec3 s2=vec3(0.55,0.63,0.74);vec3 s3=vec3(0.98,0.99,1.0);float w=0.5+0.5*sin(phase*6.28318);return mix(mix(s2,s1,w),s3,pow(w,4.0));}
}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float band(vec2 p){float f=p.x*.65+p.y*.4+view.x*1.9+view.y*.85;return pow(max(0.,1.-abs(fract(f+.16)-.5)*2.),3.);}
vec4 sampleFrosted(sampler2D tex,vec2 coord,float blurAmt){
  if(blurAmt<=0.01)return texture2D(tex,coord);
  vec4 acc=vec4(0.);float total=0.;float radius=blurAmt*0.018;
  for(int i=0;i<10;i++){float fi=float(i);float angle=fi*2.39996;float r=sqrt((fi+0.5)/10.0)*radius;vec2 offset=vec2(cos(angle),sin(angle)/cardAspect)*r;float w=1.0-0.3*(fi/10.0);acc+=texture2D(tex,clamp(coord+offset,0.002,0.998))*w;total+=w;}
  return acc/total;
}
void main(){
 vec2 p=(uv-.5)*1.6+.5;vec2 u=p;
 vec2 edge=abs((p-.5)*vec2(1.,cardAspect))-(vec2(.5,cardAspect*.5)-vec2(.045));
 float edgeDistance=length(max(edge,0.))+min(max(edge.x,edge.y),0.)-.045;
 float cardMask=1.-smoothstep(-pixelWidth,pixelWidth,edgeDistance);
 float foregroundMask=depth>0.?1.:cardMask;
 vec2 a=p-view*(depth<0.?.06:.08)*depth;u=p-view*.07*max(depth,0.);vec2 b=(p-.5)*.5+.5-view*.22;
 float effBlur=frostedBlur;
 vec4 ch=sampleFrosted(art,a,effBlur);ch.a*=step(0.,a.x)*step(a.x,1.)*step(0.,a.y)*step(a.y,1.)*foregroundMask;
 vec4 background=sampleFrosted(bg,b,effBlur*1.25);background.a*=cardMask*step(0.,b.x)*step(b.x,1.)*step(0.,b.y)*step(b.y,1.);
 float baseAlpha=cardMask+(1.-cardMask)*ch.a;
 vec3 base=mix(background.rgb*cardMask,ch.rgb,ch.a);
 if(effBlur>0.01){
   float lum=dot(base,vec3(0.299,0.587,0.114));
   vec3 desat=mix(base,vec3(lum),0.72);
   vec3 obsidian=vec3(0.06,0.07,0.09);
   base=mix(desat,obsidian*(0.42+0.58*lum),clamp(effBlur*0.82,0.0,0.88)*cardMask);
   float grain=(hash(floor(p*vec2(560.,750.)))-0.5)*0.07*effBlur;
   base+=vec3(grain)*cardMask;
 }
 vec4 uiS=texture2D(uiTex,u);float um=uiS.a*step(0.,u.x)*step(u.x,1.)*step(0.,u.y)*step(u.y,1.)*foregroundMask;
 float finalAlpha=clamp(baseAlpha+(1.-baseAlpha)*um,0.,1.);
 if(finalAlpha<=0.){gl_FragColor=glowPass>.5?encodeHDR(vec3(0.)):vec4(0.);return;}
 float phase=p.x*.62+p.y*.36+view.x*1.9+view.y*.8;vec3 spectrum=rainbow(phase*2.2);vec3 rimSpec=getRimColor(rimColorMode,phase*1.35);float light=band(p);
 float micro=pow(hash(floor(p*vec2(620.,868.))),28.);
 vec3 maskContribution=vec3(0.);
 if(opticalMaskMode<0.5){float frostWave=smoothstep(0.15,0.85,noise(p*5.5+view*2.4));vec3 pearlSweep=mix(vec3(0.45,0.85,1.0),vec3(0.88,0.62,1.0),sin(phase*5.0)*0.5+0.5);maskContribution=(pearlSweep*(light*0.52+frostWave*0.22)+rimSpec*0.18*frostWave)*maskIntensity;}
 else if(opticalMaskMode<1.5){maskContribution=(base*spectrum*0.68+spectrum*0.14)*light*maskIntensity;}
 else if(opticalMaskMode<2.5){vec2 sunOrigin=vec2(0.18+view.x*0.45,-0.12+view.y*0.35);vec2 delta=(p-sunOrigin)*vec2(1.0,cardAspect);float dist=length(delta);float angle=atan(delta.y,delta.x);float rays=pow(max(0.0,0.5+0.5*sin(angle*16.0+view.x*7.0)+0.35*sin(angle*29.0-view.y*9.0)),3.2);float falloff=exp(-dist*1.15);vec3 sunColor=mix(vec3(1.0,0.76,0.32),vec3(1.0,0.96,0.82),rays*0.65);maskContribution=sunColor*(rays*0.75+0.28)*falloff*maskIntensity*1.15;}
 else if(opticalMaskMode<3.5){float rB=band(p+vec2(0.022,-0.015));float gB=band(p);float bB=band(p-vec2(0.022,-0.015));vec3 prismRay=vec3(rB*1.15,gB*0.95,bB*1.25)*rainbow(phase*3.1);float facet=abs(fract((p.x*5.0+p.y*3.5+view.x*2.0))-0.5)*2.0;maskContribution=prismRay*(0.55+0.45*pow(facet,2.0))*maskIntensity;}
 else if(opticalMaskMode<4.5){float n1=noise(p*8.0+view*1.8);float n2=noise(p*16.0-view*2.5);float spark=pow(hash(floor(p*vec2(260.,360.)+floor(view*18.))),18.);vec3 nebula=mix(vec3(0.38,0.68,1.0),vec3(0.95,0.52,0.92),n1);maskContribution=(nebula*n1*n2*0.65+rimSpec*spark*1.8)*maskIntensity;}
 else{float brushed=0.5+0.5*sin((p.x*180.0+p.y*60.0)+view.x*22.0);float aniso=pow(max(0.0,1.0-abs((p.x-0.5)*1.4+(p.y-0.5)*0.6-view.x*1.2)),4.0);maskContribution=rimSpec*(0.25+0.75*brushed)*aniso*0.85*maskIntensity;}
 base=mix(base,clamp(base+maskContribution,0.0,1.6),0.72*power*cardMask);
 float innerBorderDist=abs(edgeDistance+0.018);float rimBand=exp(-innerBorderDist*95.0)*cardMask;float rimSweep=0.45+0.55*pow(max(0.0,sin(phase*6.28318+view.x*3.5)),2.0);vec3 rimLight=rimSpec*rimBand*rimSweep*rimGlowIntensity*1.45*power;base+=rimLight;
 float line=texture2D(structureTex,a).a*ch.a;float envelope=smoothstep(.025,.42,light);
 vec3 emission=vec3(0.);
 if(structureLightMode<0.5){vec3 sunWhite=vec3(1.,.98,.92);emission=sunWhite*line*envelope*power*16.*contourBrightness;}
 else if(structureLightMode<1.5){vec3 tyndallGold=mix(vec3(1.,.82,.32),vec3(1.,.96,.72),light);float ray=pow(max(0.,.5+.5*sin((p.x*.75-p.y*1.1+view.x*2.2)*18.)),2.6);emission=(tyndallGold*1.15+vec3(ray*.42))*line*envelope*power*36.*contourBrightness;}
 else{emission=(mix(spectrum,rimSpec,.55)*.85+vec3(.15))*line*envelope*power*42.*contourBrightness+rimLight*2.6;}
 vec2 cell=fract(p*vec2(24.,34.))-.5;float seed=hash(floor(p*vec2(24.,34.)));
 float star=pow(max(0.,1.-abs(cell.x)*18.),14.)*pow(max(0.,1.-abs(cell.y)*2.),6.)+pow(max(0.,1.-abs(cell.y)*18.),14.)*pow(max(0.,1.-abs(cell.x)*2.),6.);
 base+=mix(spectrum,rimSpec,0.4)*(star*step(.965,seed)*light*.65*starIntensity+micro*light*.12)*power*(1.-ch.a)*cardMask;
 base=mix(base,uiS.rgb,um);
 float glare=pow(max(0.,1.-length((p-vec2(.5+view.x,.6+view.y))*vec2(1.,.75))),5.);
 base+=vec3(glare*.12*glareIntensity*power)*finalAlpha;base/=max(finalAlpha,.0001);
 emission*=(1.-um*0.65)*foregroundMask;
 if(glowPass>.5){gl_FragColor=encodeHDR(max(emission-vec3(1.),vec3(0.)));return;}
 vec3 bloom=decodeHDR(texture2D(bloomNear,uv))*.55+decodeHDR(texture2D(bloomWide,uv))*.8;
 bloom*=foregroundMask*(1.-um*0.5)*(line+rimBand*0.8);
 vec3 linear=pow(clamp(base,0.,1.),vec3(2.2));
 vec3 combined=1.-(1.-linear)*exp(-(emission*.38+bloom*.85));
 gl_FragColor=vec4(pow(clamp(combined,0.,1.),vec3(1./2.2))*finalAlpha,finalAlpha);
}\`;
const bfs = \`precision highp float; varying vec2 uv;uniform sampler2D source;uniform vec2 stepSize;
vec3 decodeHDR(vec4 c){return c.rgb*c.a*64.;}
vec4 encodeHDR(vec3 c){float m=clamp(ceil(max(max(c.r,c.g),c.b)/64.*255.)/255.,1./255.,1.);return vec4(c/(64.*m),m);}
void main(){vec3 c=vec3(0.);float total=0.;for(int i=-4;i<=4;i++){float f=float(i);float w=exp(-f*f/8.);c+=decodeHDR(texture2D(source,uv+stepSize*f))*w;total+=w;}gl_FragColor=encodeHDR(c/total);}\`;

const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
const compile = (t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;};
const prog = s=>{const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,s));gl.linkProgram(p);return p;};
const scene=prog(fs), blur=prog(bfs);
const use=p=>{gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);const a=gl.getAttribLocation(p,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);};
const tex=f=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
const imgs = await Promise.all(['character','background','ui','structure'].map(k=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=ASSETS[k];})));
const artTex = imgs.map(i=>{const t=tex(gl.LINEAR);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,i);return t;});
canvas.width=1100;canvas.height=Math.round(1100*ASPECT);
const target=sc=>{const w=Math.round(canvas.width*sc),h=Math.round(canvas.height*sc),t=tex(gl.LINEAR),f=gl.createFramebuffer();gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f,w,h};};
const em=target(.5),tp=target(.5),nr=target(.5),wt=target(.25),wd=target(.25);
use(scene);gl.uniform1f(gl.getUniformLocation(scene,'cardAspect'),ASPECT);gl.uniform1f(gl.getUniformLocation(scene,'extracted'),1);gl.uniform1i(gl.getUniformLocation(scene,'structureTex'),5);gl.uniform1f(gl.getUniformLocation(scene,'pixelWidth'),1/canvas.width);
['art','bg','uiTex','bloomNear','bloomWide'].forEach((n,i)=>gl.uniform1i(gl.getUniformLocation(scene,n),i));
const bind=(t,u=0)=>{gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);};
const bPass=(s,d,x,y)=>{use(blur);bind(s.t);gl.bindFramebuffer(gl.FRAMEBUFFER,d.f);gl.viewport(0,0,d.w,d.h);gl.uniform2f(gl.getUniformLocation(blur,'stepSize'),x/s.w,y/s.h);gl.drawArrays(gl.TRIANGLES,0,6);};
const draw=(x,y)=>{
  use(scene);artTex.forEach((t,i)=>bind(t,i===3?5:i));bind(nr.t,3);bind(wd.t,4);
  gl.uniform2f(gl.getUniformLocation(scene,'view'),Math.sin(y*Math.PI/180)*.65,Math.sin(x*Math.PI/180)*.65);
  gl.uniform1f(gl.getUniformLocation(scene,'power'),${tcgParameters.power});
  gl.uniform1f(gl.getUniformLocation(scene,'depth'),depth);
  gl.uniform1f(gl.getUniformLocation(scene,'contourBrightness'),${tcgParameters.contourBrightness});
  gl.uniform1f(gl.getUniformLocation(scene,'starIntensity'),${tcgParameters.starIntensity});
  gl.uniform1f(gl.getUniformLocation(scene,'glareIntensity'),${tcgParameters.glareIntensity});
  gl.uniform1f(gl.getUniformLocation(scene,'rimColorMode'),${rimIdx});
  gl.uniform1f(gl.getUniformLocation(scene,'rimGlowIntensity'),${tcgParameters.rimStrength});
  gl.uniform1f(gl.getUniformLocation(scene,'opticalMaskMode'),${maskIdx});
  gl.uniform1f(gl.getUniformLocation(scene,'structureLightMode'),${structLightIdx});
  gl.uniform1f(gl.getUniformLocation(scene,'maskIntensity'),${tcgParameters.maskIntensity});
  gl.uniform1f(gl.getUniformLocation(scene,'frostedBlur'),frostedBlur);
  gl.uniform1f(gl.getUniformLocation(scene,'glowPass'),1);gl.bindFramebuffer(gl.FRAMEBUFFER,em.f);gl.viewport(0,0,em.w,em.h);gl.drawArrays(gl.TRIANGLES,0,6);
  bPass(em,tp,1.2,0);bPass(tp,nr,0,1.2);bPass(nr,wt,5,0);bPass(wt,wd,0,2.5);
  use(scene);artTex.forEach((t,i)=>bind(t,i===3?5:i));bind(nr.t,3);bind(wd.t,4);
  gl.uniform1f(gl.getUniformLocation(scene,'glowPass'),0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,6);
};
let mx=-5,my=-12,tx=-5,ty=-12,base=0,down=false,px=0,py=0,moved=false;
card.onpointerdown=e=>{down=true;px=e.clientX;py=e.clientY;moved=false;card.setPointerCapture(e.pointerId);};
window.onpointermove=e=>{
  if(down){const dx=e.clientX-px,dy=e.clientY-py;if(Math.hypot(dx,dy)>4)moved=true;ty+=dx*.62;tx=Math.max(-50,Math.min(50,tx-dy*.3));px=e.clientX;py=e.clientY;dirty=true;}
  else{tx=(-(e.clientY-innerHeight/2)/innerHeight)*30;ty=base+((e.clientX-innerWidth/2)/innerWidth)*40;dirty=true;}
};
card.onpointerup=e=>{down=false;if(!moved){base+=180;tx=0;ty=base;}else{base=Math.round(ty/180)*180;}dirty=true;};
function loop(){
  mx+=(tx-mx)*.115;my+=(ty-my)*.115;
  card.style.transform=\`rotateX(\${mx}deg) rotateY(\${my}deg)\`;
  const vis=Math.cos(my*Math.PI/180)*Math.cos(mx*Math.PI/180)>.001;
  front.style.visibility=vis?'visible':'hidden';back.style.visibility=vis?'hidden':'visible';
  if(vis)draw(mx,my);
  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>`;

      const htmlBlob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      triggerDownload(htmlBlob, 'life-seal-interactive-card.html');
      setSuccessMsg('已成功导出可独立运行的单文件交互式闪卡网页 (.html)！');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert(`导出独立 HTML 失败: ${(e as Error).message}`);
    } finally {
      setExportingHtml(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-neutral-100 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold">
              LIFE SEAL 闪卡成果导出中心 (WebGL 光学引擎)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs rounded-xl">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {/* 1. 导出独立可交互单文件 HTML */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-neutral-950 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-100">
                  导出独立交互网页 (Standalone HTML)
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  内嵌所有图层、卡片属性、流光框与光学蒙版着色器，双击即可把玩
                </div>
              </div>
            </div>
            <button
              onClick={handleExportStandaloneHtml}
              disabled={exportingHtml}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {exportingHtml ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              导出 HTML
            </button>
          </div>

          {/* 2. 导出高清 PNG */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-200">
                  导出当前全息合成 PNG
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  保存当前 3:4 高清卡牌快照（含毛玻璃/阳光蒙版、流光框与全部属性 UI）
                </div>
              </div>
            </div>
            <button
              onClick={handleExportPng}
              disabled={exportingPng}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {exportingPng ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              下载 PNG
            </button>
          </div>

          {/* 3. 导出 JSON 清单 */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-200">
                  导出卡片属性与光学配置 (.json)
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  导出包含图1/图2所有属性标签与光学蒙版参数的 life-seal-manifest.json
                </div>
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              下载 JSON
            </button>
          </div>

          {/* 4. 打包全部图层与配置导出 Zip */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-200">
                  完整闪卡工程资源包 (ZIP)
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  打包背景、主体、合成属性 UI 图层、结构线遮罩、卡背与 JSON 配置
                </div>
              </div>
            </div>
            <button
              onClick={handleExportZip}
              disabled={exportingZip}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {exportingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              打包下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
