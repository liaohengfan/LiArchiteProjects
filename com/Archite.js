/**
 * Created by Administrator on 2017/2/6.
 */
var liaohengfan;
(function (liaohengfan) {
    var LI_ARCHITE;
    (function (LI_ARCHITE) {
        // change by 2017.02.09
        var V_WIDTH = 1280;
        var V_HEIGHT = 720;
        var FOR = 60;
        var NEAR = 1;
        var FAER = 10000;
        var PI2 = Math.PI * 2;
        /**     * 信息输出     */
        var msg = function (info_) {
            if (layui.layer) {
                layui.layer.msg(info_);
            }
            else {
                alert(info_);
            }
        };
        /**
         * 解析 2 维坐标
         * @param pointArray
         * @returns {Array}
         */
        function parseVec2Points(pointArray) {
            var shapePoints = [];
            for (var i = 0; i < pointArray.length; i += 2) {
                var point = new THREE.Vector2(pointArray[i], pointArray[i + 1]);
                if (i > 0) {
                    var lastpoint = shapePoints[shapePoints.length - 1];
                    if (point.x != lastpoint.x || point.y != lastpoint.y) {
                        shapePoints.push(point);
                    }
                }
                else {
                    shapePoints.push(point);
                }
            }
            return shapePoints;
        }
        /**     *  text 2 canvas Texture     */
        function getLabelTexture(str_) {
            //var canvas=document.getElementById('canvasTexture');
            //var texture_=new THREE.Texture(canvas);
            var canvas = document.createElement("canvas");
            var ctx_ = canvas.getContext('2d');
            /*ctx_.fillStyle='rgba(0,0,0,0)';
            ctx_.fillRect(0,0,100,50);*/
            ctx_.strokeStyle = '#FFFFFF'; //边框颜色
            ctx_.fillStyle = '#000000'; //填充颜色
            ctx_.lineWidth = '3';
            ctx_.font = "40px Arial";
            ctx_.strokeText(str_, 10, 50);
            ctx_.fillText(str_, 10, 50);
            var texture_ = new THREE.Texture(canvas);
            return texture_;
        }
        /**     * 给图片添加外边框     */
        function imageAddBorderTexture(img_) {
            var canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            var ctx_ = canvas.getContext('2d');
            ctx_.drawImage(img_, 0, 0);
            var texture_ = new THREE.Texture(canvas);
            return texture_;
        }
        /**     * 解析所有轮廓     */
        function getDataMesh(data_, high_, color_) {
            if (high_ === void 0) { high_ = 1; }
            if (color_ === void 0) { color_ = 0xFFFFFF; }
            var mesh_ = new THREE.Object3D();
            data_ = data_ || {};
            data_.Outline = data_.Outline || [];
            /**         * 轮廓         */
            if (data_.Outline) {
                var buildingExtrudeSettings = {
                    amount: 10,
                    bevelEnabled: false,
                    curveSegments: 1,
                    steps: 1
                };
                /**                     * 编译所有轮廓                     */
                for (var i = 0; i < data_.Outline.length; i++) {
                    var outlinePoints_ = data_.Outline[i];
                    outlinePoints_ = outlinePoints_ || [];
                    for (var j = 0; j < outlinePoints_.length; j++) {
                        var point = parseVec2Points(outlinePoints_[j]);
                        var outLineShape_ = new THREE.Shape(point);
                        /**                             * 楼层高度                             */
                        buildingExtrudeSettings.amount = (data_.High || high_) * 10;
                        var outLine3DGeo_ = new THREE.ExtrudeGeometry(outLineShape_, buildingExtrudeSettings);
                        var outLine3DMesh_ = new THREE.Mesh(outLine3DGeo_, new THREE.MeshLambertMaterial({
                            color: (color_ || 0xFFFFFF)
                        }));
                        mesh_.add(outLine3DMesh_);
                    }
                }
            }
            return mesh_;
        }
        /**     * 门店     */
        var ArchiteFuncArea = (function () {
            function ArchiteFuncArea(data_, high_, color_) {
                this.archite_show = true;
                this.archite_name = "";
                this.archite_id = "";
                this.mesh = null;
                this.mesh = getDataMesh(data_, high_, color_);
            }
            return ArchiteFuncArea;
        }());
        /**     * 楼层     */
        var ArchiteFloor = (function () {
            function ArchiteFloor(data_) {
                this.archite_show = true;
                this.archite_name = "";
                this.archite_id = "";
                this.floorData = null;
                /**
                 * 公共设施点
                 * @type {any}
                 */
                this.PubPoints = null;
                this.funcAreaMesh = null;
                /**         * 店铺         */
                this.funcAreasLabels = null;
                this.floorData = data_;
            }
            /**         * 公共服务点         */
            ArchiteFloor.prototype.getPubPoints = function (enabled_) {
                if (this.PubPoints) {
                    this.PubPoints.visible = enabled_;
                    return this.PubPoints;
                }
                this.PubPoints = new THREE.Object3D();
                this.PubPoints.visible = enabled_;
                //公共设施
                if (this.floorData.PubPoint) {
                    this.floorData.PubPoint = this.floorData.PubPoint || [];
                    var y_z = this.floorData.High;
                    y_z *= 10;
                    for (var i = 0; i < this.floorData.PubPoint.length; i++) {
                        var point_ = this.floorData.PubPoint[i];
                        var position_ = point_.Outline[0][0];
                        var positionVec3 = new THREE.Vector3(position_[0] || 0, position_[1], y_z);
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
                        //图标待确认
                        var material_ = new THREE.SpriteMaterial({
                            map: new THREE.TextureLoader().load("asset/PublicPointIco/100002.png"),
                            color: 0xFFFFFF,
                            depthTest: false
                        });
                        material_.sizeAttenuation = false;
                        var sprite_ = new THREE.Sprite(material_);
                        sprite_.scale.set(32, 32, 1);
                        sprite_.position.copy(positionVec3);
                        this.PubPoints.add(sprite_);
                    }
                }
                return this.PubPoints;
            };
            /**         * 店面         */
            ArchiteFloor.prototype.getFuncAreasMesh = function () {
                //模型已经创建
                if (this.funcAreaMesh)
                    return this.funcAreaMesh;
                this.funcAreaMesh = new THREE.Object3D();
                //店面
                if (this.floorData.FuncAreas) {
                    var funcareas_ = this.floorData.FuncAreas;
                    var high_ = this.floorData.High;
                    /**                     * 编译所有店面轮廓                     */
                    for (var i = 0; i < funcareas_.length; i++) {
                        var colors_ = [0xc9fbc9, 0x97c9fb, 0xc9c9fb];
                        var color_ = _.sample(colors_);
                        //创建门店
                        var funcarea_ = new ArchiteFuncArea(funcareas_[i], high_, color_);
                        this.funcAreaMesh.add(funcarea_.mesh);
                    }
                }
                return this.funcAreaMesh;
            };
            /**         * 获取所有店面名称         */
            ArchiteFloor.prototype.getFuncAreasLabel = function (enabled_) {
                if (this.funcAreasLabels) {
                    this.funcAreasLabels.visible = enabled_;
                    return this.funcAreasLabels;
                }
                this.funcAreasLabels = new THREE.Object3D();
                this.funcAreasLabels.visible = enabled_;
                //公共设施
                if (this.floorData.FuncAreas) {
                    this.floorData.FuncAreas = this.floorData.FuncAreas || [];
                    var y_z = this.floorData.High;
                    y_z *= 10;
                    for (var i = 0; i < this.floorData.FuncAreas.length; i++) {
                        var point_ = this.floorData.FuncAreas[i];
                        var position_ = point_.Center;
                        var positionVec3 = new THREE.Vector3(position_[0] || 0, position_[1], y_z);
                        positionVec3.x -= 50;
                        //图标待确认
                        var material_ = new THREE.SpriteMaterial({
                            //var material_=new THREE.MeshBasicMaterial({
                            map: getLabelTexture(point_.Name || " "),
                            //map:new THREE.TextureLoader().load("asset/PublicPointIco/100003.png"),
                            depthTest: false,
                            color: 0xFFFFFF
                        });
                        material_.map.needsUpdate = true;
                        material_.sizeAttenuation = false;
                        var label_ = new THREE.Sprite(material_);
                        //var label_=new THREE.Mesh(new THREE.PlaneGeometry(40,40),material_);
                        label_.scale.set(100, 50, 1);
                        label_.position.copy(positionVec3);
                        this.funcAreasLabels.add(label_);
                    }
                }
                return this.funcAreasLabels;
            };
            return ArchiteFloor;
        }());
        /**     * 建筑基类     */
        var ArchiteBase = (function () {
            function ArchiteBase(data_, is3D_) {
                this.archite_show = true;
                this.archite_name = "";
                this.archite_id = "";
                this.is3D = true;
                /**         * oriData         */
                this.oriData = null;
                /**         * 建筑名称         */
                this.ArchiteName = "";
                /**         * 建筑轮廓         */
                this.ArchiteOutLine = [];
                /**         * 建筑id         */
                this.ArchiteID = "";
                /**         * 大厦模型         */
                this.ArchiteMesh = null;
                /**         * 标注         */
                this.ArchiteSprite = null;
                this.ArchiteIcon = null;
                this.ArchiteLabel = null;
                /**         * 楼层         */
                this.architeFloors = [];
                /**         * 轮廓模型         */
                this.buildingOutLine = null;
                this.buildingOutLineShow = false;
                this.oriData = data_;
                this.ArchiteName = this.oriData.building.Name;
                this.ArchiteOutLine = this.oriData.building.Outline;
                this.ArchiteID = this.oriData.building._id;
                this.is3D = is3D_;
                /**             * 创建大厦3D对象             */
                this.ArchiteMesh = new THREE.Object3D();
                /**             * 创建标注对象             */
                this.ArchiteSprite = new THREE.Object3D();
                this.ArchiteIcon = new THREE.Object3D();
                this.ArchiteLabel = new THREE.Object3D();
                this.ArchiteSprite.add(this.ArchiteIcon);
                this.ArchiteSprite.add(this.ArchiteLabel);
                /**             * 旋转             */
                this.ArchiteMesh.rotateX(-(Math.PI / 2));
                this.ArchiteSprite.rotateX(-(Math.PI / 2));
                this.parseBuildingOutLine();
            }
            /**         * 解析建筑轮廓         */
            ArchiteBase.prototype.parseBuildingOutLine = function () {
                this.buildingOutLine = getDataMesh(this.oriData.building);
                this.buildingOutLine.visible = this.buildingOutLineShow;
                this.ArchiteMesh.add(this.buildingOutLine);
            };
            /**         * 大厦轮廓展示         */
            ArchiteBase.prototype.enabledBuildingOutLine = function (enabled_) {
                this.buildingOutLine.visible = enabled_;
                this.buildingOutLineShow = enabled_;
            };
            /**
             * 获取默认楼层
             * @returns {any}
             */
            ArchiteBase.prototype.getDefaultFoolr = function () {
                return this.oriData.building.DefaultFloor;
            };
            /**         * 展示楼层模型         */
            ArchiteBase.prototype.showFloorsMeshByID = function (floor_) {
                var selectFloors = null;
                selectFloors = _.findWhere(this.architeFloors, { archite_id: floor_ });
                //对应楼层是否已创建
                if (selectFloors) {
                    //当前仅选中的楼层显示
                    if (this.architeFloors.length == 1) {
                        return;
                    }
                }
                else {
                    //不存在选择的模型，则创建
                    selectFloors = this.createFloors(floor_);
                    selectFloors.archite_id;
                    selectFloors.archite_name;
                    selectFloors.archite_show;
                    this.architeFloors.push(selectFloors); //添加到已创建模型
                    //展示模型
                    this.ArchiteMesh.add(selectFloors.getFuncAreasMesh());
                }
            };
            /**         * 楼层公共设施         */
            ArchiteBase.prototype.enabledFloorsPubPoints = function (show_) {
                //查询所有显示的楼层
                var curShowFloors_ = _.where(this.architeFloors, { archite_show: true });
                for (var i = 0; i < curShowFloors_.length; i++) {
                    var obj = curShowFloors_[i];
                    this.ArchiteIcon.add(obj.getPubPoints(true));
                }
            };
            /**         * 楼层标注         */
            ArchiteBase.prototype.enabledFloorsLabel = function (show_) {
                //查询所有显示的楼层
                var curShowFloors_ = _.where(this.architeFloors, { archite_show: true });
                for (var i = 0; i < curShowFloors_.length; i++) {
                    var obj = curShowFloors_[i];
                    this.ArchiteIcon.add(obj.getFuncAreasLabel(true));
                }
            };
            /**
             * 创建对应模型
             * @returns {liaohengfan.LI_ARCHITE.ArchiteFloor}
             */
            ArchiteBase.prototype.createFloors = function (floor_) {
                var floorData_ = null;
                /**             * 所有楼层             */
                floorData_ = _.findWhere(this.oriData.Floors || [], { _id: floor_ });
                //没有找到对应楼层
                if (!floorData_)
                    return;
                //创建楼层
                var floor_ = new ArchiteFloor(floorData_);
                return floor_;
            };
            return ArchiteBase;
        }());
        /**     * UI管理     */
        var ArchiteUI = (function () {
            function ArchiteUI(dom_, webgl_) {
                this.webgl = null;
                this.uiStyles = null;
                this.uiStylesStr = "";
                this.domClass = "";
                this.domID = "";
                this.domContainer = null;
                this.curArchite = null;
                this.webgl = webgl_;
                this.domContainer = dom_;
                this.domID = d3.select(dom_).attr("id");
                this.domClass = d3.select(dom_).attr("class");
                this.appendUIStyle(".layui-btn{margin: 0;padding:0;min-width:38px;min-height: 38px;font-size: 20px;line-height: 38px;}");
                this.appendUIStyle(".layui-btn+.layui-btn{margin:0;padding:0}");
                this.createScale();
            }
            ArchiteUI.prototype.appendUIStyle = function (styles_) {
                if (!this.uiStyles) {
                    this.uiStyles = d3.select("head").append("style");
                }
                if (this.domID) {
                    styles_ += (this.domID + " " + styles_);
                }
                else if (this.domClass) {
                    styles_ += (this.domClass + " " + styles_);
                }
                else {
                    styles_;
                }
                this.uiStylesStr += styles_;
                this.uiStyles.html(this.uiStylesStr);
            };
            ArchiteUI.prototype.createScale = function () {
                var that_ = this;
                var enlarge_ = this.createBtn("+", [10, 10, 0, 0], function () {
                    if (that_.webgl) {
                        that_.webgl.zoomIn();
                    }
                });
                var narrow_ = this.createBtn("-", [10, 48, 0, 0], function () {
                    if (that_.webgl) {
                        that_.webgl.zoomAway();
                    }
                });
            };
            ArchiteUI.prototype.createBtn = function (name_, pos_, callBack_) {
                callBack_ = callBack_ || function () { };
                var position_ = { left: 0, top: 0, right: 0, bottom: 0 };
                position_.left = pos_[0] || 10;
                position_.top = pos_[1] || 10;
                position_.right = pos_[2] || 0;
                position_.bottom = pos_[3] || 0;
                var btn_ = d3.select(this.domContainer).append("button");
                btn_.attr("class", "layui-btn layui-btn-primary");
                btn_.text(name_);
                btn_.style({
                    "position": "absolute",
                    "left": position_.left + "px",
                    "top": position_.top + "px",
                    "right": position_.right + "px",
                    "bottom": position_.bottom + "px"
                });
                btn_.on("click", function (e_) {
                    callBack_();
                });
                return btn_;
            };
            /**         * 刷新UI数据         */
            ArchiteUI.prototype.updataUIByArchiteBase = function (archite_) {
            };
            return ArchiteUI;
        }());
        /**     * WebGL     */
        var ArchiteWebGL = (function () {
            function ArchiteWebGL(dom_, controlDom_) {
                this.domContainer = null;
                this.controlDom = null;
                this.renderer = null;
                this.camera = null;
                this.scene = null;
                this.curArchite = null;
                this.cameraControls = [];
                this.labelScene = null;
                this.labelCamera = null;
                this.domContainer = dom_;
                this.controlDom = controlDom_;
                this.init();
            }
            /**         * 初始化         */
            ArchiteWebGL.prototype.init = function () {
                /**     * webgl  / canvas 渲染判断     */
                if (Detector.webgl) {
                    this.renderer = new THREE.WebGLRenderer({ antialias: true });
                }
                else {
                    this.renderer = new THREE.CanvasRenderer({ antialias: true });
                }
                this.createPerspective();
                this.createOrthographic();
                this.createLights();
                this.renderer.setClearColor(0xf1f2f7);
                this.renderer.setSize(V_WIDTH, V_HEIGHT);
                this.renderer.autoClear = false;
                /**         * 绑定渲染         */
                this.domContainer.appendChild(this.renderer.domElement);
            };
            /**         * 创建正交投影相机 用于图标展示         */
            ArchiteWebGL.prototype.createOrthographic = function () {
                this.labelCamera = new THREE.OrthographicCamera(V_WIDTH / -2, V_WIDTH / 2, V_HEIGHT / 2, V_HEIGHT / -2, NEAR, FAER);
                this.labelScene = new THREE.Scene();
                var control = new THREE.OrbitControls(this.labelCamera, this.controlDom);
                control.maxPolarAngle = Math.PI / 3;
                control.minPolarAngle = 0;
                control.minDistance = 20;
                // How far you can zoom in and out ( OrthographicCamera only )
                control.minZoom = 1;
                control.maxZoom = 10;
                control.maxDistance = Infinity;
                control.enableKeys = false;
                this.cameraControls.push(control);
                control.update();
            };
            /**         * 创建透视投影用于建筑展示         */
            ArchiteWebGL.prototype.createPerspective = function () {
                this.camera = new THREE.PerspectiveCamera(FOR, V_WIDTH / V_HEIGHT, NEAR, FAER);
                this.camera.up.set(0, 1, 0);
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                this.camera.position.z = -1200;
                this.camera.position.y = 100;
                this.camera.position.x = -1000;
                var control = new THREE.OrbitControls(this.camera, this.controlDom);
                control.maxPolarAngle = Math.PI / 3;
                control.minPolarAngle = 0;
                control.minDistance = 20;
                control.minDistance = 100;
                control.maxDistance = 50000;
                control.maxDistance = Infinity;
                control.enableKeys = false;
                this.cameraControls.push(control);
                control.update();
                this.scene = new THREE.Scene();
                this.scene.add(new THREE.AxisHelper(10000));
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
            /**         * 渲染         */
            ArchiteWebGL.prototype.render = function () {
                this.labelCamera.position.copy(this.camera.position);
                this.labelCamera.updateProjectionMatrix();
                this.renderer.clear();
                this.renderer.render(this.scene, this.camera);
                //this.renderer.render(this.scene,this.labelCamera);
                this.renderer.render(this.labelScene, this.camera);
                //this.renderer.render(this.labelScene,this.labelCamera);
            };
            /**         * 刷新地图数据         */
            ArchiteWebGL.prototype.updateMapByArchiteBase = function (archite_) {
                if (archite_) {
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
            return ArchiteWebGL;
        }());
        /**     * 数据管理     */
        var ArchiteData = (function () {
            function ArchiteData(ui_, webgl_) {
                this.ui = null;
                this.webgl = null;
                this.is3D = true;
                this.ui = ui_;
                this.webgl = webgl_;
            }
            /**         * 获取指定数据         */
            ArchiteData.prototype.getMapsbyAjax = function (url_, requestData_) {
                var that_ = this;
                $.ajax({
                    type: "GET",
                    url: url_,
                    dataType: "json",
                    data: requestData_,
                    success: function (data_) {
                        that_.parseMapsData(data_);
                    }
                });
            };
            /**
             * 解析数据
             * @param data_
             */
            ArchiteData.prototype.parseMapsData = function (data_) {
                /**
                 * 创建新的建筑
                 * @type {liaohengfan.LI_ARCHITE.ArchiteBase}
                 * @private
                 */
                var newArchite_ = new ArchiteBase(data_.data, this.is3D);
                /**             * 更新建筑信息             */
                this.webgl.updateMapByArchiteBase(newArchite_);
                this.ui.updataUIByArchiteBase(newArchite_);
            };
            return ArchiteData;
        }());
        function init() {
            /*var canvas=document.getElementById('canvasTexture');
            var ctx=canvas.getContext('2d');
            ctx.fillStyle='#FF0000';
            ctx.fillRect(0,0,80,100);*/
            /**     * modules     */
            layui.use('layer', function () { console.log("layer load success!"); });
            /**     * detector     */
            if (!Detector.webgl) {
                msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
                throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
                return;
            }
            /**     * webgl     */
            var architewebgl_ = new ArchiteWebGL(document.getElementById("lhf_archite_wengl_container"), document.getElementById("lhf_archite_wengl_control"));
            /**     * ui     */
            var uimana_ = new ArchiteUI(document.getElementById("lhf_archite_ui_container"), architewebgl_);
            /**     * data mana     */
            var architeDataMana_ = new ArchiteData(uimana_, architewebgl_);
            architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json", {});
            function render() {
                TWEEN.update();
                requestAnimationFrame(render);
                architewebgl_.render();
            }
            render();
            /**     * 自适应     */
            window.addEventListener('resize', onWindowResize, false);
            function onWindowResize() {
                V_WIDTH = window.innerWidth;
                V_HEIGHT = window.innerHeight;
                architewebgl_.resize();
            }
            onWindowResize();
        }
        window.onload = function () {
            init();
        };
    })(LI_ARCHITE = liaohengfan.LI_ARCHITE || (liaohengfan.LI_ARCHITE = {}));
})(liaohengfan || (liaohengfan = {}));
