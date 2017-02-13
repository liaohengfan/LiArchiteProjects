/**
 * Created by Administrator on 2017/2/6.
 */
namespace liaohengfan.LI_ARCHITE{


    // change by 2017.02.09

    let V_WIDTH:Number=1280;
    let V_HEIGHT:Number=720;
    let FOR:Number=60;
    let NEAR:Number=10;
    let FAER:Number=10000;

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
    let PI2:Number=Math.PI*2;


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

    /**     * 信息输出     */
    let msg=function(info_){
        if(layui.layer){
            layui.layer.msg(info_);
        }else{
            alert(info_);
        }
    };

    /**
     * 解析 2 维坐标
     * @param pointArray
     * @returns {Array}
     */
    function parseVec2Points(pointArray){
        var shapePoints = [];
        for(var i=0; i < pointArray.length; i+=2){
            var point = new THREE.Vector2(pointArray[i], pointArray[i+1]);
            if(i>0) {
                var lastpoint = shapePoints[shapePoints.length - 1];
                if (point.x != lastpoint.x || point.y != lastpoint.y) { //there are some duplicate points in the original data
                    shapePoints.push(point);
                }
            }else{
                shapePoints.push(point);
            }
        }
        return shapePoints;
    }

    /**     *  text 2 canvas Texture     */
    function getLabelTexture(str_){
        //var canvas=document.getElementById('canvasTexture');
        //var texture_=new THREE.Texture(canvas);

        var canvas=document.createElement("canvas");
        var ctx_=canvas.getContext('2d');
        /*ctx_.fillStyle='rgba(0,0,0,0)';
        ctx_.fillRect(0,0,100,50);*/

        ctx_.strokeStyle = '#FFFFFF';//边框颜色
        ctx_.fillStyle = '#000000';//填充颜色
        ctx_.lineWidth = '3';

        ctx_.font="40px Arial";
        ctx_.strokeText(str_,10,50);
        ctx_.fillText(str_,10,50);
        var texture_=new THREE.Texture(canvas);
        return texture_;

    }

    /**     * 给图片添加外边框     */
    function imageAddBorderTexture(img_){
        var canvas=document.createElement("canvas");
        document.body.appendChild(canvas);
        var ctx_=canvas.getContext('2d');
        ctx_.drawImage(img_,0,0);
        var texture_=new THREE.Texture(canvas);
        return texture_;

    }

    /**     * 解析所有轮廓     */
    function getDataMesh(data_,high_=1,color_=0xFFFFFF){
        var outline={
            outline3D:new THREE.Object3D(),
            outline2D:new THREE.Object3D()
        };
        data_=data_||{};
        data_.Outline=data_.Outline||[];
        /**         * 轮廓         */
        if(data_.Outline){

            var buildingExtrudeSettings:Object={
                amount: 10,
                bevelEnabled: false,
                curveSegments: 1,
                steps: 1
            };

            /**                     * 编译所有轮廓                     */
            for (var i = 0; i < data_.Outline.length; i++) {
                var outlinePoints_ = data_.Outline[i];
                outlinePoints_=outlinePoints_||[];
                for (var j = 0; j < outlinePoints_.length; j++) {
                    var point = parseVec2Points(outlinePoints_[j]);
                    var outLineShape_=new THREE.Shape(point);

                    var outLine2DGeo_=new THREE.ShapeGeometry(outLineShape_);
                    var outLine2DMesh_=new THREE.Mesh(outLine2DGeo_,new THREE.MeshBasicMaterial({
                        color:(color_||0xFFFFFF)
                    }));

                    /**                             * 楼层高度                             */
                    buildingExtrudeSettings.amount=(data_.High||high_)*10;

                    var outLine3DGeo_=new THREE.ExtrudeGeometry(outLineShape_,buildingExtrudeSettings);
                    var outLine3DMesh_=new THREE.Mesh(outLine3DGeo_,new THREE.MeshLambertMaterial({
                        color:(color_||0xFFFFFF)
                    }));
                    color_+=1;
                    outline.outline3D.add(outLine3DMesh_);
                    outline.outline2D.add(outLine2DMesh_);
                }
            }
            //mesh_.position.z=buildingExtrudeSettings.amount;
        }
        return outline;
    }/**     * 解析所有轮廓     */
    function getLimitHeightDataMesh(data_,high_=1,color_=0xFFFFFF){
        var outline={
            outline3D:new THREE.Object3D(),
            outline2D:new THREE.Object3D()
        };
        data_=data_||{};
        data_.Outline=data_.Outline||[];
        /**         * 轮廓         */
        if(data_.Outline){

            var buildingExtrudeSettings:Object={
                amount: 10,
                bevelEnabled: false,
                curveSegments: 1,
                steps: 1
            };

            /**                     * 编译所有轮廓                     */
            for (var i = 0; i < data_.Outline.length; i++) {
                var outlinePoints_ = data_.Outline[i];
                outlinePoints_=outlinePoints_||[];
                for (var j = 0; j < outlinePoints_.length; j++) {
                    var point = parseVec2Points(outlinePoints_[j]);
                    var outLineShape_=new THREE.Shape(point);

                    var outLine2DGeo_=new THREE.ShapeGeometry(outLineShape_);
                    var outLine2DMesh_=new THREE.Mesh(outLine2DGeo_,new THREE.MeshBasicMaterial({
                        color:(color_||0xFFFFFF)
                    }));

                    /**                             * 楼层高度                             */
                    buildingExtrudeSettings.amount=(high_)*10;

                    var outLine3DGeo_=new THREE.ExtrudeGeometry(outLineShape_,buildingExtrudeSettings);
                    var outLine3DMesh_=new THREE.Mesh(outLine3DGeo_,new THREE.MeshLambertMaterial({
                        color:(color_||0xFFFFFF)
                    }));
                    color_+=1;
                    outline.outline3D.add(outLine3DMesh_);
                    outline.outline2D.add(outLine2DMesh_);
                }
            }
            //mesh_.position.z=buildingExtrudeSettings.amount;
        }
        return outline;
    }

