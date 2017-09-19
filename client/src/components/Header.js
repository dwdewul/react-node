import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Payments from './Payments';

class Header extends Component {
    renderContent() {
        switch (this.props.auth) {
            case null:
                return;
            case false:
                return (
                    <li><a href="auth/google">Login<i className="material-icons">perm_identity</i></a></li>
    
                )
            default:
                return [
                    <li key="1"><Payments /></li>,
                    <li key="3" style={{ margin: '0 10px' }}>Credits: { this.props.auth.credits }</li>,
                    <li key="2"><a href="api/logout">Logout</a></li>,
                    
                ]; 
        }
    }

    render() {
        // console.log(this.props);
        return (
            <nav>
                <div className="nav-wrapper amber darken-1">
                <Link 
                    to={this.props.auth ? '/surveys': '/'} 
                    style={{ paddingLeft: 10 }}
                    className="left brand-logo"
                >
                Emailify
                </Link>
                <ul id="nav-mobile" className="right">
                    {this.renderContent()}
                </ul>
                </div>
            </nav>
        )
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps)(Header);