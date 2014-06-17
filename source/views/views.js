/**
	For simple applications, you might define all of your views in this file.  
	For more complex applications, you might choose to separate these kind definitions 
	into multiple files under this folder.
*/

	enyo.kind({
		name: "app500.MainView",
		classes: "moon enyo-fit",
		components: [
				{name:"viewer",kind:"app500.viewer"},
				{kind: "moon.Panels",allowNumber:false,name:"searchpanel",classes:"enyo-fit",popOnBack:true,pattern: "activity", useHandle:true,components: [
						{kind: "app500.SearchPanel"}
				]}
		],
		bindings:[
			{from: ".$.searchpanel.showing", to:".panelsShowing"}
		],
		handlers: {
			onRequestPushPanel: "pushPanel",
			onRequestSlideshowStart: "startSlideshow"
		},
		create:function(){
			this.inherited(arguments);
		},
		rendered: function() {
			this.inherited(arguments);
			enyo.Spotlight.spot(this.$.panels);
		},
		//* Clicking on thumbnail should display HD view        
		pushPanel: function(inSender, inEvent) {
			
			this.$.searchpanel.hide();
			this.$.viewer.setInfo({photos:inEvent.photos,index:inEvent.index});
			this.$.viewer.show();
		},

		//* start the slideshow
		startSlideshow:function(inSender,inEvent){
			this.$.viewer.startSlideShow({photos: inEvent.photos});
			this.$.viewer.show();
			this.$.searchpanel.hide();
		},
		panelsShowingChanged: function() {
			if (this.panelsShowing) {
				this.$.viewer.stop();
			}
	}

	});
	
	enyo.kind({
		name: "app500.SearchPanel",
		kind: "moon.Panel",
		//* @protected
		title: "Search 500px",
		titleBelow: "Enter the term to search",
		allowNumber: false,
		//* remaining number of photos to show after fetch
		rem:"",
		//* total number of photos in a category
		pagefetch:"",
		i:2,
		headerOptions: {inputMode: true, dismissOnEnter: true},
		events: {
			onRequestPushPanel: "",
			onRequestSlideshowStart: ""
		},
		handlers: {
			onInputHeaderChange: "search",
			onScrollStop: "nextFetch"
		},
		headerComponents: [
			{kind: "moon.Spinner", content: "Loading...", name: "spinner"},
			{kind: "moon.Button", small:true, name:"startButton", content: "Start Slideshow", ontap: "startSlideshow"},
			{kind: "moon.Button", small:true, name:"sortButton", content: "SortbyName", ontap: "sortCheck"}
			/*{kind: "moon.Button", small:true, name:"filterButton", content: "filterAperture", ontap: "filterCheck"}*/
		],
		components: [
			{kind:"FittableRows",classes:"enyo-fit",components:[
				{kind:"FittableColumns",style:"height:90%",components:[

					{kind: "Group",style:"width:20%",onActivate:"method",components: [
									{kind: "moon.SelectableItem", selected:true,name:"popular", content: "Popular"},
									{kind: "moon.SelectableItem", name:"editors", content:"Editor's"},
									{kind: "moon.SelectableItem", name:"fresh_today", content:"Fresh"},
									{kind: "moon.SelectableItem", name:"upcoming", content:"Upcoming"},
					]},
					{kind: "moon.DataGridList",name: "resultList",fit:true,allowTransition:true,minWidth: 250, minHeight: 300, components: [
						{kind: "moon.GridListImageItem", imageSizing: "cover",ontap:"itemSelected", useSubCaption: false, centered: false,bindings: [
							{from: ".model.name", to:".caption"},
							{from: ".model.image_url", to:".source"}
						]}
					]}

				]},
				{kind: "moon.Button", small:true,name:"more",fit:true,style:"margin-left:50%",content: "More", ontap: "showMore"},

			]},
			{kind: "Signals", onTransmission: "transmission"},
            {name: "noticeDialog", kind: "moon.Dialog",modal: true,autoDismiss:false,spotlightModal:true,showCloseButton:false,title: $L("Not Connected To Internet"),
            message: $L("Please Check your Internet Connection And Try Again"),
            components: [
                {name: "close", kind: "moon.Button", content: $L("Close"), ontap: "closePopup"}            ]
            }
		],
		bindings: [
		//* resultList links its children directly to the underlying records in the collection set as its collection.
			{from: ".photos", to: ".$.resultList.collection"},
			{from: ".photos.isFetching", to:".$.spinner.showing"}
		],
		create: function() {
			this.inherited(arguments);
		},
        closePopup:function(inSender,inEvent){
            this.$.noticeDialog.hide();
        },
		//* set the search text
		search: function(inSender, inEvent) {
            this.$.more.applyStyle("visibility","hidden");
            this.i=2;
            //searchText defined in collection
            if(inEvent.originator.get("value")==="")
                return;
            var request = new enyo.ServiceRequest({
                service: "luna://com.palm.connectionmanager",
                method: "getstatus",
                subscribe: true
            });
            this.search= inEvent.originator.get("value");
            request.response(this, "responseSuccessSearch");
            request.error(this,"responseFailure");
            request.go({});
		},

		//* set the feature type to the collection
		method :function(inSender,inEvent) {
            //methodType defined in collection
            this.$.more.applyStyle("visibility","hidden");
            this.i=2;
            this.getHeader().setValue("");
            //check connection
           /*var request = new enyo.ServiceRequest({
                service: "luna://com.palm.connectionmanager",
                method: "getstatus"
            });
            this.methodType=inEvent.originator.name;
            request.response(this, "responseSuccessFeature");
            request.error(this,"responseFailure");
            request.go({});
           */
            this.set("photos", new app500.FeatureCollection());
            this.$.resultList.collection.set("methodType",inEvent.originator.name);
            return true;
        },
        responseSuccessSearch: function(inSender,inResponse){
            if(inResponse.wired.state === "connected" && inResponse.wired.onInternet === "yes"){
                this.set("photos", new app500.SearchCollection());
                this.$.resultList.collection.set("searchText",this.search);
                this.$.startButton.setDisabled(false);
                this.$.more.setDisabled(false);
                this.$.spinner.show();
                return true;
            }
            else
                this.responseFailure();
        },
        responseSuccessFeature: function(inSender,inResponse){
            if(inResponse.wired.state === "connected" && inResponse.wired.onInternet === "yes")
            {
                this.set("photos", new app500.FeatureCollection());
                this.$.resultList.collection.set("methodType",this.methodType);
                this.$.startButton.setDisabled(false);
                this.$.more.setDisabled(false);
                return true;
            }
            else
                this.responseFailure();
        },
        responseFailure: function(inSender,inResponse){
            this.$.noticeDialog.show();
            this.$.startButton.setDisabled(true);
            this.$.more.setDisabled(true);
            this.$.spinner.hide();
            return;
        },

		//* fire event upwards once a thumbnail item clicked
		itemSelected: function(inSender, inEvent) {
			this.doRequestPushPanel({model: inEvent.model,photos:this.photos,index:inEvent.index});
		},

		//* fire event for slideshow
		startSlideshow: function() {
			this.doRequestSlideshowStart({photos:this.photos});
		},
		nextFetch: function(inSender,inEvent) {
			var maxTopVal = inEvent.scrollBounds.maxTop,
			actualTop = inEvent.scrollBounds.top;
			if(maxTopVal===0)
				return;
			if((maxTopVal*0.95)-actualTop <50.0 && this.i!=1) {
				this.$.more.applyStyle("visibility","visible");
			}else
				this.$.more.applyStyle("visibility","hidden");
		},
		//* 25 photos to be fetched per click of more and added to collection
		showMore: function(){
			this.$.more.applyStyle("visibility","hidden");
			if(this.rem<=25){
				this.$.resultList.collection.fetch({page:this.i});
				this.i=1;
			}else{
				this.$.resultList.collection.fetch({page:this.i});
				this.rem=this.rem-25;
				console.log("Remaining images to show "+ this.rem);
				++this.i;
			}
			//this.$.resultList.refresh();
		},
		transmission: function(inSender, inEvent) {
		//* respond to the signal
			console.log("Total photos ",inEvent.length);
			this.rem=inEvent.length-25;
			this.pagefetch= inEvent.pages;
			if(this.rem<=0)
				this.i=1;
			return true;
		},
		sortCheck: function(inSender,inEvent){
			this.$.resultList.collection.sort(function(a,b){
			var x= a.get("name").toLowerCase(), y=b.get("name").toLowerCase();
			//var x= a.get("rating"), y=b.get("rating");
			return x<y? -1 : x>y ? 1 : 0;
			});
			
		},
		filterCheck: function(inSender,inEvent){
			var filterphotos=this.$.resultList.collection.filter(filterfunc);
			function filterfunc(element) {
				return element.get("aperture") > 20;
			}
			this.set("photos",filterphotos);
		}

	});

	enyo.kind({
		name: "app500.viewer",
		kind: "enyo.FittableColumns",
		classes:"enyo-fit",
		components:[
            /*{kind:"FittableRows",name:"photoViewer",fit:true,components:[
                {kind:"enyo.ImageView",name:"view",fit:true},
                {kind: "moon.Spinner", content: "Image is Loading...",style:"margin-left:40%",name: "spinner_view"},
                {name: "basicPopup", kind: "moon.Popup", content: "Image cannot be Loaded..."}
            ]},*/
            {kind:"enyo.ImageView",name:"photoViewer",classes: "enyo-fit"},
            {name: "photoViewerSlideShow", kind: "enyo.ImageView", classes: "enyo-fit"}
		],
        handlers:{
            onSpotlightLeft : "leftTap",
            onSpotlightRight : "rightTap",
            onerror: "imageLoadError",
            onload: "imageLoaded"
        },
        published: {
			//* time delay between photos
			delay: 3000
		},
		create:function(){
			this.inherited(arguments);
		},
		idx:0,
		//* @public
		//* previous photo in collection to be shown in ImageView
		leftTap:function(inSender,inEvent){
            this.$.basicPopup.hide();
            if(this.index>0){
                this.index=this.index-1;
                this.$.rbutton.setDisabled(false);
                this.$.spinner_view.setShowing(true);
                console.log("index of photo "+this.index);
                this.$.view.setSrc(this.photos.at(this.index).get("original"));
                if(this.index===0)
                    this.$.lbutton.setDisabled(true);
            }
        },
        //* next photo in collection to be shown in ImageView
        rightTap:function(inSender,inEvent){
            this.$.basicPopup.hide();
            if(this.index>=0 && this.index<(this.photos.length-1)){
                this.$.spinner_view.setShowing(true);
                this.$.lbutton.setDisabled(false);
                this.index=this.index+1;
                console.log("index of photo "+this.index);
                this.$.view.setSrc(this.photos.at(this.index).get("original"));
                if(this.index===this.photos.length-1)
                    this.$.rbutton.setDisabled(true);
            }
        },
        imageLoadError: function(inEvent){
/*            this.$.basicPopup.show();
            this.$.spinner_view.setShowing(false);*/
        },
        imageLoaded: function(inEvent){
            /*console.log("Image is loading");
            this.$.spinner_view.setShowing(false);*/
        },
        startSlideShow: function(inPhotoCollection){
			this.set("photos", inPhotoCollection.photos);
			this.$.photoViewerSlideShow.show();
			this.$.photoViewer.hide();
			this.start();
		},
        start: function() {
			this.next(true);
		},
		//* @protected
		next: function(start) {
			if (!start) {
				//this.index++;
				if (this.idx > this.photos.length) {
					this.idx = 0;
				}
			}
			this.$.photoViewerSlideShow.set('src', this.photos.at(this.idx++).get('original'));
			this.$.photoViewerSlideShow.startJob("slideshow", this.bindSafely("next"), this.delay);
		},
		stop: function() {
			this.$.photoViewerSlideShow.stopJob("slideshow");
			this.idx=0;
		},
		setInfo: function(inPhotoInfo){
			this.set('photos', inPhotoInfo.photos);
			this.index = inPhotoInfo.index;
			this.$.photoViewer.show();
			this.$.photoViewer.set('src', this.photos.at(this.index).get('original'));
			//this.$.photoViewer.set('src', this.photos.at(this.index).get('image_url'));
			this.$.photoViewerSlideShow.hide();
		},
	});
