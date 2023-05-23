import React from 'react';
import {
  Typography
} from '@mui/material';
import './userPhotos.css';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';

import { Link } from "react-router-dom";
import axios from 'axios';

import MakeAComment from '../makeAComment/makeAComment';

/* Citation: Plethora of OH with Christi, Kexu, Dean, Anh*/

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      deleteStatus: "",
      // photoRemoved: ""
      // new_comment: "",
      // comment_posting_statis: ""
    };
  }

  componentDidUpdate(prevID) {
    if (prevID.match.params.userId !== this.props.match.params.userId) {
      //|| this.state.timeToRefreshPhoto !== this.props.match.params.timeToRefreshPhoto)
      let userId = this.props.match.params.userId;
      axios.get(`/photosOfUser/${userId}`).then((res) => {
        this.setState({ photos: res.data }, this.updateName(this.props.match.params.userId));
        // console.log(res.data);
        // this.props.viewChange("user detail");
      }).catch(err => console.log(err));
    }
  }

  componentDidMount() {
    let userId = this.props.match.params.userId;
    axios.get(`/photosOfUser/${userId}`).then((res) => {
      this.setState({ photos: res.data }, this.updateName(this.props.match.params.userId));
      // console.log(res.data);
      // this.props.viewChange("user detail");
    }).catch(err => console.log(err));
  }

  updateName(userID) {
    let name;
    axios.get(`user/${userID}`).then((res) => {
      name = " Viewing " + res.data.first_name + " " + res.data.last_name + "'s Photos | ";
      this.props.setInfo(name, true, "user photo origin");
    }).catch(err => console.log(err));

  }

  rerender() {
    console.log("make sure to grab info correctly");
    console.log("attempting to start re-render");
    axios.get(`/photosOfUser/${this.props.match.params.userId}`).then((res) => {
      this.setState({
        photos: res.data,
      });
      console.log("successfully re-rerender");
    }).catch((error) => {
      console.log(error);
    });

  }

  displayThoseComments = (photo) => {
    const comments = photo.comments;
    if (comments) {
      return (
        <Typography>
          {comments.map((comment) => (
            <Typography item key={comment._id}>
              {this.printOneComment(comment, photo)}
            </Typography>
          )
          )}
        </Typography>
      );
    } else {
      return (
        <Typography>No comments yet!</Typography>
      );

    }
  };

  // eslint-disable-next-line class-methods-use-this
  printOneComment = (comment, photo) => {
    return (
      <Typography>
        <Link to={"/users/" + comment.user._id}><Typography component={'span'} variant={'body'} >{comment.user.first_name} {comment.user.last_name}</Typography></Link>
        <Typography>{comment.comment} <b>Time Posted:</b> {comment.date_time}{console.log(comment)}</Typography>
        {comment.user._id === this.props.user_id ?
          (
            <form
              onSubmit={e => this.deleteComment(e, comment, photo, comment.comment)}>
              <div>
                <input type="submit" value="Delete your comment." />
              </div>
              {this.state.deleteStatus}
            </form>
          )
          :
          <Typography> </Typography>}
      </Typography>
    );
  };

  deletePhoto(event, photo) {
    axios.post('http://localhost:3000/deletePhoto/' + photo.file_name).then((value) => {
      console.log(value);
    }).catch((err) => console.error(err));
    let userId = this.props.match.params.userId;
    axios.get(`/photosOfUser/${userId}`).then((res) => {
      this.setState({ photos: res.data }, this.updateName(this.props.match.params.userId));
      console.log(res.data);
      console.log("6 regrabbed photos");
      // this.props.viewChange("user detail");
    }).catch(err => console.log(err));
  }

  // citation: debugging with Christi
  deleteComment(event, commentObj, photo, comment) {
    commentObj.mentionedInfo = photo.mentioned;
    console.log("delete Comment Stuff");
    console.log(commentObj);
    console.log(photo);
    console.log(comment);
    axios.post('http://localhost:3000/deleteComment/', { photo: photo, comment: comment, commentObj: commentObj }).then((value) => {
      console.log("Deleting Comment Success" + value);
    }).catch((err) => {
      console.error(err); console.log("delete comment not posting right");
    });
    this.componentDidMount();
  }

  render() {
    if (!this.state.photos) {
      (<div><Typography>No Photos Yet!</Typography></div>);
      console.log(this.props.match.params.userId);
      console.log(this.props.user_id);
    }
    return (
      < Typography variant="body1" >
        {
          this.state.photos.map((photo) => (
            <Card key={photo} >
              <CardMedia component="img" image={"images/" + photo.file_name} />
              {/* allow users to delete their own photos */}
              {this.props.match.params.userId === this.props.user_id ?
                (
                  <form
                    onSubmit={event => this.deletePhoto(event, photo)}>
                    <div>
                      <input type="submit" value="Delete this Photo" />
                    </div>
                    {/* {this.state.deleteStatus} */}
                  </form>
                )
                :
                <Typography> </Typography>}
              <CardContent>
                <Typography> File Name: {photo.file_name} </Typography>
                <Typography> Creation Time: {photo.date_time} </Typography>
                <Typography> User: {this.props.match.params.userId} </Typography>
                <Typography> Comments: {this.displayThoseComments(photo)} </Typography>
                {/* make seperate component -- via Ed */}
                <MakeAComment photo_id={photo._id} rerender={() => this.rerender()} />
              </CardContent>
            </Card >
          ))
        }
      </Typography >
    );
  }
}

export default UserPhotos;


