/**
 * Created by liaohengfan on 2017/3/7.
 */

/**
 * libs
 */

///<reference path="../@types/d3/index.d.ts" />
///<reference path="../@types/jquery/index.d.ts" />
///<reference path="../@types/three/index.d.ts" />
///<reference path="../@types/three/detector.d.ts" />
///<reference path="../@types/underscore/index.d.ts" />
///<reference path="../@types/tweenjs/index.d.ts" />

/**
 * coms
 */

///<reference path="ArchiteTools.ts" />
///<reference path="ArchiteBase.ts" />
///<reference path="ArchiteRender.ts" />
///<reference path="ArchiteFloor.ts" />


let V_WIDTH:Number=1280;
let V_HEIGHT:Number=720;
let FOR:Number=60;
let NEAR:Number=10;
let FAER:Number=10000;
let PI2:Number=Math.PI*2;
/**     * 信息输出     */
let msg=function(info_){
    if(layui.layer){
        layui.layer.msg(info_);
    }else{
        alert(info_);
    }
};
class ArchiteMain{

    architewebgl:ArchiteWebGL;
    constructor(container_,control_){
        /**     * detector     */
        if(!Detector.webgl){
            msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            return;
        }

        this.architewebgl=new ArchiteWebGL(container_,control_);


    }
    render(){
        TWEEN.update();
        this.architewebgl.render();
    }
    windowResize(w_,h_){
        V_WIDTH=w_;
        V_HEIGHT=h_;
        this.architewebgl.resize();
    }
}