/**
 * Created by Administrator on 2017/2/6.
 */
namespace liaohengfan.LI_ARCHITE{


    // change by 2017.02.09

    let V_WIDTH:Number=1280;
    let V_HEIGHT:Number=720;
    let FOR:Number=60;
    let NEAR:Number=1;
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

    /**     * 解析所有轮廓     */
    function getDataMesh(data_,high_=1,color_=0xFFFFFF){
        var mesh_=new THREE.Object3D();
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

                    /**                             * 楼层高度                             */
                    buildingExtrudeSettings.amount=(data_.High||high_)*10;

                    var outLine3DGeo_=new THREE.ExtrudeGeometry(outLineShape_,buildingExtrudeSettings);
                    var outLine3DMesh_=new THREE.Mesh(outLine3DGeo_,new THREE.MeshLambertMaterial({
                        color:(color_||0xFFFFFF)
                    }));
                    mesh_.add(outLine3DMesh_);
                }
            }
            //mesh_.position.z=buildingExtrudeSettings.amount;
        }
        return mesh_;
    }


    /**     * 门店     */
    class ArchiteFuncArea{
        constructor(data_,high_,color_){
            this.mesh=getDataMesh(data_,high_,color_);
        }
        archite_show=true;
        archite_name="";
        archite_id="";
        mesh=null;
    }

    /**     * 楼层     */
    class ArchiteFloor{

        constructor(data_){
            this.floorData=data_;
        }
        archite_show=true;
        archite_name="";
        archite_id="";
        floorData=null;

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
            this.PubPoints.visible=enabled_;

            //公共设施
            if(this.floorData.PubPoint){
                this.floorData.PubPoint=this.floorData.PubPoint||[];

                var y_z=this.floorData.High;
                y_z*=10;

                //test
                /*var material_=new THREE.MeshBasicMaterial({
                    color:0xFF0000
                });
                var geo_=new THREE.CubeGeometry(10,10,10);*/

                for (var i = 0; i < this.floorData.PubPoint.length; i++) {
                    var point_ = this.floorData.PubPoint[i];
                    var position_=point_.Outline[0][0];
                    var positionVec3=new THREE.Vector3(position_[0]||0,position_[1],y_z);

                    //图标待确认
                    var material_=new THREE.SpriteMaterial({
                        //map:texture_,
                        map:new THREE.TextureLoader().load("asset/PublicPointIco/100002.png"),
                        color:0xFFFFFF,
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

        funcAreaMesh=null;

        /**         * 店面         */
        getFuncAreasMesh(){

            //模型已经创建
            if(this.funcAreaMesh)return this.funcAreaMesh;

            this.funcAreaMesh=new THREE.Object3D();

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

                }
            }
            return this.funcAreaMesh;
        }
    }

    /**     * 建筑基类     */
    class ArchiteBase{
        constructor(data_:Object,is3D_){
            this.oriData=data_;
            this.ArchiteName=this.oriData.building.Name;
            this.ArchiteOutLine=this.oriData.building.Outline;
            this.ArchiteID=this.oriData.building._id;
            this.is3D=is3D_;

            /**             * 创建大厦3D对象             */
            this.ArchiteMesh=new THREE.Object3D();

            /**             * 创建标注对象             */
            this.ArchiteSprite=new THREE.Object3D();
            this.ArchiteIcon=new THREE.Object3D();
            this.ArchiteLabel=new THREE.Object3D();
            this.ArchiteSprite.add(this.ArchiteIcon);
            this.ArchiteSprite.add(this.ArchiteLabel);


            /**             * 旋转             */
            this.ArchiteMesh.rotateX(-(Math.PI/2));
            this.ArchiteSprite.rotateX(-(Math.PI/2));

            this.parseBuildingOutLine();
        }

        archite_show=true;
        archite_name="";
        archite_id="";

        is3D:Boolean=true;

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
            this.buildingOutLine=getDataMesh(this.oriData.building);
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

        /**         * 展示楼层模型         */
        showFloorsMeshByID(floor_){

            var selectFloors=null;
            selectFloors=_.findWhere(this.architeFloors,{archite_id:floor_});

            //对应楼层是否已创建
            if(selectFloors){

                //当前仅选中的楼层显示
                if(this.architeFloors.length==1) {
                    return;
                }
            }else{

                //不存在选择的模型，则创建
                selectFloors=this.createFloors(floor_);
                selectFloors.archite_id;
                selectFloors.archite_name;
                selectFloors.archite_show;
                this.architeFloors.push(selectFloors);//添加到已创建模型

                //展示模型
                this.ArchiteMesh.add(selectFloors.getFuncAreasMesh());
            }

        }

        /**         * 楼层公共设施         */
        enabledFloorsPubPoints(show_){
            //查询所有显示的楼层
            var curShowFloors_=_.where(this.architeFloors,{archite_show:true});

            for (var i = 0; i < curShowFloors_.length; i++) {
                var obj = curShowFloors_[i];
                this.ArchiteIcon.add(obj.getPubPoints());
            }
        }

        /**         * 楼层标注         */
        enabledFloorsLabel(show_,type_){

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

            //创建楼层
            var floor_=new ArchiteFloor(floorData_);

            return floor_;
        }
    }



    /**     * UI管理     */
    class ArchiteUI{
        constructor(dom_){
            this.domContainer=dom_;
        }
        domContainer:HTMLElement=null;
        curArchite:ArchiteBase=null;

        /**         * 刷新UI数据         */
        updataUIByArchiteBase(archite_:ArchiteBase){

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

            this.createPerspective();
            this.createOrthographic();

            this.createLights();

            this.renderer.setClearColor(0xf1f2f7);
            this.renderer.setSize(V_WIDTH, V_HEIGHT);
            this.renderer.autoClear=false;

            /**         * 绑定渲染         */
            this.domContainer.appendChild(this.renderer.domElement);
        }

        /**         * 创建正交投影相机 用于图标展示         */
        createOrthographic(){
            this.labelCamera = new THREE.OrthographicCamera( V_WIDTH / - 2, V_WIDTH / 2, V_HEIGHT / 2, V_HEIGHT / - 2, NEAR, FAER );
            this.labelScene=new THREE.Scene();



            var control=new THREE.OrbitControls(this.labelCamera,this.controlDom);
            control.maxPolarAngle=Math.PI/3;
            control.minPolarAngle=0;
            control.minDistance=1;
            control.maxDistance=Infinity;
            control.enableKeys=false;
            control.update();

        }

        /**         * 创建透视投影用于建筑展示         */
        createPerspective(){
            this.camera=new THREE.PerspectiveCamera(FOR,V_WIDTH/V_HEIGHT,NEAR,FAER);
            this.camera.up.set(0,1,0);
            this.camera.lookAt(new THREE.Vector3(0,0,0));
            this.camera.position.z=-1200;
            this.camera.position.y=100;
            this.camera.position.x=-1000;

            var control=new THREE.OrbitControls(this.camera,this.controlDom);
            control.maxPolarAngle=Math.PI/3;
            control.minPolarAngle=0;
            control.minDistance=1;
            control.maxDistance=Infinity;
            control.enableKeys=false;
            control.update();

            this.scene=new THREE.Scene();
            this.scene.add(new THREE.AxisHelper(10000));
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

        /**         * 渲染         */
        render(){
            this.labelCamera.position.copy(this.camera.position);
            this.labelCamera.updateProjectionMatrix();
            this.renderer.clear();
            this.renderer.render(this.scene,this.camera);
            //this.renderer.render(this.scene,this.labelCamera);
            this.renderer.render(this.labelScene,this.camera);
            //this.renderer.render(this.labelScene,this.labelCamera);
        }

        /**         * 刷新地图数据         */
        updateMapByArchiteBase(archite_:ArchiteBase){
            if(archite_){

                //将大厦模型添加到场景
                this.scene.add(archite_.ArchiteMesh);

                //将标注信息添加到场景
                this.labelScene.add(archite_.ArchiteSprite);

                //展示大厦轮廓
                archite_.enabledBuildingOutLine(true);

                //展示默认楼层
                archite_.showFloorsMeshByID(archite_.getDefaultFoolr());

                //显示楼层公共服务点
                archite_.enabledFloorsPubPoints(true);

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

        /**     * detector     */
        if(!Detector.webgl){
            msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            return;
        }

        /**     * ui     */
        var uimana_=new ArchiteUI(document.getElementById("lhf_archite_ui_container"));

        /**     * webgl     */
        var architewebgl_=new ArchiteWebGL(document.getElementById("lhf_archite_wengl_container"),document.getElementById("lhf_archite_wengl_control"));

        /**     * data mana     */
        var architeDataMana_=new ArchiteData(uimana_,architewebgl_);
        architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json",{});

        function render(){
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