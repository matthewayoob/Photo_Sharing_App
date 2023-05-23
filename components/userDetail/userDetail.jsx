import React from 'react';
import {
  Typography, Card, Avatar,
  Button
} from '@mui/material';
import './userDetail.css';

import { Link } from "react-router-dom";
import axios from 'axios';
// import fetchModel from '../../lib/fetchModelData';



/* Citation: Plethora of OH with Christi, Kexu, Dean, Anh*/

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      most_recent_photo: [],
      most_comment_photo: [],
      // citation: fixing mentioned functionality with Christi
      mentioned_user_photos: []
    };
  }

  render() {
    if (!this.state.user) {
      (<div></div>);
    }
    // this.grabCommentPhoto();
    return (
      <Typography>
        <Typography> User: {this.props.match.params.userId} </Typography>
        <Typography> Name: {this.state.user.first_name + " " + this.state.user.last_name} </Typography>
        <Typography> Location: {this.state.user.location} </Typography>
        <Typography> Description: {this.state.user.description} </Typography>
        <Typography> Occupation: {this.state.user.occupation} </Typography>
        {/* {this.state.most_comment_photo ? <Typography>slay</Typography> : <Typography>no way</Typography>} */}
        <Typography>
          {
            this.state.mentioned_user_photos.length > 0 ? (
              <Typography>
                <Typography>Mentioned photos</Typography>
                {
                  this.state.mentioned_user_photos.map((photo) => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <Typography>
                        {photo.file_name}
                        <div >
                          {/* Citation: Avatar MUI documentation */}
                          <Link to={`/photos/${photo.user_id}?scrolled-photo-id=${photo._id}`} >
                            <Avatar sx={{ width: 56, height: 56 }} alt={photo.file_name} src={`../../images/${photo.file_name}`} />
                          </Link>
                          <Typography>
                            Original Photo By
                            <Typography></Typography>
                            <Link to={`/users/${photo.user_id}`}>{`${photo.first_name}
                                                   ${photo.last_name}`}
                            </Link>
                          </Typography>
                        </div>
                      </Typography>
                    );
                  })
                }
              </Typography>
            )
              :
              (
                <Typography>
                  No mentions in other photos :(.
                </Typography>
              )
          }
        </Typography>
        <Typography> Most Recently Uploaded Photo:
          <Card>
            <Link to={"/photos/" + this.state.user._id}>
              <Avatar sx={{ width: 56, height: 56 }} alt={this.state.most_recent_photo.file_name} src={`../../images/${this.state.most_recent_photo.file_name}`} />
            </Link>
            <Typography> Time Posted: {this.state.most_recent_photo.date_time} </Typography>
            {/* <Link to={"/photos/" + this.state.user._id}>
              <Avatar sx={{ width: 56, height: 56 }} alt={this.state.most_comment_photo.file_name} src={`../../images/${this.state.most_comment_photo.file_name}`} />
            </Link> */}
            {/* <Link to={"/photos/" + this.state.user._id}>
              <CardMedia component="img" image={"images/" + this.state.most_recent_photo.file_name} />
            </Link>
            <Typography> Time Posted: {this.state.most_recent_photo.date_time} </Typography> */}

          </Card>
        </Typography>

        <Typography> Photo with Most Comments:
          <Card>
            <Link to={"/photos/" + this.state.user._id}>
              <Avatar sx={{ width: 56, height: 56 }} alt={this.state.most_comment_photo.file_name} src={`../../images/${this.state.most_comment_photo.file_name}`} />
            </Link>
            {/* <Link to={"/photos/" + this.state.user._id}>
              <CardMedia component="img" image={"images/" + this.state.most_comment_photo.file_name} />
            </Link> */}
            <Typography> Amount of Comments: {this.state.most_comment_photo.curr_max_length} </Typography>

          </Card>
        </Typography>

        <Button component={Link} onClick={this.setInfo} to={"/photos/" + this.state.user._id}>
          See the photos of {this.state.user.first_name + " " + this.state.user.last_name}!
        </Button>
      </Typography>
    );
  }


  componentDidUpdate(prevID) {
    if (prevID.match.params.userId !== this.props.match.params.userId) {
      let userId = this.props.match.params.userId;
      axios.get(`/user/${userId}`).then((res) => {
        this.setState({ user: res.data }, this.updateName);
        // this.props.viewChange("user detail");
      }).catch(err => console.log(err));
      axios.get(`/mostCommentPhoto/${userId}`).then((res) => {
        this.setState({ most_comment_photo: res.data }, this.updateName);
        console.log("most photo comments: " + this.state.most_comment_photo);
      }).catch(err => console.log(err));
      axios.get(`/recentPhotoOfUser/${userId}`).then((res) => {
        this.setState({ most_recent_photo: res.data }, this.updateName);
        console.log("most photo comments: " + this.state.most_recent_photo);
      }).catch(err => console.log(err));
      axios.get(`/mentionsInPhoto/${userId}`).then(res => {
        this.setState({
          mentioned_user_photos: res.data,
        });
        console.log("adding to mentioned photos content below:");
        console.log(res.data);
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  componentDidMount() {
    let userId = this.props.match.params.userId;
    axios.get(`/user/${userId}`).then((res) => {
      this.setState({ user: res.data }, this.updateName);
      // this.props.viewChange("user detail");
    }).catch(err => console.log(err));

    axios.get(`/mostCommentPhoto/${userId}`).then((res) => {
      this.setState({ most_comment_photo: res.data }, this.updateName);
      console.log("most photo comments: " + this.state.most_comment_photo);
    }).catch(err => console.log(err));
    axios.get(`/recentPhotoOfUser/${userId}`).then((res) => {
      this.setState({ most_recent_photo: res.data }, this.updateName);
      console.log("most photo comments: " + this.state.most_recent_photo);
    }).catch(err => console.log(err));
    axios.get(`/mentionsInPhoto/${userId}`).then(res => {
      this.setState({
        mentioned_user_photos: res.data,
      });
      console.log("adding to mentioned photos content below:");
      console.log(res.data);
    }).catch((error) => {
      console.log(error);
    });
  }

  updateName() {
    let name = " Viewing " + this.state.user.first_name + " " + this.state.user.last_name + " | ";
    // let origin = "user detail origin";
    this.props.setInfo(name, this.props.photoBool, origin);
  }

  grabCommentPhoto() {
    let userId = this.props.match.params.userId;
    axios.get(`/mostCommentPhoto/${userId}`).then((res) => {
      this.setState({ most_comment_photo: res.data }, this.updateName);
      console.log("most photo comments: " + this.state.most_comment_photo);
    }).catch(err => console.log(err));
  }

}



export default UserDetail;

