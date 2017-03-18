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
///<reference path="ArchiteRender.ts" />
///<reference path="ArchiteFloor.ts" />
/**
 * clear reset projects 2017.03.13
 *
 * AM 10：23
 *  git change test
 *
 *  changes AM 10:37
 *
 */
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
        var curFloor_ = new ArchiteFloor(floorData_, y_ * 80);
        return curFloor_;
    };
    return ArchiteBase;
}());
//# sourceMappingURL=ArchiteBase.js.map
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
///<reference path="../src/ArchiteTools.ts" />
///<reference path="../src/ArchiteBase.ts" />
///<reference path="../src/ArchiteUI.ts" />
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
//# sourceMappingURL=ArchiteData.js.map
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
///<reference path="ArchiteRender.ts" />
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
                this.applyStuts(this.floorGround, true, 0.1);
                this.applyStuts(this.funcAreaMesh, true, 0.1);
                //2D
                this.applyStuts(this.floorGround2D, true, 0.1);
                this.applyStuts(this.funcAreaMesh2D, true, 0.1);
                this.applyStuts(this.PubPoints, true, 0.1);
                this.applyStuts(this.funcAreasLabels, true, 0.1);
                break;
            default:
                //3D
                this.applyStuts(this.floorGround, false, 0.1);
                this.applyStuts(this.funcAreaMesh, false, 0.1);
                //2D
                this.applyStuts(this.floorGround2D, false, 0.1);
                this.applyStuts(this.funcAreaMesh2D, false, 0.1);
                this.applyStuts(this.PubPoints, false, 0.1);
                this.applyStuts(this.funcAreasLabels, false, 0.1);
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
                var sprite_ = new THREE.Sprite(material_);
                sprite_.lockX = positionVec3.x;
                sprite_.lockY = positionVec3.y;
                sprite_.lockZ = lockZ;
                sprite_.defaultMaterial = material_;
                sprite_.scale.set(24, 24, 1);
                //sprite visible judge
                sprite_.width = 24;
                sprite_.height = 24;
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
                var label_ = new THREE.Sprite(material_);
                label_.lockX = positionVec3.x;
                label_.lockY = positionVec3.y;
                label_.lockZ = lockZ;
                //sprite visible judge
                label_.width = 50;
                label_.height = 25;
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
//# sourceMappingURL=ArchiteFloor.js.map
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
///<reference path="ArchiteBase.ts" />
///<reference path="ArchiteRender.ts" />
var V_WIDTH = 1280;
var V_HEIGHT = 720;
var FOR = 60;
var NEAR = 10;
var FAER = 10000;
var PI2 = Math.PI * 2;
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
 * 判断是不是电脑
 * @returns {boolean}
 * @constructor
 */
