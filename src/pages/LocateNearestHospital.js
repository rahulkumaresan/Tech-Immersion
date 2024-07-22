import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  FormLabel,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";

const LocateNearestHospital = () => {
  const [hospitalData, setHospitalData] = useState();

  const navigate = useNavigate();

  function gotoHome() {
    navigate("/home");
  }
  const [dept, setDept] = useState("");
  const [nearestHospital, setNearestHospital] = useState("");
  const [distanceHospital, setDistanceHospital] = useState("");
  const [currentLocationAvbl, setCurrentLocationAvbl] = useState(false);
  const [address, setAddress] = useState("");
  const [newAdresslatlon, setNewAddresslatlon] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [textToSearch, setTextToSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locationOption, setLocationOption] = useState("currentLocation");
  getHospitalDatafromDB();

  //using the ‘Haversine’ formula.

  /*const arr = [
    ["AIIMS Delhi", 28.5672, 77.21, "ortho,dental,gp,opthalmology,cardio"],
    ["Apollo Hyd", 17.4276, 78.4134, "ortho,dental,gp,cardio"],
    ["Medicover Madhapur", 17.4469, 78.38, "gp"],
    ["AIG Hospital Hyderabad", 17.443183, 78.366294, "ortho,cardio"],
    ["PACE Hospitals HitechCity", 17.446773, 78.384252, "ortho,cardio"],
    ["KIMS Kondapur", 17.466881, 78.368515, "dental,gp,cardio"],
    [
      "KIMS Bhubaneswar",
      20.3539,
      85.8136,
      "ortho,dental,gp,opthalmology,cardio",
    ],
    [
      "Apollo Bhubaneswar",
      20.305592,
      85.831093,
      "ortho,dental,gp,opthalmology,cardio",
    ],
    [
      "AIIMS BHubaneswar",
      20.2318,
      85.775,
      "ortho,dental,gp,opthalmology,cardio",
    ],
  ];*/

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getHospitalDatafromDB() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch("http://localhost:7071/api/getHospitalsList", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        setHospitalData(result);
      })
      .catch((error) => console.error(error));
  }

  function fetchSuggestions() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    // Replace this URL with the URL of your API and adjust query parameter if needed
    return fetch(
      `https://geocode.maps.co/search?q=${textToSearch}&api_key=668f77953c443921364690nrf6d0eb9`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        setSearchList(JSON.parse(result ?? []));
        console.log(result, "result");
      })
      .catch((error) => console.error(error));
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const debouncedFetchSearchResults = debounce(async () => {
    const result = await fetchSuggestions();
    console.log(result, "result");
    //displaySuggestions(result)
    return result;
  }, 1000);

  useEffect(() => {
    debouncedFetchSearchResults();
  }, [textToSearch]);

  /*const updateDynamicLatLon = (value) => {
    console.log(value, "value");
    let lat = value.lat,
      lon = value.lon;
    let arr = [lat, lon];
    setSelectedCity(value.display_name);
    setTextToSearch(value.display_name);
    setNewAddresslatlon(arr);
    setSearchList([]);
  };*/

  function FindAddress(latitude, longitude) {
    fetch(
      `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=668f77953c443921364690nrf6d0eb9`
    )
      .then((res) => {
        console.log(res, "dynamicAddress");
        return res.json();
      })
      .then((data) => {
        console.log("data from api", data);
        setAddress(data);
        console.log("data from address", address);
      });
  }

  function succeeded(position) {
    console.log("Location fetch succeeded");
    var currLatitude = position.coords.latitude;
    var currLongitude = position.coords.longitude;
    console.log(currLatitude, currLongitude);
    let minDist = 0;
    let nearestHospital = "";
    let arr = "";
    if (hospitalData) arr = JSON.parse(hospitalData);
    let latNearestHospital = 0,
      longNearestHospital = 0;

    for (let i = 0; i < arr?.length; i++) {
      console.log("arr", arr[i].SpecialitiesAvailable);
      let dist = getDistanceFromLatLonInKm(
        currLatitude,
        currLongitude,
        arr[i]["Latitude"],
        arr[i]["Longitude"]
      );
      console.log(minDist, "dist", dist);
      if (
        (minDist === 0 || dist < minDist) &&
        arr[i].SpecialitiesAvailable.includes(dept)
      ) {
        minDist = dist;
        nearestHospital = arr[i]["Name"];
        latNearestHospital = arr[i]["Latitude"];
        longNearestHospital = arr[i]["Longitude"];
      }
    }
    setNearestHospital(nearestHospital);
    FindAddress(latNearestHospital, longNearestHospital);
    setCurrentLocationAvbl(true);

    setDistanceHospital(minDist);
    alert("Location fetch Suceeded");
  }

  function distanceFromSpecifiedLocation(value, listOfPlaces) {
    getHospitalDatafromDB();
    var Latitude;
    var Longitude;

    for (let i = 0; i < listOfPlaces.length; i++) {
      if (value.target.value == listOfPlaces[i].display_name) {
        Latitude = listOfPlaces[i].lat;
        Longitude = listOfPlaces[i].lon;
      }
    }

    let minDist = 0;
    let nearestHospital = "";
    let arr = "";
    if (hospitalData) arr = JSON.parse(hospitalData);
    let latNearestHospital = 0,
      longNearestHospital = 0;

    for (let i = 0; i < arr?.length; i++) {
      let dist = getDistanceFromLatLonInKm(
        Latitude,
        Longitude,
        arr[i]["Latitude"],
        arr[i]["Longitude"]
      );
      if (
        (minDist === 0 || dist < minDist) &&
        arr[i].SpecialitiesAvailable.includes(dept)
      ) {
        minDist = dist;
        nearestHospital = arr[i]["Name"];
        latNearestHospital = arr[i]["Latitude"];
        longNearestHospital = arr[i]["Longitude"];
      }
    }
    setNearestHospital(nearestHospital);
    FindAddress(latNearestHospital, longNearestHospital);

    setDistanceHospital(minDist);
  }

  function failed() {
    alert("Location fetch failed");
  }
  function findLocation() {
    console.log("tester called");
    const result = navigator.geolocation.getCurrentPosition(succeeded, failed);
    console.log(result);
  }
  const handleDept = (event) => {
    setDept(event.target.value);
  };
  const handleLocation = (event) => {
    setLocationOption(event.target.defaultValue);
    console.log("radio",event.target.defaultValue);
  };

  const findHospital = () => {
    findLocation();
  };

  return (
    <div className="container">
      <div className="top-right-buttons">
        <Button onClick={() => navigate("/createAcc")} className="button">
          Create Admin Account
        </Button>
        <Button onClick={() => navigate("/")} className="button">
          Admin Login
        </Button>
      </div>
      <div className="card">
        <h2>Locate Nearest Hospital</h2>

        <FormControl variant="outlined" className="form-control">
          <InputLabel>Select Department</InputLabel>
          <Select
            className="select"
            value={dept}
            onChange={handleDept}
            label="Select Department"
          >
            <MenuItem value="ortho">Orthopaedics</MenuItem>
            <MenuItem value="cardio">Cardiology</MenuItem>
            <MenuItem value="gp">Others</MenuItem>
            <MenuItem value="dental">Dental</MenuItem>
            <MenuItem value="opthalmology">Opthalmology</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">
            Search hospital near:
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="currentLocation"
            name="radio-buttons-group"
            onChange={handleLocation}
          >
            <FormControlLabel
              value="currentLocation"
              //onClick={setLocationOption("currentLocation")}
              control={<Radio />}
              label="My Current Location"
            />
            <FormControlLabel
              value="enteredLocation"
              //onClick={setLocationOption("enteredLocation")}
              control={<Radio />}
              label="Entered Location"
            />
          </RadioGroup>
        </FormControl>

        <Button
        disabled={locationOption != "currentLocation"}
          onClick={findHospital}
          className="button"
          
        >
          {!currentLocationAvbl
            ? "Find my location"
            : "Find Nearest Hospital from my location"}
        </Button>

        {nearestHospital && (
          <div>
            <p>
              The nearest Hospital is<b> {nearestHospital},</b>{" "}
              {distanceHospital} KM away. Hospital Address:{" "}
              {address?.address?.neighbourhood}, {address?.address?.postcode}.
            </p>
          </div>
        )}

        <Autocomplete
          className="autocomplete"
          disablePortal
          disabled={locationOption === "currentLocation"}
          id="combo-box-demo"
          options={searchList.map((item) => item.display_name)}
          sx={{ width: 300 }}
          
          renderInput={(params) => (
            <TextField
              onChange={(e) => setTextToSearch(e.target.value)}
              {...params}
              label="Enter Address"
            />
          )}
          onBlur={(e) => {
            let listOfPlaces = searchList;
            distanceFromSpecifiedLocation(e, listOfPlaces);
          }}
        />

        <Button
          className="button"
          sx={{
            cursor: textToSearch
              ? "allowed!important"
              : "not-allowed!important",
            height: "30px",
          }}
        >
          Find Nearest Hospital from Entered Location
        </Button>
      </div>
    </div>
  );
};

export default LocateNearestHospital;
