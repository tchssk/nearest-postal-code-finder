var addLatLng = function(addresses) {
  var dfd = $.Deferred();
  var geocoder = new google.maps.Geocoder();
  var cnt = 0;
  var time = 500;
  $.each(addresses, function(i, address) {
    setTimeout(function() {
      geocoder.geocode({
        address: address.address
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          address.lat = results[0].geometry.location.lat()
          address.lng = results[0].geometry.location.lng()
        }
        cnt++;
        if (cnt === addresses.length) {
          dfd.resolve();
        }
      });
    }, time);
    time += 500;
  });
  return dfd.promise();
}
var removeLatLng = function(addresses) {
  $.each(addresses, function(i, address) {
    delete address.latLng;
  });
}
var addNearest = function(masters, targets) {
  $.each(targets, function(i, target) {
    var distance = 0;
    var lastDistance = Number.MAX_VALUE;
    $.each(masters, function(j, master) {
      if (target.lat != undefined && target.lng != undefined && master.lat != undefined && master.lng != undefined) {
        var t = new google.maps.LatLng(target.lat, target.lng)
        var m = new google.maps.LatLng(master.lat, master.lng)
        distance = google.maps.geometry.spherical.computeDistanceBetween(t, m);
        if (distance < lastDistance) {
          lastDistance = distance;
          target.nearest = master.address;
        }
      }
    });
  });
}
var main = function() {
  var references = document.getElementById('reference');
  var targets = document.getElementById('target');
  var results = document.getElementById('result');
  try {
    var referencesJSON = JSON.parse(references.value);
    var targetsJSON = JSON.parse(targets.value);
  }
  catch (e) {
    results.value = e;
  }
  $.when(addLatLng(referencesJSON), addLatLng(targetsJSON)).done(function() {
    references.value = JSON.stringify(referencesJSON, null, '    ');
    targets.value = JSON.stringify(targetsJSON, null, '    ');
    addNearest(referencesJSON, targetsJSON);
    removeLatLng(targetsJSON);
    results.value = JSON.stringify(targetsJSON, null, '    ');
  })
}
