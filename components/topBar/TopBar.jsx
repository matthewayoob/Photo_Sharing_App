import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid,
} from '@mui/material';
import './TopBar.css';

import axios from 'axios';


/* Citation: Plethora of OH with Christi, Kexu, Dean, Anh*/

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.clickLogOut = this.clickLogOut.bind(this);
    this.state = {
      versionNum: "0",
      photoStatus: "",
      finalWarning: false
    };
    this.setInfo2 = props.setInfo2;

  }

  componentDidUpdate(prevProps) {
    if (this.props.userID === prevProps.userID) {
      return;
    }
    axios.get("/test/info").then((res) => {
      this.setState({ versionNum: res.data.__v });
      // this.props.viewChange("user detail");
    }).catch(err => console.log(err));
  }

  clickLogOut() {
    this.setInfo2(false, "", "", "");
  }

  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          this.setState({ photoStatus: "Photo Posted!" });
          this.setInfo2(this.props.loggedInUser, this.props.user_id, this.props.first_name, this.state.photoStatus);
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };

  handleDeleteUser1() {
    this.setState({ finalWarning: true });
  }

  undoDeleteUser1() {
    this.setState({ finalWarning: false });
  }

  handleDeleteUser2() {
    console.log(this.props);
    // axios.post('/deleteUser/' + this.props.user_id).then((content) => {
    axios.post('/deleteUser/' + this.props.user_id, { user_id: this.props.user_id }).then((content) => {
      // 6415076d32b511ede4925ff2
      console.log(content);
      console.log("deleting sucess");
    }).catch((err) => console.error(err));
    this.clickLogOut();
    this.undoDeleteUser1();
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Grid container justify="space-between" alignItems="center">
            {this.props.loggedInUser ? (
              <form onSubmit={(event) => this.clickLogOut(event)}>
                <div>
                  <Typography align="left" className="leftB" style={{ flex: 1 }}>Hi {this.props.first_name}!</Typography>

                  <input type="submit" value="LogOut" />
                </div>
              </form>
            )
              :
              <Typography align="left" style={{ flex: 1 }}>Please Register or Login!</Typography>}

            {/* uploader makes it space out horizontally */}
            {this.props.loggedInUser ? (
              <div className='uploader'>
                <form onSubmit={event => this.handleUploadButtonClicked(event)}>
                  {/* onClick={this.props.setPhotoRerender(true) */}
                  <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
                  <div> <input type="submit" value="Post Photo" /></div>
                  {this.state.photoStatus}
                  {/* {this.props.setPhotoRerender(true)} */}

                </form>
              </div>
            )
              :
              <Typography style={{ flex: 1 }}> </Typography>}
            {/* <Typography style={{ flex: 1 }}> </Typography> */}
            {this.props.loggedInUser ? (
              <div className='uploader'>
                <form onSubmit={event => this.handleDeleteUser1(event)}>
                  {/* onClick={this.props.setPhotoRerender(true) */}
                  <div> <input type="submit" value="Delete Account" /></div>
                  {this.state.finalWarning ? (
                    <div className='uploader'>
                      <form onClick={event => this.handleDeleteUser2(event)}>
                        {/* onClick={this.props.setPhotoRerender(true) */}
                        <Typography fontSize={12}>Delete all your data?</Typography>
                        <div> <input type="submit" value="Confirm Delete Account" /></div>
                        {/* {this.props.setPhotoRerender(true)} */}
                      </form>
                    </div>
                  )
                    :
                    <Typography style={{ flex: 1 }}> </Typography>}

                  {/* {this.props.setPhotoRerender(true)} */}
                </form>
              </div>
            )
              :
              <Typography style={{ flex: 1 }}> </Typography>}
            {/* <Typography style={{ flex: 1 }}> </Typography> */}

            {/* <Typography style={{ flex: 1 }}> </Typography> */}
            < Typography align="right" style={{ flex: 1 }}>{this.props.userID + " VersionNumber: " + this.state.versionNum}</Typography>
          </Grid>
        </Toolbar >
      </AppBar >
    );
  }
}

export default TopBar;

