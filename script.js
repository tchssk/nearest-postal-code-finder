var addLatLng = function(addresses) {
  var dfd = $.Deferred();
  var geocoder = new google.maps.Geocoder();
  var cnt = 0;
  $.each(addresses, function(i, address) {
    geocoder.geocode({
      address: address.address
    }, function(results, status) {
      cnt++;
      if (status == google.maps.GeocoderStatus.OK) {
        address.latLng = results[0].geometry.location;
        if (cnt === addresses.length) {
          dfd.resolve();
        }
      }
    });
  });
  return dfd.promise();
}
var removeLatLng = function(addresses) {
  $.each(addresses, function(i, address) {
    delete address.latLng;
  });
}
var addAlternative = function(masters, targets) {
  $.each(targets, function(i, target) {
    var distance = 0;
    var lastDistance = Number.MAX_VALUE;
    $.each(masters, function(j, master) {
      if (target.latLng != undefined && master.latLng != undefined) {
        distance = google.maps.geometry.spherical.computeDistanceBetween(target.latLng, master.latLng);
        if (distance < lastDistance) {
          lastDistance = distance;
          target.alternative = master.address;
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
    addAlternative(referencesJSON, targetsJSON);
    removeLatLng(targetsJSON);
    results.value = JSON.stringify(targetsJSON);
  })
}
