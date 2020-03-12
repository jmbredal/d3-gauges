import axios from 'axios';
import WindRoundGauge from './wind-round-gauge';
// import TempRoundGauge from './temperature-round-gauge';
import TempDewRoundGauge from './tempdew-round-gauge';
import PressureRoundGauge from './pressure-round-gauge';

import { formatDate } from './formatters.mjs';

const windGauge = new WindRoundGauge('#wind');
const tempGauge = new TempDewRoundGauge('#temperature');
const pressureGauge = new PressureRoundGauge('#pressure');

const apiKey = '7ea07a15ec5c5ab9553d15039a';
const config = {
  headers: {
    'X-API-Key': apiKey
  }
};

// tempGauge.test();
// windGauge.test();
// pressureGauge.test();
start();
// displayData(getTestData());

function start() {
  const minute = 1000 * 60;
  fetchData();
  let intervalId = setInterval(() => {
    fetchData();
  }, 30 * minute);

  const form = document.getElementById('icao-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('error').style.display = 'none';
    const icao = form.querySelector('input').value;

    clearInterval(intervalId);
    fetchData(icao);
    intervalId = setInterval(() => {
      fetchData(icao);
    }, 30 * minute);
  });
}

function fetchData(icao = 'enva') {
  const url = `https://api.checkwx.com/metar/${icao}/decoded`;
  axios.get(url, config).then((response) => {
    if (response.data.results === 0) {
      console.log('No results');
      document.getElementById('error').style.display = 'block';
      return;
    }
    displayData(response.data.data[0]);
  });
}

function displayData(data) {
  document.title = `Weather for ${data.station.name} - ${data.icao}`;
  document.getElementById('observed').innerHTML = formatDate(new Date(data.observed));
  document.getElementById('fetched').innerHTML = formatDate(new Date());

  updateConditions(data.conditions);
  updateCloudCover(data.clouds);
  updateWeatherIcon(data);

  windGauge.updateDirection(data.wind.degrees);
  windGauge.updateWindSpeed(data.wind.speed_kts);
  pressureGauge.update(data.barometer.hpa);
  tempGauge.update(data.temperature.celsius, data.dewpoint.celsius);
}

function updateCloudCover(clouds) {
  const cloudCoverList = document.getElementById('cloud-cover-list');
  if (clouds.length <= 0) {
    cloudCoverList.style.display = 'none';
    return;
  }
  clouds.forEach(c => {
    const listItem = document.createElement('li');
    listItem.innerHTML = c.text;
    cloudCoverList.appendChild(listItem);
  });
}

function updateConditions(conditions) {
  const conditionsList = document.getElementById('condition-list');
  if (conditions.length <= 0) {
    conditionsList.style.display = 'none';
    return;
  }
  conditions.forEach(c => {
    const listItem = document.createElement('li');
    listItem.innerHTML = c.text;
    conditionsList.appendChild(listItem);
  });
}

function updateWeatherIcon(data) {
  // Hmm this is going to be messy
  const isRain = data.conditions.some(c => c.code === 'RA');
  const isSnow = data.conditions.some(c => c.code === 'SN');

  let icon = null;
  if (isRain && isSnow) {
    icon = require('../assets/icons/weather/12.svg');
  } else {
    if (isRain) { icon = require('../assets/icons/weather/09.svg'); }
    if (isSnow) { icon = require('../assets/icons/weather/13.svg'); }
  }

  // Set sunny as the default
  if (!icon) { require('../assets/icons/weather/01d.svg'); }
  document.getElementById('weather-icon').src = icon;
}

function getTestData() {
  return {"wind":{"degrees":0,"speed_kts":1,"speed_mph":1,"speed_mps":1},"temperature":{"celsius":1,"fahrenheit":34},"dewpoint":{"celsius":0,"fahrenheit":32},"humidity":{"percent":93},"barometer":{"hg":28.88,"hpa":978,"kpa":97.79,"mb":977.92},"visibility":{"miles":"2.49","miles_float":2.49,"meters":"4,000","meters_float":4000},"ceiling":{"code":"OVX","text":"Vertical visibility","feet_agl":900,"meters_agl":274.32},"elevation":{"feet":55.77,"meters":17},"location":{"coordinates":[10.924,63.457802],"type":"Point"},"icao":"ENVA","observed":"2020-03-12T14:50:00.000Z","raw_text":"ENVA 121450Z VRB01KT 4000 SHRASN VV009 01/00 Q0978 TEMPO 1500 SNRA RMK WIND 670FT VRB02KT","station":{"name":"Trondheim , Værnes"},"visiblity":{"vertical":{"feet":900}},"clouds":[{"code":"OVX","text":"Vertical visibility","base_feet_agl":900,"base_meters_agl":274.32}],"conditions":[{"code":"RA","text":"Rain"},{"code":"SN","text":"Snow"}],"flight_category":"LIFR"};
}