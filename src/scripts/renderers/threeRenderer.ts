import * as THREE from 'three';
import { BaseRenderer } from './baseRenderer';
import * as seedrandom from 'seedrandom';
import gsap from 'gsap';
import vertShader from './shaders/vertShader.txt';
import fragShader from './shaders/fragShader.txt';
import bgVertShader from './shaders/bgVertShader.txt';
import bgFragShader from './shaders/bgFragShader.txt';

const WIDTH: number = 1920 / 2;
const HEIGHT: number = 1080 / 2;

const srandom = seedrandom('a');

let tl;

export default class ThreeRenderer implements BaseRenderer{
    
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    renderer: THREE.Renderer;
    group: THREE.Object3D;
    bg: THREE.Mesh;
    completeCallback: any;

    constructor(canvas: HTMLCanvasElement, completeCallback: any) {

        this.completeCallback = completeCallback;

        this.camera = new THREE.PerspectiveCamera( 70, WIDTH / HEIGHT, 0.01, 10 );
        this.camera.position.z = 1;
    
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x00c4ff );

        // ADD ITEMS HERE

        let bgUniforms = {
            delta: {
                value: 0
            }
        };
        let bgGeometry = new THREE.PlaneGeometry(5, 3);
        let bgMaterial = new THREE.ShaderMaterial({
            uniforms: bgUniforms,
            vertexShader: bgVertShader, 
            fragmentShader: bgFragShader
        }); 
        //bgMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
        this.bg = new THREE.Mesh( bgGeometry, bgMaterial );
        this.bg.position.set(0, 0, -1);
        this.scene.add(this.bg);

        this.group = new THREE.Object3D();
        
        let size = .1;

        for (let i = 0; i < 200; i++) {

            let x = -1.5 + (srandom() * 3);
            let y = -1 + (srandom() * 2);
            let z = -srandom();

            let uniforms = {
                r: { value: srandom() }, //0.0 + (i / 66)
                g: { value: 0.5 },
                b: { value: 1.0 },
                delta: {
                    value: 0
                }
            };
    
            let geometry = new THREE.TetrahedronGeometry(size, 0);
            let material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader: vertShader, 
                fragmentShader: fragShader
            });

            let scale = srandom();
            let mesh = new THREE.Mesh( geometry, material );
            mesh.position.set(x, y, z);
            //mesh.rotation.set(srandom(), srandom(), srandom());
            mesh.scale.set(scale, scale, scale);
            this.group.add(mesh);
        }

        this.scene.add( this.group );
    
        // END ADD ITEMS

        this.renderer = new THREE.WebGLRenderer( { 
            canvas: canvas, 
            antialias: true
        } );
        this.renderer.setSize( WIDTH, HEIGHT );

        this.createTimeline();
    }

    createTimeline() {

        tl = gsap.timeline({
            //delay: 0.2,             // delay to capture first frame
            repeat: window.DEBUG ? -1 : 0, // if debug repeat forever
            //repeatDelay: 1,
            paused: window.THUMBNAIL,
            onComplete: () => this.handleComplete()
        });

        tl.timeScale(3);

        // BUILD TIMELINE HERE

        for (let i = 0; i < this.group.children.length; i++) {
            let item = this.group.children[i];
            tl.to(item.rotation, {
                y: (Math.PI) * (Math.round(srandom() * 5)), 
                duration: 10,
                ease: 'none'
            }, 0);
            tl.to(item.rotation, {
                x: (Math.PI) * (Math.round(srandom() * 5)), 
                duration: 10,
                ease: 'none'
            }, 0);

            tl.to(item.material.uniforms.delta, {
                value: 1, 
                duration: 5,
                ease: 'power1.in'
            }, 0);
            tl.to(item.material.uniforms.delta, {
                value: 0, 
                duration: 5,
                ease: 'power1.out'
            }, 5);
        }
        
        
        tl.to(this.bg.material.uniforms.delta, {
            value: 0.5, 
            duration: 5,
            ease: 'power3.in'
        }, 0);
        tl.to(this.bg.material.uniforms.delta, {
            value: 0, 
            duration: 5,
            ease: 'power3.out'
        }, 5);
        

        // END TIMELINE

        console.log('DURATION:', tl.duration());
    }

    private handleComplete() {
        if (this.completeCallback) {
            this.completeCallback();
        }
    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }
}