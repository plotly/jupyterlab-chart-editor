declare module 'plotly.js/dist/plotly' {
  export * from 'plotly.js';
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
