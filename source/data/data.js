    /**
        For simple applications, you might define all of your models, collections,
        and sources in this file.  For more complex applications, you might choose to separate
        these kind definitions into multiple files under this folder.
    */
     enyo.kind({
            name: "app500.featureSource",
            kind: "enyo.AjaxSource",
            fetch: function(rec, opts) {
                opts.params = enyo.clone(rec.params);
                opts.url="https://api.500px.com/v1/photos";
                opts.params.consumer_key="6NmOGWsBu2PQrPLM5yxkoKkNcQfy6RsI9Ugrz3dZ";
                opts.params.format = "json";
                this.inherited(arguments);
            }

    });

    //need to register our newly-created source, to make it available for use by models and collections:
    enyo.Source.create({name:"appF500",kind:"app500.featureSource"});
        //enyo 2.4
        //enyo.store.addSources({appF500: "app500.featureSource"});

    enyo.kind({
            name: "app500.searchSource",
            kind: "enyo.AjaxSource",
            fetch: function(rec, opts) {
                opts.params = enyo.clone(rec.params);
                opts.url="https://api.500px.com/v1/photos/search";
                opts.params.consumer_key= "6NmOGWsBu2PQrPLM5yxkoKkNcQfy6RsI9Ugrz3dZ";
                opts.params.format = "json";
                this.inherited(arguments);
            }

    });

     //need to register our newly-created source, to make it available for use by models and collections:
    //global "enyo.Store"
    enyo.Source.create({name:"appS500",kind:"app500.searchSource"});

    //enyo.store.addSources({appS500: "app500.searchSource"});

    //enyo.store.ignoreDuplicates=true;
    //appF500.ignoreDuplicates=true;
        