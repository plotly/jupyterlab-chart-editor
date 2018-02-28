import * as React from 'react';

import PlotlyEditor from 'react-plotly.js-editor';

import createPlotComponent = require('react-plotly.js/factory');

import 'react-plotly.js-editor/lib/react-plotly.js-editor.css';

let Plot: any;


/**
 * The properties for the JSON tree component.
 */
export interface IProps {
	data: Object;
	plotly: any;
	width?: number;
	height?: number;
}

/**
 * The state of the JSON tree component.
 */
export interface IState {
	graphDiv: {
		data?: Object[];
		layout?: Object;
	};
	editorRevision: number;
	plotRevision: number;
}

/**
 * A component that renders JSON data as a collapsible tree.
 */
export default class Editor extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		Plot = createPlotComponent(props.plotly);
		this.state = {
			graphDiv: {},
			editorRevision: 0,
			plotRevision: 0
		};
	}

	handlePlotUpdate = (graphDiv: any) => {
		this.setState(({ editorRevision: x }: { editorRevision: number }) => ({
			editorRevision: x + 1,
			graphDiv
		}));
	};

	handleEditorUpdate = () => {
		this.setState(({ plotRevision: x }: { plotRevision: number }) => ({
			plotRevision: x + 1
		}));
	};

	render() {
		const { data, plotly } = this.props;
		const dataSourceOptions = Object.keys(data).map(name => ({
		  value: name,
		  label: name,
		}));
		return (
			<div className="container">
				<PlotlyEditor
					config={{editable: true}}
					graphDiv={this.state.graphDiv}
					onUpdate={this.handleEditorUpdate}
					revision={this.state.editorRevision}
					dataSources={data}
					dataSourceOptions={dataSourceOptions}
					plotly={plotly}
					style={{ width: '100%', height: '100%' }}
				/>
				<div className="plot">
					<Plot
						debug
						useResizeHandler
						config={{editable: true}}
						data={this.state.graphDiv.data}
						layout={this.state.graphDiv.layout}
						onUpdate={this.handlePlotUpdate}
						onInitialized={this.handlePlotUpdate}
						revision={this.state.plotRevision}
						style={{ width: '100%', height: '100%' }}
					/>
				</div>
			</div>
		);
	}
}
