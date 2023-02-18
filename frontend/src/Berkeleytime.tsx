import { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Routes from './Routes';

import { openBanner, enterMobile, exitMobile, openLandingModal } from './redux/common/actions';
import useDimensions from 'react-cool-dimensions';
import easterEgg from 'utils/easterEgg';

const Berkeleytime = () => {
	const dispatch = useDispatch();
	const { observe } = useDimensions({
		updateOnBreakpointChange: true,
		breakpoints: { mobile: 0, desktop: 768 },
		onResize: ({ currentBreakpoint }) => {
			if (currentBreakpoint === 'mobile') {
				dispatch(enterMobile());
			} else {
				dispatch(exitMobile());
			}
		}
	});

	useEffect(() => {
		const bannerType = 'sp23recruitment3'; // should match value in ./redux/common/reducer.ts
		if (localStorage.getItem('bt-hide-banner') !== bannerType) {
			dispatch(openBanner());
		}

		const modalType = 'sp22scheduler'; // should match value in ./redux/common/reducer.ts
		if (localStorage.getItem('bt-hide-landing-modal') !== modalType) {
			dispatch(openLandingModal());
		}

		easterEgg();

		const key = 'bt-spring-2021-catalog';
		if (localStorage.getItem(key) === null) {
			localStorage.setItem(key, key);
		}
	}, [dispatch]);

	return (
		<div ref={observe} className="app">
			<Routes />
		</div>
	);
};

export default memo(Berkeleytime);
