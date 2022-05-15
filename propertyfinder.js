
const version = 'propertyfinder.2022-05-14';

/* 
 * SPA (Single-Page Application)
 * https://developer.mozilla.org/en-US/docs/Glossary/SPA 
 */

const start = performance.now();

const origin = localStorage.getItem('origin');
const base64 = localStorage.getItem('base64');

const container = document.getElementById('container');

import { MarkerClusterer } from "https://cdn.skypack.dev/@googlemaps/markerclusterer@2.0.5";

const google_maps_api_key = "AIzaSyCXefUTU9KCoT8Na7AiwLpcp6ZmXAtLVpk";
/* google_maps_api_key
  this is a hard coded key that is restricted at/by the provider (google)
  you can get your own key and find out more regarding restricted api keys
  https://developers.google.com/maps/documentation/javascript/get-api-key
  https://developers.google.com/maps/api-security-best-practices
*/


async function getResponse(response) {
    if ( ! response.ok) {
        throw new Error(response.status + ' ' + response.statusText);
    }
    return response;
}


window.Login = Login;
function Login() {

    //let login_origin = window.prompt("url: ", 'http://127.0.0.1:9200');
    let login_origin = 'https://opensearch.nationsinfocorp.com';
    let login_user = window.prompt("username: ");
    let login_pass = window.prompt("password: ");
    let login_base64 = btoa(login_user + ':' + login_pass);

    localStorage.setItem('base64', login_base64);
    localStorage.setItem('origin', login_origin);

    history.pushState({page: 'login'}, "login", "?login=true");
    location.replace('?view=home');
}


window.Logout = Logout;
function Logout() {
    localStorage.clear();
    history.pushState({page: 'logout'}, "logout", "?logout=true");
    location.replace('?');
}


window.addLocalStore = addLocalStore;
function addLocalStore() {
   const item_name  = window.prompt("name: ");
   const item_value = window.prompt("value: ");
   localStorage.setItem(item_name, item_value);
   history.pushState({page: 'addLocalStore'}, "addLocalStore", "?view=info");
   location.replace('?view=info');
}


function viewHome() {

    //document.title = 'Home';

    let html = '';

    if ( ! localStorage.getItem('base64') ) {

        document.title = 'Login Required';

        // The <center> tag was used in HTML4 to center-align text. Not Supported in HTML5.
        // https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align

        html += `
        <style>
          div { text-align: center;
                vertical-align: middle;
                margin-top: 10%;
          }
        </style>

        <div>
              <a href="?login"><button type="button">Login</button></a>
        </div>
        `;

        //history.pushState({page: 'home'}, "home", "?view=home");
        history.pushState({page: 'home'}, "home", "");

    } else {

        document.title = 'Home';

/*
        html += `
        <div class="wrapper">
            <header class="page-header">

                <a href="?"><button type="button">Home</button></a>
                <a href="?view=geosearch"><button type="button">Geo Search</button></a>
                <a href="?view=mylocation"><button type="button">My Location</button></a>
                <a href="?view=geomap"><button type="button">GeoMap</button></a>
                <a href="?view=maps"><button type="button">Maps</button></a>

            </header>
            <main class="page-body">

              <label for="property-search"></label>
              <input type="search" id="property-search" name="property-search"
                     placeholder="Property search...">

              <button type="button">Search</button>

            </main>
            <footer class="page-footer">
                <a href="?view=info"><button type="button">Info</button></a>
            </footer>
        </div>
        `;
*/

        html += `

<nav class="menu" style="--hue: 248.9758276163942">
  <input class="menu__toggle" id="menu-toggle" type="checkbox"/>
  <label class="menu__toggle-label" for="menu-toggle"></label>
  <label class="menu__toggle-label menu__toggle-label--closer" for="menu-toggle">
    <svg class="menu__icon" preserveAspectRatio="xMinYMin" viewBox="0 0 24 24">
      <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path>
    </svg>
    <svg class="menu__icon" preserveAspectRatio="xMinYMin" viewBox="0 0 24 24">
      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
    </svg>
  </label>
  <ul class="menu__content">
    <li class="menu__item" style="--x: 35; --y: 21;"><a class="menu__link" href="?">HOME</a></li>
    <li class="menu__item" style="--x: 52; --y: 33;"><a class="menu__link" href="#ABOUT">ABOUT</a></li>
    <li class="menu__item" style="--x: 26; --y: 61;"><a class="menu__link" href="#CONTACT">CONTACT</a></li>
    <li class="menu__item" style="--x: 72; --y: 53;"><a class="menu__link" href="?view=maps">Maps</a></li>
  </ul>
</nav>

<main>

<!--
  <section id="HOME">HOME</section>
  <section id="ABOUT">ABOUT</section>
  <section id="CONTACT">CONTACT</section>
  <section id="WORK">WORK</section>
-->

              <label for="property-search"></label>
              <input type="search" id="property-search" name="property-search"
                     placeholder="Property search...">

              <button type="button">Search</button>


</main>

<svg style="position: absolute; left: 100%">
  <defs>
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="BLUR"></feGaussianBlur>
      <feColorMatrix in="BLUR" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="GOO"></feColorMatrix>
      <feBlend in="SourceGraphic" in2="goo"></feBlend>
    </filter>
  </defs>
</svg>

        `;



        history.pushState({page: 'home'}, "home", "?view=home");
    }

    container.innerHTML = html;

    //history.pushState({page: 'home'}, "home", "?view=home");
}