    /**     * 修改透明度     */
    function meshChangeOpacity(object3D_,alpha_){
        alpha_=alpha_||1;
        var transparent_=true;
        if(alpha_>=1){
            transparent_=false;
        }

        function changeOpacity(mesh_){
            if(mesh_&&mesh_.type=="Mesh"){
                if(mesh_.material) {
                    mesh_.material.transparent = transparent_;
                    mesh_.material.opacity = alpha_;
                }
            }

            if(mesh_&&mesh_.type=="Sprite"){
                if(mesh_.material) {
                    mesh_.material.transparent = transparent_;
                    mesh_.material.opacity = alpha_;
                }
            }

            if(mesh_.children&&mesh_.children.length){
                for (var i = 0; i < mesh_.children.length; i++) {
                    var object3d_ = mesh_.children[i];
                    changeOpacity(object3d_);

                }
            }
        }
        if(object3D_){
            changeOpacity(object3D_);
        }

    }


    /**     * 门店     */
    class ArchiteFuncArea{
        constructor(data_,high_,color_){
            this.archite_id=data_._id;
            this.archite_name=data_.Name;
            var outLine_=getDataMesh(data_,high_,color_);
            this.mesh=outLine_.outline3D;
            this.plane=outLine_.outline2D;
        }
        archite_show=true;
        archite_name="";
        archite_id="";
        mesh=null;
        plane=null;
    }

    /**     * 楼层     */
    class ArchiteFloor{

        constructor(data_,y_){
            this.floorData=data_;
            this.archite_id=data_._id;
            this.archite_name=data_.Name;
            this.yAxis=y_;
            this.floorHigh=data_.High*10;
        }
        archite_show=true;
        archite_name="";
        archite_id="";
        floorData=null;

        yAxis=0;
        floorHigh=0;

