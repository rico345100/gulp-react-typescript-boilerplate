import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface IProps {
	text: string;
}

class MyComponent extends React.Component<IProps, {}> {
	public render():JSX.Element {
		const { text } = this.props;
		
		return (
			<h1>Hello, {text}!</h1>
		);
	}
}

ReactDOM.render(<MyComponent text="react-gulp-typescript-boilerplate" />, document.getElementById('entry'));