import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import './styles/main.css';

// import axios from 'axios';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/LoginRegister.jsx';

// OH with Chrsisti s

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: "Users | ",
      loggedInUser: false,
      user_id: "",
      first_name: '',
      // postedStatus: '',
    };
  }

  setInfo = (userID) => { // versionNum
    this.setState({ userID: userID });
  };

  setInfo2 = (loggedInUser, user_id, first_name) => { // versionNum
    this.setState({ loggedInUser: loggedInUser });
    this.setState({ user_id: user_id });
    this.setState({ first_name: first_name });
    // this.setState({ postedStatus: postedStatus });
  };

  render() {

    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar userID={this.state.userID} user_id={this.state.user_id} loggedInUser={this.state.loggedInUser} first_name={this.state.first_name} setInfo2={this.setInfo2} />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            {this.state.loggedInUser ?
              (
                <Grid item sm={3}>
                  <Paper className="cs142-main-grid-item">
                    <UserList user_id={this.state.user_id} />
                  </Paper>
                </Grid>
              )
              :
              <Redirect to={"/login-register"} />}
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">

                <Switch>
                  <Route path="/users/:userId"
                    render={props => <UserDetail user_id={this.state.user_id} loggedInUser={this.state.loggedInUser} setInfo={this.setInfo} {...props} />}
                  />
                  <Route path="/login-register">
                    <LoginRegister path="/login-register" setInfo2={this.setInfo2} />
                  </Route>
                  <Route path="/photos/:userId"
                    render={props => <UserPhotos user_id={this.state.user_id} loggedInUser={this.state.loggedInUser} setInfo={this.setInfo} {...props} />}
                  />
                  <Route path="/users"
                    // 
                    render={props => <UserList loggedInUser={this.state.loggedInUser} {...props} />}
                  />


                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter >
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
