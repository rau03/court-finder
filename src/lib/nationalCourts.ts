// National database of pickleball courts
// This serves as a backup when API searches don't return enough results

interface NationalCourt {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

// This is a growing collection of verified pickleball courts across the USA
export const nationalCourtDatabase: NationalCourt[] = [
  // Florida Courts
  {
    id: "fl_orl_1",
    name: "Fort Gatlin Recreation Complex",
    address: "2009 Lake Margaret Dr, Orlando, FL 32806",
    city: "Orlando",
    state: "FL",
    zipCode: "32806",
    indoor: false,
    location: {
      lat: 28.5131,
      lng: -81.3571,
    },
  },
  {
    id: "fl_orl_2",
    name: "Dover Shores Community Center",
    address: "1400 Gaston Foster Rd, Orlando, FL 32812",
    city: "Orlando",
    state: "FL",
    zipCode: "32812",
    indoor: false,
    location: {
      lat: 28.5249,
      lng: -81.3287,
    },
  },
  {
    id: "fl_orl_3",
    name: "Demetree Park",
    address: "955 S Wymore Rd, Winter Park, FL 32789",
    city: "Winter Park",
    state: "FL",
    zipCode: "32789",
    indoor: false,
    location: {
      lat: 28.5873,
      lng: -81.3862,
    },
  },
  {
    id: "fl_orl_4",
    name: "Orlando Tennis Center",
    address: "649 W Livingston St, Orlando, FL 32801",
    city: "Orlando",
    state: "FL",
    zipCode: "32801",
    indoor: false,
    location: {
      lat: 28.5448,
      lng: -81.387,
    },
  },
  {
    id: "fl_orl_5",
    name: "Lake Cane Tennis Center",
    address: "10865 Cady Way, Orlando, FL 32817",
    city: "Orlando",
    state: "FL",
    zipCode: "32817",
    indoor: false,
    location: {
      lat: 28.595,
      lng: -81.3118,
    },
  },
  {
    id: "fl_mia_1",
    name: "Tropical Park Pickleball Courts",
    address: "7900 SW 40th St, Miami, FL 33155",
    city: "Miami",
    state: "FL",
    zipCode: "33155",
    indoor: false,
    location: {
      lat: 25.7336,
      lng: -80.323,
    },
  },
  {
    id: "fl_mia_2",
    name: "Kendall Indian Hammocks Park",
    address: "11395 SW 79th St, Miami, FL 33173",
    city: "Miami",
    state: "FL",
    zipCode: "33173",
    indoor: false,
    location: {
      lat: 25.6951,
      lng: -80.3783,
    },
  },

  // California Courts
  {
    id: "ca_la_1",
    name: "Venice Beach Recreation Center",
    address: "1800 Ocean Front Walk, Venice, CA 90291",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90291",
    indoor: false,
    location: {
      lat: 33.985,
      lng: -118.4695,
    },
  },
  {
    id: "ca_la_2",
    name: "Poinsettia Recreation Center",
    address: "7341 Willoughby Ave, Los Angeles, CA 90046",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90046",
    indoor: false,
    location: {
      lat: 34.086,
      lng: -118.3491,
    },
  },
  {
    id: "ca_la_3",
    name: "Griffith Park Pickleball Courts",
    address: "3401 Riverside Dr, Los Angeles, CA 90027",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90027",
    indoor: false,
    location: {
      lat: 34.1193,
      lng: -118.2781,
    },
  },
  {
    id: "ca_sd_1",
    name: "Bobby Riggs Racket & Paddle",
    address: "875 Santa Fe Dr, Encinitas, CA 92024",
    city: "Encinitas",
    state: "CA",
    zipCode: "92024",
    indoor: true,
    location: {
      lat: 33.0373,
      lng: -117.2719,
    },
  },

  // New York Courts
  {
    id: "ny_nyc_1",
    name: "Central Park Tennis Center",
    address: "Central Park, New York, NY 10019",
    city: "New York",
    state: "NY",
    zipCode: "10019",
    indoor: false,
    location: {
      lat: 40.7736,
      lng: -73.9716,
    },
  },
  {
    id: "ny_nyc_2",
    name: "Court 16 Long Island City",
    address: "13-06 Queens Plaza S, Long Island City, NY 11101",
    city: "New York",
    state: "NY",
    zipCode: "11101",
    indoor: true,
    location: {
      lat: 40.7506,
      lng: -73.9402,
    },
  },

  // Texas Courts
  {
    id: "tx_dal_1",
    name: "Fretz Park Tennis Center",
    address: "6950 Belt Line Rd, Dallas, TX 75254",
    city: "Dallas",
    state: "TX",
    zipCode: "75254",
    indoor: false,
    location: {
      lat: 32.9511,
      lng: -96.7854,
    },
  },
  {
    id: "tx_hou_1",
    name: "Memorial Park Tennis Center",
    address: "1500 Memorial Loop Dr, Houston, TX 77007",
    city: "Houston",
    state: "TX",
    zipCode: "77007",
    indoor: false,
    location: {
      lat: 29.7636,
      lng: -95.432,
    },
  },
  {
    id: "tx_aus_1",
    name: "Austin Tennis Center",
    address: "7800 Johnny Morris Rd, Austin, TX 78724",
    city: "Austin",
    state: "TX",
    zipCode: "78724",
    indoor: false,
    location: {
      lat: 30.3318,
      lng: -97.6508,
    },
  },

  // Illinois Courts
  {
    id: "il_chi_1",
    name: "Maggie Daley Park Pickleball Courts",
    address: "337 E Randolph St, Chicago, IL 60601",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    indoor: false,
    location: {
      lat: 41.8855,
      lng: -87.6213,
    },
  },

  // Pennsylvania Courts
  {
    id: "pa_phi_1",
    name: "FDR Park Tennis & Pickleball",
    address: "1500 Pattison Ave, Philadelphia, PA 19145",
    city: "Philadelphia",
    state: "PA",
    zipCode: "19145",
    indoor: false,
    location: {
      lat: 39.9052,
      lng: -75.1747,
    },
  },

  // Arizona Courts
  {
    id: "az_phx_1",
    name: "Pecos Park",
    address: "17010 S 48th St, Phoenix, AZ 85048",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85048",
    indoor: false,
    location: {
      lat: 33.2975,
      lng: -111.9776,
    },
  },
  {
    id: "az_tuc_1",
    name: "Morris K. Udall Park",
    address: "7200 E Tanque Verde Rd, Tucson, AZ 85715",
    city: "Tucson",
    state: "AZ",
    zipCode: "85715",
    indoor: false,
    location: {
      lat: 32.2498,
      lng: -110.7727,
    },
  },
];

// The database will continue to grow as more courts are added.
// Currently has 20 courts across major US cities.
