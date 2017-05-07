/**
 * Created by liaohengfan on 2017/3/18.
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
/**     * UI管理     */
class ArchiteUI{
    constructor(dom_,webgl_){
        this.webgl=webgl_;
        this.domContainer=dom_;

        this.domID=d3.select(dom_).attr("id");
        this.domClass=d3.select(dom_).attr("class");
        this.appendUIStyle(".architeSearchContainer{position:absolute;top:0;left:0;z-index:100;padding:0;margin:0;background:#FFF;}");
        this.appendUIStyle(".SearchPubPointItem{width:100px;margin:5px;float:left;}");
        if(IsPC()){
            this.appendUIStyle(".architeScaleContainer{position:absolute;top:1vw;left:1vw;width:36px;}");
            this.appendUIStyle(".scaleBtn{width:100%;height:36px;padding:0;margin:0;}");
            this.appendUIStyle(".architeSearchDiv{position:absolute;right:1vw;top:1vw;}");
            this.appendUIStyle(".architeFloorBtnContainer{position:absolute;right:2vw;top:70px;}");
            this.appendUIStyle(".architeFloorBtn{width:100%;height:36px;padding:5px;margin:0;}");
            this.appendUIStyle(".architeFloorList{width:100%;}");
            this.appendUIStyle(".architeSearchInput{width: 20vw;height:1.8vw;line-height: 1.8vw;}");
            this.appendUIStyle(".architeSearchBtn{ width:3vw;height:2vw;}");
            this.appendUIStyle(".checkBoxContainer{position:absolute;top:100px;left:1vw;}");
            this.appendUIStyle(".architeSwitchDiv{width:9vw;height:2vw;line-height: 2vw;display:table;}");
            this.appendUIStyle(".architeSwitchCheckBox{width:2vw;display: table-cell;vertical-align: middle;}");
            this.appendUIStyle(".architeBackgroundColorChange {width: 7vw;height: 2vw;padding-right: 2vw;}");
            this.appendUIStyle(".webgl_backgroundColor{float:right;width:1vw;background:#f1f2f7;height:1vw;margin-right: 1.8vw;border:1px solid #000;");
        }else{
            this.appendUIStyle(".architeScaleContainer{position:absolute;top:10px;left:10px;width:30px;}");
            this.appendUIStyle(".scaleBtn{width:100%;height:30px;padding:0;margin:0;}");
            this.appendUIStyle(".architeSearchDiv{position:absolute;right:1vw;top:1vw;}");
            this.appendUIStyle(".architeFloorBtnContainer{position:absolute;right:5vw;top:16vw;}");
            //this.appendUIStyle(".architeFloorBtn{padding:0;margin:0;}");
            //this.appendUIStyle(".architeFloorBtn{width:100%;height:6vw;padding:0;margin:0;}");
            this.appendUIStyle(".architeFloorList{width:100%;}");
            this.appendUIStyle(".architeSearchInput{width: 24vw;height:4.6vw;line-height: 4.6vw;}");
            this.appendUIStyle(".architeSearchBtn{ width:12vw;height:6vw;}");
            this.appendUIStyle(".checkBoxContainer{position:absolute;top:80px;left:10px;}");
            this.appendUIStyle(".architeSwitchDiv{width:25vw;height:7vw;line-height: 7vw;display:table;}");
            this.appendUIStyle(".architeSwitchCheckBox{width:4vw;display: table-cell;vertical-align: middle;}");
            this.appendUIStyle(".architeBackgroundColorChange {width: 25vw;height: 7vw;}");
            this.appendUIStyle(".webgl_backgroundColor{float:right;width:4vw;background:#f1f2f7;height:4vw;margin-right: 1.8vw;margin-top:1vw;border:1px solid #000;");
        }

        this.checkBoxContainer=d3.select(dom_).append("div")
            .attr("class","checkBoxContainer");
    }

    webgl=null;
    uiStyles=null;
    uiStylesStr="";
    domClass="";
    domID="";
    checkBoxContainer:any=null;
    domContainer:HTMLElement=null;
    curArchite:ArchiteBase=null;

    search:ArchiteSearch;

    appendUIStyle(styles_){
        if(!this.uiStyles){
            this.uiStyles=d3.select("head").append("style");
        }
        if(this.domID){
            styles_=("#"+this.domID+" "+styles_);
        }else if(this.domClass){
            styles_=("."+this.domClass+" "+styles_);
        }else{
            styles_;
        }
        this.uiStylesStr+=styles_;
        this.uiStyles.html(this.uiStylesStr);
    }

