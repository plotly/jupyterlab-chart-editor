// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import Editor from './component';

import 'react-plotly.js-editor/lib/react-plotly.js-editor.css';

import '../style/index.css';

namespace Private {
  
  declare function require(moduleName: string): string;
  
  /**
   * Is plotly.js being loaded?.
   */
  export
  let loadingPlotly = false;
  
  /**
   * Load plotly.js browser script.
   */
  export
  function loadPlotly(): void {
    loadingPlotly = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = require('raw-loader!plotly.js/dist/plotly.min.js');
    document.head.appendChild(script);
  }
  
}

/**
 * The CSS class to add to the Plotly Widget.
 */
const CSS_CLASS = 'jp-RenderedPlotlyEditor';

/**
 * The CSS class for a Plotly icon.
 */
const CSS_ICON_CLASS = 'jp-MaterialIcon jp-PlotlyIcon';

/**
 * The MIME type for Plotly.
 * The version of this follows the major version of Plotly.
 */
export const MIME_TYPE = 'application/vnd.plotly-editor.v1+json';


export class RenderedPlotlyEditor extends Widget implements IRenderMime.IRenderer {
	/**
	 * Create a new widget for rendering Plotly.
	 */
	constructor(options: IRenderMime.IRendererOptions) {
		super();
		this.addClass(CSS_CLASS);
		this._mimeType = options.mimeType;
		if (!Private.loadingPlotly) Private.loadPlotly();
	}

	/**
	 * Render Plotly into this widget's node.
	 */
	renderModel(model: IRenderMime.IMimeModel): Promise<void> {
		const data = model.data[this._mimeType] as any;
		return new Promise<void>((resolve, reject) => {
			ReactDOM.render(<Editor data={data} plotly={Plotly} width={this.node.offsetWidth} height={this.node.offsetHeight} />, this.node, () => {
				resolve(undefined);
			});
		});
	}

	/**
	 * A message handler invoked on a `'resize'` message.
	 */
	protected onResize(msg: Widget.ResizeMessage): void {
		this.update();
	}

	private _mimeType: string;
}

/**
 * A mime renderer factory for Plotly data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
	safe: true,
	mimeTypes: [MIME_TYPE],
	createRenderer: options => new RenderedPlotlyEditor(options)
};

const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
	{
		id: 'jupyterlab-chart-editor:factory',
		rendererFactory,
		rank: 0,
		dataType: 'json',
		fileTypes: [
			{
				name: 'plotly',
				mimeTypes: [MIME_TYPE],
				extensions: ['.plotly', '.plotly.json'],
				iconClass: CSS_ICON_CLASS
			}
		],
		documentWidgetFactoryOptions: {
			name: 'Plotly Editor',
			primaryFileType: 'plotly',
			fileTypes: ['csv', 'json', 'plotly']
		}
	}
];

export default extensions;
