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
///<reference path="ArchiteMain.ts" />
///<reference path="ArchiteBase.ts" />

/**     * WebGL     */
class ArchiteWebGL{
    constructor(dom_,controlDom_,resources_:ArchiteResources){
        this.domContainer=dom_;
        this.resources=resources_;
        this.controlDom=controlDom_;
        this.init();
    }
    resources:ArchiteResources;
    domContainer:HTMLElement=null;
    controlDom:HTMLElement=null;
    renderer=null;
    camera=null;
    scene=null;
    curArchite:ArchiteBase=null;

    defalutCameraPosition=new THREE.Vector3(0,0,0);
    hisCameraPosition=new THREE.Vector3(0,0,0);
    curCameraPosition=new THREE.Vector3(0,0,0);
    defalutCameraTween=null;

    maxPolarAngleInit=Math.PI/2;
    perspectiveControlSet={
        minPolarAngle:0,
        maxPolarAngle:Math.PI/2
    };
    perspectiveTween;
    perspectiveControl=null;
    cameraControls=[];

    planeScene=null;

    is3D=true;
    labelScene=null;
    labelCamera=null;

    renderModel:THREE.RenderPass;
    effectCopy:THREE.ShaderPass;
    composer:THREE.EffectComposer;
    /**         * 初始化         */
    init(){
        /**     * webgl  / canvas 渲染判断     */
        /*if(Detector.webgl){
            this.renderer = new THREE.WebGLRenderer({antialias: true});
        }else{
            this.renderer=new THREE.CanvasRenderer({antialias: true});
        }*/
        //this.renderer = new THREE.WebGLRenderer();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.renderer.sortObjects=false;

        //y轴视角移动
        this.lookatTween=new TWEEN.Tween(this.lookatVector3);


        this.scene=new THREE.Scene();
        this.planeScene=new THREE.Scene();
        //this.scene.add(new THREE.AxisHelper(10000));
        this.labelScene=new THREE.Scene();

        this.markPointsHashMap=new ArchiteHashMap();
        this.markPointsObject3D=new THREE.Object3D();
        this.labelScene.add(this.markPointsObject3D);

        this.createPerspective();

        this.defalutCameraTween=new TWEEN.Tween(this.curCameraPosition);
        this.perspectiveTween=new TWEEN.Tween(this.perspectiveControlSet);

        this.createOrthographic();

        this.createLights();

        this.createMeshSel();

        this.renderer.setClearColor(0xf1f2f7);
        this.renderer.setSize(V_WIDTH, V_HEIGHT);
        this.renderer.autoClear=false;/*

        this.renderModel = new THREE.RenderPass(this.scene, this.camera);
// Shader to copy result from renderModel to the canvas
        this.effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        this.effectCopy.renderToScreen = true;
// The composer will compose a result for the actual drawing canvas.
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.setSize(V_WIDTH * 4, V_HEIGHT * 4);
// Add passes to the composer.
        this.composer.addPass(this.renderModel);
        this.composer.addPass(this.effectCopy);*/

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
        that_.reset();
        this.lookatVector3.copy(this.perspectiveControl.target0);
        that_.lookatTween.to({y:y_},500).onUpdate(function(item_){
            that_.perspectiveControl.target.copy(this);
            that_.perspectiveControl.update();
        });
        that_.lookatTween.start();

    }

    /**         * 创建正交投影相机 用于2D展示         */
    createOrthographic(){
        this.labelCamera = new THREE.OrthographicCamera( V_WIDTH / - 2, V_WIDTH / 2, V_HEIGHT / 2, V_HEIGHT / - 2, -FAER, FAER*2 );
        this.labelCamera.position.z=10;

    }

    /**         * 创建透视投影用于建筑展示         */
    createPerspective(){
        this.camera=new THREE.PerspectiveCamera(FOR,V_WIDTH/V_HEIGHT,NEAR,FAER);
        this.camera.up.set(0,1,0);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.camera.position.z=1200;
        var control=new THREE.OrbitControls(this.camera,this.controlDom);
        control.maxPolarAngle=Math.PI/2;
        control.minPolarAngle=0;
        control.minDistance=20;

        control.minDistance = 100;
        control.maxDistance = 50000;
        control.maxDistance=Infinity;
        control.enableKeys=false;


        var tanslatex_=90.0860720836;
        var tanslatez_=-43.9787404304;
        var tanslate_=new THREE.Vector3(tanslatex_*20,0,tanslatez_*20);
        control.target.copy(tanslate_);
        control.target0.copy(tanslate_);

        this.perspectiveControl=control;
        this.cameraControls.push(control);
        //control.update();
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

        if(this.curArchite){
            this.curArchite.updateBillBoards(this.camera);
        }

        this.perspectiveControl.target;
        this.perspectiveControl.target0;

        /**         * 矫正标注点         */
        this.updateMarkPointPosition();

        this.renderer.clear();
        if(this.is3D){
            //this.composer.render();
            this.renderer.render(this.scene,this.camera);
            //this.renderer.clearDepth();
            this.renderer.render(this.labelScene,this.labelCamera);
        }else{
            this.renderer.render(this.planeScene,this.camera);
            ///this.renderer.clearDepth();
            this.renderer.render(this.labelScene,this.labelCamera);
        }
    }

