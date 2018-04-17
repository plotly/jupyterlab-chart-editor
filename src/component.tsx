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
}

export type Data = any[];

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
    const data = props.state ? props.state.data : [];
    const layout = props.state ? props.state.layout : {};
    const frames = props.state && props.state.frames ? props.state.frames : [];
    let dataSources: DataSource = {};
    let dataSourceOptions: DataSourceOption[] = [];
    let header: string[] = [];
    if (props.model) {
      const columnCount: number = props.model.columnCount('body');
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        header = header.concat(
          props.model.data('column-header', 0, columnIndex)
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
    this.state = {
      data,
      layout,
      frames,
      dataSources,
      dataSourceOptions,
      header
    };
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
      data.forEach((dataset: IGraphDivData) => {
        if (dataset.xsrc) dataset.x = getRows(dataset.xsrc);
        if (dataset.ysrc) dataset.y = getRows(dataset.ysrc);
      });
      this.setState(() => ({
        dataSources,
        data
      }));
    }
    this.props.handleUpdate({ data, layout });
  };

  handleResize = () => {
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
