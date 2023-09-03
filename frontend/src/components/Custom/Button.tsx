import { Button as BootstrapButton, ButtonProps as BootstrapProps } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Button({
	className,
	size,
	variant,
	children,
	href,
	...props
}: Props & Omit<BootstrapProps, 'href'>) {
	const bootstrapProps: BootstrapProps = {
		bsPrefix: 'bt-btn',
		className: className,
		size: size,
		variant: variant ?? 'primary',
		...props
	};

	if (typeof href === 'object') {
		return (
			<BootstrapButton {...bootstrapProps} as={Link} to={href.as_link}>
				{children}
			</BootstrapButton>
		);
	} else {
		return (
			<BootstrapButton {...bootstrapProps} href={href}>
				{children}
			</BootstrapButton>
		);
	}
}

export interface Props {
	className?: string;
	variant?: 'primary' | 'inverted';
	size?: 'sm';
	href?: string | { as_link: string };
}