    /**     * 重置     */
    reset(){

        /**         * 重置摄像机焦点         */
        this.perspectiveControl.target.copy( this.perspectiveControl.target0 );
        this.hisCameraPosition.copy(this.defalutCameraPosition);
        //this.perspectiveControl.update();
        //this.perspectiveControl.reset();
    }

    /**         * 3D切换         */
    enabled3D(enable_){
        var that_=this;

        if(that_.SelMesh){
            that_.SelMesh.material=that_.SelMesh.defaultMaterial;
            that_.SelMesh=null;
        }

        if(that_.SelPlane){
            that_.SelPlane.material=that_.SelPlane.defaultMaterial;
            that_.SelPlane=null;
        }

        if(enable_){

            that_.is3D=enable_;
            that_.curCameraPosition.copy(that_.camera.position);
            that_.perspectiveControl.maxPolarAngle=that_.maxPolarAngleInit;
            that_.defalutCameraTween.stop();
            that_.defalutCameraTween.to({
                x:that_.hisCameraPosition.x,
                y:that_.hisCameraPosition.y,
                z:that_.hisCameraPosition.z
            },500).onUpdate(function(){
                that_.camera.position.copy(this);
                that_.perspectiveControl.update();
            });
            that_.defalutCameraTween.start();
        }else{

            that_.hisCameraPosition.copy(that_.camera.position);

            that_.perspectiveTween.stop();
            that_.perspectiveControlSet.maxPolarAngle=Math.PI/2;
            that_.perspectiveTween.to({
                maxPolarAngle:0
            },1000).onUpdate(function(){
                that_.perspectiveControl.maxPolarAngle=this.maxPolarAngle;
                that_.perspectiveControl.update();
            }).onComplete(function(){
                that_.is3D=enable_;
                if(that_.curArchite){
                    that_.curArchite.display2DPattern();//进入2D显示模式
                }
            });
            that_.perspectiveTween.start();
        }
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

            //设置相机默认位置
            //var theta_=((archite_.oriData.building._xLon||0)+180)*(Math.PI/180);
            //var phi_=((archite_.oriData.building._yLat||0)+180)*(Math.PI/180);
            /*var theta_=(archite_.oriData.building._xLon||0)*(Math.PI/180);
             var phi_=(archite_.oriData.building._yLat||0)*(Math.PI/180);
             this.defalutCameraPosition.copy(getPositionByLonLat(phi_,theta_,1200));*/


            if(IsPC()){
                this.defalutCameraPosition.set(1815,631,670);
            }else{
                this.defalutCameraPosition.set(1815,1231,800);
            }
            this.hisCameraPosition.copy(this.defalutCameraPosition);

            this.camera.position.copy(this.defalutCameraPosition);
            this.perspectiveControl.update();

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
    SelMaterial=new THREE.MeshLambertMaterial({
        color:0xFFFF00,
        emissing:0x000000,
        transparent:true,
        opacity:1
    });

    SelEffectTweenAlpha1=null;
    SelEffectTweenAlpha0=null;

    SelPlane=null;
    SelMaterialPlane=new THREE.MeshBasicMaterial({
        color:0xFFFF00,
        transparent:true,
        opacity:1
    });
    SelEffectTweenAlphaPlane1=null;
    SelEffectTweenAlphaPlane0=null;

    mousePoint=new THREE.Vector2(0,0);
    /**         * 创建模型选择         */
    private createMeshSel() {
        this.SelEffectTweenAlpha1=new TWEEN.Tween(this.SelMaterial);
        this.SelEffectTweenAlpha0=new TWEEN.Tween(this.SelMaterial);
        this.SelEffectTweenAlpha1.to({opacity:1},500);
        this.SelEffectTweenAlpha0.to({opacity:0},500).onComplete(()=>{
            this.SelEffectTweenAlpha1.start();
        });

        this.SelEffectTweenAlphaPlane1=new TWEEN.Tween(this.SelMaterialPlane);
        this.SelEffectTweenAlphaPlane0=new TWEEN.Tween(this.SelMaterialPlane);
        this.SelEffectTweenAlphaPlane1.to({opacity:1},500);
        this.SelEffectTweenAlphaPlane0.to({opacity:0},500).onComplete(()=>{
            this.SelEffectTweenAlphaPlane1.start();
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
                var intersects = [];
                if(this.is3D){
                    intersects=this.raycaster.intersectObjects( this.curArchite.ArchiteMesh.children,true );
                }else{
                    intersects=this.raycaster.intersectObjects( this.curArchite.ArchiteMesh2D.children,true );
                }


                /**                     * 有选中的对象                     */
                if(intersects.length){
                    var mesh_:THREE.Mesh=intersects[0];
                    this.selMeshHandler(mesh_);
                    this.showItemDetails(mesh_);
                }


            }else{
                //msg("no Sel");
            }
        });
    }

