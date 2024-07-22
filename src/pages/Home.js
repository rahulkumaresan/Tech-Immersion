import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";

const Home=()=> {
const navigate = useNavigate();

const [ showPassword, setShowPassword ] = useState(false);
const [password, setPassword] = useState("");
const [username, setUsername] = useState("");

  function gotoLocatePage(){
    ValidateUser();
    navigate("/locate");
  }
  function gotoCreatePage(){
    navigate("/createAcc");
  }
  function gotoCrudPage(){
    ValidateUser();
    //navigate("/crud");
  }

  function ValidateUser(){
    console.log(username,password);
    const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "Username": username,
  "Password": password

});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("http://localhost:7071/api/validateUser", requestOptions)
  .then((response) => response.text())
  .then((result) => {alert(result);
    if(!(result.includes("Invalid username or password"))){
    navigate("/crud");
    }
    
  })
  .catch((error) => console.error(error));
  }

  
    
    
        console.log("Home is called");
      return (

<div className="login-signup-main">
      <div className="login-signup-left">
        <img src={Image} alt="" />
      </div>
      <div className="login-signup-right">
        <div className="login-signup-right-container">
          <div className="login-signup-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="login-signup-center">
            <h2>Hospital Locator</h2>
            <p>Login</p>
            <form>
              <input type="email" placeholder="Username" onChange={(e)=>setUsername(e.target.value)}  />
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
                {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
                
              </div>

              
              <div className="login-signup-center-buttons">
                
                <button onClick={gotoCrudPage} type="button">Admin Log In</button>
              </div>
            </form>
          </div>

          <p className="login-signup-bottom-p">
            Don't have an account? <a href="#" onClick={gotoCreatePage}>Sign Up</a>
          </p>
        </div>
      </div>
    </div>



      );
    }
    
    export default Home;