var IsPC = function () {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
};
/**     * 信息输出     */
var msg = function (info_) {
    if (layer) {
        layer.msg(info_);
    }
    else {
        alert(info_);
    }
};
var ArchiteMain = (function () {
    function ArchiteMain(container_, control_) {
        /**     * detector     */
        if (!Detector.webgl) {
            msg("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
            throw new Error("该浏览器不支持webgl / Canvas, 请更换浏览器后尝试！");
        }
        this.architewebgl = new ArchiteWebGL(container_, control_);
    }
    ArchiteMain.prototype.render = function () {
        TWEEN.update();
        this.architewebgl.render();
    };
    ArchiteMain.prototype.windowResize = function (w_, h_) {
        V_WIDTH = w_;
        V_HEIGHT = h_;
        this.architewebgl.resize();
    };
    return ArchiteMain;
}());
//# sourceMappingURL=ArchiteMain.js.map
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
        if (Detector.webgl) {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
        }
        else {
            this.renderer = new THREE.CanvasRenderer();
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
//# sourceMappingURL=ArchiteRender.js.map
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
///<reference path="ArchiteMain.ts" />
///<reference path="ArchiteBase.ts" />
///<reference path="ArchiteRender.ts" />
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
function Rect(minx, miny, maxx, maxy) {
    this.tl = [minx || 0, miny || 0]; //top left point
    this.br = [maxx || 0, maxy || 0]; //bottom right point
}
Rect.prototype.isCollide = function (rect) {
    if (rect.br[0] < this.tl[0] || rect.tl[0] > this.br[0] ||
        rect.br[1] < this.tl[1] || rect.tl[1] > this.br[1]) {
        return false;
    }
    return true;
};
/**     * 更新广告牌位置     */
function updateBillBoards(billboards_, proMatrix_) {
    var V_WHalf = Number(V_WIDTH >> 1);
    var V_HHalf = Number(V_HEIGHT >> 1);
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
        //check collision with the former sprites
        var visible = true;
        var visibleMargin = 5;
        for (var j = 0; j < i; j++) {
            var img = sprite.material.map.image;
            if (!img) {
                visible = false;
                break;
            }
            if (!(sprite.width) || !(sprite.height)) {
                visible = false;
                break;
            }
            var imgWidthHalf1 = sprite.width / 2;
            var imgHeightHalf1 = sprite.height / 2;
            var rect1 = new Rect(sprite.position.x - imgWidthHalf1, sprite.position.y - imgHeightHalf1, sprite.position.x + imgHeightHalf1, sprite.position.y + imgHeightHalf1);
            var sprite2 = billboards_.children[j];
            var sprite2Pos = sprite2.position;
            var imgWidthHalf2 = sprite2.width / 2;
            var imgHeightHalf2 = sprite2.height / 2;
            var rect2 = new Rect(sprite2Pos.x - imgWidthHalf2, sprite2Pos.y - imgHeightHalf2, sprite2Pos.x + imgHeightHalf2, sprite2Pos.y + imgHeightHalf2);
            if (sprite2.visible && rect1.isCollide(rect2)) {
                visible = false;
                break;
            }
            rect1.tl[0] -= visibleMargin;
            rect1.tl[1] -= visibleMargin;
            rect2.tl[0] -= visibleMargin;
            rect2.tl[1] -= visibleMargin;
            if (sprite.visible == false && rect1.isCollide(rect2)) {
                visible = false;
                break;
            }
        }
        sprite.visible = visible;
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
    ctx_.lineWidth = 4;
    ctx_.font = "32px Microsoft Yahei";
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
//# sourceMappingURL=ArchiteTools.js.map
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
var ArchiteUI = (function () {
    function ArchiteUI(dom_, webgl_) {
        this.webgl = null;
        this.uiStyles = null;
        this.uiStylesStr = "";
        this.domClass = "";
        this.domID = "";
        this.checkBoxContainer = null;
        this.domContainer = null;
        this.curArchite = null;
        this.scaleDomContainer = null;
        this.createSearch = false;
        this.pubPoint = null;
        this.funcAreaName = null;
        this.funcAreaSelect = null;
        this.yAxisRotation = null;
        this.xAxisRotation = null;
        this.moveMap = null;
        this.viewModels = null;
        this.floorDom = null;
        this.backgroundColorChange = null;
        this.webgl = webgl_;
        this.domContainer = dom_;
        this.domID = d3.select(dom_).attr("id");
        this.domClass = d3.select(dom_).attr("class");
        if (IsPC()) {
            this.appendUIStyle(".architeScaleContainer{position:absolute;top:1vw;left:1vw;width:3vw;height:6vw;}");
            this.appendUIStyle(".scaleBtn{width:100%;height:50%;}");
            this.appendUIStyle(".architeSearchDiv{position:absolute;right:1vw;top:1vw;}");
            this.appendUIStyle(".architeFloorBtnContainer{position:absolute;right:1vw;top:6vw;width:3vw;}");
            this.appendUIStyle(".architeFloorBtn{width:100%;height:3vw;}");
            this.appendUIStyle(".architeFloorList{width:100%;}");
            this.appendUIStyle(".architeSearchInput{width: 20vw;height:2.6vw;line-height: 2.6vw;}");
            this.appendUIStyle(".architeSearchBtn{ width:6vw;height:3vw;}");
            this.appendUIStyle(".checkBoxContainer{position:absolute;top:10vw;left:1vw;}");
            this.appendUIStyle(".architeSwitchDiv{width:9vw;height:3vw;line-height: 3vw;display:table;}");
            this.appendUIStyle(".architeSwitchCheckBox{width:2vw;display: table-cell;vertical-align: middle;}");
        }
        else {
            this.appendUIStyle(".architeScaleContainer{position:absolute;top:1vw;left:1vw;width:8vw;height:12vw;}");
            this.appendUIStyle(".scaleBtn{width:100%;height:50%;}");
            this.appendUIStyle(".architeSearchDiv{position:absolute;right:1vw;top:1vw;}");
            this.appendUIStyle(".architeFloorBtnContainer{position:absolute;right:1vw;top:16vw;width:8vw;}");
            this.appendUIStyle(".architeFloorBtn{width:100%;height:6vw;}");
            this.appendUIStyle(".architeFloorList{width:100%;}");
            this.appendUIStyle(".architeSearchInput{width: 24vw;height:4.6vw;line-height: 4.6vw;}");
            this.appendUIStyle(".architeSearchBtn{ width:12vw;height:6vw;}");
            this.appendUIStyle(".checkBoxContainer{position:absolute;top:18vw;left:1vw;}");
            this.appendUIStyle(".architeSwitchDiv{width:25vw;height:7vw;line-height: 3vw;display:table;}");
            this.appendUIStyle(".architeSwitchCheckBox{width:4vw;display: table-cell;vertical-align: middle;}");
        }
        this.checkBoxContainer = d3.select(dom_).append("div")
            .attr("class", "checkBoxContainer");
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
    ArchiteUI.prototype.openScale = function () {
        if (this.scaleDomContainer) {
            console.log("放大缩小按钮已创建！！！");
            return;
        }
        var container_ = d3.select(this.domContainer).append("div").attr("class", "architeScaleContainer");
        this.scaleDomContainer = container_;
        var that_ = this;
        var enlarge_ = this.createBtn(container_, "+", "scaleBtn", function () {
            if (that_.webgl) {
                that_.webgl.zoomIn();
            }
        });
        var narrow_ = this.createBtn(container_, "-", "scaleBtn", function () {
            if (that_.webgl) {
                that_.webgl.zoomAway();
            }
        });
    };
    ArchiteUI.prototype.createBtn = function (container_, name_, class_, callBack_) {
        callBack_ = callBack_ || function () { };
        class_ == "" ? class_ = null : class_ = class_;
        class_ = (class_ || "architeBtn");
        var btn_ = container_.append("button");
        btn_.attr("class", class_);
        btn_.text(name_);
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
    ArchiteUI.prototype.openSearch = function () {
        if (this.createSearch) {
            console.log("搜索已经创建功能已经创建");
            return;
        }
        this.createSearch = true;
        var that_ = this;
        var search_ = d3.select(this.domContainer).append("div")
            .attr("class", "architeSearchDiv");
        var input_ = search_.append("input")
            .attr("class", "architeSearchInput");
        var searchBtn_ = that_.createBtn(search_, "搜索", "architeSearchBtn", function () {
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
    /**
     * 创建复选框
     * @param name_
     * @param pos_
     * @param callBack_
     */
    ArchiteUI.prototype.createCheckBox = function (name_, pos_, callBack_) {
        callBack_ = callBack_ || function () { };
        var checkItem_ = this.checkBoxContainer.append("div")
            .attr("class", "architeSwitchDiv");
        var checkBoxDiv_ = checkItem_.append("span")
            .attr("class", "architeSwitchName")
            .text(name_);
        var checkBox_ = checkItem_.append("input")
            .attr({
            "class": "architeSwitchCheckBox",
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
    };
    ArchiteUI.prototype.showPubPointSwitch = function () {
        var that_ = this;
        if (this.pubPoint)
            return;
        this.pubPoint = this.createCheckBox("公共设施", [0, 100, 0, 0], function (enabled_) {
            console.log("公共设施:" + enabled_);
            if (that_.webgl) {
                that_.webgl.pubPointEnabled(enabled_);
            }
        });
    };
    ArchiteUI.prototype.showFuncAreaNameSwitch = function () {
        var that_ = this;
        if (this.funcAreaName)
            return;
        this.funcAreaName = this.createCheckBox("店铺名称", [0, 100, 0, 0], function (enabled_) {
            console.log("店铺名称:" + enabled_);
            if (that_.webgl) {
                that_.webgl.funcAreasLabelEnabled(enabled_);
            }
        });
    };
    ArchiteUI.prototype.showFuncSelectSwitch = function () {
        var that_ = this;
        if (this.funcAreaSelect)
            return;
        this.funcAreaSelect = this.createCheckBox("店铺选择", [0, 100, 0, 0], function (enabled_) {
            console.log("店铺选择:" + enabled_);
            if (that_.webgl) {
                that_.webgl.selectEnabled = enabled_;
            }
        });
    };
    ArchiteUI.prototype.showYAxisRotateSwitch = function () {
        var that_ = this;
        if (this.yAxisRotation)
            return;
        this.yAxisRotation = this.createCheckBox("左右旋转", [0, 100, 0, 0], function (enabled_) {
            console.log("左右旋转:" + enabled_);
            if (that_.webgl) {
                that_.webgl.enabledRotateLeft(enabled_);
            }
        });
    };
    ArchiteUI.prototype.showXAxisRotateSwitch = function () {
        var that_ = this;
        if (this.xAxisRotation)
            return;
        this.xAxisRotation = this.createCheckBox("上下旋转", [0, 100, 0, 0], function (enabled_) {
            console.log("上下旋转:" + enabled_);
            if (that_.webgl) {
                that_.webgl.enabledRotateUp(enabled_);
            }
        });
    };
    ArchiteUI.prototype.showMoveMapSwitch = function () {
        var that_ = this;
        if (this.moveMap)
            return;
        this.moveMap = this.createCheckBox("移动地图", [0, 100, 0, 0], function (enabled_) {
            console.log("移动地图:" + enabled_);
            if (that_.webgl) {
                that_.webgl.enabledMapMove(enabled_);
            }
        });
    };
    ArchiteUI.prototype.viewPatternSwitch = function () {
        var that_ = this;
        if (this.viewModels)
            return;
        this.viewModels = this.createCheckBox("三维展示", [0, 100, 0, 0], function (enabled_) {
            console.log("三维展示:" + enabled_);
            if (that_.webgl) {
                that_.webgl.enabled3D(enabled_);
            }
        });
    };
    /**         * 创建楼层管理         */
    ArchiteUI.prototype.createFloorsBtn = function (archite_) {
        var that_ = this;
        if (that_.floorDom) {
            return;
        }
        var floorsData_ = archite_.oriData.Floors || [];
        that_.floorDom = d3.select(that_.domContainer).append("div");
        that_.floorDom.attr("class", "architeFloorBtnContainer");
        var _floorDom = that_.floorDom;
        //所有楼层
        var allBtn_ = _floorDom.append("button")
            .attr("class", "architeFloorBtn")
            .text("All");
        allBtn_.on("click", function (e_) {
            that_.showAllFloors();
        });
        var floorsDiv_ = _floorDom.append("div")
            .attr("class", "architeFloorList");
        floorsDiv_.selectAll("button").remove();
        var floorBtns_ = floorsDiv_.selectAll("button")
            .data(floorsData_)
            .enter()
            .append("button")
            .attr("class", "architeFloorBtn")
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
        if (this.backgroundColorChange) {
            return;
        }
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
        this.backgroundColorChange = colorItem_;
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
//# sourceMappingURL=ArchiteUI.js.map
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () {

		try {

			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

		} catch ( e ) {

			return false;

		}

	} )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage: function () {

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		if ( ! this.webgl ) {

			element.innerHTML = window.WebGLRenderingContext ? [
				'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join( '\n' ) : [
				'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join( '\n' );

		}

		return element;

	},

	addGetWebGLMessage: function ( parameters ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild( element );

	}

};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = Detector;

}

/*! layer-v2.4 弹层组件 License LGPL  http://layer.layui.com/ By 贤心 */
;!function(a,b){"use strict";var c,d,e={getPath:function(){var a=document.scripts,b=a[a.length-1],c=b.src;if(!b.getAttribute("merge"))return c.substring(0,c.lastIndexOf("/")+1)}(),enter:function(a){13===a.keyCode&&a.preventDefault()},config:{},end:{},btn:["&#x786E;&#x5B9A;","&#x53D6;&#x6D88;"],type:["dialog","page","iframe","loading","tips"]},f={v:"2.4",ie6:!!a.ActiveXObject&&!a.XMLHttpRequest,index:0,path:e.getPath,config:function(a,b){var d=0;return a=a||{},f.cache=e.config=c.extend(e.config,a),f.path=e.config.path||f.path,"string"==typeof a.extend&&(a.extend=[a.extend]),f.use("skin/layer.css",a.extend&&a.extend.length>0?function g(){var c=a.extend;f.use(c[c[d]?d:d-1],d<c.length?function(){return++d,g}():b)}():b),this},use:function(a,b,d){var e=c("head")[0],a=a.replace(/\s/g,""),g=/\.css$/.test(a),h=document.createElement(g?"link":"script"),i="layui_layer_"+a.replace(/\.|\//g,"");return f.path?(g&&(h.rel="stylesheet"),h[g?"href":"src"]=/^http:\/\//.test(a)?a:f.path+a,h.id=i,c("#"+i)[0]||e.appendChild(h),function j(){(g?1989===parseInt(c("#"+i).css("width")):f[d||i])?function(){b&&b();try{g||e.removeChild(h)}catch(a){}}():setTimeout(j,100)}(),this):void 0},ready:function(a,b){var d="function"==typeof a;return d&&(b=a),f.config(c.extend(e.config,function(){return d?{}:{path:a}}()),b),this},alert:function(a,b,d){var e="function"==typeof b;return e&&(d=b),f.open(c.extend({content:a,yes:d},e?{}:b))},confirm:function(a,b,d,g){var h="function"==typeof b;return h&&(g=d,d=b),f.open(c.extend({content:a,btn:e.btn,yes:d,btn2:g},h?{}:b))},msg:function(a,d,g){var i="function"==typeof d,j=e.config.skin,k=(j?j+" "+j+"-msg":"")||"layui-layer-msg",l=h.anim.length-1;return i&&(g=d),f.open(c.extend({content:a,time:3e3,shade:!1,skin:k,title:!1,closeBtn:!1,btn:!1,end:g},i&&!e.config.skin?{skin:k+" layui-layer-hui",shift:l}:function(){return d=d||{},(-1===d.icon||d.icon===b&&!e.config.skin)&&(d.skin=k+" "+(d.skin||"layui-layer-hui")),d}()))},load:function(a,b){return f.open(c.extend({type:3,icon:a||0,shade:.01},b))},tips:function(a,b,d){return f.open(c.extend({type:4,content:[a,b],closeBtn:!1,time:3e3,shade:!1,fix:!1,maxWidth:210},d))}},g=function(a){var b=this;b.index=++f.index,b.config=c.extend({},b.config,e.config,a),b.creat()};g.pt=g.prototype;var h=["layui-layer",".layui-layer-title",".layui-layer-main",".layui-layer-dialog","layui-layer-iframe","layui-layer-content","layui-layer-btn","layui-layer-close"];h.anim=["layer-anim","layer-anim-01","layer-anim-02","layer-anim-03","layer-anim-04","layer-anim-05","layer-anim-06"],g.pt.config={type:0,shade:.3,fix:!0,move:h[1],title:"&#x4FE1;&#x606F;",offset:"auto",area:"auto",closeBtn:1,time:0,zIndex:19891014,maxWidth:360,shift:0,icon:-1,scrollbar:!0,tips:2},g.pt.vessel=function(a,b){var c=this,d=c.index,f=c.config,g=f.zIndex+d,i="object"==typeof f.title,j=f.maxmin&&(1===f.type||2===f.type),k=f.title?'<div class="layui-layer-title" style="'+(i?f.title[1]:"")+'">'+(i?f.title[0]:f.title)+"</div>":"";return f.zIndex=g,b([f.shade?'<div class="layui-layer-shade" id="layui-layer-shade'+d+'" times="'+d+'" style="'+("z-index:"+(g-1)+"; background-color:"+(f.shade[1]||"#000")+"; opacity:"+(f.shade[0]||f.shade)+"; filter:alpha(opacity="+(100*f.shade[0]||100*f.shade)+");")+'"></div>':"",'<div class="'+h[0]+(" layui-layer-"+e.type[f.type])+(0!=f.type&&2!=f.type||f.shade?"":" layui-layer-border")+" "+(f.skin||"")+'" id="'+h[0]+d+'" type="'+e.type[f.type]+'" times="'+d+'" showtime="'+f.time+'" conType="'+(a?"object":"string")+'" style="z-index: '+g+"; width:"+f.area[0]+";height:"+f.area[1]+(f.fix?"":";position:absolute;")+'">'+(a&&2!=f.type?"":k)+'<div id="'+(f.id||"")+'" class="layui-layer-content'+(0==f.type&&-1!==f.icon?" layui-layer-padding":"")+(3==f.type?" layui-layer-loading"+f.icon:"")+'">'+(0==f.type&&-1!==f.icon?'<i class="layui-layer-ico layui-layer-ico'+f.icon+'"></i>':"")+(1==f.type&&a?"":f.content||"")+'</div><span class="layui-layer-setwin">'+function(){var a=j?'<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>':"";return f.closeBtn&&(a+='<a class="layui-layer-ico '+h[7]+" "+h[7]+(f.title?f.closeBtn:4==f.type?"1":"2")+'" href="javascript:;"></a>'),a}()+"</span>"+(f.btn?function(){var a="";"string"==typeof f.btn&&(f.btn=[f.btn]);for(var b=0,c=f.btn.length;c>b;b++)a+='<a class="'+h[6]+b+'">'+f.btn[b]+"</a>";return'<div class="'+h[6]+'">'+a+"</div>"}():"")+"</div>"],k),c},g.pt.creat=function(){var a=this,b=a.config,g=a.index,i=b.content,j="object"==typeof i;if(!c("#"+b.id)[0]){switch("string"==typeof b.area&&(b.area="auto"===b.area?["",""]:[b.area,""]),b.type){case 0:b.btn="btn"in b?b.btn:e.btn[0],f.closeAll("dialog");break;case 2:var i=b.content=j?b.content:[b.content||"http://layer.layui.com","auto"];b.content='<iframe scrolling="'+(b.content[1]||"auto")+'" allowtransparency="true" id="'+h[4]+g+'" name="'+h[4]+g+'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="'+b.content[0]+'"></iframe>';break;case 3:b.title=!1,b.closeBtn=!1,-1===b.icon&&0===b.icon,f.closeAll("loading");break;case 4:j||(b.content=[b.content,"body"]),b.follow=b.content[1],b.content=b.content[0]+'<i class="layui-layer-TipsG"></i>',b.title=!1,b.tips="object"==typeof b.tips?b.tips:[b.tips,!0],b.tipsMore||f.closeAll("tips")}a.vessel(j,function(d,e){c("body").append(d[0]),j?function(){2==b.type||4==b.type?function(){c("body").append(d[1])}():function(){i.parents("."+h[0])[0]||(i.show().addClass("layui-layer-wrap").wrap(d[1]),c("#"+h[0]+g).find("."+h[5]).before(e))}()}():c("body").append(d[1]),a.layero=c("#"+h[0]+g),b.scrollbar||h.html.css("overflow","hidden").attr("layer-full",g)}).auto(g),2==b.type&&f.ie6&&a.layero.find("iframe").attr("src",i[0]),c(document).off("keydown",e.enter).on("keydown",e.enter),a.layero.on("keydown",function(a){c(document).off("keydown",e.enter)}),4==b.type?a.tips():a.offset(),b.fix&&d.on("resize",function(){a.offset(),(/^\d+%$/.test(b.area[0])||/^\d+%$/.test(b.area[1]))&&a.auto(g),4==b.type&&a.tips()}),b.time<=0||setTimeout(function(){f.close(a.index)},b.time),a.move().callback(),h.anim[b.shift]&&a.layero.addClass(h.anim[b.shift])}},g.pt.auto=function(a){function b(a){a=g.find(a),a.height(i[1]-j-k-2*(0|parseFloat(a.css("padding"))))}var e=this,f=e.config,g=c("#"+h[0]+a);""===f.area[0]&&f.maxWidth>0&&(/MSIE 7/.test(navigator.userAgent)&&f.btn&&g.width(g.innerWidth()),g.outerWidth()>f.maxWidth&&g.width(f.maxWidth));var i=[g.innerWidth(),g.innerHeight()],j=g.find(h[1]).outerHeight()||0,k=g.find("."+h[6]).outerHeight()||0;switch(f.type){case 2:b("iframe");break;default:""===f.area[1]?f.fix&&i[1]>=d.height()&&(i[1]=d.height(),b("."+h[5])):b("."+h[5])}return e},g.pt.offset=function(){var a=this,b=a.config,c=a.layero,e=[c.outerWidth(),c.outerHeight()],f="object"==typeof b.offset;a.offsetTop=(d.height()-e[1])/2,a.offsetLeft=(d.width()-e[0])/2,f?(a.offsetTop=b.offset[0],a.offsetLeft=b.offset[1]||a.offsetLeft):"auto"!==b.offset&&(a.offsetTop=b.offset,"rb"===b.offset&&(a.offsetTop=d.height()-e[1],a.offsetLeft=d.width()-e[0])),b.fix||(a.offsetTop=/%$/.test(a.offsetTop)?d.height()*parseFloat(a.offsetTop)/100:parseFloat(a.offsetTop),a.offsetLeft=/%$/.test(a.offsetLeft)?d.width()*parseFloat(a.offsetLeft)/100:parseFloat(a.offsetLeft),a.offsetTop+=d.scrollTop(),a.offsetLeft+=d.scrollLeft()),c.css({top:a.offsetTop,left:a.offsetLeft})},g.pt.tips=function(){var a=this,b=a.config,e=a.layero,f=[e.outerWidth(),e.outerHeight()],g=c(b.follow);g[0]||(g=c("body"));var i={width:g.outerWidth(),height:g.outerHeight(),top:g.offset().top,left:g.offset().left},j=e.find(".layui-layer-TipsG"),k=b.tips[0];b.tips[1]||j.remove(),i.autoLeft=function(){i.left+f[0]-d.width()>0?(i.tipLeft=i.left+i.width-f[0],j.css({right:12,left:"auto"})):i.tipLeft=i.left},i.where=[function(){i.autoLeft(),i.tipTop=i.top-f[1]-10,j.removeClass("layui-layer-TipsB").addClass("layui-layer-TipsT").css("border-right-color",b.tips[1])},function(){i.tipLeft=i.left+i.width+10,i.tipTop=i.top,j.removeClass("layui-layer-TipsL").addClass("layui-layer-TipsR").css("border-bottom-color",b.tips[1])},function(){i.autoLeft(),i.tipTop=i.top+i.height+10,j.removeClass("layui-layer-TipsT").addClass("layui-layer-TipsB").css("border-right-color",b.tips[1])},function(){i.tipLeft=i.left-f[0]-10,i.tipTop=i.top,j.removeClass("layui-layer-TipsR").addClass("layui-layer-TipsL").css("border-bottom-color",b.tips[1])}],i.where[k-1](),1===k?i.top-(d.scrollTop()+f[1]+16)<0&&i.where[2]():2===k?d.width()-(i.left+i.width+f[0]+16)>0||i.where[3]():3===k?i.top-d.scrollTop()+i.height+f[1]+16-d.height()>0&&i.where[0]():4===k&&f[0]+16-i.left>0&&i.where[1](),e.find("."+h[5]).css({"background-color":b.tips[1],"padding-right":b.closeBtn?"30px":""}),e.css({left:i.tipLeft-(b.fix?d.scrollLeft():0),top:i.tipTop-(b.fix?d.scrollTop():0)})},g.pt.move=function(){var a=this,b=a.config,e={setY:0,moveLayer:function(){var a=e.layero,b=parseInt(a.css("margin-left")),c=parseInt(e.move.css("left"));0===b||(c-=b),"fixed"!==a.css("position")&&(c-=a.parent().offset().left,e.setY=0),a.css({left:c,top:parseInt(e.move.css("top"))-e.setY})}},f=a.layero.find(b.move);return b.move&&f.attr("move","ok"),f.css({cursor:b.move?"move":"auto"}),c(b.move).on("mousedown",function(a){if(a.preventDefault(),"ok"===c(this).attr("move")){e.ismove=!0,e.layero=c(this).parents("."+h[0]);var f=e.layero.offset().left,g=e.layero.offset().top,i=e.layero.outerWidth()-6,j=e.layero.outerHeight()-6;c("#layui-layer-moves")[0]||c("body").append('<div id="layui-layer-moves" class="layui-layer-moves" style="left:'+f+"px; top:"+g+"px; width:"+i+"px; height:"+j+'px; z-index:2147483584"></div>'),e.move=c("#layui-layer-moves"),b.moveType&&e.move.css({visibility:"hidden"}),e.moveX=a.pageX-e.move.position().left,e.moveY=a.pageY-e.move.position().top,"fixed"!==e.layero.css("position")||(e.setY=d.scrollTop())}}),c(document).mousemove(function(a){if(e.ismove){var c=a.pageX-e.moveX,f=a.pageY-e.moveY;if(a.preventDefault(),!b.moveOut){e.setY=d.scrollTop();var g=d.width()-e.move.outerWidth(),h=e.setY;0>c&&(c=0),c>g&&(c=g),h>f&&(f=h),f>d.height()-e.move.outerHeight()+e.setY&&(f=d.height()-e.move.outerHeight()+e.setY)}e.move.css({left:c,top:f}),b.moveType&&e.moveLayer(),c=f=g=h=null}}).mouseup(function(){try{e.ismove&&(e.moveLayer(),e.move.remove(),b.moveEnd&&b.moveEnd()),e.ismove=!1}catch(a){e.ismove=!1}}),a},g.pt.callback=function(){function a(){var a=g.cancel&&g.cancel(b.index,d);a===!1||f.close(b.index)}var b=this,d=b.layero,g=b.config;b.openLayer(),g.success&&(2==g.type?d.find("iframe").on("load",function(){g.success(d,b.index)}):g.success(d,b.index)),f.ie6&&b.IE6(d),d.find("."+h[6]).children("a").on("click",function(){var a=c(this).index();if(0===a)g.yes?g.yes(b.index,d):g.btn1?g.btn1(b.index,d):f.close(b.index);else{var e=g["btn"+(a+1)]&&g["btn"+(a+1)](b.index,d);e===!1||f.close(b.index)}}),d.find("."+h[7]).on("click",a),g.shadeClose&&c("#layui-layer-shade"+b.index).on("click",function(){f.close(b.index)}),d.find(".layui-layer-min").on("click",function(){var a=g.min&&g.min(d);a===!1||f.min(b.index,g)}),d.find(".layui-layer-max").on("click",function(){c(this).hasClass("layui-layer-maxmin")?(f.restore(b.index),g.restore&&g.restore(d)):(f.full(b.index,g),setTimeout(function(){g.full&&g.full(d)},100))}),g.end&&(e.end[b.index]=g.end)},e.reselect=function(){c.each(c("select"),function(a,b){var d=c(this);d.parents("."+h[0])[0]||1==d.attr("layer")&&c("."+h[0]).length<1&&d.removeAttr("layer").show(),d=null})},g.pt.IE6=function(a){function b(){a.css({top:f+(e.config.fix?d.scrollTop():0)})}var e=this,f=a.offset().top;b(),d.scroll(b),c("select").each(function(a,b){var d=c(this);d.parents("."+h[0])[0]||"none"===d.css("display")||d.attr({layer:"1"}).hide(),d=null})},g.pt.openLayer=function(){var a=this;f.zIndex=a.config.zIndex,f.setTop=function(a){var b=function(){f.zIndex++,a.css("z-index",f.zIndex+1)};return f.zIndex=parseInt(a[0].style.zIndex),a.on("mousedown",b),f.zIndex}},e.record=function(a){var b=[a.width(),a.height(),a.position().top,a.position().left+parseFloat(a.css("margin-left"))];a.find(".layui-layer-max").addClass("layui-layer-maxmin"),a.attr({area:b})},e.rescollbar=function(a){h.html.attr("layer-full")==a&&(h.html[0].style.removeProperty?h.html[0].style.removeProperty("overflow"):h.html[0].style.removeAttribute("overflow"),h.html.removeAttr("layer-full"))},a.layer=f,f.getChildFrame=function(a,b){return b=b||c("."+h[4]).attr("times"),c("#"+h[0]+b).find("iframe").contents().find(a)},f.getFrameIndex=function(a){return c("#"+a).parents("."+h[4]).attr("times")},f.iframeAuto=function(a){if(a){var b=f.getChildFrame("html",a).outerHeight(),d=c("#"+h[0]+a),e=d.find(h[1]).outerHeight()||0,g=d.find("."+h[6]).outerHeight()||0;d.css({height:b+e+g}),d.find("iframe").css({height:b})}},f.iframeSrc=function(a,b){c("#"+h[0]+a).find("iframe").attr("src",b)},f.style=function(a,b){var d=c("#"+h[0]+a),f=d.attr("type"),g=d.find(h[1]).outerHeight()||0,i=d.find("."+h[6]).outerHeight()||0;(f===e.type[1]||f===e.type[2])&&(d.css(b),f===e.type[2]&&d.find("iframe").css({height:parseFloat(b.height)-g-i}))},f.min=function(a,b){var d=c("#"+h[0]+a),g=d.find(h[1]).outerHeight()||0;e.record(d),f.style(a,{width:180,height:g,overflow:"hidden"}),d.find(".layui-layer-min").hide(),"page"===d.attr("type")&&d.find(h[4]).hide(),e.rescollbar(a)},f.restore=function(a){var b=c("#"+h[0]+a),d=b.attr("area").split(",");b.attr("type");f.style(a,{width:parseFloat(d[0]),height:parseFloat(d[1]),top:parseFloat(d[2]),left:parseFloat(d[3]),overflow:"visible"}),b.find(".layui-layer-max").removeClass("layui-layer-maxmin"),b.find(".layui-layer-min").show(),"page"===b.attr("type")&&b.find(h[4]).show(),e.rescollbar(a)},f.full=function(a){var b,g=c("#"+h[0]+a);e.record(g),h.html.attr("layer-full")||h.html.css("overflow","hidden").attr("layer-full",a),clearTimeout(b),b=setTimeout(function(){var b="fixed"===g.css("position");f.style(a,{top:b?0:d.scrollTop(),left:b?0:d.scrollLeft(),width:d.width(),height:d.height()}),g.find(".layui-layer-min").hide()},100)},f.title=function(a,b){var d=c("#"+h[0]+(b||f.index)).find(h[1]);d.html(a)},f.close=function(a){var b=c("#"+h[0]+a),d=b.attr("type");if(b[0]){if(d===e.type[1]&&"object"===b.attr("conType")){b.children(":not(."+h[5]+")").remove();for(var g=0;2>g;g++)b.find(".layui-layer-wrap").unwrap().hide()}else{if(d===e.type[2])try{var i=c("#"+h[4]+a)[0];i.contentWindow.document.write(""),i.contentWindow.close(),b.find("."+h[5])[0].removeChild(i)}catch(j){}b[0].innerHTML="",b.remove()}c("#layui-layer-moves, #layui-layer-shade"+a).remove(),f.ie6&&e.reselect(),e.rescollbar(a),c(document).off("keydown",e.enter),"function"==typeof e.end[a]&&e.end[a](),delete e.end[a]}},f.closeAll=function(a){c.each(c("."+h[0]),function(){var b=c(this),d=a?b.attr("type")===a:1;d&&f.close(b.attr("times")),d=null})};var i=f.cache||{},j=function(a){return i.skin?" "+i.skin+" "+i.skin+"-"+a:""};f.prompt=function(a,b){a=a||{},"function"==typeof a&&(b=a);var d,e=2==a.formType?'<textarea class="layui-layer-input">'+(a.value||"")+"</textarea>":function(){return'<input type="'+(1==a.formType?"password":"text")+'" class="layui-layer-input" value="'+(a.value||"")+'">'}();return f.open(c.extend({btn:["&#x786E;&#x5B9A;","&#x53D6;&#x6D88;"],content:e,skin:"layui-layer-prompt"+j("prompt"),success:function(a){d=a.find(".layui-layer-input"),d.focus()},yes:function(c){var e=d.val();""===e?d.focus():e.length>(a.maxlength||500)?f.tips("&#x6700;&#x591A;&#x8F93;&#x5165;"+(a.maxlength||500)+"&#x4E2A;&#x5B57;&#x6570;",d,{tips:1}):b&&b(e,c,d)}},a))},f.tab=function(a){a=a||{};var b=a.tab||{};return f.open(c.extend({type:1,skin:"layui-layer-tab"+j("tab"),title:function(){var a=b.length,c=1,d="";if(a>0)for(d='<span class="layui-layer-tabnow">'+b[0].title+"</span>";a>c;c++)d+="<span>"+b[c].title+"</span>";return d}(),content:'<ul class="layui-layer-tabmain">'+function(){var a=b.length,c=1,d="";if(a>0)for(d='<li class="layui-layer-tabli xubox_tab_layer">'+(b[0].content||"no content")+"</li>";a>c;c++)d+='<li class="layui-layer-tabli">'+(b[c].content||"no  content")+"</li>";return d}()+"</ul>",success:function(b){var d=b.find(".layui-layer-title").children(),e=b.find(".layui-layer-tabmain").children();d.on("mousedown",function(b){b.stopPropagation?b.stopPropagation():b.cancelBubble=!0;var d=c(this),f=d.index();d.addClass("layui-layer-tabnow").siblings().removeClass("layui-layer-tabnow"),e.eq(f).show().siblings().hide(),"function"==typeof a.change&&a.change(f)})}},a))},f.photos=function(b,d,e){function g(a,b,c){var d=new Image;return d.src=a,d.complete?b(d):(d.onload=function(){d.onload=null,b(d)},void(d.onerror=function(a){d.onerror=null,c(a)}))}var h={};if(b=b||{},b.photos){var i=b.photos.constructor===Object,k=i?b.photos:{},l=k.data||[],m=k.start||0;if(h.imgIndex=(0|m)+1,b.img=b.img||"img",i){if(0===l.length)return f.msg("&#x6CA1;&#x6709;&#x56FE;&#x7247;")}else{var n=c(b.photos),o=function(){l=[],n.find(b.img).each(function(a){var b=c(this);b.attr("layer-index",a),l.push({alt:b.attr("alt"),pid:b.attr("layer-pid"),src:b.attr("layer-src")||b.attr("src"),thumb:b.attr("src")})})};if(o(),0===l.length)return;if(d||n.on("click",b.img,function(){var a=c(this),d=a.attr("layer-index");f.photos(c.extend(b,{photos:{start:d,data:l,tab:b.tab},full:b.full}),!0),o()}),!d)return}h.imgprev=function(a){h.imgIndex--,h.imgIndex<1&&(h.imgIndex=l.length),h.tabimg(a)},h.imgnext=function(a,b){h.imgIndex++,h.imgIndex>l.length&&(h.imgIndex=1,b)||h.tabimg(a)},h.keyup=function(a){if(!h.end){var b=a.keyCode;a.preventDefault(),37===b?h.imgprev(!0):39===b?h.imgnext(!0):27===b&&f.close(h.index)}},h.tabimg=function(a){l.length<=1||(k.start=h.imgIndex-1,f.close(h.index),f.photos(b,!0,a))},h.event=function(){h.bigimg.hover(function(){h.imgsee.show()},function(){h.imgsee.hide()}),h.bigimg.find(".layui-layer-imgprev").on("click",function(a){a.preventDefault(),h.imgprev()}),h.bigimg.find(".layui-layer-imgnext").on("click",function(a){a.preventDefault(),h.imgnext()}),c(document).on("keyup",h.keyup)},h.loadi=f.load(1,{shade:"shade"in b?!1:.9,scrollbar:!1}),g(l[m].src,function(d){f.close(h.loadi),h.index=f.open(c.extend({type:1,area:function(){var e=[d.width,d.height],f=[c(a).width()-50,c(a).height()-50];return!b.full&&e[0]>f[0]&&(e[0]=f[0],e[1]=e[0]*d.height/d.width),[e[0]+"px",e[1]+"px"]}(),title:!1,shade:.9,shadeClose:!0,closeBtn:!1,move:".layui-layer-phimg img",moveType:1,scrollbar:!1,moveOut:!0,shift:5*Math.random()|0,skin:"layui-layer-photos"+j("photos"),content:'<div class="layui-layer-phimg"><img src="'+l[m].src+'" alt="'+(l[m].alt||"")+'" layer-pid="'+l[m].pid+'"><div class="layui-layer-imgsee">'+(l.length>1?'<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>':"")+'<div class="layui-layer-imgbar" style="display:'+(e?"block":"")+'"><span class="layui-layer-imgtit"><a href="javascript:;">'+(l[m].alt||"")+"</a><em>"+h.imgIndex+"/"+l.length+"</em></span></div></div></div>",success:function(a,c){h.bigimg=a.find(".layui-layer-phimg"),h.imgsee=a.find(".layui-layer-imguide,.layui-layer-imgbar"),h.event(a),b.tab&&b.tab(l[m],a)},end:function(){h.end=!0,c(document).off("keyup",h.keyup)}},b))},function(){f.close(h.loadi),f.msg("&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;",{time:3e4,btn:["&#x4E0B;&#x4E00;&#x5F20;","&#x4E0D;&#x770B;&#x4E86;"],yes:function(){l.length>1&&h.imgnext(!0,!0)}})})}},e.run=function(){c=jQuery,d=c(a),h.html=c("html"),f.open=function(a){var b=new g(a);return b.index}},"function"==typeof define?define(function(){return e.run(),f}):function(){e.run(),f.use("skin/layer.css")}()}(window);
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.enableRotateUp=true;
	this.enableRotateLeft=true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
	//this.mouseButtons = { PAN: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return phi;

	};

	this.getAzimuthalAngle = function () {

		return theta;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function() {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function () {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function() {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
		scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	this.curSpherical=spherical;
	this.deltaSpherical=sphericalDelta;

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {
		if(!scope.enableRotateLeft)return;
		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {
		if(!scope.enableRotateUp)return;
		sphericalDelta.phi -= angle;

	}

	var panLeft = function() {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function() {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function() {

		var offset = new THREE.Vector3();

		return function( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	var scaleTweenObject={
		persScale:1,
		orthZoom:1
	};
	var scaleTween=new TWEEN.Tween(scaleTweenObject);

	this.zoomIn=function(){
		//dollyOut(getZoomScale());
		var dollyScale_=getZoomScale();
		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			var goalScale_=(scale * dollyScale_);
			scaleTweenObject.persScale=scale;
			scaleTween.to({persScale:goalScale_},300);
			scaleTween.onUpdate(function(){
				scale=this.persScale;
				//console.log("scale:"+this.persScale);
				scope.update();
			});
			scaleTween.start();

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale_ ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

			var goalZoom_=Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale_ ) );
			scaleTweenObject.orthZoom=scope.object.zoom;
			scaleTween.to({orthZoom:goalZoom_},300);
			scaleTween.onUpdate(function(){
				scope.object.zoom ==this.orthZoom;
				scope.object.updateProjectionMatrix();
				zoomChanged = true;
				scope.update();
			});
			scaleTween.start();


		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}
	};
	this.zoomOut=function(){

		//dollyIn(getZoomScale());
		var dollyScale_=getZoomScale();
		if ( scope.object instanceof THREE.PerspectiveCamera ) {
			var goalScale_=(scale / dollyScale_);
			scaleTweenObject.persScale=scale;
			scaleTween.to({persScale:goalScale_},300);
			scaleTween.onUpdate(function(){
				scale=this.persScale;
				//console.log("scale:"+this.persScale);
				scope.update();
			});
			scaleTween.start();
		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			var goalZoom_=Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scaleTweenObject.orthZoom=scope.object.zoom;
			scaleTween.to({orthZoom:goalZoom_},300);
			scaleTween.onUpdate(function(){
				scope.object.zoom ==this.orthZoom;
				scope.object.updateProjectionMatrix();
				zoomChanged = true;
				scope.update();
			});
			scaleTween.start();

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

		//scope.update();
	};

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		//console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		//console.log( 'handleMouseWheel' );

		var delta = 0;

		if ( event.wheelDelta !== undefined ) {

			// WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) {

			// Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( delta < 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( event.button === scope.mouseButtons.PAN ) {
		//if ( event.button === scope.mouseButtons.ORBIT ) {

			if ( scope.enableRotate === false ) return;

			handleMouseDownRotate( event );

			state = STATE.ROTATE;

		} else if ( event.button === scope.mouseButtons.ZOOM ) {

			if ( scope.enableZoom === false ) return;

			handleMouseDownDolly( event );

			state = STATE.DOLLY;

		//} else if ( event.button === scope.mouseButtons.PAN ) {
		} else if ( event.button === scope.mouseButtons.ORBIT ) {

			if ( scope.enablePan === false ) return;

			handleMouseDownPan( event );

			state = STATE.PAN;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			document.addEventListener( 'mouseout', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			if ( scope.enableRotate === false ) return;

			handleMouseMoveRotate( event );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.enableZoom === false ) return;

			handleMouseMoveDolly( event );

		} else if ( state === STATE.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseMovePan( event );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	 // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3:// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );


				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3:// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );
				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.constraint.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.constraint.enableDamping = ! value;

		}

	},

	dynamicDampingFactor : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.constraint.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.constraint.dampingFactor = value;

		}

	}

} );
