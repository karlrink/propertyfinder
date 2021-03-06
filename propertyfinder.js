
const version = 'property-finder 2022-05-21 v5';

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

        html += `
        <style>
          div { text-align: center;
                vertical-align: middle;
                margin-top: 10%;
          }
        </style>

        <div>
              <a href="?login"><button type="none">Login</button></a>
        </div>
        `;

        history.pushState({page: 'home'}, "home", "");

    } else {

        document.title = 'PropertyFinder: Home';

        let htmlSegment = `
        <form id="form" onsubmit="submitHomeForm(event)">
          <label for="home-search"></label>
          <input type="search" id="home-search" name="home-search" 
                  placeholder="Property search...">
          <br>
          <button type="submit">Search</button>
        </form>
        <br>
        <div id="form-output"></div>
        `;

        html = TopHTML + htmlSegment + BottomHTML;

        history.pushState({page: 'home'}, "home", "?view=home");
    }

    container.innerHTML = html;

    //history.pushState({page: 'home'}, "home", "?view=home");
}

window.submitHomeForm = submitHomeForm;

async function submitHomeForm(event) {
  
    event.preventDefault();

    const search_input = event.target['home-search'].value;
/*
      "sort": {
          "street_address": {
              "order": "desc"
          }
      },

*/
    const opensearch_data =
    {
      "from": 0,
      "size": 20,
      "query": {
        "multi_match": {
          "query": search_input,
          "fields": ["street_address", "city", "county", "state_or_province",
                     "description", "legal_description", "mls_disclaimer",
                     "property_record_type", "sale_type", "full_street_name"]
        }
      }
    }


    /*
          "fields": ["street_address", "city", "county", "state_or_province",
                     "description", "legal_description", "mls_disclaimer",
                     "property_record_type", "sale_type"]
    */

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

    const response_took    = JSON.parse(JSON.stringify(response['took'])); // these are milliseconds
    console.log(response_took);

    const hits_total_value    = JSON.parse(JSON.stringify(response['hits']['total'].value));
    const hits_total_relation = JSON.parse(JSON.stringify(response['hits']['total'].relation));

    //console.log(hits_total_value);

    let htmlSegment = '';

    htmlSegment += `
    <div>
    <p>
        hits: ${hits_total_relation} ${hits_total_value} (display: 1-20) took: ${response_took} milliseconds
    </p>
    </div>
    `;

    for (let hit in hits) {

        let street_address    = hits[hit]['_source'].street_address;
        let city              = hits[hit]['_source'].city;
        let state_or_province = hits[hit]['_source'].state_or_province;
        let postal_code       = hits[hit]['_source'].postal_code;

        let latitude_hit        = hits[hit]['_source'].latitude;
        let longitude_hit       = hits[hit]['_source'].longitude;

        let picture_data_source_url = hits[hit]['_source'].picture_data_source_url;

        let google_maps_href = `https://maps.google.com/maps?q=${latitude_hit},${longitude_hit}`;

        let amount_hit         = hits[hit]['_source'].amount;
        let rent_hit           = hits[hit]['_source'].rent;
        let pool_hit           = hits[hit]['_source'].pool;

        let currency_us = (amount_hit).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
        });

        let property_record_type = hits[hit]['_source'].property_record_type;

        let rent_or_sale = '';
        if (rent_hit !== null) {
            rent_or_sale = '????';
        } else {
            rent_or_sale = '????';
        }

        let has_pool = '';
        if (pool_hit !== null) {
            has_pool = '????';
        } else {
            has_pool = '';
        }

        let house_type = '';
        if (property_record_type !== null) {
            //house_type = '';

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch

            switch (property_record_type) {

                case 'VacantLand':
                  house_type = '????';
                  break;

                case 'SingleFamilyHome':
                  house_type = '????';
                  break;

                case 'MultifamilyTwoToFourUnits':
                  house_type = '???????';
                  break;

                case 'TownhouseOrCondo':
                  house_type = '????';
                  break;

                case 'Other':
                  house_type = '';
                  break;

                default:
                  house_type = '';
            }

        } else {
            house_type = '';
        }

        // property_record_type: VacantLand ???? 
        // property_record_type: SingleFamilyHome ????  
        // property_record_type: MultifamilyTwoToFourUnits ???????  
        // property_record_type: TownhouseOrCondo ????  

        // property_record_type: Other 

        // bedrooms: 2 
        // baths_total: 1.00 

        // room_list: Bedroom, Full Bath 

        htmlSegment += `
        <div>
          <details>
              <summary>
                  ${street_address} ${city} ${state_or_province} ${postal_code}
                  <a href="${google_maps_href}" target="_blank" rel="noopener noreferrer">????(<small>${latitude_hit}??,${longitude_hit}??</small>)</a>
                  <a href="${picture_data_source_url}" target="_blank" rel="noopener noreferrer">???????</a>
                  ${house_type} ${rent_or_sale} ${currency_us} ${has_pool}
        `;

        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/small

        htmlSegment += `
              </summary>
              <p>
        `;

        for (let item in hits[hit]['_source']){
        
            let value = hits[hit]['_source'][item];

            if (value !== null) {
             //console.log(item);
             //console.log(value);

                    switch (item) {

                      case 'picture_data_source_url':
                          htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                          break;

                      case 'picture_data_url':
                          let image_file = value.split('/').slice(-1);
                          let public_url = 'https://ninfo-property-images.s3.us-west-2.amazonaws.com/' + image_file;
                          htmlSegment += ` ${item}: <a href="${public_url}" target="_blank">${value}</a> <br>`;
                          break;

                      case 'source_url':
                          htmlSegment += ` ${item}: <a href="${value}" target="_blank">${value}</a> <br>`;
                          break;

                      case 'coordinate':
                          htmlSegment += ` ${item}: <a href="https://maps.google.com/maps?q=${latitude_hit},${longitude_hit}" target="_blank">${latitude_hit}??,${longitude_hit}??</a> <br>`;
                          break;

                      default:
                        htmlSegment += ` ${item}: ${value} <br>`;

                    }

            }

        } //end for hits

        htmlSegment += `
              </p>
          </details>
        </div>
        `;

    } //end for

    htmlSegment += `
    <div>
    <br>
      <a href="?view=search">take me to the advanced search...</a>
    </div>
    `;

    document.querySelector('#form-output').innerHTML = htmlSegment;

    history.pushState({page: 'home-submit'}, "home-submit", "?view=home&submit=true");
}


