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
///<reference path="Archite.ts" />
/**
 * Created by Administrator on 2017/3/22.
 * 搜索模块
 */
class ArchiteSearch{
    parentDomContainer:HTMLElement;
    domContainer:any=null;
    curArchite:ArchiteBase=null;
    uiMana:ArchiteUI=null;

    searchNullPrompt:string="无搜索结果";

    constructor(parentDom_:HTMLElement,uiMana_:ArchiteUI){
        this.parentDomContainer=parentDom_;
        this.uiMana=uiMana_;
        this.initUI();
    }

    hideSearch(){
        if(this.domContainer){
            if(this.searchInputDom){
                $(this.searchInputDom).val("");
            }
            this.domContainer.style({
                "display":"none"
            });
        }
    }
    showSearch(){
        if(this.domContainer){
            this.domContainer.style({
                "display":"block"
            });
        }
        this.clearSearchItem();
        this.showPubPoints();
    }

    /**     * 初始化UI     */
    initUI(){

        this.domContainer=d3.select(this.parentDomContainer).append("div")
            .attr("class","architeSearchContainer")
            .style({
                "width":"100%",
                "box-sizing":"border-box",
                "margin":"0",
                "padding":"15px"
            });
            //.style("display","none");

        //创建搜索框
        this.createSearchDom();

        //创建公共服务点选项
        this.createPubPoint();

        //创建搜索结果选项
        this.createSearchItemList();

        //创建关闭按钮
        this.createCloseBtn();

        this.hideSearch();

    }

    /**     * 创建关闭按钮     */
    private createCloseBtn(){
        var closeBtnContainer=this.domContainer.append("div")
            .attr("class","form-group row")
            .style("padding-right","20px");
        var closeBtn_=closeBtnContainer.append("button")
            .attr({
                "type":"button",
                "class":"btn btn-default pull-right",
                "aria-label":"Close"
            });
        closeBtn_.append("span")
            .attr("aria-hidden",true)
            .text("×");
        closeBtn_.on("click",()=>{
            this.hideSearch();
        })
    }

    private searchResultContainer:any=null;
    private searchItemContainer:any=null;
    /**     * 搜索结果     */
    private createSearchItemList(){
        var container_=this.domContainer.append("div")
            .attr("class","form-group")
            .style({
                "max-height":"300px",
                "overflow": "hidden"
            });
        this.searchResultContainer=container_;

        var label_=container_.append("label")
            .style("margin-top","15px")
            .text("搜索结果");
        this.searchItemContainer=container_.append("div")
            .style({
                "max-height":"240px",
            })
            .attr({
                "class":"form-group",
                "id":"architeSearchResultDom"
            });

        //$("#architeSearchResultDom").mCustomScrollbar("update");

    }

    /**     * 展示公共服务点     */
    public showPubPoints(){
        if(this.pubPointContainer){
            this.pubPointContainer
                .style({
                    "display":"block"
                });
        }
        if(this.searchResultContainer){
            this.searchResultContainer
                .style({
                    "display":"none"
                });
        }
    }

    /**     * 展示搜索结果     */
    public showSearchResult(){
        if(this.pubPointContainer){
            this.pubPointContainer
                .style({
                    "display":"none"
                });
        }
        if(this.searchResultContainer){
            this.searchResultContainer
                .style({
                    "display":"block"
                });
        }
    }

    /**     * 刷新搜索结果     */
    private updateSearchItem(list_){
        if(!this.searchItemContainer){
            this.showPubPoints();
            return;
        }
        list_=list_||[];
        this.clearSearchItem();
        if(!list_.length){
            msg(this.searchNullPrompt);
            this.showSearchResult();
            return;
        }
        this.showSearchResult();

        var itemRows_=this.searchItemContainer.selectAll("div")
            .data(list_||[])
            .enter()
            .append("div")
            .attr("class","row")
            .style("padding","10px");
        var itemNamesLabel_=itemRows_.append("div")
            .attr("class","col-xs-8")
            .text(function(item){
                return item.Name||"";
            });
        var itemFoorName_=itemRows_.append("div")
            .attr("class","col-xs-4")
            .text(function(item){
                return item.FloorNo||"";
            });

        //选择
        itemRows_.on("click",(curItem_)=>{
            //console.log(curItem_);
            this.markPoint(curItem_);
            this.hideSearch();
        });

    }

