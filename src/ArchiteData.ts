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
class ArchiteData{
    constructor(ui_:ArchiteUI,webgl_:ArchiteWebGL,resources_:ArchiteResources){
        this.ui=ui_;
        this.webgl=webgl_;
        this.resources=resources_;
    }
    ui:ArchiteUI=null;
    resources:ArchiteResources;
    webgl:ArchiteWebGL=null;
    is3D:Boolean=true;

    /**         * 获取指定数据         */
    getMapsbyAjax(url_,requestData_){
        var that_=this;
        $.ajax({
            type: "GET",
            url: url_,
            dataType: "json",
            data:requestData_,
            success: function (data_) {
                that_.parseMapsData(data_);
                layer.closeAll("loading");
            }
        });
    }

    /**
     * 解析数据
     * @param data_
     */
    parseMapsData(data_){

        /**
         * 创建新的建筑
         * @type {liaohengfan.LI_ARCHITE.ArchiteBase}
         * @private
         */
        var newArchite_=new ArchiteBase(data_.data,this.is3D,this.resources);
        newArchite_.uiMana_=this.ui;
        /**             * 更新建筑信息             */
        this.webgl.updateMapByArchiteBase(newArchite_);
        this.ui.updataUIByArchiteBase(newArchite_);
    }
}