function viewInfo() {

    let html = '';

    html += `
    <div class="wrapper">
        <header class="page-header">
            <a href="?"><button type="button">Home</button></a>
        </header>
        <main class="page-body">
    `;


    for (const a in localStorage) {
        //console.log(a, ' = ', localStorage[a]);
        html += '<div>' + a + '<input type="text" value="'+ localStorage[a] +'" disabled ></div>';
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button

    html += `
        </main>
        <footer class="page-footer">
            <button type="button" onclick="return addLocalStore();">Add Item</button>
            <button type="button" onclick="localStorage.clear();location.reload();">Clear Storage</button>
            <button type="button" onclick="return Login();">Login</button>
            <button type="button" onclick="return Logout();">Logout</button>
        </footer>
    </div>
    `;

    container.innerHTML = html;

    history.pushState({page: 'info'}, "info", "?view=info");
}

function viewGeoMap() {

    document.title = 'Geo Map';

    let html = '';

    html += `

    <div class="wrapper">
        <header class="page-header">
            <a href="?"><button type="button">Home</button></a>
            <a href="?view=geomap"><button type="button">Geo Map</button></a>
        </header>
        <main class="page-body">

    <form id="form" onsubmit="submitGeoMap(event)">
      <br>
      <label for="latitude">latitude:</label>
      <input type="text" id="latitude" name="latitude" value="34.1895294">
      <br>
      <label for="longitude">longitude:</label>
      <input type="text" id="longitude" name="longitude" value="-118.624725">
      <br>
      <button type="submit">Map Coordinates</button>
    </form>

        </main>
        <footer class="page-footer">
        </footer>
    </div>

    `;

    container.innerHTML = html;

    const form = document.getElementById('form');

    history.pushState({page: 'geomap'}, "geomap", "?view=geomap");
}


window.submitGeoMap = submitGeoMap;
async function submitGeoMap(event) {

    event.preventDefault();

    //const google_maps_api_key = "AIzaSyCXefUTU9KCoT8Na7AiwLpcp6ZmXAtLVpk";

    var script_polyfill = document.createElement('script');
    script_polyfill.src = 'https://polyfill.io/v3/polyfill.min.js?features=default';
    script_polyfill.async = true;

    var script_googlemaps = document.createElement('script');
    //script_googlemaps.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap';
    script_googlemaps.src = `https://maps.googleapis.com/maps/api/js?key=${google_maps_api_key}&callback=initMap`;
    script_googlemaps.async = true;

    //var script_markerclusterer = document.createElement('script');
    //script_markerclusterer.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
    //script_markerclusterer.async = true;
    //import { MarkerClusterer } from "https://cdn.skypack.dev/@googlemaps/markerclusterer@2.0.5";

    document.head.appendChild(script_polyfill);
    document.head.appendChild(script_googlemaps);

    const latitude = event.target['latitude'].value;
    const longitude = event.target['longitude'].value;

    console.log(latitude);
    console.log(longitude);

    const opensearch_data =
    {
      "query": {
        "match_all": {}
      },
        "sort": [
        {
          "_geo_distance": {
            "coordinate": {
              "lat": parseFloat(latitude),
              "lon": parseFloat(longitude)
            },
            "order": "asc",
            "unit": "km",
            "mode": "min",
            "distance_type": "arc",
            "ignore_unmapped": true
          }
        }
      ]
    }

    const url = origin + "/ninfo-property/_search";

    const headers = {};
    headers['Authorization'] = 'Basic ' + base64;
    headers['Content-Type'] = 'application/json';

    async function initMap() {

        const post = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: headers,
          body: JSON.stringify(opensearch_data)
        })
          .then(getResponse)
          .catch(err => document.write('Request Failed ', err));

        const response = await post.json();

        const hits = JSON.parse(JSON.stringify(response['hits']['hits']));

        const labels = [];
        const locations = [];
        const details = {};
        let count = 0;

        for (let hit in hits) {

            let street_address_hit = hits[hit]['_source'].street_address;
            let latitude_hit       = hits[hit]['_source'].latitude;
            let longitude_hit      = hits[hit]['_source'].longitude;

            let amount_hit         = hits[hit]['_source'].amount;
            let rent_hit           = hits[hit]['_source'].rent;

            // rent: 6400 
            // there is also sale_type: Rental 

            let pool_hit           = hits[hit]['_source'].pool;

            labels.push(street_address_hit);

            //labels.push(String(amount_hit));

            locations.push({"lat": latitude_hit, "lng": longitude_hit});

            let currency_us = (amount_hit).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
            });

            let rent_or_sale = '';
            if (rent_hit !== null) {
                rent_or_sale = '💳';
            } else {
                //rent_or_sale = '💰';
                rent_or_sale = '💵';
            }


            let has_pool = '';
            if (pool_hit !== null) {
                has_pool = '🏊';
            } else {
                has_pool = '';
            }


            let htmlSegment = '';

            htmlSegment += `
            <div>
            <details closed>

              <summary>

               ${rent_or_sale} ${currency_us} ${has_pool} <br>

              </summary>

              <p>
            `;

            for (let item in hits[hit]['_source']){

                let value = hits[hit]['_source'][item];

                if (value !== null) {

                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch

                    switch (item) {

                      case 'picture_data_source_url':
                          htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                          break;

                      case 'picture_data_url':
                          // picture_data_url: /local_images/4ea/4eab11c9aa3dca632472e598a9bbb0ad8c0d3ea9.jpg 
                          // https://ninfo-property-images.s3.us-west-2.amazonaws.com/4eab11c9aa3dca632472e598a9bbb0ad8c0d3ea9.jpg

                          //console.log(value.split())

                          //let image_file = '4eab11c9aa3dca632472e598a9bbb0ad8c0d3ea9.jpg';

                          let image_file = value.split('/').slice(-1);
                          let public_url = 'https://ninfo-property-images.s3.us-west-2.amazonaws.com/' + image_file;

                          //console.log(public_url);

                          htmlSegment += ` ${item}: <a href="${public_url}" target="_blank">${value}</a> <br>`;
                          break;

                      case 'source_url':
                          htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                          break;

                      case 'coordinate':
                          htmlSegment += ` ${item}: <a href="https://maps.google.com/maps?q=${latitude_hit},${longitude_hit}" target="_blank">${latitude_hit}°,${longitude_hit}°</a> <br>`;
                          break;

                      default:

                        htmlSegment += ` ${item}: ${value} <br>`;
                    }

                    //mapLink.href = `https://maps.google.com/maps?q=${latitude},${longitude}`;
                    //mapLink.textContent = `📍 ${latitude}°,${longitude}°`;


                    /*
                    if (item == 'picture_data_source_url') {
                        htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                    } else {
                        htmlSegment += ` ${item}: ${value} <br>`;
                    }
                    */
                }

            }

            htmlSegment += `
              </p>
            </details>
            </div>
            `;


            details[count] = htmlSegment;

            count += 1;
        }

        //console.log(latitude);
        //console.log(longitude);

        const map = new google.maps.Map(document.getElementById("container"), {
            //center: { lat: 34.1895294, lng: -118.624725 },
            center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
            zoom: 15,
        });

        const infoWindow = new google.maps.InfoWindow({
            content: "",
            disableAutoPan: true,
        });

        const markers = locations.map((position, i) => {

                //console.log('this is i ' + i);

                const label = labels[i % labels.length];

                //const detail = details[

                //const label = 'who do';

                const marker = new google.maps.Marker({
                  position,
                  label,
                });

                marker.addListener("click", () => {

                  //infoWindow.setContent(label);
                  //infoWindow.setContent('jo jo here');

                  //const htmlContent = `
                  //<div>
                  //  <h1>hello</h1>
                  //  <div>
                  //    <p>Wow data</p>
                  //  </div>
                  //</div>
                  //`;

                  const htmlContent = details[i];

                  infoWindow.setContent(htmlContent);
                  infoWindow.open(map, marker);

                });
                return marker;
        });

        new MarkerClusterer({ markers, map });

    } //async function initMap


    window.initMap = initMap;
    history.pushState({page: 'geomap'}, "geomap-submit", "?view=geomap&submit=true");
}