function viewSearch() {

    document.title = 'PropertyFinder: Search';

    let html = '';

    html += `

    <div>
    ???? UNDER CONSTRUCTION ???? 
    <div>
    <br>

    <div>

    <form id="form" onsubmit="submitSearch(event)">
      <label for="search">search:</label>
      <input type="text" id="search" name="search" placeholder="Advanced search...?">
      <br>
      <button type="submit">Search</button>
    </form>

    </div>

    `;

    container.innerHTML = TopHTML + html + BottomHTML;

    const form = document.getElementById('form');

    history.pushState({page: 'search'}, "search", "?view=search");
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
// prevent tabnabbing with rel="noopener noreferrer" https://en.wikipedia.org/wiki/Tabnabbing

function viewInfo() {

    let html = '';

    html += `
    <div>
    `;


    for (const a in localStorage) {
        //console.log(a, ' = ', localStorage[a]);
        html += '<div>' + a + '<input type="text" value="'+ localStorage[a] +'" disabled ></div>';
    }


    html += `
    </div>
    <div>
            <button type="button" onclick="return addLocalStore();">Add Item</button>
            <button type="button" onclick="localStorage.clear();location.reload();">Clear Storage</button>
            <button type="button" onclick="return Login();">Login</button>
            <button type="button" onclick="return Logout();">Logout</button>
    </div>
    <div>
      <p>${version}</p>
    </div>
    `;

    container.innerHTML = TopHTML + html + BottomHTML;

    history.pushState({page: 'info'}, "info", "?view=info");
}

function viewGeoMap() {

    document.title = 'PropertyFinder: Geo Map';

    let html = '';

    html += `

    <div>

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

    </div>

    `;

    container.innerHTML = TopHTML + html + BottomHTML;

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
                rent_or_sale = '????';
            } else {
                //rent_or_sale = '????';
                rent_or_sale = '????';
            }


            let has_pool = '';
            if (pool_hit !== null) {
                has_pool = '????';
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
                          htmlSegment += ` ${item}: <a href="https://maps.google.com/maps?q=${latitude_hit},${longitude_hit}" target="_blank">${latitude_hit}??,${longitude_hit}??</a> <br>`;
                          break;

                      default:

                        htmlSegment += ` ${item}: ${value} <br>`;
                    }

                    //mapLink.href = `https://maps.google.com/maps?q=${latitude},${longitude}`;
                    //mapLink.textContent = `???? ${latitude}??,${longitude}??`;


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

// ???? money w/ wings
// ???? money
// ???? credit card
// ???? dollar sign

function viewGeoSearch() {

    document.title = 'PropertyFinder: Geo Search';

    const url = origin + "/ninfo-property/_search"

    let html = '';

    html += `
    <div>
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
    </div>
    `;

    container.innerHTML = TopHTML + html + BottomHTML;

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
        let htmlSegment = "<pre>" + JSON.stringify(items, null, 2) + "</pre>";

        container.innerHTML = TopHTML + htmlSegment + BottomHTML;

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

    document.title = 'PropertyFinder: My Location';

    let html = '';

    html += `
    <div>
    `;

    html += '<button id="find-me" type="button">Get My Location</button><br/>';

    html += '<div><p id="status"></p></div>';

    html += '<small><a id="map-link" target="_blank"></a></small>';
    html += '<div id="geo-form"></div>';
    html += '<div id="geo-output"></div>';

    html += `
    </div>
    `;

    container.innerHTML = TopHTML + html + BottomHTML;

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
    //mapLink.textContent = `Latitude: ${latitude} ??, Longitude: ${longitude} ??`;

    mapLink.href = `https://maps.google.com/maps?q=${latitude},${longitude}`;
    mapLink.textContent = `????${latitude}??,${longitude}??`;

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
    status.textContent = `????Locating...`;
    navigator.geolocation.getCurrentPosition(success, error);
  }

}