        /**
         * 公共设施点
         * @type {any}
         */
        PubPoints=null;
        /**         * 公共服务点         */
        getPubPoints(enabled_){

            if(this.PubPoints){
                this.PubPoints.visible=enabled_;
                return this.PubPoints;
            }

            this.PubPoints=new THREE.Object3D();
            this.PubPoints.position.z=(this.yAxis)+16;
            this.PubPoints.visible=enabled_;

            //公共设施
            if(this.floorData.PubPoint){
                this.floorData.PubPoint=this.floorData.PubPoint||[];

                var y_z=this.floorData.High;
                y_z*=10;

                for (var i = 0; i < this.floorData.PubPoint.length; i++) {
                    var point_ = this.floorData.PubPoint[i];
                    var position_=point_.Outline[0][0];
                    var positionVec3=new THREE.Vector3(position_[0]||0,position_[1],y_z);

                    /*(function(this_){
                        var img_=new Image();
                        img_.src="asset/PublicPointIco/100002.png";
                        img_.onload=function(){
                            var material_=new THREE.SpriteMaterial({
                                map:imageAddBorderTexture(img_),
                                color:0xFFFFFF,
                                depthTest:false
                            });
                            //material_.sizeAttenuation=false;
                            material_.map.sizeAttenuation=false;
                            material_.map.needsUpdate=true;
                            var sprite_=new THREE.Sprite(material_);
                            sprite_.scale.set(32,32,1);
                            sprite_.position.copy(positionVec3);
                            this_.PubPoints.add(sprite_);
                        };
                    })(this);*/

                    var ico_=getIconUrlByType(point_.Type);

                    //图标待确认
                    var material_=new THREE.SpriteMaterial({
                        //map:new THREE.TextureLoader().load("asset/PublicPointIco/100002.png"),
                        map:new THREE.TextureLoader().load(ico_),
                        color:0xFFFFFF,
                        depthTest:false
                    });
                    material_.sizeAttenuation=false;
                    var sprite_=new THREE.Sprite(material_);
                    sprite_.scale.set(32,32,1);
                    sprite_.position.copy(positionVec3);
                    this.PubPoints.add(sprite_);


                }
            }

            return this.PubPoints;

        }


        floorGround=null;
        floorGround2D=null;

        /**         * 楼层地板         */
        getFloorGround(is3D_=true){
            if(this.floorGround){
                if(is3D_){
                    return this.floorGround;
                }else{
                    return this.floorGround2D;
                }
            }
            this.floorGround=new THREE.Object3D();
            this.floorGround.position.z=this.yAxis-10;
            this.floorGround2D=new THREE.Object3D();
            this.floorGround2D.position.z=(this.yAxis+this.floorHigh)-1;
            if(this.floorData.Outline){
                var floor_=getLimitHeightDataMesh(this.floorData,1,0xFFFFFF);
                this.floorGround.add(floor_.outline3D);
                this.floorGround2D.add(floor_.outline2D);
            }
            if(is3D_){
                return this.floorGround;
            }else{
                return this.floorGround2D;
            }
        }

        funcAreaMesh=null;
        funcAreaMesh2D=null;
        /**         * 店面         */
        getFuncAreasMesh(is3D_){

            //模型已经创建
            if(this.funcAreaMesh){
                if(is3D_){
                    return this.funcAreaMesh;
                }else{
                    return this.funcAreaMesh2D;
                }
            }

            this.funcAreaMesh=new THREE.Object3D();
            this.funcAreaMesh.position.z=this.yAxis;

            this.funcAreaMesh2D=new THREE.Object3D();
            this.funcAreaMesh2D.position.z=(this.yAxis+this.floorHigh);

            //店面
            if(this.floorData.FuncAreas){
                var funcareas_=this.floorData.FuncAreas;
                var high_=this.floorData.High;
                /**                     * 编译所有店面轮廓                     */
                for (var i = 0; i < funcareas_.length; i++) {

                    var colors_=[0xc9fbc9,0x97c9fb,0xc9c9fb];
                    var color_=_.sample(colors_);

                    //创建门店
                    var funcarea_ = new ArchiteFuncArea(funcareas_[i],high_,color_);
                    this.funcAreaMesh.add(funcarea_.mesh);
                    this.funcAreaMesh2D.add(funcarea_.plane);

                }
            }

            if(is3D_){
                return this.funcAreaMesh;
            }else{
                return this.funcAreaMesh2D;
            }
        }

        /**         * 店铺         */
        funcAreasLabels=null;

