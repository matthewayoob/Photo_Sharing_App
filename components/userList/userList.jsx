
import React from 'react';
import {
  Divider,
  // List,
  // ListItem,
  // ListItemText,
  Typography,
  // MenuList,
  // MenuItem,
}
  from '@mui/material';
import './userList.css';

import { Link } from "react-router-dom";
import axios from 'axios';
// import fetchModel from '../../lib/fetchModelData';

/* Citation: Plethora of OH with Christi, Kexu, Dean, Anh*/
/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    // this.state = { user: window.cs142models.userListModel() };
    this.state = { user: [] };

  }

  componentDidMount() {
    console.log("rendering");
    axios.get(`/user/list`).then((res) => {
      this.setState({ user: res.data });
      // this.props.viewChange("user list");
    }).catch(err => console.log(err));
  }

  render() {
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
}

export default UserList;
