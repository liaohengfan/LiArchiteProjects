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
class ArchiteFuncArea{
    constructor(data_,high_,color_){
        this.archite_id=data_._id;
        this.archite_name=data_.Name;
        this.oriData=data_;
        var outLine_=getDataMesh(data_,high_,color_);
        this.mesh=outLine_.outline3D;
        this.outLine=outLine_.outline;
        this.plane=outLine_.outline2D;
    }
    oriData:any=null;
    archite_show=true;
    archite_name="";
    archite_id="";
    mesh=null;
    plane=null;
    outLine=null;
}

/**     * 楼层     */
class ArchiteFloor{

    constructor(resources_:ArchiteResources,data_,y_){
        this.resources=resources_;
        this.floorData=data_;
        this.archite_id=data_._id;
        this.archite_name=data_.Name;
        this.yAxis=y_;
        this.floorHigh=data_.High*10;
    }

    applyStuts(object_,visible_,opacity_){
        if(object_){
            object_.visible=visible_;
            if(visible_){
                meshChangeOpacity(object_,opacity_);
            }
        }
    }

    /**         * 更新标注显示位置         */
    updateLabelsPosition(proMatrix_){
        if(this.funcAreasLabels){
            updateBillBoards(this.funcAreasLabels,proMatrix_);
        }
    }

    /**         * 更新标注位置         */
    updateSpritesPosition(proMatrix_){
        if(this.PubPoints){
            updateBillBoards(this.PubPoints,proMatrix_);
        }
    }

    stutsChange(type_){
        if(type_==this.showStuts)return;
        this.showStuts=type_;
        switch(this.showStuts){
            case 1:

                //3D
                this.applyStuts(this.floorGround,true,1);
                this.applyStuts(this.funcAreaMesh,true,1);
                //2D
                this.applyStuts(this.floorGround2D,true,1);
                this.applyStuts(this.funcAreaMesh2D,true,1);

                this.applyStuts(this.PubPoints,true,1);
                this.applyStuts(this.funcAreasLabels,true,1);
                break;
            case 2:
                //3D
                this.applyStuts(this.floorGround,true,0.1);
                this.applyStuts(this.funcAreaMesh,true,0.1);
                //2D
                this.applyStuts(this.floorGround2D,true,0.1);
                this.applyStuts(this.funcAreaMesh2D,true,0.1);

                this.applyStuts(this.PubPoints,true,0.1);
                this.applyStuts(this.funcAreasLabels,true,0.1);
                break;
            default:
                //3D
                this.applyStuts(this.floorGround,false,0.1);
                this.applyStuts(this.funcAreaMesh,false,0.1);
                //2D
                this.applyStuts(this.floorGround2D,false,0.1);
                this.applyStuts(this.funcAreaMesh2D,false,0.1);

                this.applyStuts(this.PubPoints,false,0.1);
                this.applyStuts(this.funcAreasLabels,false,0.1);
                break;
        }

    }
    showStuts=1;
    resources:ArchiteResources;
    archite_show=true;
    archite_name="";
    archite_id="";
    floorData=null;

    is3D=true;

    yAxis=0;
    floorHigh=0;

    /**
     * 公共设施点
     * @type {any}
     */
    PubPoints=null;
    PubPointArrays:Array<any>=[];
    /**         * 公共服务点         */
    getPubPoints(enabled_){

        if(this.PubPoints){
            this.PubPoints.visible=enabled_;
            return this.PubPoints;
        }

        this.PubPoints=new THREE.Object3D();
        this.PubPoints.position.z=(this.yAxis);
        this.PubPoints.visible=enabled_;

        //公共设施
        if(this.floorData.PubPoint){
            this.floorData.PubPoint=this.floorData.PubPoint||[];

            var y_z=this.floorData.High;
            y_z*=10;

            var lockZ=((this.yAxis))+y_z;

            for (var i = 0; i < this.floorData.PubPoint.length; i++) {
                var point_ = this.floorData.PubPoint[i];
                var position_=point_.Outline[0][0];
                var positionVec3=new THREE.Vector3(position_[0]||0,position_[1],y_z);
                positionVec3.x*=20;
                positionVec3.y*=20;
                var ico_=getIconUrlByType(point_.Type);
                var map_:THREE.Texture=this.resources.getTexture(point_.Type);
                if(!map_){
                    map_=new THREE.Texture();
                }

                //图标待确认
                var material_=new THREE.SpriteMaterial({
                    //map:new THREE.TextureLoader().load(ico_),
                    map:map_,useScreenCoordinates: false,
                    color:0xFFFFFF
                });
                var sprite_=new THREE.Sprite(material_);

                sprite_.lockX=positionVec3.x;
                sprite_.lockY=positionVec3.y;
                sprite_.lockZ=lockZ;

                sprite_.defaultMaterial=material_;
                sprite_.scale.set(24,24,1);

                //sprite visible judge
                sprite_.width=24;
                sprite_.height=24;

                sprite_.position.copy(positionVec3);
                this.PubPoints.add(sprite_);

                //原始数据
                sprite_.oriData=point_;

                this.PubPointArrays.push(sprite_);


            }
        }

        return this.PubPoints;

    }