    showDetails:boolean=true;
    /**
     * 展示详情
     * @param data_
     */
    showItemDetails(mesh:THREE.Mesh){
        try {
            var data_ = (mesh.object.oriData || null);
            if (!data_) {
                return;
            }
            if (!this.showDetails)return;

            var info_="<div>" +
                "<h3>"+(data_.Name_all||'')+"</h3>" +
                "<p>展位号："+(data_.booth_id||'')+"</p>" +
                "<em><a href='"+(data_.externalLink||'')+"'>详细信息</a></em>" +
                "</div>";

            //var details_=data_.Brief||"缺少介绍详情！！";
            layer.alert(info_, {
                title: "详情"
            });
        }catch (e){}
    }

    /**     * 摄像头聚焦     */
    cameraLookPoint(vec3_:THREE.Vector3){
        var that_=this;

        console.log(vec3_);
        var y_=vec3_.y;
        vec3_.copy(this.perspectiveControl.target0);
        vec3_.y=y_;
        //lookat
        this.camera.lookAt(vec3_);

        this.perspectiveControl.target.y=vec3_.y;
        //this.perspectiveControl.target.copy( vec3_);

        //摄像头新地址
        var newPoint_:THREE.Vector3=new THREE.Vector3();
        //newPoint_.addVectors(this.defalutCameraPosition,vec3_);
        newPoint_.copy(this.defalutCameraPosition);

        that_.curCameraPosition.copy(that_.camera.position);
        that_.defalutCameraTween.stop();
        that_.defalutCameraTween.to({
            x:newPoint_.x,
            y:newPoint_.y,
            z:newPoint_.z
        },500).onUpdate(function(){
            that_.camera.position.copy(this);
            that_.perspectiveControl.update();
        });
        that_.defalutCameraTween.start();


    }
    markPoints:Array<THREE.Sprite>=[];
    markPointsObject3D:THREE.Object3D=null;
    markPointsHashMap:ArchiteHashMap;
    addMarkPoint(key:any,vec3_:THREE.Vector3){
        var map_:THREE.Texture=this.resources.getTexture("MARKPOINT");
        if(!map_){
            msg("缺少标记纹理！！！");
            return;
        }
        //图标待确认
        var material_=new THREE.SpriteMaterial({
            map:map_,
            color:0xFFFFFF
        });
        var sprite_=new THREE.Sprite(material_);
        var spriteTranslate_:THREE.Object3D=new THREE.Object3D();
        spriteTranslate_.add(sprite_);

        spriteTranslate_.lockX=vec3_.x;
        spriteTranslate_.lockY=vec3_.y;
        spriteTranslate_.lockZ=vec3_.z;

        spriteTranslate_.defaultMaterial=material_;
        sprite_.scale.set(32,64,1);
        sprite_.position.set(0,64,0);
        spriteTranslate_.alwaysShow=true;
        this.markPointsObject3D.add(spriteTranslate_);
        this.markPoints.push(spriteTranslate_);
    }
    removeMarkPoint(key:any){


        var markPoint_=this.markPointsHashMap.get(key);
        if(!markPoint_)return;
        this.markPointsHashMap.remove(key);
        this.markPointsObject3D.remove(markPoint_);
        for (var i = 0; i < this.markPoints.length; i++) {
            var markPointForAry = this.markPoints[i];
            if(markPointForAry==markPoint_){
                this.markPoints.splice(i,1);
                return;
            }
        }

    }
    removeAllMarkPoint(){
        for (var i = 0; i < this.markPoints.length; i++) {
            var markPoint_ = this.markPoints[i];
            this.markPointsObject3D.remove(markPoint_);
        }
        this.markPoints=[];
        this.markPointsHashMap.clear();
    }
    updateMarkPointPosition(){
        var proMatrix_ = new THREE.Matrix4();
        proMatrix_.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        updateBillBoards(this.markPointsObject3D,proMatrix_);
    }
    /**     * 标记地址     */
    markPoint(objData_:any){

        var floorID:any=objData_.FloorID;

        /**         * 移除所有标注点         */
        this.removeAllMarkPoint();

        if(this.curArchite) {
            //获取/创建楼层
            var floor_ = this.curArchite.showFloorsMeshByID(floorID,true);
            if (!floor_) {
                return null;
            }
            /**         * 搜索店铺         */
            var funcAreas_:any=_.filter(floor_.funcAreas,function(item_){
                return item_.oriData===objData_;
            });
            var funcArea_=(funcAreas_[0]||null);
            if(funcArea_){//找到店铺
                if(this.is3D){
                    this.selMeshHandler({
                        object:funcArea_.mesh.children[0]
                    });
                }else{
                    this.selMeshHandler({
                        object:funcArea_.plane.children[0]
                    });
                }
                var center_:any=funcArea_.oriData.Center||null;
                var markPoint_:THREE.Vector3=new THREE.Vector3();
                markPoint_.x=center_[0]||0;
                markPoint_.y=center_[1]||0;
                markPoint_.z=floor_.yAxis||0;

                markPoint_.x*=20;
                markPoint_.y*=20;

                var lookPoint_:THREE.Vector3=new THREE.Vector3();
                lookPoint_.y=floor_.yAxis;

                this.cameraLookPoint(lookPoint_);
                //this.reset();
                this.addMarkPoint(funcArea_.oriData.Name,markPoint_);
                return;
            }

            /**             * 搜索公共点             */
            var pubPoints_:any=_.filter(floor_.PubPointArrays,function(item_){
                item_.alwaysShow=false;
                return item_.oriData===objData_;
            });
            var pubPoint_=(pubPoints_[0]||null);
            if(pubPoint_){//找到服务点
                pubPoint_.alwaysShow=true;
                var markPoint_:THREE.Vector3=new THREE.Vector3();
                markPoint_.x=pubPoint_.lockX;
                markPoint_.y=pubPoint_.lockY;
                markPoint_.z=pubPoint_.lockZ;


                //markPoint_.x*=20;
                //markPoint_.y*=20;

                var lookPoint_:THREE.Vector3=new THREE.Vector3();
                lookPoint_.y=floor_.yAxis;

                this.cameraLookPoint(lookPoint_);
                //this.reset();
                this.addMarkPoint(pubPoint_.oriData.Name,markPoint_);
            }else{
                msg("未找到模型/标注点");
            }



        }


    }

