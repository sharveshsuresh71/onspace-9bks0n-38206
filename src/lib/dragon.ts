import * as THREE from 'three';
import { APPEARANCES } from '@/constants/mythos';
export interface DragonRig { root: THREE.Group; body: THREE.Group; head: THREE.Group; jaw: THREE.Group; wings: THREE.Group[]; legs: THREE.Group[]; tail: THREE.Group; eyes: THREE.Mesh[]; materials: THREE.MeshStandardMaterial[]; }
const point = (v: number[]) => new THREE.Vector3(v[0],v[1],v[2]);
function tube(points: number[][], radius: number, material: THREE.Material) { return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point)),24,radius,8,false),material); }
function bone(a: number[], b: number[], radius: number, material: THREE.Material) { const start=point(a), end=point(b); const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.5,radius,start.distanceTo(end),7),material);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),point(b).sub(point(a)).normalize());return mesh; }
export function createDragon(): DragonRig {
 const root=new THREE.Group(),body=new THREE.Group(),head=new THREE.Group(),jaw=new THREE.Group(),tail=new THREE.Group();root.add(body);body.position.y=1.8;
 const scales=new THREE.MeshStandardMaterial({color:APPEARANCES[0].color,metalness:.65,roughness:.42});
 const membrane=new THREE.MeshStandardMaterial({color:APPEARANCES[0].accent,metalness:.2,roughness:.7,side:THREE.DoubleSide});
 const horn=new THREE.MeshStandardMaterial({color:'#485152',metalness:.8,roughness:.3}); const ember=new THREE.MeshStandardMaterial({color:'#a73621',emissive:'#b63216',emissiveIntensity:.6});
 const sphere=(parent:THREE.Group,p:number[],s:number[],mat:THREE.Material=scales)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),mat);mesh.position.set(...p as [number,number,number]);mesh.scale.set(...s as [number,number,number]);mesh.castShadow=true;parent.add(mesh);return mesh;};
 sphere(body,[.3,.3,0],[2.4,.95,.85]);sphere(body,[-1,.6,0],[1.25,1.04,.96]);sphere(body,[1.9,.2,0],[1.15,.7,.68]);
 body.add(tube([[-1.6,.6,0],[-2.1,1.2,0],[-2.7,1.8,0],[-3.2,2,0]],.55,scales));
 head.position.set(-3.2,2,0);body.add(head);sphere(head,[-.4,0,0],[.87,.48,.46]);sphere(head,[-1.13,-.1,0],[.75,.23,.34]);
 jaw.position.set(-.3,-.25,0);head.add(jaw);sphere(jaw,[-.73,-.04,0],[.94,.14,.32]);
 const eyes=[-1,1].map(side=>sphere(head,[-.59,.14,side*.405],[.12,.1,.045],new THREE.MeshStandardMaterial({color:'#ffbe79',emissive:'#fc431f',emissiveIntensity:3})));
 for(const side of [-1,1]){head.add(bone([-.05,.23,side*.32],[.5,.85,side*.57],.15,horn));head.add(bone([.5,.85,side*.57],[1.02,.9,side*.68],.09,horn));sphere(head,[-1.6,.06,side*.19],[.07,.04,.045],horn);for(let i=0;i<6;i++)jaw.add(bone([-.3-i*.22,.05,side*.25],[-.35-i*.22,.18,side*.23],.035,horn));}
 tail.position.set(2.6,.1,0);body.add(tail);tail.add(tube([[0,0,0],[1,-.1,.15],[2,-.35,.55],[3,-.65,1.1],[4,-.4,1.7]],.24,scales));
 for(let i=0;i<17;i++){const x=-2.7+i*.42;body.add(bone([x,.8+Math.sin((i/17)*Math.PI)*.4,0],[x+.14,1.4+Math.sin((i/17)*Math.PI)*.45,0],.14,horn));}
 for(let i=0;i<9;i++)tail.add(bone([i*.43,-.08-i*.07,i*i*.02],[i*.43+.2,.35-i*.09,i*i*.02],.10,horn));
 const wings=[-1,1].map(side=>{const wing=new THREE.Group();wing.position.set(-.55,.85,side*.6);body.add(wing);
 const pts=[[0,0,0],[-.2,1.3,side*1.3],[-.9,2,side*3],[-.35,2.15,side*5.2],[.5,1.1,side*4.35],[1.15,.55,side*4.4],[1.45,.3,side*3.2],[2.05,.0,side*3.1],[2,.0,side*1.9],[2.6,-.2,side*1.5],[1.6,-.1,side*.4]];
 const vertices:number[]=[];for(let i=1;i<pts.length-1;i++)vertices.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const skin=new THREE.Mesh(geo,membrane);skin.castShadow=true;wing.add(skin);
 wing.add(tube(pts.slice(0,4),.10,scales));for(const i of [3,5,7,9])wing.add(bone(pts[1],pts[i],.055,scales));for(let i=1;i<pts.length-1;i++)wing.add(bone(pts[i],pts[i+1],.028,scales));wing.add(bone(pts[3],[-.6,2.6,side*5.65],.09,horn));return wing;});
 const legs:THREE.Group[]=[];for(const x of [-1.35,1.65])for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(x,.05,side*.7);body.add(leg);sphere(leg,[.15,-.35,side*.14],[.43,.67,.4]);leg.add(bone([.1,-.6,side*.15],[x<0?-.3:.5,-1.15,side*.3],.24,scales));leg.add(bone([x<0?-.3:.5,-1.15,side*.3],[-.2,-1.65,side*.4],.14,scales));sphere(leg,[-.4,-1.65,side*.4],[.4,.15,.27]);for(let j=0;j<3;j++)leg.add(bone([-.5,-1.6,side*.4+(j-1)*.16],[-.94,-1.73,side*.4+(j-1)*.2],.07,horn));legs.push(leg);}
 const scaleGeo=new THREE.ConeGeometry(.10,.12,4);const instance=new THREE.InstancedMesh(scaleGeo,scales,300);const dummy=new THREE.Object3D();for(let i=0;i<300;i++){const t=i*.618*Math.PI*2,x=(i%30)/30*4.4-1.8,r=Math.sqrt(Math.max(.1,1-Math.pow((x-.2)/2.5,2)));dummy.position.set(x,.3+Math.cos(t)*r*.96,Math.sin(t)*r*.86);dummy.rotation.set(t,0,-Math.PI/2);dummy.updateMatrix();instance.setMatrixAt(i,dummy.matrix);}body.add(instance);
 for(let i=0;i<8;i++)sphere(body,[-1.4+i*.42,.82, .63],[.12,.035,.06],ember);
 return {root,body,head,jaw,wings,legs,tail,eyes,materials:[scales,membrane,ember]};
}
export function recolorDragon(rig:DragonRig,name:string){const preset=APPEARANCES.find(p=>p.name===name)||APPEARANCES[0];rig.materials[0].color.set(preset.color);rig.materials[1].color.set(preset.accent);rig.materials[2].emissive.set(preset.accent);}