    floorGround=null;
    floorGround2D=null;

    /**         * 楼层地板         */
    getFloorGround(is3D_=true){
        if(this.floorGround){
            if(is3D_){
                return this.floorGround;
            }else{
                return this.floorGround2D;
            }
        }
        this.floorGround=new THREE.Object3D();
        this.floorGround.position.z=this.yAxis-10;
        this.floorGround2D=new THREE.Object3D();
        this.floorGround2D.position.z=(this.yAxis+this.floorHigh)-1;
        if(this.floorData.Outline){
            var floor_=getLimitHeightDataMesh(this.floorData,1,0xFFFFFF);
            this.floorGround.add(floor_.outline3D);
            this.floorGround2D.add(floor_.outline2D);
        }
        if(is3D_){
            return this.floorGround;
        }else{
            return this.floorGround2D;
        }
    }

    funcAreas=[];
    funcAreaMesh=null;
    funcAreaMesh2D=null;
    /**         * 店面         */
    getFuncAreasMesh(is3D_){

        //模型已经创建
        if(this.funcAreaMesh){
            if(is3D_){
                return this.funcAreaMesh;
            }else{
                return this.funcAreaMesh2D;
            }
        }

        this.funcAreaMesh=new THREE.Object3D();
        this.funcAreaMesh.position.z=this.yAxis;

        this.funcAreaMesh2D=new THREE.Object3D();
        this.funcAreaMesh2D.position.z=(this.yAxis+this.floorHigh);

        //店面
        if(this.floorData.FuncAreas){
            var funcareas_=this.floorData.FuncAreas;
            var high_=this.floorData.High;
            /**                     * 编译所有店面轮廓                     */
            for (var i = 0; i < funcareas_.length; i++) {
                var curfuncarea_=funcareas_[i];

                if(curfuncarea_.Follow=="1")continue;//团体参展

                var colors_=[0xc9fbc9,0x97c9fb,0xc9c9fb];
                var color_=_.sample(colors_);

                //创建门店
                var funcarea_ = new ArchiteFuncArea(curfuncarea_,high_,color_);
                this.funcAreaMesh.add(funcarea_.mesh);

                funcarea_.outLine.position.z=high_*10;
                this.funcAreaMesh.add(funcarea_.outLine);
                this.funcAreaMesh2D.add(funcarea_.plane);
                this.funcAreas.push(funcarea_);

            }
        }

        if(is3D_){
            return this.funcAreaMesh;
        }else{
            return this.funcAreaMesh2D;
        }
    }

    /**         * 搜索店铺         */
    searchFuncArea(name_){
        var funcarea_=_.findWhere(this.funcAreas,{archite_name:name_});
        return funcarea_;
    }

    /**         * 店铺         */
    funcAreasLabels=null;

    /**         * 获取所有店面名称         */
    getFuncAreasLabel(enabled_){
        if(this.funcAreasLabels){
            this.funcAreasLabels.visible=enabled_;
            return this.funcAreasLabels;
        }

        this.funcAreasLabels=new THREE.Object3D();
        this.funcAreasLabels.position.z=(this.yAxis);
        this.funcAreasLabels.visible=enabled_;
        //公共设施
        if(this.floorData.FuncAreas){
            this.floorData.FuncAreas=this.floorData.FuncAreas||[];

            var y_z=this.floorData.High;
            y_z*=10;

            var lockZ=((this.yAxis))+y_z;

            for (var i = 0; i < this.floorData.FuncAreas.length; i++) {
                var point_ = this.floorData.FuncAreas[i];

                if(point_.Follow=="1")continue;//团体参展

                var position_=point_.Center||point_.Center||[0,0];
                var positionVec3=new THREE.Vector3(position_[0]||0,position_[1],y_z);

                positionVec3.x*=20;
                positionVec3.y*=20;
                var funcName_=point_.Name||point_.Name_all||"";
                var label_=makeTextSprite(funcName_||"",{
                        color: "#231815",
                        fontsize: 40,
                        //fontface: "Helvetica, MicrosoftYaHei "
                        fontface: "Microsoft Yahei"
                        //fontface: "Roboto"
                });

                var translate_=(100-label_.contentWidth)/2;
                positionVec3.x+=translate_;
                //positionVec3.y+=translate_;
                label_.lockX=positionVec3.x;
                label_.lockY=positionVec3.y;
                label_.lockZ=lockZ;

                //label_.defaultMaterial=material_;
                //label_.scale.set(100,50,1);
                label_.position.copy(positionVec3);
                this.funcAreasLabels.add(label_);
            }
        }
        return this.funcAreasLabels;
    }
}