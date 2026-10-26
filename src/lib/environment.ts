import * as THREE from 'three';
import { WORLD_COLORS } from '@/constants/mythos';
import type { Environment } from '@/types/mythos';
export interface WorldScene { group:THREE.Group; particles:THREE.Points; glow:THREE.PointLight; }
export function createEnvironment(preset:Environment):WorldScene {
 const colors=WORLD_COLORS[preset],group=new THREE.Group();
 const stone=new THREE.MeshStandardMaterial({color:colors.ground,roughness:.88,metalness:.2});const glowMat=new THREE.MeshStandardMaterial({color:colors.glow,emissive:colors.glow,emissiveIntensity:2});
 const add=(geo:THREE.BufferGeometry,mat:THREE.Material,pos:number[],scale?:number[])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos as [number,number,number]);if(scale)m.scale.set(...scale as [number,number,number]);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;};
 add(new THREE.CylinderGeometry(9,7.8,1,64),stone,[0,-.6,0]);add(new THREE.ConeGeometry(7.8,5,12),stone,[0,-3.4,0]).rotation.z=Math.PI;
 add(new THREE.CylinderGeometry(8.9,8.9,.12,64),new THREE.MeshStandardMaterial({color:colors.ground,metalness:.55,roughness:.38}),[0,-.04,0]);
 for(const radius of [6.6,7.5]){const ring=add(new THREE.TorusGeometry(radius,.025,6,120),glowMat,[0,.04,0]);ring.rotation.x=-Math.PI/2;}
 for(let i=0;i<32;i++){const angle=i/32*Math.PI*2;const mark=add(new THREE.BoxGeometry(.045,.014,.3+(i%3)*.1),glowMat,[Math.cos(angle)*7.12,.05,Math.sin(angle)*7.12]);mark.rotation.y=-angle+Math.PI/2;}
 for(let i=0;i<18;i++){const a=i*2.4,r=8+(i%4)*.35;const rock=add(new THREE.DodecahedronGeometry(.7+(i%3)*.3,0),stone,[Math.cos(a)*r,-.15,Math.sin(a)*r],[1,1.1+(i%3)*.3,1]);rock.rotation.set(i, i*.7, i*.2);}
 for(let i=0;i<8;i++){const a=2.4+i*.35;const x=Math.cos(a)*7.7,z=Math.sin(a)*7.7;add(new THREE.CylinderGeometry(.4,.55,3.3+(i%3)*.8,6),stone,[x,1.7,z]);add(new THREE.BoxGeometry(1.1,.3,1.1),stone,[x,3.4+(i%3)*.4,z]);}
 if(preset==='astral'){
 const arch=add(new THREE.TorusGeometry(2.6,.32,6,48,Math.PI*1.73),stone,[1,2.8,-7]);arch.rotation.z=-.35;const line=add(new THREE.TorusGeometry(2.6,.035,6,64,Math.PI*1.7),glowMat,[1,2.8,-6.65]);line.rotation.z=-.35;
 for(let i=0;i<7;i++){const a=i*2.1;add(new THREE.ConeGeometry(.7,2.2,5),stone,[Math.cos(a)*22,4+i%3*2,-18-i*2],[2,1,2]).rotation.z=Math.PI;add(new THREE.DodecahedronGeometry(1.4),stone,[Math.cos(a)*22,5.4+i%3*2,-18-i*2],[2,.4,2]);}
 }else if(preset==='ember'){
 for(let i=0;i<7;i++){const lava=add(new THREE.BoxGeometry(.12,.02,4+i*.4),glowMat,[-7+i*2.2,.07,-2]);lava.rotation.y=i*.8;}
 for(let i=0;i<14;i++){const a=i*.48;add(new THREE.ConeGeometry(4,8+i%3*3,5),stone,[Math.cos(a)*23,1,-14+Math.sin(a)*12],[1,1,1]);}
 }else{
 const foliage=new THREE.MeshStandardMaterial({color:'#123c32',roughness:.9});
 for(let i=0;i<18;i++){const a=i*.7,x=Math.cos(a)*(12+i%3*2),z=Math.sin(a)*12-7;add(new THREE.CylinderGeometry(.22,.8,10+i%3*3,7),stone,[x,4.3,z]);for(let j=0;j<3;j++)add(new THREE.ConeGeometry(4-j*.6,5,8),foliage,[x,7+j*2,z]);}
 for(let i=0;i<35;i++){const a=i*2.39,r=6+(i%3);add(new THREE.SphereGeometry(.1,8,6),glowMat,[Math.cos(a)*r,.3,Math.sin(a)*r]);}
 }
 for(let i=0;i<10;i++){const a=i*2.3,r=7.8;const crystal=add(new THREE.OctahedronGeometry(.42,0),glowMat,[Math.cos(a)*r,.45,Math.sin(a)*r],[.6,2.8,.7]);crystal.rotation.z=.2*Math.sin(i);}
 const positions=new Float32Array(350*3);for(let i=0;i<350;i++){positions[i*3]=(Math.sin(i*127.1)*.5+.5)*50-25;positions[i*3+1]=(i%40)/40*14;positions[i*3+2]=(Math.cos(i*311.7)*.5+.5)*45-25;}
 const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:colors.glow,size:.045,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false}));group.add(particles);
 const glow=new THREE.PointLight(colors.glow,35,30,2);glow.position.set(3,4,-4);group.add(glow);return {group,particles,glow};
}
export function disposeGroup(group:THREE.Object3D){const materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>(),geometries=new Set<THREE.BufferGeometry>();group.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Points){geometries.add(obj.geometry);(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>materials.add(m));}});materials.forEach(material=>{Object.values(material).forEach(value=>{if(value instanceof THREE.Texture)textures.add(value);});material.dispose();});textures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry.dispose());}
