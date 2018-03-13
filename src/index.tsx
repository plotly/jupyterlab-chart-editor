// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import * as Plotly from 'plotly.js';

import * as dl from 'datalib';

import {
  ReadonlyJSONValue,
  ReadonlyJSONArray,
  ReadonlyJSONObject
} from '@phosphor/coreutils';

import ChartEditor, { IState } from './component';

import '../style/index.css';

/**
 * The CSS class to add to the Plotly Editor Widget.
 */
const CSS_CLASS = 'jp-RenderedPlotlyEditor';

/**
 * The CSS class for a Plotly Editor icon.
 */
const CSS_ICON_CLASS = 'jp-MaterialIcon jp-PlotlyIcon';

/**
 * The MIME type for Plotly Editor.
 */
export const MIME_TYPE = 'application/vnd.plotly-editor.v1+json';

/**
 * Type interface for RenderedPlotlyEditor metadata.
 */
export interface IMetadata extends IState {
  [key: string]: any;
}

export class RenderedPlotlyEditor extends Widget
  implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering Plotly Editor.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this.addClass(CSS_CLASS);
    this._mimeType = options.mimeType;
    if (!Private.loadingPlotly) Private.loadPlotly();
  }

  /**
   * Render Plotly Editor into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const data = model.data[this._mimeType] as string;
      const metadata = model.metadata[this._mimeType] as IMetadata;
      if (!data) {
        reject(undefined);
      }
      let json: ReadonlyJSONValue;
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
          }) as ReadonlyJSONObject[];
          json = rows.reduce(
            (result: { [key: string]: ReadonlyJSONArray }, row) => {
              Object.entries(row).forEach(([key, value]) => {
                result[key] = (result[key] || []).concat(value);
              });
              return result;
            },
            {}
          );
        }
      } else {
        // If data is from notebook output
        json = data;
      }
      const handleUpdate = (state: IMetadata) => {
        const metadata = { [this._mimeType]: state };
        model.setData({ metadata });
      };
      this._ref = ReactDOM.render(
        <ChartEditor
          data={json}
          metadata={metadata}
          plotly={Plotly}
          handleUpdate={handleUpdate}
          width={this.node.offsetWidth}
          height={this.node.offsetHeight}
        />,
        this.node,
        () => {
          resolve(undefined);
        }
      ) as ChartEditor;
    });
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: Widget.ResizeMessage): void {
    this.update();
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(): void {
    if (this.isVisible && this._ref) {
      this._ref.handleResize();
    }
  }

  private _mimeType: string;
  private _ref: ChartEditor;
}

/**
 * A mime renderer factory for Plotly Editor.
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