// https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple-max
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details

// sale
// rent

// 💸 money w/ wings
// 💰 money
// 💳 credit card
// 💲 dollar sign

function viewGeoSearch() {

    document.title = 'Geo Search';

    //const url = "https://opensearch.nationsinfocorp.com/ninfo-property/_search"
    const url = origin + "/ninfo-property/_search"

    let html = '';

    html += `
    <div class="wrapper">
        <header class="page-header">
            <a href="?"><button type="button">Home</button></a>
            <a href="?view=geosearch"><button type="button">Geo Search</button></a>
        </header>
        <main class="page-body">
    `;


    html += `
    <form id="form" action="${url}" method="post">
      <br>
      <label for="latitude">latitude:</label>
      <input type="text" id="latitude" name="latitude" value="34.1895294">
      <br>
      <label for="longitude">longitude:</label>
      <input type="text" id="longitude" name="longitude" value="-118.624725">
      <br>
      <label for="distance">distance:</label>
      <input type="text" id="distance" name="distance" value="10">
      <br>
      <button type="submit">Post</button>
    </form>
    `;

    html += `
        </main>
        <footer class="page-footer">
        </footer>
    </div>
    `;

    container.innerHTML = html;

    const form = document.getElementById('form');

    window.addEventListener("load", function () {

      async function sendData() {

        var form_data = {};

        for (const pair of new FormData(form)) {
            form_data[pair[0]] = pair[1];
            //console.log(pair[0], pair[1]);
        }

        const opensearch_data = 
        { "query": {
            "bool": {
              "filter": {
                "geo_distance": {
                  "distance": form_data['distance'] + "km",
                  "coordinate": {
                    "lat": parseFloat(form_data['latitude']),
                    "lon": parseFloat(form_data['longitude'])
                  }
                }
              }
            }
          }
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + base64,
          },
          body: JSON.stringify(opensearch_data),
        })
          .then(getResponse)
          .catch(err => container.innerHTML = 'ResponseError: ' + err );

        const items = await response.json()
          .catch(err => container.innerHTML = err);

        //alert(JSON.stringify(items, null, 2));
        container.innerHTML = "<pre>" + JSON.stringify(items, null, 2) + "</pre>";

      }

      // take over submit event.
      form.addEventListener("submit", function ( event ) {
        event.preventDefault();
        sendData();
      } );

    } );

    history.pushState({page: 'geosearch'}, "geosearch", "?view=geosearch");
}


