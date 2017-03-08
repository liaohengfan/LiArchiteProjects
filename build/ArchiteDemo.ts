/**
 * Created by Administrator on 2017/2/6.
 */

/**
 * libs
 */

///<reference types="@types/d3/index.d.ts" />
///<reference types="@types/jquery/index.d.ts" />
///<reference types="@types/three/index.d.ts" />
///<reference types="@types/three/detecotr.d.ts" />
///<reference types="@types/underscore/index.d.ts" />
///<ref-erence types="@types/tweenjs/index.d.ts" />

/**
 * coms
 */

///<ref-erence types="ArchiteTools.ts" />
///<ref-erence types="ArchiteBase.ts" />
/**     * UI管理     */
class ArchiteUI{
    constructor(dom_,webgl_){
        this.webgl=webgl_;
        this.domContainer=dom_;
        this.domID=d3.select(dom_).attr("id");
        this.domClass=d3.select(dom_).attr("class");
        this.appendUIStyle(".layui-btn{margin: 0;padding:0;min-width:38px;min-height: 38px;font-size: 20px;line-height: 38px;}");
        this.appendUIStyle(".layui-btn+.layui-btn{margin:0;padding:0}");
        this.appendUIStyle(".layui-form-label{width:auto;}");
        this.appendUIStyle(".layui-input-block{margin-left:0;}");
        this.createScale();
        this.createSearch();
        this.createSwitchControl();
        this.createBackgroundSet();
    }
    webgl=null;
    uiStyles=null;
    uiStylesStr="";
    domClass="";
    domID="";
    domContainer:HTMLElement=null;
    curArchite:ArchiteBase=null;

    appendUIStyle(styles_){
        if(!this.uiStyles){
            this.uiStyles=d3.select("head").append("style");
        }
        if(this.domID){
            styles_+=(this.domID+" "+styles_);
        }else if(this.domClass){
            styles_+=(this.domClass+" "+styles_);
        }else{
            styles_;
        }
        this.uiStylesStr+=styles_;
        this.uiStyles.html(this.uiStylesStr);
    }

    createScale(){
        var that_=this;
        var enlarge_=this.createBtn("+",[10,10,0,0],function(){
            if(that_.webgl){
                that_.webgl.zoomIn();
            }
        });
        var narrow_=this.createBtn("-",[10,48,0,0],function(){
            if(that_.webgl){
                that_.webgl.zoomAway();
            }
        });
    }
    createBtn(name_,pos_,callBack_){
        callBack_=callBack_||function(){};
        var position_={                left:0,top:0,right:0,bottom:0            };
        position_.left=pos_[0]||10;
        position_.top=pos_[1]||10;
        position_.right=pos_[2]||0;
        position_.bottom=pos_[3]||0;
        var btn_=d3.select(this.domContainer).append("button");
        btn_.attr("class","layui-btn layui-btn-primary");
        btn_.text(name_);
        btn_.style({
            "position":"absolute",
            "left":position_.left+"px",
            "top":position_.top+"px",
            "right":position_.right+"px",
            "bottom":position_.bottom+"px"
        });
        btn_.on("click",function(e_){
            callBack_();
        });
        return btn_;
    }

    /**         * 刷新UI数据         */
    updataUIByArchiteBase(archite_:ArchiteBase){
        this.curArchite=archite_;
        this.createFloorsBtn(archite_);
    }

    private createSearch(){
        var that_=this;
        var search_=d3.select(this.domContainer).append("div")
            .style({
                "width":"150px",
                "height":"50px",
                "position":"absolute",
                "left":"50px",
                "top":"10px",
                "right":"0px",
                "bottom":"0px"
            });
        var input_=search_.append("input")
            .attr({
                "class":"layui-input",
                "id":"funcareaSearchInput",
                "type":"text",
                "checked":"",
                "title":"搜索"
            });
        var searchBtn_=that_.createBtn("搜索",[200,10,0,0],function(){

            var searchName_=input_[0][0].value;
            if(!searchName_){
                msg("搜索内容为空！！");
                return;
            }
            if(searchName_==""){
                msg("搜索内容为空！！");
                return;
            }

            if(that_.webgl){
                that_.webgl.searchFuncArea(searchName_);
            }
        });
    }

