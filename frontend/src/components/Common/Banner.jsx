import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { closeBanner } from '../../redux/actions';
import { connect } from "react-redux";
import { Button } from 'react-bootstrap';

import close from '../../assets/svg/common/close.svg';

class Banner extends PureComponent {
  render() {
    const { text, visible, dispatch } = this.props;

    return (
      <div className={`banner ${visible ? '' : 'banner-closed'}`}>
        <div className="content">
          <p>{ text }</p>
          <Button variant="bt-primary-inverted" size="sm">Learn More</Button>
        </div>
        <img src={close} onClick={() => dispatch(closeBanner())}/>
      </div>
    );
  }
}

Banner.propTypes = {
  text: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
}

const mapStateToProps = state => {
  const { banner } = state.banner;
  return {
    visible: banner,
  }
}

export default connect(mapStateToProps)(Banner);