function viewMyLocation() {

    document.title = 'My Location';

    let html = '';

    html += `
    <div class="wrapper">
        <header class="page-header">
            <a href="?"><button type="button">Home</button></a>
            <a href="?view=mylocation"><button type="button">My Location</button></a>
        </header>
        <main class="page-body">
    `;

    html += '<button id="find-me" type="button">Get My Location</button><br/>';
    html += '<p id="status"></p>';
    html += '<a id="map-link" target="_blank"></a>';
    html += '<div id="geo-form"></div>';
    html += '<div id="geo-output"></div>';

    html += `
        </main>
        <footer class="page-footer">
        </footer>
    </div>
    `;

    container.innerHTML = html;

    document.querySelector('#find-me').addEventListener('click', geoFindMe);

    history.pushState({page: 'mylocation'}, "mylocation", "?view=mylocation");
}

function geoFindMe() {

  const status = document.querySelector('#status');
  const mapLink = document.querySelector('#map-link');
  const geoForm = document.querySelector('#geo-form');
  const geoOut = document.querySelector('#geo-output');

  mapLink.href = '';
  mapLink.textContent = '';
  geoForm.innerHTML = '';

  function success(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = '';
    //mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    //mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

    mapLink.href = `https://maps.google.com/maps?q=${latitude},${longitude}`;
    mapLink.textContent = `📍 ${latitude}°,${longitude}°`;

    geoForm.innerHTML = `
    <form onsubmit="submitGeoForm(event)">
      <br>
      <label for="latitude">latitude:</label>
      <input type="text" id="latitude" name="latitude" value="${latitude}">
      <br>
      <label for="longitude">longitude:</label>
      <input type="text" id="longitude" name="longitude" value="${longitude}">
      <br>
      <button type="submit">Geo Search</button>
    </form>
    `;

    history.pushState({page: 'mylocation-geo'}, "mylocation-geo", "?view=mylocation&geo=true");
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(success, error);
  }

}