        /**         * 获取所有店面名称         */
        getFuncAreasLabel(enabled_){
            if(this.funcAreasLabels){
                this.funcAreasLabels.visible=enabled_;
                return this.funcAreasLabels;
            }

            this.funcAreasLabels=new THREE.Object3D();
            this.funcAreasLabels.position.z=(this.yAxis);
            this.funcAreasLabels.visible=enabled_;
            //公共设施
            if(this.floorData.FuncAreas){
                this.floorData.FuncAreas=this.floorData.FuncAreas||[];

                var y_z=this.floorData.High;
                y_z*=10;

                for (var i = 0; i < this.floorData.FuncAreas.length; i++) {
                    var point_ = this.floorData.FuncAreas[i];
                    var position_=point_.Center;
                    var positionVec3=new THREE.Vector3(position_[0]||0,position_[1],y_z);
                    var material_=new THREE.SpriteMaterial({
                        map:getLabelTexture(point_.Name||" "),
                        depthTest:false,
                        color:0xFFFFFF
                    });
                    material_.map.needsUpdate=true;
                    material_.sizeAttenuation=false;
                    var label_=new THREE.Sprite(material_);
                    label_.scale.set(100,50,1);
                    label_.position.copy(positionVec3);
                    this.funcAreasLabels.add(label_);
                }
            }
            return this.funcAreasLabels;
        }
    }

    /**     * 建筑基类     */
    class ArchiteBase{
        constructor(data_:Object,is3D_){
            this.oriData=data_;
            this.ArchiteName=this.oriData.building.Name;
            this.ArchiteOutLine=this.oriData.building.Outline;
            this.ArchiteID=this.oriData.building._id;


            this.archite_id=data_._id;
            this.archite_name=data_.Name;

            this.is3D=is3D_;

            this.oriData.Floors=this.oriData.Floors||[];

            /**             * 地面地板             */
            this.floorGround=new THREE.Object3D();
            this.floorGround2D=new THREE.Object3D();

            /**             * 创建大厦3D对象             */
            this.ArchiteMesh=new THREE.Object3D();
            this.ArchiteMesh2D=new THREE.Object3D();

            /**             * 创建标注对象             */
            this.ArchiteSprite=new THREE.Object3D();
            this.ArchiteIcon=new THREE.Object3D();
            this.ArchiteLabel=new THREE.Object3D();
            this.ArchiteSprite.add(this.ArchiteIcon);
            this.ArchiteSprite.add(this.ArchiteLabel);


            /**             * 旋转             */
            this.floorGround.rotateX(-(Math.PI/2));
            this.floorGround2D.rotateX(-(Math.PI/2));
            this.ArchiteMesh.rotateX(-(Math.PI/2));
            this.ArchiteMesh2D.rotateX(-(Math.PI/2));
            this.ArchiteSprite.rotateX(-(Math.PI/2));

            //大厦轮廓
            //this.parseBuildingOutLine();
        }

        archite_show=true;
        archite_name="";
        archite_id="";

        is3D:Boolean=true;
        showall:Boolean=false;

        /**         * oriData         */
        oriData:Object=null;

        /**         * 建筑名称         */
        ArchiteName:String="";

        /**         * 建筑轮廓         */
        ArchiteOutLine:Array=[];

        /**         * 建筑id         */
        ArchiteID:String="";

        /**         * 大厦模型         */
        ArchiteMesh=null;
        ArchiteMesh2D=null;

        /**         * 大厦地面         */
        floorGround=null;
        floorGround2D=null;

        /**         * 标注         */
        ArchiteSprite=null;
        ArchiteIcon=null;
        ArchiteLabel=null;

        /**         * 楼层         */
        architeFloors=[];

        /**         * 轮廓模型         */
        buildingOutLine:Object=null;
        buildingOutLineShow=false;
        /**         * 解析建筑轮廓         */
        parseBuildingOutLine(){
            this.buildingOutLine=getDataMesh(this.oriData.building).outline3D;
            this.buildingOutLine.visible=this.buildingOutLineShow;

            this.ArchiteMesh.add(this.buildingOutLine);
        }
        /**         * 大厦轮廓展示         */
        enabledBuildingOutLine(enabled_){
            this.buildingOutLine.visible=enabled_;
            this.buildingOutLineShow=enabled_;
        }

        /**
         * 获取默认楼层
         * @returns {any}
         */
        getDefaultFoolr(){
            return this.oriData.building.DefaultFloor;
        }

        /**         * 获取楼层Y轴坐标         */
        getFloorY(id_){
            var trueFloors=null;
            var y_=0;
            if(id_>0){
                trueFloors=_.filter(this.oriData.Floors,function(item_){
                    return ((item_._id<id_)&&(item_._id>=0));
                });
                _.map(trueFloors,function(item_){
                    y_+=(item_.High||0);
                });
                return y_;
            }else{
                trueFloors=_.filter(this.oriData.Floors,function(item_){
                    return ((item_._id>=id_)&&(item_._id<=0));
                });
                _.map(trueFloors,function(item_){
                    y_-=(item_.High||0);
                });
                return y_;
            }


        }

