import * as React from 'react';

import PlotlyEditor from 'react-chart-editor';

import createPlotComponent = require('react-plotly.js/factory');

import 'react-chart-editor/lib/react-chart-editor.css';

let Plot: any;

export interface IGraphDiv {
  data?: Object[];
  layout?: Object;
}

export interface IProps {
  data: Object;
  metadata?: IState;
  handleUpdate?: (state: IState) => void;
  plotly: any;
  width?: number;
  height?: number;
}

export interface IState {
  editing?: boolean;
  graphDiv: IGraphDiv;
  editorRevision: number;
  plotRevision: number;
}

export default class ChartEditor extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    Plot = createPlotComponent(props.plotly);
    const initialState = {
      editing: true,
      graphDiv: {
        data: [],
        layout: {}
      },
      editorRevision: 0,
      plotRevision: 0
    } as IState;
    this.state = props.metadata ? props.metadata : initialState;
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.metadata && nextProps.metadata !== this.props.metadata) {
      const { graphDiv } = nextProps.metadata;
      this.setState(() => {
        graphDiv;
      });
    }
  }

  handlePlotUpdate = (graphDiv: any) => {
    this.setState(({ editorRevision: x }: { editorRevision: number }) => ({
      editorRevision: x + 1,
      graphDiv
    }));
    const { data, layout } = graphDiv;
    this.props.handleUpdate({
      ...this.state,
      graphDiv: { data, layout }
    });
  };

  handleEditorUpdate = () => {
    this.setState(({ plotRevision: x }: { plotRevision: number }) => ({
      plotRevision: x + 1
    }));
  };

  handleToggle = () => {
    this.setState(
      ({ editing }) => ({
        editing: !editing
      }),
      () => {
        window.setTimeout(() => {
          this.handleResize();
        }, 500);
      }
    );
  };

  handleResize = () => {
    this.props.plotly.Plots.resize(this.state.graphDiv);
  };

  render() {
    const { data, plotly } = this.props;
    const dataSourceOptions = Object.keys(data).map(name => ({
      value: name,
      label: name
    }));
    return (
      <div className="container">
        <PlotlyEditor
          className={
            this.state.editing ? 'plotly-editor toggled' : 'plotly-editor'
          }
          config={{ editable: true }}
          graphDiv={this.state.graphDiv}
          onUpdate={this.handleEditorUpdate}
          revision={this.state.editorRevision}
          dataSources={data}
          dataSourceOptions={dataSourceOptions}
          plotly={plotly}
        />
        <div className="toggle" onClick={this.handleToggle}>
          <div className={this.state.editing ? 'button toggled' : 'button'} />
        </div>
        <Plot
          className="plot"
          config={{ editable: true }}
          data={this.state.graphDiv.data}
          layout={this.state.graphDiv.layout}
          onUpdate={this.handlePlotUpdate}
          onInitialized={this.handlePlotUpdate}
          revision={this.state.plotRevision}
        />
      </div>
    );
  }
}
