import * as React from 'react';

import PlotlyEditor from 'react-chart-editor';

import { DSVModel } from '@jupyterlab/csvviewer';

import 'react-chart-editor/lib/react-chart-editor.css';

export interface IGraphDivData {
  mode: string;
  type: string;
  uid: string;
  x: any[];
  xsrc: string;
  y: any[];
  ysrc: string;
  [key: string]: any;
}

export type Data = IGraphDivData[];

export type Layout = {};

export type Frames = any[];

export type DataSource = { [key: string]: any };

export interface DataSourceOption {
  value: string;
  label: string;
}

export interface PlotlyEditorState {
  data: Data;
  layout: Layout;
  frames?: Frames;
}

export interface ChartEditorProps {
  state?: PlotlyEditorState;
  model?: DSVModel;
  handleUpdate?: (state: PlotlyEditorState) => void;
  plotly: any;
}

export interface ChartEditorState {
  data: Data;
  layout: Layout;
  frames: Frames;
  dataSources: DataSource;
  dataSourceOptions: DataSourceOption[];
  header: string[];
}

export default class ChartEditor extends React.Component<
  ChartEditorProps,
  ChartEditorState
> {
  constructor(props: ChartEditorProps) {
    super(props);
    // TODO: Remove after upgrading to React 16.3
    this.state = ChartEditor.getDerivedStateFromProps(props);
  }

  static getDerivedStateFromProps(
    nextProps: ChartEditorProps,
    prevState?: ChartEditorState
  ) {
    const data = nextProps.state ? nextProps.state.data : [];
    const layout = nextProps.state ? nextProps.state.layout : {};
    const frames =
      nextProps.state && nextProps.state.frames ? nextProps.state.frames : [];
    let dataSources: DataSource = {};
    let dataSourceOptions: DataSourceOption[] = [];
    let header: string[] = [];
    if (nextProps.model) {
      const columnCount: number = nextProps.model.columnCount('body');
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        header = header.concat(
          nextProps.model.data('column-header', 0, columnIndex)
        );
      }
      dataSources = header.reduce((result: { [key: string]: any[] }, item) => {
        result[item] = [];
        return result;
      }, {});
      dataSourceOptions = header.map(name => ({
        value: name,
        label: name
      }));
    }
    return {
      data,
      layout,
      frames,
      dataSources,
      dataSourceOptions,
      header
    };
  }

  // TODO: Remove after upgrading to React 16.3
  componentWillReceiveProps(nextProps: ChartEditorProps) {
    this.setState((prevState: ChartEditorState) =>
      ChartEditor.getDerivedStateFromProps(nextProps, prevState)
    );
  }

  handleUpdate = (data: Data, layout: Layout, frames: Frames) => {
    const { model } = this.props;
    if (model) {
      const { dataSources, header } = this.state;
      const rowCount = model.rowCount('body');
      const getRows = (column: string) => {
        if (dataSources[column].length > 0) return dataSources[column];
        const columnIndex = header.indexOf(column);
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
          dataSources[column].push(model.data('body', rowIndex, columnIndex));
        }
        return dataSources[column];
      };
      for (let dataset of data) {
        for (let property in dataset) {
          if (property.endsWith('src'))
            // dataset.x = getRows(dataset.xsrc);
            dataset[property.substring(0, property.length - 3)] = getRows(
              dataset[property]
            );
        }
      }
      this.setState(() => ({
        dataSources,
        data,
        layout,
        frames
      }));
    } else {
      this.setState(() => ({
        data,
        layout,
        frames
      }));
    }
    this.props.handleUpdate({ data, layout });
  };

  handleResize = () => {
    if (this.ref.state.graphDiv)
      this.props.plotly.Plots.resize(this.ref.state.graphDiv);
  };

  render() {
    const { plotly } = this.props;
    const { data, layout, frames, dataSources, dataSourceOptions } = this.state;
    const config = { editable: true };
    return (
      <div className="container">
        <PlotlyEditor
          ref={ref => {
            this.ref = ref;
          }}
          className="plotly-editor"
          data={data}
          layout={layout}
          config={config}
          frames={frames}
          dataSources={dataSources}
          dataSourceOptions={dataSourceOptions}
          plotly={plotly}
          onUpdate={this.handleUpdate}
          useResizeHandler
          debug
          advancedTraceTypeSelector
        />
      </div>
    );
  }

  ref: PlotlyEditor;
}
