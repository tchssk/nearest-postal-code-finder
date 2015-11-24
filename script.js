var addLatLng = function(address) {
  var d = $.Deferred();
  var geocoder = new google.maps.Geocoder();
  if (address.lat != undefined && address.lng != undefined) {
    d.resolve();
  } else {
    setTimeout(function() {
      geocoder.geocode({
        address: address.address
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          address.lat = results[0].geometry.location.lat()
          address.lng = results[0].geometry.location.lng()
          d.resolve();
        }
        d.reject(status);
      });
    }, 1000);
  }
  return d.promise();
}
var removeLatLng = function(addresses) {
  $.each(addresses, function(i, address) {
    delete address.lat;
    delete address.lng;
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
  results.value = 'Now processing...';
  try {
    var referencesJSON = JSON.parse(references.value);
    var targetsJSON = JSON.parse(targets.value);
  }
  catch (e) {
    results.value = e;
  }
  var d = (new $.Deferred()).resolve();
  $.each(referencesJSON, function(i, address) {
    d = d.then(function() {
      return addLatLng(address);
    })
  });
  d.then(function() {
    references.value = JSON.stringify(referencesJSON, null, '    ');
  });
  $.each(targetsJSON, function(i, address) {
    d = d.then(function() {
      return addLatLng(address);
    })
  });
  d.then(function() {
    targets.value = JSON.stringify(targetsJSON, null, '    ');
    addNearest(referencesJSON, targetsJSON);
    removeLatLng(targetsJSON);
    results.value = JSON.stringify(targetsJSON, null, '    ');
  }, function(status) {
    references.value = JSON.stringify(referencesJSON, null, '    ');
    targets.value = JSON.stringify(targetsJSON, null, '    ');
    results.value = status
  });
}
