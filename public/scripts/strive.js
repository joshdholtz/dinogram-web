(function() {
  var $body, $document, $html, $root, $window, Activities, Activity, EMAIL_REGEX, Enum, Event, EventComment, EventComments, EventRegistration, EventRegistrations, EventSession, EventSessions, EventView, Events, Facilities, Facility, Invite, InviteView, LayoutView, PagedCollection, Relationship, Relationships, RelationshipsView, Session, SettingsView, SplashView, StatisticsView, StreamView, URL_REGEX, User, Users, current_location, geocoder, global, loadFacebook, me, session, timezone_offset, unwrap, _complete, _error, _options, _success,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  URL_REGEX = /((http\:\/\/|https\:\/\/|ftp\:\/\/)|(www\.))+(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;

  EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;

  unwrap = ko.utils.unwrapObservable;

  RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  };

  Date.prototype.tomorrow = function() {
    return new Date(this.getTime()).add(1).days();
  };

  Date.prototype.yesterday = function() {
    return new Date(this.getTime()).add(-1).days();
  };

  _.mixin({
    trim: function(str) {
      if (str == null) return "";
      return str.toString().replace(/^\s+/, '').replace(/\s+$/, '');
    },
    linkify: function(string, attrs) {
      if (!_.isObject(attrs)) attrs = {};
      string = string.replace(URL_REGEX, function(url) {
        var label;
        label = _.trim(url);
        label = label.replace(/^(http|https|ftp):\/\//, '');
        attrs = _.attributize(attrs);
        return "<a href=\"" + url + "\" " + attrs + ">" + label + "</a>";
      });
      return string;
    },
    attributize: function(obj) {
      var attributes, key, object, value;
      attributes = "";
      if (!_.isObject(obj)) object = {};
      attributes = ((function() {
        var _results;
        _results = [];
        for (key in obj) {
          value = obj[key];
          value = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
          _results.push("" + key + "=\"" + value + "\"");
        }
        return _results;
      })()).join(" ");
      return _.trim(attributes);
    },
    curry: function(func, args, context) {
      context = context || func;
      if (!_.isArray(args)) args = [args];
      if (!_.isFunction(func)) func = (function() {});
      return function() {
        return func.apply(context, _.zip(args, arguments));
      };
    },
    parseQueryString: function(string) {
      var nvp;
      nvp = {};
      string = string || "";
      if (!_.isString(string)) string = string.toString();
      $.each(string.split("&"), function(index, pair) {
        pair = pair.split("=", 2);
        return nvp[pair[0]] = pair[1] || "";
      });
      return nvp;
    }
  });

  timezone_offset = (new Date()).getTimezoneOffset();

  this.Helpers = {
    /*
    	#
    */
    escapeHTML: function(html) {
      if (!_.isString(html)) html = "";
      return $("<div/>").text(html).html();
    },
    concat: function() {
      var arg, ret, _i, _len;
      ret = "";
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        ret += unwrap(arg);
      }
      return ret;
    },
    resizeMaps: function() {
      return $(".gmap").each(function(index, gmap) {
        var $gmap, map;
        $gmap = $(gmap);
        if ((map = $gmap.data("gmap"))) {
          return google.maps.event.trigger(map, 'resize');
        }
      });
    },
    join: function(collection, key, glue) {
      var str, value, _i, _len, _ref;
      if (Falcon.isCollection(collection)) collection = collection.list;
      if (ko.isObservable(collection)) collection = collection();
      if (!_.isArray(collection)) collection = [];
      if (!_.isString(glue)) _ref = [glue, key], key = _ref[0], glue = _ref[1];
      if (!_.isString(key)) key = "";
      if (!_.isString(glue)) glue = " ";
      str = "";
      key = _.trim(key);
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        value = collection[_i];
        if (!_.isEmpty(key)) value = value[key];
        value = unwrap(value);
        str += "" + value + glue;
      }
      if (str.length > 0) str = str.slice(0, str.lastIndexOf(glue));
      return str;
    },
    'open': function(url) {
      if (!_.isString(url)) url = "";
      if (_.isEmpty(url)) return;
      return window.open(url, 'downloadWindow');
    },
    'random': function(min, max) {
      var diff, _ref;
      if (max < min) _ref = [min, max], max = _ref[0], min = _ref[1];
      diff = (max - min) + 1;
      return parseInt(Math.random() * diff) + min;
    },
    'adjustForTimezone': function(date) {
      return date = date.add(-timezone_offset).minutes();
    },
    'formatDate': function(date, format) {
      date = unwrap(date);
      if (_.isString(date)) date = Date.parse(date);
      date = new Date(date.getTime());
      date = Helpers.adjustForTimezone(date);
      return date.toString(format);
    },
    'shortDateTime': function(date) {
      return Helpers.formatDate(date, 'M/d/yy h:mm');
    },
    'shortDate': function(date) {
      return Helpers.formatDate(date, 'M/d/yy');
    },
    'shortTime': function(date) {
      return Helpers.formatDate(date, 'h:mm tt');
    },
    'fullDate': function(date) {
      return Helpers.formatDate(date, 'dddd, MMMM dS, yyyy');
    },
    'isEmail': function(emailStr) {
      emailStr = unwrap(emailStr);
      if (!_.isString(emailStr)) emailStr = "";
      emailStr = _.trim(emailStr);
      return new RegExp(EMAIL_REGEX).test(emailStr);
    }
  };

  _.extend(ko.bindingHandlers, {
    'fadeIf': {
      init: function(element, valueAccessor) {
        var opacity, predicate, value, _ref, _ref2;
        value = unwrap(valueAccessor());
        if (_.isBoolean(value)) {
          value = {
            'if': value
          };
        }
        if (!_.isObject(value)) value = {};
        predicate = unwrap((_ref = value['if']) != null ? _ref : false);
        opacity = unwrap((_ref2 = value.opacity) != null ? _ref2 : 0.25);
        if (!_.isBoolean(predicate)) predicate = false;
        if (!_.isNumber(opacity)) opacity = 0.25;
        if (!predicate) {
          return $(element).stop().css({
            'opacity': 1
          });
        } else {
          return $(element).stop().css({
            'opacity': opacity
          });
        }
      },
      update: function(element, valueAccessor) {
        var duration, onHidden, onVisible, opacity, predicate, value, _ref, _ref2, _ref3, _ref4, _ref5;
        value = unwrap(valueAccessor());
        if (_.isBoolean(value)) {
          value = {
            'if': value
          };
        }
        if (!_.isObject(value)) value = {};
        predicate = unwrap((_ref = value['if']) != null ? _ref : false);
        duration = unwrap((_ref2 = value.duration) != null ? _ref2 : 250);
        opacity = unwrap((_ref3 = value.opacity) != null ? _ref3 : 0.25);
        onHidden = unwrap((_ref4 = value.onHidden) != null ? _ref4 : (function() {}));
        onVisible = unwrap((_ref5 = value.onVisible) != null ? _ref5 : (function() {}));
        if (!_.isBoolean(predicate)) predicate = false;
        if (!_.isNumber(duration)) duration = 250;
        if (!_.isNumber(opacity)) opacity = 0.25;
        if (!_.isFunction(onHidden)) onHidden = (function() {});
        if (!_.isFunction(onVisible)) onVisible = (function() {});
        if (!predicate) {
          return $(element).stop().animate({
            'opacity': 1
          }, duration, onVisible);
        } else {
          return $(element).stop().animate({
            'opacity': opacity
          }, duration, onHidden);
        }
      }
    },
    'fadeVisible': {
      init: function(element, valueAccessor) {
        var $element, opacity, predicate, value, _ref, _ref2;
        $element = $(element);
        value = unwrap(valueAccessor());
        if (_.isBoolean(value)) {
          value = {
            'if': value
          };
        }
        if (!_.isObject(value)) value = {};
        $element.data("__fade_visible_original_display__", $element.css("display"));
        predicate = (_ref = unwrap(value['if'])) != null ? _ref : false;
        if (!_.isBoolean(predicate)) predicate = false;
        if (!predicate) {
          opacity = unwrap((_ref2 = value.opacity) != null ? _ref2 : 0);
          if (!_.isNumber(opacity)) opacity = 0;
          $element.css({
            "opacity": opacity
          });
          if (opacity === 0) {
            return $element.css({
              "display": "none"
            });
          }
        }
      },
      update: function(element, valueAccessor) {
        var duration, onHidden, onVisible, opacity, original_display, predicate, value, _ref, _ref2, _ref3, _ref4, _ref5;
        value = unwrap(valueAccessor());
        if (_.isBoolean(value)) {
          value = {
            'if': value
          };
        }
        if (!_.isObject(value)) value = {};
        predicate = (_ref = unwrap(value['if'])) != null ? _ref : false;
        duration = (_ref2 = unwrap(value.duration)) != null ? _ref2 : 150;
        opacity = (_ref3 = unwrap(value.opacity)) != null ? _ref3 : 0;
        onHidden = (_ref4 = unwrap(value.onHidden)) != null ? _ref4 : (function() {});
        onVisible = (_ref5 = unwrap(value.onVisible)) != null ? _ref5 : (function() {});
        if (!_.isBoolean(predicate)) predicate = false;
        if (!_.isNumber(duration)) duration = 150;
        if (!_.isNumber(opacity)) opacity = 0;
        if (!_.isFunction(onHidden)) onHidden = (function() {});
        if (!_.isFunction(onVisible)) onVisible = (function() {});
        if (predicate) {
          original_display = $(element).data("__fade_visible_original_display__");
          if (original_display === 'none') original_display = "";
          return $(element).stop().css({
            'display': original_display
          }).animate({
            "opacity": 1
          }, duration, onVisible);
        } else {
          return $(element).stop().animate({
            "opacity": opacity
          }, duration, function() {
            if (opacity === 0) {
              $(this).css({
                'display': 'none'
              });
            }
            return onHidden.apply(null, arguments);
          });
        }
      }
    },
    'slideVisible': {
      init: function(element, valueAccessor) {
        var predicate, value, _ref;
        value = unwrap(valueAccessor());
        if (_.isBoolean(value)) {
          value = {
            'if': value
          };
        }
        if (!_.isObject(value)) value = {};
        predicate = unwrap((_ref = value['if']) != null ? _ref : false);
        if (predicate) {
          return $(element).slideDown(0);
        } else {
          return $(element).slideUp(0);
        }
      },
      update: function(element, valueAccessor) {
        var duration, onHidden, onVisible, predicate, value, _ref, _ref2, _ref3, _ref4;
        value = unwrap(valueAccessor());
        if (_.isBoolean(value)) {
          value = {
            'if': value
          };
        }
        if (!_.isObject(value)) value = {};
        predicate = unwrap((_ref = value['if']) != null ? _ref : false);
        duration = unwrap((_ref2 = value.duration) != null ? _ref2 : 250);
        onHidden = unwrap((_ref3 = value.onHidden) != null ? _ref3 : (function() {}));
        onVisible = unwrap((_ref4 = value.onVisible) != null ? _ref4 : (function() {}));
        if (!_.isBoolean(predicate)) predicate = false;
        if (!_.isNumber(duration)) duration = 250;
        if (!_.isFunction(onHidden)) onHidden = (function() {});
        if (!_.isFunction(onVisible)) onVisible = (function() {});
        if (predicate) {
          return $(element).slideDown(duration, onVisible);
        } else {
          return $(element).slideUp(duration, onHidden);
        }
      }
    },
    'gmap': {
      init: function(element, valueAccessor) {
        var $element, height, lat, lng, map, mapType, mapTypeControl, marker, markers, markers_array, options, src, updateLatLng, width, zoom, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
        $element = $(element);
        options = valueAccessor();
        if (!_.isObject(options)) options = {};
        if (options.lat == null) options.lat = 0;
        if (options.lng == null) options.lng = 0;
        lat = unwrap((_ref = options.lat) != null ? _ref : 0);
        lng = unwrap((_ref2 = options.lng) != null ? _ref2 : 0);
        zoom = unwrap((_ref3 = options.zoom) != null ? _ref3 : 9);
        mapType = unwrap((_ref4 = options.mapType) != null ? _ref4 : google.maps.MapTypeId.ROADMAP);
        mapTypeControl = unwrap((_ref5 = options.mapTypeControl) != null ? _ref5 : false);
        markers = (_ref6 = unwrap(options.markers)) != null ? _ref6 : {};
        if (!_.isNumber(lat)) lat = 0;
        if (!_.isNumber(lng)) lng = 0;
        if (!_.isNumber(zoom)) zoom = 6;
        if (!_.isString(mapType)) mapType = google.maps.MapTypeId.ROADMAP;
        if (!_.isBoolean(mapTypeControl)) mapTypeControl = false;
        if (!_.isObject(markers)) markers = {};
        if (markers.collection == null) markers.collection = [];
        $element.addClass("gmap");
        if ($element.is("img")) {
          element = $(element);
          height = parseInt(element.height());
          width = parseInt(element.width());
          if (height <= 0) height = 125;
          if (width <= 0) width = 250;
          src = "http://maps.googleapis.com/maps/api/staticmap?sensor=false";
          src += "&center=" + lat + "," + lng;
          src += "&maptype=" + mapType;
          src += "&size=" + width + "x" + height;
          src += "&zoom=" + zoom;
          src += "&markers=color:blue|size:mid|" + lat + "," + lng;
          return element.attr({
            "src": src
          });
        } else {
          map = new google.maps.Map(element, {
            center: new google.maps.LatLng(lat, lng),
            zoom: zoom,
            mapTypeId: mapType,
            mapTypeControl: mapTypeControl
          });
          $element.data("gmap", map);
          marker = new google.maps.Marker({
            'autoPan': true,
            'draggable': true,
            'position': new google.maps.LatLng(lat, lng),
            'map': map,
            'icon': new google.maps.MarkerImage("http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png")
          });
          updateLatLng = function() {
            var position;
            position = marker.getPosition();
            lat = position.lat();
            lng = position.lng();
            if (ko.isObservable(options.lat)) options.lat(lat);
            if (ko.isObservable(options.lng)) return options.lng(lng);
          };
          ko.computed(function() {
            var _ref7, _ref8;
            lat = (_ref7 = unwrap(options.lat)) != null ? _ref7 : 0;
            lng = (_ref8 = unwrap(options.lng)) != null ? _ref8 : 0;
            map.panTo(new google.maps.LatLng(lat, lng));
            return marker.setPosition(new google.maps.LatLng(lat, lng));
          }).extend({
            throttle: 1
          });
          if (Falcon.isCollection(markers.collection)) {
            /*
            					markers_array = []
            					marker_timeouts = []
            					ko.computed( ->
            						#Clear the old markers
            						clearTimeout( t ) for t in marker_timeouts
            						m.setMap(null) for m in markers_array
            
            						marker_timeouts = []
            						markers_array = []
            
            						#iterate over the collection and generate new markers
            						markers.collection.each (m) ->
            							marker_timeouts.push setTimeout ( ->
            								lat = unwrap( m.lat )
            								lng = unwrap( m.lng )
            								markers_array.push( new google.maps.Marker({
            									'autoPan': true
            									'draggable': false
            									'position': new google.maps.LatLng( lat, lng )
            									'color': 'blue'
            									'size': 'small'
            									'animation': google.maps.Animation.DROP
            									'map': map
            								}) )
            							), marker_timeouts.length * 50
            							
            						#END each
            					).extend(throttle: 1) #END computed
            */
            markers_array = [];
            ko.computed(function() {
              var m, _i, _len;
              for (_i = 0, _len = markers_array.length; _i < _len; _i++) {
                m = markers_array[_i];
                m.setMap(null);
              }
              markers_array = [];
              return markers.collection.each(function(m) {
                lat = unwrap(m.lat);
                lng = unwrap(m.lng);
                return markers_array.push(new google.maps.Marker({
                  'autoPan': true,
                  'draggable': false,
                  'position': new google.maps.LatLng(lat, lng),
                  'color': 'blue',
                  'size': 'small',
                  'map': map
                }));
              });
            }).extend({
              throttle: 1
            });
          }
          google.maps.event.addListener(map, 'drag', updateLatLng);
          google.maps.event.addListener(map, 'zoom', updateLatLng);
          google.maps.event.addListener(map, 'mouseup', updateLatLng);
          google.maps.event.addListener(marker, 'mouseup', updateLatLng);
          if ((options.update != null) && _.isFunction(options.update)) {
            return google.maps.event.addListener(marker, 'mouseup', options.update);
          }
        }
      }
    },
    'tooltip': {
      update: function(element, valueAccessor) {
        var options;
        options = unwrap(valueAccessor());
        if (_.isString(options)) {
          options = {
            title: options
          };
        }
        if (!_.isObject(options)) options = {};
        return $(element).tooltip(options);
      }
    },
    'navigate': {
      update: function(element, valueAccessor) {
        var doUpdate, event, key, params, url, value, _ref, _ref2, _ref3, _ref4;
        value = unwrap(valueAccessor());
        if (_.isString(value)) {
          value = {
            url: value
          };
        }
        if (!_.isObject(value)) value = {};
        url = unwrap((_ref = value.url) != null ? _ref : "");
        params = unwrap((_ref2 = value.params) != null ? _ref2 : {});
        event = unwrap((_ref3 = value.event) != null ? _ref3 : "");
        doUpdate = unwrap((_ref4 = value.doUpdate) != null ? _ref4 : false);
        if (!_.isString(url)) url = "";
        if (!_.isObject(params)) params = {};
        if (!_.isString(event)) event = "click";
        if (!_.isBoolean(doUpdate)) doUpdate = false;
        event = _.isEmpty(event) ? "click" : event.toLowerCase();
        for (key in params) {
          value = params[key];
          params[key] = unwrap(value);
        }
        return $(element).on(event, function() {
          if (_.isEmpty(url)) {
            return Finch.navigate(params, doUpdate);
          } else if (_.isEmpty(params)) {
            return Finch.navigate(url, doUpdate);
          } else {
            return Finch.navigate(url, params, doUpdate);
          }
        });
      }
    },
    'avatar': {
      update: function(element, valueAccessor) {
        var def, email, email_hash, facebook_id, options, picture_url, rating, size, src, value, _ref;
        value = unwrap(valueAccessor());
        options = {};
        if (value != null) {
          facebook_id = unwrap(value.facebook_id);
          email = unwrap(value.email);
          picture_url = unwrap(value.picture_url);
          if ((facebook_id != null) && /^[0-9]+$/gi.test(facebook_id.toString())) {
            options.facebook_id = facebook_id;
          }
          if ((email != null) && Helpers.isEmail(email)) options.email = email;
          if (picture_url && _.isSting(picture_url)) {
            options.picture_url = picture_url;
          }
        }
        size = (_ref = $(element).height()) != null ? _ref : 50;
        if (!(size > 0)) size = 50;
        if (options.picture_url != null) {
          src = options.picture_url;
        } else if (options.facebook_id != null) {
          src = "http://graph.facebook.com/" + options.facebook_id + "/picture";
        } else if (options.email != null) {
          email = options.email;
          def = "mm";
          rating = "";
          if (!_.isString(email)) email = "unknown@unknown.com";
          if (!_.isString(def)) def = "mm";
          if (!_.isString(rating)) rating = "";
          email_hash = hex_md5($.trim(email).toLowerCase());
          src = "http://www.gravatar.com/avatar/" + email_hash + "?";
          if (!_.isEmpty(def)) src += "d=" + def + "&";
          if (!_.isEmpty(rating)) src += "r=" + rating + "&";
          if (size != null) src += "s=" + size + "&";
        } else {
          src = "./images/default-avatar.png";
        }
        return $(element).attr({
          'src': src
        });
      }
    },
    'src': {
      update: function(element, valueAccessor) {
        var $element, value;
        $element = $(element);
        value = unwrap(valueAccessor());
        if (!_.isString(value)) value = "";
        if (_.isEmpty(value)) value = "./images/default-avatar.png";
        return $element.attr({
          "src": value
        });
      }
    },
    'placeholder': {
      update: function(element, valueAccessor) {
        var value;
        value = unwrap(valueAccessor());
        if (!_.isString(value)) value = "";
        $(element).attr("placeholder", value).placeholder();
      }
    },
    'autoresize': {
      init: function(element, valueAccessor) {
        var $element, $hiddenDiv, $textarea, maxHeight, minHeight, value, _ref;
        value = unwrap(valueAccessor());
        if (_.isNumber(value)) {
          value = {
            maxHeight: value
          };
        }
        if (!_.isObject(value)) {
          value = {
            maxHeight: 0
          };
        }
        $element = $(element);
        $textarea = $element.is("textarea") ? $element : $element.find("textarea").first();
        $hiddenDiv = $("<div/>");
        $textarea.css("overflow", "hidden").after($hiddenDiv);
        minHeight = Math.max($textarea.height(), $textarea.outerHeight());
        maxHeight = (_ref = parseInt(value.maxHeight)) != null ? _ref : 0;
        if (maxHeight < 0) maxHeight = 0;
        $hiddenDiv.css({
          'display': 'none',
          'background-color': "#000000",
          'white-space': 'pre-wrap',
          'word-wrap': 'break-word',
          'font-size': $textarea.css("font-size"),
          'font-family': $textarea.css("font-family")
        });
        return $textarea.keyup(function(event) {
          var height, html;
          html = $textarea.val().replace(/\r?\n/g, "<br/>");
          if (event.which === 13) html += "<br/>";
          $hiddenDiv.html(html);
          height = Math.max(minHeight, $hiddenDiv.height());
          if (maxHeight > 0) {
            height = Math.min(maxHeight, height);
            if (height === maxHeight) $textarea.css("overflow", "auto");
          } else {
            $textarea.css("overflow", "hidden");
          }
          return $textarea.height(height);
        });
      }
    },
    'stopEvent': {
      'init': function(element, valueAccessor) {
        var $element, value;
        $element = $(element);
        value = unwrap(valueAccessor());
        if (!_.isString(value)) value = "";
        if (_.isEmpty(value)) return;
        $element.on(value, function(event) {
          return event.stopPropagation();
        });
      }
    },
    'submitOnEnter': {
      init: function(element, valueAccessor, allBindingsAccessor) {
        var $element, val, value;
        value = valueAccessor();
        $element = $(element);
        val = allBindingsAccessor().value;
        return $element.keydown(function(event) {
          if (!unwrap(value)) return;
          if (event.keyCode === Falcon.Event.ENTER_KEY && !event.shiftKey) {
            event.preventDefault();
            if (ko.isWriteableObservable(val)) val($element.val());
            return $element.parents("form").first().submit();
          }
        });
      }
    },
    'chosen': {
      init: function(element) {
        var _ref;
        ((_ref = ko.bindingHandlers['options']['init']) != null ? _ref : (function() {})).apply(null, arguments);
        $(element).chosen();
      },
      update: function(element) {
        var _ref;
        ((_ref = ko.bindingHandlers['options']['update']) != null ? _ref : (function() {})).apply(null, arguments);
        $(element).trigger("liszt:updated");
      }
    },
    'selectOnFocus': {
      init: function(element) {
        return $(element).on("focus", function() {
          var _this = this;
          return _.defer(function() {
            return _this.select();
          });
        });
      }
    },
    'keyupValue': {
      init: function(element, valueAccessor) {
        var $element, delay, obs, value;
        $element = $(element);
        value = valueAccessor();
        if (ko.isObservable(value)) {
          value = {
            observable: value
          };
        }
        if (!_.isObject(value)) return;
        obs = value.observable;
        delay = unwrap(value.delay);
        if (!ko.isWriteableObservable(obs)) return;
        if (!_.isNumber(delay)) delay = 100;
        if (delay < 0) delay = 0;
        delay = Math.floor(delay);
        if (delay === 0) {
          return $element.keyup(function() {
            return obs($element.val());
          });
        } else {
          return $element.keyup(function() {
            var _val;
            _val = $element.val();
            return _.delay(function() {
              var val;
              val = $element.val();
              if (val === _val) return obs($element.val());
            }, delay);
          });
        }
      },
      update: function(element, valueAccessor) {
        var $element, val, value;
        $element = $(element);
        val = $element.val();
        value = unwrap(valueAccessor());
        if (val !== value) return $(element).val(value);
      }
    },
    'areachart': {
      update: function(element, valueAccessor) {
        var chart, report;
        if (typeof google === "undefined" || google === null) return;
        report = unwrap(valueAccessor());
        if (!(report instanceof Falcon.Report)) return;
        chart = new google.visualization.AreaChart(element);
        return report.request(chart);
      }
    },
    'linechart': {
      update: function(element, valueAccessor) {
        var chart, report;
        if (typeof google === "undefined" || google === null) return;
        report = unwrap(valueAccessor());
        if (!(report instanceof Falcon.Report)) return;
        chart = new google.visualization.LineChart(element);
        return report.request(chart);
      }
    },
    'piechart': {
      update: function(element, valueAccessor) {
        var chart, report;
        if (typeof google === "undefined" || google === null) return;
        report = unwrap(valueAccessor());
        if (!(report instanceof Falcon.Report)) return;
        chart = new google.visualization.PieChart(element);
        return report.request(chart);
      }
    },
    'datepicker': {
      init: function(element, valueAccessor) {
        var $element, value;
        $element = $(element);
        value = valueAccessor();
        return $element.datepicker({
          numberOfMonths: 2,
          onSelect: function(dateTxt) {
            return value(dateTxt);
          }
        });
      }
    },
    'daterangepicker': {
      init: function(element, valueAccessor) {
        var $element, value, _updateDateRange;
        $element = $(element);
        value = unwrap(valueAccessor());
        if (!_.isObject(value)) value = {};
        if (!_.isFunction(value.start)) value.start = (function() {});
        if (!_.isFunction(value.end)) value.end = (function() {});
        _updateDateRange = function() {
          var end, start;
          start = unwrap(value.start);
          end = unwrap(value.end);
          return $element.find(".date-picker-field").html(Globalize.format(start, "MMMM d, yyyy") + " - " + Globalize.format(end, "MMMM d, yyyy"));
        };
        $element.daterangepicker({
          ranges: {
            'Today': ['today', 'today'],
            'Yesterday': ['yesterday', 'yesterday'],
            'Last 7 Days': [
              Date.today().add({
                days: -6
              }), 'today'
            ],
            'Last 30 Days': [
              Date.today().add({
                days: -29
              }), 'today'
            ],
            'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
            'Last Month': [
              Date.today().moveToFirstDayOfMonth().add({
                months: -1
              }), Date.today().moveToFirstDayOfMonth().add({
                days: -1
              })
            ]
          }
        }, function(s, e) {
          value.start(s);
          value.end(e);
          return _updateDateRange();
        });
        return _updateDateRange();
      }
    },
    'timepicker': (function() {
      var defaultTime, times;
      times = [['03:00', '3:00 AM'], ['03:15', '3:15 AM'], ['03:30', '3:30 AM'], ['03:45', '3:45 AM'], ['04:00', '4:00 AM'], ['04:15', '4:15 AM'], ['04:30', '4:30 AM'], ['04:45', '4:45 AM'], ['05:00', '5:00 AM'], ['05:15', '5:15 AM'], ['05:30', '5:30 AM'], ['05:45', '5:45 AM'], ['06:00', '6:00 AM'], ['06:15', '6:15 AM'], ['06:30', '6:30 AM'], ['06:45', '6:45 AM'], ['07:00', '7:00 AM'], ['07:15', '7:15 AM'], ['07:30', '7:30 AM'], ['07:45', '7:45 AM'], ['08:00', '8:00 AM'], ['08:15', '8:15 AM'], ['08:30', '8:30 AM'], ['08:45', '8:45 AM'], ['09:00', '9:00 AM'], ['09:15', '9:15 AM'], ['09:30', '9:30 AM'], ['09:45', '9:45 AM'], ['10:00', '10:00 AM'], ['10:15', '10:15 AM'], ['10:30', '10:30 AM'], ['10:45', '10:45 AM'], ['11:00', '11:00 AM'], ['11:15', '11:15 AM'], ['11:30', '11:30 AM'], ['11:45', '11:45 AM'], ['12:00', '12:00 PM'], ['12:15', '12:15 PM'], ['12:30', '12:30 PM'], ['12:45', '12:45 PM'], ['13:00', '1:00 PM'], ['13:15', '1:15 PM'], ['13:30', '1:30 PM'], ['13:45', '1:45 PM'], ['14:00', '2:00 PM'], ['14:15', '2:15 PM'], ['14:30', '2:30 PM'], ['14:45', '2:45 PM'], ['15:00', '3:00 PM'], ['15:15', '3:15 PM'], ['15:30', '3:30 PM'], ['15:45', '3:45 PM'], ['16:00', '4:00 PM'], ['16:15', '4:15 PM'], ['16:30', '4:30 PM'], ['16:45', '4:45 PM'], ['17:00', '5:00 PM'], ['17:15', '5:15 PM'], ['17:30', '5:30 PM'], ['17:45', '5:45 PM'], ['18:00', '6:00 PM'], ['18:15', '6:15 PM'], ['18:30', '6:30 PM'], ['18:45', '6:45 PM'], ['19:00', '7:00 PM'], ['19:15', '7:15 PM'], ['19:30', '7:30 PM'], ['19:45', '7:45 PM'], ['20:00', '8:00 PM'], ['20:15', '8:15 PM'], ['20:30', '8:30 PM'], ['20:45', '8:45 PM'], ['21:00', '9:00 PM'], ['21:15', '9:15 PM'], ['21:30', '9:30 PM'], ['21:45', '9:45 PM'], ['22:00', '10:00 PM'], ['22:15', '10:15 PM'], ['22:30', '10:30 PM'], ['22:45', '10:45 PM'], ['23:00', '11:00 PM'], ['23:15', '11:15 PM'], ['23:30', '11:30 PM'], ['23:45', '11:45 PM'], ['00:00', '12:00 AM'], ['00:15', '12:15 AM'], ['00:30', '12:30 AM'], ['00:45', '12:45 AM'], ['01:00', '1:00 AM'], ['01:15', '1:15 AM'], ['01:30', '1:30 AM'], ['01:45', '1:45 AM'], ['02:00', '2:00 AM'], ['02:15', '2:15 AM'], ['02:30', '2:30 AM'], ['02:45', '2:45 AM']];
      defaultTime = '16:00';
      return {
        init: function(element, valueAccessor) {
          var $element, value, _i, _len, _time;
          $element = $(element);
          $element.empty();
          for (_i = 0, _len = times.length; _i < _len; _i++) {
            _time = times[_i];
            $element.append($("<option value='" + _time[0] + "'>" + _time[1] + "</option>"));
          }
          $element.val(defaultTime);
          value = valueAccessor();
          if (ko.isWriteableObservable(value)) {
            return $element.change(function(event) {
              return value($element.val());
            });
          }
        },
        update: function(element, valueAccessor) {
          var $element, time;
          $element = $(element);
          time = unwrap(valueAccessor());
          if (_.isString(time)) {
            try {
              time = Date.parse(time);
            } catch (e) {

            }
          }
          if (!(time instanceof Date)) return;
          return $element.val(time.toString('HH:mm'));
        }
      };
    })(),
    'number': {
      'update': function(element, valueAccessor) {
        var value;
        value = unwrap(valueAccessor());
        value *= 1;
        return $(element).text(Globalize.format(value, 'n0'));
      }
    },
    'currency': {
      'update': function(element, valueAccessor) {
        var format, value;
        value = unwrap(valueAccessor());
        value *= 1;
        format = value === Math.floor(value) ? 'c0' : 'c';
        return $(element).text(Globalize.format(value, format));
      }
    }
  });

  ko.extenders["date"] = function(target, options) {
    return ko.computed({
      read: function() {
        var date;
        date = target();
        if (!_.isDate(date)) return date;
        return date.toString("MM/dd/yyyy");
      },
      write: function(dateStr) {
        var date;
        if (_.isDate(dateStr)) date = dateStr;
        if (_.isString(dateStr)) date = Date.parse(dateStr);
        return target(_.isDate(date) && !_.isNaN(date.getTime()) ? date : null);
      }
    });
  };

  ko.extenders["phone"] = function(target, options) {
    ko.computed(function() {
      var val;
      val = unwrap(target);
      if (!_.isString(val)) val = "";
      return target(val.replace(/[^0-9]/gi, ""));
    });
    target.formatted = ko.computed({
      read: function() {
        var firstPiece, secondPiece, thirdPiece, val;
        val = target();
        if (!_.isString(val)) return "";
        if (val.length === 7) {
          firstPiece = val.slice(0, 3);
          secondPiece = val.slice(3, 6);
          return "" + secondPiece + "-" + thirdPiece;
        } else if (val.length === 10) {
          firstPiece = val.slice(0, 3);
          secondPiece = val.slice(3, 6);
          thirdPiece = val.slice(6, 10);
          return "(" + firstPiece + ") " + secondPiece + "-" + thirdPiece;
        } else {
          return val;
        }
      },
      write: function(value) {
        return target(value);
      }
    });
    return target;
  };

  ko.extenders["price"] = function(target, options) {
    target.formatted = ko.computed({
      read: function() {
        return Globalize.format(target(), "c");
      },
      write: function(value) {
        value = value + "";
        value = value.replace(/[^0-9\.\-]/gi, '');
        value = parseFloat(value);
        if (_.isNaN(value)) value = 0;
        return target(value);
      }
    });
    return target;
  };

  ko.extenders["enumerable"] = function(target, options) {
    var computed;
    if (!_.isObject(options)) options = {};
    computed = ko.computed({
      read: function() {
        return target();
      },
      write: function(newValue) {
        if (options[newValue] != null) return target(newValue);
      }
    });
    computed.subscribe = function(subscriber) {
      return target.subscribe(subscriber);
    };
    computed["enum"] = function() {
      return options;
    };
    return computed;
  };

  ko.extenders["transactable"] = function(target, options) {
    var last_value;
    last_value = ko.observable(target());
    target.has_changed = ko.computed(function() {
      return last_value() !== target();
    });
    target.commit = function() {
      return last_value(target());
    };
    target.rollback = function() {
      return target(last_value());
    };
    return target;
  };

  ko.extenders["errorable"] = function(target, options) {
    target.error = ko.observable("").extend({
      'throttle': 1
    });
    target.has_error = ko.computed(function() {
      return _.trim(target.error()).length > 0;
    });
    target.clear_error = function() {
      return target.error("");
    };
    return target;
  };

  ko.extenders['resetAfter'] = function(target, duration) {
    var originalValue;
    originalValue = ko.utils.unwrapObservable(target);
    target.subscribe(function(value) {
      if (value === originalValue) return;
      return setTimeout((function() {
        return target(originalValue);
      }), duration);
    });
    return target;
  };

  Falcon.baseApiUrl = "/api";

  Enum = this.Enum = {};

  this.Enum.PERMISSIONS = {
    "user": "user",
    "admin": "admin"
  };

  this.Enum.MAIN_VIEWS = {};

  Finch.route("/", {
    setup: function(bindings) {
      var _this = this;
      this.view = new LayoutView;
      $root(this.view);
      session.on("login", function() {
        return Finch.reload("/stream");
      });
      session.on("logout", function() {
        return Finch.call("/");
      });
      Finch.observe("query", function(query) {
        return _this.view.search_query(query);
      });
      if (session.is_logged_in()) return this.view.showContentView();
    },
    load: function() {
      if (session.is_logged_in()) {
        return Finch.navigate("/stream");
      } else {
        return this.view.showSplashView(new SplashView());
      }
    }
  });

  Finch.route("[/]stream", {
    setup: function() {
      var _this = this;
      if (!session.is_logged_in()) {
        Finch.abort();
        Finch.navigate('/');
        return;
      }
      this.view = new StreamView();
      this.parent.view.showContentView(this.view);
      return Finch.observe("query", function(query) {
        var _query;
        _query = _this.view.events.query();
        if (_query !== query) {
          _this.view.events.query(query);
          return _this.view._fetchEvents();
        }
      });
    },
    load: function() {
      if (!(this.view instanceof StreamView)) return;
      return this.view.showNearbyEvents();
    }
  });

  Finch.route("[/stream]/registered", function() {
    if (!(this.parent.view instanceof StreamView)) return;
    return this.parent.view.showRegisteredEvents();
  });

  Finch.route("[/stream]/invited", function() {
    if (!(this.parent.view instanceof StreamView)) return;
    return this.parent.view.showInvitedEvents();
  });

  Finch.route("[/stream]/park", function() {
    if (!(this.parent.view instanceof StreamView)) return;
    return this.parent.view.showLeagueEvents();
  });

  Finch.route("[/]event/:event_id", {
    setup: function(_arg) {
      var event_id;
      event_id = _arg.event_id;
      return this.view = new EventView(event_id);
    },
    load: function(_arg) {
      var event_id;
      event_id = _arg.event_id;
      return this.parent.view.showContentView(this.view);
    }
  });

  Finch.route("[/]relationships", {
    setup: function() {
      this.view = new RelationshipsView();
      return this.parent.view.showContentView(this.view);
    }
  });

  Finch.route("[/]settings", {
    setup: function() {
      this.view = new SettingsView();
      return this.parent.view.showContentView(this.view);
    },
    load: function() {
      return this.view.showProfile();
    }
  });

  Finch.route("[/settings]/password", function() {
    return this.parent.view.showPassword();
  });

  Finch.route("[/settings]/credit_card", function() {
    return this.parent.view.showCreditCard();
  });

  Finch.route("[/settings]/connect", function() {
    return this.parent.view.showConnect();
  });

  Finch.route("[/settings]/picture", function() {
    return this.parent.view.showPicture();
  });

  Finch.route("[/]statistics", {
    setup: function() {
      this.view = new StatisticsView;
      return this.parent.view.showContentView(this.view);
    }
  });

  Finch.route("[/]logout", {
    load: function() {
      return session.logout();
    }
  });

  $(document).ajaxError(function(event, xhr) {
    switch (xhr.status) {
      case 401:
        Finch.navigate("/logout");
        return event.stopPropogation();
    }
  });

  PagedCollection = (function(_super) {

    __extends(PagedCollection, _super);

    function PagedCollection() {
      var _page, _page_count, _page_size,
        _this = this;
      this.query = ko.observable("");
      this.page_loading = ko.observable(false);
      _page_count = ko.observable(0);
      this.page_count = ko.computed({
        read: function() {
          var page_count;
          page_count = _page_count();
          page_count = Math.max(0, _page_count);
          return page_count;
        },
        write: function(new_page_count) {
          new_page_count = parseInt(new_page_count);
          new_page_count = Math.max(0, new_page_count);
          return _page_count(new_page_count);
        }
      });
      _page = ko.observable(1);
      this.page = ko.computed({
        read: function() {
          var page;
          page = _page();
          page = Math.max(1, page);
          return page;
        },
        write: function(newPage) {
          newPage = parseInt(newPage);
          newPage = Math.max(1, newPage);
          return _page(newPage);
        }
      });
      _page_size = ko.observable(20);
      this.page_size = ko.computed({
        read: function() {
          var page_size, _ref;
          page_size = (_ref = _page_size()) != null ? _ref : 1;
          page_size = Math.max(1, page_size);
          return page_size;
        },
        write: function(newpage_size) {
          var _ref;
          newpage_size = (_ref = parseInt(newpage_size)) != null ? _ref : 1;
          newpage_size = Math.max(1, newpage_size);
          return _page_size(newpage_size);
        }
      });
      PagedCollection.__super__.constructor.apply(this, arguments);
    }

    PagedCollection.prototype.sync = function(type, options) {
      var _base, _base2, _base3,
        _this = this;
      if (options == null) options = {};
      if (options.params == null) options.params = {};
      if ((_base = options.params)['q'] == null) _base['q'] = this.query();
      if ((_base2 = options.params)['page'] == null) _base2['page'] = this.page();
      if ((_base3 = options.params)['per'] == null) {
        _base3['per'] = this.page_size();
      }
      if (_.isEmpty(options.params['q'])) delete options.params['q'];
      options.fill = false;
      options.success = function(collection, data) {
        return collection.fill(data.models);
      };
      return PagedCollection.__super__.sync.call(this, type, options);
    };

    PagedCollection.prototype.next = function(options) {
      this.page(this.page() + 1);
      this.sync("GET", options);
      return this;
    };

    PagedCollection.prototype.previous = function(options) {
      this.page(this.page() - 1);
      this.sync("GET", options);
      return this;
    };

    return PagedCollection;

  })(Falcon.Collection);

  Activity = (function(_super) {

    __extends(Activity, _super);

    function Activity() {
      Activity.__super__.constructor.apply(this, arguments);
    }

    Activity.prototype.url = "/activity";

    Activity.prototype.fields = {
      "mobile": "mobile",
      "name": "name",
      "original": "original",
      "thumbnail": "thumbnail"
    };

    return Activity;

  })(Falcon.Model);

  Session = (function(_super) {
    var _instance;

    __extends(Session, _super);

    _instance = null;

    Session.prototype.url = '/session';

    Session.prototype.fields = {
      "username": "username",
      "password": "password",
      "facebook_access_token": "facebook_access_token"
    };

    Session.prototype.loaded = false;

    Session.prototype.is_logged_in = false;

    Session.prototype.user = null;

    Session.prototype.errors = null;

    function Session(onload) {
      if (_instance instanceof Session) return _instance;
      _instance = this;
      this.is_logged_in = ko.observable(false);
      this.user = ko.observable(null);
      this.loaded = ko.observable(false);
      this.errors = {};
      this.username = ko.observable(null);
      this.password = ko.observable(null);
      this.facebook_access_token = ko.observable(null);
      Session.__super__.constructor.call(this);
      if (_.isFunction(onload)) {
        this.loaded.subscribe(function(isLoaded) {
          return (onload() === isLoaded && isLoaded === true);
        });
      }
      this.fetch();
    }

    Session.prototype._createUser = function(data) {
      var user;
      user = new User();
      user.map({
        'name': ko.observable(),
        'can_pay': ko.observable()
      });
      user.fill(data);
      return this.user(user);
    };

    Session.prototype.makeUrl = function() {
      return "" + Falcon.baseApiUrl + this.url;
    };

    Session.prototype.save = (function() {});

    Session.prototype.create = (function() {});

    Session.prototype.destroy = (function() {});

    Session.prototype.fetch = function() {
      var _this = this;
      this.sync('GET', {
        complete: function() {
          return _this.loaded(true);
        },
        success: function(model, data) {
          _this._createUser(data);
          return _this.is_logged_in(true);
        },
        error: function(model, resp) {
          _this.errors = resp;
          _this.is_logged_in(false);
          _this.user(null);
          return _this.trigger("error");
        }
      });
      return this;
    };

    Session.prototype._attemptLogin = function(fields, options) {
      var _this = this;
      if (!_.isObject(options)) options = {};
      if (!_.isFunction(options.success)) options.success = (function() {});
      if (!_.isFunction(options.error)) options.error = (function() {});
      if (!_.isFunction(options.complete)) options.complete = (function() {});
      this.sync('POST', {
        fields: fields,
        complete: function() {
          _this.loaded(true);
          return options.complete.apply(options, arguments);
        },
        success: function(model, data) {
          _this._createUser(data);
          _this.is_logged_in(true);
          _this.trigger("login");
          return options.success.apply(options, arguments);
        },
        error: function(model, resp) {
          _this.errors = resp;
          _this.is_logged_in(false);
          _this.trigger("error");
          return options.error.apply(options, arguments);
        }
      });
      return this;
    };

    Session.prototype.login = function(username, password, options) {
      this.clearFields();
      if (username != null) {
        username = unwrap(username);
        if (!_.isString(username)) username = "";
        this.username(_.trim(username));
      }
      if (password != null) {
        password = unwrap(password);
        if (!_.isString(password)) password = "";
        this.password(_.trim(password));
      }
      this._attemptLogin(["username", "password"], options);
      return this;
    };

    Session.prototype.facebookLogin = function(options) {
      var _this = this;
      if (!_.isObject(options)) options = {};
      if (!_.isFunction(options.facebook_complete)) {
        options.facebook_complete = (function() {});
      }
      if (!_.isFunction(options.facebook_success)) {
        options.facebook_success = (function() {});
      }
      if (!_.isFunction(options.facebook_error)) {
        options.facebook_error = (function() {});
      }
      this.clearFields();
      global.facebookLogin(function(response) {
        if (response.authResponse != null) {
          options.facebook_success.apply(options, arguments);
          _this.facebook_access_token(response.authResponse.accessToken);
          _this._attemptLogin(["facebook_access_token"], options);
        } else {
          options.facebook_error.apply(options, arguments);
        }
        return options.facebook_complete.apply(options, arguments);
      });
      return this;
    };

    Session.prototype.clearFields = function() {
      this.username(null);
      this.password(null);
      this.facebook_access_token(null);
      return this;
    };

    Session.prototype.logout = function() {
      var _this = this;
      this.sync('DELETE', {
        success: function() {
          _this.is_logged_in(false);
          _this.user(null);
          return _this.trigger("logout");
        }
      });
      return this;
    };

    return Session;

  })(Falcon.Model);

  User = (function(_super) {

    __extends(User, _super);

    function User() {
      User.__super__.constructor.apply(this, arguments);
    }

    User.prototype.url = "user";

    User.prototype.fields = {
      "name": "name",
      "email": "email",
      "username": "username",
      "gender": "gender",
      "dob": "birthday",
      "facebook_id": "facebook_id",
      "picture_url": "picture_url",
      "recieve_notifications": "recieve_notifications",
      "lat": "lat",
      "lng": "lng",
      "location": "location",
      "can_pay": "can_pay",
      "is_parent": "is_parent",
      "permissions": "permissions",
      "stripe_token": "stripe_token",
      "relations": "relations",
      "event_instructor": "event_instructor",
      "registrations": "registrations",
      "children_registrations": "children_registrations",
      "created_on": "created_on",
      "updated_on": "updated_on"
    };

    User.prototype.initialize = function() {
      this.relations = new Relationships();
      this.registrations = new EventRegistrations();
      return this.children_registrations = new EventRegistrations();
    };

    User.prototype.is_admin = function() {
      var permissions;
      permissions = this.get("permissions");
      if (!_.isString(permissions)) return false;
      return _.include(this.permissions.split(","), Enum.PERMISSIONS.admin);
    };

    User.prototype.first_name = function() {
      var name, _ref;
      name = this.get("name");
      if (!_.isString(name)) name = "";
      return (_ref = name.split(" ", 2)[0]) != null ? _ref : "";
    };

    User.prototype.all_registrations = function() {
      var cr, r;
      r = this.get("registrations").list();
      cr = this.get("children_registrations").list();
      return r.concat(cr);
    };

    return User;

  })(Falcon.Model);

  Event = (function(_super) {

    __extends(Event, _super);

    function Event() {
      Event.__super__.constructor.apply(this, arguments);
    }

    Event.prototype.url = "event";

    Event.prototype.fields = {
      "name": "name",
      "description": "description",
      "fee": "fee",
      "start_age": "start_age",
      "end_age": "end_age",
      "adult_only": "adult_only",
      "friend_count": "friend_count",
      "friends": "friends",
      "size": "size",
      "min": "min",
      "max": "max",
      "lat": "lat",
      "lng": "lng",
      "images": "images",
      "thumbnails": "thumbnails",
      "facility": "facility",
      "activity": "activity",
      "sessions": "sessions",
      "instructor": "instructor",
      "registrations": "registrations",
      "comments": "comments",
      "created_on": "created_on",
      "updated_on": "updated_on"
    };

    Event.prototype.initialize = function() {
      this.sessions = new EventSessions(this);
      this.registrations = new EventRegistrations(this);
      this.activity = new Activity();
      this.facility = new Facility();
      this.friends = new Users();
      this.instructor = new User();
      this.comments = new EventComments(this);
      this._start_date = null;
      return this._end_date = null;
    };

    Event.prototype.display_name = function() {
      var activity, activity_name, display_name, name;
      name = this.get("name");
      activity = this.get("activity");
      activity_name = activity instanceof Activity ? activity.get("name") : "";
      if (!_.isString(name)) name = "";
      if (!_.isString(activity_name)) activity_name = "";
      display_name = !_.isEmpty(name) ? name : activity_name;
      return _.trim(display_name);
    };

    Event.prototype.age_range = function() {
      var end_age, start_age, _ref, _ref2, _ref3;
      start_age = this.get("start_age");
      end_age = this.get("end_age");
      start_age = (_ref = parseInt(start_age)) != null ? _ref : -1;
      end_age = (_ref2 = parseInt(end_age)) != null ? _ref2 : -1;
      if (end_age < start_age) {
        _ref3 = [end_age, start_age], start_age = _ref3[0], end_age = _ref3[1];
      }
      if (start_age > -1 && end_age > -1) {
        return "" + start_age + " - " + end_age;
      } else if (start_age > -1) {
        return "" + start_age + "+";
      } else if (end_age > -1) {
        return "<" + end_age;
      } else {
        return "";
      }
    };

    Event.prototype.friend_count_string = function() {
      var friend_count;
      friend_count = unwrap(this.friend_count);
      if (!_.isNumber(friend_count)) friend_count = friends.length();
      if (friend_count !== 1) {
        return "" + friend_count + " friends signed up";
      } else {
        return "" + friend_count + " friend signed up";
      }
    };

    return Event;

  })(Falcon.Model);

  EventComment = (function(_super) {

    __extends(EventComment, _super);

    function EventComment() {
      EventComment.__super__.constructor.apply(this, arguments);
    }

    EventComment.prototype.url = 'comment';

    EventComment.prototype.fields = {
      "event": "event",
      "user": "user",
      "content": "content",
      "commented_at": "commented_at"
    };

    EventComment.prototype.initialize = function() {
      this.event = new Event();
      return this.user = new User();
    };

    return EventComment;

  })(Falcon.Model);

  EventSession = (function(_super) {

    __extends(EventSession, _super);

    function EventSession() {
      EventSession.__super__.constructor.apply(this, arguments);
    }

    EventSession.prototype.fields = {
      "event": "event"
    };

    EventSession.prototype.initialize = function() {
      return this.event = new Event();
    };

    return EventSession;

  })(Falcon.Model);

  EventRegistration = (function(_super) {

    __extends(EventRegistration, _super);

    function EventRegistration() {
      EventRegistration.__super__.constructor.apply(this, arguments);
    }

    EventRegistration.prototype.url = "registration";

    EventRegistration.prototype.fields = {
      "event": "event",
      "user": "user"
    };

    EventRegistration.prototype.initialize = function() {
      this.user = new User();
      return this.event = new Event();
    };

    return EventRegistration;

  })(Falcon.Model);

  Facility = (function(_super) {

    __extends(Facility, _super);

    function Facility() {
      Facility.__super__.constructor.apply(this, arguments);
    }

    Facility.prototype.url = "facility";

    Facility.prototype.fields = {};

    return Facility;

  })(Falcon.Model);

  Invite = (function(_super) {

    __extends(Invite, _super);

    function Invite() {
      Invite.__super__.constructor.apply(this, arguments);
    }

    Invite.prototype.url = 'invitation';

    Invite.prototype.fields = ["facebook_access_token", "facebook_id", "email", "message"];

    Invite.prototype.sendFacebook = function(facebook_id, message, options) {
      var access_token;
      access_token = unwrap(global.facebookAccessToken);
      if (!(access_token != null) || _.isEmpty(access_token)) {
        alert("You're not logged into facebook!");
        return;
      }
      this.set('facebook_access_token', access_token);
      this.set('message', message);
      this.set('facebook_id', facebook_id);
      if (_.isFunction(options)) {
        options = {
          complete: options
        };
      }
      if (!_.isObject(options)) options = {};
      options.fields = {
        "facebook_access_token": "facebook_access_token",
        "message": "message",
        "facebook_id": "facebook_id"
      };
      return this.create(options);
    };

    Invite.prototype.sendEmail = function(email, message, options) {
      this.set('message', message);
      this.set('email', email);
      if (_.isFunction(options)) {
        options = {
          complete: options
        };
      }
      if (!_.isObject(options)) options = {};
      options.fields = {
        "message": "message",
        "email": "email"
      };
      return this.create(options);
    };

    return Invite;

  })(Falcon.Model);

  Relationship = (function(_super) {

    __extends(Relationship, _super);

    function Relationship() {
      Relationship.__super__.constructor.apply(this, arguments);
    }

    Relationship.prototype.url = "user/relation";

    return Relationship;

  })(User);

  Activities = (function(_super) {

    __extends(Activities, _super);

    function Activities() {
      Activities.__super__.constructor.apply(this, arguments);
    }

    Activities.prototype.model = Activity;

    return Activities;

  })(Falcon.Collection);

  Users = (function(_super) {

    __extends(Users, _super);

    function Users() {
      Users.__super__.constructor.apply(this, arguments);
    }

    Users.prototype.model = User;

    return Users;

  })(Falcon.Collection);

  Events = (function(_super) {

    __extends(Events, _super);

    function Events() {
      Events.__super__.constructor.apply(this, arguments);
    }

    Events.prototype.model = Event;

    return Events;

  })(PagedCollection);

  EventComments = (function(_super) {

    __extends(EventComments, _super);

    function EventComments() {
      EventComments.__super__.constructor.apply(this, arguments);
    }

    EventComments.prototype.model = EventComment;

    return EventComments;

  })(Falcon.Collection);

  EventSessions = (function(_super) {

    __extends(EventSessions, _super);

    function EventSessions() {
      EventSessions.__super__.constructor.apply(this, arguments);
    }

    EventSessions.prototype.model = EventSession;

    return EventSessions;

  })(Falcon.Collection);

  EventRegistrations = (function(_super) {

    __extends(EventRegistrations, _super);

    function EventRegistrations() {
      EventRegistrations.__super__.constructor.apply(this, arguments);
    }

    EventRegistrations.prototype.model = EventRegistration;

    EventRegistrations.prototype.createFromUserAndDonation = function(user, donate, options) {
      var data;
      user = unwrap(user);
      if (!(user instanceof User)) return;
      donate = unwrap(donate);
      if (!_.isObject(options)) options = {};
      if (!_.isObject(data)) options.data = {};
      data = _.extend(options.data, user.serialize(["id"]));
      data['donate'] = donate;
      options.data = data;
      options.fields = ["id", "donate"];
      return this.create(new EventRegistration(), options);
    };

    return EventRegistrations;

  })(Falcon.Collection);

  Facilities = (function(_super) {

    __extends(Facilities, _super);

    function Facilities() {
      Facilities.__super__.constructor.apply(this, arguments);
    }

    Facilities.prototype.model = Facility;

    return Facilities;

  })(Falcon.Collection);

  Relationships = (function(_super) {

    __extends(Relationships, _super);

    function Relationships() {
      Relationships.__super__.constructor.apply(this, arguments);
    }

    Relationships.prototype.model = Relationship;

    return Relationships;

  })(Falcon.Collection);

  LayoutView = (function(_super) {

    __extends(LayoutView, _super);

    function LayoutView() {
      LayoutView.__super__.constructor.apply(this, arguments);
    }

    LayoutView.prototype.url = "/layout.tmpl";

    LayoutView.prototype.initialize = function() {
      this.content_view = ko.observable();
      this.splash_view = ko.observable();
      this.overlay_view = ko.observable();
      this.showing_content_view = ko.observable(false);
      this.showing_splash_view = ko.observable(false);
      this.showing_overlay_view = ko.observable(false);
      this.showing_user_options = ko.observable(false);
      this.showing_location_select = ko.observable(false);
      this.overlay_closed = ko.observable(true);
      return this.search_query = ko.observable();
    };

    LayoutView.prototype.current_location = function() {
      var city, state;
      city = unwrap(global.location.city);
      state = unwrap(global.location.state);
      if (!_.isString(city)) city = null;
      if (!_.isString(state)) state = null;
      if ((city != null) && (state != null)) {
        return "" + city + ", " + state;
      } else if (city != null) {
        return city;
      } else if (state != null) {
        return state;
      } else {
        return "";
      }
    };

    LayoutView.prototype._resetViewFlags = function() {
      this.showing_splash_view(false);
      this.showing_content_view(false);
      return this.showing_overlay_view(false);
    };

    LayoutView.prototype.showContentView = function(view) {
      var _this = this;
      if (!(view instanceof Falcon.View)) return;
      this._resetViewFlags();
      this.showing_content_view(true);
      this.content_view(view);
      return view.on("showOverlay", function(view) {
        return _this.showOverlayView(view);
      });
    };

    LayoutView.prototype.showSplashView = function(view) {
      if (!(view instanceof Falcon.View)) return;
      this._resetViewFlags();
      this.showing_splash_view(true);
      return this.splash_view(view);
    };

    LayoutView.prototype.showOverlayView = function(view) {
      var _this = this;
      if (!(view instanceof Falcon.View)) return;
      this.showing_overlay_view(true);
      this.overlay_closed(false);
      this.overlay_view(view);
      return view.on("close", function() {
        return _this.hideOverlayView();
      });
    };

    LayoutView.prototype.hideOverlayView = function() {
      this.showing_overlay_view(false);
      return this.overlay_closed(true);
    };

    LayoutView.prototype.toggleUserOptions = function() {
      this.showing_user_options(!this.showing_user_options());
      return this.showing_location_select(false);
    };

    LayoutView.prototype.toggleLocationSelect = function() {
      this.showing_location_select(!this.showing_location_select());
      return this.showing_user_options(false);
    };

    LayoutView.prototype.doSearch = function() {
      return Finch.navigate({
        "query": this.search_query()
      });
    };

    LayoutView.prototype.back = function() {
      return window.history.back();
    };

    return LayoutView;

  })(Falcon.View);

  EventView = (function(_super) {

    __extends(EventView, _super);

    function EventView() {
      EventView.__super__.constructor.apply(this, arguments);
    }

    EventView.prototype.url = "event.tmpl";

    EventView.prototype.initialize = function(event_id) {
      var _this = this;
      this.event = new Event({
        id: event_id
      });
      this.event_loading = ko.observable(false);
      this.showing_register = ko.observable(false);
      this.registerable_users = ko.computed(function() {
        var _me;
        _me = unwrap(me);
        if (!(_me instanceof User)) return [];
        return [_me].concat(_me.get("relations").list());
      });
      this.selected_registrants = ko.observableArray([]);
      this.registration_donate = ko.observable(false);
      this.registraion_loading = ko.observable(false);
      this.show_registration_success = ko.observable(false).extend({
        "resetAfter": 5000
      });
      this.registration_fee = ko.computed(function() {
        var fee, _ref;
        fee = (_ref = _this.event.get("fee")) != null ? _ref : 0;
        if (unwrap(_this.registration_donate) === true) fee += 1;
        fee = _this.selected_registrants().length * fee;
        return fee;
      });
      this.posting_message = ko.observable(false);
      this.new_message = ko.observable();
      this.event.map({
        activity: {
          original: ko.observable()
        }
      });
      return this._fetchEvent();
    };

    EventView.prototype._fetchEvent = function() {
      var _this = this;
      this.event_loading(true);
      return this.event.fetch({
        success: function(model, data) {
          var image;
          if ((data != null) && (data.activity != null) && (data.activity.original != null)) {
            image = new Image;
            image.onload = function() {
              return _this.event_loading(false);
            };
            image.src = data.activity.original;
          } else {
            _this.event_loading(false);
          }
          return console.log(_this.event.serialize());
        },
        error: function() {
          return _this.event_loading(false);
        }
      });
    };

    EventView.prototype.filtered_comments = function() {
      var comments;
      return comments = this.event.comments;
    };

    EventView.prototype.calculated_size = function() {
      var size;
      size = this.event.get("registrations").length();
      size *= 1;
      if (_.isNaN(size)) size = 0;
      return size + this.selected_registrants().length;
    };

    EventView.prototype.has_instructor = function() {
      return this.event.instructor.get("id") !== null;
    };

    EventView.prototype.is_instructor = function() {
      var _id, _me;
      _me = unwrap(me);
      if (!(_me instanceof User)) return false;
      _id = _me.get("id");
      if (!((_id != null) && _id > 0)) return false;
      return this.event.instructor.get("id") === _id;
    };

    EventView.prototype.showRegister = function() {
      return this.showing_register(true);
    };

    EventView.prototype.hideRegister = function() {
      return this.showing_register(false);
    };

    EventView.prototype.registrationEnabled = function() {
      return this.selected_registrants().length > 0;
    };

    EventView.prototype.registrantIsSelected = function(registrant) {
      var is_selected;
      is_selected = this.selected_registrants.indexOf(registrant) > -1;
      is_selected = is_selected || this.userIsRegistered(registrant);
      return is_selected;
    };

    EventView.prototype.toggleRegistrant = function(registrant) {
      var max;
      if (this.registrantIsSelected(registrant)) {
        if (this.userIsRegistered(registrant)) {
          return alert("This user is already registered for this event");
        } else {
          return this.selected_registrants.remove(registrant);
        }
      } else {
        max = this.event.get("max");
        if (max <= 0 || this.calculated_size() < max) {
          return this.selected_registrants.push(registrant);
        } else {
          return alert("Cannot allow more more people to join this event, it is full.");
        }
      }
    };

    EventView.prototype.registered_users = function() {
      var all_registrations, event_id, u, user_ids, users, _me,
        _this = this;
      _me = unwrap(me);
      if (!(_me instanceof User)) return [];
      users = this.registerable_users();
      event_id = this.event.get("id");
      all_registrations = _me.all_registrations();
      user_ids = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = users.length; _i < _len; _i++) {
          u = users[_i];
          if (Falcon.isModel(u)) _results.push(u.get("id"));
        }
        return _results;
      })();
      return _.filter(all_registrations, function(reg) {
        var is_event, is_user, _ref;
        if (!(reg instanceof EventRegistration)) return false;
        is_user = (_ref = reg.get("user").get("id"), __indexOf.call(user_ids, _ref) >= 0);
        is_event = reg.get("event").get("id") === event_id;
        return is_user && is_event;
      });
    };

    EventView.prototype.userIsRegistered = function(user) {
      var event_id, registrations, user_id, _me,
        _this = this;
      user = unwrap(user);
      if (!(user instanceof User)) return false;
      _me = unwrap(me);
      if (!(_me instanceof User)) return false;
      user_id = user.get("id");
      event_id = this.event.get("id");
      registrations = _me.all_registrations();
      return _.any(registrations, function(reg) {
        var is_event, is_user;
        if (!(reg instanceof EventRegistration)) return false;
        is_user = reg.get("user").get("id") === user_id;
        is_event = reg.get("event").get("id") === event_id;
        return is_user && is_event;
      });
    };

    EventView.prototype.register = function() {
      var registrant, registrants, registration_count, registrations, _complete, _i, _len, _results,
        _this = this;
      if (!this.registrationEnabled()) return;
      this.registraion_loading(true);
      registrants = this.selected_registrants();
      registration_count = registrants.length;
      registrations = this.event.get("registrations");
      _complete = function() {
        registration_count--;
        if (registration_count === 0) {
          _this.selected_registrants([]);
          _this.show_registration_success(true);
          return _this.registraion_loading(false);
        }
      };
      _results = [];
      for (_i = 0, _len = registrants.length; _i < _len; _i++) {
        registrant = registrants[_i];
        _results.push(registrations.createFromUserAndDonation(registrant, this.registration_donate, {
          complete: _complete,
          success: function(registration) {
            me().get("registrations").push(registration);
            return this.event.get("registrations").push(registration);
          }
        }));
      }
      return _results;
    };

    EventView.prototype.showInvite = function() {
      return this.trigger("showOverlay", new InviteView(this.event));
    };

    EventView.prototype.cancelNewMessage = function() {
      return this.new_message("");
    };

    EventView.prototype.postNewMessage = function() {
      var message, _ref,
        _this = this;
      if (!this.is_instructor()) return;
      message = _.trim((_ref = unwrap(this.new_message)) != null ? _ref : "");
      if (_.isEmpty(message)) {
        alert("Please enter a message");
        return;
      }
      this.posting_message(true);
      return this.event.comments.create({
        fields: ["content"],
        "content": message,
        complete: function() {
          return _this.posting_message(false);
        },
        success: function() {
          return _this.new_message("");
        },
        error: function() {
          return alert("An error occurred while trying to post your message");
        }
      });
    };

    return EventView;

  })(Falcon.View);

  InviteView = (function(_super) {
    var _fb_friends;

    __extends(InviteView, _super);

    function InviteView() {
      InviteView.__super__.constructor.apply(this, arguments);
    }

    InviteView.prototype.url = 'invite.tmpl';

    _fb_friends = null;

    InviteView.prototype.initialize = function(event) {
      var _this = this;
      this.fb_friends = ko.observableArray();
      this.fb_friends_count = ko.computed(function() {
        return _this.fb_friends().length;
      });
      this.fb_friend_query = ko.observable();
      this.loading_friends = ko.observable(false);
      this.message = ko.observable("");
      this.selected_friends = ko.observableArray();
      this.event = event;
      if (_fb_friends == null) {
        this.loading_friends(true);
        return FB.api("/me/friends", function(response) {
          _fb_friends = response.data;
          _this.fb_friends(_fb_friends);
          return _this.loading_friends(false);
        });
      } else {
        return this.fb_friends(_fb_friends);
      }
    };

    InviteView.prototype.filtered_fb_friends = function() {
      var f, friends, query, term, terms, _i, _len;
      friends = this.fb_friends();
      query = this.fb_friend_query();
      query = _.trim((query != null ? query : "").toString());
      query = query.replace(/\s\s+/, " ").toLowerCase();
      if (!_.isEmpty(query)) {
        terms = query.split(" ");
        for (_i = 0, _len = terms.length; _i < _len; _i++) {
          term = terms[_i];
          friends = (function() {
            var _j, _len2, _results;
            _results = [];
            for (_j = 0, _len2 = friends.length; _j < _len2; _j++) {
              f = friends[_j];
              if (f.name.toLowerCase().indexOf(term) > -1) _results.push(f);
            }
            return _results;
          })();
        }
      }
      friends = friends.sort(function(a, b) {
        var _a, _b;
        _a = _.trim(a.name.toLowerCase());
        _b = _.trim(b.name.toLowerCase());
        if (_a > _b) return 1;
        if (_a < _b) return -1;
        return 0;
      });
      return friends.slice(0, 31);
    };

    InviteView.prototype.friendIsSelected = function(fb_friend) {
      return this.selected_friends.indexOf(fb_friend) > -1;
    };

    InviteView.prototype.toggleFriend = function(fb_friend) {
      if (this.friendIsSelected(fb_friend)) {
        return this.selected_friends.remove(fb_friend);
      } else {
        return this.selected_friends.push(fb_friend);
      }
    };

    InviteView.prototype.send = function() {
      var friend, friends, invite, invite_count, _i, _len, _results,
        _this = this;
      friends = this.selected_friends();
      invite_count = friends.length;
      console.log(this.message());
      _results = [];
      for (_i = 0, _len = friends.length; _i < _len; _i++) {
        friend = friends[_i];
        invite = new Invite(this.event);
        _results.push(invite.sendFacebook(friend.id, this.message(), function() {
          invite_count--;
          if (invite_count <= 0) return _this.trigger("close");
        }));
      }
      return _results;
    };

    return InviteView;

  })(Falcon.View);

  RelationshipsView = (function(_super) {

    __extends(RelationshipsView, _super);

    function RelationshipsView() {
      RelationshipsView.__super__.constructor.apply(this, arguments);
    }

    RelationshipsView.prototype.url = "relationships.tmpl";

    RelationshipsView.prototype.initialize = function() {
      this.relationships = me().relations;
      this.new_relationship_message = ko.observable().extend({
        'errorable': true
      });
      this.new_relationship_fields = {
        'name': ko.observable().extend({
          'errorable': true
        }),
        'email': ko.observable().extend({
          'errorable': true
        }),
        'birthday': ko.observable().extend({
          'errorable': true
        }),
        'username': ko.observable().extend({
          'errorable': true
        }),
        'password': ko.observable().extend({
          'errorable': true
        }),
        'retype': ko.observable().extend({
          'errorable': true
        })
      };
      return this.showing_add_form = ko.observable(false);
    };

    RelationshipsView.prototype.showAddForm = function() {
      return this.showing_add_form(true);
    };

    RelationshipsView.prototype.hideAddForm = function() {
      this.new_relationship_message.clear_error();
      this.new_relationship_fields.name.clear_error();
      this.new_relationship_fields.email.clear_error();
      this.new_relationship_fields.birthday.clear_error();
      this.new_relationship_fields.username.clear_error();
      this.new_relationship_fields.password.clear_error();
      this.new_relationship_fields.retype.clear_error();
      this.new_relationship_fields.name("");
      this.new_relationship_fields.email("");
      this.new_relationship_fields.birthday("");
      this.new_relationship_fields.username("");
      this.new_relationship_fields.password("");
      this.new_relationship_fields.retype("");
      return this.showing_add_form(false);
    };

    RelationshipsView.prototype.addRelationship = function() {
      var birthday, email, has_errors, name, password, retype, username,
        _this = this;
      this.new_relationship_message.clear_error();
      this.new_relationship_fields.name.clear_error();
      this.new_relationship_fields.email.clear_error();
      this.new_relationship_fields.birthday.clear_error();
      this.new_relationship_fields.username.clear_error();
      this.new_relationship_fields.password.clear_error();
      this.new_relationship_fields.retype.clear_error();
      name = unwrap(this.new_relationship_fields.name);
      email = unwrap(this.new_relationship_fields.email);
      birthday = unwrap(this.new_relationship_fields.birthday);
      username = unwrap(this.new_relationship_fields.username);
      password = unwrap(this.new_relationship_fields.password);
      retype = unwrap(this.new_relationship_fields.retype);
      has_errors = false;
      if (!_.isString(name)) {
        this.new_relationship_fields.name.error("Name must be a string value");
        has_errors = true;
      }
      if (!_.isString(email)) {
        this.new_relationship_fields.email.error("Email address must be a string value");
        has_errors = true;
      }
      if (!_.isString(birthday)) {
        this.new_relationship_fields.birthday.error("Birthday address must be a string value");
        has_errors = true;
      }
      if (!_.isString(username)) {
        this.new_relationship_fields.username.error("Username must be a string value");
        has_errors = true;
      }
      if (!_.isString(password)) {
        this.new_relationship_fields.password.error("Password must be a string value");
        has_errors = true;
      }
      if (!_.isString(retype)) {
        this.new_relationship_fields.retype.error("Password retype must be a string value");
        has_errors = true;
      }
      if (has_errors) return;
      name = _.trim(name);
      email = _.trim(email);
      birthday = _.trim(birthday);
      username = _.trim(username);
      password = _.trim(password);
      retype = _.trim(retype);
      if (_.isEmpty(name)) {
        this.new_relationship_fields.name.error("Please enter a name");
        has_errors = true;
      }
      if (_.isEmpty(birthday)) {
        this.new_relationship_fields.birthday.error("Please enter a birthday");
        has_errors = true;
      }
      if (_.isEmpty(username)) {
        this.new_relationship_fields.name.error("Please enter a username");
        has_errors = true;
      }
      if (_.isEmpty(password)) {
        this.new_relationship_fields.name.error("Please enter a password");
        has_errors = true;
      }
      if (_.isEmpty(retype)) {
        this.new_relationship_fields.retype.error("Please enter a password retype");
        has_errors = true;
      }
      if (has_errors) return;
      try {
        birthday = Date.parse(birthday);
      } catch (e) {
        relationship.birthday.error("Please enter a valid birthday");
        has_errors = true;
      }
      if (has_errors) return;
      if (password !== retype) {
        this.new_relationship_message.error("Passwords do not match");
        has_errors = true;
      }
      if (has_errors) return;
      if (!(_.isEmpty(email) || Helpers.isEmail(email))) {
        relationship.password.error("Please enter a valid email address");
        has_errors = true;
      }
      if (has_errors) return;
      return this.relationships.create({
        name: name,
        username: username,
        email: email,
        password: password,
        year: birthday.getFullYear(),
        month: birthday.getMonth() + 1,
        day: birthday.getDate()
      }, {
        fields: ["name", "username", "email", "password", "year", "month", "day"],
        error: function() {
          return _this.new_relationship_message.error("An error occurred");
        },
        success: function() {
          console.log("Successfully added relationship");
          return _this.hideAddForm();
        }
      });
    };

    RelationshipsView.prototype.deleteRelationship = function(relationship) {
      if (!(relationship instanceof Relationship)) return;
      return this.relationships.destroy(relationship);
    };

    return RelationshipsView;

  })(Falcon.View);

  /*
  # Class: SettingsView
  #	A View for the settings page. Used to update user informaiton, change password, and update creditcard.
  */

  SettingsView = (function(_super) {

    __extends(SettingsView, _super);

    function SettingsView() {
      SettingsView.__super__.constructor.apply(this, arguments);
    }

    SettingsView.prototype.url = 'settings.tmpl';

    SettingsView.prototype.initialize = function() {
      var _this = this;
      this.showing_profile = ko.observable(false);
      this.showing_credit_card = ko.observable(false);
      this.showing_password = ko.observable(false);
      this.showing_picture = ko.observable(false);
      this.showing_connect = ko.observable(false);
      this.saving_settings = ko.observable(false);
      this.profile_fields = {
        'show_success': ko.observable(false).extend({
          "resetAfter": 5000
        }),
        'name': ko.observable().classify('errorable'),
        'email': ko.observable().classify('errorable'),
        'birthday': ko.observable().classify("date", "errorable")
      };
      ko.computed(function() {
        var _me;
        _me = unwrap(me);
        if (_me == null) return;
        _this.profile_fields['name'](_me.get("name"));
        _this.profile_fields['email'](_me.get("email"));
        return _this.profile_fields['birthday'](_me.get("birthday"));
      });
      this.credit_card_fields = {
        'show_success': ko.observable(false).extend({
          "resetAfter": 5000
        }),
        'number': ko.observable(),
        'expiration_month': ko.observable(),
        'expiration_year': ko.observable(),
        'cvc': ko.observable()
      };
      _.extend(this.credit_card_fields, {
        'formatted_number': ko.computed({
          read: function() {
            var first, fourth, number, second, third;
            number = unwrap(_this.credit_card_fields['number']);
            if (number != null) number = number.toString();
            if (!_.isString(number)) number = "";
            first = number.slice(0, 4);
            second = number.slice(4, 8);
            third = number.slice(8, 12);
            fourth = number.slice(12, 16);
            if (!_.isEmpty(second)) first += "-";
            if (!_.isEmpty(third)) second += "-";
            if (!_.isEmpty(fourth)) third += "-";
            return first + second + third + fourth;
          },
          write: function(value) {
            _this.credit_card_fields['number']("");
            if (value == null) value = "";
            value = value.toString();
            value = value.replace(/[^0-9]/gi, '').slice(0, 16);
            return _this.credit_card_fields['number'](value);
          }
        }),
        'formatted_expiration': ko.computed({
          read: function() {
            var month, year, _ref, _ref2;
            month = _.trim((_ref = unwrap(_this.credit_card_fields['expiration_month'])) != null ? _ref : "");
            year = _.trim((_ref2 = unwrap(_this.credit_card_fields['expiration_year'])) != null ? _ref2 : "");
            return (month.length > 0 && year.length > 0 ? "" + month + "/" + year : "");
          },
          write: function(value) {
            var month, year, _ref;
            _this.credit_card_fields['expiration_month']("");
            _this.credit_card_fields['expiration_year']("");
            value = value != null ? value.toString() : "";
            value = _.trim(value).replace(/[^0123456789\/]/gi, '');
            _ref = value.split("/", 2), month = _ref[0], year = _ref[1];
            if (year == null) year = "";
            year = year.replace(/[^0-9]/gi, '');
            month = month.slice(0, 2);
            year = year.slice(0, 4);
            month = parseInt(month, 10);
            year = parseInt(year, 10);
            if (month > 12) month = 12;
            if (month < 1) month = 1;
            if (year < 2000) year += 2000;
            if (year < (new Date).getFullYear()) year = (new Date).getFullYear();
            month = _.isNaN(month) ? "" : month.toString();
            year = _.isNaN(year) ? "" : year.toString();
            if (month.length === 1) month = "0" + month;
            _this.credit_card_fields['expiration_month'](month);
            return _this.credit_card_fields['expiration_year'](year);
          }
        }),
        'formatted_cvc': ko.computed({
          read: function() {
            return unwrap(_this.credit_card_fields['cvc']);
          },
          write: function(value) {
            _this.credit_card_fields['cvc']("");
            value = value != null ? value.toString() : "";
            value = value.replace(/[^0-9]/gi, '').slice(0, 3);
            return _this.credit_card_fields['cvc'](value);
          }
        })
      });
      this.credit_card_fields['formatted_number'].classify('errorable');
      this.credit_card_fields['formatted_expiration'].classify('errorable');
      return this.credit_card_fields['formatted_cvc'].classify('errorable');
    };

    SettingsView.prototype._resetFlags = function() {
      this.showing_profile(false);
      this.showing_credit_card(false);
      this.showing_password(false);
      this.showing_picture(false);
      return this.showing_connect(false);
    };

    SettingsView.prototype.showProfile = function() {
      this._resetFlags();
      return this.showing_profile(true);
    };

    SettingsView.prototype.showCreditCard = function() {
      this._resetFlags();
      return this.showing_credit_card(true);
    };

    SettingsView.prototype.showPassword = function() {
      this._resetFlags();
      return this.showing_password(true);
    };

    SettingsView.prototype.showConnect = function() {
      this._resetFlags();
      return this.showing_connect(true);
    };

    SettingsView.prototype.showPicture = function() {
      this._resetFlags();
      return this.showing_picture(true);
    };

    SettingsView.prototype.saveProfile = function() {
      var birthday, email, has_error, name, user, _me,
        _this = this;
      _me = unwrap(me);
      if (!(_me instanceof User)) return;
      this.profile_fields['name'].clear_error();
      this.profile_fields['email'].clear_error();
      this.profile_fields['birthday'].clear_error();
      name = unwrap(this.profile_fields['name']);
      email = unwrap(this.profile_fields['email']);
      birthday = unwrap(this.profile_fields['birthday']);
      has_error = false;
      if (name == null) {
        this.profile_fields['name'].error("Please enter a name.");
        has_error = true;
      }
      if (email == null) {
        this.profile_fields['email'].error("Please enter an email.");
        has_error = true;
      }
      if (has_error) return;
      if (_.isEmpty(name)) {
        this.profile_fields['name'].error("Please enter a name.");
        has_error = true;
      }
      if (_.isEmpty(email)) {
        this.profile_fields['email'].error("Please enter an email.");
        has_error = true;
      }
      if (has_error) return;
      if (!Helpers.isEmail(email)) {
        this.profile_fields['email'].error("Please enter a valid email.");
        has_error = true;
      }
      if (has_error) return;
      this.saving_settings(true);
      user = _me.clone();
      user.set("name", name);
      user.set("email", email);
      user.set("birthday", birthday);
      return user.save({
        fields: ["name", "email", "birthday"],
        complete: function() {
          return _this.saving_settings(false);
        },
        success: function() {
          _me.fill(user.serialize());
          return _this.profile_fields['show_success'](true);
        },
        error: function() {}
      });
    };

    SettingsView.prototype.saveCreditCard = function() {
      var cvc, expiration_month, expiration_year, has_error, number, _me,
        _this = this;
      _me = unwrap(me);
      if (!(_me instanceof User)) return;
      this.credit_card_fields['formatted_number'].clear_error();
      this.credit_card_fields['formatted_expiration'].clear_error();
      this.credit_card_fields['formatted_cvc'].clear_error();
      number = unwrap(this.credit_card_fields['number']);
      expiration_month = unwrap(this.credit_card_fields['expiration_month']);
      expiration_year = unwrap(this.credit_card_fields['expiration_year']);
      cvc = unwrap(this.credit_card_fields['cvc']);
      has_error = false;
      if (number == null) {
        this.credit_card_fields['formatted_number'].error("Please enter a valid card number.");
        has_error = true;
      }
      if (!((expiration_month != null) && (expiration_year != null))) {
        this.credit_card_fields['formatted_expiration'].error("Please enter a valid expiration date!");
        has_error = true;
      }
      if (cvc == null) {
        this.credit_card_fields['formatted_cvc'].error("Please enter a valid CVC code.");
        has_error = true;
      }
      if (has_error) return;
      if (!Stripe.validateCardNumber(number)) {
        this.credit_card_fields['formatted_number'].error("Please enter a valid card number.");
        has_error = true;
      }
      if (!Stripe.validateExpiry(expiration_month, expiration_year)) {
        this.credit_card_fields['formatted_expiration'].error("Please enter a valid expiration date.");
        has_error = true;
      }
      if (!Stripe.validateCVC(cvc)) {
        this.credit_card_fields['formatted_cvc'].error("Please enter a valid CVC code.");
        has_error = true;
      }
      if (has_error) return;
      this.saving_settings(true);
      return Stripe.createToken({
        'number': number,
        'cvc': cvc,
        'exp_month': expiration_month,
        'exp_year': expiration_year
      }, function(status, response) {
        var user;
        if (response.error) {
          _this.credit_card_fields['message'].error("An error occurred validating your credit card");
          return _this.saving_settings(false);
        } else {
          user = _me.clone();
          user.set("stripe_token", response['id']);
          return user.save({
            fields: ["stripe_token"],
            complete: function() {
              return _this.saving_settings(false);
            },
            success: function() {
              console.log(user.serialize());
              _me.fill(user.serialize());
              _this.credit_card_fields['formatted_number']("");
              _this.credit_card_fields['formatted_expiration']("");
              _this.credit_card_fields['formatted_cvc']("");
              return _this.credit_card_fields['show_success'](true);
            },
            error: function() {}
          });
        }
      });
    };

    return SettingsView;

  })(Falcon.View);

  StatisticsView = (function(_super) {

    __extends(StatisticsView, _super);

    function StatisticsView() {
      StatisticsView.__super__.constructor.apply(this, arguments);
    }

    StatisticsView.prototype.url = 'statistics.tmpl';

    StatisticsView.prototype.initialize = function() {
      var _this = this;
      this.users = ko.computed(function() {
        var _me;
        _me = unwrap(me);
        if (!(_me instanceof User)) return [];
        return [_me].concat(_me.get("relations").list());
      });
      this.selected_user = ko.observable(this.users()[0]);
      this.selected_event = ko.observable();
      this.selected_session = ko.observable();
      this.dropdown_is_open = ko.observable(false);
      this.session_dropdown_is_open = ko.observable(false);
      this.events = new Events();
      this.page_loading = ko.observable(true);
      return this._fetchEvents(function() {
        return _this.page_loading(false);
      });
    };

    StatisticsView.prototype.filtered_events = function() {
      var group, groups, selected_user;
      selected_user = unwrap(this.selected_user);
      if (selected_user == null) return [];
      groups = [];
      group = [];
      this.events.each(function(event, index) {
        if (index % 3 === 0) groups.push(group = []);
        return group.push(event);
      });
      return groups;
    };

    StatisticsView.prototype._fetchEvents = function(callback) {
      var params;
      if (!_.isFunction(callback)) callback = (function() {});
      params = {
        "f": "registered",
        "r": 5000,
        "page_size": 30
      };
      return this.events.fetch({
        "fields": _.keys(params),
        "params": params,
        "complete": callback
      });
    };

    StatisticsView.prototype.isSelectedUser = function(user) {
      var selected_user;
      selected_user = unwrap(this.selected_user);
      if (selected_user == null) return false;
      return selected_user === user;
    };

    StatisticsView.prototype.selectUser = function(user) {
      this.selected_user(user);
      return this.dropdown_is_open(false);
    };

    StatisticsView.prototype.selectEvent = function(event) {
      this.selected_event(event);
      this.selected_session(event.sessions.first());
      this.session_dropdown_is_open(false);
      return $("input.stat").val(0);
    };

    StatisticsView.prototype.isSelectedEvent = function(event) {
      var selected_event;
      selected_event = unwrap(this.selected_event);
      if (selected_event == null) return false;
      return selected_event === event;
    };

    StatisticsView.prototype.selectSession = function(session) {
      this.selected_session(session);
      this.session_dropdown_is_open(false);
      return $("input.stat").val(0);
    };

    StatisticsView.prototype.isSelectedSession = function(session) {
      var selected_session;
      selected_session = unwrap(this.selected_session);
      if (selected_session == null) return false;
      return selected_session === session;
    };

    StatisticsView.prototype.toggleSessionDropdown = function() {
      return this.session_dropdown_is_open(!this.session_dropdown_is_open());
    };

    StatisticsView.prototype.toggleDropdownOpen = function() {
      return this.dropdown_is_open(!this.dropdown_is_open());
    };

    StatisticsView.prototype.saveStats = function() {
      return this.selected_event(null);
    };

    return StatisticsView;

  })(Falcon.View);

  StreamView = (function(_super) {

    __extends(StreamView, _super);

    function StreamView() {
      StreamView.__super__.constructor.apply(this, arguments);
    }

    StreamView.prototype.url = "stream.tmpl";

    StreamView.prototype.initialize = function() {
      var params,
        _this = this;
      this.showing_nearby_events = ko.observable(false);
      this.showing_registered_events = ko.observable(false);
      this.showing_invited_events = ko.observable(false);
      this.showing_league_events = ko.observable(false);
      this.showing_large_cover = ko.observable(false);
      this.loading_events = ko.observable(false);
      this.invited_count = ko.observable(0);
      this._current_events_request = null;
      this.address_search = ko.observable();
      this.events = new Events();
      this.lat = ko.computed({
        read: function() {
          return unwrap(global.location.lat);
        },
        write: function(value) {
          if (ko.isWriteableObservable(global.location.lat)) {
            return global.location.lat(value);
          }
        }
      });
      this.lng = ko.computed({
        read: function() {
          return unwrap(global.location.lng);
        },
        write: function(value) {
          if (ko.isWriteableObservable(global.location.lng)) {
            return global.location.lng(value);
          }
        }
      });
      ko.computed(function() {
        unwrap(_this.lat);
        unwrap(_this.lng);
        return _.defer(function() {
          return _this._fetchEvents();
        });
      }).extend({
        throttle: 50
      });
      params = {
        "f": "invited",
        "r": 5000,
        "per": 100
      };
      return (new Events()).fetch({
        'fields': _.keys(params),
        'params': params,
        complete: function(events) {
          return _this.invited_count(events.length());
        }
      });
    };

    StreamView.prototype.filtered_events = function() {
      return this.events;
    };

    StreamView.prototype._resetFlags = function() {
      this.showing_nearby_events(false);
      this.showing_registered_events(false);
      this.showing_invited_events(false);
      return this.showing_league_events(false);
    };

    StreamView.prototype._fetchEvents = function() {
      var params, subscription,
        _this = this;
      this.loading_events(true);
      if (unwrap(global.location.loading)) {
        subscription = global.location.loading.subscribe(function(value) {
          if (value === false) {
            _this._fetchEvents(params);
            return subscription.dispose();
          }
        });
        return;
      }
      params = {};
      if (this.showing_registered_events()) {
        params = {
          "f": "registered",
          "r": 5000,
          "page_size": 30
        };
      } else if (this.showing_invited_events()) {
        params = {
          "f": "invited",
          "r": 5000,
          "page_size": 30
        };
      } else {
        params = {
          "f": "nearby",
          "r": 200,
          "lat": unwrap(this.lat),
          "lng": unwrap(this.lng),
          "page_size": 30
        };
      }
      return this.events.fetch({
        'fields': _.keys(params),
        'params': params,
        complete: function() {
          if (_this.showing_invited_events()) {
            _this.invited_count(_this.events.length());
          }
          return _this.loading_events(false);
        }
      });
    };

    StreamView.prototype.showNearbyEvents = function() {
      this._resetFlags();
      this.showing_nearby_events(true);
      return this._fetchEvents();
    };

    StreamView.prototype.showRegisteredEvents = function() {
      this._resetFlags();
      this.showing_registered_events(true);
      return this._fetchEvents();
    };

    StreamView.prototype.showInvitedEvents = function() {
      this._resetFlags();
      this.showing_invited_events(true);
      return this._fetchEvents();
    };

    StreamView.prototype.showLeagueEvents = function() {
      this._resetFlags();
      return this.showing_league_events(true);
    };

    StreamView.prototype.toggleLargeCover = function() {
      this.showing_large_cover(!this.showing_large_cover());
      return setTimeout((function() {
        return Helpers.resizeMaps();
      }), 250);
    };

    StreamView.prototype.gotoEvent = function(event) {
      var event_id;
      if (!(event instanceof Event)) return;
      event_id = event.get("id");
      if (event_id == null) return;
      return Finch.navigate("event/" + event_id);
    };

    StreamView.prototype.doAddressSearch = function() {
      var coder,
        _this = this;
      if ((typeof google !== "undefined" && google !== null) && (google.maps != null)) {
        coder = new google.maps.Geocoder;
        if (coder != null) {
          return coder.geocode({
            "address": this.address_search()
          }, function(response) {
            var location;
            response = _.first(response);
            if (response != null) {
              location = response.geometry.location;
              _this.lat(location.Xa);
              return _this.lng(location.Ya);
            }
          });
        }
      }
    };

    return StreamView;

  })(Falcon.View);

  SplashView = (function(_super) {

    __extends(SplashView, _super);

    function SplashView() {
      SplashView.__super__.constructor.apply(this, arguments);
    }

    SplashView.prototype.url = "/splash.tmpl";

    SplashView.prototype.initialize = function() {
      var _this = this;
      this.login_fields = {
        "username": ko.observable().classify("errorable"),
        "password": ko.observable().classify("errorable")
      };
      this.register_fields = {
        "name": ko.observable().classify("errorable"),
        "email": ko.observable().classify("errorable"),
        "birthday": ko.observable().classify("date", "errorable"),
        "username": ko.observable().classify("errorable"),
        "password": ko.observable().classify("errorable"),
        "retype": ko.observable().classify("errorable")
      };
      this.showingLogin = ko.observable(false);
      this.showingRegister = ko.observable(false);
      this.showingIntro = ko.computed(function() {
        return !(_this.showingRegister() || _this.showingLogin());
      });
      this.doing_login = ko.observable(false);
      this.doing_register = ko.observable(false);
      this.login_error = ko.observable().extend({
        "errorable": true
      });
      return this.register_error = ko.observable().extend({
        "errorable": true
      });
    };

    SplashView.prototype.doFacebookRequest = function(type) {
      var access_token,
        _this = this;
      access_token = null;
      if (type === 'login') this.login_error.clear_error();
      if (type === 'login') this.register_error.clear_error();
      if (type === 'login') this.doing_login(true);
      if (type === 'register') this.doing_register(true);
      return session.facebookLogin({
        facebook_success: function(response) {
          return access_token = response.authResponse.accessToken;
        },
        facebook_error: function() {
          if (type === 'login') {
            _this.login_error.error("Could not login with facebook");
          }
          if (type === 'register') {
            _this.register_error.error("Could not register with facebook");
          }
          if (type === 'login') _this.doing_login(false);
          if (type === 'register') return _this.doing_register(false);
        },
        success: function() {
          if (type === 'login') _this.doing_login(false);
          if (type === 'register') return _this.doing_register(false);
        },
        error: function() {
          if (!_.isString(access_token)) {
            if (type === 'login') _this.doing_login(false);
            if (type === 'register') _this.doing_register(false);
            return;
          }
          return new User({
            "facebook_access_token": access_token
          }).create({
            fields: ["facebook_access_token"],
            error: function() {
              if (type === 'login') {
                _this.login_error.error("Could not register user's facebook for login");
              }
              if (type === 'register') {
                _this.register_error.error("Could not register user's facebook");
              }
              if (type === 'login') _this.doing_login(false);
              if (type === 'register') return _this.doing_register(false);
            },
            success: function() {
              session.facebook_access_token(access_token);
              return session._attemptLogin(["facebook_access_token"], {
                complete: function() {
                  if (type === 'login') _this.doing_login(false);
                  if (type === 'register') return _this.doing_register(false);
                }
              });
            }
          });
        }
      });
    };

    SplashView.prototype.doFacebookLogin = function() {
      return this.doFacebookRequest('login');
    };

    SplashView.prototype.doFacebookRegister = function() {
      return this.doFacebookRequest('register');
    };

    SplashView.prototype.doLogin = function() {
      var has_error, password, username, _ref, _ref2,
        _this = this;
      username = (_ref = unwrap(this.login_fields.username)) != null ? _ref : "";
      password = (_ref2 = unwrap(this.login_fields.password)) != null ? _ref2 : "";
      has_error = false;
      this.login_fields.username.clear_error();
      this.login_fields.password.clear_error();
      this.login_error.clear_error();
      if (!_.isString(username)) {
        this.login_fields.username.error("Username must be a string value.");
        has_error = true;
      }
      if (!_.isString(password)) {
        this.login_fields.password.error("Password must be a string value.");
        has_error = true;
      }
      if (has_error) return;
      username = _.trim(username);
      password = _.trim(password);
      if (username.length === 0) {
        this.login_fields.username.error("Please enter a username.");
        has_error = true;
      }
      if (password.length === 0) {
        this.login_fields.password.error("Please enter a password.");
        has_error = true;
      }
      if (has_error) return;
      this.doing_login(true);
      return session.login(username, password, {
        error: function(model, response) {
          if (_.isObject(response)) {
            return _this.login_error.error(response.error);
          } else {
            return _this.login_error.error("An error occurred, please try again.");
          }
        },
        complete: function() {
          _this.doing_login(false);
          return _this.doing_register(false);
        }
      });
    };

    SplashView.prototype.doRegister = function() {
      var birthday, email, has_error, name, password, retype, user, username, _ref, _ref2, _ref3, _ref4, _ref5, _ref6,
        _this = this;
      name = (_ref = unwrap(this.register_fields.name)) != null ? _ref : "";
      email = (_ref2 = unwrap(this.register_fields.email)) != null ? _ref2 : "";
      birthday = (_ref3 = unwrap(this.register_fields.birthday)) != null ? _ref3 : "";
      username = (_ref4 = unwrap(this.register_fields.username)) != null ? _ref4 : "";
      password = (_ref5 = unwrap(this.register_fields.password)) != null ? _ref5 : "";
      retype = (_ref6 = unwrap(this.register_fields.retype)) != null ? _ref6 : "";
      has_error = false;
      this.register_fields.name.clear_error();
      this.register_fields.email.clear_error();
      this.register_fields.birthday.clear_error();
      this.register_fields.username.clear_error();
      this.register_fields.password.clear_error();
      this.register_fields.retype.clear_error();
      if (!_.isString(name)) {
        this.register_fields.name.error("Name must be a string value");
        has_error = true;
      }
      if (!_.isString(email)) {
        this.register_fields.email.error("Email must be a string value");
        has_error = true;
      }
      if (!_.isString(birthday)) {
        this.register_fields.birthday.error("Birthday must be a string value");
        has_error = true;
      }
      if (!_.isString(username)) {
        this.register_fields.username.error("Username must be a string value");
        has_error = true;
      }
      if (!_.isString(password)) {
        this.register_fields.password.error("Password must be a string value");
        has_error = true;
      }
      if (!_.isString(retype)) {
        this.register_fields.retype.error("Retype must be a string value");
        has_error = true;
      }
      if (has_error) return;
      name = _.trim(name);
      email = _.trim(email);
      birthday = _.trim(birthday);
      username = _.trim(username);
      password = _.trim(password);
      retype = _.trim(retype);
      if (name.length === 0) {
        this.register_fields.name.error("Please enter your name");
        has_error = true;
      }
      if (email.length === 0) {
        this.register_fields.email.error("Please enter an email");
        has_error = true;
      }
      if (birthday.length === 0) {
        this.register_fields.birthday.error("Please enter an birthday");
        has_error = true;
      }
      if (username.length === 0) {
        this.register_fields.username.error("Please enter a username");
        has_error = true;
      }
      if (password.length === 0) {
        this.register_fields.password.error("Please enter your password");
        has_error = true;
      }
      if (retype.length === 0) {
        this.register_fields.retype.error("Please retype your password");
        has_error = true;
      }
      if (has_error) return;
      if (password !== retype) {
        this.register_fields.retype.error("Passwords do not match");
        has_error = true;
      }
      if (has_error) return;
      if (!Helpers.isEmail(email)) {
        this.register_fields.email.error("Please enter a valid email address");
        has_error = true;
      }
      if (has_error) return;
      this.register_error.clear_error();
      this.doing_register(true);
      user = new User();
      user.set("name", name);
      user.set("email", email);
      user.set("birthday", birthday);
      user.set("username", username);
      user.set("password", password);
      return user.create({
        fields: ["name", "username", "birthday", "email", "password"],
        success: function() {
          _this.register_error.clear_error();
          _this.login_fields.username(username);
          _this.login_fields.password(password);
          return _this.doLogin();
        },
        error: function(model, response) {
          if (_.isObject(response)) {
            _this.login_error.error(response.error);
          } else {
            _this.login_error.error("An error occurred, please try again.");
          }
          return _this.doing_register(false);
        }
      });
    };

    SplashView.prototype.showIntro = function() {
      this.showingLogin(false);
      return this.showingRegister(false);
    };

    SplashView.prototype.showLogin = function() {
      this.showingLogin(true);
      return this.showingRegister(false);
    };

    SplashView.prototype.showRegister = function() {
      this.showingLogin(false);
      return this.showingRegister(true);
    };

    return SplashView;

  })(Falcon.View);

  $root = ko.observable();

  $window = $(window);

  $document = $(document);

  $body = $("body");

  $html = $("html");

  this.session = session = new Session(function() {
    if (session.user() == null) Finch.navigate("/");
    return Finch.listen();
  });

  this.me = me = session.user;

  global = {};

  global.facebookStatus = "";

  global.facebookAccessToken = "";

  global.facebookLogin = function(callback) {
    if (typeof FB === "undefined" || FB === null) return;
    if (global.facebookStatus === "connected") {
      return FB.getLoginStatus(callback, true);
    } else {
      return FB.login(callback, {
        scope: 'email,user_about_me,user_birthday,user_hometown,user_location,friends_location,user_status,friends_status,publish_checkins,publish_stream,publish_actions'
      });
    }
  };

  loadFacebook = function(callback) {
    var _head, _script, _triggerInit;
    _triggerInit = function() {
      FB.init({
        "appId": ENV['FACEBOOK_APP_ID'],
        "channelUrl": ENV['DOMAIN'] + '/facebook_channel.html',
        "status": true,
        "cookie": true,
        "xfbml": true
      });
      FB.Event.subscribe("auth.statusChange", function(response) {
        global.facebookStatus = response.status;
        return global.facebookAccessToken = response.status === "connected" ? response.authResponse.accessToken : "";
      });
      if (_.isFunction(callback)) return callback();
    };
    _head = document.getElementsByTagName('head')[0];
    _script = document.createElement('script');
    _script.type = 'text/javascript';
    _script.src = "//connect.facebook.net/en_US/all.js";
    _script.onload = _triggerInit;
    _script.onreadystatechange = function() {
      if (this.readyState === "complete") return _triggerInit();
    };
    _head.appendChild(_script);
    return loadFacebook = (function() {});
  };

  $window.on("error", function(event) {
    var message, originalEvent;
    originalEvent = event.originalEvent;
    message = "PAGE: " + window.location.href + " ";
    try {
      if (originalEvent.lineno != null) {
        message += " | LINE: " + originalEvent.lineno;
      }
    } catch (e) {

    }
    try {
      if (originalEvent.filename != null) {
        message += " | FILENAME: " + originalEvent.filename;
      }
    } catch (e) {

    }
    try {
      if (originalEvent.message != null) {
        message += " | MESSAGE: " + originalEvent.message;
      }
    } catch (e) {

    }
    try {
      if (me() instanceof User) {
        message += " | USER: " + (unwrap(me().id)) + " - " + (unwrap(me().name)) + " <" + (unwrap(me().email)) + ">";
      }
    } catch (e) {

    }
    _gaq.push(['_trackEvent', 'Error', 'Javascript Error', message]);
    return console.log("TRACKED", ['Error', 'Javascript Error', message]);
  });

  if ($.browser.msie && parseInt($.browser.version) === 7) {
    current_location = window.location.href;
    setInterval((function() {
      if (current_location !== window.location.href) {
        _gaq.push(['_trackPageview']);
        return current_location = window.location.href;
      }
    }), 200);
  } else {
    $window.on("hashchange", function() {
      return _gaq.push(['_trackPageview', window.location.hash]);
    });
  }

  if (typeof google !== "undefined" && google !== null) {
    google.load("visualization", "1", {
      packages: ["corechart"]
    });
  }

  global.location = {
    loading: null,
    geocoder: null,
    lat: null,
    lng: null,
    city: null,
    county: null,
    state: null,
    street: null,
    address: null,
    country: null,
    postal_code: null
  };

  if (navigator.geolocation != null) {
    global.location.loading = ko.observable(true);
    global.location.lat = ko.observable();
    global.location.lng = ko.observable();
    if ((typeof google !== "undefined" && google !== null) && (google.maps != null)) {
      geocoder = new google.maps.Geocoder();
      global.location.city = ko.observable();
      global.location.county = ko.observable();
      global.location.state = ko.observable();
      global.location.street = ko.observable();
      global.location.address = ko.observable();
      global.location.country = ko.observable();
      global.location.postal_code = ko.observable();
    }
    _complete = function() {
      return global.location.loading(false);
    };
    _success = function(position) {
      var latLng;
      if (geocoder != null) {
        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        return geocoder.geocode({
          'latLng': latLng
        }, function(results, status) {
          var component, result, street, types, _i, _len, _ref;
          if (status === google.maps.GeocoderStatus.OK) {
            global.location.lat(position.coords.latitude);
            global.location.lng(position.coords.longitude);
            if ((result = results[0]) != null) {
              street = "";
              _ref = result.address_components;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                component = _ref[_i];
                types = component.types;
                if (types[0] === "street_number") {
                  street = component.long_name + street;
                }
                if (types[0] === "route") street += " " + component.long_name;
                if (types[0] === "locality") {
                  global.location.city(component.short_name);
                }
                if (types[0] === "administrative_area_level_2") {
                  global.location.county(component.short_name);
                }
                if (types[0] === "administrative_area_level_1") {
                  global.location.state(component.short_name);
                }
                if (types[0] === "country") {
                  global.location.country(component.short_name);
                }
                if (types[0] === "postal_code") {
                  global.location.postal_code(component.short_name);
                }
              }
              global.location.street(street);
              global.location.address(result.formatted_address);
            }
          }
          return _complete();
        });
      } else {
        global.location.lat(position.coords.latitude);
        global.location.lng(position.coords.longitude);
        return _complete();
      }
    };
    _error = function(error) {
      var message;
      message = "CODE: " + error.code + " | MESSAGE: " + error.message;
      _gaq.push(['_trackEvent', 'Error', 'Location Error', message]);
      console.log("TRACKED", ['Error', 'Location Error', message]);
      return _complete();
    };
    _options = {
      timeout: 5 * 1000,
      maximumAge: 0,
      enableHighAccuracy: true
    };
    navigator.geolocation.getCurrentPosition(_success, _error, _options);
  }

  $html.addClass("loading");

  Falcon.apply($root, "#application", function() {
    return _.defer(function() {
      var _completed;
      _completed = _.times(1, function() {
        return _.delay((function() {
          return $html.removeClass("loading");
        }), 100);
      });
      return loadFacebook(_completed);
    });
  });

}).call(this);