window.submitGeoForm = submitGeoForm;

async function submitGeoForm(event) {
  
  event.preventDefault();

  const latitude = event.target['latitude'].value;
  const longitude = event.target['longitude'].value;
  //const distance = event.target['distance'].value;

  //console.log(latitude);
  //console.log(longitude);

  const opensearch_data =
    {
      "query": {
        "match_all": {}
      },
        "sort": [
        {
          "_geo_distance": {
            "coordinate": {
              "lat": parseFloat(latitude),
              "lon": parseFloat(longitude)
            },
            "order": "asc",
            "unit": "km",
            "mode": "min",
            "distance_type": "arc",
            "ignore_unmapped": true
          }
        }
      ]
    }

  const url = origin + "/ninfo-property/_search";

  const headers = {};
  headers['Authorization'] = 'Basic ' + base64;
  headers['Content-Type'] = 'application/json';

  const post = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: headers,
    body: JSON.stringify(opensearch_data)
  })
    .then(getResponse)
    .catch(err => document.write('Request Failed ', err));

  const response = await post.json();

  let htmlSegment = '';

  const hits = JSON.parse(JSON.stringify(response['hits']['hits']));

  for (let hit in hits) {
  
    let street_address    = hits[hit]['_source'].street_address;
    let city              = hits[hit]['_source'].city;
    let state_or_province = hits[hit]['_source'].state_or_province;
    let postal_code       = hits[hit]['_source'].postal_code;

    let latitude_2        = hits[hit]['_source'].latitude;
    let longitude_2       = hits[hit]['_source'].longitude;

    let picture_data_source_url = hits[hit]['_source'].picture_data_source_url;

    let haversine_distance = HaverSine(latitude,longitude,latitude_2,longitude_2).toFixed(1);

    let openstreetmap_href = `https://www.openstreetmap.org/#map=18/${latitude_2}/${longitude_2}`;

    let google_maps_href = `https://maps.google.com/maps?q=${latitude_2},${longitude_2}`;

    //htmlSegment += street_address + ' ' + city + ' ' + state_or_province + ' ' + postal_code + '<br>';

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details

    htmlSegment += `<div>`;
    htmlSegment += `<details>`;
    htmlSegment += `<summary>`;
    htmlSegment += `${street_address} ${city} ${state_or_province} ${postal_code}`;
    htmlSegment += `( ${haversine_distance} `;
    // prevent tabnabbing with rel="noopener noreferrer" https://en.wikipedia.org/wiki/Tabnabbing

    //htmlSegment += `<a href="${openstreetmap_href}" target="_blank" rel="noopener noreferrer">${latitude_2},${longitude_2}</a>`;
    //htmlSegment += ` <a href="${google_maps_href}" target="_blank" rel="noopener noreferrer">📍</a>)`;
    //htmlSegment += ` 📍 ${latitude_2},${longitude_2} ) `;

    htmlSegment += ` <a href="${google_maps_href}" target="_blank" rel="noopener noreferrer">📍 ${latitude_2},${longitude_2}</a> )`;

    htmlSegment += ` <a href="${picture_data_source_url}" target="_blank" rel="noopener noreferrer">👁️</a>`;

    htmlSegment += `</summary>`;

    htmlSegment += `<p>`;

    for (let item in hits[hit]['_source']){
    
      let value = hits[hit]['_source'][item];

      if (value !== null) {
         //console.log(item);
         //console.log(value);
         htmlSegment += ` ${item}: ${value} <br>`;
      }

    }

    htmlSegment += `</p>`;
    htmlSegment += `</details>`;
    htmlSegment += `</div>`;

  }

  document.querySelector('#geo-output').innerHTML = htmlSegment;

  history.pushState({page: 'mylocation-geo-submit'}, "mylocation-geo-submit", "?view=mylocation&geo=true&submit=true");

}


