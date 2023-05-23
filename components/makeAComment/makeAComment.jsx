
import React from 'react';
import {
} from '@mui/material';
import './makeAComment.css';
import { MentionsInput, Mention } from 'react-mentions';
import axios from 'axios';

/* Citation: Plethora of OH with Christi, Kexu, Dean, Anh*/

class MakeAComment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            new_comment: "", // original comment element
            // photo_id: "",
            comment_posting_statis: "",
            who_was_mentioned: [],
            user_word_bank: [],
            comment_content: ""
        };
    }

    componentDidMount() {
        // populate word bank of users to tag!
        axios.get("/user/list").then((res) => {
            if (res.data) {
                this.setState({ user_word_bank: res.data });
            }
        }).catch(err => {
            // make sure there are no users to tag!
            this.setState({ user_word_bank: [] });
            console.log(err);
        }
        );
    }

    handleTaggableComment(event, new_comment, comment_content, mentions) { //meep name
        this.setState({
            comment_content: comment_content,
            new_comment: new_comment,
            who_was_mentioned: mentions.map(({ id }) => id),
        });

    }

    // post comment in real time
    submitComment(event) {
        event.preventDefault();
        let photo_id = this.props.photo_id;
        axios.post(`/commentsOfPhoto/${photo_id}`, {
            comment: this.state.comment_content,
            who_was_mentioned: JSON.stringify(this.state.who_was_mentioned),
        }).then((res) => {
            console.log("comment posted.");
            console.log(res);
            this.setState({ comment_posting_statis: "Comment Posted!" }, this.props.rerender());
        })
            .catch((error) => {
                console.log(error);
            });
        this.setState({
            new_comment: '',
        });
    }

    render() {
        return (
            <form
                onSubmit={e => this.submitComment(e)}>
                {this.state.comment_posting_statis}

                <div>
                    <label>
                        {/* citation: https://github.com/signavio/react-mentions */}
                        <MentionsInput className='bigComment' appendSpaceOnAdd={true}
                            value={this.state.new_comment}
                            //MEEP
                            onChange={(e, new_comment, comment_content, mentions) => this.handleTaggableComment(e, new_comment, comment_content, mentions)}>
                            <Mention style={{ position: "absolute", zIndex: 999, color: "lilac" }}
                                trigger="@"
                                data={this.state.user_word_bank.map((user) => {
                                    return {
                                        display: `${user.first_name} ${user.last_name}`, id: user._id,
                                    };
                                })}
                                displayTransform={(id, display) => {
                                    return `@${display}`;
                                }}
                            />
                        </MentionsInput>
                    </label>
                    <input type="submit" value="Post" />
                </div>
            </form >
        );
    }
}

export default MakeAComment;