        /**         * 展示楼层模型         */
        showFloorsMeshByID(floor_){

            var selectFloors=null;
            selectFloors=_.findWhere(this.architeFloors,{archite_id:floor_});

            /**
             * 需要隐藏的楼层
             * @type {any}
             */
            var hideFloors=null;
            hideFloors=_.reject(this.architeFloors,function(item_){
                return item_.archite_id==floor_;
            });

            if(hideFloors&&hideFloors.length){
                for (var i = 0; i < hideFloors.length; i++) {
                    var tempFloor_:ArchiteFloor = hideFloors[i];
                    if(tempFloor_.floorGround)meshChangeOpacity(tempFloor_.floorGround,0.1);
                    if(tempFloor_.funcAreaMesh)meshChangeOpacity(tempFloor_.funcAreaMesh,0.1);
                    if(tempFloor_.PubPoints)meshChangeOpacity(tempFloor_.PubPoints,0.1);
                    if(tempFloor_.funcAreasLabels)meshChangeOpacity(tempFloor_.funcAreasLabels,0.1);
                }
            }

            //对应楼层是否已创建
            if(selectFloors){
                //当前仅选中的楼层显示
                if(selectFloors.floorGround)meshChangeOpacity(selectFloors.floorGround,1);
                if(selectFloors.funcAreaMesh)meshChangeOpacity(selectFloors.funcAreaMesh,1);
                if(selectFloors.PubPoints)meshChangeOpacity(selectFloors.PubPoints,1);
                if(selectFloors.funcAreasLabels)meshChangeOpacity(selectFloors.funcAreasLabels,1);

            }else{

                //不存在选择的模型，则创建
                selectFloors=this.createFloors(floor_);
                this.architeFloors.push(selectFloors);//添加到已创建模型

                //展示模型
                this.ArchiteMesh.add(selectFloors.getFuncAreasMesh(true));
                this.ArchiteMesh2D.add(selectFloors.getFuncAreasMesh(false));

                //展示楼层地板
                this.floorGround.add(selectFloors.getFloorGround(true));
                this.floorGround2D.add(selectFloors.getFloorGround(false));

                //显示标注
                this.ArchiteIcon.add(selectFloors.getPubPoints(this.pubPointShow));
                this.ArchiteIcon.add(selectFloors.getFuncAreasLabel(this.funcareaLabelShow));
            }

            return selectFloors;

        }

        /**         * 隐藏所有楼层         */
        hideAllFloors(){

        }

        pubPointShow=true;
        /**         * 楼层公共设施         */
        enabledFloorsPubPoints(show_){
            this.pubPointShow=show_;
            //查询所有显示的楼层
            var curShowFloors_=_.where(this.architeFloors,{archite_show:true});

            for (var i = 0; i < curShowFloors_.length; i++) {
                var obj = curShowFloors_[i];
                this.ArchiteIcon.add(obj.getPubPoints(show_));
            }
        }

        funcareaLabelShow=true;
        /**         * 楼层标注         */
        enabledFloorsLabel(show_){
            this.funcareaLabelShow=show_;
            //查询所有显示的楼层
            var curShowFloors_=_.where(this.architeFloors,{archite_show:true});

            for (var i = 0; i < curShowFloors_.length; i++) {
                var obj = curShowFloors_[i];
                this.ArchiteIcon.add(obj.getFuncAreasLabel(show_));
            }
        }