function viewMaps() {

    document.title = 'Property Maps';

    var script_polyfill = document.createElement('script');
    script_polyfill.src = 'https://polyfill.io/v3/polyfill.min.js?features=default';
    script_polyfill.async = true;

    var script_googlemaps = document.createElement('script');
    //script_googlemaps.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap';
    script_googlemaps.src = `https://maps.googleapis.com/maps/api/js?key=${google_maps_api_key}&callback=initMap`;
    script_googlemaps.async = true;

    //var script_markerclusterer = document.createElement('script');
    //script_markerclusterer.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
    //script_markerclusterer.async = true;
    //import { MarkerClusterer } from "https://cdn.skypack.dev/@googlemaps/markerclusterer@2.0.5";

    document.head.appendChild(script_polyfill);
    document.head.appendChild(script_googlemaps);
    //document.head.appendChild(script_markerclusterer);

    async function initMap() {

          const geoCoords = async () => {
            const pos = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
        
            return {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
          };

          // wait for coords.lat, coords.lng to return
          const coords = await geoCoords();

          console.log(coords.lat);
          console.log(coords.lng);

          // now get opensearch data for coords.lat, coords.lng

          const opensearch_data =
            {
              "query": {
                "match_all": {}
              },
                "sort": [
                {
                  "_geo_distance": {
                    "coordinate": {
                      "lat": parseFloat(coords.lat),
                      "lon": parseFloat(coords.lng)
                    },
                    "order": "asc",
                    "unit": "km",
                    "mode": "min",
                    "distance_type": "arc",
                    "ignore_unmapped": true
                  }
                }
              ]
            }

          const url = origin + "/ninfo-property/_search";

          const headers = {};
          headers['Authorization'] = 'Basic ' + base64;
          headers['Content-Type'] = 'application/json';

          const post = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: JSON.stringify(opensearch_data)
          })
            .then(getResponse)
            .catch(err => document.write('Request Failed ', err));

          const response = await post.json();

          const hits = JSON.parse(JSON.stringify(response['hits']['hits']));

          const labels = [];
          const locations = [];
          const details = {};
          let count = 0;

          for (let hit in hits) {

              let street_address_hit = hits[hit]['_source'].street_address;
              let latitude_hit       = hits[hit]['_source'].latitude;
              let longitude_hit      = hits[hit]['_source'].longitude;

              let amount_hit         = hits[hit]['_source'].amount;
              let rent_hit           = hits[hit]['_source'].rent;
              let pool_hit           = hits[hit]['_source'].pool;

              let currency_us = (amount_hit).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
              });

              let rent_or_sale = '';
              if (rent_hit !== null) {
                  rent_or_sale = '💳';
              } else {
                  rent_or_sale = '💵';
              }


              let has_pool = '';
              if (pool_hit !== null) {
                  has_pool = '🏊';
              } else {
                  has_pool = '';
              }

              let htmlSegment = '';

              htmlSegment += `
              <div>
              <details closed>

                <summary>

                 ${rent_or_sale} ${currency_us} ${has_pool} <br>

                </summary>

                <p>
              `;

              for (let item in hits[hit]['_source']){

                  let value = hits[hit]['_source'][item];

                  if (value !== null) {

                      switch (item) {

                        case 'picture_data_source_url':
                            htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                            break;
  
                        case 'picture_data_url':
                          // picture_data_url: /local_images/4ea/4eab11c9aa3dca632472e598a9bbb0ad8c0d3ea9.jpg 
                          // https://ninfo-property-images.s3.us-west-2.amazonaws.com/4eab11c9aa3dca632472e598a9bbb0ad8c0d3ea9.jpg

                            let image_file = value.split('/').slice(-1);
                            let public_url = 'https://ninfo-property-images.s3.us-west-2.amazonaws.com/' + image_file;
  
                            htmlSegment += ` ${item}: <a href="${public_url}" target="_blank">${value}</a> <br>`;
                            break;

                        case 'source_url':
                            htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                            break;

                        case 'coordinate':
                            htmlSegment += ` ${item}: <a href="https://maps.google.com/maps?q=${latitude_hit},${longitude_hit}" 
                                                         target="_blank">${latitude_hit}°,${longitude_hit}°</a> <br>`;
                            break;

                        default:

                          htmlSegment += ` ${item}: ${value} <br>`;
                      }

                  }

              }

              htmlSegment += `
                </p>
              </details>
              </div>
              `;


              labels.push(street_address_hit);
              locations.push({"lat": latitude_hit, "lng": longitude_hit});
              details[count] = htmlSegment;
              count += 1;
          }

          const map = new google.maps.Map(document.getElementById("container"), {
            //center: { lat: 34.1895294, lng: -118.624725 },
            center: { lat: coords.lat, lng: coords.lng },
            zoom: 15,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: "",
            disableAutoPan: true,
          });


          const markers = locations.map((position, i) => {
            const label = labels[i % labels.length];
            const marker = new google.maps.Marker({
              position,
              label,
            });

            marker.addListener("click", () => {

              const htmlContent = details[i];

              infoWindow.setContent(htmlContent);
              infoWindow.open(map, marker);

            });
            return marker;
          });

          new MarkerClusterer({ markers, map });

    } // async function initMap()

    window.initMap = initMap;

    history.pushState({page: 'maps'}, "maps", "?view=maps&true");

}