    scaleDomContainer:any=null;
    openScale(){
        if(this.scaleDomContainer){
            console.log("放大缩小按钮已创建！！！");
            return;
        }
        var container_=d3.select(this.domContainer).append("div").attr("class","architeScaleContainer");
        this.scaleDomContainer=container_;
        var that_=this;
        var enlarge_=this.createBtn(container_,"+","scaleBtn",function(){
            if(that_.webgl){
                that_.webgl.zoomIn();
            }
        });
        var narrow_=this.createBtn(container_,"-","scaleBtn",function(){
            if(that_.webgl){
                that_.webgl.zoomAway();
            }
        });
    }
    createBtn(container_,name_,class_,callBack_){
        callBack_=callBack_||function(){};
        class_==""?class_=null:class_=class_;
        class_=(class_||"architeBtn");
        var btn_=container_.append("button");
        //btn_.attr("class",class_);
        btn_.attr("class","btn btn-default "+class_);
        btn_.text(name_);
        btn_.on("click",function(e_){
            callBack_();
        });
        return btn_;
    }

    /**         * 刷新UI数据         */
    updataUIByArchiteBase(archite_:ArchiteBase){
        this.curArchite=archite_;
        this.createFloorsBtn(archite_);
        if(this.search){
            this.search.bindArchite(archite_);
        }
    }

    createSearch:boolean=false;
    public openSearch(){
        if(this.createSearch) {
            console.log("搜索已经创建功能已经创建");
            return;
        }

        /**         * 创建搜索页面         */
        this.search=new ArchiteSearch(this.domContainer,this);

        this.createSearch=true;
        var that_=this;
        var search_=d3.select(this.domContainer).append("div")
            .attr("class","architeSearchDiv");
        var div1_=search_.append("div").attr("class","form-inline")
            .append("div").attr("class","input-group")
            .style("width","95px");
        var input_=div1_.append("input")
            .attr({
                "class":"form-control",
                "readonly":"",
                "placeholder":"搜索"
            });
        var icon_=div1_.append("div")
            .attr({
                "class":"input-group-addon"
            });
        icon_.append("div")
            .attr("class","glyphicon glyphicon-search");
        search_.on("click",()=>{
            if(this.search){
                this.search.showSearch();
            }
        });
    }
    /**
     * 创建复选框
     * @param name_
     * @param pos_
     * @param callBack_
     */
    private createCheckBox(name_,pos_,callBack_){
        callBack_=callBack_||function(){};
        var checkItem_=this.checkBoxContainer.append("div")
            .attr("class","architeSwitchDiv");
        var checkBoxDiv_=checkItem_.append("span")
            .attr("class","architeSwitchName")
            .text(name_);
        var checkBox_=checkItem_.append("input")
            .attr({
                "class":"architeSwitchCheckBox",
                "type":"checkbox",
                "checked":"",
                "name":"open",
                "title":name_
            });
        checkItem_.on("click",function(e_){
            var enbaled_ = checkBox_[0][0].checked;
            callBack_(enbaled_);
        });
        return checkItem_;
    }

    pubPoint:any=null;
    public showPubPointSwitch(){
        var that_=this;
        if(this.pubPoint)return;
        this.pubPoint=this.createCheckBox("公共设施",[0,100,0,0],function(enabled_){
            console.log("公共设施:"+enabled_);
            if(that_.webgl){
                that_.webgl.pubPointEnabled(enabled_);
            }
        });
    }

    funcAreaName:any=null;
    public showFuncAreaNameSwitch(){
        var that_=this;
        if(this.funcAreaName)return;
        this.funcAreaName=this.createCheckBox("店铺名称",[0,100,0,0],function(enabled_){
            console.log("店铺名称:"+enabled_);
            if(that_.webgl){
                that_.webgl.funcAreasLabelEnabled(enabled_);
            }
        });
    }

