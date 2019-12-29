// global variables
var marker = [];
var parsedText = null;

// date cisluje mesiace od nuly!
var dayFinal = new Date(2020, 0, 1);
var about = "<h2>New Year notifier on a map. 2017</h2><p>Current set date: " + dayFinal.toLocaleDateString() + " " + dayFinal.toLocaleTimeString() + ".</p>";
var minutesNotif = 2;
var soundLength = 3;
// var wwwPosition = "http://localhost/moje/silvester/";

/**
 *
 */     
// about text
function showAbout() {
    document.getElementById("about").disabled = true;
    document.getElementById("wrapper").style.zIndex = "1000";
    
    alertify.parent(document.getElementById("wrapper"));
    alertify.alert(about, function() {
      document.getElementById("about").disabled = false;
    });
    
    document.getElementById("wrapper").style.zIndex = "1";  
}

// load json data
function loadData(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    // xobj.open('GET', wwwPosition + "data/countries.json", true);
    xobj.open('GET', "https://raw.githubusercontent.com/jarosd/Sylvester/master/data/countries.json", true);

    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == 200) {
            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);
        } 
    }
    
    xobj.send(null);
}

// experimental checking of existency of image file
// not used
function checkImagePHP(file) {
    var xobj = new XMLHttpRequest();
    
    xobj.open('POST', wwwPosition + "data/fileChecker.php", true);
    xobj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == 200) {
          console.log(file, xobj.responseText);
        } 
    }
    
    xobj.send("filename=" + file);
}

// not used
function testFile() {
  for (var i = 0; i < parsedText.length; i++) {
    checkImagePHP(parsedText[i]["country_abbr"] + ".png");
  }
}

// when the image is not found
function imageOnError(image) {
  image.onerror = "";
  image.src = "images/XX.png";
}

/**
 *
 */ 
// beautifying data
function latBeautifier(text) {
    var lat = "";
    if (parseInt(text) < 0) {
      lat = parseInt(-1 * text).toString() + "° S";
    } else {
      lat = text + "° N";
    }  
    
    return lat;
}

function lngBeautifier(text) {
    var lng = "";
    if (parseInt(text) < 0) {
      lng = parseInt(-1 * text).toString() + "° W";
    } else {
      lng = text + "° E";
    }  
    
    return lng;
}

function UTCBeautifier(text) {
    var timezone = "UTC ";
    if (text / 3600.0 >= 0) {
      timezone += "+";
    }
    
    timezone += text / 3600.0;
    return timezone;
}

/**
 *
 */ 
// alerting new year
function alertNewYear(i, sound) {
  if (sound) {
    var audio = new Audio('data/silvester.mp3');
    audio.play();
    
    setTimeout((function(audio) {
          return function(){audio.pause();};
    })(audio), soundLength * 1000);
  }
  
  console.log("ALERT: " + parsedText[i]["country_name"] + " " + parsedText[i]["city"] + " " + UTCBeautifier(parsedText[i]["timezone_offset"]));
  alertify.parent(document.body);
  alertify.success('<p class="textalert"><img class="smallimg" src="images/' + parsedText[i]["country_abbr"] + '.png" alt="' + parsedText[i]["city"] + 
    '" onerror="imageOnError(this)"><b>' + parsedText[i]["city"] + " in " + parsedText[i]["country_name"] + " is celebrating! </b>" + UTCBeautifier(parsedText[i]["timezone_offset"]) + "</p>");
}

// warning new year
function warnNewYear(i, sound) {
  if (sound) {
    var audio = new Audio('data/warning.mp3');
    audio.play();
    
    setTimeout((function(audio) {
          return function(){audio.pause();};
    })(audio), soundLength * 1000);
  }

  console.log("WARNING: " + parsedText[i]["country_name"] + " " + parsedText[i]["city"] + " " + UTCBeautifier(parsedText[i]["timezone_offset"]));
  alertify.parent(document.body);
  alertify.error('<p class="textalert"><img class="smallimg" src="images/' + parsedText[i]["country_abbr"] + '.png" alt="' + parsedText[i]["city"] + 
    '" onerror="imageOnError(this)"><b>' + parsedText[i]["city"] + " in " + parsedText[i]["country_name"] + " is celebrating in a short period. </b>" + UTCBeautifier(parsedText[i]["timezone_offset"]) + "</p>");
}

// the nearest celebrators of new year
function nearestNewYear(i) {
  console.log("NEAREST: " + parsedText[i]["country_name"] + " " + parsedText[i]["city"] + " " + UTCBeautifier(parsedText[i]["timezone_offset"]));
  alertify.parent(document.body);
  alertify.log('<p class="textalertnearest"><img class="smallimg" src="images/' + parsedText[i]["country_abbr"] + '.png" alt="' + parsedText[i]["city"] + 
    '" onerror="imageOnError(this)"><b>' + parsedText[i]["city"] + " in " + parsedText[i]["country_name"] + " is celebrating in next round. </b>" + UTCBeautifier(parsedText[i]["timezone_offset"]) + "</p>");
}

function findAllNearest(intervalMin) {
  var y = 0;
  
  for (var i = 0; i < parsedText.length; i++) {
    var time = parseInt(parsedText[i]["timezone_offset"]) * 1000;
    var dateTo = dayFinal.getTime() - Date.now() - time - new Date().getTimezoneOffset() * 60 * 1000;
    
    if (dateTo > 0 && dateTo < intervalMin * 60000) {
      setTimeout((function(i) {
          return function(){nearestNewYear(i);};
      })(i), y * 1000);
      y++;
    }
  }
}

