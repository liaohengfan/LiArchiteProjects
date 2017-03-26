/**
 * Created by Administrator on 2017/2/6.
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
///<reference path="../src/ArchiteData.ts" />
function init(){

    /**     * 建筑渲染     */
    var architeMain_=new ArchiteMain(document.getElementById("lhf_archite_wengl_container"),document.getElementById("lhf_archite_wengl_control"));

    /**     * ui     */
    var uimana_=new ArchiteUI(document.getElementById("lhf_archite_ui_container"),architeMain_.architewebgl);
    uimana_.openScale();
    uimana_.openSearch();
    uimana_.viewPatternSwitch();
    //uimana_.showFuncSelectSwitch();
    //uimana_.showFuncAreaNameSwitch();
    //uimana_.showPubPointSwitch();
    uimana_.showMoveMapSwitch();
    //uimana_.createBackgroundSet();
    //uimana_.showXAxisRotateSwitch();
    //uimana_.showYAxisRotateSwitch();

    /**     * data mana     */
    var architeDataMana_=new ArchiteData(uimana_,architeMain_.architewebgl,architeMain_.architeResources);
    //architeDataMana_.getMapsbyAjax("ajaxData/aiqing.json",{});
    architeDataMana_.getMapsbyAjax("ajaxData/fangcaodi.json",{});

    function render(){
        requestAnimationFrame(render);

        architeMain_.render();

    }
    render();


    /**     * 自适应     */
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {

        let curWidth_=window.innerWidth;
        let curHeight_=window.innerHeight;

        architeMain_.windowResize(curWidth_,curHeight_);
    }
    onWindowResize();

}
window.onload=function(){
    init();
};