    funcAreaSelect:any=null;
    public showFuncSelectSwitch(){
        var that_=this;
        if(this.funcAreaSelect)return;
        this.funcAreaSelect=this.createCheckBox("店铺选择",[0,100,0,0],function(enabled_){
            console.log("店铺选择:"+enabled_);
            if(that_.webgl){
                that_.webgl.selectEnabled=enabled_;
            }
        });
    }
    yAxisRotation:any=null;
    public showYAxisRotateSwitch(){
        var that_=this;
        if(this.yAxisRotation)return;
        this.yAxisRotation=this.createCheckBox("左右旋转",[0,100,0,0],function(enabled_){
            console.log("左右旋转:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabledRotateLeft(enabled_);
            }
        });
    }
    xAxisRotation:any=null;
    public showXAxisRotateSwitch(){
        var that_=this;
        if(this.xAxisRotation)return;
        this.xAxisRotation=this.createCheckBox("上下旋转",[0,100,0,0],function(enabled_){
            console.log("上下旋转:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabledRotateUp(enabled_);
            }
        });
    }
    moveMap:any=null;
    public showMoveMapSwitch(){
        var that_=this;
        if(this.moveMap)return;
        this.moveMap=this.createCheckBox("移动地图",[0,100,0,0],function(enabled_){
            console.log("移动地图:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabledMapMove(enabled_);
            }
        });
    }

    viewModels:any=null;
    public viewPatternSwitch(){
        var that_=this;
        if(this.viewModels)return;
        this.viewModels=this.createCheckBox("三维展示",[0,100,0,0],function(enabled_){
            console.log("三维展示:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabled3D(enabled_);
            }
        });
    }

    floorDom:any=null;
    /**         * 创建楼层管理         */
    private createFloorsBtn(archite_:ArchiteBase){
        var that_=this;
        if(that_.floorDom){
            return;
        }
        var floorsData_=archite_.oriData.Floors||[];
        that_.floorDom=d3.select(that_.domContainer).append("div");
        that_.floorDom.attr("class","architeFloorBtnContainer row");
        var _floorDom=that_.floorDom;

        //所有楼层
        var allBtn_=_floorDom.append("button")
            //.attr("class","architeFloorBtn")
            .attr("class","btn btn-default architeFloorBtn col-xs-12")
            .text("All");
        allBtn_.on("click",function(e_){
            that_.showAllFloors();
        });

        var floorsDiv_=_floorDom.append("div")
            .attr("class","architeFloorList");
        floorsDiv_.selectAll("button").remove();
        var floorBtns_=floorsDiv_.selectAll("button")
            .data(floorsData_)
            .enter()
            .append("button")
            //.attr("class","architeFloorBtn")
            .attr("class","btn btn-default architeFloorBtn  col-xs-12")
            .text(function(item_){
                return item_.Name||"--";
            })
            .on("click",(item_)=>{
                that_.selectFloor(item_);
            });
    }

    /**
     * 选择楼层
     * @param e_
     */
    private selectFloor(item_: any) {
        console.log(item_);

        //隐藏其他楼层？
        var hideOther_=true;

        //是3D则不隐藏，不是3D就隐藏
        //this.webgl.is3D?hideOther_=false:hideOther_=true;


        var selfloor_=this.curArchite.showFloorsMeshByID(item_._id,hideOther_);
        if(this.webgl){
            this.webgl.removeAllMarkPoint();
            this.webgl.lookatYTweento(selfloor_.yAxis);
            //this.webgl.cameraLookPoint(new THREE.Vector3(0,selfloor_.yAxis,0));
        }
    }

    /**
     * 显示所有楼层
     */
    private showAllFloors(){
        if(this.webgl){//所有楼层功能需要切换3D显示
            this.webgl.reset();
            this.webgl.removeAllMarkPoint();
            this.webgl.enabled3D(true);
        }
        if(this.curArchite){
            this.curArchite.showAllFloors();
        }
    }

    backgroundColorChange:any=null;
    /**         * 创建背景颜色更改         */
    public createBackgroundSet() {
        if(this.backgroundColorChange){
            return;
        }
        var colorItem_=this.checkBoxContainer.append("div")
            .attr("class","architeBackgroundColorChange");
        this.backgroundColorChange=colorItem_;
        var colorlabel_=colorItem_.append("label")
            .attr("class","architeBackgroundName")
            .text("背景颜色");
        var colorPlugs_=colorItem_.append("div")
            .attr("class","webgl_backgroundColor");

        $('.webgl_backgroundColor').colpick({
            color:"f1f2f7",
            onSubmit:(hsb,hex,rgb,el)=>{

                colorPlugs_.style("background","#"+hex);

                hex="0x"+hex;
                hex=Math.floor(hex);
                this.webglBackgroundChange(hex);
            }
        })
    }

    /**
     * webgl背景颜色更改
     * @param hex_
     */
    private webglBackgroundChange(hex_){
        if(this.webgl){
            this.webgl.backgroundSet(hex_);
        }
    }
}