// gui interface for all nearest
function findAllNearestDialog() {
  alertify.parent(document.getElementById("wrapper"));
  
  alertify.defaultValue(60).prompt("Interval in minutes: ", function (val, ev) {
      ev.preventDefault();
      
      if (val > 0 && val <= 240) {
        findAllNearest(val);
      } else {
        alertify.alert("Wrong parameter supplied [1 - 240].");
      }
  }, function(ev) {
      ev.preventDefault();
      alertify.error("You've clicked Cancel");
  });
}

/**
 *
 *
 */
// nacitanie textu pri nacitani stranky
loadData(function(response) {
// nacitanie JSON
   parsedText = JSON.parse(response);
  
// natavenie ikon pre jednotlive pasma
  var arrayTimestamps = [];
  var icons = [blueIcon, redIcon, greenIcon, orangeIcon, violetIcon, blackIcon];
  var y = 0;

  for (var i = 0; i < parsedText.length; i++) {
    // sekundy previest na ms a potom na text
    if (arrayTimestamps.indexOf((parseInt(parsedText[i]["timezone_offset"]) * 1000).toString()) == -1) {
      arrayTimestamps[y] = parseInt(parsedText[i]["timezone_offset"] * 1000).toString();
      y++;
    }
  } 
  
  // pre cisla musi pisat sort funkciu
  arrayTimestamps.sort(function(a, b) {
    return a - b;
  });

  var iconsDict = {};
  for (var i = 0; i < arrayTimestamps.length; i++) {
    iconsDict[arrayTimestamps[i]] = icons[i % icons.length];
  }

// nastavenie markerov pre vsetky polozky
  for (var i = 0; i < parsedText.length; i++) {
    // dodatocne textove upravy
    var lat = latBeautifier(parsedText[i]["lat"]);
    var lng = lngBeautifier(parsedText[i]["lng"]);
    var timezone = UTCBeautifier(parsedText[i]["timezone_offset"]);
    
    marker[i] = L.marker(
      [parsedText[i]["lat"], parsedText[i]["lng"]],
      {icon: iconsDict[parseInt(parsedText[i]["timezone_offset"] * 1000).toString()]})
      .addTo(map)
      .bindPopup('<table>' +
          '<tr><td class="boldcell">Country</td><td>' + parsedText[i]["country_name"] + ' [' + parsedText[i]["country_abbr"] + ']</td></tr>' +
          '<tr><td class="boldcell">Region</td><td>' + parsedText[i]["continent"] + '</td></tr>' + 
          '<tr><td class="boldcell">Capital city</td><td>' + parsedText[i]["capital"] + '</td></tr>' + 
          '<tr><td class="boldcell">Highlighted city</td><td>' + parsedText[i]["city"] + '</td></tr>' + 
          '<tr><td class="boldcell">Position</td><td>' +  lat + " " + lng + '</td></tr>' +
          '<tr><td class="boldcell">Timezone</td><td>' + timezone + '</td></tr>' +
          '<tr><td class="boldcell">Flag</td><td><img src="images/' + parsedText[i]["country_abbr"] + '.png" alt="' + parsedText[i]["country_name"] + '" onerror="imageOnError(this)"></td></tr>' +
          '</table>');
   } 
    
// zoradenie timezone offsets na zistenie oneskoreni jednotlivych hlaseni
    var arrayTimestamps = [];
    var firstOccurence = [];
    for (var i = 0; i < parsedText.length; i++) {
        arrayTimestamps[i] = parseInt(parsedText[i]["timezone_offset"]) * 1000;
    } 
    arrayTimestamps.sort(function(a, b) {return a - b;});

// pridanie oneskoreni pre jednotlive krajiny
    for (var i = 0; i < parsedText.length; i++) {
      var time = parseInt(parsedText[i]["timezone_offset"]) * 1000;
      var diff = arrayTimestamps.lastIndexOf(time) - arrayTimestamps.indexOf(time);
      // vypocet casu -> finalny datum - cas, co mam teraz - posunutie casu v danej krajine - posunutie času na pocitaci
      var dateTo = dayFinal.getTime() - Date.now() - time - new Date().getTimezoneOffset() * 60 * 1000;

      // indikator posledneho oznamu
      var ifCond = (firstOccurence.indexOf(time) == -1);
      // indikator prveho oznamu
      var first = (diff == 0);

      // nastavenie oneskorenia pre notifikaciu, inak siva ikonka
      if (dateTo > 0) {
        setTimeout((function(i, first) { 
          return function(){
            alertNewYear(i, first);
            marker[i].setIcon(greyIcon).update();
          };
        })(i, first), dateTo + diff * 1000);
      } else {
        marker[i].setIcon(greyIcon).update();
      }

      // dopredny notifikator, musi to byt takto zaobalene
      if (dateTo > minutesNotif * 60000) {
        setTimeout((function(i, first) {
          return function(){warnNewYear(i, first);};
        })(i, first), dateTo + diff * 1000 - minutesNotif * 60000);
      }

      // odstranenie timestampu z pola, na znizenie oneskorenia
      arrayTimestamps.splice(arrayTimestamps.indexOf(time),1);
      if (ifCond) {
        firstOccurence.push(time);
      }
    }
  }
);   

// updatovanie casu kazdu sekundu
setInterval(function() {
  for (var i = 0; i < marker.length; i++) {
    var d = new Date();
    var timeNumber = d.getTime() + d.getTimezoneOffset() * 60 * 1000 + parseInt(parsedText[i]["timezone_offset"]) * 1000;
    d = new Date(timeNumber);
    
    var content = marker[i].getPopup().getContent();
    var to = content.indexOf('<p id="time"><b>Current local time: </b>');

    if (to != -1) {
      content = content.substring(0, to);
    }   
    
    content += '<p id="time"><b>Current local time: </b><span id="placetime">' + d.toLocaleString() + "</span></p>";
    marker[i].bindPopup(content).update();   
  }
}, 1000);