        /**
         * 创建对应模型
         * @returns {liaohengfan.LI_ARCHITE.ArchiteFloor}
         */
        createFloors(floor_){
            var floorData_=null;
            /**             * 所有楼层             */
            floorData_=_.findWhere(this.oriData.Floors||[],{_id:floor_});

            //没有找到对应楼层
            if(!floorData_)return;

            var y_=this.getFloorY(floor_);

            //创建楼层
            var floor_=new ArchiteFloor(floorData_,y_*30);

            return floor_;
        }
    }



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
            var floorsData_=archite_.oriData.Floors||[];
            if(!this.floorDom){
                var floorDomTemp_=d3.select(this.domContainer).append("div");
                this.floorDom=floorDomTemp_;
                floorDomTemp_.style({
                    "width":"50px",
                    "height":"auto",
                    "position":"absolute",
                    "right":"10px",
                    "top":"10px"
                });
            }
            var _floorDom=this.floorDom;
            /*
             var allBtn_=_floorDom.append("button")
             .attr("class","layui-btn layui-btn-primary")
             .text("all");
             */
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
                    this.selectFloor(item_);
                });
        }

        /**
         * 选择楼层
         * @param e_
         */
        private selectFloor(item_: any) {
            console.log(item_);
            var selfloor_=this.curArchite.showFloorsMeshByID(item_._id);
            if(this.webgl){
                this.webgl.lookatYTweento(selfloor_.yAxis);
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

    /**     * WebGL     */
    class ArchiteWebGL{
        constructor(dom_,controlDom_){
            this.domContainer=dom_;
            this.controlDom=controlDom_;
            this.init();
        }

        domContainer:HTMLElement=null;
        controlDom:HTMLElement=null;
        renderer=null;
        camera=null;
        scene=null;
        curArchite:ArchiteBase=null;

        perspectiveControl=null;
        orthographicControl=null;
        cameraControls=[];

        planeScene=null;

        is3D=true;
        labelScene=null;
        labelCamera=null;

        /**         * 初始化         */
        init(){
            /**     * webgl  / canvas 渲染判断     */
            if(Detector.webgl){
                this.renderer = new THREE.WebGLRenderer({antialias: true});
            }else{
                this.renderer=new THREE.CanvasRenderer({antialias: true});
            }

            //y轴视角移动
            this.lookatTween=new TWEEN.Tween(this.lookatVector3);


            this.scene=new THREE.Scene();
            this.planeScene=new THREE.Scene();
            this.scene.add(new THREE.AxisHelper(10000));
            this.labelScene=new THREE.Scene();

            this.createPerspective();
            this.createOrthographic();

            this.createLights();

            this.createMeshSel();

            this.renderer.setClearColor(0xf1f2f7);
            this.renderer.setSize(V_WIDTH, V_HEIGHT);
            this.renderer.autoClear=false;

            /**         * 绑定渲染         */
            this.domContainer.appendChild(this.renderer.domElement);
        }


        lookatTween=null;
        lookatVector3=new THREE.Vector3(0,0,0);
        /**
         * 移动视角
         * @param y_
         */
        lookatYTweento(y_){
            var that_=this;
            if(!that_.is3D)return;
            that_.lookatVector3.copy(that_.perspectiveControl.target);
            that_.lookatTween.to({y:y_},500).onUpdate(function(item_){
                that_.perspectiveControl.target.copy(this);
                that_.perspectiveControl.update();
            });
            that_.lookatTween.start();

        }

        /**         * 创建正交投影相机 用于2D展示         */
        createOrthographic(){
            this.labelCamera = new THREE.OrthographicCamera( V_WIDTH / - 2, V_WIDTH / 2, V_HEIGHT / 2, V_HEIGHT / - 2, -FAER, FAER*2 );
            var control=new THREE.OrbitControls(this.labelCamera,this.controlDom);
            control.maxPolarAngle=Math.PI/2;
            control.minPolarAngle=0;
            control.minDistance=20;
            // How far you can zoom in and out ( OrthographicCamera only )
            control.minZoom = 1;
            control.maxZoom = 100;

            control.maxDistance=Infinity;
            control.enableKeys=false;
            this.orthographicControl=control;
            control.enabled=false;//默认3D
            this.cameraControls.push(control);
            control.update();

        }

        /**         * 创建透视投影用于建筑展示         */
        createPerspective(){
            this.camera=new THREE.PerspectiveCamera(FOR,V_WIDTH/V_HEIGHT,NEAR,FAER);
            this.camera.up.set(0,1,0);
            this.camera.lookAt(new THREE.Vector3(0,0,0));
            this.camera.position.z=-1200;
            this.camera.position.y=800;
            this.camera.position.x=-800;

            var control=new THREE.OrbitControls(this.camera,this.controlDom);
            control.maxPolarAngle=Math.PI/2;
            control.minPolarAngle=0;
            control.minDistance=20;

            control.minDistance = 100;
            control.maxDistance = 50000;
            control.maxDistance=Infinity;
            control.enableKeys=false;
            this.perspectiveControl=control;
            this.cameraControls.push(control);
            control.update();
        }

        /**         * 创建场景灯光         */
        createLights(){

            var ambientLight_=new THREE.AmbientLight(0xFFFFFF,.65);
            this.scene.add(ambientLight_);
            var dirLight = new THREE.DirectionalLight( 0xffffff, .4 );
            dirLight.color.setHSL( 0.1, 1, 0.95 );
            dirLight.position.set( 1, 1.75, 0 );
            dirLight.position.multiplyScalar( 60 );
            this.scene.add( dirLight );

        }

        zoomIn(){
            for (var i = 0; i < this.cameraControls.length; i++) {
                var camera_ = this.cameraControls[i];
                camera_.zoomIn();
            }
        }
        zoomAway(){
            for (var i = 0; i < this.cameraControls.length; i++) {
                var camera_ = this.cameraControls[i];
                camera_.zoomOut();
            }
        }

        /**
         * 上下旋转视角
         * @param enable_
         */
        enabledRotateUp(enable_){
            for (var i = 0; i < this.cameraControls.length; i++) {
                var camera_ = this.cameraControls[i];
                camera_.enableRotateUp=enable_;
            }
        }

        /**
         *左右旋转视角
         * @param enable_
         */
        enabledRotateLeft(enable_){
            for (var i = 0; i < this.cameraControls.length; i++) {
                var camera_ = this.cameraControls[i];
                camera_.enableRotateLeft=enable_;
            }
        }

        /**         * 背景设置         */
        backgroundSet(color_){
            color_=color_||0xf1f2f7;
            if(this.renderer){
                this.renderer.setClearColor(color_)
            }
        }

        /**         * 移动地图         */
        enabledMapMove(enable_){
            for (var i = 0; i < this.cameraControls.length; i++) {
                var camera_ = this.cameraControls[i];
                camera_.enablePan=enable_;
            }
        }

        /**         * 渲染         */
        render(){
            this.renderer.clear();
            if(this.is3D){
                this.renderer.render(this.scene,this.camera);
                this.renderer.render(this.labelScene,this.camera);
            }else{
                this.renderer.render(this.planeScene,this.camera);
                //this.renderer.render(this.planeScene,this.labelCamera);
                this.renderer.render(this.labelScene,this.camera);
            }
        }

        /**         * 3D切换         */
        enabled3D(enable_){
            this.is3D=enable_;
            //this.is3D=true;
            /*if(this.is3D){
                this.perspectiveControl.enabled=true;
                this.orthographicControl.enabled=false;
            }else{
                this.perspectiveControl.enabled=false;
                this.orthographicControl.enabled=true;
            }*/
        }

        /**         * 公共设施展示         */
        pubPointEnabled(enabeld_){
            if(this.curArchite){
                this.curArchite.enabledFloorsPubPoints(enabeld_);
            }
        }

        /**         * 店铺名称         */
        funcAreasLabelEnabled(enabled_){
            if(this.curArchite){
                this.curArchite.enabledFloorsLabel(enabled_);
            }
        }

        /**         * 刷新地图数据         */
        updateMapByArchiteBase(archite_:ArchiteBase){
            this.curArchite=archite_;
            if(archite_){

                //添加大厦地板
                this.scene.add(archite_.floorGround);
                this.planeScene.add(archite_.floorGround2D);

                //将大厦模型添加到场景
                this.scene.add(archite_.ArchiteMesh);
                this.planeScene.add(archite_.ArchiteMesh2D);

                //将标注信息添加到场景
                this.labelScene.add(archite_.ArchiteSprite);

                //展示默认楼层
                archite_.showFloorsMeshByID(archite_.getDefaultFoolr());

                //显示楼层公共服务点
                archite_.enabledFloorsPubPoints(true);

                //显示楼层店面名称
                archite_.enabledFloorsLabel(true);

            }
        }

        /**         * 窗口更改         */
        resize(){

            this.renderer.setSize(V_WIDTH,V_HEIGHT);

            this.camera.aspect = V_WIDTH / V_HEIGHT;
            this.camera.updateProjectionMatrix();

            this.labelCamera.left = V_WIDTH / - 2;
            this.labelCamera.right = V_WIDTH / 2;
            this.labelCamera.top = V_HEIGHT / 2;
            this.labelCamera.bottom = V_HEIGHT / - 2;
            this.labelCamera.updateProjectionMatrix();



        }

        /**
         * 选择？
         * @type {boolean}
         */
        selectEnabled=true;
        raycaster=null;
        meshSelDownPoint=new THREE.Vector2(0,0);
        isSel=true;
        SelMesh=null;
        SelMeshOrigMaterial=null;
        SelColor=0xFFFF00;
        SelMaterial=new THREE.MeshLambertMaterial({
            color:0xFFFF00,
            emissing:0x000000,
            transparent:true,
            opacity:1
        });

        SelEffectTweenAlpha1=null;
        SelEffectTweenAlpha0=null;

        mousePoint=new THREE.Vector2(0,0);
        /**         * 创建模型选择         */
        private createMeshSel() {
            this.SelEffectTweenAlpha1=new TWEEN.Tween(this.SelMaterial);
            this.SelEffectTweenAlpha0=new TWEEN.Tween(this.SelMaterial);
            this.SelEffectTweenAlpha1.to({opacity:1},500);
            this.SelEffectTweenAlpha0.to({opacity:0},500).onComplete(()=>{
                this.SelEffectTweenAlpha1.start();
            });


            this.raycaster=new THREE.Raycaster();
            this.controlDom.addEventListener("mousedown",(e_)=>{
                this.meshSelDownPoint.x=e_.clientX;
                this.meshSelDownPoint.y=e_.clientY;
            });
            this.controlDom.addEventListener("mouseup",(e_)=>{
                if(Math.abs(this.meshSelDownPoint.x-e_.clientX)>3||Math.abs(this.meshSelDownPoint.y-e_.clientY)>3){
                    this.isSel=false;
                }else{
                    this.isSel=true;
                }
            });
            this.controlDom.addEventListener("click",(e_)=>{
                if(this.isSel&&this.curArchite&&this.selectEnabled){
                    if(!this.curArchite.ArchiteMesh)return;
                    this.mousePoint.x = ( e_.clientX / V_WIDTH ) * 2 - 1;
                    this.mousePoint.y = - ( e_.clientY / V_HEIGHT ) * 2 + 1;

                    this.raycaster.setFromCamera( this.mousePoint, this.camera );

                    // calculate objects intersecting the picking ray
                    var intersects = this.raycaster.intersectObjects( this.curArchite.ArchiteMesh.children,true );

                    /**                     * 有选中的对象                     */
                    if(intersects.length){
                        this.selMeshHandler(intersects[0]);
                    }


                }else{
                    //msg("no Sel");
                }
            });
        }

        /**         * 选中了模型         */
        private selMeshHandler(obj_){
            if(obj_&&obj_.object){
                var selMesh_=obj_.object;
                if(this.SelMesh){
                    this.SelMesh.material=this.SelMeshOrigMaterial;
                }
                this.SelMesh=selMesh_;
                this.SelMeshOrigMaterial=this.SelMesh.material;
                selMesh_.material=this.SelMaterial;
                this.SelMaterial.opacity=1;
                this.SelEffectTweenAlpha0.start();
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

        /**     * modules     */
        layui.use('layer', function(){        console.log("layer load success!");    });
        layui.use('form', function(){        console.log("layui form load success!");    });

        /**     * detector     */
        if(!Detector.webgl){
            msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            return;
        }

        /**     * webgl     */
        var architewebgl_=new ArchiteWebGL(document.getElementById("lhf_archite_wengl_container"),document.getElementById("lhf_archite_wengl_control"));

        /**     * ui     */
        var uimana_=new ArchiteUI(document.getElementById("lhf_archite_ui_container"),architewebgl_);

        /**     * data mana     */
        var architeDataMana_=new ArchiteData(uimana_,architewebgl_);
        //architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json",{});
        architeDataMana_.getMapsbyAjax("ajaxData/fangcaodi.json",{});

        function render(){
            TWEEN.update();
            requestAnimationFrame(render);
            architewebgl_.render();
        }
        render();


        /**     * 自适应     */
        window.addEventListener( 'resize', onWindowResize, false );
        function onWindowResize() {

            V_WIDTH=window.innerWidth;
            V_HEIGHT=window.innerHeight;

            architewebgl_.resize();
        }
        onWindowResize();

    }
    window.onload=function(){
        init();
    };
}