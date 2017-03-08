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
//# sourceMappingURL=ArchiteFloor.js.map