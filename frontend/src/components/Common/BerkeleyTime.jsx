import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import ReactGA from 'react-ga';

import Banner from './Banner';
import Navigation from './Navigation';
import Footer from './Footer';
import routes from '../../routes/routes';

import { openBanner } from '../../redux/actions';

const gaTrackingID = 'UA-35316609-1';
ReactGA.initialize(gaTrackingID);

const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
  return null;
};

class BerkeleyTime extends PureComponent {
  constructor(props) {
    super(props);
    this.props.dispatch(openBanner());
  }

  render() {
    const bannerText = 'Wow, banner text!';

    return (
      <div className="app-container">
        <Banner text={bannerText} />
        <Navigation />
        <Route path="/" component={logPageView} />
        <Switch>
          {
            routes.map(route => {
              if (route.redirect) {
                return (
                  <Redirect exact={route.exact} from={route.path} to={route.to} key={route.name} />
                );
              } else {
                return (
                  <Route exact={route.exact} path={route.path} component={route.component} key={route.name} />
                );
              }
            })
          }
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default connect()(BerkeleyTime);