    /**     * 在地图上标注     */
    private markPoint(data_:any){

        /**         *         */
        if(this.uiMana&&this.uiMana.webgl){

            this.uiMana.webgl.markPoint(data_);

        }else{
            msg("地图对象未绑定!");
        }
    }

    /**     * 清空搜索选项     */
    public clearSearchItem(){
        if(!this.searchItemContainer)return;
        this.searchItemContainer.selectAll("*").remove();
    }

    private pubPointContainer:any=null;
    /**     * 创建公共服务点选项     */
    private createPubPoint(){
        this.pubPointContainer=this.domContainer.append("div")
            .attr({
                "class":"form-group"
            });
        var label_=this.pubPointContainer.append("label")
            .style("margin-top","15px")
            .text("公共服务点");
        var pubContainer_=this.pubPointContainer.append("div")
            .attr("class","form-group row");
        var items_=pubContainer_.selectAll("div")
            .data(ICON_TYPE_CHECK)
            .enter()
            .append("div")
            .attr("class","SearchPubPointItem")
            .style({
                //"width":"80px",
                "margin":"0",
                "padding":"0",
                "text-align":"center"
            });
        items_.on("click",(cur_)=>{
            this.Search(cur_.name||"");
        });

        //添加图标
        items_.append("img")
            .attr("src",function(item_){
                return ICON_ASSET_BASE+item_.ico;
            })
            .style({
                "text-align":"center",
                "width":"38px"
            });
        //添加名字
        items_.append("span")
            .text(function(item_){
                return item_.name;
            })
            .attr("class","col-xs-12")
            .style("text-align","center");
    }

    histSearch:string="";
    searchInputDom:HTMLElement=null;
    /**     * 创建搜索框     */
    private createSearchDom(){
        var searchContainer_=this.domContainer.append("div").attr("class","input-group");
        var searchInput_=searchContainer_.append("input")
            .attr({
                "type":"text",
                "class":"form-control",
                "placeholder":"搜索"
            });
        var serachInputDom_=searchInput_[0][0];
        this.searchInputDom=serachInputDom_;
        searchInput_.on("input",()=>{
            //console.log(serachInputDom_.value);
            var value_:string=serachInputDom_.value;
            if(this.histSearch==value_)return;
            if(value_!=""){
                console.log("search:"+value_);
                this.Search(serachInputDom_.value);
            }else{
                this.clearSearchItem();
                this.showPubPoints();
            }
            this.histSearch=value_;
        });
        var searchIcon_=searchContainer_.append("div")
            .attr({
                "class":"input-group-addon"
            });
        searchIcon_.append("div")
            .attr("class","glyphicon glyphicon-search");

    }



    /**
     * 所有楼层
     * @type {Array}
     */
    public architeFloors:Array<any>=[];

    /**     * 绑定建筑     */
    public bindArchite(archite_:ArchiteBase){
        this.curArchite=archite_;
        this.architeFloors=archite_.oriData.Floors||[];
    }

    /**
     * 搜索
     * @param str_
     * @constructor
     */
    public Search(str_){
        if(!this.curArchite){
            msg("未绑定建筑对象");
            return;
        }
        if(!this.architeFloors.length){
            msg("未绑定建筑对象");
            return;
        }

        var ars:Array<any>=[];

        //搜索所有楼层
        for (var i = 0; i < this.architeFloors.length; i++) {
            var floor_ = this.architeFloors[i];
            var floorName_:string=floor_.Name;
            var floorID_:any=floor_._id;

            //店铺
            ars.push(_.filter(floor_.FuncAreas||[],(item_)=>{
                item_.FloorNo=floorName_;
                item_.FloorID=floorID_;
                return this.nameMatch(item_.Name_all||item_.Name||"",str_);
            }));

            //公共设施
            ars.push(_.filter(floor_.PubPoint||[],(item_)=>{
                item_.FloorNo=floorName_;
                item_.FloorID=floorID_;
                return this.nameMatch(item_.Name||item_.name||"",str_);
            }));
        }

        //转换为1维度数组去除嵌套
        var itemLists_:Array<any>=_.sortBy(_.flatten(ars),function(item_){
            return (item_.Name_all||item_.Name||item_.name||"").length;
        });

        //显示
        this.updateSearchItem(itemLists_||[]);

    }
    public nameMatch(str , keyword ){
        return str.match(new RegExp(keyword , 'gi') , '');
    }
}