import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSurveys } from '../../actions';

class SurveyList extends Component {
    componentDidMount() {
        this.props.fetchSurveys();
    }

    renderSurveys() {
        return this.props.surveys.reverse().map(survey => {
            return (
                <div className="card darken-1 indigo" key={survey._id}>
                    <div className="card-content">
                        <span className="card-title white-text">{survey.title}</span>
                        <p className="white-text">
                            {survey.body}
                        </p>
                        <p className="right white-text">
                            Sent On: {new Date(survey.dateSent).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="card-action">
                        <a>Yes: {(survey.yes).toLocaleString()}</a>
                        <a>No: {(survey.no).toLocaleString()}</a>
                    </div>
                </div>
            );
        })
    }

    render() {
        return (
            <div>
                {this.renderSurveys()}
            </div>
        )
    }
}

function mapStateToProps({ surveys }) {
    return { surveys };
}

export default connect(mapStateToProps, { fetchSurveys })(SurveyList);