    /**         * 店铺查询         */
    searchFuncArea(name_){
        if(this.curArchite){
            var funcArea_=this.curArchite.search(name_);
            if(funcArea_){
                if(this.is3D){
                    this.selMeshHandler({
                        object:funcArea_.mesh.children[0]
                    });
                }else{
                    this.selMeshHandler({
                        object:funcArea_.plane.children[0]
                    });
                }
            }else{
                msg("未找到："+name_);
            }

        }else{
            msg("不存在建筑供查询！");
        }
    }

    /**         * 选中了模型         */
    private selMeshHandler(obj_){
        if(obj_&&obj_.object){
            var selMesh_=obj_.object;
            if(this.is3D){
                if(this.SelMesh){
                    this.SelMesh.material=this.SelMesh.defaultMaterial;
                    this.SelMesh=null;
                }
                this.SelMesh=selMesh_;
                selMesh_.material=this.SelMaterial;
                this.SelMaterial.opacity=1;
                this.SelEffectTweenAlpha0.start();
            }else{
                if(this.SelPlane){
                    this.SelPlane.material=this.SelPlane.defaultMaterial;
                    this.SelPlane=null;
                }
                this.SelPlane=selMesh_;
                selMesh_.material=this.SelMaterialPlane;
                this.SelMaterialPlane.opacity=1;
                this.SelEffectTweenAlphaPlane0.start();
            }
        }

    }
}