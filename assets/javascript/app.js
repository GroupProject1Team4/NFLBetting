var map;
var teams = [];
var heatmap;
var heatmapData = [];
var dom = {};
var votes;


// Initialize Firebase
var config = {
  apiKey: "AIzaSyBcWXfKFFT_ha4bL-Xg5UnkMS8k8WtKDAM",
  authDomain: "uncralgp1t4.firebaseapp.com",
  databaseURL: "https://uncralgp1t4.firebaseio.com",
  projectId: "uncralgp1t4",
  storageBucket: "",
  messagingSenderId: "506753264028"
};
firebase.initializeApp(config);

var database = firebase.database();


function initMap() {
  
  // heatmapData = new google.maps.MVCArray();

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: {lat: 35.7891228, lng: -78.6365947},
    mapTypeId: 'terrain',
    disableDefaultUI: true,
    zoomControl: true
  });
  
  /**
  var addresses = [
    "401 N Broad St, Philadelphia, PA",
    "2600 Pennsylvania Avenue, Washington, DC",
    "205 E Houston St, New York, NY"
  ];

  var geocoder = new google.maps.Geocoder();

  for (let i = 0; i < addresses.length; i++) {

    geocoder.geocode({'address': addresses[i] }, (results, status) => {
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
  **/
}

var renderBarChart = () => {
  var chartData = {
    //labels: ["Wins", "Losses", "Point Rank", "Touchdown Differential"],
    labels: [],
    datasets: []
  };

  for (teamId in teams) {
    team = teams[teamId];
    chartData.labels.push(team.alias);
  };

  let wins = [];
  let losses = [];
  let pointrank = [];
  let tdDiff = [];


  for (teamId in teams) {
    team = teams[teamId];

    wins.push(team.wins);
    losses.push(team.losses);
    pointrank.push(parseInt(team.points_rank) * -1);
    tdDiff.push(team.touchdown_diff);
  };


  chartData.datasets.push({
      title: 'Wins',
      color: "green",
      values: wins
  });

  chartData.datasets.push({
      title: 'Losses',
      color: "red",
      values: losses
  });

  /**
  chartData.datasets.push({
      title: 'Points Rank',
      color: "yellow",
      values: pointrank
  });
  **/

  chartData.datasets.push({
      title: 'TD Differential',
      color: "blue",
      values: tdDiff
  });

  console.log(chartData);

  var chart = new Chart({
    parent: "#bar-chart",
    title: "Team Statistics",
    data: chartData,
    type: 'bar',
    is_navigable: 1,
    height: 250
  });

  chart.parent.addEventListener('data-select', (e) => {
    onTeamClick(e); // e contains index and value of current datapoint
  });
}

var flattenTeams = (teamData) => {
  for (confId in teamData.conferences) {
    conference = teamData.conferences[confId];
    for (divisionId in conference.divisions) {
      division = conference.divisions[divisionId];
      for (teamId in division.teams) {
        team = division.teams[teamId];
        team['conference'] = conference.name;
        team['division'] = division.name;
        teams.push(team);
      }
    }
  }
}

var fetchTeamData = () => {
  // Temporary API key for class demo
  teamDataApiKey = "342z8wucjste8q5y27h5jmcm";
  let teamDataUri = 'https://api.sportradar.us/nfl-ot2/seasontd/2017/standings.json?api_key=' + teamDataApiKey;
  let corsProxyUri = ' https://cors-anywhere.herokuapp.com/';

  $.get(corsProxyUri + teamDataUri, (data) => {
    flattenTeams(data);
    console.log("Flattened teams:");
    console.log(teams);
    renderBarChart(teams);
  });
}

var showTeamDetails = (teamId) => {
  let team = teams[teamId];

  console.log("In showTeamDetails");
  dom.teamDetail.empty();

  let newP;

  newP = $('<p>', { class: 'team-name' });
  newP.text(teams[teamId].market + " " + team.name + ' (' + team.division + ')');
  dom.teamDetail.append(newP);

  newP = $('<p>');
  newP.text('Rank (Conf/Div): ' + team.rank.conference + '/' + team.rank.division);
  dom.teamDetail.append(newP);

  newP = $('<p>');
  newP.text('(Wins/Losses): ' + team.wins + '/' + team.losses);
  dom.teamDetail.append(newP);

  newP = $('<p>');
  newP.text('Touchdown Differential: ' + team.touchdown_diff);
  dom.teamDetail.append(newP);

  newP = $('<p>');
  newP.text('Points Rank: ' + team.points_rank);
  dom.teamDetail.append(newP);

  newP = $('<p>', { class: 'glyphicon glyphicon-heart' });
  newP.attr('data-state', 'unclicked');
  newP.attr('data-teamId', teamId);
  dom.teamDetail.append(newP);

  newP = $('<p>');
  newP.text('Click the heart to show some team love on the map!');
  newP.css({'font-size': '18px'});
  dom.teamDetail.append(newP);

}

var showTeamVotes = (teamAlias) => {

  if (heatmap) {
    heatmap.setMap(null);
  };
  
  heatmapData = new google.maps.MVCArray();

  $.each(votes[teamAlias], (index, value) => {
    let newLatLng = new google.maps.LatLng(value['latitude'], value['longitude']);
    heatmapData.push(newLatLng);
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: true,
    map: map,
    radius: 20
  });

  heatmap.setMap(map);

  let centerOfUS = new google.maps.LatLng(39.8283, -98.5795);

  var mapLabel = new MapLabel({
      text: 'Test',
      position: centerOfUS,
      map: map,
      fontSize: 40,
      align: 'center'
  });

  mapLabel.setMap(map);
}

var onTeamClick = (e) => {
  let teamId = e.index;
  console.log(teams[teamId]);
  showTeamDetails(teamId);
  showTeamVotes(teams[teamId].alias);
}

var onHeartClick = (e) => {
  console.log(e.target);
  let heart = $(e.target);
  let teamAlias = teams[heart.attr('data-teamId')].alias;
  heart.attr('data-state', 'clicked');
  heart.css('color', 'red');

  if (navigator.geolocation) {
    console.log("foo");
  
    navigator.geolocation.getCurrentPosition((position) => {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(pos);
      var latLng = new google.maps.LatLng(pos.lat, pos.lng);
      heatmapData.push(latLng);
      database.ref('/votes/' + teamAlias + '/').push({
        latitude: pos.lat,
        longitude: pos.lng
      })
    }, () => {
      console.log("Error encountered");
    });
  
  }
}

var onDataChange = (snapshot) => {
  votes = snapshot.val();
  console.log(votes);
}

$(document).ready(() => {
  fetchTeamData();
  dom['teamDetail'] = $('#team-info');
  dom['teamDetail'].on('click', '.glyphicon-heart', onHeartClick);
  database.ref('/votes/').on('value', onDataChange, (err) => { console.log(err) });
});