/* eslint-disable react/no-unused-state */
import React from 'react';
import {
  TextField, Typography
  // Typography , Paper, TextField
} from '@mui/material';
import './LoginRegister.css';

import axios from 'axios';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.state = {
      // registerProps: {
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: "",
      reg_login_name: "",
      reg_password: "",
      password2: "",
      // },
      // logInProps: {
      login_name: "",
      password: "",
      // },
      registerError: "",
      logError: "",
    };
    this.setInfo2 = props.setInfo2;
  }

  handleLogIn(event) {
    event.preventDefault();
    axios.post("/admin/login", {
      login_name: this.state.login_name,
      password: this.state.password,
    }).then((response) => {
      console.log("user's name: " + response.data.first_name);
      this.setInfo2(true, response.data._id, response.data.first_name);
      console.log("_id:" + response.data._id);
      // found command via googling
      window.location.href = "#/users/" + response.data._id;
    }).catch(() => {
      this.setState({
        registerError: "No Such Username and Password Configuration Exists.",
      });
      console.log("No Success Logging In");
    });
  }

  handleRegisterSubmit(event) {
    event.preventDefault();
    // check if we should even try to submit it
    if (this.state.password2 !== this.state.reg_password) {
      this.setState({ registerError: "Ur passwords do not match!" });
      return; //exot
    }
    if (this.state.reg_login_name === "" || this.state.reg_password === "") {
      this.setState({ registerError: "Ur passwords do not match!" });
      return; //exot
    }
    axios.post("/user", {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      location: this.state.location,
      description: this.state.description,
      occupation: this.state.occupation,
      login_name: this.state.reg_login_name,
      password: this.state.reg_password,
    })
      // OH with Anh
      .then((res) => {
        console.log("about to upload backend state" + res);
        this.setState({
          // logInProps: {
          first_name: "",
          last_name: "",
          login_name: "",
          password: "",
          location: "",
          description: "",
          occupation: "",
          registerError: "New User Created!"
        });
      })
      .catch((err) => {
        this.setState({ registerError: "No User Created" });
        console.log("No Success Registering -- Try a new login name" + err);
      });
    // });
  }

  render() {
    return (
      <div>
        <form
          onSubmit={event => this.handleLogIn(event)}>
          <div>
            <Typography>Log In Below: </Typography>
            <div>
              Username:
            </div>
            <TextField type="text" size="small"
              value={this.state.login_name}
              onChange={e => this.setState({ login_name: e.target.value })}
              name="login_name" />
          </div>
          <div>
            <div>
              Password:
            </div>
            <TextField type="password" size="small"
              value={this.state.password}
              onChange={e => this.setState({ password: e.target.value })}
              name="password" />
            <div> <input type="submit" value="Enter" /></div>
            {this.state.logError}
          </div>
        </form>

        < form
          onSubmit={(event) => this.handleRegisterSubmit(event)}>
          <div>
            <Typography>Register Below: </Typography>
            <div>
              First Name:
            </div>
            <TextField type="text" size="small"
              value={this.state.first_name}
              onChange={e => this.setState({ first_name: e.target.value })}
              name="first_name" />
          </div>
          <div>
            <div>Last Name:</div>
            <TextField type="text" size="small"
              value={this.state.last_name}
              onChange={e => this.setState({ last_name: e.target.value })} // change rest
              name="last_name" />
          </div>
          <div>
            <div>Username:</div>
            <TextField type="text" size="small"
              value={this.state.reg_login_name}
              onChange={e => this.setState({ reg_login_name: e.target.value })}
              name="login_name" />
          </div>
          <div>
            <div>Occupation:</div>
            <TextField type="text" size="small"
              value={this.state.occupation}
              onChange={e => this.setState({ occupation: e.target.value })}
              name="occupation" />
          </div>
          <div>
            <div> Location: </div>
            <TextField type="text" size="small"
              value={this.state.location}
              onChange={e => this.setState({ location: e.target.value })}
              name="location" />
          </div>
          <div>
            <div> Description: </div>
            <TextField type="text" size="small"
              value={this.state.description}
              onChange={e => this.setState({ description: e.target.value })}
              name="description" />
          </div>
          <div>
            <div>Password:</div>
            <TextField type="password" size="small"
              value={this.state.reg_password}
              onChange={e => this.setState({ reg_password: e.target.value })}
              name="reg_password" />
          </div>
          <div>
            <div>Re-enter password:</div> <TextField type="password" size="small"
              value={this.state.password2}
              onChange={e => this.setState({ password2: e.target.value })}
              name="password2" />
            <div>
              <input type="submit" value="Register" />
              {this.state.registerError}
            </div>
          </div>
        </form >
      </div >
    );
  }
}

export default LoginRegister;
