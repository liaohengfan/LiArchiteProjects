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

var V_WIDTH:any=1280;
var V_HEIGHT:any=720;
var FOR:any=60;
var NEAR:any=10;
var FAER:any=10000;
var PI2:any=Math.PI*2;


const ICON_ASSET_BASE="asset/PublicPointIco/";
const ICON_TYPE_CHECK=[
    {name:"ATM",type:"31003",ico:"ATM.png",en:""},
    {name:"残障洗手间",type:"11005",ico:"crippled.png",en:""},
    {name:"出入口",type:"31004",ico:"entry.png",en:""},
    {name:"扶梯",type:"21002",ico:"escalator.png",en:""},
    {name:"女洗手间",type:"11003",ico:"Female.png",en:""},
    {name:"问讯处",type:"31001",ico:"inquiry.png",en:""},
    {name:"直梯",type:"21003",ico:"lift.png",en:""},
    {name:"补妆间",type:"31002",ico:"Makeup.png",en:""},
    {name:"男洗手间",type:"11002",ico:"Male.png",en:""},
    {name:"母婴室",type:"11004",ico:"MomBaby.png",en:""},
    {name:"楼梯",type:"21001",ico:"stair.png",en:""},
    {name:"洗手间",type:"11001",ico:"toilet.png",en:""}
];


/**
 * 通过type获取icon
 */
function getIconUrlByType(type_){
    var obj_=_.findWhere(ICON_TYPE_CHECK,{type:type_});
    if(obj_){
        return (ICON_ASSET_BASE+obj_.ico);
    }
    return "";

}
/**
 * 判断是不是电脑
 * @returns {boolean}
 * @constructor
 */
let IsPC=function()
{
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
};
/**     * 信息输出     */
let msg=function(info_){
    if(layer){
        layer.msg(info_);
    }else{
        alert(info_);
    }
};
class ArchiteMain{

    architeResources:ArchiteResources;
    architewebgl:ArchiteWebGL;
    constructor(container_,control_,uicontainer=null){
        /**     * detector     */
        if(!Detector.webgl){
            msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
        }
        this.architeResources=new ArchiteResources();
        for (var i = 0; i < ICON_TYPE_CHECK.length; i++) {
            var icon_ = ICON_TYPE_CHECK[i];
            var url_=ICON_ASSET_BASE+icon_.ico;
            this.architeResources.addTexture(icon_.type,url_);
        }
        this.architeResources.addTexture("MARKPOINT",ICON_ASSET_BASE+"markPoint.png");//标记点
        this.architewebgl=new ArchiteWebGL(container_,control_,this.architeResources);


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