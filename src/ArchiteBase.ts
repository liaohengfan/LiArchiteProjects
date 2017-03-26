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
class ArchiteBase{
    constructor(data_:any,is3D_,resources_:ArchiteResources){
        this.oriData=data_;
        this.resources=resources_;
        this.ArchiteName=this.oriData.building.Name;
        this.ArchiteOutLine=this.oriData.building.Outline;
        this.ArchiteID=this.oriData.building._id;
        this.archite_id=data_._id;
        this.archite_name=data_.Name;

        this.is3D=is3D_;

        this.oriData.Floors=this.oriData.Floors||[];

        /**             * 地面地板             */
        this.floorGround=new THREE.Object3D();
        this.floorGround2D=new THREE.Object3D();

        /**             * 创建大厦3D对象             */
        this.ArchiteMesh=new THREE.Object3D();
        this.ArchiteMesh2D=new THREE.Object3D();

        /**             * 创建标注对象             */
        this.ArchiteSprite=new THREE.Object3D();
        this.ArchiteIcon=new THREE.Object3D();
        this.ArchiteLabel=new THREE.Object3D();
        this.ArchiteSprite.add(this.ArchiteIcon);
        this.ArchiteSprite.add(this.ArchiteLabel);


        /**             * 旋转             */
        this.floorGround.rotateX(-(Math.PI/2));
        this.floorGround2D.rotateX(-(Math.PI/2));
        this.ArchiteMesh.rotateX(-(Math.PI/2));
        this.ArchiteMesh2D.rotateX(-(Math.PI/2));
        //this.ArchiteSprite.rotateX(-(Math.PI/2));

        //大厦轮廓
        //this.parseBuildingOutLine();
    }

    resources:ArchiteResources;
    archite_show=true;
    archite_name="";
    archite_id="";

    is3D:Boolean=true;
    showall:Boolean=false;

    /**         * oriData         */
    oriData:any=null;

    /**         * 建筑名称         */
    ArchiteName:String="";

    /**         * 建筑轮廓         */
    ArchiteOutLine:Array<any>=[];

    /**         * 建筑id         */
    ArchiteID:String="";

    /**         * 大厦模型         */
    ArchiteMesh=null;
    ArchiteMesh2D=null;

    /**         * 大厦地面         */
    floorGround=null;
    floorGround2D=null;

    /**         * 标注         */
    ArchiteSprite=null;
    ArchiteIcon=null;
    ArchiteLabel=null;

    /**         * 楼层         */
    architeFloors=[];

    /**         * 轮廓模型         */
    buildingOutLine:THREE.Object3D=null;
    buildingOutLineShow=false;
    /**         * 解析建筑轮廓         */
    parseBuildingOutLine(){
        this.buildingOutLine=getDataMesh(this.oriData.building).outline3D;
        this.buildingOutLine.visible=this.buildingOutLineShow;

        this.ArchiteMesh.add(this.buildingOutLine);
    }
    /**         * 大厦轮廓展示         */
    enabledBuildingOutLine(enabled_){
        this.buildingOutLine.visible=enabled_;
        this.buildingOutLineShow=enabled_;
    }

    /**
     * 获取默认楼层
     * @returns {any}
     */
    getDefaultFoolr(){
        return this.oriData.building.DefaultFloor;
    }

    /**         * 获取楼层Y轴坐标         */
    getFloorY(id_){
        var trueFloors=null;
        var y_=0;
        if(id_>0){
            trueFloors=_.filter(this.oriData.Floors,function(item_){
                return ((item_._id<id_)&&(item_._id>=0));
            });
            _.map(trueFloors,function(item_){
                y_+=(item_.High||0);
            });
            return y_;
        }else{
            trueFloors=_.filter(this.oriData.Floors,function(item_){
                return ((item_._id>=id_)&&(item_._id<=0));
            });
            _.map(trueFloors,function(item_){
                y_-=(item_.High||0);
            });
            return y_;
        }


    }

    enabeld3D(enabled_){
        this.is3D=enabled_;
        _.map(this.architeFloors,function(floor_){
            floor_.is3D=enabled_;
        });
    }

    /**
     * 切换到2D展示
     */
    display2DPattern(){

        var that_=this;
        //当前显示的楼层
        var curShowFloors_=_.filter(that_.architeFloors,function(item_){
            return item_.showStuts==1;
        });

        //当前透明的楼层
        var curOpacityFloors_=_.filter(that_.architeFloors,function(item_){
            return item_.showStuts==2;
        });

        if(!curShowFloors_.length)return;

        //对当前显示的楼层进行排序
        curShowFloors_=_.sortBy(curShowFloors_,function(item_){
            return (item_._id||-100);//不包含id 则排序最低
        });
        //取最高的楼层
        var selectFloor_=_.first(curShowFloors_);
        try{
            selectFloor_.stutsChange(1);//显示当前楼层
        }catch(e){

        }

        //隐藏其他楼层
        var hideFloors_=_.rest(curShowFloors_);
        _.map(hideFloors_,function(item_){
            try{
                item_.stutsChange(0);//隐藏楼层
            }catch (e){

            }
        });
        _.map(curOpacityFloors_||[],function(item_){
            try{
                item_.stutsChange(0);//隐藏楼层
            }catch (e){

            }
        });
    }

