import axios from 'axios';
import WindRoundGauge from './wind-round-gauge';
// import TempRoundGauge from './temperature-round-gauge';
import TempDewRoundGauge from './tempdew-round-gauge';
import PressureRoundGauge from './pressure-round-gauge';

import { formatDate } from './formatters.mjs';

const minute = 1000 * 60;
let timerId = 0;

const windGauge = new WindRoundGauge('#wind');
const tempGauge = new TempDewRoundGauge('#temperature');
const pressureGauge = new PressureRoundGauge('#pressure');

// tempGauge.test();
// windGauge.test();
// pressureGauge.test();
initialize();
// displayData(getTestData());

function initialize() {
  const icao = getIcao();
  fetchDataForStation(icao);
  startTimer(icao);

  const form = document.getElementById('icao-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const icao = form.querySelector('input').value;
    fetchDataForStation(icao);
    startTimer(icao);
  });
}

function getIcao() {
  // todo: fetch from localstorage
  const defaultStation = 'enva';
  let lastStation = localStorage.getItem('last-station');
  return lastStation || defaultStation;
}

function startTimer(icao) {
  clearInterval(timerId);
  timerId = setInterval(() => {
    fetchDataForStation(icao);
  }, 30 * minute);
}

async function fetchDataForStation(icao) {
  icao = icao.toLowerCase();

  let data = JSON.parse(localStorage.getItem(icao));
  if (data !== null && data.station) {
    // Check stale data
    const now = new Date();
    const fetched = new Date(data.fetched);
    const passedHalfHour = now - fetched > 30 * minute;
    if (passedHalfHour) {
      data = await fetchDataFromApi(icao);
      storeData(data, icao);
    }
  } else {
    data = await fetchDataFromApi(icao);
    storeData(data, icao);
  }

  if (data != null) {
    setLastStation(icao);
    displayData(data);
  }
}

function storeData(data, icao) {
  data.fetched = new Date().getTime();
  localStorage.setItem(icao, JSON.stringify(data));
  return data;
}

function setLastStation(icao) {
  localStorage.setItem('last-station', icao);
}

async function fetchDataFromApi(icao) {
  console.log('Fetching fresh data');

  const url = `https://api.checkwx.com/metar/${icao}/decoded`;
  const apiKey = '7ea07a15ec5c5ab9553d15039a';
  const config = {
    headers: {
      'X-API-Key': apiKey
    }
  };
  const response = await axios.get(url, config);
  console.log(response);

  document.getElementById('error').style.display = 'none';
  if (response.data.results === 0) {
    console.log('No results');
    document.getElementById('error').style.display = 'block';
    return;
  }
  return response.data.data[0];
}

function displayData(data) {
  console.log(data);

  document.title = `Weather for ${data.station.name} - ${data.icao}`;
  document.getElementById('observed').innerHTML = formatDate(new Date(data.observed));
  document.getElementById('fetched').innerHTML = formatDate(new Date());

  updateCeiling(data.ceiling);
  updateConditions(data.conditions);
  updateCloudCover(data.clouds);
  updateWeatherIcon(data);

  windGauge.updateDirection(data.wind.degrees);
  windGauge.updateWindSpeed(data.wind.speed_kts);
  pressureGauge.update(data.barometer.hpa);
  tempGauge.update(data.temperature.celsius, data.dewpoint.celsius);
}

function updateCeiling(ceiling) {
  if (ceiling) {
    document.getElementById('ceiling').style.display = 'block';
    document.getElementById('ceiling-text').innerHTML = `${ceiling.text} (${ceiling.feet_agl})`;
  } else {
    document.getElementById('ceiling').style.display = 'none';
  }
}

function updateCloudCover(clouds) {
  const cloudCoverList = document.getElementById('cloud-cover-list');
  cloudCoverList.innerHTML = '';
  if (clouds.length <= 0) {
    cloudCoverList.style.display = 'none';
    return;
  }
  clouds.forEach(c => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `${c.text} (${c.base_feet_agl})`;
    cloudCoverList.appendChild(listItem);
  });
}

function updateConditions(conditions) {
  const conditionsList = document.getElementById('condition-list');
  conditionsList.innerHTML = '';
  conditionsList.style.display = conditions.length > 0 ? 'block' : 'none';
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
  const isLightCloudCover = data.clouds.some(c => c.code === 'SCT' || c.code === 'FEW');
  const isMediumCloudCover = data.clouds.some(c => c.code === 'BKN');
  const isOvercast = data.clouds.some(c => c.code === 'OVC' || c.code === 'OVX');

  // Set sunny as the default
  let iconKey = '';
  if (isRain && isSnow) {
    iconKey = '12';
  } else {
    if (isRain) { iconKey = '09' }
    if (isSnow) { iconKey = '13' }
  }

  if (!iconKey) {
    if (isLightCloudCover) { iconKey = '02d' }
    if (isMediumCloudCover) { iconKey = '03d' }
    if (isOvercast) { iconKey = '04' }
  }

  if (!iconKey) {
    iconKey = '01d';
  }
  const icon = require(`../assets/icons/weather/${iconKey}.svg`);
  document.getElementById('weather-icon').src = icon;
}

function getTestData() {
  return { "wind": { "degrees": 0, "speed_kts": 1, "speed_mph": 1, "speed_mps": 1 }, "temperature": { "celsius": 1, "fahrenheit": 34 }, "dewpoint": { "celsius": 0, "fahrenheit": 32 }, "humidity": { "percent": 93 }, "barometer": { "hg": 28.88, "hpa": 978, "kpa": 97.79, "mb": 977.92 }, "visibility": { "miles": "2.49", "miles_float": 2.49, "meters": "4,000", "meters_float": 4000 }, "ceiling": { "code": "OVX", "text": "Vertical visibility", "feet_agl": 900, "meters_agl": 274.32 }, "elevation": { "feet": 55.77, "meters": 17 }, "location": { "coordinates": [10.924, 63.457802], "type": "Point" }, "icao": "ENVA", "observed": "2020-03-12T14:50:00.000Z", "raw_text": "ENVA 121450Z VRB01KT 4000 SHRASN VV009 01/00 Q0978 TEMPO 1500 SNRA RMK WIND 670FT VRB02KT", "station": { "name": "Trondheim , Værnes" }, "visiblity": { "vertical": { "feet": 900 } }, "clouds": [{ "code": "OVX", "text": "Vertical visibility", "base_feet_agl": 900, "base_meters_agl": 274.32 }], "conditions": [{ "code": "RA", "text": "Rain" }, { "code": "SN", "text": "Snow" }], "flight_category": "LIFR" };
}