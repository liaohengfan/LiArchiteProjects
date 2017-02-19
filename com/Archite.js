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
        var NEAR = 10;
        var FAER = 10000;
        var ICON_ASSET_BASE = "asset/PublicPointIco/";
        var ICON_TYPE_CHECK = [
            { name: "ATM", type: "31003", ico: "ATM.png", en: "" },
            { name: "残障洗手间", type: "11005", ico: "crippled.png", en: "" },
            { name: "出入口", type: "31004", ico: "entry.png", en: "" },
            { name: "扶梯", type: "21002", ico: "escalator.png", en: "" },
            { name: "女洗手间", type: "11003", ico: "Female.png", en: "" },
            { name: "问讯处", type: "31001", ico: "inquiry.png", en: "" },
            { name: "直梯", type: "21003", ico: "lift.png", en: "" },
            { name: "补妆间", type: "31002", ico: "Makeup.png", en: "" },
            { name: "男洗手间", type: "11002", ico: "Male.png", en: "" },
            { name: "母婴室", type: "11004", ico: "MomBaby.png", en: "" },
            { name: "楼梯", type: "21001", ico: "stair.png", en: "" },
            { name: "洗手间", type: "11001", ico: "toilet.png", en: "" }
        ];
        var PI2 = Math.PI * 2;
        /**
         * 通过type获取icon
         */
        function getIconUrlByType(type_) {
            var obj_ = _.findWhere(ICON_TYPE_CHECK, { type: type_ });
            if (obj_) {
                return (ICON_ASSET_BASE + obj_.ico);
            }
            return "";
        }
        /**
         * 根据经纬度获取坐标点
         */
        function getPositionByLonLat(phi_, theta_, radius_) {
            var position_ = new THREE.Vector3();
            position_.x = radius_ * Math.sin(phi_) * Math.sin(theta_);
            position_.y = radius_ * Math.cos(phi_);
            position_.z = radius_ * Math.sin(phi_) * Math.cos(theta_);
            return position_;
        }
        /**     * 信息输出     */
        var msg = function (info_) {
            if (layui.layer) {
                layui.layer.msg(info_);
            }
            else {
                alert(info_);
            }
        };
        /**     * 更新广告牌位置     */
        function updateBillBoards(billboards_, proMatrix_) {
            var V_WHalf = V_WIDTH >> 1;
            var V_HHalf = V_HEIGHT >> 1;
            for (var i = 0; i < billboards_.children.length; i++) {
                var sprite = billboards_.children[i];
                //var vec = new THREE.Vector3(sprite.lockX, 0, -sprite.lockY);
                var vec = new THREE.Vector3(sprite.lockX, sprite.lockZ, -sprite.lockY);
                vec.applyProjection(proMatrix_);
                var x = Math.round(vec.x * V_WHalf);
                var y = Math.round(vec.y * V_HHalf);
                var z = Math.round(vec.z * V_HHalf);
                //sprite.position.set(x, y, sprite.lockZ);
                sprite.position.set(x, y, z);
            }
        }
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
            ctx_.lineWidth = '4';
            ctx_.font = "32px Arial";
            //ctx_.strokeText(str_,10,40);
            ctx_.fillText(str_, 10, 40);
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
            var outline = {
                outline3D: new THREE.Object3D(),
                outline2D: new THREE.Object3D()
            };
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
                        var outLine2DGeo_ = new THREE.ShapeGeometry(outLineShape_);
                        var defaultMaterial2D_ = new THREE.MeshBasicMaterial({
                            color: (color_ || 0xFFFFFF)
                        });
                        var outLine2DMesh_ = new THREE.Mesh(outLine2DGeo_, defaultMaterial2D_);
                        outLine2DMesh_.defaultMaterial = defaultMaterial2D_;
                        outLine2DMesh_.selMaterial = null;
                        /**                             * 楼层高度                             */
                        buildingExtrudeSettings.amount = (data_.High || high_) * 10;
                        var outLine3DGeo_ = new THREE.ExtrudeGeometry(outLineShape_, buildingExtrudeSettings);
                        var defaultMaterial3D_ = new THREE.MeshLambertMaterial({
                            color: (color_ || 0xFFFFFF),
                            side: THREE.DoubleSide
                        });
                        var outLine3DMesh_ = new THREE.Mesh(outLine3DGeo_, defaultMaterial3D_);
                        outLine3DMesh_.defaultMaterial = defaultMaterial3D_;
                        outLine3DMesh_.selMaterial = null;
                        color_ += 1;
                        outline.outline3D.add(outLine3DMesh_);
                        outline.outline2D.add(outLine2DMesh_);
                    }
                }
            }
            return outline;
        } /**     * 解析所有轮廓     */
        function getLimitHeightDataMesh(data_, high_, color_) {
            if (high_ === void 0) { high_ = 1; }
            if (color_ === void 0) { color_ = 0xFFFFFF; }
            var outline = {
                outline3D: new THREE.Object3D(),
                outline2D: new THREE.Object3D()
            };
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
                        var outLine2DGeo_ = new THREE.ShapeGeometry(outLineShape_);
                        var defaultMaterial2D_ = new THREE.MeshBasicMaterial({
                            color: (color_ || 0xFFFFFF)
                        });
                        var outLine2DMesh_ = new THREE.Mesh(outLine2DGeo_, defaultMaterial2D_);
                        outLine2DMesh_.defaultMaterial = defaultMaterial2D_;
                        /**                             * 楼层高度                             */
                        buildingExtrudeSettings.amount = (high_) * 10;
                        var defaultMaterial3D_ = new THREE.MeshLambertMaterial({
                            color: (color_ || 0xFFFFFF)
                        });
                        var outLine3DGeo_ = new THREE.ExtrudeGeometry(outLineShape_, buildingExtrudeSettings);
                        var outLine3DMesh_ = new THREE.Mesh(outLine3DGeo_, defaultMaterial3D_);
                        outLine3DMesh_.defaultMaterial = defaultMaterial3D_;
                        color_ += 1;
                        outline.outline3D.add(outLine3DMesh_);
                        outline.outline2D.add(outLine2DMesh_);
                    }
                }
            }
            return outline;
        }
        /**     * 修改透明度     */
        function meshChangeOpacity(object3D_, alpha_) {
            alpha_ = alpha_ || 1;
            var transparent_ = true;
            if (alpha_ >= 1) {
                transparent_ = false;
            }
            function changeOpacity(mesh_) {
                if (mesh_ && mesh_.type == "Mesh") {
                    if (mesh_.defaultMaterial) {
                        mesh_.defaultMaterial.transparent = transparent_;
                        mesh_.defaultMaterial.opacity = alpha_;
                    }
                }
                if (mesh_ && mesh_.type == "Sprite") {
                    if (mesh_.defaultMaterial) {
                        mesh_.defaultMaterial.transparent = transparent_;
                        mesh_.defaultMaterial.opacity = alpha_;
                    }
                }
                if (mesh_.children && mesh_.children.length) {
                    for (var i = 0; i < mesh_.children.length; i++) {
                        var object3d_ = mesh_.children[i];
                        changeOpacity(object3d_);
                    }
                }
            }
            if (object3D_) {
                changeOpacity(object3D_);
            }
        }
        /**     * 门店     */
        var ArchiteFuncArea = (function () {
            function ArchiteFuncArea(data_, high_, color_) {
                this.archite_show = true;
                this.archite_name = "";
                this.archite_id = "";
                this.mesh = null;
                this.plane = null;
                this.archite_id = data_._id;
                this.archite_name = data_.Name;
                var outLine_ = getDataMesh(data_, high_, color_);
                this.mesh = outLine_.outline3D;
                this.plane = outLine_.outline2D;
            }
            return ArchiteFuncArea;
        }());
        /**     * 楼层     */
        var ArchiteFloor = (function () {
            function ArchiteFloor(data_, y_) {
                this.showStuts = 1;
                this.archite_show = true;
                this.archite_name = "";
                this.archite_id = "";
                this.floorData = null;
                this.is3D = true;
                this.yAxis = 0;
                this.floorHigh = 0;
                /**
                 * 公共设施点
                 * @type {any}
                 */
                this.PubPoints = null;
                this.floorGround = null;
                this.floorGround2D = null;
                this.funcAreas = [];
                this.funcAreaMesh = null;
                this.funcAreaMesh2D = null;
                /**         * 店铺         */
                this.funcAreasLabels = null;
                this.floorData = data_;
                this.archite_id = data_._id;
                this.archite_name = data_.Name;
                this.yAxis = y_;
                this.floorHigh = data_.High * 10;
            }
            ArchiteFloor.prototype.applyStuts = function (object_, visible_, opacity_) {
                if (object_) {
                    object_.visible = visible_;
                    if (visible_) {
                        meshChangeOpacity(object_, opacity_);
                    }
                }
            };
            /**         * 更新标注显示位置         */
            ArchiteFloor.prototype.updateLabelsPosition = function (proMatrix_) {
                if (this.funcAreasLabels) {
                    updateBillBoards(this.funcAreasLabels, proMatrix_);
                }
            };
            /**         * 更新标注位置         */
            ArchiteFloor.prototype.updateSpritesPosition = function (proMatrix_) {
                if (this.PubPoints) {
                    updateBillBoards(this.PubPoints, proMatrix_);
                }
            };
            ArchiteFloor.prototype.stutsChange = function (type_) {
                if (type_ == this.showStuts)
                    return;
                this.showStuts = type_;
                switch (this.showStuts) {
                    case 1:
                        //3D
                        this.applyStuts(this.floorGround, true, 1);
                        this.applyStuts(this.funcAreaMesh, true, 1);
                        //2D
                        this.applyStuts(this.floorGround2D, true, 1);
                        this.applyStuts(this.funcAreaMesh2D, true, 1);
                        this.applyStuts(this.PubPoints, true, 1);
                        this.applyStuts(this.funcAreasLabels, true, 1);
                        break;
                    case 2:
                        //3D
                        this.applyStuts(this.floorGround, true, .1);
                        this.applyStuts(this.funcAreaMesh, true, .1);
                        //2D
                        this.applyStuts(this.floorGround2D, true, .1);
                        this.applyStuts(this.funcAreaMesh2D, true, .1);
                        this.applyStuts(this.PubPoints, true, .1);
                        this.applyStuts(this.funcAreasLabels, true, .1);
                        break;
                    default:
                        //3D
                        this.applyStuts(this.floorGround, false, .1);
                        this.applyStuts(this.funcAreaMesh, false, .1);
                        //2D
                        this.applyStuts(this.floorGround2D, false, .1);
                        this.applyStuts(this.funcAreaMesh2D, false, .1);
                        this.applyStuts(this.PubPoints, false, .1);
                        this.applyStuts(this.funcAreasLabels, false, .1);
                        break;
                }
            };
            /**         * 公共服务点         */
            ArchiteFloor.prototype.getPubPoints = function (enabled_) {
                if (this.PubPoints) {
                    this.PubPoints.visible = enabled_;
                    return this.PubPoints;
                }
                this.PubPoints = new THREE.Object3D();
                this.PubPoints.position.z = (this.yAxis);
                this.PubPoints.visible = enabled_;
                //公共设施
                if (this.floorData.PubPoint) {
                    this.floorData.PubPoint = this.floorData.PubPoint || [];
                    var y_z = this.floorData.High;
                    y_z *= 10;
                    var lockZ = ((this.yAxis)) + y_z;
                    for (var i = 0; i < this.floorData.PubPoint.length; i++) {
                        var point_ = this.floorData.PubPoint[i];
                        var position_ = point_.Outline[0][0];
                        var positionVec3 = new THREE.Vector3(position_[0] || 0, position_[1], y_z);
                        var ico_ = getIconUrlByType(point_.Type);
                        //图标待确认
                        var material_ = new THREE.SpriteMaterial({
                            map: new THREE.TextureLoader().load(ico_),
                            color: 0xFFFFFF
                        });
                        material_.sizeAttenuation = false;
                        var sprite_ = new THREE.Sprite(material_);
                        sprite_.lockX = positionVec3.x;
                        sprite_.lockY = positionVec3.y;
                        sprite_.lockZ = lockZ;
                        sprite_.defaultMaterial = material_;
                        sprite_.scale.set(24, 24, 1);
                        sprite_.position.copy(positionVec3);
                        this.PubPoints.add(sprite_);
                    }
                }
                return this.PubPoints;
            };
            /**         * 楼层地板         */
            ArchiteFloor.prototype.getFloorGround = function (is3D_) {
                if (is3D_ === void 0) { is3D_ = true; }
                if (this.floorGround) {
                    if (is3D_) {
                        return this.floorGround;
                    }
                    else {
                        return this.floorGround2D;
                    }
                }
                this.floorGround = new THREE.Object3D();
                this.floorGround.position.z = this.yAxis - 10;
                this.floorGround2D = new THREE.Object3D();
                this.floorGround2D.position.z = (this.yAxis + this.floorHigh) - 1;
                if (this.floorData.Outline) {
                    var floor_ = getLimitHeightDataMesh(this.floorData, 1, 0xFFFFFF);
                    this.floorGround.add(floor_.outline3D);
                    this.floorGround2D.add(floor_.outline2D);
                }
                if (is3D_) {
                    return this.floorGround;
                }
                else {
                    return this.floorGround2D;
                }
            };
            /**         * 店面         */
            ArchiteFloor.prototype.getFuncAreasMesh = function (is3D_) {
                //模型已经创建
                if (this.funcAreaMesh) {
                    if (is3D_) {
                        return this.funcAreaMesh;
                    }
                    else {
                        return this.funcAreaMesh2D;
                    }
                }
                this.funcAreaMesh = new THREE.Object3D();
                this.funcAreaMesh.position.z = this.yAxis;
                this.funcAreaMesh2D = new THREE.Object3D();
                this.funcAreaMesh2D.position.z = (this.yAxis + this.floorHigh);
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
                        this.funcAreaMesh2D.add(funcarea_.plane);
                        this.funcAreas.push(funcarea_);
                    }
                }
                if (is3D_) {
                    return this.funcAreaMesh;
                }
                else {
                    return this.funcAreaMesh2D;
                }
            };
            /**         * 搜索店铺         */
            ArchiteFloor.prototype.searchFuncArea = function (name_) {
                var funcarea_ = _.findWhere(this.funcAreas, { archite_name: name_ });
                return funcarea_;
            };
            /**         * 获取所有店面名称         */
            ArchiteFloor.prototype.getFuncAreasLabel = function (enabled_) {
                if (this.funcAreasLabels) {
                    this.funcAreasLabels.visible = enabled_;
                    return this.funcAreasLabels;
                }
                this.funcAreasLabels = new THREE.Object3D();
                this.funcAreasLabels.position.z = (this.yAxis);
                this.funcAreasLabels.visible = enabled_;
                //公共设施
                if (this.floorData.FuncAreas) {
                    this.floorData.FuncAreas = this.floorData.FuncAreas || [];
                    var y_z = this.floorData.High;
                    y_z *= 10;
                    var lockZ = ((this.yAxis)) + y_z;
                    for (var i = 0; i < this.floorData.FuncAreas.length; i++) {
                        var point_ = this.floorData.FuncAreas[i];
                        var position_ = point_.Center;
                        var positionVec3 = new THREE.Vector3(position_[0] || 0, position_[1], y_z);
                        var material_ = new THREE.SpriteMaterial({
                            map: getLabelTexture(point_.Name || " "),
                            color: 0xFFFFFF
                        });
                        material_.map.needsUpdate = true;
                        material_.sizeAttenuation = false;
                        var label_ = new THREE.Sprite(material_);
                        label_.lockX = positionVec3.x;
                        label_.lockY = positionVec3.y;
                        label_.lockZ = lockZ;
                        label_.defaultMaterial = material_;
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
                this.showall = false;
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
                this.ArchiteMesh2D = null;
                /**         * 大厦地面         */
                this.floorGround = null;
                this.floorGround2D = null;
                /**         * 标注         */
                this.ArchiteSprite = null;
                this.ArchiteIcon = null;
                this.ArchiteLabel = null;
                /**         * 楼层         */
                this.architeFloors = [];
                /**         * 轮廓模型         */
                this.buildingOutLine = null;
                this.buildingOutLineShow = false;
                this.pubPointShow = true;
                this.funcareaLabelShow = true;
                this.oriData = data_;
                this.ArchiteName = this.oriData.building.Name;
                this.ArchiteOutLine = this.oriData.building.Outline;
                this.ArchiteID = this.oriData.building._id;
                this.archite_id = data_._id;
                this.archite_name = data_.Name;
                this.is3D = is3D_;
                this.oriData.Floors = this.oriData.Floors || [];
                /**             * 地面地板             */
                this.floorGround = new THREE.Object3D();
                this.floorGround2D = new THREE.Object3D();
                /**             * 创建大厦3D对象             */
                this.ArchiteMesh = new THREE.Object3D();
                this.ArchiteMesh2D = new THREE.Object3D();
                /**             * 创建标注对象             */
                this.ArchiteSprite = new THREE.Object3D();
                this.ArchiteIcon = new THREE.Object3D();
                this.ArchiteLabel = new THREE.Object3D();
                this.ArchiteSprite.add(this.ArchiteIcon);
                this.ArchiteSprite.add(this.ArchiteLabel);
                /**             * 旋转             */
                this.floorGround.rotateX(-(Math.PI / 2));
                this.floorGround2D.rotateX(-(Math.PI / 2));
                this.ArchiteMesh.rotateX(-(Math.PI / 2));
                this.ArchiteMesh2D.rotateX(-(Math.PI / 2));
                //this.ArchiteSprite.rotateX(-(Math.PI/2));
                //大厦轮廓
                //this.parseBuildingOutLine();
            }
            /**         * 解析建筑轮廓         */
            ArchiteBase.prototype.parseBuildingOutLine = function () {
                this.buildingOutLine = getDataMesh(this.oriData.building).outline3D;
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
            /**         * 获取楼层Y轴坐标         */
            ArchiteBase.prototype.getFloorY = function (id_) {
                var trueFloors = null;
                var y_ = 0;
                if (id_ > 0) {
                    trueFloors = _.filter(this.oriData.Floors, function (item_) {
                        return ((item_._id < id_) && (item_._id >= 0));
                    });
                    _.map(trueFloors, function (item_) {
                        y_ += (item_.High || 0);
                    });
                    return y_;
                }
                else {
                    trueFloors = _.filter(this.oriData.Floors, function (item_) {
                        return ((item_._id >= id_) && (item_._id <= 0));
                    });
                    _.map(trueFloors, function (item_) {
                        y_ -= (item_.High || 0);
                    });
                    return y_;
                }
            };
            ArchiteBase.prototype.enabeld3D = function (enabled_) {
                this.is3D = enabled_;
                _.map(this.architeFloors, function (floor_) {
                    floor_.is3D = enabled_;
                });
            };
            /**
             * 切换到2D展示
             */
            ArchiteBase.prototype.display2DPattern = function () {
                var that_ = this;
                //当前显示的楼层
                var curShowFloors_ = _.filter(that_.architeFloors, function (item_) {
                    return item_.showStuts == 1;
                });
                //当前透明的楼层
                var curOpacityFloors_ = _.filter(that_.architeFloors, function (item_) {
                    return item_.showStuts == 2;
                });
                if (!curShowFloors_.length)
                    return;
                //对当前显示的楼层进行排序
                curShowFloors_ = _.sortBy(curShowFloors_, function (item_) {
                    return (item_._id || -100); //不包含id 则排序最低
                });
                //取最高的楼层
                var selectFloor_ = _.first(curShowFloors_);
                try {
                    selectFloor_.stutsChange(1); //显示当前楼层
                }
                catch (e) {
                }
                //隐藏其他楼层
                var hideFloors_ = _.rest(curShowFloors_);
                _.map(hideFloors_, function (item_) {
                    try {
                        item_.stutsChange(0); //隐藏楼层
                    }
                    catch (e) {
                    }
                });
                _.map(curOpacityFloors_ || [], function (item_) {
                    try {
                        item_.stutsChange(0); //隐藏楼层
                    }
                    catch (e) {
                    }
                });
            };
            /**         * 展示楼层模型         */
            ArchiteBase.prototype.showFloorsMeshByID = function (floor_, otherVisiblely_) {
                if (otherVisiblely_ === void 0) { otherVisiblely_ = false; }
                var selectFloors = null;
                selectFloors = _.findWhere(this.architeFloors, { archite_id: floor_ });
                /**
                 * 需要隐藏的楼层
                 * @type {any}
                 */
                var hideFloors = null;
                hideFloors = _.reject(this.architeFloors, function (item_) {
                    return item_.archite_id == floor_;
                });
                if (hideFloors && hideFloors.length) {
                    for (var i = 0; i < hideFloors.length; i++) {
                        var tempFloor_ = hideFloors[i];
                        if (tempFloor_) {
                            if (otherVisiblely_) {
                                tempFloor_.stutsChange(0);
                            }
                            else {
                                tempFloor_.stutsChange(2);
                            }
                        }
                    }
                }
                //对应楼层是否已创建
                if (selectFloors) {
                    //当前仅选中的楼层显示
                    selectFloors.stutsChange(1);
                }
                else {
                    //不存在选择的模型，则创建
                    selectFloors = this.createFloors(floor_);
                    if (!selectFloors)
                        return;
                    this.architeFloors.push(selectFloors); //添加到已创建模型
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
            };
            /**
             * 搜索
             * @param name_
             * @param type_
             */
            ArchiteBase.prototype.search = function (name_) {
                //检索数据中是否存在
                var floorDatas_ = _.filter(this.oriData.Floors || [], function (floor_) {
                    if (_.findWhere(floor_.FuncAreas || [], { Name: name_ })) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                //不存在
                if (!floorDatas_ || !floorDatas_.length) {
                    return null;
                }
                var floorData_ = floorDatas_[0];
                //获取/创建楼层
                var floor_ = this.showFloorsMeshByID(floorData_._id);
                if (!floor_) {
                    return null;
                }
                var func_ = floor_.searchFuncArea(name_);
                if (func_) {
                    return func_;
                }
                return null;
            };
            /**         * 显示所有楼层         */
            ArchiteBase.prototype.showAllFloors = function () {
                var that_ = this;
                _.map(that_.oriData.Floors || [], function (floor_, index_) {
                    var curFloor_ = _.findWhere(that_.architeFloors, { archite_id: floor_._id });
                    if (curFloor_) {
                    }
                    else {
                        //不存在选择的模型，则创建
                        curFloor_ = that_.createFloors(floor_._id);
                        if (!curFloor_)
                            return;
                        that_.architeFloors.push(curFloor_); //添加到已创建模型
                        //展示模型
                        that_.ArchiteMesh.add(curFloor_.getFuncAreasMesh(true));
                        that_.ArchiteMesh2D.add(curFloor_.getFuncAreasMesh(false));
                        //展示楼层地板
                        that_.floorGround.add(curFloor_.getFloorGround(true));
                        that_.floorGround2D.add(curFloor_.getFloorGround(false));
                        //显示标注
                        that_.ArchiteIcon.add(curFloor_.getPubPoints(that_.pubPointShow));
                        that_.ArchiteIcon.add(curFloor_.getFuncAreasLabel(that_.funcareaLabelShow));
                    }
                    if (index_ == 0) {
                        curFloor_.stutsChange(1);
                    }
                    else {
                        curFloor_.stutsChange(2);
                    }
                });
            };
            /**
             * 刷新广告牌显示
             * @param proMatrix_
             */
            ArchiteBase.prototype.updateBillBoards = function (camera_) {
                if (!camera_)
                    return;
                if (this.pubPointShow || this.funcareaLabelShow) {
                    var proMatrix_ = new THREE.Matrix4();
                    proMatrix_.multiplyMatrices(camera_.projectionMatrix, camera_.matrixWorldInverse);
                    for (var i = 0; i < this.architeFloors.length; i++) {
                        var floor_ = this.architeFloors[i];
                        if (floor_.showStuts == 0) {
                            continue;
                        }
                        else {
                            if (this.pubPointShow)
                                floor_.updateSpritesPosition(proMatrix_);
                            if (this.funcareaLabelShow)
                                floor_.updateLabelsPosition(proMatrix_);
                        }
                    }
                }
            };
            /**         * 楼层公共设施         */
            ArchiteBase.prototype.enabledFloorsPubPoints = function (show_) {
                this.pubPointShow = show_;
                //查询所有显示的楼层
                var curShowFloors_ = _.where(this.architeFloors, { archite_show: true });
                for (var i = 0; i < curShowFloors_.length; i++) {
                    var obj = curShowFloors_[i];
                    this.ArchiteIcon.add(obj.getPubPoints(show_));
                }
            };
            /**         * 楼层标注         */
            ArchiteBase.prototype.enabledFloorsLabel = function (show_) {
                this.funcareaLabelShow = show_;
                //查询所有显示的楼层
                var curShowFloors_ = _.where(this.architeFloors, { archite_show: true });
                for (var i = 0; i < curShowFloors_.length; i++) {
                    var obj = curShowFloors_[i];
                    this.ArchiteIcon.add(obj.getFuncAreasLabel(show_));
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
                var y_ = this.getFloorY(floor_);
                //创建楼层
                var floor_ = new ArchiteFloor(floorData_, y_ * 80);
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
                this.floorDom = null;
                this.webgl = webgl_;
                this.domContainer = dom_;
                this.domID = d3.select(dom_).attr("id");
                this.domClass = d3.select(dom_).attr("class");
                this.appendUIStyle(".layui-btn{margin: 0;padding:0;min-width:38px;min-height: 38px;font-size: 20px;line-height: 38px;}");
                this.appendUIStyle(".layui-btn+.layui-btn{margin:0;padding:0}");
                this.appendUIStyle(".layui-form-label{width:auto;}");
                this.appendUIStyle(".layui-input-block{margin-left:0;}");
                this.createScale();
                this.createSearch();
                this.createSwitchControl();
                this.createBackgroundSet();
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
                this.curArchite = archite_;
                this.createFloorsBtn(archite_);
            };
            ArchiteUI.prototype.createSearch = function () {
                var that_ = this;
                var search_ = d3.select(this.domContainer).append("div")
                    .style({
                    "width": "150px",
                    "height": "50px",
                    "position": "absolute",
                    "left": "50px",
                    "top": "10px",
                    "right": "0px",
                    "bottom": "0px"
                });
                var input_ = search_.append("input")
                    .attr({
                    "class": "layui-input",
                    "id": "funcareaSearchInput",
                    "type": "text",
                    "checked": "",
                    "title": "搜索"
                });
                var searchBtn_ = that_.createBtn("搜索", [200, 10, 0, 0], function () {
                    var searchName_ = input_[0][0].value;
                    if (!searchName_) {
                        msg("搜索内容为空！！");
                        return;
                    }
                    if (searchName_ == "") {
                        msg("搜索内容为空！！");
                        return;
                    }
                    if (that_.webgl) {
                        that_.webgl.searchFuncArea(searchName_);
                    }
                });
            };
            /**         * 创建功能开关         */
            ArchiteUI.prototype.createSwitchControl = function () {
                var form_ = d3.select(this.domContainer).append("form");
                form_.attr("class", "layui-form");
                /**
                 * 创建复选框
                 * @param name_
                 * @param pos_
                 * @param callBack_
                 */
                function createCheckBox(name_, pos_, callBack_) {
                    callBack_ = callBack_ || function () { };
                    var position_ = { left: 0, top: 0, right: 0, bottom: 0 };
                    position_.left = pos_[0] || 10;
                    position_.top = pos_[1] || 10;
                    position_.right = pos_[2] || 0;
                    position_.bottom = pos_[3] || 0;
                    var checkItem_ = form_.append("div")
                        .style({
                        "width": "150px",
                        "height": "50px",
                        "position": "absolute",
                        "left": position_.left + "px",
                        "top": position_.top + "px",
                        "right": position_.right + "px",
                        "bottom": position_.bottom + "px"
                    });
                    var checkBoxDiv_ = checkItem_.append("div")
                        .attr("class", "layui-input-block");
                    var checkBox_ = checkBoxDiv_.append("input")
                        .attr({
                        "type": "checkbox",
                        "checked": "",
                        "name": "open",
                        "title": name_
                    });
                    checkItem_.on("click", function (e_) {
                        var enbaled_ = checkBox_[0][0].checked;
                        callBack_(enbaled_);
                    });
                    return checkItem_;
                }
                var that_ = this;
                var pubPoint_ = createCheckBox("公共设施", [0, 100, 0, 0], function (enabled_) {
                    console.log("公共设施change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.pubPointEnabled(enabled_);
                    }
                });
                var funcAreaName_ = createCheckBox("店铺名称", [0, 150, 0, 0], function (enabled_) {
                    console.log("店铺名称change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.funcAreasLabelEnabled(enabled_);
                    }
                });
                var selectFunArea_ = createCheckBox("店铺选择", [0, 200, 0, 0], function (enabled_) {
                    console.log("店铺选择change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.selectEnabled = enabled_;
                    }
                });
                var leftrightRotation_ = createCheckBox("左右旋转", [0, 250, 0, 0], function (enabled_) {
                    console.log("左右旋转change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.enabledRotateLeft(enabled_);
                    }
                });
                var upRotation_ = createCheckBox("上下旋转", [0, 300, 0, 0], function (enabled_) {
                    console.log("上下旋转change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.enabledRotateUp(enabled_);
                    }
                });
                var moveMap_ = createCheckBox("移动地图", [0, 350, 0, 0], function (enabled_) {
                    console.log("移动地图change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.enabledMapMove(enabled_);
                    }
                });
                var proShow_ = createCheckBox("三维展示", [0, 400, 0, 0], function (enabled_) {
                    console.log("三维展示change:" + enabled_);
                    if (that_.webgl) {
                        that_.webgl.enabled3D(enabled_);
                    }
                });
            };
            /**         * 创建楼层管理         */
            ArchiteUI.prototype.createFloorsBtn = function (archite_) {
                var that_ = this;
                var floorsData_ = archite_.oriData.Floors || [];
                if (!that_.floorDom) {
                    var floorDomTemp_ = d3.select(that_.domContainer).append("div");
                    that_.floorDom = floorDomTemp_;
                    floorDomTemp_.style({
                        "width": "50px",
                        "height": "auto",
                        "position": "absolute",
                        "right": "10px",
                        "top": "10px"
                    });
                }
                var _floorDom = this.floorDom;
                //所有楼层
                var allBtn_ = _floorDom.append("button")
                    .attr("class", "layui-btn layui-btn-primary")
                    .text("All");
                allBtn_.on("click", function (e_) {
                    that_.showAllFloors();
                });
                var floorsDiv_ = _floorDom.append("div")
                    .style({
                    "width": "50px",
                    "max-height": "300px"
                });
                floorsDiv_.selectAll("button").remove();
                var floorBtns_ = floorsDiv_.selectAll("button")
                    .data(floorsData_)
                    .enter()
                    .append("button")
                    .attr("class", "layui-btn layui-btn-primary")
                    .text(function (item_) {
                    return item_.Name || "--";
                })
                    .on("click", function (item_) {
                    that_.selectFloor(item_);
                });
            };
            /**
             * 选择楼层
             * @param e_
             */
            ArchiteUI.prototype.selectFloor = function (item_) {
                console.log(item_);
                //隐藏其他楼层？
                var hideOther_ = false;
                //是3D则不隐藏，不是3D就隐藏
                this.webgl.is3D ? hideOther_ = false : hideOther_ = true;
                var selfloor_ = this.curArchite.showFloorsMeshByID(item_._id, hideOther_);
                if (this.webgl) {
                    this.webgl.lookatYTweento(selfloor_.yAxis);
                }
            };
            /**
             * 显示所有楼层
             */
            ArchiteUI.prototype.showAllFloors = function () {
                if (this.webgl) {
                    this.webgl.enabled3D(true);
                }
                if (this.curArchite) {
                    this.curArchite.showAllFloors();
                }
            };
            /**         * 创建背景颜色更改         */
            ArchiteUI.prototype.createBackgroundSet = function () {
                var _this = this;
                var position_ = { left: 10, top: 450, right: 0, bottom: 0 };
                var colorItem_ = d3.select(this.domContainer).append("div")
                    .style({
                    "width": "150px",
                    "height": "50px",
                    "position": "absolute",
                    "left": position_.left + "px",
                    "top": position_.top + "px",
                    "right": position_.right + "px",
                    "bottom": position_.bottom + "px"
                });
                var colorlabel_ = colorItem_.append("label")
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
                var colorPlugs_ = colorItem_.append("div")
                    .attr("class", "webgl_backgroundColor")
                    .style({
                    "float": "left",
                    "width": "30px",
                    "height": "30px",
                    "background": "#f1f2f7",
                    "border": "1px solid #5fb878"
                });
                $('.webgl_backgroundColor').colpick({
                    color: "f1f2f7",
                    onSubmit: function (hsb, hex, rgb, el) {
                        colorPlugs_.style("background", "#" + hex);
                        hex = "0x" + hex;
                        hex = Math.floor(hex);
                        _this.webglBackgroundChange(hex);
                    }
                });
            };
            /**
             * webgl背景颜色更改
             * @param hex_
             */
            ArchiteUI.prototype.webglBackgroundChange = function (hex_) {
                if (this.webgl) {
                    this.webgl.backgroundSet(hex_);
                }
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
                if (Detector.webgl) {
                    this.renderer = new THREE.WebGLRenderer({ antialias: true });
                }
                else {
                    this.renderer = new THREE.CanvasRenderer({ antialias: true });
                }
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
                this.renderer.autoClear = false;
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
                    this.defalutCameraPosition.set(386, 1367, -1269);
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
            layui.use('form', function () { console.log("layui form load success!"); });
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
            //architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json",{});
            architeDataMana_.getMapsbyAjax("ajaxData/fangcaodi.json", {});
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
