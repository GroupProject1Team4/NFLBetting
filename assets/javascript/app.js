var map;
var heatmapData;

function initMap() {
  
  heatmapData = new google.maps.MVCArray();

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: {lat: 35.7891228, lng: -78.6365947},
    mapTypeId: 'terrain'
  });

  //infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(pos);
      var latLng = new google.maps.LatLng(pos.lat, pos.lng);
      heatmapData.push(latLng);

      //infoWindow.setPosition(pos);
      //infoWindow.setContent('Location found.');
      //infoWindow.open(map);

      
      var addresses = [
        "401 N Broad St, Philadelphia, PA",
        "2600 Pennsylvania Avenue, Washington, DC",
        "205 E Houston St, New York, NY"
      ];
      var geocoder = new google.maps.Geocoder();
 
      for (let i = 0; i < addresses.length; i++) {

        geocoder.geocode({'address': addresses[i] }, function(results, status) {
          if (status === 'OK') {
            let loc = results[0].geometry.location;
            let newLatLng = new google.maps.LatLng(loc.lat(), loc.lng());
            heatmapData.push(newLatLng);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });

      }

      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        dissipating: true,
        map: map,
        radius: 20
      });

      heatmap.setMap(map);
      map.setCenter(pos);

    }, function() {
      console.log("Error encountered");
    });
  } 
}

var renderBarChart = function() {
  var data = {
    labels: ["Wins", "Losses", "Point Rank", "Touchdown Differential"],

    datasets: [
      {
        title: "Team1", color: "light-blue",
        values: [25, 40, 30, 35]
      },
      {
        title: "Team2", color: "violet",
        values: [25, 50, -10, 15]
      }
    ]
  };

  var chart = new Chart({
    parent: "#bar-chart",
    title: "Team Statistics",
    data: data,
    type: 'bar', // or 'line', 'scatter', 'percentage'
    height: 250
  });
}

$(document).ready(() => {
  renderBarChart();
});