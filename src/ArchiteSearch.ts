/**
 * Created by Administrator on 2017/3/22.
 * 搜索模块
 */
class ArchiteSearch{
    parentDomContainer:HTMLElement;
    domContainer:any=null;
    curData:any=null;
    constructor(parentDom_:HTMLElement){
        this.parentDomContainer=parentDom_;
        this.initUI();
    }

    /**     * 初始化UI     */
    initUI(){

        this.domContainer=d3.select(this.parentDomContainer).append("div")
            .attr("class","architeSearchContainer");
            //.style("display","none");

        //创建搜索框
        this.createSearchDom();

        //创建公共服务点选项
        this.createPubPoint();

        //创建搜索结果选项
        this.createSearchItemList();

    }

    /**     * 创建搜索结果选项     */
    private createSearchItemList(){

    }

    /**     * 创建公共服务点选项     */
    private createPubPoint(){
        //<label for="exampleInputEmail1">Email address</label>
        var label_=this.domContainer.append("label")
            .text("公共服务点");
        var pubContainer_=this.domContainer.append("div")
            .attr("class","form-group row");
        var items_=pubContainer_.selectAll("div")
            .data(ICON_TYPE_CHECK)
            .enter()
            .append("div")
            .attr("class","col-xs-1")
            .style({
                "width":"100px",
                "padding":"0"
            });

        //添加图标
        items_.append("img")
            .attr("src",function(item_){
                return ICON_ASSET_BASE+item_.ico;
            })
            .attr("class","col-xs-12")
            .style("text-align","center");
        //添加名字
        items_.append("span")
            .text(function(item_){
                return item_.name;
            })
            .attr("class","col-xs-12")
            .style("text-align","center");
    }

    /**     * 创建搜索框     */
    private createSearchDom(){
        var searchContainer_=this.domContainer.append("div").attr("class","input-group");
        var searchInput_=searchContainer_.append("input")
            .attr({
                "class":"form-control",
                "placeholder":"搜索"
            });
        var searchIcon_=searchContainer_.append("div")
            .attr({
                "class":"input-group-addon"
            });
        searchIcon_.append("div")
            .attr("class","glyphicon glyphicon-search");

    }

    bindData(data_:any){
        this.curData=data_;
    }
}