/**
 * Created by liaohengfan on 2017/4/8.
 */
/**
 * 路径规划
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
///<reference path="ArchiteMain.ts" />
///<reference path="ArchiteBase.ts" />
///<reference path="ArchiteRender.ts" />
class ArchiteRoute{
    points:Array<any>=[];
    constructor(){

    }
}
class ArchitePoint{
    constructor(
        xindex_:number,
        yindex_:number,
        left_:number=0,
        top_:number=0,
        width_:number=0,
        height_:number=0
    ){
        this.xNo=xindex_;
        this.yNo=yindex_;
        this.rect=new Rect(left_,top_,left_+width_,top_+height_);
    }
    isHinder:boolean=false;
    xNo:number=0;
    yNo:number=0;
    rect:Rect;
}