// This function takes in latitude and longitude of two location 
// and returns the distance between them as the crow flies (in km)
// https://en.wikipedia.org/wiki/Haversine_formula
function HaverSine(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}
//alert(HaverSine(59.3293371,13.4877472,59.3225525,13.4619422).toFixed(1));

//-----------------------------------------------------------

//const location_href = new URL(location.href);
const params = new URLSearchParams(location.search);
const view = params.get('view');

function router() {

    if (params.has('logout')) {
        return Logout();
    }

    if (params.has('login')) {
        return Login();
    }

    if (params.has('view')) {

        if (view === 'info') {
            return viewInfo();
        }

        if (view === 'home') {
            return viewHome();
        }

        if (view === 'mylocation') {
            return viewMyLocation();
        }

        if (view === 'geosearch') {
            return viewGeoSearch();
        }

        if (view === 'geomap') {
            return viewGeoMap();
        }

        if (view === 'maps') {
            return viewMaps();
        }

    }

    /*
    if ( ! localStorage.getItem('base64') ) {
      return Login();
    }
    */

    return viewHome();
}

//-----------------------------------------------------------

/*
window.addEventListener('popstate', function(event) {
    console.log('event popstate activated');
    history.go(-1);
});

window.addEventListener('hashchange', function(event) {
  console.log('hashchange');
});
*/

//-----------------------------------------------------------

let run = router();

const done = performance.now() - start;

console.log(version + ' ' + done);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// import declarations may only appear at top level of a module
// <script type="module" src="script.js"></script>

