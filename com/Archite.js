/**
 * Created by Administrator on 2017/2/6.
 */
var liaohengfan;
(function (liaohengfan) {
    var LI_ARCHITE;
    (function (LI_ARCHITE) {
        var V_WIDTH = 1280;
        var V_HEIGHT = 720;
        var FOR = 60;
        var NEAR = 1;
        var FAER = 10000;
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
                this.mesh = null;
                this.mesh = getDataMesh(data_, high_, color_);
            }
            return ArchiteFuncArea;
        }());
        /**     * 楼层     */
        var ArchiteFloor = (function () {
            function ArchiteFloor(data_) {
                this.floorData = null;
                this.floorData = data_;
            }
            /**         * 公共服务点         */
            ArchiteFloor.prototype.getPubPoint = function () {
            };
            /**         * 店面         */
            ArchiteFloor.prototype.getFuncAreasMesh = function () {
                var mesh_ = new THREE.Object3D();
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
                        mesh_.add(funcarea_.mesh);
                    }
                }
                return mesh_;
            };
            return ArchiteFloor;
        }());
        /**     * 建筑基类     */
        var ArchiteBase = (function () {
            function ArchiteBase(data_, is3D_) {
                this.is3D = true;
                /**         * oriData         */
                this.oriData = null;
                /**         * 建筑名称         */
                this.ArchiteName = "";
                /**         * 建筑轮廓         */
                this.ArchiteOutLine = [];
                /**         * 建筑id         */
                this.ArchiteID = "";
                this.buildingOutLine = null;
                this.oriData = data_;
                this.ArchiteName = this.oriData.building.Name;
                this.ArchiteOutLine = this.oriData.building.Outline;
                this.ArchiteID = this.oriData.building._id;
                this.is3D = is3D_;
                this.parseBuildingOutLine();
            }
            /**         * 解析建筑轮廓         */
            ArchiteBase.prototype.parseBuildingOutLine = function () {
                this.buildingOutLine = getDataMesh(this.oriData.building);
            };
            /**
             * 获取默认楼层
             * @returns {any}
             */
            ArchiteBase.prototype.getDefaultFoolr = function () {
                return this.oriData.building.DefaultFloor;
            };
            /**         * 获取楼层模型         */
            ArchiteBase.prototype.getFloorsMeshByID = function (floor_) {
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
            /**         * 获取楼层标注         */
            ArchiteBase.prototype.getFloorsLabel = function (floor_, type_) {
            };
            /**         * 获取楼层icon         */
            ArchiteBase.prototype.getFloorsIcon = function () {
            };
            return ArchiteBase;
        }());
        /**     * UI管理     */
        var ArchiteUI = (function () {
            function ArchiteUI(dom_) {
                this.domContainer = null;
                this.curArchite = null;
                this.domContainer = dom_;
            }
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
                this.camera = new THREE.PerspectiveCamera(FOR, V_WIDTH / V_HEIGHT, NEAR, FAER);
                this.camera.up.set(0, 1, 0);
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                this.camera.position.z = -1200;
                this.camera.position.y = 100;
                this.camera.position.x = -1000;
                var control = new THREE.OrbitControls(this.camera, this.controlDom);
                control.maxPolarAngle = Math.PI / 3;
                control.minPolarAngle = 0;
                control.minDistance = 1;
                control.maxDistance = Infinity;
                control.enableKeys = false;
                control.update();
                this.scene = new THREE.Scene();
                this.scene.add(new THREE.AxisHelper(10000));
                this.createLights();
                this.renderer.setClearColor(0xf1f2f7);
                this.renderer.setSize(V_WIDTH, V_HEIGHT);
                /**         * 绑定渲染         */
                this.domContainer.appendChild(this.renderer.domElement);
            };
            ArchiteWebGL.prototype.createLights = function () {
                var ambientLight_ = new THREE.AmbientLight(0xFFFFFF, .65);
                this.scene.add(ambientLight_);
                var dirLight = new THREE.DirectionalLight(0xffffff, .4);
                dirLight.color.setHSL(0.1, 1, 0.95);
                dirLight.position.set(1, 1.75, 0);
                dirLight.position.multiplyScalar(60);
                this.scene.add(dirLight);
            };
            /**         * 渲染         */
            ArchiteWebGL.prototype.render = function () {
                this.renderer.render(this.scene, this.camera);
            };
            /**         * 刷新地图数据         */
            ArchiteWebGL.prototype.updateMapByArchiteBase = function (archite_) {
                if (archite_) {
                    if (archite_.buildingOutLine) {
                        archite_.buildingOutLine.rotateX(-(Math.PI / 2));
                        this.scene.add(archite_.buildingOutLine);
                    }
                    var defaultFloor_ = archite_.getDefaultFoolr();
                    var floorMesh_ = archite_.getFloorsMeshByID(defaultFloor_).getFuncAreasMesh();
                    floorMesh_.rotateX(-(Math.PI / 2));
                    this.scene.add(floorMesh_);
                }
            };
            /**         * 窗口更改         */
            ArchiteWebGL.prototype.resize = function () {
                this.renderer.setSize(V_WIDTH, V_HEIGHT);
                this.camera.aspect = V_WIDTH / V_HEIGHT;
                this.camera.updateProjectionMatrix();
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
            /**     * modules     */
            layui.use('layer', function () { console.log("layer load success!"); });
            /**     * detector     */
            if (!Detector.webgl) {
                msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
                throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
                return;
            }
            /**     * ui     */
            var uimana_ = new ArchiteUI(document.getElementById("lhf_archite_ui_container"));
            /**     * webgl     */
            var architewebgl_ = new ArchiteWebGL(document.getElementById("lhf_archite_wengl_container"), document.getElementById("lhf_archite_wengl_control"));
            /**     * data mana     */
            var architeDataMana_ = new ArchiteData(uimana_, architewebgl_);
            architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json", {});
            function render() {
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
