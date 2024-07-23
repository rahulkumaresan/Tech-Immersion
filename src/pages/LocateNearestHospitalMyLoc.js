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
  Card
} from "@mui/material";

const LocateNearestHospitalMyLoc = () => {
  console.log("asdasd");
  const [hospitalData, setHospitalData] = useState();

  const navigate = useNavigate();

  
  const [dept, setDept] = useState("");
  const [nearestHospital, setNearestHospital] = useState("");
  const [distanceHospital, setDistanceHospital] = useState("");
  const [currentLocationAvbl, setCurrentLocationAvbl] = useState(false);
  const [address, setAddress] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [textToSearch, setTextToSearch] = useState("");
  const [locationOption, setLocationOption] = useState("currentLocation");
  const [formAddress,setFormAddress] = useState({"display_name":""});
  const [showResult,setShowResult]=useState(true)  ;


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

  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [textToSearch]);

  async function fetchSuggestions() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    // Replace this URL with the URL of your API and adjust query parameter if needed
    try {
      let res = await fetch(
        `https://geocode.maps.co/search?q=${textToSearch}&api_key=<key>`,
        requestOptions
      );
      res = await res.text();
      //setSuggestions(JSON.parse(res ?? [])); // Assuming res is always JSON
      setSearchList(JSON.parse(res ?? []));
      console.log(res, "result");
    } catch (e) {
      console.log(e);
    }
  }

  //TO DO
  function FindAddress(latitude, longitude) {
    fetch(
      `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=<key>`
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

  function displayResults(){
    setShowResult(true);
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
    

    setDistanceHospital(minDist);
    if(!currentLocationAvbl) alert("Location fetch Suceeded");
    setCurrentLocationAvbl(true);
  }

  useEffect(()=>{
    getHospitalDatafromDB();
  },[])

  useEffect(()=>{
    if(textToSearch==null || textToSearch.length==0)
    setSearchList([]);
  },[textToSearch])

  //TO DO
  function distanceFromSpecifiedLocation(address) {
    var Latitude = address?.lat;
    var Longitude = address?.lon;

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
    console.log("radio", event.target.defaultValue);
  };

  const findHospital = () => {
    console.log(nearestHospital, "find hospital called", showResult);
    findLocation();
    setShowResult(true);
  };

  return (
    <div className="container">
      
      <div className="card">
        <h2 >Locate Nearest Hospital</h2>

        <FormControl variant="outlined" className="form-control" sx={{ m: 2 }}>
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
            <MenuItem value="ophthalmology">Ophthalmology</MenuItem>
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
              disabled={!dept}
            />
            <FormControlLabel
              value="enteredLocation"
              //onClick={setLocationOption("enteredLocation")}
              control={<Radio />}
              label="Entered Location"
              disabled={!dept}
            />
          </RadioGroup>
        </FormControl>

        <Button
        hidden={locationOption != "currentLocation"}
          disabled={locationOption != "currentLocation"}
          onClick={findHospital}
          className="button"
        >
          {!currentLocationAvbl
            ? "Find my location"
            : "Find Nearest Hospital from my location"}
        </Button>

       

        <Autocomplete
          className="autocomplete"
          disablePortal
          
          hidden={locationOption === "currentLocation"}
          id="combo-box-demo"
          getOptionLabel={(option) => option.display_name}
          options={searchList}
          sx={{ width: 300 }}
          value={formAddress}
          renderInput={(params) => (
            <TextField
            
              onChange={(e) => {
                setShowResult(false);
                setTextToSearch(e.target.value);
              }}
              {...params}
              label="Enter Address"
            />
          )}
          onChange={(e,value) => {
            setFormAddress(value);
            distanceFromSpecifiedLocation(value);
            //findHospital();
          }}
        />
        <Button
          hidden={locationOption === "currentLocation"}
          onClick={displayResults}
          className="button"
        >
          {"Find Nearest Hospital from entered location"}
        </Button>

        <Card sx={{ m: 2 }}>

{nearestHospital && showResult && (
  <div style={{padding:'10px'}}>
    <p>
      The nearest Hospital is<b> {nearestHospital},</b>{" "}
      {distanceHospital} KM away. Hospital Address:{" "}
      {address?.address?.neighbourhood}, {address?.address?.postcode}.
    </p>
  </div>
)}
</Card>

        
      </div>
    </div>
  );
};

export default LocateNearestHospitalMyLoc;
