/**
 * Created by vjtc0n on 2/3/17.
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';
import * as PostActions from '../actions/PostActions';
import InfiniteScroll from 'react-infinite-scroller';
import ReactPullToRefresh from 'react-pull-to-refresh'
import { Link, hashHistory} from 'react-router'

class GlobalFeedContainer extends Component {
    constructor(props) {
        super(props);
        this.state= {
            posts: [],
            limit: 10,
            pullToRefresh: true
        }
    }

    componentDidMount() {
        this.getFeed(this.state.limit)
    }

    getFeed(limit) {
        this.props.actions.getPost(this.props.profile.accessToken.id, limit)
            .then(() => {
                this.setState({
                    posts: this.props.post.posts
                })
            })
    }

    handleRefresh(resolve, reject) {
        this.setState({
            limit: 10,
            pullToRefresh: true
        }, () => {
            this.props.actions.getPost(this.props.profile.accessToken.id, this.state.limit)
                .then(() => {
                    this.setState({
                        posts: this.props.post.posts,
                        pullToRefresh: false
                    })
                })
        })
    }

    onPostPress(item, event) {
        event.preventDefault();
        console.log(item)
        //hashHistory.push('/main/post/' + item.postId)
        this.context.transitionRouter.show({
            pathname: '/main/post/' + item.postId,
            state: {
                showTransition: {
                    transitionName: 'show-from-top',
                    transitionEnterTimeout: 500,
                    transitionLeaveTimeout: 300,
                },
                dismissTransition: {
                    transitionName: 'dismiss-from-top',
                    transitionEnterTimeout: 500,
                    transitionLeaveTimeout: 300,
                },
            },
        });
    }

    render() {
        return (
            <ReactPullToRefresh
                onRefresh={this.handleRefresh.bind(this)}
                distanceToRefresh={55}
                style={{
                    textAlign: 'center'
                }}>
                <div>
                    <div className="row">
                        {
                            this.state.posts.map((item, index)=> {
                                return (
                                    <div
                                        onClick={(event) => this.onPostPress(item, event)}
                                        className="col-md-3 image-item"
                                        key={`PhotoItem_${item.id}_${index}`}>
                                        <img src={item.user.avatar_picture} alt=""/>
                                        <div>{item.user.username}</div>
                                        <div>{item.caption}</div>
                                        <img src={item.imgUrl} alt=""/>
                                    </div>
                                )
                            })
                        }
                        <div className="cleafix"/>
                    </div>

                    {this.props.post.status == 'DONE' &&
                    <div style={{marginBottom: '20px'}} className="row">
                        <div className="col-md-6 col-md-offset-3">
                            <button onClick={this.getFeed.bind(this, 20)} type="button"
                                    className="btn btn-default btn-lg btn-block">
                                Load more
                            </button>
                        </div>
                    </div>
                    }

                    {this.props.post.status == 'PENDING' &&
                        <div className="loading"></div>
                    }
                </div>
            </ReactPullToRefresh>
        )
    }
}

GlobalFeedContainer.contextTypes = {
    transitionRouter: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        profile: state.profile,
        post: state.post
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ ...PostActions}, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalFeedContainer);