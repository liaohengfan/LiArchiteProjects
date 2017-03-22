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
function makeTextSprite(message, parameters) {
    if (parameters === undefined)
        parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 2;
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 1, g: 1, b: 1, a: 1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };
    var fontColor = parameters.hasOwnProperty("color") ? parameters["color"] : "#000000";
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = fontsize + "px " + fontface;
    var metrics = context.measureText(message);
    context.strokeStyle = '#FFFFFF'; //边框颜色
    context.fillStyle = '#000000'; //填充颜色
    context.lineCap = "round";
    context.lineJoin = "round";
    if (IsPC()) {
        context.lineWidth = 10;
    }
    else {
        context.lineWidth = 6;
    }
    context.strokeText(message, borderThickness, fontsize + borderThickness);
    context.fillText(message, borderThickness, fontsize + borderThickness);
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.defaultMaterial = spriteMaterial;
    sprite.scale.set(100, 50, 1.0);
    sprite.width = metrics.width / 2;
    sprite.height = fontsize * 0.8;
    return sprite;
}
/**     * 解析所有轮廓     */
function getDataMesh(data_, high_, color_) {
    if (high_ === void 0) { high_ = 1; }
    if (color_ === void 0) { color_ = 0xFFFFFF; }
    var outline = {
        outline3D: new THREE.Object3D(),
        outline: new THREE.Object3D(),
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
                outLineShape_.autoClose = true;
                var lineMaterial = new THREE.LineBasicMaterial({ color: 0x999999, linewidth: 1 });
                var line = new THREE.Line(outLineShape_.createPointsGeometry(10), lineMaterial);
                line.defaultMaterial = lineMaterial;
                color_ += 1;
                outline.outline.add(line);
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
        outline: new THREE.Object3D(),
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
                outLineShape_.autoClose = true;
                var lineMaterial = new THREE.LineBasicMaterial({ color: 0x999999, linewidth: 1 });
                var line = new THREE.Line(outLineShape_.createPointsGeometry(10), lineMaterial);
                line.defaultMaterial = lineMaterial;
                color_ += 1;
                outline.outline.add(line);
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
        if (mesh_ && mesh_.type == "Line") {
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
