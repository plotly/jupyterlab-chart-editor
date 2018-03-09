// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import * as Plotly from 'plotly.js';

import * as dl from 'datalib';

import { JSONArray, JSONObject, JSONValue } from '@phosphor/coreutils';

import Editor from './component';

import '../style/index.css';

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

export class RenderedPlotlyEditor extends Widget
  implements IRenderMime.IRenderer {
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
    return new Promise<void>((resolve, reject) => {
      const data = model.data[this._mimeType] as string;
      if (!data) {
        reject(undefined);
      }
      let json: JSONValue;
      if (typeof data === 'string') {
        // If data is from document, parse JSON
        try {
          json = JSON.parse(data);
        } catch (error) {
          const lines = data.split('\n');
          const delimiter = lines[0].match(/.+(\t|,)/)[1];
          const rows = dl.read(data, {
            type: 'dsv',
            delimiter,
            parse: 'auto'
          }) as JSONObject[];
          json = rows.reduce((result: { [key: string]: JSONArray }, row) => {
            Object.entries(row).forEach(([key, value]) => {
              result[key] = (result[key] || []).concat(value);
            });
            return result;
          }, {});
        }
      } else {
        // If data is from notebook output
        json = data;
      }
      ReactDOM.render(
        <Editor
          data={json}
          plotly={Plotly}
          width={this.node.offsetWidth}
          height={this.node.offsetHeight}
        />,
        this.node,
        () => {
          resolve(undefined);
        }
      );
    });
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
    dataType: 'string',
    fileTypes: [
      {
        name: 'plotlyEditor',
        mimeTypes: [MIME_TYPE],
        extensions: ['.plotly', '.plotly.json'],
        iconClass: CSS_ICON_CLASS
      },
      {
        name: 'tsv',
        mimeTypes: ['text/csv'],
        extensions: ['.tsv']
      },
      {
        name: 'txt',
        mimeTypes: ['text/plain'],
        extensions: ['.txt']
      }
    ],
    documentWidgetFactoryOptions: {
      name: 'Plotly Editor',
      primaryFileType: 'plotlyEditor',
      fileTypes: ['json', 'plotlyEditor', 'csv', 'tsv', 'txt']
    }
  }
];

namespace Private {
  declare function require(moduleName: string): string;

  /**
   * Is plotly.js being loaded?.
   */
  export let loadingPlotly = false;

  /**
   * Load plotly.js browser script.
   */
  export function loadPlotly(): void {
    loadingPlotly = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = require('raw-loader!plotly.js/dist/plotly.min.js');
    document.head.appendChild(script);
  }
}

export default extensions;
