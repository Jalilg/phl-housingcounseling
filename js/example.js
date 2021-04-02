/* =====================
  Map Setup
===================== */
// Notice that we've been using an options object since week 1 without realizing it
var mapOpts = {
  center: [0, 0],
  zoom: 2
};
var map = L.map('map', mapOpts);

// Another options object

  var tileOpts = {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  };
  var mapTiles = L.tileLayer(
'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F1bHQzNCIsImEiOiJja2ZsbWd5cm8xNDBsMnlwajMzbW15c2Y0In0.nZ9siGKFAjMx_JQVEzeOtg', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var data;
var markers;

var page1 = {
  title: "Introduction", 
  content: "Housing counselors in philadelphia help prepare people to buy a home, assist tenants fighting eviction, or help homeowners facing foreclosure. They can also help address specific issues facing seniors and people with disabilities."
}

var page2 = {
  title: "Foreclosure Assistance", 
  content: "Several Housing Counseling Agencies focus on foreclosure prevention counseling in response to the current housing crisis and its impact on Philadelphia’s low-income families.",
  filter: "FORECLOSURE"
}

var page3 = {
  title: "Pre-purchase Assistance", 
  content: "Several Housing Counseling Agencies provide counseling for Pre-Purchasing, which helps you understand if you are ready to purchase a home. They promote homeownership opportunities for first-time and low-income homebuyers, and can also help you obtain grants toward your home purchase.",
  filter: "PRE_PURCHASE"
}

var page4 = {
  title: "Issues facing Seniors", 
  content: "Housing Counselors that specialize in Senior Services assist seniors living in with a comprehensive array of health and supportive services with the goal of maintaining their independence and dignity.",
  filter: "SENIOR"
}

var page5 = {
  title: "Issues facing People Living with Disabilities", 
  content: "Housing Counselors that specialize in services for people living with disabilities assist with fair housing complaints and violations of laws regarding housing rights of people with disabilities.",
  filter: "DISABILITY"
}

var page6 = {
  title: "Issues facing Renters", 
  content: "Housing Counselors that specialize in services for renters assist in resolving housing-related issues or tenant rights violations. They may counsel tenants or answer simple questions on the phone for people who are locked-out or have had their utilities shut-off.",
  filter: "RENTER"
}


var slides = [
  page1,
  page2,
  page3,
  page4,
  page5,
  page6,
]

var currentPage = 0

// function to reformat telephone number

var checkPhoneNum = function (x) {
  if (x.includes('(') == true) {
  	var newNum = x.replace('(','').replace(') ','-')
    return (newNum)
  }
  else { return x}
}

// function to remove http://www. from an address if it's there
var checkURL = function (x) {
  if (x.startsWith('http') != true) {
    return ("http://www." + x)
  }
  else { return x}
}

var removeHTTP = function (x) {
  if (x.startsWith('https://www.') == true) {
    return (x.replace('https://www.', ''))
  }
  else if (x.startsWith('http://www.') == true) {
    return (x.replace('http://www.', ''))
  }
  else return x
}


//function to create a query for google maps directions api
var directionsQuery = function (address) {
  encoded = encodeURIComponent(address)
  return ("https://www.google.com/maps/dir/?api=1&destination=" + encoded)
}


var nextPage = function() {

  // event handling for proceeding forward in slideshow

  tearDown()
  var nextPage = currentPage + 1
  currentPage = nextPage
  buildPage(slides[nextPage])
}

var prevPage = function() {

  // event handling for going backward in slideshow
  tearDown()
  var prevPage = currentPage - 1
  currentPage = prevPage
  console.log(currentPage)
  buildPage(slides[prevPage])

}

var buildPage = function(pageDefinition) {
console.log(pageDefinition)

  // build up a 'slide' given a page definition

  // check filters for the data
  if (slides[currentPage].filter == "FORECLOSURE" ) {
    filteredData = _.filter(data, 
      function(x) {
        return x.properties.FORECLOSURE == "Yes";
      })
  }  
 else if (slides[currentPage].filter == "PRE_PURCHASE" ) {
    filteredData = _.filter(data, 
      function(x) {
        return x.properties.PRE_PURCHASE == "Yes";
      })
  }  
  else if (slides[currentPage].filter == "SENIOR" ) {
    filteredData = _.filter(data, 
      function(x) {
        return x.properties.SPECIALTY == "SENIOR";
      })
  }  
  else if (slides[currentPage].filter == "DISABILITY") {
    filteredData = _.filter(data, 
      function(x) {
        return x.properties.SPECIALTY == "DISABILITY";
      })
  }
  else if (slides[currentPage].filter == "RENTER") {
    filteredData = _.filter(data, 
      function(x) {
        return x.properties.SPECIALTY == "RENTER";
      })
  }    
  else {
    filteredData = data
  }

  // make and plot markers
  markers = filteredData.map(function(x) {
    return L.marker([x.geometry.coordinates[1],x.geometry.coordinates[0]])

    .bindPopup (
      "<b>" + x.properties.AGENCY + "</b> <br>" +  // add agency name
      "<a href =" + checkURL(x.properties.WEBSITE_URL) + ">" + removeHTTP(x.properties.WEBSITE_URL) + "</a> <br>" + // add url
      "<a href=tel:" + checkPhoneNum(x.properties.PHONE_NUMBER) + ">" + x.properties.PHONE_NUMBER + "</a>" + // add phone number
      "<p>" +
      x.properties.STREET_ADDRESS + "," + x.properties.ZIP_CODE + "<br>" + // add street address
      "<a href=" + directionsQuery(x.properties.STREET_ADDRESS + ", " + x.properties.ZIP_CODE) + ">" + "Get Directions </a>" // get directions button
    ).openPopup(); 
  })
var markerGroup = new L.featureGroup();

  markers.forEach(function(marker) {
    marker.addTo(markerGroup)
    marker.addTo(map)
  }
    )

  map.flyToBounds(markerGroup.getBounds(), { maxZoom: 16 })

  //set the title

  $('#title').html(pageDefinition.title)
  //set the content
  $('#content').html(pageDefinition.content)
  //move to the bounnding box
  //map.flyToBounds(pageDefinition.bbox)

  if (currentPage === 0) {

    $('#prev').prop("disabled", true)
  } else {
    $('#prev').prop("disabled", false)
  }

if (currentPage === slides.length - 1) {
  $('#next').prop("disabled", true)
} else {
  $('#next').prop("disabled", false)
}

}

var tearDown = function() {
  // remove all plotted data in prep for building the page with new filters etc
  map.eachLayer(function (layer) {
    if (layer != mapTiles){
    map.removeLayer(layer);
    }
});
}


// Ajax to grab json
$.ajax('https://raw.githubusercontent.com/Jalilg/public/main/HousingCounselingAgencies.geojson').done(function(json){
  var parsed = JSON.parse(json)
  data = parsed.features

buildPage(slides[currentPage])
})

$('#next').click(nextPage)
$('#prev').click(prevPage)
//you can use jquery's "hide" function to hide a div, so that when you click 