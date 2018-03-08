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

declare module 'pandas-js' {

	import { JSONValue } from '@phosphor/coreutils';
	
	export class DataFrame {
		constructor(data: JSONValue);
		to_json: (orient?: 'records' | 'index' | 'split' | 'values') => JSONValue;
	}
	
}

declare module 'tableschema' {

	import { JSONValue } from '@phosphor/coreutils';

	interface Table {
		load: (data: string) => JSONValue;
	}

}

declare module 'datalib' {

	import { JSONArray, JSONObject, JSONValue } from '@phosphor/coreutils';

	export type Primitive = 'boolean' | 'integer' | 'number' | 'date' | 'string';

	export interface Format {
		type: 'json' | 'csv' | 'tsv' | 'dsv' | 'topojson' | 'treejson';
		delimiter?: string;
		property?: string;
		parse?: 'auto' | { [key: string]: Primitive };
	}

	export function read(data: string | Buffer, format?: Format): string | JSONObject[];

}
