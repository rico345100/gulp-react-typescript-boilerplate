import * as React from 'react';
import './Helloworld.scss';

interface IProps {
	text: string;
}

class Helloworld extends React.Component<IProps, {}> {
	public render():JSX.Element {
		const { text } = this.props;
		
		return (
			<h1>Hello, {text}!</h1>
		);
	}
}

export default Helloworld;