import React from 'react';
import {
  Typography, Divider
} from '@mui/material';
import './recentActivity.css';

import { Link } from "react-router-dom";
import axios from 'axios';

class RecentActivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: [] };
  }

  render() {
    if (!this.state.user) {
      (<div></div>);
    }
    // this.grabCommentPhoto();
    return (
      < div >
        < Typography variant="body1" >
          User List:
        </Typography >
        {this.state.user.map((user) => (

          <Link to={"/users/" + user._id} key={user._id}> <Typography component={'span'} variant={'body'} >{user.first_name} {user.last_name}</Typography><Divider></Divider></Link>

        ))}
      </div >
    );
  }

  //componenet did updates

  componentDidMount() {
    console.log("rendering activity list");
    axios.get(`/user/list`).then((res) => {
      this.setState({ user: res.data });
    }).catch(err => console.log(err));
  }
}
export default RecentActivity;