    /**         * 创建功能开关         */
    private createSwitchControl() {

        var form_=d3.select(this.domContainer).append("form");
        form_.attr("class","layui-form");

        /**
         * 创建复选框
         * @param name_
         * @param pos_
         * @param callBack_
         */
        function createCheckBox(name_,pos_,callBack_){
            callBack_=callBack_||function(){};
            var position_={                left:0,top:0,right:0,bottom:0            };
            position_.left=pos_[0]||10;
            position_.top=pos_[1]||10;
            position_.right=pos_[2]||0;
            position_.bottom=pos_[3]||0;
            var checkItem_=form_.append("div")
                .style({
                    "width":"150px",
                    "height":"50px",
                    "position":"absolute",
                    "left":position_.left+"px",
                    "top":position_.top+"px",
                    "right":position_.right+"px",
                    "bottom":position_.bottom+"px"
                });
            var checkBoxDiv_=checkItem_.append("div")
                .attr("class","layui-input-block");
            var checkBox_=checkBoxDiv_.append("input")
                .attr({
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

        var that_=this;

        var pubPoint_=createCheckBox("公共设施",[0,100,0,0],function(enabled_){
            console.log("公共设施change:"+enabled_);
            if(that_.webgl){
                that_.webgl.pubPointEnabled(enabled_);
            }
        });
        var funcAreaName_=createCheckBox("店铺名称",[0,150,0,0],function(enabled_){
            console.log("店铺名称change:"+enabled_);
            if(that_.webgl){
                that_.webgl.funcAreasLabelEnabled(enabled_);
            }
        });

        var selectFunArea_=createCheckBox("店铺选择",[0,200,0,0],function(enabled_){
            console.log("店铺选择change:"+enabled_);
            if(that_.webgl){
                that_.webgl.selectEnabled=enabled_;
            }
        });

        var leftrightRotation_=createCheckBox("左右旋转",[0,250,0,0],function(enabled_){
            console.log("左右旋转change:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabledRotateLeft(enabled_);
            }
        });
        var upRotation_=createCheckBox("上下旋转",[0,300,0,0],function(enabled_){
            console.log("上下旋转change:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabledRotateUp(enabled_);
            }
        });
        var moveMap_=createCheckBox("移动地图",[0,350,0,0],function(enabled_){
            console.log("移动地图change:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabledMapMove(enabled_);
            }
        });

        var proShow_=createCheckBox("三维展示",[0,400,0,0],function(enabled_){
            console.log("三维展示change:"+enabled_);
            if(that_.webgl){
                that_.webgl.enabled3D(enabled_);
            }
        });

    }

    floorDom:HTMLElement=null;
    /**         * 创建楼层管理         */
    private createFloorsBtn(archite_:ArchiteBase){

        var that_=this;

        var floorsData_=archite_.oriData.Floors||[];
        if(!that_.floorDom){
            var floorDomTemp_=d3.select(that_.domContainer).append("div");
            that_.floorDom=floorDomTemp_;
            floorDomTemp_.style({
                "width":"50px",
                "height":"auto",
                "position":"absolute",
                "right":"10px",
                "top":"10px"
            });
        }
        var _floorDom=this.floorDom;

        //所有楼层
        var allBtn_=_floorDom.append("button")
            .attr("class","layui-btn layui-btn-primary")
            .text("All");
        allBtn_.on("click",function(e_){
            that_.showAllFloors();
        });

        var floorsDiv_=_floorDom.append("div")
            .style({
                "width":"50px",
                "max-height":"300px"
            });
        floorsDiv_.selectAll("button").remove();
        var floorBtns_=floorsDiv_.selectAll("button")
            .data(floorsData_)
            .enter()
            .append("button")
            .attr("class","layui-btn layui-btn-primary")
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
        var hideOther_=false;

        //是3D则不隐藏，不是3D就隐藏
        this.webgl.is3D?hideOther_=false:hideOther_=true;


        var selfloor_=this.curArchite.showFloorsMeshByID(item_._id,hideOther_);
        if(this.webgl){
            this.webgl.lookatYTweento(selfloor_.yAxis);
        }
    }

    /**
     * 显示所有楼层
     */
    private showAllFloors(){
        if(this.webgl){//所有楼层功能需要切换3D显示
            this.webgl.enabled3D(true);
        }
        if(this.curArchite){
            this.curArchite.showAllFloors();
        }
    }

    /**         * 创建背景颜色更改         */
    private createBackgroundSet() {
        var position_={                left:10,top:450,right:0,bottom:0            };
        var colorItem_=d3.select(this.domContainer).append("div")
            .style({
                "width":"150px",
                "height":"50px",
                "position":"absolute",
                "left":position_.left+"px",
                "top":position_.top+"px",
                "right":position_.right+"px",
                "bottom":position_.bottom+"px"
            });
        var colorlabel_=colorItem_.append("label")
            .style({
                "width": "75px",
                "height": "30px",
                "font-size": "14px",
                "float": "left",
                "line-height": "30px",
                "color": "white",
                "padding-left": "10px",
                "background": "#5fb878",
                "box-sizing": "border-box",
                "border-radius": "3px"
            }).text("背景颜色");
        var colorPlugs_=colorItem_.append("div")
            .attr("class","webgl_backgroundColor")
            .style({
                "float":"left",
                "width":"30px",
                "height":"30px",
                "background": "#f1f2f7",
                "border": "1px solid #5fb878"
            });

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



/**     * 数据管理     */
class ArchiteData{
    constructor(ui_:ArchiteUI,webgl_:ArchiteWebGL){
        this.ui=ui_;
        this.webgl=webgl_;
    }
    ui:ArchiteUI=null;
    webgl:ArchiteWebGL=null;
    is3D:Boolean=true;

    /**         * 获取指定数据         */
    getMapsbyAjax(url_,requestData_){
        var that_=this;
        $.ajax({
            type: "GET",
            url: url_,
            dataType: "json",
            data:requestData_,
            success: function (data_) {
                that_.parseMapsData(data_);
            }
        });
    }

    /**
     * 解析数据
     * @param data_
     */
    parseMapsData(data_){

        /**
         * 创建新的建筑
         * @type {liaohengfan.LI_ARCHITE.ArchiteBase}
         * @private
         */
        var newArchite_=new ArchiteBase(data_.data,this.is3D);

        /**             * 更新建筑信息             */
        this.webgl.updateMapByArchiteBase(newArchite_);
        this.ui.updataUIByArchiteBase(newArchite_);
    }
}

function init(){

    /**     * 建筑渲染     */
    var architeMain_=new ArchiteMain(document.getElementById("lhf_archite_wengl_container"),document.getElementById("lhf_archite_wengl_control"));

    /**     * ui     */
    var uimana_=new ArchiteUI(document.getElementById("lhf_archite_ui_container"),architeMain_.architewebgl);

    /**     * data mana     */
    var architeDataMana_=new ArchiteData(uimana_,architeMain_.architewebgl);
    //architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json",{});
    architeDataMana_.getMapsbyAjax("ajaxData/fangcaodi.json",{});

    function render(){
        requestAnimationFrame(render);

        architeMain_.render();

    }
    render();


    /**     * 自适应     */
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {

        let curWidth_=window.innerWidth;
        let curHeight_=window.innerHeight;

        architeMain_.windowResize(curWidth_,curHeight_);
    }
    onWindowResize();

}
window.onload=function(){
    init();
};