/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function (options) {

  var _this = this;

  //this.render = options.render;

  /* Body Tag */
  this.bodyTag = document.getElementsByTagName('body')[0];

  /* Head Tag */
  this.headTag = document.getElementsByTagName('head')[0];

  /* json */
  if (typeof json == 'undefined' && typeof rma != 'undefined') {
    this.json = rma.customize.json;
  } else if (typeof json != 'undefined') {
    this.json = json;
  } else {
    this.json = '';
  }

  /* fet */
  if (typeof fet == 'undefined' && typeof rma != 'undefined') {
    this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
  } else if (typeof fet != 'undefined') {
    this.fet = fet;
  } else {
    this.fet = [];
  }

  this.fetTracked = false;

  /* load json for assets */
  this.loadJs(this.json, function () {
    _this.data = json_data;

    _this.render.render();
  });

  /* Get Tracker */
  if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
    this.custTracker = rma.customize.custTracker;
  } else if (typeof custTracker != 'undefined') {
    this.custTracker = custTracker;
  } else {
    this.custTracker = [];
  }

  /* CT */
  if (typeof ct == 'undefined' && typeof rma != 'undefined') {
    this.ct = rma.ct;
  } else if (typeof ct != 'undefined') {
    this.ct = ct;
  } else {
    this.ct = [];
  }

  /* CTE */
  if (typeof cte == 'undefined' && typeof rma != 'undefined') {
    this.cte = rma.cte;
  } else if (typeof cte != 'undefined') {
    this.cte = cte;
  } else {
    this.cte = [];
  }

  /* tags */
  if (typeof tags == 'undefined' && typeof tags != 'undefined') {
    this.tags = this.tagsProcess(rma.tags);
  } else if (typeof tags != 'undefined') {
    this.tags = this.tagsProcess(tags);
  } else {
    this.tags = '';
  }

  /* Unique ID on each initialise */
  this.id = this.uniqId();

  /* Tracked tracker */
  this.tracked = [];
  /* each engagement type should be track for only once and also the first tracker only */
  this.trackedEngagementType = [];
  /* trackers which should not have engagement type */
  this.engagementTypeExlude = [];
  /* first engagement */
  this.firstEngagementTracked = false;

  /* RMA Widget - Content Area */
  this.contentTag = document.getElementById('rma-widget');

  /* URL Path */
  this.path = typeof rma != 'undefined' ? rma.customize.src : '';

  /* Solve {2} issues */
  for (var i = 0; i < this.custTracker.length; i++) {
    if (this.custTracker[i].indexOf('{2}') != -1) {
      this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
    }
  }
};

/* Generate unique ID */
mads.prototype.uniqId = function () {

  return new Date().getTime();
}

mads.prototype.tagsProcess = function (tags) {

  var tagsStr = '';

  for(var obj in tags){
    if(tags.hasOwnProperty(obj)){
      tagsStr+= '&'+obj + '=' + tags[obj];
    }
  }

  return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function (url) {

  if(typeof url != "undefined" && url !=""){

    if(typeof this.ct != 'undefined' && this.ct != '') {
      url = this.ct + encodeURIComponent(url);
    }

    if (typeof mraid !== 'undefined') {
      mraid.open(url);
    }else{
      window.open(url);
    }

    if(typeof this.cte != 'undefined' && this.cte != '') {
      this.imageTracker(this.cte);
    }
  }
}

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

  /*
  * name is used to make sure that particular tracker is tracked for only once
  * there might have the same type in different location, so it will need the name to differentiate them
  */
  name = name || type;

  if ( tt == 'E' && !this.fetTracked ) {
    for ( var i = 0; i < this.fet.length; i++ ) {
      var t = document.createElement('img');
      t.src = this.fet[i];

      t.style.display = 'none';
      this.bodyTag.appendChild(t);
    }
    this.fetTracked = true;
  }

  if ( typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1 ) {
    for (var i = 0; i < this.custTracker.length; i++) {
      var img = document.createElement('img');

      if (typeof value == 'undefined') {
        value = '';
      }

      /* Insert Macro */
      var src = this.custTracker[i].replace('{{rmatype}}', type);
      src = src.replace('{{rmavalue}}', value);

      /* Insert TT's macro */
      if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
        src = src.replace('tt={{rmatt}}', '');
      } else {
        src = src.replace('{{rmatt}}', tt);
        this.trackedEngagementType.push(tt);
      }

      /* Append ty for first tracker only */
      if (!this.firstEngagementTracked && tt == 'E') {
        src = src + '&ty=E';
        this.firstEngagementTracked = true;
      }

      /* */
      img.src = src + this.tags + '&' + this.id;

      img.style.display = 'none';
      this.bodyTag.appendChild(img);

      this.tracked.push(name);
    }
  }
};