// https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent

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

    let latitude_hit      = hits[hit]['_source'].latitude;
    let longitude_hit     = hits[hit]['_source'].longitude;

    let picture_data_source_url = hits[hit]['_source'].picture_data_source_url;

    let haversine_distance = HaverSine(latitude,longitude,latitude_hit,longitude_hit).toFixed(1);

    //let openstreetmap_href = `https://www.openstreetmap.org/#map=18/${latitude_hit}/${longitude_hit}`;

    let picture_data_url = hits[hit]['_source'].picture_data_url;

    let image_file = '';
    let public_url = '';
    let has_picture = '';

    if (picture_data_url !== null) {
      image_file = picture_data_url.split('/').slice(-1);
      public_url = 'https://ninfo-property-images.s3.us-west-2.amazonaws.com/' + image_file;
      has_picture = ' ???????';
    }

    let google_maps_href = `https://maps.google.com/maps?q=${latitude_hit},${longitude_hit}`;

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
        rent_or_sale = '????';
    } else {
        rent_or_sale = '????';
    }


    let has_pool = '';
    if (pool_hit !== null) {
        has_pool = '????';
    } else {
        has_pool = '';
    }

    htmlSegment += `
    <div>
      <details>
        <summary>
    `;

    htmlSegment += `${street_address} ${city} ${state_or_province} ${postal_code}`;

    htmlSegment += `<br>`;

    htmlSegment += `<small class="type-link">`;

    htmlSegment += `<a href="${google_maps_href}" target="_blank" rel="noopener noreferrer">????</a>`;
    htmlSegment += `${haversine_distance}`;
    htmlSegment += ` (<a href="${google_maps_href}" target="_blank" rel="noopener noreferrer">${latitude_hit}??,${longitude_hit}??</a>) `;
    htmlSegment += `${rent_or_sale}${currency_us}`;

    if (picture_data_url !== null) {
      htmlSegment += ` <a href="${public_url}" target="_blank" rel="noopener noreferrer">${has_picture}</a>`;
    }

    htmlSegment += `${has_pool}`;

    htmlSegment += `</small>`;

    htmlSegment += `
        </summary>
        <p>
    `;

    for (let item in hits[hit]['_source']){
    
      let value = hits[hit]['_source'][item];

      if (value !== null) {
         //console.log(item);
         //console.log(value);
         //htmlSegment += ` ${item}: ${value} <br>`;

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
                                                         target="_blank">${latitude_hit}??,${longitude_hit}??</a> <br>`;
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

  }

  document.querySelector('#geo-output').innerHTML = htmlSegment;

  history.pushState({page: 'mylocation-geo-submit'}, "mylocation-geo-submit", "?view=mylocation&geo=true&submit=true");

}


function viewMaps() {

    document.title = 'PropertyFinder: Property Maps';

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
                  rent_or_sale = '????';
              } else {
                  rent_or_sale = '????';
              }


              let has_pool = '';
              if (pool_hit !== null) {
                  has_pool = '????';
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
                                                         target="_blank">${latitude_hit}??,${longitude_hit}??</a> <br>`;
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

        if (view === 'search') {
            return viewSearch();
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

/* this is the layout */
//<nav class="menu" style="--hue: 248.9758276163942">

const TopHTML = `
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
    <li class="menu__item" style="--x: 10; --y: 21;"><a class="menu__link" href="?">Home</a></li>
    <li class="menu__item" style="--x: 52; --y: 33;"><a class="menu__link" href="?view=geosearch">Geo Distance Search</a></li>
    <li class="menu__item" style="--x: 30; --y: 58;"><a class="menu__link" href="?view=mylocation">My Location</a></li>
    <li class="menu__item" style="--x: 72; --y: 53;"><a class="menu__link" href="?view=geomap">Map Coordinate</a></li>
    <li class="menu__item" style="--x: 72; --y: 10;"><a class="menu__link" href="?view=maps">Map</a></li>
    <li class="menu__item" style="--x: 10; --y: 84;"><a class="menu__link" href="?view=info">Info</a></li>
  </ul>
</nav>
<header class="page-header"></header>
<main class="page-body">
`;

// main <main></main> in the middle

const BottomHTML = `
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
<footer class="page-footer"></footer>
`;


//-----------------------------------------------------------

let run = router();

const done = performance.now() - start;

console.log(version + ' ' + done);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// import declarations may only appear at top level of a module
// <script type="module" src="script.js"></script>

