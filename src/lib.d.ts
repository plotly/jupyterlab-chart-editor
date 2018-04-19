// Type definitions for react-plotly.js 1.2.0
// Project: https://github.com/plotly/react-plotly.js
// Definitions by: Grant Nestor <https://github.com/gnestor>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.6

declare module 'react-plotly.js/factory' {
  function createPlotComponent(Plotly: any): any;

  export = createPlotComponent;
}

declare module 'react-chart-editor' {
  import * as React from 'react';

  // export interface PlotlyEditorProps {
  // 	graphDiv: HTMLElement;
  // 	onUpdate: Function;
  // 	revision: any;
  // 	dataSources: any;
  // 	dataSourceOptions: any;
  // 	plotly: Plotly;
  // }

  export default class PlotlyEditor extends React.Component<any, any> {}
}
