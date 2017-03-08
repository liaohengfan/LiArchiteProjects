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
///<reference path="ArchiteFloor.ts" />
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
//# sourceMappingURL=ArchiteTools.js.map