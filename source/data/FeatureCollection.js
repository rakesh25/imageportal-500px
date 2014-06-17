    enyo.kind({
        name: "app500.FeatureCollection",
        kind: "enyo.Collection",
        model: "app500.ImageModel",
        source: "appF500",
        flag:"",
        //* @public
        published: {
            //* method type
            methodType: null,
        },
        options: {
            parse: true,
            sort: true
        },
        //* Callback once method type is changed
        methodTypeChanged: function()  {
            //removes all the records from the collection and destroy them
            //this.destroyAll();
            this.flag=1;
            console.log("***Start fetching json*** "+ new Date().getTime());
            this.fetch();
        },
        sortCheck: function(){
            console.log("inside sort");
        },
        //* fetching data
        fetch: function(opts) {
            this.params = {
                feature: this.methodType || "popular",
                image_size: 3,
                //* result per page
                rpp: 25,
                page: opts && opts.page || 1,
                //type: "Photos",
                //sort: "votes_count",
                //license_type: 0,
                only: "Commercial",
                exclude:"Nude"
            };
            return this.inherited(arguments);
        },
        //* function called once data is fetched
        parse: function(data){
        console.log("***end time*** "+new Date().getTime());
        console.log("***application end time*** "+ new Date().getTime());
        if(data.photos.length && this.flag)
            enyo.Signals.send("onTransmission",{length:data.total_items});
        this.flag=0;
        return data && data.photos;
        }
    });