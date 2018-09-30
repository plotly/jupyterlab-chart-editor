import * as React from 'react';

import PlotlyEditor from 'react-chart-editor';

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

export interface PlotlyEditorState {
  data: Data;
  layout: Layout;
  frames?: Frames;
}

export interface ChartEditorProps {
  state?: PlotlyEditorState;
  handleUpdate?: (state: PlotlyEditorState) => void;
  plotly: any;
}

export interface ChartEditorState {
  data: Data;
  layout: Layout;
  frames: Frames;
}

export default class ChartEditor extends React.Component<
  ChartEditorProps,
  ChartEditorState
> {
  constructor(props: ChartEditorProps) {
    super(props);
    const initialState: ChartEditorState = {
      data: props.state ? props.state.data || [] : [],
      layout: props.state ? props.state.layout || {} : {},
      frames: props.state ? props.state.frames || [] : []
    };
    // TODO: Remove after upgrading to React 16.3
    this.state = initialState;
  }

  static getDerivedStateFromProps(
    nextProps: ChartEditorProps,
    prevState?: ChartEditorState
  ) {
    return prevState;
  }

  handleUpdate = (data: Data, layout: Layout, frames: Frames) => {
    this.setState(() => ({
      data,
      layout,
      frames
    }));
    this.props.handleUpdate({ data, layout, frames });
  };

  handleResize = () => {
    if (this.ref.state.graphDiv instanceof HTMLElement)
      this.props.plotly.Plots.resize(this.ref.state.graphDiv);
  };

  componentDidMount() {
    let that = this;
    setTimeout(function() {
      that.ref.state.graphDiv.on('plotly_relayout', function() {
        that.handleUpdate(
          that.state.data,
          that.state.layout,
          that.state.frames
        );
      });

      that.ref.state.graphDiv.on('plotly_restyle', function() {
        that.handleUpdate(
          that.state.data,
          that.state.layout,
          that.state.frames
        );
      });
    });
  }

  render() {
    const { plotly } = this.props;
    const { data, layout, frames } = this.state;
    const config = { editable: true };
    return (
      <div className="container">
        <PlotlyEditor
          ref={(ref: PlotlyEditor) => {
            this.ref = ref;
          }}
          className="plotly-editor"
          data={data}
          layout={layout}
          config={config}
          frames={frames}
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
