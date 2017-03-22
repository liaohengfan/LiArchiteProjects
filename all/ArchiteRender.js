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
var ArchiteWebGL = (function () {
    function ArchiteWebGL(dom_, controlDom_) {
        this.domContainer = null;
        this.controlDom = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.curArchite = null;
        this.defalutCameraPosition = new THREE.Vector3(0, 0, 0);
        this.curCameraPosition = new THREE.Vector3(0, 0, 0);
        this.defalutCameraTween = null;
        this.maxPolarAngleInit = Math.PI / 2;
        this.perspectiveControlSet = {
            minPolarAngle: 0,
            maxPolarAngle: Math.PI / 2
        };
        this.perspectiveControl = null;
        this.cameraControls = [];
        this.planeScene = null;
        this.is3D = true;
        this.labelScene = null;
        this.labelCamera = null;
        this.lookatTween = null;
        this.lookatVector3 = new THREE.Vector3(0, 0, 0);
        /**
         * 选择？
         * @type {boolean}
         */
        this.selectEnabled = true;
        this.raycaster = null;
        this.meshSelDownPoint = new THREE.Vector2(0, 0);
        this.isSel = true;
        this.SelMesh = null;
        this.SelMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFF00,
            emissing: 0x000000,
            transparent: true,
            opacity: 1
        });
        this.SelEffectTweenAlpha1 = null;
        this.SelEffectTweenAlpha0 = null;
        this.SelPlane = null;
        this.SelMaterialPlane = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 1
        });
        this.SelEffectTweenAlphaPlane1 = null;
        this.SelEffectTweenAlphaPlane0 = null;
        this.mousePoint = new THREE.Vector2(0, 0);
        this.domContainer = dom_;
        this.controlDom = controlDom_;
        this.init();
    }
    /**         * 初始化         */
    ArchiteWebGL.prototype.init = function () {
        /**     * webgl  / canvas 渲染判断     */
        /*if(Detector.webgl){
            this.renderer = new THREE.WebGLRenderer({antialias: true});
        }else{
            this.renderer=new THREE.CanvasRenderer({antialias: true});
        }*/
        //this.renderer = new THREE.WebGLRenderer();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.renderer.sortObjects=false;
        //y轴视角移动
        this.lookatTween = new TWEEN.Tween(this.lookatVector3);
        this.scene = new THREE.Scene();
        this.planeScene = new THREE.Scene();
        //this.scene.add(new THREE.AxisHelper(10000));
        this.labelScene = new THREE.Scene();
        this.createPerspective();
        this.defalutCameraTween = new TWEEN.Tween(this.curCameraPosition);
        this.perspectiveTween = new TWEEN.Tween(this.perspectiveControlSet);
        this.createOrthographic();
        this.createLights();
        this.createMeshSel();
        this.renderer.setClearColor(0xf1f2f7);
        this.renderer.setSize(V_WIDTH, V_HEIGHT);
        this.renderer.autoClear = false; /*

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
    };
    /**
     * 移动视角
     * @param y_
     */
    ArchiteWebGL.prototype.lookatYTweento = function (y_) {
        var that_ = this;
        if (!that_.is3D)
            return;
        that_.lookatVector3.copy(that_.perspectiveControl.target);
        that_.lookatTween.to({ y: y_ }, 500).onUpdate(function (item_) {
            that_.perspectiveControl.target.copy(this);
            that_.perspectiveControl.update();
        });
        that_.lookatTween.start();
    };
    /**         * 创建正交投影相机 用于2D展示         */
    ArchiteWebGL.prototype.createOrthographic = function () {
        this.labelCamera = new THREE.OrthographicCamera(V_WIDTH / -2, V_WIDTH / 2, V_HEIGHT / 2, V_HEIGHT / -2, -FAER, FAER * 2);
        this.labelCamera.position.z = 10;
    };
    /**         * 创建透视投影用于建筑展示         */
    ArchiteWebGL.prototype.createPerspective = function () {
        this.camera = new THREE.PerspectiveCamera(FOR, V_WIDTH / V_HEIGHT, NEAR, FAER);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.position.z = 1200;
        //this.camera.position.y=800;
        //this.camera.position.x=-800;
        var control = new THREE.OrbitControls(this.camera, this.controlDom);
        control.maxPolarAngle = Math.PI / 2;
        control.minPolarAngle = 0;
        control.minDistance = 20;
        control.minDistance = 100;
        control.maxDistance = 50000;
        control.maxDistance = Infinity;
        control.enableKeys = false;
        this.perspectiveControl = control;
        this.cameraControls.push(control);
        //control.update();
    };
    /**         * 创建场景灯光         */
    ArchiteWebGL.prototype.createLights = function () {
        var ambientLight_ = new THREE.AmbientLight(0xFFFFFF, .65);
        this.scene.add(ambientLight_);
        var dirLight = new THREE.DirectionalLight(0xffffff, .4);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(1, 1.75, 0);
        dirLight.position.multiplyScalar(60);
        this.scene.add(dirLight);
    };
    ArchiteWebGL.prototype.zoomIn = function () {
        for (var i = 0; i < this.cameraControls.length; i++) {
            var camera_ = this.cameraControls[i];
            camera_.zoomIn();
        }
    };
    ArchiteWebGL.prototype.zoomAway = function () {
        for (var i = 0; i < this.cameraControls.length; i++) {
            var camera_ = this.cameraControls[i];
            camera_.zoomOut();
        }
    };
    /**
     * 上下旋转视角
     * @param enable_
     */
    ArchiteWebGL.prototype.enabledRotateUp = function (enable_) {
        for (var i = 0; i < this.cameraControls.length; i++) {
            var camera_ = this.cameraControls[i];
            camera_.enableRotateUp = enable_;
        }
    };
    /**
     *左右旋转视角
     * @param enable_
     */
    ArchiteWebGL.prototype.enabledRotateLeft = function (enable_) {
        for (var i = 0; i < this.cameraControls.length; i++) {
            var camera_ = this.cameraControls[i];
            camera_.enableRotateLeft = enable_;
        }
    };
    /**         * 背景设置         */
    ArchiteWebGL.prototype.backgroundSet = function (color_) {
        color_ = color_ || 0xf1f2f7;
        if (this.renderer) {
            this.renderer.setClearColor(color_);
        }
    };
    /**         * 移动地图         */
    ArchiteWebGL.prototype.enabledMapMove = function (enable_) {
        for (var i = 0; i < this.cameraControls.length; i++) {
            var camera_ = this.cameraControls[i];
            camera_.enablePan = enable_;
        }
    };
    /**         * 渲染         */
    ArchiteWebGL.prototype.render = function () {
        if (this.curArchite) {
            this.curArchite.updateBillBoards(this.camera);
        }
        this.renderer.clear();
        if (this.is3D) {
            //this.composer.render();
            this.renderer.render(this.scene, this.camera);
            this.renderer.clearDepth();
            this.renderer.render(this.labelScene, this.labelCamera);
        }
        else {
            this.renderer.render(this.planeScene, this.camera);
            this.renderer.clearDepth();
            this.renderer.render(this.labelScene, this.labelCamera);
        }
    };
    /**     * 重置     */
    ArchiteWebGL.prototype.reset = function () {
        /**         * 重置摄像机焦点         */
        this.perspectiveControl.target.copy(this.perspectiveControl.target0);
        //this.perspectiveControl.reset();
    };
    /**         * 3D切换         */
    ArchiteWebGL.prototype.enabled3D = function (enable_) {
        var that_ = this;
        if (that_.SelMesh) {
            that_.SelMesh.material = that_.SelMesh.defaultMaterial;
            that_.SelMesh = null;
        }
        if (that_.SelPlane) {
            that_.SelPlane.material = that_.SelPlane.defaultMaterial;
            that_.SelPlane = null;
        }
        if (enable_) {
            that_.is3D = enable_;
            that_.curCameraPosition.copy(that_.camera.position);
            that_.perspectiveControl.maxPolarAngle = that_.maxPolarAngleInit;
            that_.defalutCameraTween.stop();
            that_.defalutCameraTween.to({
                x: that_.defalutCameraPosition.x,
                y: that_.defalutCameraPosition.y,
                z: that_.defalutCameraPosition.z
            }, 500).onUpdate(function () {
                that_.camera.position.copy(this);
                that_.perspectiveControl.update();
            });
            that_.defalutCameraTween.start();
        }
        else {
            that_.defalutCameraPosition.copy(this.camera.position);
            that_.perspectiveTween.stop();
            that_.perspectiveControlSet.maxPolarAngle = Math.PI / 2;
            that_.perspectiveTween.to({
                maxPolarAngle: 0
            }, 1000).onUpdate(function () {
                that_.perspectiveControl.maxPolarAngle = this.maxPolarAngle;
                that_.perspectiveControl.update();
            }).onComplete(function () {
                that_.is3D = enable_;
                if (that_.curArchite) {
                    that_.curArchite.display2DPattern(); //进入2D显示模式
                }
            });
            that_.perspectiveTween.start();
        }
    };
    /**         * 公共设施展示         */
    ArchiteWebGL.prototype.pubPointEnabled = function (enabeld_) {
        if (this.curArchite) {
            this.curArchite.enabledFloorsPubPoints(enabeld_);
        }
    };
    /**         * 店铺名称         */
    ArchiteWebGL.prototype.funcAreasLabelEnabled = function (enabled_) {
        if (this.curArchite) {
            this.curArchite.enabledFloorsLabel(enabled_);
        }
    };
    /**         * 刷新地图数据         */
    ArchiteWebGL.prototype.updateMapByArchiteBase = function (archite_) {
        this.curArchite = archite_;
        if (archite_) {
            //设置相机默认位置
            //var theta_=((archite_.oriData.building._xLon||0)+180)*(Math.PI/180);
            //var phi_=((archite_.oriData.building._yLat||0)+180)*(Math.PI/180);
            /*var theta_=(archite_.oriData.building._xLon||0)*(Math.PI/180);
             var phi_=(archite_.oriData.building._yLat||0)*(Math.PI/180);
             this.defalutCameraPosition.copy(getPositionByLonLat(phi_,theta_,1200));*/
            if (IsPC()) {
                this.defalutCameraPosition.set(0, 1367, -1269);
            }
            else {
                this.defalutCameraPosition.set(0, 2348, -2529);
            }
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
    };
    /**         * 窗口更改         */
    ArchiteWebGL.prototype.resize = function () {
        this.renderer.setSize(V_WIDTH, V_HEIGHT);
        this.camera.aspect = V_WIDTH / V_HEIGHT;
        this.camera.updateProjectionMatrix();
        this.labelCamera.left = V_WIDTH / -2;
        this.labelCamera.right = V_WIDTH / 2;
        this.labelCamera.top = V_HEIGHT / 2;
        this.labelCamera.bottom = V_HEIGHT / -2;
        this.labelCamera.updateProjectionMatrix();
    };
    /**         * 创建模型选择         */
    ArchiteWebGL.prototype.createMeshSel = function () {
        var _this = this;
        this.SelEffectTweenAlpha1 = new TWEEN.Tween(this.SelMaterial);
        this.SelEffectTweenAlpha0 = new TWEEN.Tween(this.SelMaterial);
        this.SelEffectTweenAlpha1.to({ opacity: 1 }, 500);
        this.SelEffectTweenAlpha0.to({ opacity: 0 }, 500).onComplete(function () {
            _this.SelEffectTweenAlpha1.start();
        });
        this.SelEffectTweenAlphaPlane1 = new TWEEN.Tween(this.SelMaterialPlane);
        this.SelEffectTweenAlphaPlane0 = new TWEEN.Tween(this.SelMaterialPlane);
        this.SelEffectTweenAlphaPlane1.to({ opacity: 1 }, 500);
        this.SelEffectTweenAlphaPlane0.to({ opacity: 0 }, 500).onComplete(function () {
            _this.SelEffectTweenAlphaPlane1.start();
        });
        this.raycaster = new THREE.Raycaster();
        this.controlDom.addEventListener("mousedown", function (e_) {
            _this.meshSelDownPoint.x = e_.clientX;
            _this.meshSelDownPoint.y = e_.clientY;
        });
        this.controlDom.addEventListener("mouseup", function (e_) {
            if (Math.abs(_this.meshSelDownPoint.x - e_.clientX) > 3 || Math.abs(_this.meshSelDownPoint.y - e_.clientY) > 3) {
                _this.isSel = false;
            }
            else {
                _this.isSel = true;
            }
        });
        this.controlDom.addEventListener("click", function (e_) {
            if (_this.isSel && _this.curArchite && _this.selectEnabled) {
                if (!_this.curArchite.ArchiteMesh)
                    return;
                _this.mousePoint.x = (e_.clientX / V_WIDTH) * 2 - 1;
                _this.mousePoint.y = -(e_.clientY / V_HEIGHT) * 2 + 1;
                _this.raycaster.setFromCamera(_this.mousePoint, _this.camera);
                // calculate objects intersecting the picking ray
                var intersects = [];
                if (_this.is3D) {
                    intersects = _this.raycaster.intersectObjects(_this.curArchite.ArchiteMesh.children, true);
                }
                else {
                    intersects = _this.raycaster.intersectObjects(_this.curArchite.ArchiteMesh2D.children, true);
                }
                /**                     * 有选中的对象                     */
                if (intersects.length) {
                    _this.selMeshHandler(intersects[0]);
                }
            }
            else {
            }
        });
    };
    /**         * 店铺查询         */
    ArchiteWebGL.prototype.searchFuncArea = function (name_) {
        if (this.curArchite) {
            var funcArea_ = this.curArchite.search(name_);
            if (funcArea_) {
                if (this.is3D) {
                    this.selMeshHandler({
                        object: funcArea_.mesh.children[0]
                    });
                }
                else {
                    this.selMeshHandler({
                        object: funcArea_.plane.children[0]
                    });
                }
            }
            else {
                msg("未找到：" + name_);
            }
        }
        else {
            msg("不存在建筑供查询！");
        }
    };
    /**         * 选中了模型         */
    ArchiteWebGL.prototype.selMeshHandler = function (obj_) {
        if (obj_ && obj_.object) {
            var selMesh_ = obj_.object;
            if (this.is3D) {
                if (this.SelMesh) {
                    this.SelMesh.material = this.SelMesh.defaultMaterial;
                    this.SelMesh = null;
                }
                this.SelMesh = selMesh_;
                selMesh_.material = this.SelMaterial;
                this.SelMaterial.opacity = 1;
                this.SelEffectTweenAlpha0.start();
            }
            else {
                if (this.SelPlane) {
                    this.SelPlane.material = this.SelPlane.defaultMaterial;
                    this.SelPlane = null;
                }
                this.SelPlane = selMesh_;
                selMesh_.material = this.SelMaterialPlane;
                this.SelMaterialPlane.opacity = 1;
                this.SelEffectTweenAlphaPlane0.start();
            }
        }
    };
    return ArchiteWebGL;
}());
