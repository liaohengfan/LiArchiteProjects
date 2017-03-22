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