mads.prototype.imageTracker = function (url) {
  for ( var i = 0; i < url.length; i++ ) {
    var t = document.createElement('img');
    t.src = url[i];

    t.style.display = 'none';
    this.bodyTag.appendChild(t);
  }
}

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
  var script = document.createElement('script');
  script.src = js;

  if (typeof callback != 'undefined') {
    script.onload = callback;
  }

  this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function (href) {
  var link = document.createElement('link');
  link.href = href;
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');

  this.headTag.appendChild(link);
}

/*
 *
 * Unit Testing for mads
 *
 */
var testunit = function() {
    var app = new mads();

    app.loadCss(app.path + 'css/style.css');

    var contentHtml = function() {
        app.contentTag.innerHTML =
            '<div class="guide"></div> \
        <div class="logo"><img src="img/copy01.png" alt=""></div> \
        <div class="firstBg"></div> \
        <div class="secondBg"></div> \
        <div id="container"> \
        </div> \
        <div class="pagination"> \
            <img data-jcarousel-control="true" data-target="-=1" class="prev" src="' + app.path + 'img/left-arrow.png" alt="q"> \
            <img data-jcarousel-control="true" data-target="+=1" class="next" src="' + app.path + 'img/right-arrow.png" alt="q"> \
            <div class="boxes"> \
                <div class="box pizza" id="box-1" data-x="105" data-y="-140" data-box-name="pizza"></div> \
                <div class="box potato" id="box-2" data-x="105" data-y="-70" data-box-name="wedges"></div> \
                <div class="box fruit" id="box-3" data-x="70" data-y="-190" data-box-name="partait"></div> \
                <div class="box dilmah" id="box-4" data-x="235" data-y="-70" data-box-name="tea"></div> \
                <div class="box peppermint" id="box-5" data-x="45" data-y="-110" data-box-name="choco"></div> \
                <div class="box santino" id="box-6" data-x="220" data-y="-180" data-box-name="coffee"></div> \
                <div class="box creme" id="box-7" data-x="190" data-y="-100" data-box-name="bruelee"></div> \
                <div class="jcarousel-wrapper"> \
                    <div data-jcarousel="true" data-wrap="circular" class="jcarousel" data-center="true"> \
                        <ul> \
                            <li data-name="pizza"><div class="item pizza"><div class="opacity">&nbsp;</div><img src="img/pizza-option.png" alt=""></div></li> \
                            <li data-name="potato"><div class="item potato"><div class="opacity">&nbsp;</div><img src="img/potato-wedges-option.png" alt=""></div></li> \
                            <li data-name="fruit"><div class="item fruit"><div class="opacity">&nbsp;</div><img src="img/fruit-partait-option.png" alt=""></div></li> \
                            <li data-name="dilmah"><div class="item dilmah"><div class="opacity">&nbsp;</div><img src="img/dilmah-tea-grup-option.png" alt=""></div></li> \
                            <li data-name="peppermint"><div class="item peppermint"><div class="opacity">&nbsp;</div><img src="img/peppermint-choho-option.png" alt=""></div></li> \
                            <li data-name="santino"><div class="item santino"><div class="opacity">&nbsp;</div><img src="img/santino-option.png" alt=""></div></li> \
                            <li data-name="creme"><div class="item creme"><div class="opacity">&nbsp;</div><img src="img/creme-bruelee-option.png" alt=""></div></li> \
                        </ul> \
                    </div> \
                </div> \
            </div> \
        </div> \
        <div class="pilihSemuaBtn"></div> \
        <div class="menuPilihankuBtn"></div> \
        <div class="ulangiBtn"></div> \
        <div class="menuDiskonBtn"></div>';
    };

    var renderTemplate = function() {

        var carouselLoad = function() {

            var tweenMaxLoad = function() {

                var draggableLoad = function() {

                    function initializeContent(isRetry) {

                        contentHtml();

                        var $container = $("#container");

                        $("#rma-widget").on('click', function() {
                            $('.firstBg').show();
                            $container.show();
                            $('.logo').show();
                            $('.pagination').show();
                            $('.guide').hide();
                            
                            if(!isRetry) {
                                app.tracker('E', 'start');
                                $(this).off('click');
                            }
                        });

                        TweenLite.set($container, {
                            height: 330,
                            width: 270
                        });

                        var count = 0;
                        var draggable;
                        var boxesDragged = [];

                        var getDraggable = function() {
                            draggable = Draggable.create(".box", {
                                bounds: $container,
                                autoScroll: 1,
                                edgeResistance: 0.65,
                                type: "x,y",
                                throwProps: true,
                                onDragStart: function() {
                                    var data = elCarousel.data('jcarousel');
                                    if (data) {
                                        data._visible.find('.opacity').show();
                                        var currentBox = $(this._eventTarget);
                                        currentBox.addClass('added');
                                        var boxName = currentBox.data('box-name');

                                        if(boxesDragged.indexOf(boxName) == -1) {
                                            app.tracker('E', boxName);
                                            boxesDragged.push(boxName);
                                        }
                                    }
                                },
                                onDragEnd: function() {
                                    var draggedCount = $('.box.added').length;
                                    if (draggedCount > 2) {
                                        // selected 3 items
                                        $('.pilihSemuaBtn, .menuPilihankuBtn').fadeIn();
                                    }
                                }
                            });
                        }

                        var elCarousel = $('[data-jcarousel]');
                        elCarousel.on('jcarousel:createend', function(event, carousel) {
                            // the carousel just created
                            $(this).children().css('left', 0);
                            getDraggable();
                        }).on('jcarousel:animate', function(event, carousel) {
                            // on click to next, prev buttons
                            $('.box:not(".added")').hide();

                        }).on('jcarousel:animateend', function(event, carousel) {
                            // the carousel has been animated
                            var boxName = carousel._visible.data('name');
                            $('.box:not(".added")').hide();
                            var boxName = carousel._visible.data('name');
                            $('.box.' + boxName).show();

                        }).jcarousel(elCarousel.data());

                        $('[data-jcarousel-control]').each(function() {
                            var el = $(this);
                            el.jcarouselControl(el.data());
                        });

                        var notClicked = true;
                        $('.pilihSemuaBtn').on('click', function() {
                            if(notClicked) {
                                notClicked = false;

                                $('.prev,.next').off('click.jcarouselcontrol');

                                if(draggable) {
                                    for (var i = 0; i < draggable.length; i++) {
                                        draggable[i].kill();
                                    }
                                }

                                TweenMax.to(".box.added", 0.7, {
                                    rotation: 270,
                                    scale: 0.5,
                                    opacity: 0,
                                    onComplete: function() {

                                        // hidden completely

                                        TweenLite.to('.box', 0, {
                                            scale: 1,
                                            rotation: 0,
                                            delay: 0,
                                        });

                                        $('.box').each(function() {
                                            var currentBox = $(this);
                                            var x = currentBox.data('x');
                                            var y = currentBox.data('y');

                                            currentBox.css({
                                                left: x,
                                                top: y,
                                                display: 'block',
                                                opacity: 0,
                                                transform: 'translate3d(0px, 0px, 0px)'
                                            });

                                            currentBox.animate({
                                                opacity: 1
                                            });
                                        });
                                    }
                                }, 0.5);
                            }
                        });

                        $('.menuPilihankuBtn').on('click', function() {
                            $('.box').hide();
                            $('.firstBg').hide();
                            $('.secondBg').show();
                            $('.pilihSemuaBtn, .menuPilihankuBtn').hide();
                            $('.ulangiBtn, .menuDiskonBtn').show();
                            app.tracker('E', 'done');
                        });

                        $('.ulangiBtn').on('click', function() {
                            initializeContent(true);
                            app.tracker('E', 'retry');
                        });

                        $('.menuDiskonBtn').on('click', function() {
                            app.linkOpener('https://www.pizzahut.co.id/menu/tea-time');
                            app.tracker('CTR', 'landing');
                        });
                    }

                    initializeContent();
                };


                app.loadJs(app.path + 'js/draggable.js', draggableLoad);
            }

            app.loadJs(app.path + 'js/tweenmax.js', tweenMaxLoad);
        }

        app.loadJs(app.path + 'js/jcarousel.js', carouselLoad);

    };

    app.loadJs(app.path + 'js/jquery.js', renderTemplate);
}

testunit();