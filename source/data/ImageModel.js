    enyo.kind({
        name: "app500.ImageModel",
        kind: "enyo.Model",
        //* @protected
        readOnly: true,
        primaryKey: "name",
        /*attributes:{
            //* image url for high resolution image
            original:function(){
                var url=this.get("image_url");
                return url.replace("3.jpg","4.jpg");
            }
        },*/
        //* image url for thumbnail image
        computed:{
            "original":["image_url"]
        },
        original:function(){
                var url=this.get("image_url");
                return url.replace("3.jpg","4.jpg");
        }

    });