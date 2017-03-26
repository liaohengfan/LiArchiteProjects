/**
 * Created by liaohengfan on 2017/3/26.
 * 资源管理
 */
class ArchiteResources{

    texturesHashMap:ArchiteHashMap;
    texturesLoader:THREE.TextureLoader;
    constructor(){
        this.texturesHashMap=new ArchiteHashMap();
        this.texturesLoader=new THREE.TextureLoader();
    }

    addTexture(key:any,url_){
        var textures_=this.texturesLoader.load(url_);
        this.texturesHashMap.put(key,textures_);
    }
    getTexture(key:any){
        return this.texturesHashMap.get(key);
    }

}

class ArchiteHashMap{
    length:number=0;
    obj:Object=new Object();
    constructor(){

    }
    /**
     * 判断Map是否为空
     */
    isEmpty(){
        return this.length == 0;
    }

    /**
     * 判断对象中是否包含给定Key
     */
    containsKey(key){
        return (key in this.obj);
    }

    /**
     * 判断对象中是否包含给定的Value
     */
    containsValue(value){
        for(var key in this.obj){
            if(this.obj[key] == value){
                return true;
            }
        }
        return false;
    }

    /**
     *向map中添加数据
     */
    put(key,value){
        if(!this.containsKey(key)){
            length++;
        }
        this.obj[key] = value;
    }

    /**
     * 根据给定的Key获得Value
     */
    get(key){
        return this.containsKey(key)?this.obj[key]:null;
    }

    /**
     * 根据给定的Key删除一个值
     */
    remove(key){
        if(this.containsKey(key)&&(delete this.obj[key])){
            this.length--;
        }
    }

    /**
     * 获得Map中的所有Value
     */
    values(){
        var _values= new Array();
        for(var key in this.obj){
            _values.push(this.obj[key]);
        }
        return _values;
    }

    /**
     * 获得Map中的所有Key
     */
    keySet(){
        var _keys = new Array();
        for(var key in this.obj){
            _keys.push(key);
        }
        return _keys;
    }

    /**
     * 获得Map的长度
     */
    size(){
        return this.length;
    }

    /**
     * 清空Map
     */
    clear(){
        length = 0;
        this.obj = new Object();
        }
    }