    /**         * 展示楼层模型         */
    showFloorsMeshByID(floor_,otherVisiblely_=false){

        var selectFloors=null;
        selectFloors=_.findWhere(this.architeFloors,{archite_id:floor_});

        /**
         * 需要隐藏的楼层
         * @type {any}
         */
        var hideFloors=null;
        hideFloors=_.reject(this.architeFloors,function(item_){
            return item_.archite_id==floor_;
        });

        if(hideFloors&&hideFloors.length){
            for (var i = 0; i < hideFloors.length; i++) {
                var tempFloor_:ArchiteFloor = hideFloors[i];
                if(tempFloor_){
                    if(otherVisiblely_){
                        tempFloor_.stutsChange(0);
                    }else{
                        tempFloor_.stutsChange(2);
                    }
                }
            }
        }

        //对应楼层是否已创建
        if(selectFloors){
            //当前仅选中的楼层显示
            selectFloors.stutsChange(1)

        }else{

            //不存在选择的模型，则创建
            selectFloors=this.createFloors(floor_);
            if(!selectFloors)return;
            this.architeFloors.push(selectFloors);//添加到已创建模型

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

    }

    /**
     * 搜索
     * @param name_
     * @param type_
     */
    search(name_){

        //检索数据中是否存在
        var floorDatas_=_.filter(this.oriData.Floors||[],function(floor_){
            if(_.findWhere(floor_.FuncAreas||[],{Name:name_})){
                return true;
            }else{
                return false;
            }
        });

        //不存在
        if(!floorDatas_||!floorDatas_.length){
            return null;
        }
        var floorData_=floorDatas_[0];


        //获取/创建楼层
        var floor_=this.showFloorsMeshByID(floorData_._id);
        if(!floor_){
            return null;
        }

        var func_=floor_.searchFuncArea(name_);
        if(func_){
            return func_;
        }
        return null;

    }

    /**         * 显示所有楼层         */
    showAllFloors(){
        var that_=this;
        _.map(that_.oriData.Floors||[],function(floor_,index_){
            var curFloor_=_.findWhere(that_.architeFloors,{archite_id:floor_._id});
            if(curFloor_){//楼层存在则显示

            }else{
                //不存在选择的模型，则创建
                curFloor_=that_.createFloors(floor_._id);
                if(!curFloor_)return;
                that_.architeFloors.push(curFloor_);//添加到已创建模型

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

            if(index_==0){
                curFloor_.stutsChange(1);
            }else{
                curFloor_.stutsChange(2);
            }

        });

    }

    /**
     * 刷新广告牌显示
     * @param proMatrix_
     */
    updateBillBoards(camera_){
        if(!camera_)return;
        if(this.pubPointShow||this.funcareaLabelShow){
            var proMatrix_ = new THREE.Matrix4();
            proMatrix_.multiplyMatrices(camera_.projectionMatrix, camera_.matrixWorldInverse);

            for (var i = 0; i < this.architeFloors.length; i++) {
                var floor_ = this.architeFloors[i];
                if(floor_.showStuts==0){
                    continue;
                }else{
                    if(this.pubPointShow)floor_.updateSpritesPosition(proMatrix_);
                    if(this.funcareaLabelShow)floor_.updateLabelsPosition(proMatrix_);
                }
            }
        }
    }

    pubPointShow=true;
    /**         * 楼层公共设施         */
    enabledFloorsPubPoints(show_){
        this.pubPointShow=show_;
        //查询所有显示的楼层
        var curShowFloors_=_.where(this.architeFloors,{archite_show:true});

        for (var i = 0; i < curShowFloors_.length; i++) {
            var obj = curShowFloors_[i];
            this.ArchiteIcon.add(obj.getPubPoints(show_));
        }
    }

    funcareaLabelShow=true;
    /**         * 楼层标注         */
    enabledFloorsLabel(show_){
        this.funcareaLabelShow=show_;
        //查询所有显示的楼层
        var curShowFloors_=_.where(this.architeFloors,{archite_show:true});

        for (var i = 0; i < curShowFloors_.length; i++) {
            var obj = curShowFloors_[i];
            this.ArchiteIcon.add(obj.getFuncAreasLabel(show_));
        }
    }

    /**
     * 创建对应模型
     * @returns {liaohengfan.LI_ARCHITE.ArchiteFloor}
     */
    createFloors(floor_){
        var floorData_=null;
        /**             * 所有楼层             */
        floorData_=_.findWhere(this.oriData.Floors||[],{_id:floor_});

        //没有找到对应楼层
        if(!floorData_)return;

        var y_=this.getFloorY(floor_);

        //创建楼层
        var curFloor_=new ArchiteFloor(this.resources,floorData_,y_*80);

        return curFloor_;
    }
}